import { useEffect, useRef } from "react";
import formatProfileCount from "../lib/formatProfileCount";
import { useAuth } from "../../../features/auth/AuthContext";
import { recordView } from "../../../entities/view/viewsApi";
import PostManageActions from "../own-post-manager/PostManageActions";

const ProfileViewer = function ProfileViewer({
  post,
  profile,
  onClose,
  isOwn = false,
  onDelete,
}) {
  const { user } = useAuth();
  const recordedRef = useRef(false);

  const ownerId = String(post.userId || post.user?.id || "");
  const myId = user?.id ? String(user.id) : "";

  // Запись просмотра при открытии чужой публикации (для своих не пишем).
  // Повторные открытия не дублируются: recordView проверяет по postId+userId.
  useEffect(() => {
    if (recordedRef.current) return;
    if (!myId || !ownerId || myId === ownerId) return;
    recordedRef.current = true;
    recordView({
      postId: post.id,
      userId: myId,
      username: user.username,
      avatar: user.avatar,
    }).catch(() => {});
  }, [post.id, myId, ownerId, user?.username, user?.avatar]);
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-black border border-[#363636] rounded-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black md:w-[55%] flex items-center justify-center min-h-[280px]">
          {post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="max-h-[80vh] w-full object-contain"
            />
          ) : (
            <img
              src={post.mediaUrl || post.image}
              alt=""
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </div>
        <div className="md:w-[45%] flex flex-col p-4 border-t md:border-t-0 md:border-l border-[#262626]">
          <div className="flex items-center gap-3 pb-3 border-b border-[#262626]">
            <img
              src={profile.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">{profile.username}</span>
          </div>
          {post.caption && (
            <p className="py-3 text-sm">
              <span className="font-semibold mr-2">{profile.username}</span>
              {post.caption}
            </p>
          )}
          {isOwn ? (
            <PostManageActions postId={post.id} onDelete={onDelete} />
          ) : null}
          <div className="mt-auto pt-3 border-t border-[#262626] text-sm font-semibold">
            {formatProfileCount(post.likesCount || 0)} отметок «Нравится»
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewer;
