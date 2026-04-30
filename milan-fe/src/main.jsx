import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

// HashRouter keeps every route inside the URL hash (e.g. /#/dashboard).
// The hash never reaches the server, so the static host never sees an
// unknown path and never returns a 404. This makes the SPA portable
// across any static host (Render, GitHub Pages, S3) with zero config.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
