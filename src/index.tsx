import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "@picocss/pico/css/pico.min.css";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.documentElement.setAttribute("data-theme", "dark");
