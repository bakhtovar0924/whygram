export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

export function fuzzyScore(query, text) {
  const q = String(query || "").trim().toLowerCase();
  const t = String(text || "").trim().toLowerCase();
  if (!q) return null;
  if (!t) return null;

  if (t === q) return 1.2;
  if (t.startsWith(q)) return 1.0;
  if (t.includes(q)) return 0.9;

  const a = q.length > 40 ? q.slice(0, 40) : q;
  const b = t.length > 60 ? t.slice(0, 60) : t;

  const dist = levenshtein(a, b);
  const maxDist = Math.max(1, Math.round(a.length / 3));
  if (dist <= maxDist) {
    return Math.max(0.15, 1 - dist / Math.max(a.length, 1) - 0.05);
  }

  let ti = 0;
  let matched = 0;
  for (let i = 0; i < a.length && ti < b.length; i++) {
    const found = b.indexOf(a[i], ti);
    if (found === -1) break;
    matched += 1;
    ti = found + 1;
  }
  if (a.length >= 3 && matched >= a.length - 1) return 0.25;

  return null;
}