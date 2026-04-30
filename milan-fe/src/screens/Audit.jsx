import { useEffect, useState } from "react";
import { api } from "../api";
import PageHeader from "../components/PageHeader.jsx";

function MagnifierIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4" />
      <path d="m14.5 14.5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function SirenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 18a7 7 0 0 1 14 0v.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5z"
        fill="currentColor"
      />
      <path d="M12 4v3M6 6.5l1.6 2M18 6.5l-1.6 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="3.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14h4l1.5 2h5L16 14h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M12 4v8M9 9l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.5" r="3.7" fill="currentColor" />
      <path d="M5 20a7 7 0 0 1 14 0z" fill="currentColor" />
    </svg>
  );
}

const ICON_THEMES = {
  anomaly: { bg: "#EDE9FE", color: "#7C3AED", Icon: MagnifierIcon },
  detect:  { bg: "#EDE9FE", color: "#7C3AED", Icon: MagnifierIcon },
  alert:   { bg: "#FEE2E2", color: "#DC2626", Icon: SirenIcon },
  report:  { bg: "#FEF3C7", color: "#B45309", Icon: SirenIcon },
  ingest:  { bg: "#D1FAE5", color: "#059669", Icon: InboxIcon },
  login:   { bg: "#CFFAFE", color: "#0E7490", Icon: UserIcon },
};

function themeFor(type) {
  return ICON_THEMES[String(type || "").toLowerCase()] || ICON_THEMES.login;
}

function ActivityRow({ activity }) {
  const { Icon, bg, color } = themeFor(activity.type);
  return (
    <li id={`activity-${activity.id}`} className="activity-item">
      <span
        id={`activity-${activity.id}-icon`}
        className="activity-icon"
        style={{ background: bg, color }}
      >
        <Icon />
      </span>
      <div className="activity-text">
        <div id={`activity-${activity.id}-title`} className="activity-title">
          {activity.title}
        </div>
        <div id={`activity-${activity.id}-meta`} className="activity-meta">
          {activity.detail}
        </div>
      </div>
      <span id={`activity-${activity.id}-time`} className="activity-time">
        {activity.timestamp}
      </span>
    </li>
  );
}

// SCR-007-AUDIT — Workspace Activity Log
export default function Audit() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .audit()
      .then(setData)
      .catch(() => setData({ audit: { captured: 0, items: [] } }));
  }, []);

  if (!data) return <div className="empty-state">Loading audit…</div>;

  const items = data.audit?.items || [];

  return (
    <div id="audit-screen" data-testid="screen-audit">
      <PageHeader
        idPrefix="audit"
        pill="Analysis Audit"
        title="Audit Log"
        subtitle="Read-only trace of analysis refreshes, anomaly detection, and dashboard review activity."
      />

      <div
        id="workspace-activity-card"
        className="card"
        data-testid="card-workspace-activity"
      >
        <div className="card-row">
          <div>
            <h3 className="card-title">Workspace Activity</h3>
            <div className="card-subtitle">
              {data.audit?.label || `${items.length} recent events`}
            </div>
          </div>
        </div>
        {items.length === 0 ? (
          <div id="workspace-activity-empty" className="empty-state">
            No audit events recorded yet.
          </div>
        ) : (
          <ul id="workspace-activity-list" className="activity-list">
            {items.map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
