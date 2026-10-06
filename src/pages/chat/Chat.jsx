import { useEffect } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import useConversations from "../../features/chat/useConversations";
import ChatWindow from "../../widgets/chat/chat-window/ChatWindow";

const Chat = function Chat() {
  const { user } = useAuth();
  const { conversations, setMessages, refreshMessages } = useConversations();

  useEffect(() => {
    const t = setInterval(() => refreshMessages(), 3000);
    return () => clearInterval(t);
  }, [refreshMessages]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg sm:text-xl font-bold truncate">{user?.username}</h1>
        <i className="fa-regular fa-edit text-lg sm:text-xl shrink-0 ml-3" />
      </div>
      <p className="text-xs text-[#a8a8a8] mb-4 uppercase tracking-wide">
        Сообщения
      </p>

      <ChatWindow
        conversations={conversations}
        myId={user?.id}
        setMessages={setMessages}
      />

      <p className="text-center text-[11px] sm:text-xs text-[#a8a8a8] mt-3 sm:mt-6 px-2">
        Чат доступен для тех, на кого вы подписаны, кто подписан на вас, или взаимно.
      </p>
    </div>
  );
}




export default Chat;
