function topItems(items, key, limit = 5) {
  const counts = items.reduce((map, item) => {
    const value = item[key] || 'unknown'
    map.set(value, (map.get(value) || 0) + 1)
    return map
  }, new Map())

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function hourFromTimestamp(timestamp) {
  const match = String(timestamp).match(/\b([01]?\d|2[0-3]):\d{2}/)
  return match ? Number(match[1]) : 12
}

export default function Insights({ processedData, alerts }) {
  const hourCounts = processedData.reduce((map, row) => {
    const hour = hourFromTimestamp(row.timestamp)
    map.set(hour, (map.get(hour) || 0) + 1)
    return map
  }, new Map())

  const peakHour = [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [0, 0]
  const topUsers = topItems(processedData, 'user')
  const topSystems = topItems(processedData, 'system')
  const unusualPatterns = [
    `${alerts.filter(alert => /off-hours/.test(alert.reason)).length} off-hours events flagged`,
    `${alerts.filter(alert => /failed|denied/.test(alert.reason)).length} failed or denied access patterns`,
    `${alerts.filter(alert => /privileged|compliance/.test(alert.reason)).length} privileged or compliance-sensitive events`,
  ]

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-tag">Analysis Insights</div>
        <div className="page-title">Insights Panel</div>
        <div className="page-desc">Summary patterns inferred from the analyzed security log baseline.</div>
      </div>

      <div className="insights-grid">
        <div className="card insight-card">
          <div className="card-title">Peak Login Hours</div>
          {peakHour[1] > 0 ? (
            <>
              <div className="insight-number">{String(peakHour[0]).padStart(2, '0')}:00</div>
              <p>{peakHour[1]} events occurred during this hour.</p>
            </>
          ) : (
            <p className="empty-state-inline">No login data available.</p>
          )}
        </div>

        <div className="card insight-card">
          <div className="card-title">Top Users</div>
          {topUsers.map(([user, count]) => (
            <div key={user} className="rank-row">
              <span>{user}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="card insight-card">
          <div className="card-title">Top Systems</div>
          {topSystems.map(([system, count]) => (
            <div key={system} className="rank-row">
              <span>{system}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="card insight-card">
          <div className="card-title">Unusual Patterns</div>
          {unusualPatterns.map(pattern => (
            <div key={pattern} className="pattern-row">{pattern}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
