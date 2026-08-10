import { useEffect, useRef, useState } from "react";
import Avatar from "../../../../shared/ui/Avatar";
import FollowButton from "../../../../features/follow/ui/FollowButton";

function timeLabel(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThread({ user, thread, myId, onSend }) {
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
        <FollowButton userId={user.id} username={user.username} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {thread.map((m, i) => {
          const mine = String(m.from) === String(myId);
          return (
            <div
              key={m.id || i}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
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
}
