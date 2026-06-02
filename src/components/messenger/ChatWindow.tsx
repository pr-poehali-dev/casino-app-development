import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Chat, Message } from "@/pages/Index";

const avatarGradients: Record<number, string> = {
  1: "from-violet-500 to-purple-600",
  2: "from-cyan-500 to-blue-600",
  3: "from-pink-500 to-rose-600",
  4: "from-emerald-500 to-teal-600",
  5: "from-orange-500 to-amber-600",
  6: "from-indigo-500 to-violet-600",
  7: "from-fuchsia-500 to-pink-600",
};

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onCallStart: (type: "voice" | "video") => void;
  onInfoClick: () => void;
}

export default function ChatWindow({ chat, messages, onSendMessage, onCallStart, onInfoClick }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😊", "❤️", "🔥", "👍", "😂", "🎉", "💫", "🚀", "✨", "💜", "🌟", "👏"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const gradient = avatarGradients[chat.id] || "from-violet-500 to-cyan-500";

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
              <span className="text-white text-xs font-bold">{chat.avatar}</span>
            </div>
            {chat.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full online-dot border-2 border-[#0d0f1a]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm">{chat.name}</span>
              {chat.encrypted && <Icon name="Lock" size={11} className="text-violet-400" />}
              {chat.isGroup && <Icon name="Users" size={11} className="text-cyan-400" />}
            </div>
            <span className={`text-xs ${chat.online ? "text-emerald-400" : "text-white/40"}`}>
              {chat.typing ? (
                <span className="text-violet-400">печатает сообщение...</span>
              ) : chat.online ? "онлайн" : "был(а) недавно"}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onCallStart("voice")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 hover:text-violet-300"
          >
            <Icon name="Phone" size={16} className="text-white/60" />
          </button>
          <button
            onClick={() => onCallStart("video")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 hover:text-cyan-300"
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
      {chat.encrypted && (
        <div className="flex items-center justify-center gap-1.5 py-2" style={{ background: "rgba(139,92,246,0.06)" }}>
          <Icon name="Lock" size={11} className="text-violet-400" />
          <span className="text-violet-400/70 text-[10px]">Сообщения защищены end-to-end шифрованием</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 text-2xl`}>
                {chat.isGroup ? "👥" : "👋"}
              </div>
              <p className="text-white/50 text-sm">Начните общение с {chat.name}</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.isOut ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            {!msg.isOut && (
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1`}>
                <span className="text-white text-[9px] font-bold">{chat.avatar}</span>
              </div>
            )}
            <div className="max-w-[65%]">
              <div className={`px-4 py-2.5 ${msg.isOut ? "message-bubble-out" : "message-bubble-in"}`}>
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 ${msg.isOut ? "justify-end" : "justify-start"}`}>
                <span className="text-white/25 text-[10px]">{msg.time}</span>
                {msg.isOut && (
                  <Icon
                    name={msg.status === "read" ? "CheckCheck" : msg.status === "delivered" ? "Check" : "Clock"}
                    size={11}
                    className={msg.status === "read" ? "text-violet-400" : "text-white/30"}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
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

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              className="w-full px-4 py-2.5 rounded-2xl text-sm text-white placeholder:text-white/30 outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.target.style.border = "1px solid rgba(139,92,246,0.4)")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.08)")}
            />
          </div>

          <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/8 transition-all flex-shrink-0 text-white/50 hover:text-white/70">
            <Icon name="Paperclip" size={17} />
          </button>

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30"
            style={{
              background: inputText.trim()
                ? "linear-gradient(135deg, #7c3aed, #22d3ee)"
                : "rgba(255,255,255,0.08)",
            }}
          >
            <Icon name="Send" size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
