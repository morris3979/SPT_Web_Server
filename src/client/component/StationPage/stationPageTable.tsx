import axios from "axios";
import { userInfo } from "os";
import React, { FC, useEffect, useState } from "react";
import { Treatment } from "../../types";

const StationPageTable: FC<{
  treatments: Array<Treatment>;
}> = (props: { treatments: Array<Treatment> }) => {
  const [stopMinute, setStopMinute] = useState(0);

  return (
    <ul className="list-group">
      <table className="table">
        <thead className="table-dark">
          <tr>
            <th className="text-center">報到序</th>
            <th className="text-center">使用者</th>
            <th className="text-center">治療部位</th>
            <th className="text-center">細項資料</th>
            <th className="text-center">下一站</th>
            <th className="text-center">剩餘時間</th>
            <th className="text-center">附屬</th>
            <th className="text-center">
              延遲
              <input
                className="ml-1 mr-1 text-center"
                placeholder=" "
                value={stopMinute}
                style={{
                  fontSize: 16,
                  width: "35px",
                  height: "25px",
                }}
                onChange={(e) => {
                  setStopMinute(Number(e.currentTarget.value));
                }}
              />
              分鐘
            </th>
          </tr>
        </thead>
        <tbody>
          {props.treatments.map((treatment, index) => {
            return (
              <tr
                key={
                  "stationPageTable-List " +
                  treatment
                    .treatmentSchedules![0]?.treatmentItems?.map(
                      (item) => item.displayName
                    )
                    .join("&") +
                  (index + 1)
                }
              >
                <td className="text-primary text-center">{treatment.id}</td>
                <td className="text-primary text-center">
                  {treatment.patient.name}
                </td>
                <td className="text-primary text-center">{""}</td>
                <td className="text-primary text-center">
                  {"" /*TODO: need change*/}
                </td>
                <td className="text-primary text-center">
                  {treatment.treatmentSchedules![1]?.treatmentItems
                    ? treatment
                        .treatmentSchedules![1].treatmentItems.map(
                          (item) => item.displayName
                        )
                        .join("&")
                    : ""}
                </td>
                <td className="text-primary text-center">
                  {treatment.treatmentSchedules![0].status === "inQueue"
                    ? ""
                    : treatment.treatmentSchedules![0].remainTime < 0
                    ? "00:00"
                    : `${new Date(treatment.treatmentSchedules![0].remainTime)
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:${
                        //秒數補0
                        new Date(treatment.treatmentSchedules![0].remainTime)
                          .getSeconds()
                          .toString()
                          .padStart(2, "0")
                      }`}
                </td>
                <td className="text-primary text-center">
                  {treatment.treatmentSchedules![0].follow ? "冷熱敷" : ""}
                </td>
                <td>
                  <button
                    className="mr-1"
                    onClick={async () => {
                      await axios.patch(
                        `/api/treatmentSchedules/${
                          treatment.treatmentSchedules![0].id
                        }/status`,
                        {
                          status: "resort",
                          stopTime: 0,
                        }
                      );
                    }}
                  >
                    重排
                  </button>
                  <button
                    className="ml-1 mr-1"
                    onClick={async () => {
                      await axios.patch(
                        `/api/treatmentSchedules/${
                          treatment.treatmentSchedules![0].id
                        }/status`,
                        {
                          status: "stop",
                          stopTime: Number(stopMinute) * 60 * 1000,
                        }
                      );
                    }}
                  >
                    延遲
                  </button>
                  <button
                    className="ml-1"
                    onClick={async () => {
                      await axios.patch(
                        `/api/treatmentSchedules/${
                          treatment.treatmentSchedules![0].id
                        }/status`,
                        {
                          status: "stop",
                          stopTime: 0,
                        }
                      );
                    }}
                  >
                    延診
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ul>
  );
};

export default StationPageTable;
