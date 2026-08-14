import { useEffect, useState, useRef } from "react";
import { getPosts } from "../../entities/post/postsApi";
import { useAuth } from "../../features/auth/AuthContext";
import ReelCard from "../../widgets/reels/reel-card/ReelCard";
import CommentsModal from "../../widgets/posts/comments-modal/CommentsModal";
import {
  addComment,
  addLike,
  removeLike,
  patchPost,
  getLikesByUser,
} from "../../entities/post/postsApi";

const Reels = function Reels() {
  const { user, followingIds } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLikeIds, setMyLikeIds] = useState({});
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPosts(),
      user?.id ? getLikesByUser(user.id) : Promise.resolve([]),
    ])
      .then(([postsData, likesData]) => {
        const list = Array.isArray(postsData) ? postsData : [];
        const videos = list.filter((p) => p.mediaType === "video");

        const likeMap = {};
        (Array.isArray(likesData) ? likesData : []).forEach((l) => {
          likeMap[l.postId] = l.id;
        });
        setMyLikeIds(likeMap);

        const sorted = [...videos].sort((a, b) => {
          const aU = String(a.userId || a.user?.id || "");
          const bU = String(b.userId || b.user?.id || "");
          const aFollowed = followingIds.has(aU);
          const bFollowed = followingIds.has(bU);
          if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setReels(
          sorted.map((p) => ({
            ...p,
            isLiked: Boolean(likeMap[p.id]),
          })),
        );
      })
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, [followingIds, user?.id]);

  const handleLike = async (reel) => {
    if (!user?.id) return;
    const wasLiked = Boolean(myLikeIds[reel.id]);
    const nextCount = wasLiked
      ? Math.max(0, (reel.likesCount || 0) - 1)
      : (reel.likesCount || 0) + 1;

    setReels((prev) =>
      prev.map((r) =>
        r.id === reel.id
          ? { ...r, isLiked: !wasLiked, likesCount: nextCount }
          : r,
      ),
    );

    try {
      if (wasLiked) {
        const likeId = myLikeIds[reel.id];
        if (likeId) {
          await removeLike(likeId);
          setMyLikeIds((m) => {
            const n = { ...m };
            delete n[reel.id];
            return n;
          });
        }
      } else {
        const created = await addLike(reel.id, user.id);
        setMyLikeIds((m) => ({ ...m, [reel.id]: created.id }));
      }
      await patchPost(reel.id, { likesCount: nextCount });
    } catch {
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id
            ? { ...r, isLiked: wasLiked, likesCount: reel.likesCount }
            : r,
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
      setReels((prev) =>
        prev.map((r) => {
          if (r.id !== postId) return r;
          const comments = [...(r.comments || []), created];
          return {
            ...r,
            comments,
            commentsCount: comments.length,
          };
        }),
      );
      setCommentInputs((p) => ({ ...p, [postId]: "" }));
      await patchPost(postId, {
        commentsCount:
          (reels.find((r) => r.id === postId)?.commentsCount || 0) + 1,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const commentsReel = reels.find((r) => r.id === openCommentsId) || null;

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-black text-white">
        Загрузка Reels…
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-black text-[#a8a8a8] text-sm px-4 text-center">
        Пока нет Reels. Загрузите видео через «Создать».
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
    >
      {reels.map((reel) => (
        <div key={reel.id} className="h-[100dvh] w-full snap-start snap-always">
          <ReelCard
            reel={reel}
            isLiked={Boolean(myLikeIds[reel.id]) || reel.isLiked}
            onLike={() => handleLike(reel)}
            onOpenComments={() => setOpenCommentsId(reel.id)}
          />
        </div>
      ))}

      <CommentsModal
        post={commentsReel}
        commentValue={commentInputs[openCommentsId]}
        onCommentChange={(e) =>
          setCommentInputs((p) => ({
            ...p,
            [openCommentsId]: e.target.value,
          }))
        }
        onSubmit={(e) => handleCommentSubmit(openCommentsId, e)}
        onClose={() => setOpenCommentsId(null)}
      />
    </div>
  );
};

export default Reels;
