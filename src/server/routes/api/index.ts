import express, { Router } from "express";
import treatmentSitesRouter from "./treatmentSitesRouter";
import buttonsRouter from "./buttonsRouter";
import { SocketConnection } from "../../socket.io";
import treatmentsRouter from "./treatmentsRouter";
import treatmentSchedulesRouter from "./treatmentSchedulesRouter";
import treatmentSeatsRouter from "./treatmentSeatsRouter";
import treatmentItemsRouter from "./treatmentItemsRouter";

const apiRouter = Router({});

apiRouter.use("/treatments", treatmentsRouter);
apiRouter.use("/treatmentSites", treatmentSitesRouter);
apiRouter.use("/buttons", buttonsRouter);
apiRouter.use("/treatmentSchedules", treatmentSchedulesRouter);
apiRouter.use("/treatmentSeats", treatmentSeatsRouter);
apiRouter.use("/treatmentItems", treatmentItemsRouter);

apiRouter.post("/centralControl/upload", (req: express.Request, res) => {
  // console.log(JSON.stringify(req.body));
  const io = SocketConnection.getSocket();
  io.of("/centralControl").emit("upload", JSON.stringify(req.body));
  res.sendStatus(200);
});

export default apiRouter;
