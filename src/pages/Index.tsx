import { useState, useEffect } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatWindow from "@/components/messenger/ChatWindow";
import StoriesBar from "@/components/messenger/StoriesBar";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import CallOverlay from "@/components/messenger/CallOverlay";
import StoryViewer from "@/components/messenger/StoryViewer";
import AuthScreen from "@/components/messenger/AuthScreen";
import { loadSession, clearSession, apiLogout, AuthUser } from "@/lib/api";

export type View = "chats" | "contacts" | "profile" | "settings";
export type Chat = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup: boolean;
  encrypted: boolean;
  typing?: boolean;
};

export type Message = {
  id: number;
  text: string;
  time: string;
  isOut: boolean;
  status: "sent" | "delivered" | "read";
  type: "text" | "image";
};

export const CHATS: Chat[] = [
  { id: 1, name: "Алексей Миронов", avatar: "АМ", lastMessage: "Когда встречаемся?", time: "14:32", unread: 3, online: true, isGroup: false, encrypted: true, typing: true },
  { id: 2, name: "Команда Проекта", avatar: "КП", lastMessage: "Дизайн готов 🔥", time: "13:15", unread: 12, online: true, isGroup: true, encrypted: true },
  { id: 3, name: "Мария Соколова", avatar: "МС", lastMessage: "Спасибо за помощь!", time: "вчера", unread: 0, online: false, isGroup: false, encrypted: true },
  { id: 4, name: "Иван Петров", avatar: "ИП", lastMessage: "Отлично, договорились", time: "вчера", unread: 0, online: true, isGroup: false, encrypted: true },
  { id: 5, name: "Dev Space 🚀", avatar: "DS", lastMessage: "Новый релиз вышел!", time: "пн", unread: 5, online: false, isGroup: true, encrypted: false },
  { id: 6, name: "Анна Кузнецова", avatar: "АК", lastMessage: "Увидимся завтра", time: "пн", unread: 0, online: false, isGroup: false, encrypted: true },
  { id: 7, name: "Денис Волков", avatar: "ДВ", lastMessage: "👍", time: "вс", unread: 0, online: false, isGroup: false, encrypted: true },
];

const MESSAGES_MAP: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Привет! Как дела?", time: "14:20", isOut: false, status: "read", type: "text" },
    { id: 2, text: "Всё отлично, работаю над проектом 🚀", time: "14:21", isOut: true, status: "read", type: "text" },
    { id: 3, text: "Звучит круто! Что за проект?", time: "14:22", isOut: false, status: "read", type: "text" },
    { id: 4, text: "Мессенджер с E2E шифрованием. Почти готов!", time: "14:25", isOut: true, status: "read", type: "text" },
    { id: 5, text: "Когда встречаемся?", time: "14:32", isOut: false, status: "read", type: "text" },
  ],
  2: [
    { id: 1, text: "Ребята, статус по задачам?", time: "13:00", isOut: false, status: "read", type: "text" },
    { id: 2, text: "Бэкенд готов на 90%", time: "13:05", isOut: true, status: "read", type: "text" },
    { id: 3, text: "Дизайн готов 🔥", time: "13:15", isOut: false, status: "read", type: "text" },
  ],
  3: [
    { id: 1, text: "Можешь помочь с настройкой?", time: "вчера 18:00", isOut: false, status: "read", type: "text" },
    { id: 2, text: "Конечно, что нужно сделать?", time: "вчера 18:05", isOut: true, status: "read", type: "text" },
    { id: 3, text: "Спасибо за помощь!", time: "вчера 19:30", isOut: false, status: "read", type: "text" },
  ],
};

export default function Index() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setAuthUser(session.user);
      setAuthToken(session.token);
    }
    setAuthChecked(true);
  }, []);

  const handleAuth = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
  };

  const handleLogout = async () => {
    await apiLogout(authToken);
    clearSession();
    setAuthUser(null);
    setAuthToken("");
  };

  const [activeChat, setActiveChat] = useState<Chat | null>(CHATS[0]);
  const [view, setView] = useState<View>("chats");
  const [showProfile, setShowProfile] = useState(false);
  const [activeCall, setActiveCall] = useState<{ chat: Chat; type: "voice" | "video" } | null>(null);
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, Message[]>>(MESSAGES_MAP);
  const [searchQuery, setSearchQuery] = useState("");

  if (!authChecked) return null;
  if (!authUser) return <AuthScreen onAuth={handleAuth} />;

  const handleSendMessage = (text: string) => {
    if (!activeChat) return;
    const newMessage: Message = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      isOut: true,
      status: "sent",
      type: "text",
    };
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage],
    }));
  };

  const filteredChats = CHATS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mesh">
      <Sidebar
        chats={filteredChats}
        activeChat={activeChat}
        view={view}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectChat={(chat) => { setActiveChat(chat); setShowProfile(false); }}
        onViewChange={setView}
        onOpenProfile={() => setShowProfile(true)}
        currentUser={authUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {view === "chats" && (
          <StoriesBar onStoryClick={setActiveStory} />
        )}

        {view === "chats" && activeChat ? (
          <ChatWindow
            chat={activeChat}
            messages={messages[activeChat.id] || []}
            onSendMessage={handleSendMessage}
            onCallStart={(type) => setActiveCall({ chat: activeChat, type })}
            onInfoClick={() => setShowProfile(true)}
          />
        ) : view === "chats" ? (
          <EmptyState />
        ) : view === "profile" ? (
          <ProfilePanel standalone onClose={() => setView("chats")} />
        ) : null}
      </div>

      {showProfile && activeChat && (
        <ProfilePanel
          chat={activeChat}
          onClose={() => setShowProfile(false)}
        />
      )}

      {activeCall && (
        <CallOverlay
          chat={activeCall.chat}
          type={activeCall.type}
          onEnd={() => setActiveCall(null)}
        />
      )}

      {activeStory !== null && (
        <StoryViewer
          storyIndex={activeStory}
          onClose={() => setActiveStory(null)}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full gradient-purple-cyan flex items-center justify-center text-3xl">
        💬
      </div>
      <p className="text-white/40 text-sm">Выберите чат для начала общения</p>
    </div>
  );
}