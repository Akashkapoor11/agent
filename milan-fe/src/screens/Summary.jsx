import { useEffect, useState } from "react";
import { api } from "../api";
import PageHeader from "../components/PageHeader.jsx";
import AnalyzedBadge from "../components/AnalyzedBadge.jsx";

// SCR-COMBINED-SUMMARY — Sources, Policy, and Reports stacked in one view.
export default function Summary() {
  const [sources, setSources] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    api.sources().then(setSources).catch(() => setSources({ sources: [] }));
    api.policy().then(setPolicy).catch(() => setPolicy({ policy: [] }));
    api.reports().then(setReports).catch(() => setReports({ reports: [] }));
  }, []);

  if (!sources || !policy || !reports) {
    return <div className="empty-state">Loading summary…</div>;
  }

  return (
    <div id="summary-screen" data-testid="screen-summary">
      <PageHeader
        idPrefix="summary"
        pill="Analysis Summary"
        title="Summary"
        subtitle="Sources health, policy findings, and report status — combined in one view."
      />

      <div id="sources-card" className="card">
        <div className="card-row">
          <div>
            <h3 className="card-title">Sources</h3>
            <div className="card-subtitle">
              Read-only health summary for systems represented in the analyzed log baseline.
            </div>
          </div>
          <AnalyzedBadge id="sources-analyzed-badge" />
        </div>
        <div id="sources-grid" className="tiles-grid">
          {sources.sources.map((s) => (
            <div
              key={s.id}
              id={`source-${s.id}`}
              className="tile"
              data-testid={`source-${s.id}`}
            >
              <div className="label">{s.name}</div>
              <div className="value">
                {s.events} {s.events === 1 ? "event" : "events"}
              </div>
              <div className="rationale">{s.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="policy-card" className="card" style={{ marginTop: 16 }}>
        <div className="card-row">
          <div>
            <h3 className="card-title">Policy Findings</h3>
            <div className="card-subtitle">
              Compliance and policy findings inferred from the analyzed log events.
            </div>
          </div>
          <AnalyzedBadge id="policy-analyzed-badge" />
        </div>
        <div id="policy-grid" className="tiles-grid">
          {policy.policy.map((p) => (
            <div
              key={p.id}
              id={`policy-${p.id}`}
              className="tile"
              data-testid={`policy-${p.id}`}
            >
              <div className="label">{p.name}</div>
              <div className="value">{p.count}</div>
              <div className="rationale">{p.rationale}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="reports-card" className="card" style={{ marginTop: 16 }}>
        <div className="card-row">
          <div>
            <h3 className="card-title">Reports</h3>
            <div className="card-subtitle">
              Static summaries generated from the analyzed security activity.
            </div>
          </div>
          <AnalyzedBadge id="reports-analyzed-badge" />
        </div>
        <div id="reports-grid" className="tiles-grid">
          {reports.reports.map((r) => (
            <div
              key={r.id}
              id={`report-${r.id}`}
              className="tile ready"
              data-testid={`report-${r.id}`}
            >
              <div className="report-head">
                <span
                  className="report-status-dot"
                  aria-label={r.status}
                  title={r.status}
                />
                <div className="label">{r.name}</div>
              </div>
              <div className="report-summary">{r.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
