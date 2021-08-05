import React, {FC, Suspense, useEffect, useState} from "react";
import {TreatmentItem, TreatmentSite} from "../types";
import io from "socket.io-client";
import {getTreatmentItems} from "../api/treatmentItems";
import {creatTreatmentSite} from "../api/treatmentSites";
import "../scss/pages/maintainPage.scss";

const IconButton = React.lazy(() => import("../component/share/iconButton"));
const SiteCard = React.lazy(() => import("../component/MaintainPage/siteCard"));
const SiteDia = React.lazy(() => import("../component/MaintainPage/siteDia"));

const MaintainPage: FC<{ treatmentSites: TreatmentSite[] }> = (props: {
  treatmentSites: TreatmentSite[];
}) => {
  const [siteDia, setSiteDia] = useState(false);
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);

  async function updateTreatmentItems() {
    setTreatmentItems(await getTreatmentItems());
  }

  let treatmentItemsSocket: SocketIOClient.Socket;

  useEffect(() => {
    updateTreatmentItems();

    treatmentItemsSocket = io("/treatmentItems");
    treatmentItemsSocket.on("update", () => updateTreatmentItems());
  }, []);

  return (
    <div className="maintain-page">
      <Suspense fallback={<div>Loading...</div>}>
        {props.treatmentSites.map((site) => (
          <SiteCard
            key={site.id + "card"}
            site={site}
            treatmentItems={treatmentItems}
          />
        ))}
      </Suspense>
      <div className="site-add-btn">
        <IconButton
          onClick={() => {
            setSiteDia(true);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
            />
          </svg>
        </IconButton>
      </div>
      {siteDia ? (
        <SiteDia
          onCancel={() => {
            setSiteDia(false);
          }}
          onConfirm={async (name: string) => {
            await creatTreatmentSite(name);
            //TODO: add fail method

            setSiteDia(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default MaintainPage;
