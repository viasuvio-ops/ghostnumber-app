export function normalizeE164(raw) {
  const s = String(raw || "").trim().replace(/^\+{2,}/, "+").replace(/\s+/g, "");
  if (!s) return null;

  // allow user input like 0754... for RO -> you can improve later; for now require +country
  if (!s.startsWith("+")) return null;
  if (!/^\+\d{8,15}$/.test(s)) return null;
  return s;
}
