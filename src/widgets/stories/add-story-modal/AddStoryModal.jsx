import { useState } from "react";
import { createStory } from "../../../entities/post/postsApi";
import { readFileAsDataURL } from "../../../shared/lib/readFileAsDataURL";
import { prepareMediaFile, formatBytes } from "../../../shared/lib/compressMedia";
const AddStoryModal = function AddStoryModal({ user, onClose, onCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setMediaType("image");
    setError("");
    setInfo("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFile = async (e) => {
    const selected = e.target.files?.[0];
    setError("");
    setInfo("");
    if (!selected) return;

    try {
      const result = await prepareMediaFile(selected);
      if (preview) URL.revokeObjectURL(preview);
      setFile(result.file);
      setMediaType(result.file.type.startsWith("video/") ? "video" : "image");
      setPreview(URL.createObjectURL(result.file));
      if (!result.skipped && result.originalSize) {
        setInfo(
          `Сжато: ${formatBytes(result.originalSize)} → ${formatBytes(
            result.finalSize
          )}`
        );
      }
    } catch (err) {
      setError(err.message || "Ошибка файла");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;
    setLoading(true);
    setError("");

    try {
      const mediaUrl = await readFileAsDataURL(file);
      await createStory({
        id: `story_${Date.now()}`,
        userId: user.id,
        username: user.username,
        avatar:
          user.avatar || `https://i.pravatar.cc/150?u=${user.username}`,
        mediaUrl,
        mediaType,
        createdAt: new Date().toISOString(),
      });
      reset();
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message || "Не удалось опубликовать историю");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#363636] rounded-2xl w-full max-w-md p-6 relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-0 text-[#a8a8a8] cursor-pointer text-xl"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <h2 className="text-lg font-bold mb-4 text-center">
          Добавить в историю
        </h2>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={onFile}
            className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#0095f6] file:text-white"
          />

          {error ? <p className="text-[#ed4956] text-xs">{error}</p> : null}
          {info ? <p className="text-[#a8a8a8] text-xs">{info}</p> : null}

          {preview ? (
            <div className="rounded-lg overflow-hidden bg-black max-h-56 flex items-center justify-center">
              {mediaType === "video" ? (
                <video
                  src={preview}
                  controls
                  className="max-h-56 w-full object-contain"
                />
              ) : (
                <img
                  src={preview}
                  alt=""
                  className="max-h-56 w-full object-contain"
                />
              )}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-2.5 rounded-lg bg-[#0095f6] text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-40"
          >
            {loading ? "Публикация..." : "Поделиться в историю"}
          </button>
        </form>
      </div>
    </div>
  );
}



export default AddStoryModal;
