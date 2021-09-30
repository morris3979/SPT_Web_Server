import * as express from "express";
import apiRouter from "./routes/api";
import pageRouter from "./routes/pageRoutes";
import * as bodyParser from "body-parser";
import * as http from "http";
import { SocketConnection } from "./socket.io";
import * as compression from "compression";
import "reflect-metadata";
import { createConnection } from "typeorm";
// import TreatmentSiteController from "./treatmentSiteController";

async function app() {
  const port = process.env.PORT || 3000;

  const app = express();
  app.set("port", port);

  // connection to database
  await createConnection();

  // init socket.io and set socket.io join client to room when connection
  const server = http.createServer(app);
  SocketConnection.getSocket(server);

  // await TreatmentSiteController.getMapInstance(); // init TimerController
  // await TreatmentSiteController.setAllNewSchedules();

  app.use(bodyParser.json()); // auto parse json to js object
  app.use(compression()); // auto compress response
  app.use(express.static("public")); // serve frontend file
  app.use(pageRouter); // serve html on frontend route

  app.use("/api", apiRouter); // mount api router

  process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    // application specific logging, throwing an error, or other logic here
  });

  server.listen(port, () => console.log(`Server listening on port: ${port}`));
}

app();
