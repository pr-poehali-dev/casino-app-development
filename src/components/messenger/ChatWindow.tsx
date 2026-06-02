import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { RealChat, RealMessage, formatTime } from "@/lib/api";

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

interface ChatWindowProps {
  chat: RealChat;
  messages: RealMessage[];
  loading: boolean;
  currentUserId: number;
  onSendMessage: (text: string) => void;
  onCallStart: (type: "voice" | "video") => void;
  onInfoClick: () => void;
}

export default function ChatWindow({ chat, messages, loading, currentUserId, onSendMessage, onCallStart, onInfoClick }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😊", "❤️", "🔥", "👍", "😂", "🎉", "💫", "🚀", "✨", "💜", "🌟", "👏"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText("");
    setShowEmoji(false);
    await onSendMessage(text);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const gradient = gradientFor(chat.id);

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: "rgba(13,15,26,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
      >
        <button onClick={onInfoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{chat.avatar_text}</span>
            </div>
            {chat.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full online-dot border-2 border-[#0d0f1a]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm">{chat.name}</span>
              <Icon name="Lock" size={11} className="text-violet-400" />
              {chat.is_group && <Icon name="Users" size={11} className="text-cyan-400" />}
            </div>
            <span className={`text-xs ${chat.online ? "text-emerald-400" : "text-white/40"}`}>
              {chat.online ? "онлайн" : "не в сети"}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCallStart("voice")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          >
            <Icon name="Phone" size={16} className="text-white/60" />
          </button>
          <button
            onClick={() => onCallStart("video")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          >
            <Icon name="Video" size={16} className="text-white/60" />
          </button>
          <button
            onClick={onInfoClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          >
            <Icon name="MoreVertical" size={16} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* E2E notice */}
      <div className="flex items-center justify-center gap-1.5 py-1.5" style={{ background: "rgba(139,92,246,0.06)" }}>
        <Icon name="Lock" size={11} className="text-violet-400" />
        <span className="text-violet-400/70 text-[10px]">Сообщения защищены end-to-end шифрованием</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {loading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-violet-400/30 border-t-violet-400 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 text-2xl`}>
                {chat.is_group ? "👥" : "👋"}
              </div>
              <p className="text-white/50 text-sm">Начните общение с {chat.name}</p>
              <p className="text-white/20 text-xs mt-1">Сообщения зашифрованы</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOut = msg.sender_id === currentUserId;
          const senderGradient = gradientFor(msg.sender_id);
          return (
            <div
              key={msg.id}
              className={`flex ${isOut ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{ animationDelay: `${Math.min(i, 10) * 0.02}s` }}
            >
              {!isOut && (
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${senderGradient} flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1`}>
                  <span className="text-white text-[9px] font-bold">{msg.sender_avatar}</span>
                </div>
              )}
              <div className="max-w-[65%]">
                {chat.is_group && !isOut && (
                  <p className="text-violet-400 text-[10px] font-medium mb-1 ml-1">@{msg.sender_name}</p>
                )}
                <div className={`px-4 py-2.5 ${isOut ? "message-bubble-out" : "message-bubble-in"}`}>
                  <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isOut ? "justify-end" : "justify-start"}`}>
                  <span className="text-white/25 text-[10px]">{formatTime(msg.created_at)}</span>
                  {isOut && <Icon name="CheckCheck" size={11} className="text-violet-400" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div
          className="px-4 py-3 flex flex-wrap gap-2 animate-slide-up"
          style={{ background: "rgba(13,15,26,0.9)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => setInputText(prev => prev + emoji)}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ background: "rgba(13,15,26,0.9)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              showEmoji ? "bg-violet-500/20 text-violet-300" : "hover:bg-white/8 text-white/50"
            }`}
          >
            <Icon name="Smile" size={18} />
          </button>

          <input
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            disabled={sending}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white placeholder:text-white/30 outline-none transition-all disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={(e) => (e.target.style.border = "1px solid rgba(139,92,246,0.4)")}
            onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30"
            style={{
              background: inputText.trim() && !sending
                ? "linear-gradient(135deg, #7c3aed, #22d3ee)"
                : "rgba(255,255,255,0.08)",
            }}
          >
            {sending
              ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Icon name="Send" size={16} className="text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
