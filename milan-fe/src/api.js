// Tiny fetch wrapper for the Milan Aegis backend.
// In dev, Vite proxies /milan-aegis/* to http://localhost:5000.
// Backend exposes: /milan-aegis/api/{stats,alerts,summary,audit,logs/normalized}.
// This module fans those out into the higher-level shapes the screens expect.

const RAW_BASE = (import.meta.env.VITE_API_URL || "/milan-aegis/api").replace(/\/+$/, "");

async function request(path, opts = {}) {
  const res = await fetch(`${RAW_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

// Backend pre-formats event timestamps as "dd/MM HH:MM:SS". The screens pass
// these through new Date(...), so reconstruct an ISO-like string with the
// current year so Date parsing succeeds.
function parseBeTime(s) {
  if (!s || typeof s !== "string") return new Date().toISOString();
  const m = s.match(/^(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return s;
  const [, dd, mm, hh, mi, ss] = m;
  const yr = new Date().getFullYear();
  return `${yr}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

function severityFromScore(score) {
  const n = Number(score) || 0;
  if (n >= 90) return "critical";
  if (n >= 70) return "high";
  if (n >= 45) return "medium";
  return "low";
}

function mapAlerts(rawList) {
  return (rawList || []).map((a) => ({
    id: a.id,
    title: (a.event || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    user: a.user || "Unknown",
    source: a.system || "Unknown",
    severity: (a.severity || "medium").toLowerCase(),
    rationale: a.reason || "",
    status: (a.status || "pending").toLowerCase(),
    detected_at: parseBeTime(a.timestamp),
    riskScore: Number(a.riskScore) || 0,
  }));
}

// Cache the /summary response so Summary.jsx's three parallel calls
// (sources/policy/reports) don't hammer the server.
let _summaryPromise = null;
function fetchSummary() {
  if (!_summaryPromise) {
    _summaryPromise = request("/summary").catch((err) => {
      _summaryPromise = null;
      throw err;
    });
  }
  return _summaryPromise;
}

function parseLeadingInt(v) {
  const m = String(v ?? "").match(/-?\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

export const api = {
  // Endpoints that don't exist on the BE — return harmless empty shapes
  // so consumers don't throw.
  meta: () => Promise.resolve({ decision_state: {} }),
  home: () => Promise.resolve({}),
  emailReply: () => Promise.resolve({ ok: true }),
  adminDecision: () => Promise.resolve({ ok: true }),
  resetDecision: () => Promise.resolve({ ok: true }),

  // Alerts: raw list → { alerts: [...] } with FE field names.
  alerts: async () => {
    const list = await request("/alerts");
    return { alerts: mapAlerts(list) };
  },

  // Dashboard: compose stats + normalized logs + alerts into the shape
  // Dashboard.jsx expects.
  dashboard: async () => {
    const [stats, logs, alerts] = await Promise.all([
      request("/stats").catch(() => ({})),
      request("/logs/normalized").catch(() => []),
      request("/alerts").catch(() => []),
    ]);

    const kpis = {
      total_events: stats.totalEvents ?? 0,
      cleaned_records: stats.cleanedRecords ?? 0,
      duplicates_removed: stats.duplicatesRemoved ?? 0,
      anomalies_detected: stats.anomaliesDetected ?? 0,
    };

    // Login activity — bucket logs into 24 hourly slots from their iso timestamp.
    const buckets = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      count: 0,
    }));
    for (const ev of logs) {
      const iso = parseBeTime(ev.timestamp);
      const d = new Date(iso);
      if (!isNaN(d)) buckets[d.getHours()].count += 1;
    }

    // Risk distribution — count alerts by severity.
    const risk_distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const a of alerts) {
      const sev = (a.severity || "").toLowerCase();
      if (sev in risk_distribution) risk_distribution[sev] += 1;
    }

    // Event feed — latest 20 normalized events.
    const event_feed = (logs || []).slice(0, 20).map((ev) => ({
      id: ev.id,
      severity: severityFromScore(ev.riskScore),
      user: ev.user || "Unknown",
      type: (ev.event || "Unknown").toLowerCase(),
      timestamp: parseBeTime(ev.timestamp),
    }));

    return { kpis, login_activity: buckets, risk_distribution, event_feed };
  },

  // Summary screen — three parallel calls, all derive from /summary.
  sources: async () => {
    const s = await fetchSummary();
    return {
      sources: (s.sources || []).map((row, i) => ({
        id: `src-${i}`,
        name: row.label,
        events: parseLeadingInt(row.value),
        rationale: row.detail || "",
      })),
    };
  },

  policy: async () => {
    const s = await fetchSummary();
    return {
      policy: (s.policy || []).map((row, i) => ({
        id: `pol-${i}`,
        name: row.label,
        count: row.value,
        rationale: row.detail || "",
      })),
    };
  },

  reports: async () => {
    const s = await fetchSummary();
    return {
      reports: (s.reports || []).map((row, i) => ({
        id: `rep-${i}`,
        name: row.label,
        status: row.value,
        rationale: row.detail || "",
      })),
    };
  },

  audit: async () => {
    const list = await request("/audit").catch(() => []);
    const captured = (list || []).length;
    return {
      audit: {
        captured,
        label: `${captured} recorded ${captured === 1 ? "event" : "events"}`,
        items: list || [],
      },
    };
  },
};
