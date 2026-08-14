import { useAuth } from "../../auth/AuthContext";
const FollowButton = function FollowButton({ userId, username, className }) {
  const { user, isFollowing, follow, unfollow } = useAuth();

  if (!userId || (user && String(userId) === String(user.id))) return null;

  const following = isFollowing(userId);

  return (
    <button
      type="button"
      onClick={() => (following ? unfollow(userId) : follow(userId))}
      title={
        following
          ? `Отписаться от @${username || "пользователя"}`
          : `Подписаться на @${username || "пользователя"}`
      }
      className={
        className ||
        `ml-1 text-[11px] font-semibold px-3 py-1 rounded-md border-0 cursor-pointer transition-colors ${
          following
            ? "bg-[#363636] text-white hover:bg-[#262626]"
            : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
        }`
      }
    >
      {following ? "Отписаться" : "Подписаться"}
    </button>
  );
}



export default FollowButton;
