import { useEffect, useState } from "react";
import { api } from "../api";
import PageHeader from "../components/PageHeader.jsx";
import AnalyzedBadge from "../components/AnalyzedBadge.jsx";

// Semantic colors sourced from CentificAI guideline tokens.
const DONUT_COLORS = {
  low: "#16A34A",     // --success
  medium: "#22D3EE",  // --cyan
  high: "#E4902E",    // --warning
  critical: "#DC2626", // --error
};

function Donut({ data }) {
  const entries = [
    { key: "low", label: "Low", value: data.low },
    { key: "medium", label: "Medium", value: data.medium },
    { key: "high", label: "High", value: data.high },
    { key: "critical", label: "Critical", value: data.critical },
  ];
  const total = entries.reduce((s, e) => s + e.value, 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = entries.map((e) => {
    const len = total ? (e.value / total) * circumference : 0;
    const seg = (
      <circle
        key={e.key}
        r={radius}
        cx="70"
        cy="70"
        fill="transparent"
        stroke={DONUT_COLORS[e.key]}
        strokeWidth="18"
        strokeDasharray={`${len} ${circumference - len}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 70 70)"
      />
    );
    offset += len;
    return seg;
  });

  return (
    <div className="donut">
      <svg className="donut-svg" viewBox="0 0 140 140">
        <circle
          r={radius}
          cx="70"
          cy="70"
          fill="transparent"
          stroke="#F1F5F9"
          strokeWidth="18"
        />
        {total > 0 && segments}
      </svg>
      <div className="donut-legend">
        {entries.map((e) => (
          <div className="row" key={e.key}>
            <div className="left">
              <span className="swatch" style={{ background: DONUT_COLORS[e.key] }} />
              <span>{e.label}</span>
            </div>
            <span className="count">{e.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div id="login-activity-chart-wrap">
      <div
        id="login-activity-chart"
        className="bar-chart"
        data-testid="chart-login-activity"
      >
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          const empty = d.count === 0;
          return (
            <div
              key={d.hour}
              id={`login-activity-bar-${d.hour.replace(/[^0-9]/g, "")}`}
              className={`bar${empty ? " empty" : ""}`}
              style={{ height: `${pct}%` }}
              title={`${d.hour} — ${d.count} events`}
            />
          );
        })}
      </div>
      <div className="bar-axis">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}

function fmtRowTime(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}:${ss}`;
}

function dotClass(severity) {
  if (severity === "low") return "ok";
  if (severity === "medium") return "info";
  if (severity === "high") return "warn";
  if (severity === "critical") return "fail";
  return "ok";
}

function statusFromType(type, severity) {
  const t = (type || "").toLowerCase();
  if (t.includes("fail") || t.includes("block") || t.includes("violat") || severity === "critical") {
    return "Failed";
  }
  return "Success";
}

// SCR-002-DASHBOARD — Log Analysis Metrics
export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.dashboard().then(setData).catch(() => setData(null));
  }, []);

  if (!data) {
    return <div className="empty-state">Loading analyzed baseline…</div>;
  }

  const { kpis, login_activity, risk_distribution, event_feed } = data;

  return (
    <div id="dashboard-screen" data-testid="screen-dashboard">
      <PageHeader
        idPrefix="dashboard"
        pill="Log Analysis"
        title="Dashboard"
        subtitle="Metrics, charts, and event feed from the analyzed security log baseline."
      />

      <div id="dashboard-kpi-grid" className="kpi-grid">
        <div id="kpi-total-events" className="kpi-tile" data-testid="kpi-total-events">
          <div className="label">Total Events</div>
          <div className="value">{kpis.total_events}</div>
          <div className="caption">Analyzed records</div>
        </div>
        <div id="kpi-cleaned-records" className="kpi-tile" data-testid="kpi-cleaned-records">
          <div className="label">Cleaned Records</div>
          <div className="value">{kpis.cleaned_records}</div>
          <div className="caption">Normalized schema</div>
        </div>
        <div id="kpi-duplicates-removed" className="kpi-tile" data-testid="kpi-duplicates-removed">
          <div className="label">Duplicates Removed</div>
          <div className="value">{kpis.duplicates_removed}</div>
          <div className="caption">Exact duplicates</div>
        </div>
        <div
          id="kpi-anomalies-detected"
          className={`kpi-tile ${kpis.anomalies_detected ? "warn" : ""}`}
          data-testid="kpi-anomalies"
        >
          <div className="label">Anomalies Detected</div>
          <div className="value">{kpis.anomalies_detected}</div>
          <div className="caption">Risk score at least 45</div>
        </div>
      </div>

      <div id="dashboard-charts-row" className="charts-row">
        <div id="login-activity-card" className="card">
          <div className="card-row">
            <div>
              <h3 className="card-title">Login Activity</h3>
              <div className="card-subtitle">24-hour window across the analyzed baseline</div>
            </div>
          </div>
          <BarChart data={login_activity} />
        </div>
        <div id="risk-distribution-card" className="card">
          <div className="card-row">
            <div>
              <h3 className="card-title">Risk Distribution</h3>
              <div className="card-subtitle">Low / Medium / High / Critical</div>
            </div>
          </div>
          <div id="risk-distribution-chart" data-testid="chart-risk-distribution">
            <Donut data={risk_distribution} />
          </div>
        </div>
      </div>

      <div
        id="event-feed-card"
        className="card event-feed"
        style={{ marginTop: 16 }}
        data-testid="card-event-feed"
      >
        <div className="card-row">
          <div>
            <h3 className="card-title">Event Feed</h3>
            <div className="card-subtitle">Latest normalized security events</div>
          </div>
          <AnalyzedBadge id="event-feed-analyzed-badge" />
        </div>
        {event_feed.length === 0 ? (
          <div id="event-feed-empty" className="empty-state">No normalized events to surface in this batch.</div>
        ) : (
          <div id="event-feed-list" className="event-list">
            {event_feed.map((e) => (
              <div
                key={e.id}
                id={`event-row-${e.id}`}
                className="event-row"
                data-testid={`event-row-${e.id}`}
              >
                <span className={`event-dot ${dotClass(e.severity)}`} aria-hidden />
                <div className="event-body">
                  <div className="user">{e.user}</div>
                  <div className="meta">
                    {e.type} / {statusFromType(e.type, e.severity)} / {e.severity}
                  </div>
                </div>
                <span className="time">{fmtRowTime(e.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
