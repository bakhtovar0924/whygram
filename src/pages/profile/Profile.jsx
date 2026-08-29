import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import api from "../../shared/api/axios";
import ProfileHeader from "../../widgets/profile/profile-header/ProfileHeader";
import ProfileHighlights from "../../widgets/profile/profile-highlights/ProfileHighlights";
import ProfileGrid from "../../widgets/profile/profile-grid/ProfileGrid";
import ProfileViewer from "../../widgets/profile/profile-viewer/ProfileViewer";
import { deletePost } from "../../entities/post/postsApi";
import { deleteViewsForPost } from "../../entities/view/viewsApi";

const Profile = function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const profile = useMemo(
    () => ({
      username: user?.username || "user",
      fullName: user?.fullName || user?.name || user?.username || "Пользователь",
      avatar:
        user?.avatar ||
        `https://i.pravatar.cc/150?u=${user?.username || "user"}`,
      bio: user?.bio || "",
      followersCount: user?.followersCount ?? 0,
      followingCount: user?.followingCount ?? 0,
    }),
    [user]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/posts");
        const data = res.data;

        if (cancelled) return;

        if (Array.isArray(data) && data.length) {
          const mine = data.filter(
            (p) =>
              String(p.userId) === String(user.id) ||
              p.user?.username === profile.username ||
              p.username === profile.username
          );
          setPosts(mine);
        } else {
          setPosts([]);
        }
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile.username]);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      await deleteViewsForPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelected(null);
    } catch {
      // не удалось удалить — модалка остаётся открытой
    }
  };

  return (
    <div className="w-full max-w-[935px] mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#f5f5f5] bg-black min-h-screen">
      <ProfileHeader profile={profile} postsCount={posts.length} />
      <ProfileHighlights highlights={[]} />
      <ProfileGrid posts={posts} loading={loading} onOpen={setSelected} />
      {selected ? (
        <ProfileViewer
          post={selected}
          profile={profile}
          onClose={() => setSelected(null)}
          isOwn
          onDelete={handleDeletePost}
        />
      ) : null}
    </div>
  );
};

export default Profile;