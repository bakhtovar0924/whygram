import { useEffect, useRef, useState } from "react";
import { IconButton, Typography, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FollowButton from "../../../features/follow/ui/FollowButton";
import { formatCount } from "../../../shared/lib/formatCount";

const ReelCard = function ReelCard({ reel, isLiked, onLike, onOpenComments }) {
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const username = reel.user?.username || reel.username || "user";
  const avatar =
    reel.user?.avatar ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;
  const caption = reel.caption || "";
  const isLong = caption.length > 80;
  const showCaption =
    expanded || !isLong ? caption : caption.slice(0, 80) + "…";

  // Видео воспроизводится только когда карточка видна в кадре
  useEffect(() => {
    const video = videoRef.current;
    const el = containerRef.current;
    if (!video || !el) return;

    let observer;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setPlaying(true);
          } else {
            video.pause();
            setPlaying(false);
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(el);
    } else {
      video.play().catch(() => {});
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "#000",
        overflow: "hidden",
        cursor: "pointer",
        touchAction: "pan-y",
      }}
    >
      {/* Видео */}
      <video
        ref={videoRef}
        src={reel.mediaUrl}
        muted={muted}
        loop
        playsInline
        onClick={togglePlay}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* Затемнение снизу как в Instagram */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 35%, transparent 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Индикатор play при паузе */}
      {!playing && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <PlayArrowIcon
            sx={{ fontSize: 80, color: "rgba(255,255,255,0.85)" }}
          />
        </Box>
      )}

      {/* Правая колонка действий */}
      <Box
        sx={{
          position: "absolute",
          right: 12,
          bottom: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2.5,
          zIndex: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <IconButton
            onClick={onLike}
            sx={{ color: isLiked ? "#ed4956" : "#fff", p: 0.5 }}
          >
            {isLiked ? (
              <FavoriteIcon sx={{ fontSize: 32 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 32 }} />
            )}
          </IconButton>
          <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
            {formatCount(reel.likesCount || 0)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <IconButton onClick={onOpenComments} sx={{ color: "#fff", p: 0.5 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Typography sx={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
            {formatCount(reel.commentsCount || reel.comments?.length || 0)}
          </Typography>
        </Box>

        <IconButton sx={{ color: "#fff", p: 0.5 }}>
          <SendOutlinedIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton sx={{ color: "#fff", p: 0.5 }}>
          <MoreHorizIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {/* Кнопка звука (как в Instagram — слева внизу) */}
      <div className="flex absolute right-3 bottom-8">
        <IconButton
          onClick={toggleMute}
          sx={{
            zIndex: 3,
            color: "#fff",
            p: 0.75,
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
        >
          {muted ? (
            <VolumeOffIcon sx={{ fontSize: 26 }} />
          ) : (
            <VolumeUpIcon sx={{ fontSize: 26 }} />
          )}
        </IconButton>
      </div>
      {/* Нижний блок: аватар + ник + описание */}
      <Box
        sx={{
          position: "absolute",
          left: 12,
          right: 70,
          bottom: 24,
          zIndex: 2,
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.3, mb: 1 }}>
          <img
            src={avatar}
            alt=""
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1.5px solid #fff",
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
            @{username}
          </Typography>
          <FollowButton
            userId={reel.userId || reel.user?.id}
            username={username}
          />
        </Box>

        {caption ? (
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.35,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {showCaption}{" "}
            {isLong && (
              <Box
                component="span"
                onClick={() => setExpanded((v) => !v)}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  cursor: "pointer",
                  ml: 0.5,
                }}
              >
                {expanded ? "скрыть" : "ещё"}
              </Box>
            )}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default ReelCard;
