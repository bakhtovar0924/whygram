import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import api from "../../shared/api/axios";
import ProfileHeader from "../../widgets/profile/profile-header/ProfileHeader";
import ProfileHighlights from "../../widgets/profile/profile-highlights/ProfileHighlights";
import ProfileGrid from "../../widgets/profile/profile-grid/ProfileGrid";
import ProfileViewer from "../../widgets/profile/profile-viewer/ProfileViewer";
import StoryViewer from "../../widgets/stories/story-viewer/StoryViewer";
import { deletePost, getStories } from "../../entities/post/postsApi";
import { groupStoriesByUser } from "../../shared/lib/groupStories";
import { deleteViewsForPost } from "../../entities/view/viewsApi";

const PublicProfile = function PublicProfile() {
  const { username } = useParams();
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [storyGroup, setStoryGroup] = useState(null);
  const [storyViewer, setStoryViewer] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      sessionStorage.setItem("redirectAfterAuth", `/u/${username}`);
      navigate("/login", { replace: true });
    }
  }, [isAuth, username, navigate]);

  useEffect(() => {
    if (!isAuth || !username) return;
    if (user?.username?.toLowerCase() === username.toLowerCase()) {
      navigate("/profile", { replace: true });
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);

      try {
        const usersRes = await api.get("/users");
        const users = usersRes.data || [];
        const found = users.find(
          (u) => u.username?.toLowerCase() === username.toLowerCase(),
        );

        if (!found) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;
        setProfileUser(found);

        const postsRes = await api.get("/posts");
        const allPosts = postsRes.data || [];
        const mine = allPosts.filter(
          (p) =>
            String(p.userId) === String(found.id) ||
            p.user?.username === found.username ||
            p.username === found.username,
        );
        setPosts(mine);

        const stories = await getStories().catch(() => []);
        const matchingGroup = groupStoriesByUser(
          Array.isArray(stories) ? stories : [],
          user,
        ).find(
          (group) =>
            String(group.userId) === String(found.id) ||
            group.username?.toLowerCase() === found.username?.toLowerCase(),
        );
        if (!cancelled) {
          setStoryGroup(
            matchingGroup || {
              userId: found.id,
              username: found.username,
              avatar: found.avatar,
              items: [],
              isOwn: false,
            },
          );
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username, isAuth, user?.username, navigate]);

  const profile = useMemo(() => {
    if (!profileUser) return null;
    return {
      id: profileUser.id,
      username: profileUser.username,
      fullName:
        profileUser.fullName || profileUser.name || profileUser.username,
      avatar:
        profileUser.avatar ||
        `https://i.pravatar.cc/150?u=${profileUser.username}`,
      bio: profileUser.bio || "",
      followersCount: profileUser.followersCount ?? 0,
      followingCount: profileUser.followingCount ?? 0,
    };
  }, [profileUser]);

  const goNextStory = useCallback(() => {
    setStoryViewer((current) => {
      if (!current || !storyGroup) return null;
      return current.itemIndex < storyGroup.items.length - 1
        ? { itemIndex: current.itemIndex + 1 }
        : null;
    });
  }, [storyGroup]);

  const goPrevStory = useCallback(() => {
    setStoryViewer((current) =>
      current && current.itemIndex > 0
        ? { itemIndex: current.itemIndex - 1 }
        : current,
    );
  }, []);

  if (!isAuth) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#a8a8a8] flex items-center justify-center">
        Загрузка профиля...
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Пользователь не найден</h1>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-lg bg-[#0095f6] text-white text-sm font-semibold border-0 cursor-pointer"
        >
          На главную
        </button>
      </div>
    );
  }

  const isOwn = String(user?.id) === String(profileUser?.id);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      await deleteViewsForPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelected(null);
    } catch {
    }
  };

  const openStories = () => {
    if (storyGroup?.items?.length) setStoryViewer({ itemIndex: 0 });
  };

  return (
    <div className="w-full max-w-233.75 mx-auto px-4 sm:px-6 py-6 sm:py-8 text-[#f5f5f5] bg-black min-h-screen">
      <ProfileHeader
        profile={profile}
        postsCount={posts.length}
        isOwn={isOwn}
        storyGroup={storyGroup}
        onOpenStories={openStories}
      />
      <ProfileHighlights highlights={[]} />
      <ProfileGrid posts={posts} loading={false} onOpen={setSelected} isOwn={isOwn} />
      {selected ? (
        <ProfileViewer
          post={selected}
          profile={profile}
          onClose={() => setSelected(null)}
          isOwn={isOwn}
          onDelete={handleDeletePost}
        />
      ) : null}
      {storyViewer && storyGroup ? (
        <StoryViewer
          groups={[storyGroup]}
          groupIndex={0}
          itemIndex={storyViewer.itemIndex}
          onClose={() => setStoryViewer(null)}
          onPrev={goPrevStory}
          onNext={goNextStory}
        />
      ) : null}
    </div>
  );
};

export default PublicProfile;
