import { getRepository } from "typeorm";
import TreatmentSiteController from ".";
import { TreatmentSchedule } from "../entity/TreatmentSchedule";
import { TreatmentSeat } from "../entity/TreatmentSeat";
import Recorder from "../recorderController";
import { SocketConnection } from "../socket.io";

export default class TreatmentSeatController {
  constructor(siteId: number, seat: TreatmentSeat) {
    this._siteId = siteId;
    this.id = seat.id;
    this._treatmentItemIds = new Set<number>();

    for (const item of seat.treatmentItems) {
      this._treatmentItemIds.add(item.id);
    }

    this._treatmentButtonId = seat.buttonId;

    getRepository(TreatmentSeat)
      .findOne(this.id, { relations: ["currentTreatmentSchedule"] })
      .then((thisSeat) => {
        if (thisSeat.currentTreatmentSchedule) {
          this._duration = thisSeat.currentTreatmentSchedule.remainTime;
          this._currentScheduleId = thisSeat.currentTreatmentSchedule.id;
          switch (thisSeat.currentTreatmentSchedule.status) {
            case "treating":
              this.start();
              break;
          }
          if (
            thisSeat.currentTreatmentSchedule.createdAt <
              new Date(new Date().toLocaleDateString()) ||
            thisSeat.currentTreatmentSchedule.remainTime === 0 ||
            thisSeat.currentTreatmentSchedule.status === "stop"
          ) {
            this.end();
            return;
          }
        }
      });
  }

  public readonly id: number;
  private readonly _treatmentItemIds: Set<number>;
  private readonly _treatmentButtonId: string;
  private _currentScheduleId: number | null;
  private _duration: number;
  private _timer: NodeJS.Timeout;
  private _siteId: number;

  public get treatmentButtonId(): string {
    return this._treatmentButtonId;
  }

  public get treatmentItemIds(): Set<number> {
    return new Set(this._treatmentItemIds);
  }

  public get currentScheduleId(): null | number {
    return this._currentScheduleId;
  }

  public async setSchedule(treatmentScheduleId: number): Promise<void> {
    this._currentScheduleId = treatmentScheduleId;
    const schedule = await getRepository(TreatmentSchedule).findOne(
      treatmentScheduleId,
      {
        relations: ["treatmentItems"],
      }
    );

    schedule.status = "onSeat";
    schedule.remainTime = schedule.treatmentItems.sort(
      (l, r) => r.duration - l.duration
    )[0].duration;
    console.log(schedule.remainTime);
    await getRepository(TreatmentSchedule).save(schedule);

    const seat = await getRepository(TreatmentSeat).findOne(this.id);
    seat.currentTreatmentSchedule = schedule;
    await getRepository(TreatmentSeat).save(seat);

    this._duration = schedule.remainTime;
  }

  public async start(): Promise<void> {
    if (this._timer) {
      return;
    }

    await getRepository(TreatmentSchedule).update(this._currentScheduleId, {
      status: "treating",
    });

    this._timer = setInterval(async () => {
      if (this._duration <= 0) {
        await this.end();
      } else {
        this._duration -= 1000;
        await getRepository(TreatmentSchedule).update(this._currentScheduleId, {
          remainTime: this._duration,
        });
      }
    }, 1000);
  }

  public async pause(): Promise<void> {
    clearInterval(this._timer);
    this._timer = null;

    await getRepository(TreatmentSchedule).update(this._currentScheduleId, {
      status: "pause",
    });
  }

  public async reset(): Promise<void> {
    await this.pause();

    await this.setSchedule(this._currentScheduleId);
  }

  public async skip(): Promise<void> {
    await this.end();
  }

  public async singleClick(): Promise<void> {
    if (this._timer) {
      await this.pause();
    } else {
      await this.start();
    }
  }

  private async end(): Promise<void> {
    clearInterval(this._timer);
    this._timer = null;

    let schedule = await getRepository(TreatmentSchedule).findOne(
      this._currentScheduleId,
      { relations: ["treatment", "treatment.patient", "treatmentItems"] }
    );

    await getRepository(TreatmentSchedule).update(this._currentScheduleId, {
      status: "end",
    });

    const seat = await getRepository(TreatmentSeat).findOne(this.id);
    seat.currentTreatmentSchedule = null;
    await getRepository(TreatmentSeat).save(seat);

    this._currentScheduleId = null;

    Recorder.getInstance().addEndTreatment(
      schedule.treatment.id,
      schedule.treatmentItems.map((item) => item.treatmentCode)
    );

    await TreatmentSiteController.setAllNewSchedules();
    SocketConnection.getSocket().emit("update");
  }

  public async stop(): Promise<void> {
    clearInterval(this._timer);
    this._timer = null;

    let schedule = await getRepository(TreatmentSchedule).findOne(
      this._currentScheduleId,
      { relations: ["treatment", "treatment.patient", "treatmentItems"] }
    );

    this._currentScheduleId = undefined;

    const seat = await getRepository(TreatmentSeat).findOne(this.id);
    seat.currentTreatmentSchedule = null;
    await getRepository(TreatmentSeat).save(seat);
    console.log(seat.currentTreatmentSchedule);

    Recorder.getInstance().addEndTreatment(
      schedule.treatment.id,
      schedule.treatmentItems.map((item) => item.treatmentCode)
    );

    await TreatmentSiteController.setAllNewSchedules();
    SocketConnection.getSocket().emit("update");
  }
}
