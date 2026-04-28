import { useMemo, useState, useEffect } from 'react'
import TopBar from './components/TopBar.jsx'
import Taskbar from './components/Taskbar.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import Dashboard from './components/pages/Dashboard.jsx'
import Alerts from './components/pages/Alerts.jsx'
import Insights from './components/pages/Insights.jsx'
import AuditLog from './components/pages/AuditLog.jsx'
import ReadOnlyPanel from './components/pages/ReadOnlyPanel.jsx'
import ProfileModal from './components/modals/ProfileModal.jsx'
import NotificationPanel from './components/modals/NotificationPanel.jsx'
import AlertDetailModal from './components/modals/AlertDetailModal.jsx'

const currentUser = 'IT Admin'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [alerts, setAlerts] = useState([])
  const [analyzedLogs, setAnalyzedLogs] = useState([])
  const [analysisStats, setAnalysisStats] = useState({ totalEvents: 0, cleanedRecords: 0, duplicatesRemoved: 0, anomaliesDetected: 0 })
  const [auditEntries, setAuditEntries] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const safeFetch = (url, fallback) =>
      fetch(url).then(res => { if (!res.ok) throw new Error(res.status); return res.json(); }).catch(err => { console.error(`Fetch failed: ${url}`, err); return fallback; });

    Promise.all([
      safeFetch(`${apiUrl}/api/alerts`, []),
      safeFetch(`${apiUrl}/api/logs/normalized`, []),
      safeFetch(`${apiUrl}/api/stats`, null),
      safeFetch(`${apiUrl}/api/audit`, [])
    ]).then(([alertsData, logsData, statsData, auditData]) => {
      if (!statsData) setApiError(true)
      setAlerts(alertsData || [])
      setAnalyzedLogs(logsData || [])
      setAnalysisStats(statsData || { totalEvents: 0, cleanedRecords: 0, duplicatesRemoved: 0, anomaliesDetected: 0 })
      setAuditEntries(auditData || [])
      setLoading(false)
    })
  }, [])

  const pendingAlerts = useMemo(() => (
    alerts.filter(alert => alert.status === 'pending' || alert.status === 'open')
  ), [alerts])

  function renderView() {
    switch (activeView) {
      case 'home':
        return <HomeScreen stats={analysisStats} alerts={alerts} processedData={analyzedLogs} />
      case 'alerts':
        return <Alerts alerts={alerts} onSelectAlert={setSelectedAlert} />
      case 'insights':
        return <Insights processedData={analyzedLogs} alerts={alerts} />
      case 'sources':
        return (
          <ReadOnlyPanel
            tag="Source Analysis"
            title="Sources"
            description="Read-only health summary for systems represented in the analyzed log baseline."
            items={[
              { label: 'Identity', value: '3 events', detail: 'Primary source of access and login anomalies.' },
              { label: 'Endpoint', value: '2 events', detail: 'Threat and policy findings are concentrated here.' },
              { label: 'SSO', value: '1 event', detail: 'Impossible travel activity was blocked.' },
              { label: 'ERP', value: '1 event', detail: 'No active anomaly pattern in the sampled baseline.' },
            ]}
          />
        )
      case 'reports':
        return (
          <ReadOnlyPanel
            tag="Reports"
            title="Reports"
            description="Static summaries generated from the analyzed security activity."
            items={[
              { label: 'Daily Risk Summary', value: 'Ready', detail: '5 anomalies across 8 sampled security events.' },
              { label: 'Incident Summary', value: 'Ready', detail: 'Critical privileged login failure requires review.' },
              { label: 'Trend Summary', value: 'Ready', detail: 'Peak activity appears in the late morning analysis window.' },
            ]}
          />
        )
      case 'policy':
        return (
          <ReadOnlyPanel
            tag="Policy"
            title="Policy"
            description="Compliance and policy findings inferred from the analyzed log events."
            items={[
              { label: 'Policy Violations', value: '1', detail: 'Endpoint policy violation flagged for amit.patel@corp.in.' },
              { label: 'Privileged Events', value: '2', detail: 'Admin login and privilege change require periodic review.' },
              { label: 'Blocked Activity', value: '2', detail: 'SSO and endpoint controls blocked suspicious actions.' },
            ]}
          />
        )
      case 'users':
        return (
          <ReadOnlyPanel
            tag="User Analysis"
            title="Users"
            description="Read-only user risk summary from the analyzed log baseline."
            items={[
              { label: 'Highest Risk User', value: 'admin@corp.in', detail: 'Critical failed privileged login after hours.' },
              { label: 'Repeated Activity', value: 'priya.nair@corp.in', detail: 'Impossible travel plus repeated failed login.' },
              { label: 'Observed Users', value: '6', detail: 'Users represented across identity, endpoint, SSO, and ERP events.' },
            ]}
          />
        )
      case 'audit':
        return <AuditLog entries={auditEntries} />
      case 'dashboard':
      default:
        return <Dashboard processedData={analyzedLogs} alerts={alerts} stats={analysisStats} />
    }
  }

  if (loading) {
    return (
      <div className="desktop splash-screen">
        <div className="splash-orb" />
        <div className="splash-label">AEGIS · AI · AGENT</div>
        <div className="splash-sub">Loading security intelligence...</div>
      </div>
    )
  }

  return (
    <div className="desktop">
      <TopBar
        currentUser={currentUser}
        notifCount={pendingAlerts.length}
        onBellClick={() => setShowNotifications(true)}
        onProfileClick={() => setShowProfile(true)}
      />

      {apiError && (
        <div className="api-error-banner">
          ⚠ Unable to reach the backend. Displaying cached or empty data.
        </div>
      )}

      <div className="main-content">
        {renderView()}
      </div>

      <Taskbar activeView={activeView} onNavigate={setActiveView} />

      {showNotifications && (
        <NotificationPanel
          alerts={pendingAlerts}
          onClose={() => setShowNotifications(false)}
          onOpenAlerts={() => { setShowNotifications(false); setActiveView('alerts') }}
        />
      )}

      {showProfile && (
        <ProfileModal currentUser={currentUser} onClose={() => setShowProfile(false)} />
      )}

      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  )
}
