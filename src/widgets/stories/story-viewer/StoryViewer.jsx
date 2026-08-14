import { useEffect, useRef } from "react";
import FollowButton from "../../../features/follow/ui/FollowButton";

const DEFAULT_DURATION_MS = 5000;

const StoryViewer = function StoryViewer({
  groups,
  groupIndex,
  itemIndex,
  onClose,
  onPrev,
  onNext,
  isOwn = false,
  onDelete,
}) {
  const progressRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const group = groups[groupIndex];
  const item = group?.items?.[itemIndex];

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!item) return;

    const bar = progressRef.current;
    const isVideo = item.mediaType === "video";

    const startProgress = (duration) => {
      if (bar) {
        bar.style.transition = "none";
        bar.style.width = "0%";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (progressRef.current) {
              progressRef.current.style.transition = `width ${duration}ms linear`;
              progressRef.current.style.width = "100%";
            }
          });
        });
      }
      timerRef.current = setTimeout(() => onNext(), duration);
    };

    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      const onLoaded = () => {
        const duration = Math.min(
          (video.duration || 5) * 1000,
          15000, // максимум 15 сек на сторис
        );
        startProgress(duration);
      };

      if (video.readyState >= 1) {
        onLoaded();
      } else {
        video.addEventListener("loadedmetadata", onLoaded, { once: true });
      }
    } else {
      startProgress(DEFAULT_DURATION_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [groupIndex, itemIndex, item, onNext]);

  if (!group || !item) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="absolute inset-0 flex">
        <button
          type="button"
          className="w-1/3 h-full bg-transparent border-0 z-10 cursor-pointer"
          onClick={onPrev}
          aria-label="Предыдущая"
        />
        <button
          type="button"
          className="w-2/3 h-full bg-transparent border-0 z-10 cursor-pointer"
          onClick={onNext}
          aria-label="Следующая"
        />
      </div>

      <div className="relative z-20 px-3 pt-3 pb-2">
        <div className="flex gap-1 mb-3">
          {group.items.map((story, i) => (
            <div
              key={story.id}
              className="h-[2px] flex-1 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                ref={i === itemIndex ? progressRef : null}
                className="h-full bg-white rounded-full"
                style={{
                  width: i < itemIndex ? "100%" : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={
                group.avatar || `https://i.pravatar.cc/150?u=${group.username}`
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-semibold">{group.username}</span>
          </div>

          <div className="flex items-center gap-4">
            {isOwn ? (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Удалить историю"
                title="Удалить историю"
                className="bg-transparent border-0 text-[#ed4956] text-lg cursor-pointer"
              >
                <i className="fa-regular fa-trash-can" />
              </button>
            ) : (
              <FollowButton userId={group.userId} username={group.username} />
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border-0 text-white text-xl cursor-pointer"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-0 px-2 pointer-events-none">
        {item.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={item.mediaUrl}
            autoPlay
            playsInline
            muted
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            src={item.mediaUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
