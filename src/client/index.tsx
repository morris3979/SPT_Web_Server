import React from "react";
import { render } from "react-dom";
const App = React.lazy(() => import("./App"));
import "./scss/app";
import { BrowserRouter } from "react-router-dom";

render(
  <React.Suspense fallback={<div>Loading...</div>}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.Suspense>,
  document.getElementById("root") as HTMLElement
);
