import { formatCount } from "../../../shared/lib/formatCount";
import FollowButton from "../../../features/follow/ui/FollowButton";
const PostCard = function PostCard({
  post,
  commentValue,
  onLike,
  onOpenComments,
  onHide,
  onToggleSave,
  onCommentChange,
  onCommentSubmit,
}) {
  const username = post.user?.username || post.username || "user";
  const avatar =
    post.user?.avatar || `https://i.pravatar.cc/150?u=${username}`;
  const comments = post.comments || [];

  return (
    <article className="border border-[#262626] rounded-lg overflow-hidden bg-black">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={avatar}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-semibold">{username}</span>
          <FollowButton userId={post.userId || post.user?.id} username={username} />
        </div>
        <button
          type="button"
          onClick={() => onHide(post.id)}
          className="text-xs text-[#a8a8a8] bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-ellipsis" />
        </button>
      </div>

      <div
        className="bg-[#121212] max-h-[580px] flex items-center justify-center cursor-pointer"
        onDoubleClick={() => {
          if (!post.isLiked) onLike(post);
        }}
      >
        {post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full max-h-[580px] object-contain"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption || ""}
            className="w-full max-h-[580px] object-cover"
          />
        )}
      </div>

      <div className="px-3 py-2 space-y-2">
        <div className="flex items-center justify-between text-[22px]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onLike(post)}
              className="bg-transparent border-0 cursor-pointer p-0"
            >
              <i
                className={
                  post.isLiked
                    ? "fa-solid fa-heart text-[#ed4956]"
                    : "fa-regular fa-heart text-white"
                }
              />
            </button>
            <button
              type="button"
              onClick={() => onOpenComments(post.id)}
              className="bg-transparent border-0 cursor-pointer p-0 text-white"
            >
              <i className="fa-regular fa-comment" />
            </button>
            <i className="fa-regular fa-paper-plane text-white" />
          </div>
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className="bg-transparent border-0 cursor-pointer p-0"
          >
            <i
              className={
                post.isSaved
                  ? "fa-solid fa-bookmark text-white"
                  : "fa-regular fa-bookmark text-white"
              }
            />
          </button>
        </div>

        <div className="text-sm font-semibold">
          {formatCount(post.likesCount || 0)} отметок «Нравится»
        </div>

        {post.caption ? (
          <p className="text-sm">
            <span className="font-semibold mr-1">{username}</span>
            {post.caption}
          </p>
        ) : null}

        {comments.length > 0 ? (
          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className="text-sm text-[#a8a8a8] bg-transparent border-0 cursor-pointer p-0"
          >
            Посмотреть все комментарии ({comments.length})
          </button>
        ) : null}

        {comments.slice(-2).map((c) => (
          <p key={c.id} className="text-xs">
            <span className="font-semibold mr-1">{c.username}</span>
            {c.text}
          </p>
        ))}

        <form
          onSubmit={(e) => onCommentSubmit(post.id, e)}
          className="flex items-center gap-2 pt-2 border-t border-[#262626]"
        >
          <input
            type="text"
            placeholder="Добавьте комментарий..."
            value={commentValue || ""}
            onChange={(e) => onCommentChange(post.id, e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-white placeholder-[#a8a8a8] py-1"
          />
          <button
            type="submit"
            disabled={!commentValue?.trim()}
            className="text-xs font-semibold text-[#0095f6] disabled:opacity-40 bg-transparent border-0 cursor-pointer"
          >
            Опубликовать
          </button>
        </form>
      </div>
    </article>
  );
}



export default PostCard;
