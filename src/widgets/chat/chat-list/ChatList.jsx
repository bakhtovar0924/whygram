import Avatar from "../../../shared/ui/Avatar";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

const ChatList = function ChatList({ conversations, activeId, onSelect }) {
  if (!conversations.length) {
    return (
      <p className="text-[#a8a8a8] text-sm text-center py-10">
        Нет собеседников. Подпишитесь на кого-нибудь или подпишитесь на вас.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((c) => (
        <button
          key={c.user.id}
          type="button"
          onClick={() => onSelect(c.user.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border-0 cursor-pointer text-left transition-colors ${
            activeId === c.user.id ? "bg-[#121212]" : "bg-transparent hover:bg-[#121212]"
          }`}
        >
          <Avatar src={c.user.avatar} name={c.user.username} size={44} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white truncate">
                {c.user.username}
              </span>
              <span className="text-[10px] text-[#a8a8a8] shrink-0">
                {c.lastMessage ? formatTime(c.lastMessage.createdAt) : ""}
              </span>
            </div>
            <div className="text-xs text-[#a8a8a8] truncate">
              {c.isFollowingMe && !c.isFollowingThem ? (
                <span className="text-[#0095f6] font-semibold">Подписан(а) на вас · </span>
              ) : c.isFollowingThem && !c.isFollowingMe ? (
                <span className="text-[#0095f6] font-semibold">Вы подписаны · </span>
              ) : c.mutual ? (
                <span className="text-emerald-400 font-semibold">Взаимно · </span>
              ) : null}
              {c.lastMessage?.text || "Начните общение"}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}



export default ChatList;
