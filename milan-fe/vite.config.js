import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Redirect requests for the legacy /milan-fe/* base to the current
// /milan-aegis-fe/* path so existing bookmarks keep working.
function legacyBaseRedirect() {
  return {
    name: "legacy-base-redirect",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/milan-fe" || req.url.startsWith("/milan-fe/")) {
          const target = req.url.replace(/^\/milan-fe/, "/milan-aegis-fe");
          res.writeHead(302, { Location: target });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), legacyBaseRedirect()],
  base: process.env.BASE_PATH || "/milan-aegis-fe/",
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      "^/milan-aegis/.*": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    },
  },
});
