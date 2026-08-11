import FollowButton from "../../../features/follow/ui/FollowButton";

const ReelCard = function ReelCard({ reel }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626] aspect-[9/16] max-h-[80vh]">
      {reel.mediaType === "video" ? (
        <video src={reel.mediaUrl} controls className="w-full h-full object-cover" />
      ) : (
        <img src={reel.mediaUrl} alt="" className="w-full h-full object-cover" />
      )}
      <div className="relative flex items-center gap-2 px-4 pt-3 pb-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            @{reel.user?.username || reel.username}
          </div>
          <div className="text-sm mt-0.5 line-clamp-2">{reel.caption}</div>
        </div>
        <FollowButton
          userId={reel.userId || reel.user?.id}
          username={reel.user?.username || reel.username}
        />
      </div>
    </div>
  );
}


export default ReelCard;
