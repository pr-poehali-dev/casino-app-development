import { useState } from "react";

const STORIES = [
  { id: 0, name: "Моя история", avatar: "ВЫ", gradient: "from-violet-500 to-cyan-500", viewed: false, isOwn: true },
  { id: 1, name: "Алексей", avatar: "АМ", gradient: "from-pink-500 to-violet-600", viewed: false },
  { id: 2, name: "Команда", avatar: "КП", gradient: "from-cyan-500 to-blue-600", viewed: false },
  { id: 3, name: "Мария", avatar: "МС", gradient: "from-emerald-500 to-teal-600", viewed: true },
  { id: 4, name: "Иван", avatar: "ИП", gradient: "from-orange-500 to-amber-600", viewed: true },
  { id: 5, name: "Dev Space", avatar: "DS", gradient: "from-fuchsia-500 to-pink-600", viewed: true },
];

interface StoriesBarProps {
  onStoryClick: (index: number) => void;
}

export default function StoriesBar({ onStoryClick }: StoriesBarProps) {
  const [viewedStories, setViewedStories] = useState<Set<number>>(new Set([3, 4, 5]));

  const handleClick = (story: typeof STORIES[0]) => {
    if (!story.isOwn) {
      setViewedStories(prev => new Set([...prev, story.id]));
      onStoryClick(story.id);
    }
  };

  return (
    <div
      className="flex-shrink-0 px-4 py-3 overflow-x-auto flex gap-3 items-center"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(13,15,26,0.6)" }}
    >
      {STORIES.map((story) => {
        const isViewed = viewedStories.has(story.id);
        return (
          <button
            key={story.id}
            onClick={() => handleClick(story)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className={`${isViewed || story.isOwn ? "story-ring-viewed" : "story-ring"} transition-all`}>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${story.gradient} flex items-center justify-center`}
                style={{ margin: "2px" }}>
                {story.isOwn ? (
                  <span className="text-white text-lg">+</span>
                ) : (
                  <span className="text-white text-xs font-bold">{story.avatar}</span>
                )}
              </div>
            </div>
            <span className={`text-[10px] font-medium truncate max-w-[52px] transition-colors ${
              isViewed ? "text-white/30" : "text-white/70"
            } group-hover:text-white/90`}>
              {story.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
