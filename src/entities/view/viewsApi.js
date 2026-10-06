import api from "../../shared/api/axios";

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function getPostViews(postId) {
  const res = await api.get(`/views?postId=${postId}`);
  return res.data || [];
}

export async function recordView({ postId, userId, username, avatar }) {
  const existing = await api.get(`/views?postId=${postId}&userId=${userId}`);
  if (Array.isArray(existing.data) && existing.data.length > 0) {
    return existing.data[0];
  }

  const res = await api.post("/views", {
    id: makeId("v"),
    postId,
    userId,
    username: username || "",
    avatar:
      avatar ||
      `https://i.pravatar.cc/150?u=${username || userId || "user"}`,
    viewedAt: new Date().toISOString(),
  });
  return res.data;
}

export async function deleteViewsForPost(postId) {
  const list = await getPostViews(postId);
  await Promise.allSettled(list.map((v) => api.delete(`/views/${v.id}`)));
  return list.length;
}