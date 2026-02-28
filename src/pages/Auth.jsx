import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) throw error;
        setMsg("Check your email to confirm your account (if email confirmation is enabled).");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center">
      <div className="card auth">
        <h1>Welcome to GhostNumber</h1>
        <p className="muted">Protect your personal number. Run your business with confidence.</p>

        <form onSubmit={submit} className="form">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" required />

          <button className="btn primary" disabled={loading}>
            {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        {msg ? <div className="notice">{msg}</div> : null}

        <div className="switch">
          {mode === "login" ? (
            <button className="link" onClick={() => setMode("signup")}>Create an account</button>
          ) : (
            <button className="link" onClick={() => setMode("login")}>Already have an account?</button>
          )}
        </div>
      </div>
    </div>
  );
}
