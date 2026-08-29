import { useEffect, useState } from "react";
import { getPostViews } from "../../../entities/view/viewsApi";

function formatViewedAt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Панель управления собственной публикацией внутри модалки профиля:
// «Кто посмотрел» и «Удалить».
const PostManageActions = function PostManageActions({ postId, onDelete }) {
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // На старте тихо подгружаем количество просмотров для бейджа
  useEffect(() => {
    let cancelled = false;
    setLoadingViews(true);
    getPostViews(postId)
      .then((list) => {
        if (cancelled) return;
        const sorted = [...list].sort(
          (a, b) => new Date(b.viewedAt || 0) - new Date(a.viewedAt || 0)
        );
        setViewers(sorted);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingViews(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const toggleViewers = () => {
    setShowViewers((prev) => !prev);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onDelete(postId);
      // Владелец панели сам закроет модалку и обновит профиль
    } catch {
      setError("Не удалось удалить публикацию.");
      setDeleting(false);
    }
  };

  const countBadge =
    !loadingViews && viewers.length > 0 ? `(${viewers.length})` : "";

  return (
    <div className="pt-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleViewers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#363636] text-sm font-semibold transition-colors border-0 cursor-pointer text-white"
        >
          <i className="fa-regular fa-eye" />
          Кто посмотрел
          <span className="text-[#a8a8a8]">{countBadge}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setError("");
            setConfirming(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#363636] text-sm font-semibold transition-colors border-0 cursor-pointer text-[#ed4956]"
        >
          <i className="fa-regular fa-trash-can" />
          Удалить
        </button>
      </div>

      {showViewers ? (
        <div className="max-h-44 overflow-y-auto rounded-lg bg-[#121212] border border-[#262626] p-2 space-y-2">
          {loadingViews ? (
            <div className="text-sm text-[#a8a8a8] py-2 text-center">
              Загрузка…
            </div>
          ) : viewers.length === 0 ? (
            <div className="text-sm text-[#a8a8a8] py-2 text-center">
              Пока никто не посмотрел
            </div>
          ) : (
            viewers.map((v) => (
              <div key={v.id} className="flex items-center gap-2.5">
                <img
                  src={
                    v.avatar ||
                    `https://i.pravatar.cc/150?u=${v.username || v.userId}`
                  }
                  alt=""
                  className="w-7 h-7 rounded-full object-cover bg-[#262626] shrink-0"
                />
                <div className="flex-1 min-w-0 text-sm font-semibold truncate">
                  {v.username || "Пользователь"}
                </div>
                <div className="text-xs text-[#a8a8a8] shrink-0">
                  {formatViewedAt(v.viewedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {confirming ? (
        <div className="rounded-lg bg-[#121212] border border-[#363636] p-3 space-y-3">
          <p className="text-sm">
            Удалить эту публикацию?{deleting ? " Удаляем…" : ""}
          </p>
          {error ? (
            <p className="text-xs text-[#ed4956]">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2 rounded-lg bg-[#ed4956] hover:bg-[#d6344f] disabled:opacity-40 text-sm font-semibold border-0 cursor-pointer text-white"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="flex-1 py-2 rounded-lg bg-[#262626] hover:bg-[#363636] disabled:opacity-40 text-sm font-semibold border-0 cursor-pointer text-white"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PostManageActions;