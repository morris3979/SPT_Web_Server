import { Router } from "express";
import { getRepository, MoreThan } from "typeorm";
import { Treatment } from "../../entity/Treatment";
import { TreatmentSchedule } from "../../entity/TreatmentSchedule";
import { TreatmentSeat } from "../../entity/TreatmentSeat";
import { TreatmentSite } from "../../entity/TreatmentSite";
import { SocketConnection } from "../../socket.io";
import TreatmentSiteController from "../../treatmentSiteController";
import { saveTreatmentSitesToJson } from "../../utils";

const treatmentSitesRouter = Router({});

treatmentSitesRouter.get("/", async (req, res) => {
  try {
    res.json(
      await getRepository(TreatmentSite).find({
        relations: ["treatmentSeats", "treatmentSeats.treatmentItems"],
      })
    );
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

treatmentSitesRouter.post("/", async (req, res) => {
  const body: { name: string } = req.body;
  if (!body.name) {
    res.sendStatus(422);
    return;
  }

  const newSite = new TreatmentSite();
  newSite.name = body.name;
  await getRepository(TreatmentSite).save(newSite);
  res.sendStatus(201);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentSitesRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const body: { name?: string } = req.body;
  if (!body.name) {
    return;
  }

  try {
    await getRepository(TreatmentSite).update(id, { name: body.name });
  } catch (e) {
    res.sendStatus(500);
  }
  res.sendStatus(204);
  await saveTreatmentSitesToJson();
  SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentSitesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await getRepository(TreatmentSite).delete(id);
    res.sendStatus(204);
    await saveTreatmentSitesToJson();
    SocketConnection.getSocket().of("/maintain").emit("update");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

treatmentSitesRouter.get("/:id/treatmentSeats", async (req, res) => {
  const id = Number(req.params.id);

  res.json(
    await getRepository(TreatmentSeat).find({
      where: {
        treatmentSite: { id },
      },
      relations: ["treatmentItems", "currentTreatmentSchedule"],
    })
  );
  //treatmentSiteController.getSeat()
});

// treatmentSitesRouter.get(
//   "/treatmentCode/:treatmentCode/treatingPatient",
//   async (req: Request, res) => {
//     const treatmentSite = await getRepository(TreatmentSite).findOne({
//       treatmentCode: req.params.treatmentCode,
//     });
//     if (treatmentSite) {
//       try {
//         const timerController = (await TimerController.getMapInstance()).get(
//           treatmentSite.treatmentCode
//         );
//         let startId = 0;
//         let treatments = await getRepository(Treatment).find({
//           where: {
//             updatedAt: MoreThan(new Date(new Date().toLocaleDateString())),
//           },
//         });
//         if (treatmentSchedulesRouter.length > 0) {
//           startId = treatments[0].id - 1;
//         }
//         res.json(
//           timerController.treatingPatients.map((t) => {
//             if (t) {
//               return { ...t, id: t.id - startId };
//             }
//             return undefined;
//           })
//         );
//         return;
//       } catch (e) {
//         console.log(e);
//         res.sendStatus(500);
//         return;
//       }
//     }
//     res.sendStatus(404);
//     return;
//   }
// );

// // response all patient which currentTreatmentSite is this
treatmentSitesRouter.get("/:id/treatments", async (req, res) => {
  const id = req.params.id;

  const treatmentSite = await getRepository(TreatmentSite).findOne(id);
  if (!treatmentSite) {
    res.sendStatus(404);
    return;
  }

  const treatments = (
    await getRepository(Treatment).find({
      relations: [
        "treatmentSchedules",
        "treatmentSchedules.treatmentSite",
        "treatmentSchedules.treatmentItems",
        "patient",
      ],
      where: {
        createdAt: MoreThan(new Date(new Date().toLocaleDateString())),
      },
    })
  )
    .map((t, i) => {
      t.id = i + 1;
      t.treatmentSchedules = t.treatmentSchedules.filter(
        (schedule) => schedule.status != "end"
      );
      return t;
    })
    .filter((t) => {
      if (t.treatmentSchedules[0]) {
        return (
          t.treatmentSchedules[0].treatmentSite.id === treatmentSite.id &&
          t.treatmentSchedules[0].status != "stop"
        );
      }
      return false;
    });
  res.json(treatments);
  return;
});

export default treatmentSitesRouter;
