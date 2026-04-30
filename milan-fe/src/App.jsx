import { Navigate, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav.jsx";
import HomeWidgets from "./components/HomeWidgets.jsx";
import { AppShellProvider, AppWindow, useAppShell } from "./components/AppShell.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Alerts from "./screens/Alerts.jsx";
import Summary from "./screens/Summary.jsx";
import Audit from "./screens/Audit.jsx";

function Desktop() {
  const { atHome, phase } = useAppShell();
  const showWidgets = atHome && phase === "closed";
  return (
    <div id="home-desktop" className="home-blank" data-testid="screen-home">
      {showWidgets && <HomeWidgets />}
    </div>
  );
}

export default function App() {
  return (
    <AppShellProvider>
      <div id="app-root" className="app">
        <Desktop />
        <AppWindow>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={null} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AppWindow>
        <BottomNav />
      </div>
    </AppShellProvider>
  );
}
