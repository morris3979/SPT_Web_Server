import { Server as ioServer } from "socket.io";
import { Server } from "http";
import { URL } from "url";
import Axios from "axios";

export class SocketConnection {
  private static instance: SocketConnection;
  private io: ioServer;

  private constructor(io: ioServer) {
    this.io = io;
  }

  // return private instance, if instance not exist then create instance
  public static getSocket(server?: Server): ioServer {
    if (!SocketConnection.instance) {
      if (!server) {
        throw new Error("Haven't create socket");
      }
      const io = new ioServer(server);
      SocketConnection.instance = new SocketConnection(io);
      io.on("connection", function (socket) {
        const url = new URL(socket.request.headers.referer);
        socket.on("disconnect", function () {});
      });
      io.of("/centralControl").on("connection", function () {
        console.log("/centralControl connect");
      });
      // io.of("/maintain").on("connection", function () {
      //   console.log("/maintain connect");
      // });
      // io.of("/treatmentItems").on("connection", function () {
      //   console.log("/treatmentItems connect");
      // });

      return io;
    }
    return SocketConnection.instance.io;
  }
}
