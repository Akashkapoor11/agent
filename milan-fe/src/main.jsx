import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/global.css";

// Clean URLs (no '#' in the path) via BrowserRouter. The basename is
// derived from import.meta.env.BASE_URL, which Vite sets to the build's
// `base` config:
//   - default '/' on Render Static Site / local Vite dev
//   - '/milan-aegis-fe/' when built with BASE_PATH for the Aegis K8s
//     pipeline (nginx in milan-fe mounts the SPA at that prefix).
//
// SPA fallback for direct deep-link navigation:
//   - nginx in milan-fe: handled by try_files ... @spa_fallback (see nginx.conf)
//   - Vite dev server: built-in SPA fallback
//   - Render Static Site: the build emits a sibling 404.html that is a
//     byte-for-byte copy of index.html, which Render serves for any
//     unknown path. The bundle then bootstraps and React Router routes.
const BASE_NAME = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={BASE_NAME}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
