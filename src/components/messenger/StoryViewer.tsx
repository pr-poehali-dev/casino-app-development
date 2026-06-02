import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const STORIES_DATA = [
  {
    id: 1, name: "Алексей Миронов", avatar: "АМ", gradient: "from-violet-500 to-purple-600",
    items: [
      { bg: "from-violet-900 via-purple-800 to-indigo-900", emoji: "🚀", text: "Работаю над новым проектом!", time: "14:20" },
      { bg: "from-blue-900 via-indigo-800 to-violet-900", emoji: "💻", text: "Coding time ✨", time: "13:45" },
    ]
  },
  {
    id: 2, name: "Команда Проекта", avatar: "КП", gradient: "from-cyan-500 to-blue-600",
    items: [
      { bg: "from-cyan-900 via-teal-800 to-blue-900", emoji: "🎉", text: "Дизайн готов! Запускаем на этой неделе", time: "11:30" },
    ]
  },
  {
    id: 3, name: "Мария Соколова", avatar: "МС", gradient: "from-pink-500 to-rose-600",
    items: [
      { bg: "from-pink-900 via-rose-800 to-fuchsia-900", emoji: "🌸", text: "Хороший день 🌞", time: "09:15" },
      { bg: "from-fuchsia-900 via-pink-800 to-rose-900", emoji: "☕", text: "Утренний кофе и код", time: "08:30" },
    ]
  },
];

interface StoryViewerProps {
  storyIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ storyIndex, onClose }: StoryViewerProps) {
  const storyUser = STORIES_DATA[Math.min(storyIndex - 1, STORIES_DATA.length - 1)] || STORIES_DATA[0];
  const [currentItem, setCurrentItem] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentItem < storyUser.items.length - 1) {
            setCurrentItem(c => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, currentItem, storyUser.items.length, onClose]);

  useEffect(() => {
    setProgress(0);
  }, [currentItem]);

  const item = storyUser.items[currentItem];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <div
        className="relative w-80 h-[560px] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${item.bg}`} />

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {storyUser.items.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
              <div
                className="h-full rounded-full bg-white transition-none"
                style={{
                  width: i < currentItem ? "100%" : i === currentItem ? `${progress}%` : "0%",
                  transition: i === currentItem ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${storyUser.gradient} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{storyUser.avatar}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{storyUser.name}</p>
              <p className="text-white/60 text-[10px]">{item.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all">
            <Icon name="X" size={18} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-7xl mb-6">{item.emoji}</span>
          <p className="text-white text-lg font-semibold text-center px-8 leading-relaxed">{item.text}</p>
        </div>

        {/* Navigation zones */}
        <button
          className="absolute left-0 top-0 w-1/3 h-full z-30 opacity-0"
          onClick={() => {
            if (currentItem > 0) { setCurrentItem(c => c - 1); setProgress(0); }
          }}
        />
        <button
          className="absolute right-0 top-0 w-1/3 h-full z-30 opacity-0"
          onClick={() => {
            if (currentItem < storyUser.items.length - 1) { setCurrentItem(c => c + 1); setProgress(0); }
            else onClose();
          }}
        />

        {/* Reply input */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex items-center gap-2">
            <input
              placeholder="Ответить..."
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm text-white placeholder:text-white/60 outline-none"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(10px)" }}
            />
            <button className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <Icon name="Send" size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
