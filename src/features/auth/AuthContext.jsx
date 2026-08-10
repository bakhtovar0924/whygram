import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getFollowsByFollower,
  followUser,
  unfollowUser,
} from "../follow/followsApi";
import { getUserById, updateUserApi } from "./authApi";

const AuthContext = createContext(null);
const STORAGE_KEY = "ig_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setFollowing([]);
      return;
    }
    let cancelled = false;
    getFollowsByFollower(user.id)
      .then((res) => {
        if (!cancelled) setFollowing(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (!cancelled) setFollowing([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const login = (userData) => {
    const { password, ...safe } = userData;
    setUser(safe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const { password, ...rest } = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      return rest;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const followingIds = useMemo(
    () => new Set(following.map((f) => String(f.followingId))),
    [following]
  );

  const isFollowing = useCallback(
    (userId) => followingIds.has(String(userId)),
    [followingIds]
  );

  const refreshFollowing = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getFollowsByFollower(user.id);
      setFollowing(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    }
  }, [user?.id]);

  const follow = useCallback(
    async (followingId) => {
      if (!user?.id || isFollowing(followingId)) return;
      try {
        const record = await followUser(user.id, String(followingId));
        setFollowing((prev) => [...prev, record]);
        const [me, target] = await Promise.all([
          getUserById(user.id),
          getUserById(followingId),
        ]);
        updateUser({ followingCount: (me.followingCount || 0) + 1 });
        await updateUserApi(followingId, {
          followersCount: (target.followersCount || 0) + 1,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [user, isFollowing]
  );

  const unfollow = useCallback(
    async (followingId) => {
      if (!user?.id) return;
      const rec = following.find(
        (f) => String(f.followingId) === String(followingId)
      );
      if (!rec) return;
      try {
        await unfollowUser(rec.id);
        setFollowing((prev) => prev.filter((f) => f.id !== rec.id));
        const [me, target] = await Promise.all([
          getUserById(user.id),
          getUserById(followingId),
        ]);
        updateUser({ followingCount: Math.max(0, (me.followingCount || 0) - 1) });
        await updateUserApi(followingId, {
          followersCount: Math.max(0, (target.followersCount || 0) - 1),
        });
      } catch (e) {
        console.error(e);
      }
    },
    [user, following]
  );

  const value = useMemo(
    () => ({
      user,
      isAuth: Boolean(user),
      loading,
      login,
      updateUser,
      logout,
      following,
      followingIds,
      isFollowing,
      follow,
      unfollow,
      refreshFollowing,
      setFollowing,
    }),
    [
      user,
      loading,
      following,
      followingIds,
      isFollowing,
      follow,
      unfollow,
      refreshFollowing,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
