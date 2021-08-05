import { Socket } from "dgram";
import { Router } from "express";
import { getRepository } from "typeorm";
import { TreatmentItem } from "../../entity/TreatmentItem";
import { SocketConnection } from "../../socket.io";
import { saveTreatmentSitesToJson } from "../../utils";

const treatmentItemsRouter = Router({});

treatmentItemsRouter.get("/", async (req, res) => {
  res.json(await getRepository(TreatmentItem).find());
});

treatmentItemsRouter.post("/", async (req, res) => {
  const body: { displayName: string; treatmentCode: string; duration: number } =
    req.body;

  const newItem = new TreatmentItem();
  newItem.displayName = body.displayName ?? "";
  newItem.treatmentCode = body.treatmentCode ?? "";
  newItem.duration = body.duration ?? 0;

  try {
    await getRepository(TreatmentItem).save(newItem);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
    return;
  }

  res.sendStatus(201);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentItemsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body: { displayName: string; treatmentCode: string; duration: number } =
    req.body;
  const itemToUpdate = await getRepository(TreatmentItem).findOne(id);
  if (!itemToUpdate) {
    res.sendStatus(404);
    return;
  }
  if (body.displayName) {
    itemToUpdate.displayName = body.displayName;
  }
  if (body.treatmentCode) {
    itemToUpdate.treatmentCode = body.treatmentCode;
  }
  if (body.duration) {
    itemToUpdate.duration = body.duration;
  }
  try {
    await getRepository(TreatmentItem).save(itemToUpdate);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
    return;
  }
  res.sendStatus(204);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

treatmentItemsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await getRepository(TreatmentItem).delete(id);
  res.sendStatus(204);
  await saveTreatmentSitesToJson();
  await SocketConnection.getSocket().of("/maintain").emit("update");
});

export default treatmentItemsRouter;
