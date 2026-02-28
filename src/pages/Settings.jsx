import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { normalizeE164 } from "../lib/phone";

export default function Settings({ user, profile, onSaved }) {
  const [a, setA] = useState(profile?.forward_to || "");
  const [b, setB] = useState(profile?.forward_to || "");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setMsg("");
    const n1 = normalizeE164(a);
    const n2 = normalizeE164(b);

    if (!n1 || !n2) return setMsg("Enter a valid phone number in E.164, e.g. +40754051112.");
    if (n1 !== n2) return setMsg("Numbers don’t match.");
    if (!agree) return setMsg("Please confirm your forwarding number.");

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, forward_to: n1 }, { onConflict: "id" })
        .select()
        .maybeSingle();

      if (error) throw error;
      onSaved(data);
      setMsg("Saved.");
    } catch (e) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Settings</h2>
      <p className="muted">Update where calls should be forwarded.</p>

      <div className="form">
        <label>Forwarding number</label>
        <input value={a} onChange={(e) => setA(e.target.value)} placeholder="+40754051112" />

        <label>Confirm forwarding number</label>
        <input value={b} onChange={(e) => setB(e.target.value)} placeholder="Re-enter the same number" />

        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I confirm this is my correct forwarding number.</span>
        </label>

        <div className="warn">
          <strong>Important:</strong> If the number is incorrect, calls may not reach you.
        </div>

        <button className="btn primary" onClick={save} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </button>

        {msg ? <div className="notice">{msg}</div> : null}
      </div>
    </div>
  );
}
