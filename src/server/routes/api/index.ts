import express, { Router } from "express";
import { SocketConnection } from "../../socket.io";
import testRouter from "./testRouter";

const apiRouter = Router({});

apiRouter.use("/test", testRouter);

apiRouter.post("/centralControl/upload", (req: express.Request, res) => {
  // console.log(JSON.stringify(req.body));
  const io = SocketConnection.getSocket();
  io.of("/centralControl").emit("upload", JSON.stringify(req.body));
  res.sendStatus(200);
});

export default apiRouter;
