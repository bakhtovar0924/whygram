import { Link } from "react-router-dom";
import formatProfileCount from "../lib/formatProfileCount";
import { useState } from "react";

const ProfileHeader = function ProfileHeader({
  profile,
  postsCount,
  isOwn = true,
}) {
  const [copied, setCopied] = useState(false);

  const shareProfile = async () => {
    const url = `${window.location.origin}/u/${profile.username}`;

    // Если браузер поддерживает системный Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${profile.username} в WHYGRAM`,
          text: `Посмотри профиль ${profile.username}`,
          url,
        });
        return;
      } catch {
        // пользователь отменил — ничего страшного
      }
    }

    // Иначе копируем в буфер
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // запасной вариант
      prompt("Скопируйте ссылку на профиль:", url);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-10 mb-8">
      <div className="flex justify-center sm:justify-start shrink-0">
        <div className="p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
          <img
            src={profile.avatar}
            alt={`Фото профиля ${profile.username}`}
            className="w-[86px] h-[86px] sm:w-[150px] sm:h-[150px] rounded-full object-cover border-4 border-black bg-[#121212]"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-[20px] font-light tracking-wide truncate">
            {profile.username}
          </h1>

          {isOwn ? (
            <>
              <Link
                to="/settings"
                className="px-4 py-1.5 rounded-lg bg-[#262626] text-sm font-semibold hover:bg-[#363636] transition-colors"
              >
                Редактировать профиль
              </Link>

              <button
                type="button"
                onClick={shareProfile}
                className="px-4 py-1.5 rounded-lg bg-[#262626] text-sm font-semibold hover:bg-[#363636] transition-colors border-0 cursor-pointer text-white"
              >
                {copied ? "Ссылка скопирована!" : "Поделиться профилем"}
              </button>

              <Link
                to="/settings"
                className="p-1.5 rounded-lg hover:bg-[#262626]"
                aria-label="Настройки"
              >
                <i className="fa-solid fa-gear text-[18px]" />
              </Link>
            </>
          ) : (
            // чужой профиль — можно потом добавить FollowButton
            <button
              type="button"
              onClick={shareProfile}
              className="px-4 py-1.5 rounded-lg bg-[#262626] text-sm font-semibold hover:bg-[#363636] transition-colors border-0 cursor-pointer text-white"
            >
              {copied ? "Ссылка скопирована!" : "Поделиться"}
            </button>
          )}
        </div>

        <ul className="flex items-center gap-6 sm:gap-10 mb-4 text-sm">
          <li>
            <span className="font-semibold">
              {formatProfileCount(postsCount)}
            </span>{" "}
            <span className="text-[#a8a8a8]">публикаций</span>
          </li>
          <li>
            <span className="font-semibold">
              {formatProfileCount(profile.followersCount)}
            </span>{" "}
            <span className="text-[#a8a8a8]">подписчиков</span>
          </li>
          <li>
            <span className="font-semibold">
              {formatProfileCount(profile.followingCount)}
            </span>{" "}
            <span className="text-[#a8a8a8]">подписок</span>
          </li>
        </ul>

        <div className="text-sm leading-5 space-y-1">
          <div className="font-semibold">{profile.fullName}</div>
          {profile.bio
            ? profile.bio
                .split("\n")
                .map((line, i) => <div key={i}>{line}</div>)
            : null}
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
