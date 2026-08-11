import { useEffect, useMemo, useState } from "react";
import { getPosts } from "../../entities/post/postsApi";
import { getUsersList } from "../../entities/user/usersApi";
import FollowButton from "../../features/follow/ui/FollowButton";
import { fuzzyScore } from "../../shared/lib/fuzzy";

const Top = function Top() {
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getPosts()
      .then((d) => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]));
    getUsersList()
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]));
  }, []);

  const reels = useMemo(
    () => posts.filter((p) => p.mediaType === "video"),
    [posts]
  );

  const gridPosts = useMemo(() => posts, [posts]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return null;

    const userResults = users
      .map((u) => {
        const score = Math.max(
          fuzzyScore(query, u.username) || 0,
          fuzzyScore(query, u.fullName) || 0,
          fuzzyScore(query, u.email) || 0
        );
        return { type: "user", item: u, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const reelResults = reels
      .map((r) => {
        const score = Math.max(
          fuzzyScore(query, r.caption) || 0,
          fuzzyScore(query, r.user?.username || r.username) || 0
        );
        return { type: "reel", item: r, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return { users: userResults, reels: reelResults };
  }, [q, reels, users]);

  const noResults = results && !results.users.length && !results.reels.length;

  return (
    <div className="max-w-4xl mx-auto px-3 py-6">
      <div className="relative max-w-md mx-auto mb-6">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a8a8] text-sm" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: пользователи и Reels..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#121212] border border-[#363636] text-sm text-white outline-none focus:border-[#a8a8a8] placeholder-[#a8a8a8]"
        />
      </div>

      {results ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#a8a8a8] mb-3">
              Пользователи
            </h2>
            {results.users.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.users.map((r) => (
                  <div
                    key={r.item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#121212] border border-[#262626]"
                  >
                    <img
                      src={
                        r.item.avatar ||
                        `https://i.pravatar.cc/150?u=${encodeURIComponent(
                          r.item.username
                        )}`
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        @{r.item.username}
                      </div>
                      <div className="text-xs text-[#a8a8a8] truncate">
                        {r.item.fullName || r.item.bio || ""}
                      </div>
                    </div>
                    <FollowButton
                      userId={r.item.id}
                      username={r.item.username}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a8a8a8]">Пользователи не найдены</p>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#a8a8a8] mb-3">
              Reels
            </h2>
            {results.reels.length ? (
              <div className="grid grid-cols-3 gap-1">
                {results.reels.map((r) => (
                  <button
                    key={r.item.id}
                    type="button"
                    onClick={() => setSelected(r.item)}
                    className="relative aspect-[9/16] overflow-hidden bg-[#121212] border-0 p-0 cursor-pointer rounded-md group"
                  >
                    {r.item.mediaType === "video" ? (
                      <video
                        src={r.item.mediaUrl}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={r.item.mediaUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-left">
                      <div className="text-xs font-semibold">
                        @{r.item.user?.username || r.item.username}
                      </div>
                      <div className="text-[10px] text-[#a8a8a8] truncate">
                        {r.item.caption}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#a8a8a8]">Reels не найдены</p>
            )}
          </section>

          {noResults ? (
            <p className="text-center text-[#a8a8a8] text-sm py-8">
              Ничего не найдено по запросу «{q}». Проверьте написание.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {gridPosts.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className={`relative aspect-square overflow-hidden bg-[#121212] border-0 p-0 cursor-pointer ${
                index % 7 === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <img
                src={item.mediaUrl}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              {item.mediaType === "video" && (
                <i className="fa-solid fa-play absolute top-2 right-2 text-white text-sm" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-black border border-[#363636] rounded-xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.mediaType === "video" ? (
              <video
                src={selected.mediaUrl}
                controls
                className="w-full max-h-[70vh] object-contain bg-black"
              />
            ) : (
              <img
                src={selected.mediaUrl}
                alt=""
                className="w-full max-h-[70vh] object-contain bg-black"
              />
            )}
            <div className="p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold mr-2">
                  {selected.user?.username || selected.username}
                </span>
                <FollowButton
                  userId={selected.userId || selected.user?.id}
                  username={selected.user?.username || selected.username}
                />
              </div>
              <p className="mt-1">{selected.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default Top;
