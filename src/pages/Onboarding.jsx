import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { normalizeE164 } from "../lib/phone";

export default function Onboarding({ user, onSaved }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setErr("");
    const n1 = normalizeE164(a);
    const n2 = normalizeE164(b);

    if (!n1 || !n2) return setErr("Enter a valid phone number in international format (E.164), e.g. +40754051112.");
    if (n1 !== n2) return setErr("Numbers don’t match.");
    if (!agree) return setErr("Please confirm your forwarding number.");

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, forward_to: n1 }, { onConflict: "id" })
        .select()
        .maybeSingle();

      if (error) throw error;
      onSaved(data);
    } catch (e) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Set your forwarding number</h2>
      <p className="muted">Calls to your GhostNumber will be forwarded to this phone.</p>

      <div className="form">
        <label>Forwarding number</label>
        <input value={a} onChange={(e) => setA(e.target.value)} placeholder="+40 754 051 112" />

        <label>Confirm forwarding number</label>
        <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Re-enter the same number" />

        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I confirm this is my correct forwarding number.</span>
        </label>

        <div className="warn">
          <strong>Important:</strong> Please double-check your number. If it’s entered incorrectly, calls may not reach you.
          Once a number is provisioned and used, refunds may not be available.
        </div>

        {err ? <div className="error">{err}</div> : null}

        <button className="btn primary" onClick={save} disabled={loading}>
          {loading ? "Saving…" : "Save forwarding number"}
        </button>
      </div>
    </div>
  );
}
