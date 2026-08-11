import { useState } from "react";
import ChatList from "../chat-list/ChatList";
import ChatThread from "../chat-thread/ChatThread";
import {
  sendMessage,
  deleteMessage,
} from "../../../entities/message/messagesApi";

const ChatWindow = function ChatWindow({ conversations, myId, setMessages }) {
  const [activeId, setActiveId] = useState(
    conversations[0]?.user?.id || null
  );
  const active =
    conversations.find((c) => String(c.user.id) === String(activeId)) ||
    conversations[0] ||
    null;

  const handleSend = async (text) => {
    if (!active) return;
    const temp = {
      id: `m_temp_${Date.now()}`,
      from: String(myId),
      to: String(active.user.id),
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    try {
      const created = await sendMessage({
        from: myId,
        to: active.user.id,
        text,
      });
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? created : m)));
    } catch (e) {
      console.error(e);
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await deleteMessage(messageId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearThread = async () => {
    if (!active || !active.thread.length) return;
    if (!window.confirm("Удалить все сообщения?")) return;
    const ids = active.thread.map((m) => m.id);
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    try {
      await Promise.all(ids.map((id) => deleteMessage(id)));
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
            onDeleteMessage={handleDeleteMessage}
            onClearThread={handleClearThread}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#a8a8a8] text-sm">
            Выберите диалог
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
