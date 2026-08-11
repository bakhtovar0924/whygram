const CommentsModal = function CommentsModal({
  post,
  commentValue,
  onCommentChange,
  onSubmit,
  onClose,
}) {
  if (!post) return null;

  const comments = post.comments || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-[#363636] w-full sm:max-w-md sm:rounded-xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
          <span className="font-semibold text-sm">Комментарии</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-0 text-white cursor-pointer text-lg"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-[#a8a8a8] text-sm text-center py-8">
              Комментариев пока нет
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-semibold mr-2">{c.username}</span>
                <span>{c.text}</span>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 p-3 border-t border-[#262626]"
        >
          <input
            type="text"
            placeholder="Добавьте комментарий..."
            value={commentValue || ""}
            onChange={onCommentChange}
            className="flex-1 bg-[#000] border border-[#363636] rounded-lg px-3 py-2 text-sm outline-none text-white"
          />
          <button
            type="submit"
            disabled={!commentValue?.trim()}
            className="text-sm font-semibold text-[#0095f6] disabled:opacity-40 bg-transparent border-0 cursor-pointer"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}



export default CommentsModal;
