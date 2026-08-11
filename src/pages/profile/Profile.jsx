import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import api from "../../shared/api/axios";
import ProfileHeader from "../../widgets/profile/profile-header/ProfileHeader";
import ProfileHighlights from "../../widgets/profile/profile-highlights/ProfileHighlights";
import ProfileGrid from "../../widgets/profile/profile-grid/ProfileGrid";
import ProfileViewer from "../../widgets/profile/profile-viewer/ProfileViewer";

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

const Profile = function Profile() {
  const { user } = useAuth();
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

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#f5f5f5] bg-black min-h-screen">
      <ProfileHeader profile={profile} postsCount={posts.length} />
      <ProfileHighlights highlights={HIGHLIGHTS} />
      <ProfileGrid posts={posts} loading={loading} onOpen={setSelected} />
      {selected ? (
        <ProfileViewer post={selected} profile={profile} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}



export default Profile;
