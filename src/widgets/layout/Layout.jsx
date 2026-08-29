import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { createPost } from "../../entities/post/postsApi";
import { readFileAsDataURL } from "../../shared/lib/readFileAsDataURL";
import {
  prepareMediaFile,
  formatBytes,
} from "../../shared/lib/compressMedia";
import { loadConfig } from "../../shared/config/appConfig";

const nav = [
  { to: "/", label: "Главная", icon: "fa-solid fa-house", end: true },
  { to: "/top", label: "Поиск", icon: "fa-solid fa-magnifying-glass" },
  { to: "/reels", label: "Reels", icon: "fa-solid fa-clapperboard" },
  { to: "/chat", label: "Сообщения", icon: "fa-regular fa-paper-plane" },
  { to: "/profile", label: "Профиль", icon: "fa-regular fa-circle-user" },
  { to: "/settings", label: "Настройки", icon: "fa-solid fa-gear" },
];

const Layout = function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [compressInfo, setCompressInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const resetCreate = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setMediaType("image");
    setCaption("");
    setError("");
    setCompressInfo("");
    setIsSubmitting(false);
  };

  const closeCreate = () => {
    resetCreate();
    setIsCreateOpen(false);
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    setError("");
    setCompressInfo("");
    if (!selected) return;

    try {
      const conf = loadConfig();
      const result = conf.compressImages
        ? await prepareMediaFile(selected)
        : {
            file: selected,
            skipped: true,
            reason: "compress-off",
            originalSize: selected.size,
            finalSize: selected.size,
          };
      const ready = result.file;

      if (preview) URL.revokeObjectURL(preview);
      setFile(ready);
      setMediaType(
        ready.type.startsWith("video/") ? "video" : "image"
      );
      setPreview(URL.createObjectURL(ready));

      if (!result.skipped && result.originalSize && result.finalSize) {
        setCompressInfo(
          `Сжато: ${formatBytes(result.originalSize)} → ${formatBytes(
            result.finalSize
          )}`
        );
      } else if (result.reason === "video-passthrough") {
        setCompressInfo(
          `Видео: ${formatBytes(selected.size)} (без перекодирования)`
        );
      }
    } catch (err) {
      setError(err.message || "Не удалось обработать файл");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview("");
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Выберите файл");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const mediaUrl = await readFileAsDataURL(file);

      await createPost({
        id: String(Date.now()),
        userId: user?.id,
        username: user?.username,
        user: {
          id: user?.id,
          username: user?.username,
          avatar: user?.avatar,
          fullName: user?.fullName || user?.name,
        },
        mediaUrl,
        mediaType,
        caption: caption.trim(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        isSaved: false,
        comments: [],
        createdAt: new Date().toISOString(),
      });

      closeCreate();
      navigate("/");
      window.dispatchEvent(new CustomEvent("whygram:feed-refresh"));
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Ошибка публикации."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] flex">
      <aside className="hidden md:flex flex-col w-[72px] xl:w-[244px] border-r border-[#262626] p-3 sticky top-0 h-screen shrink-0">
        <div className="px-3 py-4 mb-4 flex items-center justify-center flex-col flex-col-reverse">
          <span
            className="text-white text-[28px] hidden xl:block"
            style={{
              fontFamily: "Billabong, 'Grand Hotel', 'Segoe Script', cursive",
            }}
          >
            WHYGRAM
          </span>
          <i className="fa-brands fa-instagram text-4xl w-[30px] xl:hidden" />
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "font-bold bg-[#121212]"
                    : "text-[#f5f5f5] hover:bg-[#121212]"
                }`
              }
            >
              <i className={`${item.icon} text-[22px] w-7 text-center`} />
              <span className="hidden xl:inline">{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm text-[#f5f5f5] hover:bg-[#121212] bg-transparent border-0 cursor-pointer w-full text-left"
          >
            <i className="fa-regular fa-square-plus text-[22px] w-7 text-center" />
            <span className="hidden xl:inline">Создать</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 rounded-lg text-sm text-[#ed4956] hover:bg-[#121212] bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-right-from-bracket text-[22px] w-7 text-center" />
          <span className="hidden xl:inline">Выйти (@{user?.username})</span>
        </button>
      </aside>

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#262626] sticky top-0 bg-black/90 backdrop-blur z-40">
          <span
            className="text-white text-2xl"
            style={{ fontFamily: "Billabong, 'Grand Hotel', cursive" }}
          >
            WHYGRAM
          </span>
          <div className="flex gap-4 text-xl items-center">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-transparent border-0 text-white cursor-pointer p-0"
            >
              <i className="fa-regular fa-square-plus" />
            </button>
            <NavLink to="/top">
              <i className="fa-solid fa-magnifying-glass" />
            </NavLink>
            <NavLink to="/chat">
              <i className="fa-regular fa-paper-plane" />
            </NavLink>
          </div>
        </header>

        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-black border-t border-[#262626] flex items-center justify-around z-40 text-xl">
        {nav.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? "text-white" : "text-[#a8a8a8]"
            }
          >
            <i className={item.icon} />
          </NavLink>
        ))}
      </nav>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#363636] rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={closeCreate}
              className="absolute top-4 right-4 text-[#a8a8a8] hover:text-white bg-transparent border-0 cursor-pointer text-xl"
            >
              Отмена
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              Создание публикации
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#a8a8a8] mb-1">
                  Фото или видео
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-[#f5f5f5] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#0095f6] file:text-white file:font-semibold file:cursor-pointer"
                />
              </div>

              {error ? (
                <p className="text-[#ed4956] text-xs">{error}</p>
              ) : null}

              {compressInfo ? (
                <p className="text-[#a8a8a8] text-xs">{compressInfo}</p>
              ) : null}

              {preview ? (
                <div className="rounded-lg overflow-hidden bg-black max-h-48 flex items-center justify-center">
                  {mediaType === "video" ? (
                    <video
                      src={preview}
                      controls
                      className="max-h-48 w-full object-contain"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="preview"
                      className="max-h-48 w-full object-contain"
                    />
                  )}
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold uppercase text-[#a8a8a8] mb-1">
                  Подпись
                </label>
                <textarea
                  rows={3}
                  placeholder="Добавьте подпись..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#000] border border-[#363636] text-sm text-white placeholder-[#a8a8a8] focus:outline-none focus:border-[#a8a8a8] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full py-2.5 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer"
              >
                {isSubmitting ? "Публикация..." : "Поделиться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



export default Layout;
