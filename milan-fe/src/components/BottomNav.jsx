import { useEffect, useState } from "react";
import { useAppShell } from "./AppShell.jsx";
import { api } from "../api";

// macOS-style app-icon SVGs: each is a self-contained 64x64 squircle
// with internal gradients, gloss highlight, and white iconography.

const SVG_BASE = {
  viewBox: "0 0 64 64",
  "aria-hidden": true,
  className: "dock-svg",
  xmlns: "http://www.w3.org/2000/svg",
};

function DashboardIcon() {
  return (
    <svg {...SVG_BASE}>
      <defs>
        <linearGradient id="dashBg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60A5FA" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="dashGloss" x1="0" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" ry="15" fill="url(#dashBg)" />
      <rect x="0" y="0" width="64" height="34" rx="15" ry="15" fill="url(#dashGloss)" />
      {/* Bars */}
      <rect x="14" y="36" width="7" height="14" rx="1.5" fill="#FFFFFF" />
      <rect x="25" y="28" width="7" height="22" rx="1.5" fill="#FFFFFF" />
      <rect x="36" y="22" width="7" height="28" rx="1.5" fill="#FFFFFF" />
      {/* Amber trend line */}
      <polyline
        points="12,30 22,22 32,26 52,12"
        stroke="#FBBF24"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="12" r="2.6" fill="#FBBF24" />
    </svg>
  );
}

function AlertsIcon() {
  return (
    <svg {...SVG_BASE}>
      <defs>
        <linearGradient id="alertBg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FB7185" />
          <stop offset="0.55" stopColor="#E11D48" />
          <stop offset="1" stopColor="#9F1239" />
        </linearGradient>
        <linearGradient id="alertGloss" x1="0" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" ry="15" fill="url(#alertBg)" />
      <rect x="0" y="0" width="64" height="34" rx="15" ry="15" fill="url(#alertGloss)" />
      {/* Bell body */}
      <path
        d="M16 46h32l-3.5-5.2a8 8 0 0 1-1.5-4.7V26.5a11 11 0 0 0-22 0V36.1a8 8 0 0 1-1.5 4.7L16 46z"
        fill="#FFFFFF"
      />
      {/* Bell knob */}
      <circle cx="32" cy="14" r="2.6" fill="#FFFFFF" />
      {/* Clapper */}
      <path d="M28 48 Q32 53 36 48 Z" fill="#FFFFFF" />
      {/* Yellow notification dot */}
      <circle cx="46" cy="20" r="5.2" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1.6" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg {...SVG_BASE}>
      <defs>
        <linearGradient id="sumBg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FCD34D" />
          <stop offset="0.55" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="sumGloss" x1="0" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" ry="15" fill="url(#sumBg)" />
      <rect x="0" y="0" width="64" height="34" rx="15" ry="15" fill="url(#sumGloss)" />
      {/* Document */}
      <path d="M14 12 H38 L50 24 V50 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 Z" fill="#FFFFFF" />
      {/* Folded corner */}
      <path d="M38 12 V24 H50 Z" fill="#FCD34D" />
      {/* Text lines */}
      <line x1="20" y1="32" x2="44" y2="32" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="38" x2="44" y2="38" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="44" x2="38" y2="44" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg {...SVG_BASE}>
      <defs>
        <linearGradient id="audBg" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#94A3B8" />
          <stop offset="0.55" stopColor="#475569" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="audGloss" x1="0" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.40" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="audGlass" cx="0.40" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.65" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#94A3B8" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" ry="15" fill="url(#audBg)" />
      <rect x="0" y="0" width="64" height="34" rx="15" ry="15" fill="url(#audGloss)" />
      {/* Handle */}
      <line
        x1="38"
        y1="38"
        x2="52"
        y2="52"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="38"
        x2="52"
        y2="52"
        stroke="#CBD5E1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Glass */}
      <circle cx="26" cy="26" r="14" fill="url(#audGlass)" stroke="#FFFFFF" strokeWidth="3" />
      {/* Glass reflection */}
      <ellipse cx="21" cy="21" rx="4" ry="2.4" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

const NAV = [
  { to: "/dashboard", label: "DASHBOARD", testid: "nav-dashboard", Icon: DashboardIcon },
  { to: "/alerts",    label: "ALERTS",    testid: "nav-alerts",    Icon: AlertsIcon },
  { to: "/summary",   label: "SUMMARY",   testid: "nav-summary",   Icon: SummaryIcon },
  { to: "/audit",     label: "AUDIT",     testid: "nav-audit",     Icon: AuditIcon },
];

export default function BottomNav() {
  const { activePath, toggleTab } = useAppShell();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .alerts()
      .then((d) => {
        if (alive) setAlertCount((d.alerts || []).length);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <nav
      id="taskbar"
      className="bottom-nav"
      aria-label="Primary navigation"
      data-testid="taskbar"
    >
      <div id="dock-modules" className="dock-modules">
        {NAV.map(({ to, label, testid, Icon }) => {
          const isActive = activePath === to;
          const slug = to.replace(/^\//, "");
          const isAlerts = to === "/alerts";
          const showBadge = isAlerts && alertCount > 0;
          return (
            <button
              key={to}
              id={`nav-${slug}-btn`}
              type="button"
              data-testid={testid}
              aria-label={label}
              aria-pressed={isActive}
              title={label}
              className={`nav-btn nav-btn-${slug}${isActive ? " active" : ""}`}
              onClick={(e) =>
                toggleTab(to, e.currentTarget.getBoundingClientRect())
              }
            >
              <span className="dock-tile" aria-hidden>
                <Icon />
                {showBadge && (
                  <span className="dock-badge" aria-hidden>
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </span>
              <span className="dock-label sr-only">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
