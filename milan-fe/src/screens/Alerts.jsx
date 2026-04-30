import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import PageHeader from "../components/PageHeader.jsx";
import AnalyzedBadge from "../components/AnalyzedBadge.jsx";
import { riskScoreFor } from "../components/NotificationsModal.jsx";

function fmtTimestamp(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

const VALID_STATUSES = new Set(["pending", "approved", "dismissed"]);

function normalizeStatus(s) {
  const v = String(s || "").toLowerCase();
  return VALID_STATUSES.has(v) ? v : "pending";
}

// SCR-003-ALERTS — Anomaly Notifications (table view)
export default function Alerts() {
  const [data, setData] = useState(null);
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const focusRef = useRef(null);

  useEffect(() => {
    api
      .alerts()
      .then(setData)
      .catch(() => setData({ alerts: [] }));
  }, []);

  useEffect(() => {
    if (focusId && focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId, data]);

  const rows = useMemo(() => {
    if (!data?.alerts) return [];
    return data.alerts.map((a) => ({
      ...a,
      riskScore: riskScoreFor(a),
      status: normalizeStatus(a.status),
    }));
  }, [data]);

  if (!data) return <div className="empty-state">Loading alerts…</div>;

  return (
    <div id="alerts-screen" data-testid="screen-alerts">
      <PageHeader
        idPrefix="alerts"
        pill="Anomaly Review"
        title="Alerts"
        subtitle="Analyzed anomalies with risk scores, reasons, and review status."
      />

      <div id="alerts-card" className="card">
        <div className="card-row">
          <div>
            <h3 className="card-title">Anomaly Alerts</h3>
            <div className="card-subtitle">
              {rows.length} analyzed {rows.length === 1 ? "alert" : "alerts"}
            </div>
          </div>
          <AnalyzedBadge id="alerts-analyzed-badge" />
        </div>

        {rows.length === 0 ? (
          <div id="alerts-empty" className="empty-state">No anomalies surfaced in this batch.</div>
        ) : (
          <div id="alerts-table-wrap" className="alerts-table-wrap">
            <table id="alerts-table" className="alerts-table" data-testid="alerts-table">
              <thead>
                <tr>
                  <th id="alerts-th-timestamp">Timestamp</th>
                  <th id="alerts-th-user">User</th>
                  <th id="alerts-th-event">Event</th>
                  <th id="alerts-th-risk">Risk Score</th>
                  <th id="alerts-th-reason">Reason</th>
                  <th id="alerts-th-status">Status</th>
                </tr>
              </thead>
              <tbody id="alerts-tbody">
                {rows.map((a) => {
                  const isFocused = a.id === focusId;
                  return (
                    <tr
                      key={a.id}
                      id={`alert-row-${a.id}`}
                      ref={isFocused ? focusRef : undefined}
                      data-testid={`alert-row-${a.id}`}
                      style={
                        isFocused
                          ? { outline: "1px solid var(--primary)", outlineOffset: -1 }
                          : undefined
                      }
                    >
                      <td className="col-time">{fmtTimestamp(a.detected_at)}</td>
                      <td className="col-user">{a.user}</td>
                      <td className="col-event">{a.title}</td>
                      <td>
                        <span
                          id={`alert-risk-${a.id}`}
                          className={`risk-score r-${a.severity}`}
                        >
                          {a.riskScore}
                        </span>
                      </td>
                      <td className="col-reason">{a.rationale}</td>
                      <td>
                        <span
                          id={`alert-status-${a.id}`}
                          className={`status-pill ${a.status}`}
                          aria-label={`Status: ${a.status}`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
