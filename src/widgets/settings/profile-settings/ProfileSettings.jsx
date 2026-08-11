import { useEffect, useState } from "react";
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
      const { password, ...safe } = updated;
      updateUser(safe);
      setSuccess("Профиль обновлён");
    } catch (err) {
      setError("Не удалось сохранить. Проверьте json-server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Редактировать профиль</h1>
      <div className="flex items-center gap-4 mb-8">
        <img
          src={
            form.avatar ||
            user?.avatar ||
            `https://i.pravatar.cc/150?u=${user?.username || "user"}`
          }
          alt=""
          className="w-16 h-16 rounded-full object-cover border border-[#363636]"
        />
        <div>
          <div className="font-semibold text-sm">@{user?.username}</div>
          <div className="text-xs text-[#a8a8a8]">Измените данные ниже</div>
        </div>
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
          <label className="block text-xs text-[#a8a8a8] mb-1">Имя и фамилия</label>
          <input name="fullName" value={form.fullName} onChange={onChange} className={fieldClass} placeholder="Имя и фамилия" />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Имя пользователя</label>
          <input name="username" value={form.username} onChange={onChange} className={fieldClass} placeholder="username" autoComplete="username" />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Телефон</label>
          <input name="phone" value={form.phone} onChange={onChange} className={fieldClass} placeholder="+992..." inputMode="tel" autoComplete="tel" />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} className={fieldClass} placeholder="name@example.com" autoComplete="email" />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">О себе</label>
          <textarea name="bio" rows={3} value={form.bio} onChange={onChange} className={`${fieldClass} resize-none`} placeholder="Кратко о себе" />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Ссылка на аватар (URL)</label>
          <input name="avatar" value={form.avatar} onChange={onChange} className={fieldClass} placeholder="https://..." />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </section>
  );
};

export default ProfileSettings;
