import { spawn } from "child_process";
import { getRepository, MoreThan } from "typeorm";
import { Treatment } from "../entity/Treatment";
import { TreatmentItem } from "../entity/TreatmentItem";
import { TreatmentSchedule } from "../entity/TreatmentSchedule";
import { TreatmentSite } from "../entity/TreatmentSite";
import Recorder from "../recorderController";
import { SocketConnection } from "../socket.io";
import TreatmentSiteController from "../treatmentSiteController";

export default class StopController {
  private static instance: StopController;
  private recoverTimer: Map<number, NodeJS.Timeout>;
  private constructor() {
    this.recoverTimer = new Map<number, NodeJS.Timeout>();
  }
  public static async getInstance() {
    if (!StopController.instance) {
      StopController.instance = new StopController();
      await StopController.instance.updateData();
    }
    return StopController.instance;
  }
  private async updateData() {
    const stopTreatments = await getRepository(Treatment).find({
      where: {
        updatedAt: MoreThan(new Date(new Date().toLocaleDateString())),
        stoppingStatus: true,
      },
      relations: ["patient", "treatmentSchedules"],
    });
    stopTreatments.forEach((t) => {
      if (t.treatmentSchedules[0].postponeTime > 0) {
        this.stopTreatment(t.id, t.treatmentSchedules[0].postponeTime);
      }
    });
  }
  public async stopTreatment(id: number, time: number = 0) {
    let treatment = await getRepository(Treatment).findOne(id, {
      relations: ["treatmentSchedules", "treatmentSchedules.treatmentItems"],
    });
    treatment.treatmentSchedules
      .filter((schedule) => schedule.status !== "end")
      .forEach((schedule) =>
        Recorder.getInstance().addEndTreatment(
          id,
          schedule.treatmentItems.map((item) => item.treatmentCode)
        )
      );
    treatment.stoppingStatus = true;
    await getRepository(Treatment).save(treatment);
    if (time > 0) {
      this.recoverTimer.set(
        id,
        setTimeout(async () => {
          await this.recoverTreatment(id);
        }, time)
      );
    }
  }
  public async recoverTreatment(
    id: number,
    section?: "morning" | "afternoon" | "night"
  ) {
    clearTimeout(this.recoverTimer.get(id));
    const oldTreatment = await getRepository(Treatment).findOne(id, {
      relations: [
        "patient",
        "treatmentSchedules",
        "treatmentSchedules.treatmentItems",
      ],
    });
    if (!section) {
      section = oldTreatment.section;
    }

    let treatment = new Treatment();
    treatment.section = section;
    treatment.patient = oldTreatment.patient;
    treatment.bind = oldTreatment.bind;
    treatment.sort = oldTreatment.sort;
    treatment.follow = oldTreatment.follow;
    const newTreatment = await getRepository(Treatment).save(treatment);

    const remindSchedules = oldTreatment.treatmentSchedules.filter(
      (schedule) => schedule.status !== "end"
    );
    let treatmentCodes: string[] = [String(treatment.id)];
    remindSchedules.forEach((rs) => {
      rs.treatmentItems.forEach((site) => {
        treatmentCodes.push(site.treatmentCode);
      });
    });
    this.schedule(
      newTreatment.id,
      treatmentCodes,
      oldTreatment.bind,
      oldTreatment.sort,
      oldTreatment.follow
    );

    await getRepository(Treatment).update(id, { stoppingStatus: false });
  }

  private schedule(
    id: number,
    treatmentCodes: string[],
    bind: string,
    sort: string,
    follow: string
  ) {
    let isErr = false;
    let result = "";
    const child_process = spawn("python", [
      "./schedule/test3.py",
      JSON.stringify(treatmentCodes),
      bind,
      sort,
      JSON.stringify(Recorder.getInstance().getEndTreatment()),
      follow,
    ]);

    child_process.stderr.on("data", function (data: { toString: () => any }) {
      isErr = true;
      console.log(data.toString());
      return;
    });

    child_process.stdout.on("data", function (data: string) {
      result += data;
    });

    child_process.on("exit", async () => {
      if (isErr) {
        return;
      }
      console.log(result);
      const scheduleInfos = JSON.parse(result) as string[][];
      for (const treatmentCodes of scheduleInfos) {
        const follow = treatmentCodes.pop();
        const siteName = treatmentCodes.pop();
        let newSchedule = new TreatmentSchedule();
        newSchedule.treatment = await getRepository(Treatment).findOne(id);
        newSchedule.treatmentSite = await getRepository(TreatmentSite).findOne({
          name: siteName,
        });
        newSchedule.follow = Boolean(follow);
        newSchedule.treatmentItems = [];
        for (const treatmentCode of treatmentCodes) {
          const item = await getRepository(TreatmentItem).findOne({
            treatmentCode,
          });
          if (item) {
            newSchedule.treatmentItems.push(item);
          }
        }

        newSchedule.remainTime = newSchedule.treatmentItems.sort(
          (l, r) => r.duration - l.duration
        )[0].duration;

        await getRepository(TreatmentSchedule).save(newSchedule);
      }

      await TreatmentSiteController.setAllNewSchedules();
      SocketConnection.getSocket().emit("update");
      return;
    });
  }
}
