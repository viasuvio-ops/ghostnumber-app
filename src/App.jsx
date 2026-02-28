import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

function Topbar({ user, onSignOut, page, setPage }) {
  return (
    <div className="topbar">
      <div className="brand">👻 GhostNumber</div>
      {user ? (
        <div className="topbar-right">
          <div className="seg">
            <button className={page === "dashboard" ? "seg-active" : ""} onClick={() => setPage("dashboard")}>Dashboard</button>
            <button className={page === "settings" ? "seg-active" : ""} onClick={() => setPage("settings")}>Settings</button>
          </div>
          <button className="btn ghost" onClick={onSignOut}>Sign out</button>
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("dashboard");
  const user = session?.user || null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const needsOnboarding = useMemo(() => {
    if (!user) return false;
    // no profile or no forward_to => onboarding
    return !profile?.forward_to;
  }, [user, profile]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    (async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, forward_to")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) setProfile(data || null);
      setLoadingProfile(false);
    })();
  }, [user]);

  async function onSignOut() {
    await supabase.auth.signOut();
  }

  if (!user) return <Auth />;

  return (
    <div className="app">
      <Topbar user={user} onSignOut={onSignOut} page={page} setPage={setPage} />
      <div className="container">
        {loadingProfile ? <div className="card">Loading…</div> : null}

        {needsOnboarding ? (
          <Onboarding user={user} onSaved={(p) => setProfile(p)} />
        ) : (
          <>
            {page === "dashboard" ? <Dashboard session={session} profile={profile} /> : null}
            {page === "settings" ? <Settings user={user} profile={profile} onSaved={(p) => setProfile(p)} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
