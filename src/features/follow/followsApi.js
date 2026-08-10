import api from "../../shared/api/axios";

export async function getFollowsByFollower(followerId) {
  const res = await api.get(`/follows?followerId=${followerId}`);
  return res.data;
}

export async function getFollowsByFollowing(userId) {
  const res = await api.get(`/follows?followingId=${userId}`);
  return res.data;
}

export async function followUser(followerId, followingId) {
  const res = await api.post("/follows", {
    id: `f_${Date.now()}`,
    followerId: String(followerId),
    followingId: String(followingId),
    createdAt: new Date().toISOString(),
  });
  return res.data;
}

export async function unfollowUser(followId) {
  await api.delete(`/follows/${followId}`);
}
