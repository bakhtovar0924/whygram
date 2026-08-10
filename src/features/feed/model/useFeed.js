import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPosts,
  getComments,
  getLikesByUser,
  getStories,
} from "../../../entities/post/api/postsApi";
import { groupStoriesByUser } from "../../../shared/lib/groupStories";
import { useAuth } from "../../../features/auth/AuthContext";

export function useFeed(user) {
  const [posts, setPosts] = useState([]);
  const [storyGroups, setStoryGroups] = useState([]);
  const [myLikeIds, setMyLikeIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasDataRef = useRef(false);
  const { followingIds } = useAuth();

  const sortByFollowing = (arr) =>
    [...arr].sort((a, b) => {
      const aU = String(a.userId || a.user?.id || "");
      const bU = String(b.userId || b.user?.id || "");
      const aFollowed = followingIds.has(aU);
      const bFollowed = followingIds.has(bU);
      if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const reload = useCallback(async () => {
    if (!hasDataRef.current) setLoading(true);
    setError("");
    try {
      const [postsData, likesData, storiesData] = await Promise.all([
        getPosts(),
        user?.id ? getLikesByUser(user.id) : Promise.resolve([]),
        getStories(),
      ]);

      const list = Array.isArray(postsData) ? postsData : [];
      const likes = Array.isArray(likesData) ? likesData : [];
      const stories = Array.isArray(storiesData) ? storiesData : [];

      const likeMap = {};
      for (const like of likes) {
        likeMap[like.postId] = like.id;
      }
      setMyLikeIds(likeMap);

      const withComments = await Promise.all(
        list.map(async (post) => {
          try {
            const comments = await getComments(post.id);
            return {
              ...post,
              comments: Array.isArray(comments) ? comments : [],
              isLiked: Boolean(likeMap[post.id]),
            };
          } catch {
            return {
              ...post,
              comments: post.comments || [],
              isLiked: Boolean(likeMap[post.id]),
            };
          }
        })
      );

      hasDataRef.current = true;
      setPosts(sortByFollowing(withComments));

      const grouped = groupStoriesByUser(stories, user).sort((a, b) => {
        if (a.isOwn !== b.isOwn) return a.isOwn ? -1 : 1;
        const aU = String(a.userId || a.username || "");
        const bU = String(b.userId || b.username || "");
        const aFollowed = followingIds.has(aU);
        const bFollowed = followingIds.has(bU);
        if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;
        return 0;
      });
      setStoryGroups(grouped);
    } catch (err) {
      console.error(err);
      setPosts([]);
      setStoryGroups(groupStoriesByUser([], user));
      setError("Не удалось загрузить ленту");
    } finally {
      setLoading(false);
    }
  }, [user, followingIds]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    posts,
    setPosts,
    storyGroups,
    setStoryGroups,
    myLikeIds,
    setMyLikeIds,
    loading,
    error,
    reload,
  };
}
