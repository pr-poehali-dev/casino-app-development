import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Chat, View } from "@/pages/Index";
import { AuthUser } from "@/lib/api";

interface SidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  view: View;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectChat: (chat: Chat) => void;
  onViewChange: (v: View) => void;
  onOpenProfile: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-indigo-500 to-violet-600",
  "from-fuchsia-500 to-pink-600",
];

export default function Sidebar({
  chats, activeChat, view, searchQuery,
  onSearchChange, onSelectChat, onViewChange, onOpenProfile,
  currentUser, onLogout,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
          <button
            onClick={() => onViewChange("profile")}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          >
            <Icon name="SlidersHorizontal" size={16} className="text-white/50" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск..."
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
          { key: "contacts", icon: "Users", label: "Контакты" },
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
        {chats.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            onMouseEnter={() => setHoveredId(chat.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 transition-all text-left animate-fade-in ${
              activeChat?.id === chat.id
                ? "nav-item-active"
                : "hover:bg-white/4"
            }`}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">{chat.avatar}</span>
              </div>
              {chat.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full online-dot border-2 border-[#0d0f1a]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-white text-sm font-semibold truncate">{chat.name}</span>
                  {chat.encrypted && (
                    <Icon name="Lock" size={10} className="text-violet-400 flex-shrink-0" />
                  )}
                  {chat.isGroup && (
                    <Icon name="Users" size={10} className="text-cyan-400 flex-shrink-0" />
                  )}
                </div>
                <span className="text-white/30 text-[10px] flex-shrink-0 ml-1">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                {chat.typing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-violet-400 text-xs">печатает</span>
                    <div className="flex gap-0.5 items-end">
                      <span className="w-1 h-1 rounded-full bg-violet-400 typing-dot" />
                      <span className="w-1 h-1 rounded-full bg-violet-400 typing-dot" />
                      <span className="w-1 h-1 rounded-full bg-violet-400 typing-dot" />
                    </div>
                  </div>
                ) : (
                  <span className="text-white/40 text-xs truncate">{chat.lastMessage}</span>
                )}
                {chat.unread > 0 && (
                  <span className="ml-2 min-w-5 h-5 rounded-full gradient-purple-cyan flex items-center justify-center text-white text-[10px] font-bold px-1.5 flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="p-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all min-w-0"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">
              {currentUser?.avatar_text || "ВЫ"}
            </span>
          </div>
          <div className="text-left min-w-0">
            <p className="text-white text-xs font-medium truncate max-w-[120px]">
              {currentUser?.username || "Мой профиль"}
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