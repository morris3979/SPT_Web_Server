import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import "../scss/pages/centralControl.scss";
import io from "socket.io-client";
import { TreatmentItem } from "../types";
import Account from "@material-ui/icons/AssignmentInd";
import {
  createTreatment,
  createTreatmentSchedulesInTreatment,
} from "../api/treatments";

const SpinnerCircle = React.lazy(
  () => import("../component/share/spinnerCircle")
);
const DataTable = React.lazy(() => import("../component/share/dataTable"));
const List = React.lazy(() => import("../component/share/list"));

const CentralControlPage: FC<{ treatmentItems: TreatmentItem[] }> = (props: {
  treatmentItems: TreatmentItem[];
}) => {
  const [schoolID, setSchoolID] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string | number>("");

  useEffect(() => {
    socketConnect();
  }, []);
  useEffect(
    () => () => {
      socket.disconnect();
    },
    []
  );
  useEffect(() => {
  }, []);
  let socket: SocketIOClient.Socket;


  const socketConnect = (): void => {
    socket = io("/centralControl", { forceNew: true });
    socket.on("upload", (dataString: string) => {
      const data: any = JSON.parse(dataString); //TODO: give upload data type

      let selectedIndexInList: number[] = [];
      data.items.map((uploadItemTreatmentCode: string) => {
        props.treatmentItems
          .filter((item) => !item.treatmentCode.includes("-"))
          .map((item, i) => {
            if (uploadItemTreatmentCode === item.treatmentCode) {
              selectedIndexInList.push(i);
            }
          });
      });

    });
  };

  return (
    <div id="centralControl" className="grid-container">
      <div className="header">
        <div>
          <div className="ml-4" />
          <Account />
          <div className="mr-2" />
          <input
            className="input1"
            placeholder="學號"
            value={schoolID}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSchoolID(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="密碼"
            value={password}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="姓名"
            value={name}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="生日"
            value={dateOfBirth}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDateOfBirth(e.currentTarget.value)
            }
          />
          <select
            className="h-75 mr-4"
            value={gender}
            onChange={(e: React.FormEvent<HTMLSelectElement>) => {
              setGender(e.currentTarget.value);
            }}
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <button className="input3 btn btn-orange">
            儲存
          </button>
        </div>
      </div>
      <div className="body">
        <div>
          <DataTable
            className="patient-table"
            head={["學號", "密碼", "姓名", "性別"]}
            data={[]}
            sort={[]}
            autoScroll
          />
        </div>
      </div>
    </div>
  );
};

export default CentralControlPage;
