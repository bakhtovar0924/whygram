import api from "../../../shared/api/axios";

export async function getPosts() {
  const res = await api.get("/posts");
  return res.data;
}

export async function createPost(postData) {
  const res = await api.post("/posts", postData);
  return res.data;
}

export async function getComments(postId) {
  const res = await api.get(`/comments?postId=${postId}`);
  return res.data;
}

export async function addComment(postId, text, username, userId) {
  const res = await api.post("/comments", {
    id: `c_${Date.now()}`,
    postId,
    userId: userId || null,
    username,
    text,
    createdAt: new Date().toISOString(),
  });
  return res.data;
}

export async function getLikes(postId) {
  const res = await api.get(`/likes?postId=${postId}`);
  return res.data;
}

export async function getLikesByUser(userId) {
  const res = await api.get(`/likes?userId=${userId}`);
  return res.data;
}

export async function addLike(postId, userId) {
  const res = await api.post("/likes", {
    id: `like_${postId}_${userId}_${Date.now()}`,
    postId,
    userId,
  });
  return res.data;
}

export async function removeLike(likeId) {
  await api.delete(`/likes/${likeId}`);
}

export async function patchPost(postId, data) {
  const res = await api.patch(`/posts/${postId}`, data);
  return res.data;
}

export async function getStories() {
  const res = await api.get("/stories");
  return res.data;
}

export async function createStory(storyData) {
  const res = await api.post("/stories", storyData);
  return res.data;
}

export async function deleteStory(storyId) {
  await api.delete(`/stories/${storyId}`);
}
