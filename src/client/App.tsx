import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import io from "socket.io-client";
import { Container, CssBaseline } from "@material-ui/core";
import { getTreatmentSites } from "./api/treatmentSites";
import { TreatmentItem, TreatmentSite } from "./types";
import { getTreatmentItems } from "./api/treatmentItems";

const CentralControlPage = React.lazy(
  () => import("./pages/CentralControlPage")
);

const App: React.FC = () => {

  const [treatmentSites, setTreatmentSites] = useState<TreatmentSite[]>([]);
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);

  async function updateTreatmentSites() {
    setTreatmentSites(await getTreatmentSites());
  }

  async function updateTreatmentItems() {
    setTreatmentItems(await getTreatmentItems());
  }

  let maintainSocket: SocketIOClient.Socket;

  useEffect(() => {
    updateTreatmentSites();
    updateTreatmentItems();
    console.log(treatmentSites);

  }, []);

  // if (loggedIn) {
    return (
      <div className="root">
        <CssBaseline />
        <main className="content">
          <Container maxWidth="lg">
            <React.Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => (
                    <CentralControlPage treatmentItems={treatmentItems} />
                  )}
                />
              </Switch>
            </React.Suspense>
          </Container>
        </main>
      </div>
    );
};

export default App;
