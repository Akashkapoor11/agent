import { useEffect, useState } from "react";
import { api } from "../api";
import NotificationsModal from "./NotificationsModal.jsx";

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 2.25c-2.485 0-4.5 2.015-4.5 4.5v2.91L3 11.25v1.5h12v-1.5l-1.5-1.59V6.75c0-2.485-2.015-4.5-4.5-4.5zM9 15.75A1.5 1.5 0 0010.5 14.25h-3A1.5 1.5 0 009 15.75z"
        fill="currentColor"
      />
    </svg>
  );
}

const PREVIEW_COUNT = 2;

export default function NotificationsWidget() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api
      .alerts()
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => setAlerts([]));
  }, []);

  const total = alerts.length;
  const preview = alerts.slice(0, PREVIEW_COUNT);

  return (
    <>
      <button
        id="notifications-widget-btn"
        type="button"
        className="notif-widget"
        aria-label={`${total} notifications — open list`}
        data-testid="notifications-widget"
        onClick={() => setOpen(true)}
      >
        <div id="notifications-widget-header" className="notif-widget-header">
          <span className="notif-widget-icon">
            <BellIcon />
          </span>
          <span className="notif-widget-title">NOTIFICATIONS</span>
          <span id="notifications-count" className="notif-widget-count">{total}</span>
        </div>

        {preview.length > 0 && (
          <ul id="notifications-preview-list" className="notif-widget-list">
            {preview.map((a, i) => (
              <li
                id={`notifications-preview-${a.id}`}
                className="notif-widget-item"
                key={a.id}
              >
                <div className="notif-widget-item-text">
                  <div className="notif-widget-item-title">{a.title}</div>
                  <div className="notif-widget-item-sub">
                    {a.user} · {a.source}
                  </div>
                </div>
                <span className="notif-widget-index">
                  {i + 1}/{Math.min(total, PREVIEW_COUNT)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </button>

      {open && (
        <NotificationsModal alerts={alerts} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
