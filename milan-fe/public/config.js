// Runtime config for the Milan Aegis frontend.
//
// Loaded by index.html before the main bundle, so window.MILAN_API_BASE
// is available when api.js initialises.
//
// Resolution rules:
//   - When the FE is served from a *.onrender.com host (Render Static Site),
//     there is no co-located backend on the same host. Call the paired
//     BE Web Service directly (cross-origin; CORS is wide-open on the BE).
//   - Anywhere else — Aegis K8s pipeline where nginx in milan-fe proxies
//     /milan-aegis/api/* to the milan-be Service, local Vite dev server
//     where the dev proxy forwards to localhost:5000, or any unified
//     reverse-proxy deploy — use the same-origin relative path. The
//     FE host's proxy layer forwards to the BE.
//
// Edit this file and redeploy if the Render BE URL ever changes.
(function () {
  var host = (typeof window !== "undefined" && window.location && window.location.hostname) || "";
  var onRender = host.endsWith(".onrender.com");
  window.MILAN_API_BASE = onRender
    ? "https://agent-3-1vtw.onrender.com/milan-aegis/api"
    : "/milan-aegis/api";
})();
