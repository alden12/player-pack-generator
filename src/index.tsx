import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@fontsource-variable/google-sans-flex";
import "./index.css";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
