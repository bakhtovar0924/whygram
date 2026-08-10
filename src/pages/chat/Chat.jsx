import { useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useConversations } from "../../features/chat/model/useConversations";
import ChatWindow from "../../widgets/chat/chat-window/ui/ChatWindow";

export default function Chat() {
  const { user } = useAuth();
  const { conversations, setMessages, refreshMessages } = useConversations();

  useEffect(() => {
    const t = setInterval(() => refreshMessages(), 3000);
    return () => clearInterval(t);
  }, [refreshMessages]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold">{user?.username}</h1>
        <i className="fa-regular fa-edit text-xl" />
      </div>
      <p className="text-xs text-[#a8a8a8] mb-4 uppercase tracking-wide">
        Сообщения
      </p>

      <ChatWindow
        conversations={conversations}
        myId={user?.id}
        setMessages={setMessages}
      />

      <p className="text-center text-xs text-[#a8a8a8] mt-6">
        Чат доступен для тех, на кого вы подписаны, кто подписан на вас, или взаимно.
      </p>
    </div>
  );
}

