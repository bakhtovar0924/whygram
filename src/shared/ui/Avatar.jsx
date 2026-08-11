const Avatar = function Avatar({ src, name, size = 40, className = "" }) {
  const url =
    src || `https://i.pravatar.cc/150?u=${encodeURIComponent(name || "user")}`;
  return (
    <img
      src={url}
      alt={name || ""}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}



export default Avatar;
