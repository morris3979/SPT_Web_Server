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
    defaultSortAndBind();
  }, [selectedTreatmentItems]);
  let socket: SocketIOClient.Socket;

  const defaultSortAndBind = () => {
    const hasPTS1sub1AndPTS2 =
      selectedTreatmentItems.filter(
        (item) =>
          item.treatmentCode === "PTS1-1" || item.treatmentCode === "PTS2"
      ).length === 2;

    if (hasPTS1sub1AndPTS2) {
      if (
        sort.filter((s) => s[0] === "PTS2" && s[1] === "PTS1-1").length === 0
      ) {
        setSort([...sort, ["PTS2", "PTS1-1"]]);
      }
    }

    const hasPTS1sub2AndPTS2 =
      selectedTreatmentItems.filter(
        (item) =>
          item.treatmentCode === "PTS1-2" || item.treatmentCode === "PTS2"
      ).length === 2;

    if (hasPTS1sub2AndPTS2) {
      if (
        sort.filter((s) => s[0] === "PTS2" && s[1] === "PTS1-1").length === 0
      ) {
        setSort([...sort, ["PTS2", "PTS1-2"]]);
      }
    }

    const hasPTS9AndPTS8 =
      selectedTreatmentItems.filter(
        (item) => item.treatmentCode === "PTS9" || item.treatmentCode === "PTS8"
      ).length === 2;

    if (hasPTS9AndPTS8) {
      if (
        bind.findIndex(
          (b) => b.indexOf("PTS9") !== -1 && b.indexOf("PTS8") !== -1
        ) === -1
      ) {
        setBind([...bind, ["PTS8", "PTS9"]]);
      }
    }

    const hasPTS3AndPTS9 =
      selectedTreatmentItems.filter(
        (item) => item.treatmentCode === "PTS3" || item.treatmentCode === "PTS9"
      ).length === 2;

    if (hasPTS3AndPTS9) {
      if (
        bind.findIndex(
          (b) => b.indexOf("PTS3") !== -1 && b.indexOf("PTS9") !== -1
        ) === -1
      ) {
        setBind([...bind, ["PTS3", "PTS9"]]);
      }
    }

    const hasPTS3sub2AndPTS8sub2 =
      selectedTreatmentItems.filter(
        (item) =>
          item.treatmentCode === "PTS3-2" || item.treatmentCode === "PTS8-2"
      ).length === 2;

    if (hasPTS3sub2AndPTS8sub2) {
      if (
        bind.findIndex(
          (b) => b.indexOf("PTS3-2") !== -1 && b.indexOf("PTS8-2") !== -1
        ) === -1
      ) {
        setBind([...bind, ["PTS3-2", "PTS8-2"]]);
      }
    }
  };

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
      selectedItemsIndexInListRef.current = selectedIndexInList;
      setSelectedItemsIndexInList(selectedIndexInList);
      setHidItemsInList([]);
      setSelectedItemsIndexInTable([]);
      setSelectedTreatmentItems([]);
      setSorting(false);
      setBind([]);
      setSort([]);
      setFollow([]);

      addBtnOnClick();
    });
  };

  return (
    <div id="centralControl" className="grid-container">
      <div className="header">
        <div>
          <div className="ml-4" />
          <Account />
          <div className="mr-2" />
          <select
            className="h-75 mr-4"
            value={section}
            onChange={(e: React.FormEvent<HTMLSelectElement>) => {
              setSection(e.currentTarget.value);
            }}
          >
            <option value="morning">上午診</option>
            <option value="afternoon">下午診</option>
            <option value="night">晚上診</option>
          </select>
          <input
            className="input2"
            placeholder="病歷號碼"
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
            className="input2"
            placeholder="病患姓名"
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
            className="input2"
            placeholder="出生年月日"
            value={dateOfBirth}
            style={{
              fontSize: 18,
              width: "100px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDateOfBirth(e.currentTarget.value)
            }
          />
          <input
            className="input1"
            placeholder="性別"
            value={gender}
            style={{
              fontSize: 18,
              width: "80px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGender(e.currentTarget.value)
            }
          />
          <input
            className="input3"
            placeholder="IC卡序"
            value={iccard}
            style={{
              fontSize: 18,
              width: "80px",
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setIccard(e.currentTarget.value)
            }
          />
        </div>
      </div>
      <div className="left">
        <List
          header="治療站點"
          items={props.treatmentItems
            .filter((item) => !item.treatmentCode.includes("-"))
            .map((item) => item.displayName)}
          selectedItemsIndex={selectedItemsIndexInList}
          hidItemsIndex={hidItemsIndexInList}
          onItemClick={(i: number) => {
            const existIndex = selectedItemsIndexInListRef.current.indexOf(i);
            if (existIndex == -1) {
              selectedItemsIndexInListRef.current = [
                ...selectedItemsIndexInList,
                i,
              ];
              setSelectedItemsIndexInList(selectedItemsIndexInListRef.current);
            } else {
              selectedItemsIndexInListRef.current = selectedItemsIndexInList
                .slice(0, existIndex)
                .concat(selectedItemsIndexInList.slice(existIndex + 1));
              setSelectedItemsIndexInList(selectedItemsIndexInListRef.current);
            }
          }}
        />
      </div>

      <div className="mid">
        <div className="button-warp">
          <button className="btn btn-primary" onClick={addBtnOnClick}>
            新增
          </button>
          <button className="btn btn-primary" onClick={deleteBtnOnClick}>
            刪除
          </button>

          <button
            className="btn btn-orange"
            onClick={() => {
              if (selectedItemsIndexInTable.length < 2) {
                alert("can't bind site less than two");
                return;
              }
              if (selectedItemsIndexInTable.length > 0) {
                setBind([
                  ...bind,
                  selectedItemsIndexInTable.map(
                    (itemIndex) =>
                      selectedTreatmentItems[itemIndex].treatmentCode
                  ),
                ]);
                setSelectedItemsIndexInTable([]);
              }
            }}
          >
            合併
          </button>
          <button
            className="btn btn-orange"
            onClick={() => {
              if (selectedItemsIndexInTable.length < 2) {
                alert("can't sort site less than two");
                return;
              }
              let sortArray = selectedItemsIndexInTable.map(
                (itemIndex) => selectedTreatmentItems[itemIndex].treatmentCode
              );
              if (
                bind.filter((b) => {
                  let count = 0;
                  b.forEach((treatmentCode) => {
                    if (sortArray.indexOf(treatmentCode) > -1) {
                      count += 1;
                    }
                  });
                  return count > 1;
                }).length > 0
              ) {
                alert("can't sort same schedule");
                return;
              }
              setSort([...sort, sortArray]);
              setSelectedItemsIndexInTable([]);
            }}
          >
            排序
          </button>

          <button
            className="btn btn-orange"
            onClick={sortBtnOnClick}
            disabled={
              sorting ||
              !patientId ||
              !patientName ||
              selectedTreatmentItems.length < 1
            }
          >
            排程
          </button>
        </div>
        <DataTable
          head={["治療代號", "治療名稱", "序號", "模式", "附屬項目"]}
          data={selectedTreatmentItems.map((v, i) => {
            let item: any = Object.assign({}, v);
            bind.forEach((b, i) => {
              if (b.includes(item.treatmentCode)) {
                if (!item.bindAndSortInfo) {
                  item.bindAndSortInfo = `C${i + 1}`;
                } else {
                  item.bindAndSortInfo += `, C${i + 1}`;
                }
              }
            });
            sort.forEach((s, i) => {
              const sortIndex = s.indexOf(item.treatmentCode);
              if (sortIndex > -1) {
                if (!item.bindAndSortInfo) {
                  item.bindAndSortInfo = `S${i + 1}(${sortIndex + 1})`;
                } else {
                  item.bindAndSortInfo += `, S${i + 1}(${sortIndex + 1})`;
                }
              }
            });

            item.mode = (
              <select
                value={v.id}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  selectedTreatmentItems[i] = props.treatmentItems.find(
                    (item) => item.id === Number(e.target.value)
                  )!;
                  setSelectedTreatmentItems([...selectedTreatmentItems]);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {props.treatmentItems
                  .filter(
                    (item) =>
                      item.treatmentCode.split("-")[0] ===
                      v.treatmentCode.split("-")[0]
                  )
                  .map((item) => (
                    <option key={`option-${item.id}`} value={item.id}>
                      {item.displayName}
                    </option>
                  ))}
              </select>
            );

            item.follow = (
              <select
                value={
                  (follow.find((f) => f[1] === v.treatmentCode) ?? [
                    undefined,
                  ])[0]
                }
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  if (e.target.value) {
                    setFollow([
                      ...follow,
                      [
                        e.target.value,
                        ...(bind.find((b) => b.includes(v.treatmentCode)) ?? [
                          v.treatmentCode,
                        ]),
                      ],
                    ]);
                  } else {
                    setFollow(follow.filter((f) => f[1] !== v.treatmentCode));
                  }
                }}
              >
                <option value={undefined}></option>
                {["7", "8", "11", "9", "3"].includes(
                  v.treatmentCode.replace("PTS", "")
                ) ? (
                  <option value="PTS2">PTS2</option>
                ) : undefined}
              </select>
            );

            return item;
          })}
          sort={[
            "treatmentCode",
            "displayName",
            "bindAndSortInfo",
            "mode",
            "follow",
          ]}
          onRowClick={(i: number) => {
            const existIndex = selectedItemsIndexInTable.indexOf(i);
            if (existIndex == -1) {
              setSelectedItemsIndexInTable([...selectedItemsIndexInTable, i]);
            } else {
              setSelectedItemsIndexInTable(
                selectedItemsIndexInTable
                  .slice(0, existIndex)
                  .concat(selectedItemsIndexInTable.slice(existIndex + 1))
              );
            }
          }}
          selectedIndex={selectedItemsIndexInTable}
          selectable
        />
      </div>
      <div className="right">
        <DataTable
          head={["報到序", "報到時間"]}
          data={[{ timestamp: medicalRecords }]}
          sort={["order", "timestamp"]}
        />
        <DataTable
          head={["就診日期", "看診醫師"]}
          data={[]}
          sort={["timestamp", "doctorName"]}
        />
        <DataTable head={["治療部位"]} data={[]} />
        <DataTable head={["細項資料"]} data={[]} />
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
