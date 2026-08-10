export function formatCount(n) {
  if (n == null) return "0";
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
