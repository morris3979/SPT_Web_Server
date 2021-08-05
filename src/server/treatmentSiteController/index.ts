import { createQueryBuilder, getRepository, MoreThan } from "typeorm";
import { TreatmentSchedule } from "../entity/TreatmentSchedule";
import { TreatmentSite } from "../entity/TreatmentSite";
import TreatmentSeatController from "./treatmentSeatController";

export default class TreatmentSiteController {
  private static mapInstance: Map<number, TreatmentSiteController>;

  public static async getMapInstance(): Promise<
    Map<number, TreatmentSiteController>
  > {
    if (!TreatmentSiteController.mapInstance) {
      TreatmentSiteController.mapInstance = new Map<
        number,
        TreatmentSiteController
      >();
      const treatmentSiteRepo = getRepository(TreatmentSite);
      for (const site of await treatmentSiteRepo.find({
        relations: ["treatmentSeats", "treatmentSeats.treatmentItems"],
      })) {
        TreatmentSiteController.mapInstance.set(
          site.id,
          new TreatmentSiteController(site)
        );
      }
    }
    return TreatmentSiteController.mapInstance;
  }

  public static async setAllNewSchedules() {
    for (const instance of Array.from(
      (await TreatmentSiteController.getMapInstance()).values()
    )) {
      await instance.setNewSchedules();
    }
  }

  constructor(site: TreatmentSite) {
    this._siteId = site.id;
    this._seats = new Map<number, TreatmentSeatController>();
    for (const seat of site.treatmentSeats) {
      this._seats.set(seat.id, new TreatmentSeatController(this._siteId, seat));
    }
  }

  private _siteId: number;
  private _seats: Map<number, TreatmentSeatController>;

  public async setNewSchedules() {
    const treatmentSchedules = (
      await getRepository(TreatmentSchedule).find({
        where: {
          treatmentSite: {
            id: this._siteId,
          },
          createdAt: MoreThan(new Date(new Date().toLocaleDateString())),
          status: "inQueue",
        },
        relations: [
          "treatmentItems",
          "treatment",
          "treatment.treatmentSchedules",
        ],
      })
    ).filter((schedule) => {
      const canRunSchedules = schedule.treatment.treatmentSchedules.filter(
        (schedule) => schedule.status !== "end" && schedule.status !== "stop"
      );
      if (canRunSchedules.length === 0) {
        return false;
      }
      return canRunSchedules[0].id === schedule.id;
    });

    treatmentSchedules.sort(
      (l, r) =>
        l.treatment.updatedAt.getTime() - r.treatment.updatedAt.getTime()
    );

    scheduleLoop: for (const schedule of treatmentSchedules) {
      if (schedule.skip) {
        await getRepository(TreatmentSchedule).update(schedule.id, {
          status: "end",
        });
        await this.setNewSchedules();
        return;
      }
      for (const seat of Array.from(this._seats.values())) {
        if (seat.currentScheduleId) {
          continue;
        }

        if (schedule.follow) {
          schedule.treatmentItems.shift();
        }

        if (
          schedule.treatmentItems.filter(
            (item) => !seat.treatmentItemIds.has(item.id)
          ).length === 0
        ) {
          await seat.setSchedule(schedule.id);
          continue scheduleLoop;
        }
      }
    }
  }

  public getSeat(seatId: number) {
    return this._seats.get(seatId);
  }

  public async getSeats() {
    return Array.from(this._seats.values()).map((seat) => ({
      id: seat.id,
      currentScheduleId: seat.currentScheduleId,
    }));
  }
}
