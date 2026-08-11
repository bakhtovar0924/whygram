const ProfileHighlights = function ProfileHighlights({ highlights }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 mb-2 border-b border-[#262626]">
      {highlights.map((h) => (
        <button key={h.id} type="button" className="flex flex-col items-center gap-1.5 shrink-0 w-[76px]">
          <div className="w-[66px] h-[66px] rounded-full p-[2px] border border-[#363636]">
            <img
              src={h.cover}
              alt={h.title}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          <span className="text-xs truncate w-full text-center text-[#f5f5f5]">{h.title}</span>
        </button>
      ))}
      <button type="button" className="flex flex-col items-center gap-1.5 shrink-0 w-[76px] text-[#a8a8a8]">
        <div className="w-[66px] h-[66px] rounded-full border border-dashed border-[#363636] flex items-center justify-center text-2xl">
          +
        </div>
        <span className="text-xs">Создать</span>
      </button>
    </div>
  );
}



export default ProfileHighlights;
