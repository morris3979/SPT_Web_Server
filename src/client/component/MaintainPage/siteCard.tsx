import React, { FC, useState, MouseEvent, useRef, useEffect } from "react";
import { TreatmentItem, TreatmentSeat, TreatmentSite } from "../../types";
import { deleteTreatmentSeat } from "../../api/treatmentSeats";
import {
  changeTreatmentSite,
  deleteTreatmentSite,
} from "../../api/treatmentSites";

const SiteDia = React.lazy(() => import("./siteDia"));
const ChangeTreatmentSeatDia = React.lazy(
  () => import("./changeTreatmentSeatDia")
);
const DeleteDia = React.lazy(() => import("../share/deleteDia"));
const Card = React.lazy(() => import("../share/card"));

const SiteCard: FC<{
  site: TreatmentSite;
  treatmentItems: TreatmentItem[];
}> = (props: { site: TreatmentSite; treatmentItems: TreatmentItem[] }) => {
  const [changeNameDialog, setChangeNameDialog] = useState(false);
  const [selectedTreatmentSeat, setSelectedTreatmentSeat] = useState<
    TreatmentSeat | undefined
  >();
  const [changeTreatmentSeatDia, setChangeTreatmentSeatDia] = useState(false);
  const [deleteDia, setDeleteDia] = useState(false);
  const [deleteFunc, setDeleteFunc] = useState(() => async () => {});

  useEffect(() => {
    setDeleteFunc(() => async () => {});
  }, [props.site]);

  return (
    <div>
      <Card
        title={props.site.name}
        onChange={(e: MouseEvent) => {
          e.stopPropagation();
          setChangeNameDialog(true);
        }}
        onDelete={(e: MouseEvent) => {
          e.stopPropagation();
          setDeleteFunc(() => async () => {
            await deleteTreatmentSite(props.site.id);
          });
          setDeleteDia(true);
        }}
        onAdd={() => {
          setSelectedTreatmentSeat(undefined);
          setChangeTreatmentSeatDia(true);
        }}
        headers={["座位號", "可做項目", "按鈕代碼"]}
        values={props.site.treatmentSeats!.map((seat, i) => [
          i + 1,
          seat.treatmentItems!.map((item) => item.treatmentCode).join(","),
          seat.buttonId,
        ])}
        onItemChange={(item) => {
          setSelectedTreatmentSeat(
            props.site.treatmentSeats!.find((_, i) => i === item[0] - 1)
          );
          setChangeTreatmentSeatDia(true);
        }}
        onItemDelete={(item) => {
          setDeleteFunc(() => async () => {
            await deleteTreatmentSeat(
              props.site.treatmentSeats!.find((_, i) => i === item[0] - 1)?.id!
            );
          });
          setDeleteDia(true);
        }}
      />
      {changeNameDialog ? (
        <SiteDia
          value={props.site.name}
          onCancel={() => {
            setChangeNameDialog(false);
          }}
          onConfirm={async (name: string) => {
            await changeTreatmentSite(props.site.id, name);
            //TODO: add fail method

            setChangeNameDialog(false);
          }}
        />
      ) : null}

      {changeTreatmentSeatDia ? (
        <ChangeTreatmentSeatDia
          siteId={props.site.id}
          treatmentItems={props.treatmentItems}
          value={selectedTreatmentSeat}
          onCancel={() => {
            setChangeTreatmentSeatDia(false);
          }}
          onConfirm={() => {
            setChangeTreatmentSeatDia(false);
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

export default SiteCard;
