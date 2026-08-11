import { useEffect, useRef, useState } from "react";
import Avatar from "../../../shared/ui/Avatar";
import FollowButton from "../../../features/follow/ui/FollowButton";

function timeLabel(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChatThread = function ChatThread({
  user,
  thread,
  myId,
  onSend,
  onDeleteMessage,
  onClearThread,
}) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length]);

  const submit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#262626]">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user.avatar} name={user.username} size={34} />
          <span className="text-sm font-semibold truncate">@{user.username}</span>
        </div>
        <div className="flex items-center gap-3">
          {thread.length ? (
            <button
              type="button"
              onClick={onClearThread}
              title="Удалить все сообщения"
              aria-label="Удалить все сообщения"
              className="bg-transparent border-0 text-[#a8a8a8] hover:text-[#ed4956] cursor-pointer text-base transition-colors"
            >
              <i className="fa-regular fa-circle-xmark" />
            </button>
          ) : null}
          <FollowButton userId={user.id} username={user.username} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {thread.map((m, i) => {
          const mine = String(m.from) === String(myId);
          return (
            <div
              key={m.id || i}
              className={`group flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div className="relative max-w-[75%]">
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    mine ? "bg-[#0095f6] text-white" : "bg-[#262626] text-white"
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[10px] mt-0.5 ${
                      mine ? "text-white/70" : "text-[#a8a8a8]"
                    }`}
                  >
                    {timeLabel(m.createdAt)}
                  </div>
                </div>
                {!String(m.id).startsWith("m_temp_") ? (
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(m.id)}
                    title="Удалить сообщение"
                    aria-label="Удалить сообщение"
                    className={`absolute -top-1 w-5 h-5 -mr-1 rounded-full bg-[#262626] text-[#a8a8a8] opacity-0 group-hover:opacity-100 hover:text-[#ed4956] flex items-center justify-center border-0 cursor-pointer transition-opacity ${
                      mine ? "-right-1" : "-left-1"
                    }`}
                  >
                    <i className="fa-solid fa-trash-can text-[9px]" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 p-3 border-t border-[#262626]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение..."
          className="flex-1 bg-[#121212] border border-[#363636] rounded-lg px-3 py-2 text-sm outline-none text-white placeholder-[#a8a8a8]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer"
        >
          Отправить
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
