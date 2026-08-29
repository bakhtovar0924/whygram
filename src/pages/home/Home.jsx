import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import useFeed from "../../features/feed/useFeed";
import {
  addComment,
  addLike,
  removeLike,
  patchPost,
  deleteStory,
} from "../../entities/post/postsApi";
import StoriesBar from "../../widgets/stories/stories-bar/StoriesBar";
import StoryViewer from "../../widgets/stories/story-viewer/StoryViewer";
import AddStoryModal from "../../widgets/stories/add-story-modal/AddStoryModal";
import PostCard from "../../widgets/posts/post-card/PostCard";
import CommentsModal from "../../widgets/posts/comments-modal/CommentsModal";

const Home = function Home() {
  const { user } = useAuth();
  const {
    posts,
    setPosts,
    storyGroups,
    setStoryGroups,
    myLikeIds,
    setMyLikeIds,
    loading,
    error,
    reload,
  } = useFeed(user);

  const [commentInputs, setCommentInputs] = useState({});
  const [hiddenIds, setHiddenIds] = useState([]);
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [addStoryOpen, setAddStoryOpen] = useState(false);

  useEffect(() => {
    const onFeedRefresh = () => reload();
    window.addEventListener("whygram:feed-refresh", onFeedRefresh);
    return () =>
      window.removeEventListener("whygram:feed-refresh", onFeedRefresh);
  }, [reload]);

  const visiblePosts = posts.filter((p) => !hiddenIds.includes(p.id));
  const commentsPost = posts.find((p) => p.id === openCommentsId) || null;

  const openStoryGroup = (groupIndex) => {
    const group = storyGroups[groupIndex];
    if (!group) return;

    if (group.isOwn && group.items.length === 0) {
      setAddStoryOpen(true);
      return;
    }

    if (!group.items.length) return;
    setViewer({ groupIndex, itemIndex: 0 });
  };

  const handleDeleteStory = async () => {
    if (!viewer) return;
    const group = storyGroups[viewer.groupIndex];
    const item = group?.items?.[viewer.itemIndex];
    if (!item) return;

    if (!window.confirm("Удалить эту историю?")) return;

    try {
      await deleteStory(item.id);

      // Локально убираем удалённую историю из групп, чтобы панель
      // историй и плеер сразу обновились без ожидания перезагрузки.
      const nextGroups = storyGroups
        .map((g) =>
          g.userId === group.userId
            ? { ...g, items: g.items.filter((s) => s.id !== item.id) }
            : g,
        )
        .filter(
          (g) => g.items.length > 0 || (g.isOwn && g.items.length === 0),
        );
      setStoryGroups(nextGroups);

      // Переходим к следующей истории (та же группа) либо к следующей
      // группе с историями, чтобы можно было удалять каждую по отдельности.
      const newGroupIndex = nextGroups.findIndex(
        (g) => g.userId === group.userId,
      );
      const startFrom = newGroupIndex >= 0 ? newGroupIndex : viewer.groupIndex;

      let next = null;
      if (newGroupIndex >= 0 && nextGroups[newGroupIndex].items.length) {
        next = {
          groupIndex: newGroupIndex,
          itemIndex: Math.min(
            viewer.itemIndex,
            nextGroups[newGroupIndex].items.length - 1,
          ),
        };
      } else {
        for (let i = startFrom; i < nextGroups.length; i += 1) {
          if (nextGroups[i]?.items?.length) {
            next = { groupIndex: i, itemIndex: 0 };
            break;
          }
        }
        if (!next) {
          for (let i = startFrom - 1; i >= 0; i -= 1) {
            if (nextGroups[i]?.items?.length) {
              next = { groupIndex: i, itemIndex: nextGroups[i].items.length - 1 };
              break;
            }
          }
        }
      }
      setViewer(next);

      reload();
    } catch (err) {
      console.error(err);
    }
  };

  const goNextStory = useCallback(() => {
    setViewer((current) => {
      if (!current) return null;
      const group = storyGroups[current.groupIndex];
      if (!group) return null;

      if (current.itemIndex < group.items.length - 1) {
        return { ...current, itemIndex: current.itemIndex + 1 };
      }

      for (let i = current.groupIndex + 1; i < storyGroups.length; i += 1) {
        if (storyGroups[i]?.items?.length) {
          return { groupIndex: i, itemIndex: 0 };
        }
      }
      return null;
    });
  }, [storyGroups]);

  const goPrevStory = useCallback(() => {
    setViewer((current) => {
      if (!current) return null;

      if (current.itemIndex > 0) {
        return { ...current, itemIndex: current.itemIndex - 1 };
      }

      for (let i = current.groupIndex - 1; i >= 0; i -= 1) {
        const prev = storyGroups[i];
        if (prev?.items?.length) {
          return {
            groupIndex: i,
            itemIndex: prev.items.length - 1,
          };
        }
      }
      return current;
    });
  }, [storyGroups]);

  const handleLike = async (post) => {
    if (!user?.id) return;

    const wasLiked = Boolean(myLikeIds[post.id]);
    const nextCount = wasLiked
      ? Math.max(0, (post.likesCount || 0) - 1)
      : (post.likesCount || 0) + 1;
    if (wasLiked) {
      setMyLikeIds((map) => {
        const next = { ...map };
        delete next[post.id];
        return next;
      });
    } else {
      setMyLikeIds((map) => ({ ...map, [post.id]: `temp_${Date.now()}` }));
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likesCount: nextCount } : p)),
    );

    try {
      if (wasLiked) {
        const likeId = myLikeIds[post.id];
        if (likeId && !String(likeId).startsWith("temp_")) {
          await removeLike(likeId);
        }
      } else {
        const created = await addLike(post.id, user.id);
        setMyLikeIds((map) => ({ ...map, [post.id]: created.id }));
      }
      await patchPost(post.id, { likesCount: nextCount });
    } catch {
      setMyLikeIds((map) => {
        const next = { ...map };
        if (wasLiked) {
          next[post.id] = myLikeIds[post.id]; // возвращаем старый
        } else {
          delete next[post.id];
        }
        return next;
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likesCount: post.likesCount } : p,
        ),
      );
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text || !user) return;

    try {
      const created = await addComment(postId, text, user.username, user.id);

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const comments = [...(p.comments || []), created];
          return {
            ...p,
            comments,
            commentsCount: comments.length,
          };
        }),
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

      const updated = posts.find((p) => p.id === postId);
      const nextCount = (updated?.comments?.length || 0) + 1;
      try {
        await patchPost(postId, { commentsCount: nextCount });
      } catch {
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center py-4 px-2 sm:px-4">
      <div className="w-full max-w-[470px] space-y-4">
        <StoriesBar groups={storyGroups} onOpenGroup={openStoryGroup} />

        {error ? (
          <div className="text-center text-[#ed4956] text-sm">{error}</div>
        ) : null}

        {loading ? (
          <div className="text-center py-12 text-[#a8a8a8]">
            Загрузка ленты…
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-12 text-[#a8a8a8]">Нет публикаций</div>
        ) : (
          visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={Boolean(myLikeIds[post.id])}
              commentValue={commentInputs[post.id]}
              onLike={handleLike}
              onOpenComments={setOpenCommentsId}
              onHide={(id) => setHiddenIds((list) => [...list, id])}
              onToggleSave={(id) =>
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === id ? { ...p, isSaved: !p.isSaved } : p,
                  ),
                )
              }
              onCommentChange={(id, value) =>
                setCommentInputs((prev) => ({ ...prev, [id]: value }))
              }
              onCommentSubmit={handleCommentSubmit}
            />
          ))
        )}
      </div>

      <CommentsModal
        post={commentsPost}
        commentValue={commentInputs[openCommentsId]}
        onCommentChange={(e) =>
          setCommentInputs((prev) => ({
            ...prev,
            [openCommentsId]: e.target.value,
          }))
        }
        onSubmit={(e) => handleCommentSubmit(openCommentsId, e)}
        onClose={() => setOpenCommentsId(null)}
      />

      {viewer ? (
        <StoryViewer
          groups={storyGroups}
          groupIndex={viewer.groupIndex}
          itemIndex={viewer.itemIndex}
          onClose={() => setViewer(null)}
          onPrev={goPrevStory}
          onNext={goNextStory}
          isOwn={storyGroups[viewer.groupIndex]?.isOwn}
          onDelete={handleDeleteStory}
        />
      ) : null}

      {addStoryOpen ? (
        <AddStoryModal
          user={user}
          onClose={() => setAddStoryOpen(false)}
          onCreated={reload}
        />
      ) : null}
    </div>
  );
};

export default Home;
