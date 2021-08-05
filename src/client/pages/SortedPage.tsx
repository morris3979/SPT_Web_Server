import React, { FC, useCallback, useEffect, useState } from "react";
import "../scss/pages/sortedPage.scss";
const List = React.lazy(() => import("../component/share/list"));
import io from "socket.io-client";
import { Treatment } from "../types";
import {
  changeTreatmentStopping,
  getStoppingTreatments,
  getTreatments,
} from "../api/treatments";
import {
  changeTreatmentScheduleSkip,
  changeTreatmentScheduleStatus,
} from "../api/treatmentSchedules";

const SortedPage: FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [stopTreatments, setStopTreatments] = useState<Treatment[]>([]);
  const [longStopTreatments, setLongStopTreatments] = useState<Treatment[]>([]);
  const [section, setSection] = useState<"morning" | "afternoon" | "night">(
    "morning"
  );

  const [selectedPatientIndex, setSelectedPatientIndex] = useState<number>(-1);
  const [stopMinute, setStopMinute] = useState("");

  const [selectedStopTreatments, setSelectedStopTreatments] = useState<
    number[]
  >([]);

  const [selectedLongStopTreatments, setSelectedLongStopTreatments] = useState<
    number[]
  >([]);

  let socket: SocketIOClient.Socket;

  useEffect(() => {
    updateData();
    socket = io();
    socket.on("update", () => {
      updateData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedPatientIndex >= treatments.length) {
      setSelectedPatientIndex(-1);
    }
  }, [treatments]);

  useEffect(() => {
    setSelectedLongStopTreatments((prev) =>
      prev.filter((index) => index >= longStopTreatments.length)
    );
  }, [longStopTreatments]);

  useEffect(() => {
    setSelectedStopTreatments((prev) =>
      prev.filter((index) => index >= stopTreatments.length)
    );
  }, [stopTreatments]);

  const updateData = async () => {
    const treatments = await getTreatments();
    setTreatments(treatments);
    const stoppingTreatments: Treatment[] = await getStoppingTreatments();
    setStopTreatments(
      stoppingTreatments.filter(
        (v) =>
          v.treatmentSchedules![0].status === "stop" &&
          v.treatmentSchedules![0].postponeTime > 0
      )
    );

    setLongStopTreatments(
      stoppingTreatments.filter(
        (v) =>
          v.treatmentSchedules![0].status === "stop" &&
          v.treatmentSchedules![0].postponeTime === 0
      )
    );
  };

  return (
    <div id="sortedPage">
      <div className="header1">
        <button
          className="btn btn-orange m-2"
          onClick={async () => {
            if (selectedStopTreatments.length > 0) {
              for (let index in selectedStopTreatments) {
                await changeTreatmentStopping(stopTreatments[index].id, {
                  section,
                  value: false,
                });
              }
            }
          }}
        >
          重排
        </button>
      </div>
      <div className="header2">
        <button
          className="btn btn-orange m-2"
          onClick={async () => {
            if (selectedLongStopTreatments.length > 0) {
              for (const index of selectedLongStopTreatments) {
                await changeTreatmentStopping(longStopTreatments[index].id, {
                  section,
                  value: false,
                });
                await updateData();
              }
            }
          }}
        >
          重排
        </button>
        <select
          className="ml-2"
          style={{ height: "30px" }}
          value={section}
          onChange={(e: React.FormEvent<HTMLSelectElement>) => {
            setSection(
              e.currentTarget.value as "morning" | "afternoon" | "night"
            );
          }}
        >
          <option value="morning">上午診</option>
          <option value="afternoon">下午診</option>
          <option value="night">晚上診</option>
        </select>
      </div>

      <div className="side1">
        <List
          header="看診病患"
          items={treatments.map((t) => t.patient.name)}
          selectedItemsIndex={[selectedPatientIndex]}
          onItemClick={(i) => setSelectedPatientIndex(i)}
        ></List>
      </div>

      <div className="side2">
        <List
          header="延遲病患"
          items={stopTreatments.map((t) => t.patient.name)}
          selectedItemsIndex={selectedStopTreatments}
          onItemClick={(i) => {
            const existIndex = selectedStopTreatments.indexOf(i);
            if (existIndex > -1) {
              setSelectedStopTreatments(
                selectedStopTreatments
                  .slice(0, i)
                  .concat(selectedStopTreatments.slice(i + 1))
              );
            } else {
              setSelectedStopTreatments([...selectedStopTreatments, i]);
            }
          }}
        ></List>
      </div>

      <div className="side3">
        <List
          header="延診病患"
          items={longStopTreatments.map((t) => t.patient.name)}
          selectedItemsIndex={selectedLongStopTreatments}
          onItemClick={(i) => {
            const existIndex = selectedLongStopTreatments.indexOf(i);
            if (existIndex > -1) {
              setSelectedLongStopTreatments((prev) =>
                prev.filter((index) => index !== i)
              );
            } else {
              setSelectedLongStopTreatments((prev) => [...prev, i]);
            }
          }}
        ></List>
      </div>

      <div className="main">
        <table className="table">
          <thead className="table-dark">
            <tr>
              <th className="text-center">站別序</th>
              <th className="text-center">站別</th>
              <th className="text-center">使用狀態</th>
              <th className="text-center">使用時間</th>
              <th className="text-center">附屬</th>
              <th className="text-center">
                <span className="ml-1 mr-1">延遲</span>
                <input
                  className="text-center mr-1"
                  placeholder=" "
                  value={stopMinute}
                  style={{
                    fontSize: 20,
                    width: "35px",
                    height: "25px",
                  }}
                  onChange={(e) => {
                    setStopMinute(e.currentTarget.value);
                  }}
                />
                分鐘
              </th>
              <th className="text-center"> 自動略過</th>
            </tr>
          </thead>
          <tbody>
            {selectedPatientIndex > -1 &&
            selectedPatientIndex < treatments.length
              ? treatments[selectedPatientIndex].treatmentSchedules
                  ?.map((schedule) => {
                    switch (schedule.status) {
                      case "inQueue":
                        return { ...schedule, status: "隊列中" };
                      case "onSeat":
                        return { ...schedule, status: "準備中" };
                      case "treating":
                        return { ...schedule, status: "進行中" };
                      case "pause":
                        return { ...schedule, status: "暫停" };
                      case "stop":
                        if (schedule.postponeTime > 0) {
                          return { ...schedule, status: "延遲" };
                        } else {
                          return { ...schedule, status: "延診" };
                        }
                      default:
                        return schedule;
                    }
                  })
                  .map((t, i) => (
                    <tr
                      key={`sortedPage-selectedPatient-treatmentSchedules-${i}`}
                    >
                      <td className="text-primary text-center">{i + 1}</td>
                      <td className="text-primary text-center">
                        {t.treatmentSite.name}
                      </td>
                      <td className="text-primary text-center">{t.status}</td>
                      <td className="text-primary text-center">
                        {t.remainTime}
                      </td>
                      <td className="text-primary text-center">
                        {t.follow ? "冷熱敷" : ""}
                      </td>

                      <td>
                        <button
                          className="mr-1"
                          onClick={async () => {
                            await changeTreatmentScheduleStatus(
                              treatments[selectedPatientIndex]
                                .treatmentSchedules![i].id,
                              {
                                status: "stop",
                                stopTime: Number(stopMinute) * 60 * 1000,
                              }
                            );
                            await updateData();
                          }}
                        >
                          延遲
                        </button>
                        <button
                          className="ml-1"
                          onClick={async () => {
                            await changeTreatmentScheduleStatus(
                              treatments[selectedPatientIndex]
                                .treatmentSchedules![i].id,
                              {
                                status: "stop",
                                stopTime: 0,
                              }
                            );
                            await updateData();
                          }}
                        >
                          延診
                        </button>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          disabled={t.status === "準備中"}
                          checked={t.skip}
                          style={{
                            width: "20px",
                            height: "20px",
                            border: "1px",
                          }}
                          onChange={async (e) => {
                            await changeTreatmentScheduleSkip(t.id, {
                              skip: e.target.checked,
                            });
                          }}
                        ></input>
                      </td>
                    </tr>
                  ))
              : undefined}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SortedPage;
