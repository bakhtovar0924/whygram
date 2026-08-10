import { useState } from "react";
import ChatList from "../../chat-list/ui/ChatList";
import ChatThread from "../../chat-thread/ui/ChatThread";
import { sendMessage } from "../../../../entities/message/api/messagesApi";

export default function ChatWindow({ conversations, myId, setMessages }) {
  const [activeId, setActiveId] = useState(
    conversations[0]?.user?.id || null
  );
  const active =
    conversations.find((c) => String(c.user.id) === String(activeId)) ||
    conversations[0] ||
    null;

  const handleSend = async (text) => {
    if (!active) return;
    try {
      const created = await sendMessage({
        from: myId,
        to: active.user.id,
        text,
      });
      setMessages((prev) => [...prev, created]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="border border-[#262626] rounded-xl overflow-hidden bg-black flex flex-col md:flex-row"
      style={{ height: "min(70vh, 560px)" }}
    >
      <div
        className={`md:w-72 shrink-0 md:border-r md:border-[#262626] overflow-y-auto ${
          active ? "hidden md:block" : "block"
        }`}
      >
        <ChatList
          conversations={conversations}
          activeId={active?.user?.id}
          onSelect={setActiveId}
        />
      </div>

      <div className={`flex-1 min-h-0 ${active ? "block" : "hidden md:block"}`}>
        {active ? (
          <ChatThread
            user={active.user}
            thread={active.thread}
            myId={myId}
            onSend={handleSend}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#a8a8a8] text-sm">
            Выберите диалог
          </div>
        )}
      </div>
    </div>
  );
}
