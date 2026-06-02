import Icon from "@/components/ui/icon";
import { Chat } from "@/pages/Index";

interface ProfilePanelProps {
  chat?: Chat;
  standalone?: boolean;
  onClose: () => void;
}

const avatarGradients: Record<number, string> = {
  1: "from-violet-500 to-purple-600",
  2: "from-cyan-500 to-blue-600",
  3: "from-pink-500 to-rose-600",
  4: "from-emerald-500 to-teal-600",
  5: "from-orange-500 to-amber-600",
  6: "from-indigo-500 to-violet-600",
  7: "from-fuchsia-500 to-pink-600",
};

export default function ProfilePanel({ chat, standalone, onClose }: ProfilePanelProps) {
  const isOwn = standalone || !chat;
  const gradient = chat ? (avatarGradients[chat.id] || "from-violet-500 to-cyan-500") : "from-violet-500 to-cyan-500";
  const name = chat?.name || "Мой профиль";
  const avatar = chat?.avatar || "ВЫ";

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col h-full animate-slide-in-right"
      style={{ background: "var(--bg-surface)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <span className="text-white font-semibold text-sm">{isOwn ? "Мой профиль" : "Профиль"}</span>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
          <Icon name="X" size={16} className="text-white/60" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-4 pb-5 pt-2">
        <div className="relative mb-3">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white text-xl font-bold">{avatar}</span>
          </div>
          {isOwn && (
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl gradient-purple-cyan flex items-center justify-center shadow-lg">
              <Icon name="Camera" size={12} className="text-white" />
            </button>
          )}
          {!isOwn && chat?.online && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full online-dot border-2 border-[#0d0f1a]" />
          )}
        </div>
        <h3 className="text-white font-bold text-base mb-0.5">{name}</h3>
        {!isOwn && (
          <span className={`text-xs ${chat?.online ? "text-emerald-400" : "text-white/40"}`}>
            {chat?.online ? "онлайн" : "был(а) недавно"}
          </span>
        )}
        {isOwn && (
          <span className="text-emerald-400 text-xs">● онлайн</span>
        )}
      </div>

      {/* Status */}
      <div className="mx-4 mb-4 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-1">Статус</p>
        <p className="text-white/80 text-sm">
          {isOwn ? "🚀 Разрабатываю крутые проекты" : chat?.isGroup ? "👥 Групповой чат" : "💬 На связи в мессенджере"}
        </p>
      </div>

      {/* Info */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { icon: isOwn ? "User" : "MessageCircle", label: isOwn ? "Имя пользователя" : "Написать", value: isOwn ? "@username" : "Открыть чат" },
          { icon: "Lock", label: "Шифрование", value: "End-to-End" },
          ...(isOwn ? [{ icon: "Bell", label: "Уведомления", value: "Включены" }] : []),
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
              <Icon name={item.icon} size={14} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{item.label}</p>
              <p className="text-white/80 text-xs truncate">{item.value}</p>
            </div>
            <Icon name="ChevronRight" size={13} className="text-white/20" />
          </div>
        ))}
      </div>

      {/* Actions */}
      {!isOwn && (
        <div className="px-4 flex flex-col gap-2">
          <button className="w-full py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            Написать сообщение
          </button>
          <button className="w-full py-2.5 rounded-2xl text-sm font-medium transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Позвонить
          </button>
        </div>
      )}

      {isOwn && (
        <div className="px-4">
          <button className="w-full py-2.5 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #22d3ee)" }}>
            Редактировать профиль
          </button>
        </div>
      )}

      {/* Shared media placeholder */}
      {!isOwn && (
        <div className="px-4 mt-4">
          <p className="text-white/30 text-[10px] font-medium uppercase tracking-wider mb-2">Медиафайлы</p>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl"
                style={{
                  background: `linear-gradient(135deg, hsl(${i * 40 + 240}, 60%, 30%), hsl(${i * 40 + 280}, 60%, 20%))`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
