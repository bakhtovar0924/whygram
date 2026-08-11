const StoriesBar = function StoriesBar({ groups, onOpenGroup }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-3 px-1 border border-[#262626] rounded-lg bg-black">
      {groups.map((group, index) => (
        <button
          key={group.userId || group.username || index}
          type="button"
          onClick={() => onOpenGroup(index)}
          className="flex flex-col items-center gap-1 shrink-0 w-[74px] bg-transparent border-0 cursor-pointer text-[#f5f5f5]"
        >
          <div
            className={`p-[2px] rounded-full ${
              group.items.length
                ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                : "bg-[#363636]"
            }`}
          >
            <div className="relative">
              <img
                src={
                  group.avatar ||
                  `https://i.pravatar.cc/150?u=${group.username}`
                }
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-black"
              />
              {group.isOwn && (
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095f6] border-2 border-black text-[10px] flex items-center justify-center font-bold">
                  +
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] truncate w-full text-center">
            {group.isOwn ? "Ваша история" : group.username}
          </span>
        </button>
      ))}
    </div>
  );
}



export default StoriesBar;
