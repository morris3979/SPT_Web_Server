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
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  // const [medicalRecords, setMedicalRecords] = useState<
  //   {
  //     timestamp: string;
  //     doctorName: string;
  //   }[]
  // >([]);
  const [medicalRecords, setMedicalRecords] = useState<string>("");
  const [gender, setGender] = useState<string | number>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [iccard, setIccard] = useState("");
  const [section, setSection] = useState("morning");

  const [selectedItemsIndexInList, setSelectedItemsIndexInList] = useState<
    number[]
  >([]);
  const selectedItemsIndexInListRef = useRef<number[]>([]);
  const [hidItemsIndexInList, setHidItemsInList] = useState<number[]>([]);
  const [selectedTreatmentItems, setSelectedTreatmentItems] = useState<
    TreatmentItem[]
  >([]);
  const [selectedItemsIndexInTable, setSelectedItemsIndexInTable] = useState<
    number[]
  >([]);
  const [sorting, setSorting] = useState(false);
  const [bind, setBind] = useState<string[][]>([]); //save bind treatmentCode ex. [["PTS4","PTS8"]]
  const [sort, setSort] = useState<string[][]>([]);
  const [follow, setFollow] = useState<string[][]>([]);

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
  }, [selectedTreatmentItems]);
  let socket: SocketIOClient.Socket;


  const addBtnOnClick = () => {
    let treatmentItemsToSelect: TreatmentItem[] = [];
    let itemsIndexInListToHide: number[] = [];
    selectedItemsIndexInListRef.current.map((itemIndex) => {
      const realIndex = props.treatmentItems.findIndex(
        (item) =>
          item.id ===
          props.treatmentItems.filter(
            (item) => !item.treatmentCode.includes("-")
          )[itemIndex].id
      );
      treatmentItemsToSelect.push(props.treatmentItems[realIndex]);
      itemsIndexInListToHide.push(itemIndex);
    });
    selectedItemsIndexInListRef.current = [];
    setSelectedItemsIndexInList([]);
    setHidItemsInList([...hidItemsIndexInList].concat(itemsIndexInListToHide));
    setSelectedTreatmentItems(
      [...selectedTreatmentItems].concat(treatmentItemsToSelect)
    );
  };

  const deleteBtnOnClick = () => {
    const hidItemsIndexInListCopy = [...hidItemsIndexInList];
    selectedItemsIndexInTable.map((itemIndex) => {
      const indexToDelete = hidItemsIndexInListCopy.indexOf(
        props.treatmentItems.indexOf(selectedTreatmentItems[itemIndex])
      );
      hidItemsIndexInListCopy.splice(indexToDelete, 1);
    });
    setHidItemsInList(hidItemsIndexInListCopy);

    setBind(
      bind.filter(
        (b) =>
          !selectedItemsIndexInTable
            .map((itemIndex) =>
              b.includes(selectedTreatmentItems[itemIndex].treatmentCode)
            )
            .includes(true)
      )
    );

    setSort(
      sort.filter(
        (s) =>
          !selectedItemsIndexInTable
            .map((itemIndex) =>
              s.includes(selectedTreatmentItems[itemIndex].treatmentCode)
            )
            .includes(true)
      )
    );

    setFollow(
      follow.filter(
        (f) =>
          !selectedItemsIndexInTable
            .map((itemIndex) =>
              f.includes(selectedTreatmentItems[itemIndex].treatmentCode)
            )
            .includes(true)
      )
    );

    setSelectedTreatmentItems(
      selectedTreatmentItems.filter((v, i) => {
        return !selectedItemsIndexInTable.includes(i);
      })
    );
    setSelectedItemsIndexInTable([]);
  };

  const sortBtnOnClick = async () => {
    let id: number;
    setSorting(true);
    try {
      id = await createTreatment(
        patientId,
        patientName,
        medicalRecords,
        String(gender),
        dateOfBirth,
        iccard,
        section
      );
    } catch (e) {
      setSorting(false);
      alert("存儲 patient 失敗");
      return;
    }

    try {
      await createTreatmentSchedulesInTreatment(
        id,
        selectedTreatmentItems,
        bind,
        sort,
        follow
      );
    } catch (e) {
      setSorting(false);
      alert("存儲 treatmentSites 失敗");
      return;
    }
    selectedItemsIndexInListRef.current = [];
    setSelectedItemsIndexInList([]);
    setHidItemsInList([]);
    setSelectedTreatmentItems([]);
    setSelectedItemsIndexInTable([]);
    setPatientId("");
    setPatientName("");
    setMedicalRecords("");
    setSorting(false);
    setBind([]);
    setSort([]);
    setFollow([]);

    alert("排程成功");
  };

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
      // data.medicalRecords.map((record, i) => {
      //   const date = new Date(record.timestamp);
      //   record.timestamp =
      //     date.getFullYear() +
      //     "/" +
      //     (date.getMonth() + 1) +
      //     "/" +
      //     date.getDate() +
      //     " " +
      //     date.getHours() +
      //     ":" +
      //     date.getMinutes();
      // });

      setPatientId(data.patientID);
      setPatientName(data.name);
      setMedicalRecords(data.medicalRecords);
      setDateOfBirth(data.dateOfBirth);
      setIccard(data.iccard);
      setGender(data.gender);

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
            value={patientId}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPatientId(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="密碼"
            value={patientName}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPatientName(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="姓名"
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
            value={section}
            onChange={(e: React.FormEvent<HTMLSelectElement>) => {
              setSection(e.currentTarget.value);
            }}
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          <button className="input3">
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
            sort={[
              "id",
              "patient.name",
              "treatmentSchedules.0.treatmentSite.name",
              "treatmentSchedules.1.treatmentSite.name",
            ]}
            autoScroll
          />
        </div>
      </div>

      {sorting ? (
        <div className="absolute-full">
          <SpinnerCircle />
        </div>
      ) : null}
    </div>
  );
};

export default CentralControlPage;
