import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function Dashboard({ session, profile }) {
  const [apiStatus, setApiStatus] = useState("Checking…");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const pong = await apiGet("/ping");
        setApiStatus(pong || "OK");
      } catch {
        setApiStatus("API not reachable");
      }
    })();
  }, []);

  async function subscribe() {
    setMsg("");
    setLoading(true);
    try {
      // ensure fresh token
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const r = await apiPost("/create-checkout-session", token, {});
      if (!r?.url) throw new Error("Missing checkout URL");
      window.location.href = r.url;
    } catch (e) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>Dashboard</h2>
        <div className="row">
          <div>
            <div className="muted">API status</div>
            <div className="mono">{apiStatus}</div>
          </div>
          <div>
            <div className="muted">Forwarding to</div>
            <div className="mono">{profile?.forward_to || "Not set"}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Subscription</h3>
        <p className="muted">Subscribe to provision your GhostNumber automatically after payment.</p>
        <button className="btn primary" onClick={subscribe} disabled={loading}>
          {loading ? "Redirecting…" : "Subscribe"}
        </button>
        {msg ? <div className="notice">{msg}</div> : null}
      </div>

      <div className="card">
        <h3>Your numbers</h3>
        <p className="muted">Once provisioned, your GhostNumber(s) will show here.</p>
        <div className="muted">Coming next: list numbers + call logs.</div>
      </div>
    </div>
  );
}
