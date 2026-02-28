export const API_BASE = import.meta.env.VITE_API_BASE || "https://api.ghostnumber.app";

export async function apiPost(path, accessToken, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify(body || {})
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return text;
}
