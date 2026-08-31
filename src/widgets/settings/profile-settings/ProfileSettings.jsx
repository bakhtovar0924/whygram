import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../features/auth/AuthContext";
import {
  updateUserApi,
  isUsernameTaken,
  isEmailTaken,
  isPhoneTaken,
} from "../../../features/auth/authApi";
import fieldClass from "../../../widgets/settings/lib/fieldClass";

const ProfileSettings = function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || user.name || "",
      username: user.username || "",
      phone: user.phone || "",
      email: user.email || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  const onChange = (e) => {
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Загрузка файла с устройства
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа
    if (!file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }

    // Ограничение размера (например 1.5 МБ)
    if (file.size > 1.5 * 1024 * 1024) {
      setError("Файл слишком большой. Максимум 1.5 МБ");
      return;
    }

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result; // data:image/...;base64,...
      setForm((prev) => ({ ...prev, avatar: base64 }));
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Не удалось прочитать файл");
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // очищаем input, чтобы можно было выбрать тот же файл снова
    e.target.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || loading) return;

    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();
    const bio = form.bio.trim();
    const avatar = form.avatar.trim();

    if (!username) {
      setError("Укажите имя пользователя");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (await isUsernameTaken(username, user.id)) {
        setError("Это имя пользователя уже занято");
        return;
      }
      if (email && (await isEmailTaken(email, user.id))) {
        setError("Этот email уже занят");
        return;
      }
      if (phone && (await isPhoneTaken(phone, user.id))) {
        setError("Этот номер уже занят");
        return;
      }

      const payload = {
        fullName,
        username,
        phone: phone || null,
        email: email || null,
        bio,
        avatar:
          avatar ||
          `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
      };

      const updated = await updateUserApi(user.id, payload);
      const { pass, ...safe } = updated;
      updateUser(safe);
      setSuccess("Профиль обновлён");
    } catch (err) {
      setError("Не удалось сохранить. Проверьте подключение к серверу.");
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar =
    form.avatar ||
    user?.avatar ||
    `https://i.pravatar.cc/150?u=${user?.username || "user"}`;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Редактировать профиль</h1>

      {/* Аватар + кнопки */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={currentAvatar}
          alt=""
          className="w-16 h-16 rounded-full object-cover border border-[#363636]"
        />
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-sm">@{user?.username}</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold text-[#0095f6] bg-transparent border-none cursor-pointer hover:text-[#1877f2] disabled:opacity-50"
            >
              {uploading ? "Загрузка..." : "Загрузить фото"}
            </button>
            {form.avatar && (
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, avatar: "" }));
                  setError("");
                }}
                className="text-xs font-semibold text-[#ed4956] bg-transparent border-none cursor-pointer"
              >
                Удалить
              </button>
            )}
          </div>
        </div>

        {/* Скрытый input для выбора файла */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error ? (
        <div className="mb-4 p-3 rounded-lg border border-[#ed4956]/40 text-[#ed4956] text-sm">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 p-3 rounded-lg border border-emerald-800 text-emerald-400 text-sm">
          {success}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Имя и фамилия
          </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={onChange}
            className={fieldClass}
            placeholder="Имя и фамилия"
          />
        </div>

        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Имя пользователя
          </label>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            className={fieldClass}
            placeholder="username"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Телефон</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className={fieldClass}
            placeholder="+992..."
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className={fieldClass}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">О себе</label>
          <textarea
            name="bio"
            rows={3}
            value={form.bio}
            onChange={onChange}
            className={`${fieldClass} resize-none`}
            placeholder="Кратко о себе"
          />
        </div>

        {/* Поле ссылки — оставлено */}
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Ссылка на аватар (URL)
          </label>
          <input
            name="avatar"
            value={form.avatar.startsWith("data:") ? "" : form.avatar}
            onChange={onChange}
            className={fieldClass}
            placeholder="https://..."
          />
          <p className="text-[11px] text-[#a8a8a8] mt-1">
            Можно вставить ссылку или загрузить фото кнопкой выше
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full py-2.5 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </section>
  );
};

export default ProfileSettings;
