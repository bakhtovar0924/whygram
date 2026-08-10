import api from "../../../shared/api/axios";

export async function getMessages() {
  const res = await api.get("/messages");
  return Array.isArray(res.data) ? res.data : [];
}

export async function sendMessage({ from, to, text }) {
  const res = await api.post("/messages", {
    id: `m_${Date.now()}`,
    from: String(from),
    to: String(to),
    text,
    createdAt: new Date().toISOString(),
  });
  return res.data;
}
