export default function AuditLog({ entries }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-tag">Analysis Audit</div>
        <div className="page-title">Audit Log</div>
        <div className="page-desc">Read-only trace of analysis refreshes, anomaly detection, and dashboard review activity.</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Workspace Activity</div>
            <div className="card-sub">{entries.length} audit events captured</div>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">No audit events recorded yet.</div>
        ) : (
          <div>
            {entries.map(entry => {
              const type = entry.type || 'process'
              return (
                <div key={entry.id || entry.audit_id} className="audit-row">
                  <div className={`audit-icon audit-${type}`}>{type.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div className="audit-title">{entry.title || entry.action_type || type}</div>
                    <div className="audit-detail">{entry.detail || entry.actor || ''}</div>
                  </div>
                  <div className="audit-time">{entry.timestamp || entry.action_timestamp || ''}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
