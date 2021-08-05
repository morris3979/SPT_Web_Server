import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import io from "socket.io-client";
import { Container, CssBaseline } from "@material-ui/core";
import NavigationDrawer from "./component/App/NavigationDrawer";
import { getTreatmentSites } from "./api/treatmentSites";
import { TreatmentItem, TreatmentSite } from "./types";
import { getTreatmentItems } from "./api/treatmentItems";

const CentralControlPage = React.lazy(
  () => import("./pages/CentralControlPage")
);
const SortedPage = React.lazy(() => import("./pages/SortedPage"));
const BroadcastPage = React.lazy(() => import("./pages/BroadcastPage"));
const StationPage = React.lazy(() => import("./pages/StationPage"));
const MaintainPage = React.lazy(() => import("./pages/MaintainPage"));
const TreatmentItemPage = React.lazy(() => import("./pages/TreatmentItemPage"));
const WaitingListPage = React.lazy(() => import("./pages/WaitingListPage"));
const Login = React.lazy(() => import("./component/App/Login"));

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

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

    maintainSocket = io("/maintain");
    maintainSocket.on("update", () => {
      updateTreatmentSites();
      updateTreatmentItems();
    });
  }, []);

  // if (loggedIn) {
    return (
      <div className="root">
        <CssBaseline />
        <NavigationDrawer treatmentSites={treatmentSites} />
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
                <Route path="/sorted" component={SortedPage} />
                <Route path="/broadcast" component={BroadcastPage} />
                <Route
                  path="/treatmentSites/:siteId/:ids"
                  render={(props) => (
                    <StationPage
                      key={"stationPage-" + props.match.params.siteId}
                      siteId={Number(props.match.params.siteId)}
                      itemIds={props.match.params.ids
                        .split("&")
                        .map((id: string) => Number(id))}
                      displayNames={props.match.params.ids
                        .split("&")
                        .map(
                          (id: string) =>
                            treatmentItems.find(
                              (item) => item.id === Number(id)
                            )?.displayName
                        )
                        .join("&")}
                    />
                  )}
                />

                <Route
                  path="/maintain"
                  render={() => (
                    <MaintainPage treatmentSites={treatmentSites} />
                  )}
                />
                <Route
                  path="/treatmentitem"
                  render={() => (
                    <TreatmentItemPage treatmentItems={treatmentItems} />
                  )}
                />

                <Route
                  path="/WaitingnumberList"
                  render={() => (
                    <WaitingListPage treatmentSites={treatmentSites} />
                  )}
                />
              </Switch>
            </React.Suspense>
          </Container>
        </main>
      </div>
    );
  // } else {
  //   return (
  //     <Login
  //       onLoginSuccess={() => {
  //         setLoggedIn(true);
  //       }}
  //     />
  //   );
  // }
};

export default App;
