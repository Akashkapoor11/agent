import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

// Path-based routing under /Milan-aegis-fe/. Nginx may rewrite the prefix away
// in the container; in that case BASE_NAME stays correct because window.location
// already includes the public path during local dev.
const BASE_NAME = (import.meta.env.BASE_URL || "/Milan-aegis-fe/").replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={BASE_NAME}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
