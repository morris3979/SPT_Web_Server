import React, { FC, useState } from "react";
import {
  changeTreatmentItem,
  createTreatmentItem,
} from "../../api/treatmentItems";
import { TreatmentItem } from "../../types";

const Dialog = React.lazy(() => import("../share/dialog"));

const ChangeTreatmentItemDia: FC<IChangeTreatmentItemDiaProps> = (
  props: IChangeTreatmentItemDiaProps
) => {
  //TODO: handle duplicate error (409)
  const [item, setItem] = useState<TreatmentItem>(
    props.value ?? {
      id: -1,
      treatmentCode: "",
      displayName: "",
      duration: 0,
    }
  );

  const handleDisplayNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    const displayName = e.currentTarget.value;
    setItem({ ...item, displayName });
  };
  const handleTreatmentCodeChange = (e: React.FormEvent<HTMLInputElement>) => {
    const treatmentCode = e.currentTarget.value;
    setItem({ ...item, treatmentCode });
  };

  const handleMinuteChange = (e: React.FormEvent<HTMLSelectElement>) => {
    let duration = item.duration % 60000;
    duration += Number(e.currentTarget.value) * 60000;
    setItem({ ...item, duration });
  };

  const handleSecondChange = (e: React.FormEvent<HTMLSelectElement>) => {
    let duration = Math.floor(item.duration / 60000) * 60000;
    duration += Number(e.currentTarget.value) * 1000;
    setItem({ ...item, duration });
  };

  return (
    <Dialog
      className="change-treatment-item-dia"
      onConfirm={async () => {
        if (props.value) {
          await changeTreatmentItem(
            item.id,
            item.displayName,
            item.treatmentCode,
            item.duration
          );
        } else {
          await createTreatmentItem(
            item.displayName,
            item.treatmentCode,
            item.duration
          );
        }
        props.onConfirm();
      }}
      onCancel={() => {
        props.onCancel();
      }}
      confirmDisable={
        props.value &&
        props.value.treatmentCode == item.treatmentCode &&
        props.value.displayName == item.displayName &&
        props.value.duration == item.duration
      }
    >
      <div className="table">
        <div className="row">
          <div className="cell">
            <div>治療項目名稱</div>
          </div>
          <div className="cell">
            <div>治療代號</div>
          </div>
          <div className="cell">
            <div>治療時間</div>
          </div>
        </div>
        <div className="row">
          <div className="cell">
            <div className="container content">
              <div>
                <input
                  type="text"
                  onChange={handleDisplayNameChange}
                  value={item.displayName}
                />
              </div>
            </div>
          </div>
          <div className="cell">
            <div className="container content">
              <div>
                <input
                  type="text"
                  onChange={handleTreatmentCodeChange}
                  value={item.treatmentCode}
                />
              </div>
            </div>
          </div>
          <div className="cell">
            <div className="container content">
              <div className="duration">
                <select
                  value={Math.floor(item.duration / 60000)}
                  onChange={handleMinuteChange}
                >
                  {Array.from({ length: 60 }, (x, i) => i).map((v) => {
                    return (
                      <option key={"TSDia-min-" + v} value={v}>
                        {v}
                      </option>
                    );
                  })}
                </select>
                :
                <select
                  value={(item.duration / 1000) % 60}
                  onChange={handleSecondChange}
                >
                  {Array.from({ length: 60 }, (x, i) => i).map((v) => {
                    return (
                      <option key={"TSDia-sec-" + v} value={v}>
                        {v}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

interface IChangeTreatmentItemDiaProps {
  value: TreatmentItem | undefined;
  onConfirm: Function;
  onCancel: Function;
}

export default ChangeTreatmentItemDia;
