export function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1000000)
    return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")} млн`;
  if (n >= 10000) return `${Math.floor(n / 1000)} тыс.`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} тыс.`;
  return String(n);
}
