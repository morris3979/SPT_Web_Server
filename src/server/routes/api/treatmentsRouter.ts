import { spawn } from "child_process";
import { Request, Router } from "express";
import { getRepository, MoreThan } from "typeorm";
import { Patient } from "../../entity/Patient";
import { Treatment } from "../../entity/Treatment";
import { TreatmentItem } from "../../entity/TreatmentItem";
import { TreatmentSchedule } from "../../entity/TreatmentSchedule";
import { TreatmentSite } from "../../entity/TreatmentSite";
import Recorder from "../../recorderController";
import { SocketConnection } from "../../socket.io";
import StopController from "../../stopController";
import TreatmentSiteController from "../../treatmentSiteController";

const treatmentsRouter = Router({});

// get all patient from database
//TODO: need update
treatmentsRouter.get("/", async (req, res) => {
  try {
    let treatments = (
      await getRepository(Treatment).find({
        where: {
          createdAt: MoreThan(new Date(new Date().toLocaleDateString())),
        },
        order: {
          createdAt: "ASC",
        },
        relations: [
          "treatmentSchedules",
          "treatmentSchedules.treatmentSite",
          "patient",
        ],
      })
    )
      .map((t, i) => {
        t.id = i + 1;
        if (
          t.treatmentSchedules[t.treatmentSchedules.length - 1]?.status ===
          "end"
        ) {
          t.treatmentSchedules = [];
        }
        t.treatmentSchedules = t.treatmentSchedules.filter(
          (schedule) => schedule.status != "end"
        );
        return t;
      })
      .filter(
        (t) =>
          t.treatmentSchedules.length > 0 &&
          t.treatmentSchedules[0]?.status != "stop" &&
          !t.stoppingStatus
      );
    res.json(treatments);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

//TODO: need update
treatmentsRouter.post("/", async (req: Request, res) => {
  let patient = await getRepository(Patient).findOne({
    patientId: req.body.patient.patientId,
  });

  if (!patient) {
    patient = new Patient();
    patient.patientId = req.body.patient.patientId;
    patient.medicalRecords = [];
  }

  patient.name = req.body.patient.name;
  if (req.body.patient.dateOfBirth) {
    patient.dateOfBirth = req.body.patient.dateOfBirth;
  }
  if (req.body.patient.gender) {
    patient.gender = req.body.patient.gender;
  }
  if (req.body.patient.medicalRecords) {
    if (req.body.patient.medicalRecords?.length > patient.medicalRecords) {
      patient.medicalRecords = req.body.patient.medicalRecords;
    }
  }

  if (req.body.patient.ICCardId) {
    patient.ICCardId = req.body.patient.ICCardId;
  }

  const newPatient = await getRepository(Patient).save(patient);

  let treatment = new Treatment();
  treatment.patient = newPatient;
  treatment.section = req.body.section;

  const savedTreatment = await getRepository(Treatment).save(treatment);

  res.status(200).json({ id: savedTreatment.id });
});

//TODO: need update
treatmentsRouter.get("/stopping", async (req, res) => {
  const stoppingTreatment = (
    await getRepository(Treatment).find({
      where: {
        stoppingStatus: true,
      },
      relations: ["patient", "treatmentSchedules"],
    })
  )
    .map((t) => {
      t.treatmentSchedules = t.treatmentSchedules.filter(
        (schedule) => schedule.status != "end"
      );
      return t;
    })
    .filter((t) => t.treatmentSchedules.length > 0);
  res
    .status(200)
    .json(
      stoppingTreatment.filter(
        (t) =>
          t.treatmentSchedules[0].postponeTime === 0 ||
          t.createdAt > new Date(new Date().toLocaleDateString())
      )
    );
});

treatmentsRouter.post("/:id/treatmentSchedules", async (req, res) => {
  let isErr = false;
  let result = "";
  const id = req.params.id;
  const body: {
    items: TreatmentItem[];
    bind: string[][];
    sort: string[][];
    follow: string[][];
  } = req.body;

  body.sort =
    body.items.filter(
      (item) => item.treatmentCode === "PTS1-3" || item.treatmentCode === "PTS2"
    ).length > 0
      ? [...body.sort, ["PTS2", "PTS1-1", "PTS1-2"]]
      : body.sort;

  await getRepository(Treatment).update(id, {
    bind: JSON.stringify(body.bind),
    sort: JSON.stringify(body.sort),
    follow: JSON.stringify(body.follow),
  });
  const child_process = spawn("python", [
    "./schedule/test3.py",
    JSON.stringify([
      id,
      ...body.items
        .map((item) => {
          return item.treatmentCode;
        })
        .flatMap((treatmentCode) =>
          treatmentCode === "PTS1-3" ? ["PTS1-1", "PTS1-2"] : treatmentCode
        ),
    ]),
    JSON.stringify(body.bind),
    JSON.stringify(body.sort),
    JSON.stringify(Recorder.getInstance().getEndTreatment()),
    JSON.stringify(body.follow),
  ]);

  child_process.stderr.on("data", function (data: { toString: () => any }) {
    isErr = true;
    console.log("schedule engine error: " + String(data));

    res.sendStatus(500);
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
      newSchedule.treatment = await getRepository(Treatment).findOne(
        req.params.id
      );
      newSchedule.treatmentSite = await getRepository(TreatmentSite).findOne({
        name: siteName,
      });
      newSchedule.follow = Boolean(follow);
      newSchedule.treatmentItems = [];
      for (let treatmentCode of treatmentCodes) {
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
    res.sendStatus(200);
    return;
  });
});

treatmentsRouter.patch("/:id/stopping", async (req, res) => {
  if (req.body.value) {
    res.sendStatus(403);
    return;
  }
  if (
    req.body.section != "morning" &&
    req.body.section != "afternoon" &&
    req.body.section != "night"
  ) {
    res.sendStatus(400);
    return;
  }

  await (
    await StopController.getInstance()
  ).recoverTreatment(Number(req.params.id), req.body.section);
  res.sendStatus(200);
  return;
});

export default treatmentsRouter;
