import { useEffect, useState } from "react";
import { api } from "../api";

// The dashboard is read-only; the only outbound action is an email reply.
// We surface a small panel that simulates that email reply (decision_channel)
// and lets the external Admin record the final decision so the dashboard can
// reflect the post-decision state on refresh (per spec sections 14, 17).
export default function DecisionPanel() {
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const m = await api.meta();
    setMeta(m);
  }

  useEffect(() => {
    load();
  }, []);

  async function reply(decision) {
    setBusy(true);
    try {
      await api.emailReply(decision);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function adminDecide(decision) {
    setBusy(true);
    try {
      await api.adminDecision(decision);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    try {
      await api.resetDecision();
      await load();
    } finally {
      setBusy(false);
    }
  }

  const reply_ = meta?.decision_state?.it_admin_reply;
  const final = meta?.decision_state?.final_decision;

  return (
    <div id="decision-panel" className="decision-card">
      <div id="decision-panel-heading" className="heading">Email reply — Accept / Reject</div>
      <div id="decision-panel-desc" className="desc">
        The dashboard is read-only. To accept or reject these findings, please
        reply by email to <b>milan.aegis@centific.com</b>. Use the buttons below
        to simulate the email reply and the external Admin's final decision so
        the dashboard reflects the post-decision state.
      </div>
      <div id="decision-panel-actions" className="actions">
        <button
          id="email-reply-accept-btn"
          className="btn accept"
          onClick={() => reply("Accept")}
          disabled={busy}
        >
          Email reply: Accept
        </button>
        <button
          id="email-reply-reject-btn"
          className="btn reject"
          onClick={() => reply("Reject")}
          disabled={busy}
        >
          Email reply: Reject
        </button>
        <button
          id="admin-decision-accept-btn"
          className="btn"
          onClick={() => adminDecide("Accept")}
          disabled={busy}
        >
          Admin records: Accept
        </button>
        <button
          id="admin-decision-reject-btn"
          className="btn"
          onClick={() => adminDecide("Reject")}
          disabled={busy}
        >
          Admin records: Reject
        </button>
        <button
          id="decision-reset-btn"
          className="btn"
          onClick={reset}
          disabled={busy}
        >
          Reset
        </button>
      </div>
      <div id="decision-panel-state" className="decision-state">
        IT Admin reply:{" "}
        {reply_ ? (
          <span id="email-reply-state">
            <b>{reply_.decision}</b> at {new Date(reply_.email_at).toLocaleString()}
          </span>
        ) : (
          <span id="email-reply-state">not yet sent</span>
        )}
        <span> · </span>
        Admin final decision:{" "}
        {final ? (
          <span id="admin-final-decision-state">
            <b>{final.decision}</b> at {new Date(final.recorded_at).toLocaleString()}
          </span>
        ) : (
          <span id="admin-final-decision-state">pending</span>
        )}
      </div>
    </div>
  );
}
