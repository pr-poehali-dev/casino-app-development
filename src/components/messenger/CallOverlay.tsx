import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Chat } from "@/pages/Index";

interface CallOverlayProps {
  chat: Chat;
  type: "voice" | "video";
  onEnd: () => void;
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

export default function CallOverlay({ chat, type, onEnd }: CallOverlayProps) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [status, setStatus] = useState<"calling" | "connected">("calling");

  const gradient = avatarGradients[chat.id] || "from-violet-500 to-cyan-500";

  useEffect(() => {
    const connectTimer = setTimeout(() => setStatus("connected"), 2500);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (status !== "connected") return;
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(7,8,15,0.95)", backdropFilter: "blur(40px)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }} />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Avatar with ripple */}
        <div className="relative flex items-center justify-center">
          {status === "calling" && (
            <>
              <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${gradient} opacity-10 call-ripple`} />
              <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${gradient} opacity-10 call-ripple-2`} />
              <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${gradient} opacity-10 call-ripple-3`} />
            </>
          )}
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center relative z-10 shadow-2xl`}>
            <span className="text-white text-3xl font-bold">{chat.avatar}</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-1">{chat.name}</h2>
          <p className="text-white/50 text-sm flex items-center gap-1.5 justify-center">
            {type === "video" ? (
              <><Icon name="Video" size={13} /> Видеозвонок</>
            ) : (
              <><Icon name="Phone" size={13} /> Голосовой звонок</>
            )}
          </p>
          <p className={`text-sm mt-1 font-medium ${status === "connected" ? "text-emerald-400" : "text-yellow-400 animate-pulse-soft"}`}>
            {status === "calling" ? "Вызов..." : formatDuration(duration)}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => setMuted(!muted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              muted ? "bg-red-500/20 border border-red-500/40" : "hover:bg-white/10"
            }`}
            style={{ background: muted ? undefined : "rgba(255,255,255,0.08)" }}
          >
            <Icon name={muted ? "MicOff" : "Mic"} size={20} className={muted ? "text-red-400" : "text-white"} />
          </button>

          {type === "video" && (
            <button
              onClick={() => setVideoOff(!videoOff)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all`}
              style={{ background: videoOff ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)" }}
            >
              <Icon name={videoOff ? "VideoOff" : "Video"} size={20} className={videoOff ? "text-red-400" : "text-white"} />
            </button>
          )}

          {/* End call */}
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            <Icon name="PhoneOff" size={22} className="text-white" />
          </button>

          <button
            onClick={() => setSpeakerOff(!speakerOff)}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
            style={{ background: speakerOff ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)" }}
          >
            <Icon name={speakerOff ? "VolumeX" : "Volume2"} size={20} className={speakerOff ? "text-red-400" : "text-white"} />
          </button>

          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Icon name="MoreHorizontal" size={20} className="text-white" />
          </button>
        </div>

        {/* E2E badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <Icon name="Lock" size={11} className="text-violet-400" />
          <span className="text-violet-400 text-[10px] font-medium">Зашифрованный звонок</span>
        </div>
      </div>
    </div>
  );
}
