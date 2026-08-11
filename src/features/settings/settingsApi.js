import api from "../../shared/api/axios";

const from = (list, id) =>
  (Array.isArray(list) ? list : []).filter((x) => String(x.userId) === String(id));

const idsOf = (list) =>
  (Array.isArray(list) ? list : []).map((x) => x.id);

export async function deleteUserAccount(userId) {
  const id = String(userId);
  const [users, posts, likes, comments, follows, messages, stories] =
    await Promise.all([
      api.get("/users"),
      api.get("/posts"),
      api.get("/likes"),
      api.get("/comments"),
      api.get("/follows"),
      api.get("/messages"),
      api.get("/stories"),
    ]);

  const postIds = idsOf(from(posts.data, id));
  const storyIds = idsOf(from(stories.data, id));
  const likeIds = idsOf(from(likes.data, id));
  const commentIds = idsOf(from(comments.data, id));
  const followIds = (follows.data || [])
    .filter(
      (f) =>
        String(f.followerId) === id || String(f.followingId) === id
    )
    .map((f) => f.id);
  const messageIds = (messages.data || [])
    .filter((m) => String(m.from) === id || String(m.to) === id)
    .map((m) => m.id);

  const deletes = [
    ...postIds.map((x) => api.delete(`/posts/${x}`)),
    ...storyIds.map((x) => api.delete(`/stories/${x}`)),
    ...likeIds.map((x) => api.delete(`/likes/${x}`)),
    ...commentIds.map((x) => api.delete(`/comments/${x}`)),
    ...followIds.map((x) => api.delete(`/follows/${x}`)),
    ...messageIds.map((x) => api.delete(`/messages/${x}`)),
  ];

  await Promise.allSettled(deletes);
  await api.delete(`/users/${id}`);
}