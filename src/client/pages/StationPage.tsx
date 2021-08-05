const StationPageTable = React.lazy(
  () => import("../component/StationPage/stationPageTable")
);
import { Grid } from "@material-ui/core";

const TreatmentProgressBar = React.lazy(
  () => import("../component/StationPage/treatmentProgressBar")
);
import io from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import { Treatment, TreatmentSchedule, TreatmentSeat } from "../types";
import {
  getTreatmentSeatsInTreatmentSite,
  getTreatmentsInTreatmentSite,
} from "../api/treatmentSites";

const StationPage: React.FC<{
  siteId: number;
  itemIds: number[];
  displayNames: string;
}> = (props: { siteId: number; itemIds: number[]; displayNames: string }) => {
  const [treatmentSeats, setTreatmentSeats] = useState<TreatmentSeat[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const treatmentsRef = useRef<Treatment[]>();
  treatmentsRef.current = treatments;

  const timers = useRef<number[]>([]);
  let socket: SocketIOClient.Socket;
  //treatingUsersRef.current = treatingUsers;

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

  useEffect(
    () => () => {
      timers.current.forEach((timer) => {
        clearInterval(timer);
      });
    },
    []
  );

  async function updateData(): Promise<void> {
    timers.current.map((timer) => {
      clearInterval(timer);
    });
    timers.current = [];

    const treatmentSeatsResponse = await getTreatmentSeatsInTreatmentSite(
      props.siteId
    );
    setTreatmentSeats(treatmentSeatsResponse);
    setTreatments(await getTreatmentsInTreatmentSite(props.siteId));

    treatmentSeatsResponse.forEach((seat) => {
      if (seat.currentTreatmentSchedule?.status === "treating") {
        const treatmentIndex = treatmentsRef.current!.findIndex(
          (treatment) =>
            treatment.treatmentSchedules![0].id ===
            seat.currentTreatmentSchedule?.id
        );
        console.log(treatmentIndex);
        timers.current.push(
          window.setInterval(() => {
            treatmentsRef.current![
              treatmentIndex
            ].treatmentSchedules![0].remainTime -= 1000;
            setTreatments([...treatmentsRef.current!]);
          }, 1000)
        );
      }
    });
  }

  if (props.displayNames) {
    return (
      <div>
        <h2 className="text-left ml-3 mt-3">{props.displayNames}</h2>
        <div style={{ width: "auto", height: 50 }} />

        <Grid container justify="center" spacing={5}>
          <React.Suspense fallback={<div>Loading...</div>}>
            {treatmentSeats.map((seat) => {
              const treatment = treatments.find(
                (treatment) =>
                  treatment.treatmentSchedules![0].id ===
                  seat.currentTreatmentSchedule?.id
              );
              if (treatment) {
                return (
                  <TreatmentProgressBar
                    key={props.siteId + "-TreatmentProgressBar-" + seat.id}
                    userName={treatment?.patient?.name ?? ""}
                    treating={
                      treatment?.treatmentSchedules![0].status === "treating"
                    }
                    maxTime={Math.max(
                      ...treatment!.treatmentSchedules![0].treatmentItems!.map(
                        (item) => item.duration
                      )
                    )}
                    remindTime={treatment!.treatmentSchedules![0].remainTime}
                    id={seat.id}
                  />
                );
              } else {
                const maxTime = Math.max(
                  ...seat.treatmentItems!.map((item) => item.duration)
                );
                return (
                  <TreatmentProgressBar
                    key={props.siteId + "-TreatmentProgressBar-null" + seat.id}
                    userName="沒有人"
                    treating={false}
                    maxTime={maxTime}
                    remindTime={maxTime}
                    id={seat.id}
                  />
                );
              }
            })}
          </React.Suspense>
        </Grid>
        <div style={{ width: "auto", height: 50 }} />
        <React.Suspense fallback={<div>Loading...</div>}>
          <StationPageTable treatments={treatments}></StationPageTable>
        </React.Suspense>
      </div>
    );
  } else {
    return <div>404</div>;
  }
};

export default StationPage;
