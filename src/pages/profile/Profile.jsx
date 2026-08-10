import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import api from "../../shared/api/axios";

const FALLBACK_POSTS = [
  {
    id: "p1",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
    mediaType: "image",
    likesCount: 1240,
    commentsCount: 48,
    caption: "Новый день",
  },
  {
    id: "p2",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    mediaType: "image",
    likesCount: 892,
    commentsCount: 21,
  },
  {
    id: "p3",
    mediaUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600",
    mediaType: "video",
    likesCount: 2103,
    commentsCount: 90,
  },
  {
    id: "p4",
    mediaUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
    mediaType: "image",
    likesCount: 560,
    commentsCount: 12,
  },
  {
    id: "p5",
    mediaUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600",
    mediaType: "image",
    likesCount: 334,
    commentsCount: 7,
  },
  {
    id: "p6",
    mediaUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
    mediaType: "image",
    likesCount: 1502,
    commentsCount: 63,
  },
];

const HIGHLIGHTS = [
  { id: 1, title: "Путь", cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=150" },
  { id: 2, title: "Учёба", cover: "https://images.unsplash.com/photo-1456513080800-b0b4cb5a1b0b?w=150" },
  { id: 3, title: "Друзья", cover: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150" },
];

function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} млн`;
  if (n >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} тыс.`;
  return String(n);
}

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const profile = useMemo(
    () => ({
      username: user?.username || "user",
      fullName: user?.fullName || user?.name || user?.username || "Пользователь",
      avatar: user?.avatar || `https://i.pravatar.cc/150?u=${user?.username || "user"}`,
      bio: user?.bio || "WHYGRAM\nГовори правду.",
      followersCount: user?.followersCount ?? 0,
      followingCount: user?.followingCount ?? 0,
    }),
    [user]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/posts");
        const data = res.data;
        if (cancelled) return;
        if (Array.isArray(data) && data.length) {
          const mine = data.filter(
            (p) =>
              p.userId === user?.id ||
              p.user?.username === profile.username ||
              p.username === profile.username
          );
          setPosts(mine);
        } else {
          setPosts(FALLBACK_POSTS);
        }
      } catch {
        if (!cancelled) setPosts(FALLBACK_POSTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id, profile.username]);

  const postsCount = posts.length;

  const gridPosts =
    tab === "posts"
      ? posts
      : tab === "reels"
        ? posts.filter((p) => p.mediaType === "video")
        : posts.slice(0, 3);

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#f5f5f5] bg-black min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10 mb-8">
        <div className="flex justify-center sm:justify-start shrink-0">
          <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <img
              src={profile.avatar}
              alt={`Фото профиля ${profile.username}`}
              className="w-[86px] h-[86px] sm:w-[150px] sm:h-[150px] rounded-full object-cover border-4 border-black bg-[#121212]"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-[20px] font-light tracking-wide truncate">{profile.username}</h1>
            <Link
              to="/settings"
              className="px-4 py-1.5 rounded-lg bg-[#262626] text-sm font-semibold hover:bg-[#363636] transition-colors"
            >
              Редактировать профиль
            </Link>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg bg-[#262626] text-sm font-semibold hover:bg-[#363636] transition-colors"
            >
              Поделиться профилем
            </button>
            <Link to="/settings" className="p-1.5 rounded-lg hover:bg-[#262626]" aria-label="Настройки">
              <i className="fa-solid fa-gear text-[18px]" />
            </Link>
          </div>

          <ul className="flex items-center gap-6 sm:gap-10 mb-4 text-sm">
            <li>
              <span className="font-semibold">{formatCount(postsCount)}</span>{" "}
              <span className="text-[#a8a8a8]">публикаций</span>
            </li>
            <li>
              <span className="font-semibold">{formatCount(profile.followersCount)}</span>{" "}
              <span className="text-[#a8a8a8]">подписчиков</span>
            </li>
            <li>
              <span className="font-semibold">{formatCount(profile.followingCount)}</span>{" "}
              <span className="text-[#a8a8a8]">подписок</span>
            </li>
          </ul>

          <div className="text-sm leading-5 space-y-1">
            <div className="font-semibold">{profile.fullName}</div>
            {profile.bio.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-6 mb-2 border-b border-[#262626]">
        {HIGHLIGHTS.map((h) => (
          <button key={h.id} type="button" className="flex flex-col items-center gap-1.5 shrink-0 w-[76px]">
            <div className="w-[66px] h-[66px] rounded-full p-[2px] border border-[#363636]">
              <img
                src={h.cover}
                alt={h.title}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            <span className="text-xs truncate w-full text-center text-[#f5f5f5]">{h.title}</span>
          </button>
        ))}
        <button type="button" className="flex flex-col items-center gap-1.5 shrink-0 w-[76px] text-[#a8a8a8]">
          <div className="w-[66px] h-[66px] rounded-full border border-dashed border-[#363636] flex items-center justify-center text-2xl">
            +
          </div>
          <span className="text-xs">Создать</span>
        </button>
      </div>

      <div className="flex justify-center gap-10 sm:gap-16 border-b border-[#262626] mb-1">
        {[
          { id: "posts", label: "ПУБЛИКАЦИИ", icon: "fa-solid fa-table-cells" },
          { id: "reels", label: "REELS", icon: "fa-solid fa-clapperboard" },
          { id: "tagged", label: "ОТМЕТКИ", icon: "fa-regular fa-user" },
        ].map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold tracking-wider border-t-2 -mt-px bg-transparent cursor-pointer ${
                active ? "border-white text-white" : "border-transparent text-[#a8a8a8]"
              }`}
            >
              <i className={`${t.icon} text-[12px]`} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#a8a8a8] text-sm">Загрузка…</div>
      ) : gridPosts.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
            <i className="fa-solid fa-camera text-xl" />
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Поделиться фото</h2>
          <p className="text-sm text-[#a8a8a8] max-w-xs">
            Когда вы поделитесь фото и видео, они появятся в вашем профиле.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-1">
          {gridPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelected(post)}
              className="relative aspect-square bg-[#121212] overflow-hidden group border-0 p-0 cursor-pointer"
            >
              {post.mediaType === "video" ? (
                <video src={post.mediaUrl} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img
                  src={post.mediaUrl || post.image}
                  alt={post.caption || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-semibold text-sm">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-heart" />
                  {formatCount(post.likesCount || 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-comment" />
                  {formatCount(post.commentsCount || post.comments?.length || 0)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-black border border-[#363636] rounded-xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black md:w-[55%] flex items-center justify-center min-h-[280px]">
              {selected.mediaType === "video" ? (
                <video src={selected.mediaUrl} controls className="max-h-[80vh] w-full object-contain" />
              ) : (
                <img
                  src={selected.mediaUrl || selected.image}
                  alt=""
                  className="max-h-[80vh] w-full object-contain"
                />
              )}
            </div>
            <div className="md:w-[45%] flex flex-col p-4 border-t md:border-t-0 md:border-l border-[#262626]">
              <div className="flex items-center gap-3 pb-3 border-b border-[#262626]">
                <img src={profile.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-semibold">{profile.username}</span>
              </div>
              {selected.caption && (
                <p className="py-3 text-sm">
                  <span className="font-semibold mr-2">{profile.username}</span>
                  {selected.caption}
                </p>
              )}
              <div className="mt-auto pt-3 border-t border-[#262626] text-sm font-semibold">
                {formatCount(selected.likesCount || 0)} отметок «Нравится»
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
