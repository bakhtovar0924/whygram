import { useState } from "react";
import formatProfileCount from "../lib/formatProfileCount";

const TABS = [
  { id: "posts", label: "ПУБЛИКАЦИИ", icon: "fa-solid fa-table-cells" },
  { id: "reels", label: "REELS", icon: "fa-solid fa-clapperboard" },
  { id: "tagged", label: "ОТМЕТКИ", icon: "fa-regular fa-user" },
];

const ProfileGrid = function ProfileGrid({ posts, loading, onOpen }) {
  const [tab, setTab] = useState("posts");

  const gridPosts =
    tab === "posts"
      ? posts
      : tab === "reels"
        ? posts.filter((p) => p.mediaType === "video")
        : posts.slice(0, 3);

  return (
    <>
      <div className="flex justify-center gap-10 sm:gap-16 border-b border-[#262626] mb-1">
        {TABS.map((t) => {
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
              onClick={() => onOpen(post)}
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
                  {formatProfileCount(post.likesCount || 0)}
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-comment" />
                  {formatProfileCount(post.commentsCount || post.comments?.length || 0)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}



export default ProfileGrid;
