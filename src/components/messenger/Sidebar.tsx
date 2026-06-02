import { useState } from "react";
import Icon from "@/components/ui/icon";
import { View } from "@/pages/Index";
import { AuthUser, RealChat, UserResult, apiFindUsers, apiOpenChat, formatTime } from "@/lib/api";

interface SidebarProps {
  chats: RealChat[];
  activeChat: RealChat | null;
  view: View;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectChat: (chat: RealChat) => void;
  onViewChange: (v: View) => void;
  onOpenProfile: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  authToken: string;
  onChatsUpdated: () => void;
}

const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-indigo-500 to-violet-600",
  "from-fuchsia-500 to-pink-600",
];

function gradientFor(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

export default function Sidebar({
  chats, activeChat, view, searchQuery,
  onSearchChange, onSelectChat, onViewChange, onOpenProfile,
  currentUser, onLogout, authToken, onChatsUpdated,
}: SidebarProps) {
  const [showNewChat, setShowNewChat] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [opening, setOpening] = useState<number | null>(null);

  const handleFindUsers = async (q: string) => {
    setUserQuery(q);
    if (q.length < 2) { setUserResults([]); return; }
    setSearching(true);
    const res = await apiFindUsers(authToken, q);
    setSearching(false);
    if (res.ok) {
      const d = res.data as { users: UserResult[] };
      setUserResults(d.users || []);
    }
  };

  const handleOpenChat = async (user: UserResult) => {
    setOpening(user.id);
    const res = await apiOpenChat(authToken, user.id);
    setOpening(null);
    if (res.ok) {
      const d = res.data as { chat_id: number };
      await onChatsUpdated();
      setShowNewChat(false);
      setUserQuery("");
      setUserResults([]);
      // find and open the chat
      const found = chats.find(c => c.id === d.chat_id);
      if (found) onSelectChat(found);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col h-full" style={{ background: "var(--bg-surface)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-purple-cyan flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">NexChat</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowNewChat(v => !v)}
              title="Новый чат"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showNewChat ? "bg-violet-500/20" : "hover:bg-white/10"}`}
            >
              <Icon name="SquarePen" size={16} className={showNewChat ? "text-violet-300" : "text-white/50"} />
            </button>
            <button
              onClick={() => onViewChange("profile")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            >
              <Icon name="SlidersHorizontal" size={16} className="text-white/50" />
            </button>
          </div>
        </div>

        {/* New chat panel */}
        {showNewChat && (
          <div className="mb-3 animate-fade-in">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={userQuery}
                onChange={e => handleFindUsers(e.target.value)}
                placeholder="Найти пользователя..."
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}
              />
            </div>
            {searching && (
              <p className="text-white/30 text-xs mt-2 ml-1">Поиск...</p>
            )}
            {userResults.length > 0 && (
              <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {userResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleOpenChat(u)}
                    disabled={opening === u.id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradientFor(u.id)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{u.avatar_text}</span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-white text-sm font-medium truncate">@{u.username}</p>
                      <p className={`text-xs ${u.online ? "text-emerald-400" : "text-white/30"}`}>
                        {u.online ? "онлайн" : "не в сети"}
                      </p>
                    </div>
                    {opening === u.id ? (
                      <div className="w-4 h-4 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
                    ) : (
                      <Icon name="MessageCirclePlus" size={15} className="text-violet-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {userQuery.length >= 2 && !searching && userResults.length === 0 && (
              <p className="text-white/25 text-xs mt-2 ml-1">Пользователи не найдены</p>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={(e) => (e.target.style.border = "1px solid rgba(139,92,246,0.4)")}
            onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
          />
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex px-4 gap-1 mb-3">
        {([
          { key: "chats", icon: "MessageSquare", label: "Чаты" },
          { key: "profile", icon: "User", label: "Профиль" },
        ] as { key: View; icon: string; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => onViewChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              view === tab.key
                ? "nav-item-active text-violet-300"
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            <Icon name={tab.icon} size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2">
        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Icon name="MessageSquarePlus" size={20} className="text-white/20" />
            </div>
            <p className="text-white/25 text-xs text-center px-4">
              Нажмите ✏️ выше, чтобы начать переписку
            </p>
          </div>
        )}
        {chats.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 transition-all text-left animate-fade-in ${
              activeChat?.id === chat.id ? "nav-item-active" : "hover:bg-white/4"
            }`}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradientFor(chat.id)} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{chat.avatar_text}</span>
              </div>
              {chat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full online-dot border-2 border-[#0d0f1a]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-white text-sm font-semibold truncate">{chat.name}</span>
                  <Icon name="Lock" size={10} className="text-violet-400 flex-shrink-0" />
                  {chat.is_group && <Icon name="Users" size={10} className="text-cyan-400 flex-shrink-0" />}
                </div>
                <span className="text-white/30 text-[10px] flex-shrink-0 ml-1">
                  {formatTime(chat.last_at)}
                </span>
              </div>
              <span className="text-white/40 text-xs truncate block">
                {chat.last_message || "Нет сообщений"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all min-w-0"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">{currentUser?.avatar_text || "ВЫ"}</span>
          </div>
          <div className="text-left min-w-0">
            <p className="text-white text-xs font-medium truncate max-w-[120px]">
              {currentUser?.username || "Профиль"}
            </p>
            <p className="text-emerald-400 text-[10px]">● онлайн</p>
          </div>
        </button>
        <div className="flex gap-1">
          <button className="w-8 h-8 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center">
            <Icon name="Bell" size={15} className="text-white/40" />
          </button>
          <button
            onClick={onLogout}
            title="Выйти"
            className="w-8 h-8 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center group"
          >
            <Icon name="LogOut" size={15} className="text-white/40 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}
