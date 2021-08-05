import React, {FC, useState} from "react";
import {deleteTreatmentItem} from "../../api/treatmentItems";
import { TreatmentItem } from "../../types";
import Card from "../share/card";

const ChangeTreatmentItemDia = React.lazy(
  () => import("./changeTreatmentItemDia")
);
const DeleteDia = React.lazy(() => import("../share/deleteDia"));

const TreatmentItemCard: FC<{ items: TreatmentItem[] }> = (props: {
  items: TreatmentItem[];
}) => {
  const [selectedTreatmentItem, setSelectedTreatmentItem] = useState<
    TreatmentItem | undefined
  >();
  const [changeTreatmentItemDia, setChangeTreatmentItemDia] = useState(false);
  const [deleteDia, setDeleteDia] = useState(false);
  const [deleteFunc, setDeleteFunc] = useState(() => async () => {});

  return (
    <div>
      <Card
        title="治療項目表"
        onAdd={() => {
          setSelectedTreatmentItem(undefined);
          setChangeTreatmentItemDia(true);
        }}
        headers={["治療項目名稱", "治療代號", "治療時間"]}
        values={props.items.map((item) => [
          item.displayName,
          item.treatmentCode,
          `${new Date(item.duration)
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${new Date(item.duration)
            .getSeconds()
            .toString()
            .padStart(2, "0")}`,
        ])}
        onItemChange={(item) => {
          setSelectedTreatmentItem(
            props.items.find(
              (treatmentItem) => treatmentItem.treatmentCode === item[1]
            )
          );
          setChangeTreatmentItemDia(true);
        }}
        onItemDelete={(item) => {
          setDeleteFunc(() => async () => {
            await deleteTreatmentItem(
              props.items.find(
                (treatmentItem) => treatmentItem.treatmentCode === item[1]
              )!.id
            );
          });
          setDeleteDia(true);
        }}
      />
      {changeTreatmentItemDia ? (
        <ChangeTreatmentItemDia
          value={selectedTreatmentItem}
          onCancel={() => {
            setChangeTreatmentItemDia(false);
          }}
          onConfirm={() => {
            setChangeTreatmentItemDia(false);
          }}
        />
      ) : null}
      {deleteDia ? (
        <DeleteDia
          onCancel={() => {
            setDeleteDia(false);
          }}
          onConfirm={async () => {
            await deleteFunc();
            setDeleteDia(false);
          }}
        />
      ) : null}
    </div>
  );
};

export default TreatmentItemCard;
