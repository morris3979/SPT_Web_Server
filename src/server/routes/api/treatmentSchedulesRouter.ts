import { Router } from "express";
import { getRepository, In, MoreThan } from "typeorm";
import { TreatmentSchedule } from "../../entity/TreatmentSchedule";
import { Treatment } from "../../entity/Treatment";
import { TreatmentSeat } from "../../entity/TreatmentSeat";
import TreatmentSiteController from "../../treatmentSiteController";
import StopController from "../../stopController";
import { SocketConnection } from "../../socket.io";

const treatmentSchedulesRouter = Router({});

treatmentSchedulesRouter.get("/", async (req, res) => {
  let status: string[];

  if (typeof req.query.status === "string") {
    status = [req.query.status];
  } else if (
    req.query.status instanceof Array &&
    typeof req.query.status[0] === "string"
  ) {
    status = req.query.status as string[];
  }

  const schedules = await getRepository(TreatmentSchedule).find({
    where: {
      createdAt: MoreThan(new Date(new Date().toLocaleDateString())),
      status: status ? In(status) : undefined,
    },
    relations: ["treatment", "treatment.patient", "treatmentSite"],
    order: {
      createdAt: "ASC",
    },
  });

  let startId = 0;
  let treatments = await getRepository(Treatment).findOne({
    where: {
      createdAt: MoreThan(new Date(new Date().toLocaleDateString())),
    },
    order: {
      createdAt: "ASC",
    },
  });
  if (treatments) {
    startId = treatments.id - 1;
  }

  res.json(
    schedules
      .map((schedule) => ({
        ...schedule,
        treatment: {
          ...schedule.treatment,
          id: schedule.treatment.id - startId,
        },
      }))
      .sort((l, r) => l.treatment.id - r.treatment.id)
  );
  // TODO: type define to client
});
treatmentSchedulesRouter.patch("/:id/status", async (req, res) => {
  const id = req.params.id;
  const status: "stop" | "resort" = req.body.status;
  const stopTime: number = req.body.stopTime;

  if (status !== "stop" && status !== "resort") {
    res.sendStatus(400);
    return;
  }
  let treatmentSchedule = await getRepository(TreatmentSchedule).findOne(id, {
    relations: ["treatment", "treatment.treatmentSchedules"],
  });

  if (!treatmentSchedule || treatmentSchedule.status === "stop") {
    res.sendStatus(404);
    return;
  }

  if (stopTime && status === "stop") {
    treatmentSchedule.postponeTime = stopTime;
  }

  await getRepository(TreatmentSchedule).save(treatmentSchedule);

  await getRepository(TreatmentSchedule).update(
    treatmentSchedule.treatment.treatmentSchedules
      .filter((schedule) => schedule.status !== "end")
      .map((schedule) => schedule.id),
    { status: "stop" }
  );

  const seat = await getRepository(TreatmentSeat).findOne({
    where: { currentTreatmentSchedule: { id: treatmentSchedule.id } },
    relations: ["treatmentSite"],
  });

  if (seat) {
    await (await TreatmentSiteController.getMapInstance())
      .get(seat.treatmentSite.id)
      .getSeat(seat.id)
      .stop();
  }

  await (
    await StopController.getInstance()
  ).stopTreatment(
    Number(treatmentSchedule.treatment.id),
    treatmentSchedule.postponeTime
  );

  if (status === "resort") {
    (await StopController.getInstance()).recoverTreatment(
      treatmentSchedule.treatment.id
    );
  }

  res.sendStatus(200);

  return;
});

treatmentSchedulesRouter.patch("/:id/skip", async (req, res) => {
  const id = req.params.id;
  const skip: boolean = req.body.skip;

  let treatmentSchedule = await getRepository(TreatmentSchedule).findOne(id);

  if (!treatmentSchedule) {
    res.sendStatus(404);
    return;
  }

  await getRepository(TreatmentSchedule).update(id, {
    skip: skip,
  });

  await SocketConnection.getSocket().emit("update");

  res.sendStatus(200);

  return;
});
export default treatmentSchedulesRouter;
