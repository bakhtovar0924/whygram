import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getUsersList } from "../../entities/user/usersApi";
import { getFollowsByFollowing } from "../follow/followsApi";
import { getMessages } from "../../entities/message/messagesApi";

const useConversations = function useConversations() {
  const { user, following } = useAuth();
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [messages, setMessages] = useState([]);

  const myId = user?.id ? String(user.id) : null;

  const followingIds = useMemo(
    () => new Set((following || []).map((f) => String(f.followingId))),
    [following]
  );

  const loadAll = useCallback(async () => {
    if (!myId) return;
    try {
      const [u, fol, msg] = await Promise.all([
        getUsersList(),
        getFollowsByFollowing(myId),
        getMessages(),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setFollowers(
        Array.isArray(fol) ? fol.map((f) => String(f.followerId)) : []
      );
      setMessages(Array.isArray(msg) ? msg : []);
    } catch (e) {
      console.error(e);
    }
  }, [myId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const conversations = useMemo(() => {
    if (!myId) return [];
    const followerSet = new Set(followers);
    const mySet = followingIds;
    const messagedIds = new Set();
    for (const m of messages) {
      if (String(m.from) === myId) messagedIds.add(String(m.to));
      if (String(m.to) === myId) messagedIds.add(String(m.from));
    }
    const related = users.filter((u) => {
      const id = String(u.id);
      if (id === myId) return false;
      return mySet.has(id) || followerSet.has(id) || messagedIds.has(id);
    });

    return related
      .map((u) => {
        const id = String(u.id);
        const isFollowingThem = mySet.has(id);
        const isFollowingMe = followerSet.has(id);
        const thread = messages.filter(
          (m) =>
            (String(m.from) === myId && String(m.to) === id) ||
            (String(m.from) === id && String(m.to) === myId)
        );
        return {
          user: u,
          isFollowingThem,
          isFollowingMe,
          mutual: isFollowingThem && isFollowingMe,
          lastMessage: thread[thread.length - 1] || null,
          thread,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt || 0) -
          new Date(a.lastMessage?.createdAt || 0)
      );
  }, [myId, users, followers, followingIds, messages]);

  const refreshMessages = useCallback(async () => {
    try {
      const msg = await getMessages();
      setMessages(Array.isArray(msg) ? msg : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return { conversations, messages, setMessages, refreshMessages };
}


export default useConversations;
