import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/messenger/Sidebar";
import ChatWindow from "@/components/messenger/ChatWindow";
import StoriesBar from "@/components/messenger/StoriesBar";
import ProfilePanel from "@/components/messenger/ProfilePanel";
import CallOverlay from "@/components/messenger/CallOverlay";
import StoryViewer from "@/components/messenger/StoryViewer";
import AuthScreen from "@/components/messenger/AuthScreen";
import {
  loadSession, clearSession, apiLogout, AuthUser,
  apiListChats, apiGetMessages, apiSendMessage,
  RealChat, RealMessage,
} from "@/lib/api";

export type View = "chats" | "contacts" | "profile";

export default function Index() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);

  const [chats, setChats] = useState<RealChat[]>([]);
  const [activeChat, setActiveChat] = useState<RealChat | null>(null);
  const [messages, setMessages] = useState<RealMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [view, setView] = useState<View>("chats");
  const [showProfile, setShowProfile] = useState(false);
  const [activeCall, setActiveCall] = useState<{ chat: RealChat; type: "voice" | "video" } | null>(null);
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Auth init ──────────────────────────────────────────
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
    setChats([]);
    setActiveChat(null);
    setMessages([]);
  };

  // ── Load chats ─────────────────────────────────────────
  const loadChats = useCallback(async () => {
    if (!authToken) return;
    const res = await apiListChats(authToken);
    if (res.ok) {
      const data = res.data as { chats: RealChat[] };
      setChats(data.chats || []);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) loadChats();
  }, [authToken, loadChats]);

  // Poll chats every 5 seconds
  useEffect(() => {
    if (!authToken) return;
    const t = setInterval(loadChats, 5000);
    return () => clearInterval(t);
  }, [authToken, loadChats]);

  // ── Load messages ──────────────────────────────────────
  const loadMessages = useCallback(async (chat: RealChat) => {
    setLoadingMsgs(true);
    const res = await apiGetMessages(authToken, chat.id);
    setLoadingMsgs(false);
    if (res.ok) {
      const data = res.data as { messages: RealMessage[] };
      setMessages(data.messages || []);
    }
  }, [authToken]);

  useEffect(() => {
    if (!activeChat) return;
    loadMessages(activeChat);
  }, [activeChat, loadMessages]);

  // Poll messages every 3 seconds
  useEffect(() => {
    if (!activeChat || !authToken) return;
    const t = setInterval(() => loadMessages(activeChat), 3000);
    return () => clearInterval(t);
  }, [activeChat, authToken, loadMessages]);

  // ── Select chat ────────────────────────────────────────
  const handleSelectChat = (chat: RealChat) => {
    setActiveChat(chat);
    setShowProfile(false);
    setMessages([]);
  };

  // ── Send message ───────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    if (!activeChat) return;
    const res = await apiSendMessage(authToken, activeChat.id, text);
    if (res.ok) {
      const data = res.data as { message: RealMessage };
      setMessages(prev => [...prev, data.message]);
      // Update last message in chat list
      setChats(prev => prev.map(c =>
        c.id === activeChat.id ? { ...c, last_message: text, last_at: new Date().toISOString() } : c
      ));
    }
  };

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authChecked) return null;
  if (!authUser) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-mesh">
      <Sidebar
        chats={filteredChats}
        activeChat={activeChat}
        view={view}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectChat={handleSelectChat}
        onViewChange={setView}
        onOpenProfile={() => setShowProfile(true)}
        currentUser={authUser}
        onLogout={handleLogout}
        authToken={authToken}
        onChatsUpdated={loadChats}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {view === "chats" && (
          <StoriesBar onStoryClick={setActiveStory} />
        )}

        {view === "chats" && activeChat ? (
          <ChatWindow
            chat={activeChat}
            messages={messages}
            loading={loadingMsgs}
            onSendMessage={handleSendMessage}
            onCallStart={(type) => setActiveCall({ chat: activeChat, type })}
            onInfoClick={() => setShowProfile(true)}
            currentUserId={authUser.id}
          />
        ) : view === "chats" ? (
          <EmptyState hasChats={chats.length > 0} />
        ) : view === "profile" ? (
          <ProfilePanel standalone currentUser={authUser} onClose={() => setView("chats")} />
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

function EmptyState({ hasChats }: { hasChats: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full gradient-purple-cyan flex items-center justify-center text-3xl">
        💬
      </div>
      <p className="text-white/40 text-sm">
        {hasChats ? "Выберите чат для начала общения" : "Нажмите ✏️ в боковой панели, чтобы найти собеседника"}
      </p>
    </div>
  );
}
