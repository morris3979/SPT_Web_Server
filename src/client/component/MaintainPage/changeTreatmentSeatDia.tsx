import React, { FC, useMemo, useState } from "react";
import {
  changeTreatmentSeat,
  creatTreatmentSeat,
} from "../../api/treatmentSeats";
import { TreatmentItem } from "../../types";

const Dialog = React.lazy(() => import("../share/dialog"));
const IconButton = React.lazy(() => import("../share/iconButton"));

const ChangeTreatmentSeatDia: FC<IChangeTreatmentSeatDiaProps> = (
  props: IChangeTreatmentSeatDiaProps
) => {
  const [seat, setSeat] = useState<IChangeTreatmentSeat>(
    props.value ?? {
      id: -1,
      buttonId: "",
      treatmentItems: [],
    }
  );

  const availableItems = useMemo(
    () =>
      props.treatmentItems.filter(
        (item) =>
          seat.treatmentItems!.findIndex(
            (otherItem) => otherItem.id == item.id
          ) == -1
      ),
    [props.treatmentItems, seat]
  );

  const handleButtonIdChange = (e: React.FormEvent<HTMLInputElement>) => {
    const buttonId = e.currentTarget.value;
    setSeat({ ...seat, buttonId });
  };

  return (
    <Dialog
      className="change-treatment-seat-dia"
      onConfirm={async () => {
        if (props.value) {
          await changeTreatmentSeat(
            seat.id,
            seat.buttonId,
            seat.treatmentItems!.map((item) => item.id)
          );
        } else {
          await creatTreatmentSeat(
            props.siteId,
            seat.buttonId,
            seat.treatmentItems!.map((item) => item.id)
          );
        }
        props.onConfirm();
      }}
      onCancel={() => {
        props.onCancel();
      }}
      confirmDisable={
        props.value &&
        props.value.buttonId == seat.buttonId &&
        props.value.treatmentItems == seat.treatmentItems
      }
    >
      <div className="table">
        <div className="row">
          <div className="cell">
            <div className="container button-list-head">
              治療代號
              <IconButton
                disabled={availableItems.length === 0}
                onClick={() => {
                  setSeat({
                    ...seat,
                    treatmentItems: [
                      ...seat.treatmentItems!,
                      availableItems[0],
                    ],
                  });
                }}
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                  ></path>
                </svg>
              </IconButton>
            </div>
          </div>
          <div className="cell">按鈕代碼</div>
        </div>
        <div className="row">
          <div className="cell">
            <div className="container content">
              {seat.treatmentItems!.map((item, i) => (
                <select
                  key={seat.id + "-item-" + i}
                  value={item.id}
                  onChange={(e: React.FormEvent<HTMLSelectElement>) => {
                    const v = e.currentTarget.value;
                    if (v === "delete") {
                      seat.treatmentItems?.splice(i, 1);
                    } else {
                      seat.treatmentItems![i] = JSON.parse(v) as TreatmentItem;
                    }
                    setSeat({
                      ...seat,
                      treatmentItems: [...seat.treatmentItems!],
                    });
                  }}
                >
                  <option value={JSON.stringify(seat.treatmentItems![i])}>
                    {seat.treatmentItems![i].treatmentCode}
                  </option>
                  {availableItems.map((item, optionIndex) => (
                    <option
                      key={seat.id + "-item-" + i + "-option-" + optionIndex}
                      value={JSON.stringify(item)}
                    >
                      {item.treatmentCode}
                    </option>
                  ))}
                  <option value="delete">刪除</option>
                </select>
              ))}
            </div>
          </div>
          <div className="cell">
            <div className="container content">
              <div>
                <input
                  type="text"
                  onChange={handleButtonIdChange}
                  value={seat.buttonId}
                />
              </div>
            </div>
          </div>
          <div className="cell button-list"></div>
        </div>
      </div>
    </Dialog>
  );
};

interface IChangeTreatmentSeatDiaProps {
  value: IChangeTreatmentSeat | undefined;
  treatmentItems: TreatmentItem[];
  siteId: number;
  onConfirm: Function;
  onCancel: Function;
}

interface IChangeTreatmentSeat {
  id: number;
  buttonId: string;
  treatmentItems?: TreatmentItem[];
}

export default ChangeTreatmentSeatDia;
