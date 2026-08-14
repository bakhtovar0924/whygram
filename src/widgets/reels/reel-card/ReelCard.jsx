import { useState } from "react";
import { IconButton, Typography, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FollowButton from "../../../features/follow/ui/FollowButton";
import { formatCount } from "../../../shared/lib/formatCount";

const ReelCard = function ReelCard({ reel, isLiked, onLike, onOpenComments }) {
  const [expanded, setExpanded] = useState(false);

  const username = reel.user?.username || reel.username || "user";
  const avatar =
    reel.user?.avatar ||
    `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;
  const caption = reel.caption || "";
  const isLong = caption.length > 80;
  const showCaption = expanded || !isLong ? caption : caption.slice(0, 80) + "…";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        bgcolor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Видео */}
      <video
        src={reel.mediaUrl}
        muted
        autoPlay
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
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
          zIndex: 2,
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
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
          <FollowButton userId={reel.userId || reel.user?.id} username={username} />
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