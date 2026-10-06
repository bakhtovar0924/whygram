import { useEffect, useRef, useState } from "react";
import Avatar from "../../../shared/ui/Avatar";
import FollowButton from "../../../features/follow/ui/FollowButton";
import { Link } from "react-router-dom";

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
  onBack,
}) {
  const [text, setText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
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
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-[#262626]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Назад к списку диалогов"
            className="md:hidden shrink-0 bg-transparent border-0 text-[#a8a8a8] hover:text-white p-1 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <Link
            to={`/u/${encodeURIComponent(user.username)}`}
            aria-label={`Открыть профиль @${user.username}`}
            className="shrink-0"
          >
            <Avatar src={user.avatar} name={user.username} size={34} />
          </Link>
          <Link
            to={`/u/${encodeURIComponent(user.username)}`}
            className="text-sm font-semibold truncate text-white"
          >
            @{user.username}
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {thread.map((m, i) => {
          const mine = String(m.from) === String(myId);
          const messageId = String(m.id || i);
          const isSelected = selectedMessageId === messageId;
          return (
            <div
              key={m.id || i}
              className={`group flex ${
                isSelected ? "pb-8" : "md:hover:pb-8"
              } ${mine ? "justify-end" : "justify-start"}`}
            >
              <div className="relative min-w-18 max-w-[75%]">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMessageId(isSelected ? null : messageId)
                  }
                  aria-label={`Показать действия для сообщения: ${m.text}`}
                  aria-expanded={isSelected}
                  className={`block w-full text-left px-3 py-2 rounded-2xl text-sm wrap-break-word border-0 cursor-pointer transition-shadow ${
                    mine ? "bg-[#0095f6] text-white" : "bg-[#262626] text-white"
                  } ${isSelected ? "ring-2 ring-white/40" : ""}`}
                >
                  {m.text}
                  <div
                    className={`text-[10px] mt-0.5 ${
                      mine ? "text-white/70" : "text-[#a8a8a8]"
                    }`}
                  >
                    {timeLabel(m.createdAt)}
                  </div>
                </button>
                {!String(m.id).startsWith("m_temp_") ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMessageId(null);
                      onDeleteMessage(m.id);
                    }}
                    title="Удалить сообщение"
                    aria-label={`Удалить сообщение: ${m.text}`}
                    className={`absolute left-0 top-full mt-1 min-h-7 min-w-18 max-w-full px-2 py-1 rounded-md bg-[#262626] text-[#a8a8a8] text-xs ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                    } hover:text-[#ed4956] inline-flex items-center justify-center gap-2 border-0 cursor-pointer transition-opacity`}
                  >
                    <i className="fa-solid fa-trash-can" />
                    <span>Удалить</span>
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
        className="flex items-center gap-2 p-2 sm:p-3 border-t border-[#262626]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение..."
          className="flex-1 min-w-0 bg-[#121212] border border-[#363636] rounded-lg px-3 py-2 text-sm outline-none text-white placeholder-[#a8a8a8]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Отправить сообщение"
          className="bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg border-0 cursor-pointer shrink-0"
        >
          <i className="fa-regular fa-paper-plane sm:hidden" />
          <span className="hidden sm:inline">Отправить</span>
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
