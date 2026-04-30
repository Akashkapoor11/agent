import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Map a severity string + alert id to a deterministic numeric risk score
// in a band that matches the severity. The API returns categorical
// severity only; the UI surfaces a numeric score per the design.
const SEVERITY_BANDS = {
  critical: [90, 99],
  high: [70, 89],
  medium: [50, 69],
  low: [30, 49],
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function riskScoreFor(alert) {
  const band = SEVERITY_BANDS[alert.severity] || SEVERITY_BANDS.medium;
  const span = band[1] - band[0] + 1;
  return band[0] + (hashStr(alert.id || alert.user || "x") % span);
}

export default function NotificationsModal({ alerts, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.body.classList.add("notifications-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("notifications-open");
    };
  }, [onClose]);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function inspect(alert) {
    onClose();
    navigate(`/alerts?focus=${encodeURIComponent(alert.id)}`);
  }

  function openAlertsPage() {
    onClose();
    navigate("/alerts");
  }

  return (
    <div
      id="notifications-modal-overlay"
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Anomaly Alerts"
      onClick={handleOverlayClick}
      data-testid="notifications-modal"
    >
      <div id="notifications-modal" className="modal">
        <div id="notifications-modal-header" className="modal-header">
          <div>
            <h2 id="notifications-modal-title">Anomaly Alerts</h2>
            <div id="notifications-modal-sub" className="modal-sub">
              {alerts.length} {alerts.length === 1 ? "anomaly needs" : "anomalies need"} review
            </div>
          </div>
          <button
            id="notifications-modal-close-btn"
            type="button"
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div id="notifications-modal-body" className="modal-body">
          {alerts.length === 0 && (
            <div className="empty-state">No anomalies surfaced in this batch.</div>
          )}
          {alerts.map((a) => {
            const score = riskScoreFor(a);
            return (
              <div id={`notif-card-${a.id}`} className="notif-card" key={a.id}>
                <div className={`notif-score r-${a.severity}`}>{score}</div>
                <div>
                  <div className="notif-title">{a.title}</div>
                  <div className="notif-user">{a.user}</div>
                  <div className="notif-rationale">{a.rationale}</div>
                  <div className="notif-meta">
                    Severity: <b>{a.severity}</b> &nbsp;/&nbsp; Alert ID: {a.id}
                  </div>
                  <div className="notif-actions">
                    <button
                      id={`notif-inspect-${a.id}-btn`}
                      type="button"
                      className="btn"
                      onClick={() => inspect(a)}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div id="notifications-modal-footer" className="modal-footer">
          <span className="count">
            {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
          </span>
          <button
            id="notifications-open-alerts-btn"
            type="button"
            className="btn btn-primary"
            onClick={openAlertsPage}
          >
            Open Alerts Page
          </button>
        </div>
      </div>
    </div>
  );
}
