export default function Alerts({ alerts, onSelectAlert }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-tag">Anomaly Review</div>
        <div className="page-title">Alerts</div>
        <div className="page-desc">Analyzed anomalies with risk scores, reasons, and review status.</div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Anomaly Alerts</div>
            <div className="card-sub">{alerts.length} analyzed alerts</div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">No anomaly alerts detected in the analyzed baseline.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>System</th>
                  <th>Event</th>
                  <th>Risk Score</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(alert => (
                  <tr key={alert.id}>
                    <td style={{ fontSize: 11, color: 'var(--n4)' }}>{alert.timestamp}</td>
                    <td style={{ fontSize: 12 }}>{alert.user}</td>
                    <td><span className="sys-chip">{alert.system}</span></td>
                    <td style={{ fontSize: 12 }}>{alert.event}</td>
                    <td><strong style={{ color: alert.riskScore >= 70 ? 'var(--error)' : 'inherit' }}>{alert.riskScore}</strong></td>
                    <td style={{ fontSize: 12, minWidth: 190 }}>{alert.reason}</td>
                    <td><span className={`badge badge-${alert.status}`}>{alert.status}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => onSelectAlert(alert)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
