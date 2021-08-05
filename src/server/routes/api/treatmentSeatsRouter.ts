import { Request, Response, Router } from "express";
import { getRepository } from "typeorm";
import { TreatmentItem } from "../../entity/TreatmentItem";
import { TreatmentSeat } from "../../entity/TreatmentSeat";
import { TreatmentSite } from "../../entity/TreatmentSite";
import { SocketConnection } from "../../socket.io";
import TreatmentSiteController from "../../treatmentSiteController";
import { saveTreatmentSitesToJson } from "../../utils";

const treatmentSeatsRouter = Router({});

treatmentSeatsRouter.post("/", async (req: Request, res: Response) => {
  const body: { siteId: number; buttonId: string; treatmentItemIds: number[] } =
    req.body;
  if (
    typeof body.siteId === "undefined" ||
    !body.buttonId ||
    body.treatmentItemIds.length === 0
  ) {
    res.sendStatus(422);
    return;
  }

  if (
    (await getRepository(TreatmentSeat).count({ buttonId: body.buttonId })) > 0
  ) {
    res.sendStatus(409);
    return;
  }

  let newSeat = new TreatmentSeat();

  newSeat.buttonId = body.buttonId;
  newSeat.treatmentSite = await getRepository(TreatmentSite).findOne(
    body.siteId
  );
  newSeat.treatmentItems = await Promise.all(
    body.treatmentItemIds.map(
      async (id) => await getRepository(TreatmentItem).findOne(id)
    )
  );
  await getRepository(TreatmentSeat).save(newSeat);

  res.sendStatus(201);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentSeatsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body: { buttonId: string; treatmentItemIds: number[] } = req.body;

  const seatToUpdate = await getRepository(TreatmentSeat).findOne(id);
  if (!seatToUpdate) {
    res.sendStatus(404);
    return;
  }
  if (body.buttonId) {
    if (
      (
        await getRepository(TreatmentSeat).find({ buttonId: body.buttonId })
      ).filter((seat) => seat.id !== id).length > 0
    ) {
      res.sendStatus(409);
      return;
    }

    seatToUpdate.buttonId = body.buttonId;
  }
  if (body.treatmentItemIds) {
    seatToUpdate.treatmentItems = await Promise.all(
      body.treatmentItemIds.map(
        async (id) => await getRepository(TreatmentItem).findOne(id)
      )
    );
  }
  await getRepository(TreatmentSeat).save(seatToUpdate);
  res.sendStatus(204);
  await saveTreatmentSitesToJson();

  await SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentSeatsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await getRepository(TreatmentSeat).delete(id);
  } catch {}
  res.sendStatus(204);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

// api to change timer state
treatmentSeatsRouter.patch(
  "/:id/controller/status",
  async (req: Request, res) => {
    const treatmentSeat = await getRepository(TreatmentSeat).findOne(
      req.params.id,
      {
        relations: ["treatmentSite"],
      }
    );
    if (!treatmentSeat) {
      res.sendStatus(404);
      return;
    }

    const io = SocketConnection.getSocket(); //TODO: need update
    try {
      const seat = (await TreatmentSiteController.getMapInstance())
        .get(treatmentSeat.treatmentSite.id)
        .getSeat(treatmentSeat.id);
      switch (req.body.status) {
        case "start":
          await seat.start();
          break;
        case "pause":
          await seat.pause();
          break;
        case "skip":
          await seat.skip();
          break;
        case "reset":
          await seat.reset();
          break;
        default:
          res.sendStatus(422);
          return;
      }
      res.sendStatus(204);
      await SocketConnection.getSocket().emit("update");
      return;
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
      return;
    }
  }
);

export default treatmentSeatsRouter;
