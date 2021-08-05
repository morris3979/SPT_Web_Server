import React, { FC, Suspense } from "react";
const TreatmentItemCard = React.lazy(
  () => import("../component/TreatmentItemPage/treatmentItemCard")
);
import "../scss/pages/treatmentItemPage.scss";
import { TreatmentItem } from "../types";

const TreatmentItemPage: FC<{ treatmentItems: TreatmentItem[] }> = (props: {
  treatmentItems: TreatmentItem[];
}) => {
  let socket: SocketIOClient.Socket;

  return (
    <div>
      <div className="treatment-item-page">
        <Suspense fallback={<div>Loading...</div>}>
          <TreatmentItemCard items={props.treatmentItems} />
        </Suspense>
      </div>
    </div>
  );
};

export default TreatmentItemPage;
