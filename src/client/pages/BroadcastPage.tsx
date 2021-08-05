import React, { FC, useEffect, useState } from "react";
import io from "socket.io-client";
import DataTable from "../component/share/dataTable";
import "../scss/pages/broadcast.scss";
import { Treatment, TreatmentSchedule } from "../types";
import { getOnSeatTreatmentSchedules } from "../api/treatmentSchedules";
import { getTreatments } from "../api/treatments";

const BroadcastPage: FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [onSeatTreatmentSchedules, setOnSeatTreatmentSchedules] = useState<
    TreatmentSchedule[]
  >([]);

  const updateData = async (): Promise<void> => {
    setTreatments(
      (await getTreatments()).filter(
        (t) => t.treatmentSchedules![0].status !== "stop"
      )
    );
    setOnSeatTreatmentSchedules(await getOnSeatTreatmentSchedules());
  };
  let socket: SocketIOClient.Socket;

  useEffect(() => {
    updateData();
    socket = io();
    socket.on("update", () => {
      updateData();
    });
  }, []);

  useEffect(
    () => () => {
      socket.disconnect();
    },
    []
  );

  return (
    <div id="broadcast">
      <DataTable
        className="preparing-patient-table"
        head={["報到序", "姓名", "目前站"]}
        data={onSeatTreatmentSchedules}
        sort={["treatment.id", "treatment.patient.name", "treatmentSite.name"]}
        autoScroll
      />
      <DataTable
        className="patient-table"
        head={["報到序", "姓名", "目前站", "下一站"]}
        data={treatments}
        sort={[
          "id",
          "patient.name",
          "treatmentSchedules.0.treatmentSite.name",
          "treatmentSchedules.1.treatmentSite.name",
        ]}
        autoScroll
      />
    </div>
  );
};

export default BroadcastPage;
