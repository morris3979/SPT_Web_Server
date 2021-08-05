import React, { FC, Suspense, useEffect, useState } from "react";
import { getTreatments } from "../api/treatments";
import DataTable from "../component/share/dataTable";
import "../scss/pages/WaitingListPage.scss";
import { TreatmentSite } from "../types";
import io from "socket.io-client";

const WaitingListPage: FC<{ treatmentSites: TreatmentSite[] }> = (props: {
  treatmentSites: TreatmentSite[];
}) => {
  let socket: SocketIOClient.Socket;

  const [otherInfos, setOtherInfos] = useState<
    {
      waitingNumber: number;
      preparingNumber: number;
    }[]
  >([]);

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

  async function updateData(): Promise<void> {
    const treatments = await getTreatments();
    setOtherInfos(
      props.treatmentSites.map((site) => {
        const currentTreatments = treatments.filter(
          (t) =>
            (t.treatmentSchedules ?? [undefined])[0]?.treatmentSite?.id ===
            site.id
        );
        return {
          waitingNumber: currentTreatments.filter(
            (t) =>
              (t.treatmentSchedules ?? [undefined])[0]?.status === "inQueue"
          ).length,
          preparingNumber: currentTreatments.filter(
            (t) => (t.treatmentSchedules ?? [undefined])[0]?.status === "onSeat"
          ).length,
        };
      })
    );
  }

  return (
    <div>
      <div className="waitingListPage">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="main">
            <DataTable
              head={[
                "站別序",
                "站別",
                "站別總機台數",
                "站別準備中人數",
                "站別等待人數",
                ]}
              data={props.treatmentSites.map((site, i) => ({
                ...site,
                ...otherInfos[i],
              }))}
              sort={[
                "id",
                "name",
                "treatmentSeats.length",
                "preparingNumber",
                "waitingNumber",
              ]}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default WaitingListPage;
