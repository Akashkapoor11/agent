import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Phases:
//   closed  → no app window, desktop visible
//   opening → window mounted, scaled-down at icon, transitioning to full
//   open    → fully rendered
//   closing → animating shrink back toward icon, route still pointing at app
const HOME_PATHS = new Set(["/", "/home"]);
const ANIM_MS = 280;

const AppShellContext = createContext(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside AppShellProvider");
  return ctx;
}

function isHomePath(path) {
  return HOME_PATHS.has(path);
}

function rectToOrigin(rect) {
  return rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : null;
}

export function AppShellProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const atHome = isHomePath(location.pathname);

  const [phase, setPhase] = useState(atHome ? "closed" : "open");
  const [origin, setOrigin] = useState(null);
  const closeTimer = useRef(null);
  const openRaf = useRef(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (openRaf.current) cancelAnimationFrame(openRaf.current);
    },
    [],
  );

  // Reconcile phase with route changes that don't go through openTab/closeTab
  // (e.g. NotificationsModal calling navigate("/alerts") directly).
  useEffect(() => {
    if (atHome) {
      setPhase("closed");
      return;
    }
    setPhase((p) => {
      if (p === "open" || p === "opening" || p === "closing") return p;
      // Arrived at a non-home route from the closed state without an icon click.
      // Animate from viewport bottom-center as a sensible default origin.
      setOrigin({ x: window.innerWidth / 2, y: window.innerHeight - 60 });
      if (openRaf.current) cancelAnimationFrame(openRaf.current);
      openRaf.current = requestAnimationFrame(() => {
        openRaf.current = requestAnimationFrame(() => setPhase("open"));
      });
      return "opening";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const openTab = useCallback(
    (path, rect) => {
      const wasClosed = phase === "closed";
      const nextOrigin = rectToOrigin(rect);
      if (nextOrigin) setOrigin(nextOrigin);

      if (wasClosed) {
        // Mount the window in opening state, then RAF twice to flush styles
        // before transitioning to "open" — so the browser sees the small
        // initial transform and animates to full size.
        setPhase("opening");
        navigate(path);
        if (openRaf.current) cancelAnimationFrame(openRaf.current);
        openRaf.current = requestAnimationFrame(() => {
          openRaf.current = requestAnimationFrame(() => setPhase("open"));
        });
      } else {
        // Already open — switching from one app to another. Just navigate;
        // the window stays mounted at full size.
        navigate(path);
      }
    },
    [navigate, phase],
  );

  const closeTab = useCallback(
    (rect) => {
      const nextOrigin = rectToOrigin(rect);
      if (nextOrigin) setOrigin(nextOrigin);
      setPhase("closing");
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        navigate("/home");
      }, ANIM_MS);
    },
    [navigate],
  );

  const toggleTab = useCallback(
    (path, rect) => {
      if (location.pathname === path && !atHome) {
        closeTab(rect);
      } else if (location.pathname !== path) {
        openTab(path, rect);
      }
    },
    [atHome, closeTab, location.pathname, openTab],
  );

  return (
    <AppShellContext.Provider
      value={{
        phase,
        origin,
        activePath: location.pathname,
        atHome,
        toggleTab,
        closeTab,
        openTab,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
}

export function AppWindow({ children }) {
  const { phase, origin } = useAppShell();
  if (phase === "closed") return null;

  const style = origin
    ? {
        "--origin-x": `${origin.x}px`,
        "--origin-y": `${origin.y}px`,
      }
    : undefined;

  return (
    <div id="app-window" className={`app-window app-window-${phase}`} style={style}>
      <div id="app-window-inner" className="app-window-inner">{children}</div>
    </div>
  );
}
