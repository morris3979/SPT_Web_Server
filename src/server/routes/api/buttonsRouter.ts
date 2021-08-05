import { Request, Router } from "express";
import { getRepository } from "typeorm";
import { TreatmentSeat } from "../../entity/TreatmentSeat";
import { TreatmentSite } from "../../entity/TreatmentSite";
import { SocketConnection } from "../../socket.io";
import TreatmentSiteController from "../../treatmentSiteController";

const buttonsRouter = Router({});

buttonsRouter.patch("/:hardwareId/status", async (req: Request, res) => {
  const seat = await getRepository(TreatmentSeat).findOne({
    where: {
      buttonId: req.params.hardwareId,
    },
    relations: ["treatmentSite"],
  });

  if (seat) {
    const io = SocketConnection.getSocket(); //TODO: need update
    try {
      const seatController = (await TreatmentSiteController.getMapInstance())
        .get(seat.treatmentSite.id)
        .getSeat(seat.id);
      switch (req.body.status) {
        case "single":
          await seatController.singleClick();
          break;
        case "long": //TODO: or reset?
          await seatController.skip();
          break;
        default:
          res.sendStatus(400);
          return;
      }
      res.sendStatus(200);
      await SocketConnection.getSocket().emit("update");
      return;
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
      return;
    }
  }
  res.sendStatus(404);
  return;
});

buttonsRouter.get("/:hardwareId/displayName", async (req, res) => {
  const hardwareId = req.params.hardwareId;
  const seat = await getRepository(TreatmentSeat).findOne({
    where: { buttonId: hardwareId },
    relations: ["treatmentSite", "treatmentSite.treatmentSeats"],
  });
  if (!seat) {
    res.sendStatus(404);
    return;
  }
  let number;
  seat.treatmentSite.treatmentSeats.forEach((seat, i) => {
    if (seat.buttonId === hardwareId) {
      number = i + 1;
    }
  });
  const result = `${seat.treatmentSite.name}座位${number}`;
  res.send(result);
});

export default buttonsRouter;
