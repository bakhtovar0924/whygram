import { useEffect, useState } from "react";
import { getPosts } from "../../entities/post/api/postsApi";
import { useAuth } from "../../features/auth/AuthContext";
import FollowButton from "../../features/follow/ui/FollowButton";

export default function Reels() {
  const { followingIds } = useAuth();
  const [reels, setReels] = useState([]);

  useEffect(() => {
    getPosts()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        const videos = list.filter((p) => p.mediaType === "video");
        if (videos.length) {
          const sorted = [...videos].sort((a, b) => {
            const aU = String(a.userId || a.user?.id || "");
            const bU = String(b.userId || b.user?.id || "");
            const aFollowed = followingIds.has(aU);
            const bFollowed = followingIds.has(bU);
            if (aFollowed !== bFollowed) return aFollowed ? -1 : 1;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          setReels(sorted);
        } else {
          setReels(list.slice(0, 4));
        }
      })
      .catch(() => setReels([]));
  }, [followingIds]);

  return (
    <div className="flex justify-center py-4 px-2">
      <div className="w-full max-w-[420px] space-y-4">
        <h1 className="text-lg font-semibold px-1">Reels</h1>
        {reels.length === 0 ? (
          <p className="text-[#a8a8a8] text-sm text-center py-12">Пока нет Reels</p>
        ) : (
          reels.map((r) => (
            <div
              key={r.id}
              className="relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626] aspect-[9/16] max-h-[80vh]"
            >
              {r.mediaType === "video" ? (
                <video src={r.mediaUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={r.mediaUrl} alt="" className="w-full h-full object-cover" />
              )}
              <div className="relative flex items-center gap-2 px-4 pt-3 pb-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">
                    @{r.user?.username || r.username}
                  </div>
                  <div className="text-sm mt-0.5 line-clamp-2">{r.caption}</div>
                </div>
                <FollowButton
                  userId={r.userId || r.user?.id}
                  username={r.user?.username || r.username}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
