import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/AuthContext";
import {
  getUserById,
  updateUserApi,
} from "../../../features/auth/authApi";
import { deleteUserAccount } from "../../../features/settings/settingsApi";
import fieldClass from "../lib/fieldClass";

const PrivacySettings = function PrivacySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onPwd = (e) =>
    setPwd((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const changePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user?.id || loading) return;
    if (pwd.next.length < 6) {
      setError("Новый пароль должен быть не короче 6 символов");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setError("Новые пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const serverUser = await getUserById(user.id);
      if (serverUser.password !== pwd.current) {
        setError("Текущий пароль неверный");
        return;
      }
      await updateUserApi(user.id, { password: pwd.next });
      setPwd({ current: "", next: "", confirm: "" });
      setSuccess("Пароль изменён");
    } catch {
      setError("Не удалось изменить пароль. Проверьте json-server.");
    } finally {
      setLoading(false);
    }
  };

  const removeAccount = async () => {
    if (!user?.id || deleting) return;
    if (!window.confirm("Вы действительно хотите удалить аккаунт навсегда?")) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteUserAccount(user.id);
      logout();
      navigate("/login");
    } catch {
      setError("Не удалось удалить аккаунт. Проверьте json-server.");
      setDeleting(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Конфиденциальность</h2>

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

      <form onSubmit={changePassword} className="space-y-4">
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Текущий пароль</label>
          <input
            name="current"
            type="password"
            value={pwd.current}
            onChange={onPwd}
            className={fieldClass}
            placeholder="Текущий пароль"
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Новый пароль</label>
          <input
            name="next"
            type="password"
            value={pwd.next}
            onChange={onPwd}
            className={fieldClass}
            placeholder="Новый пароль"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">Новый пароль ещё раз</label>
          <input
            name="confirm"
            type="password"
            value={pwd.confirm}
            onChange={onPwd}
            className={fieldClass}
            placeholder="Повторите новый пароль"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#262626] hover:bg-[#363636] text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сменить пароль"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#262626]">
        <div className="text-sm font-semibold text-[#ed4956] mb-2">Опасная зона</div>
        <p className="text-xs text-[#a8a8a8] mb-3">
          Удаление аккаунта навсегда уберёт ваш профиль и все ваши данные без возможности восстановления.
        </p>
        <button
          type="button"
          onClick={removeAccount}
          disabled={deleting}
          className="w-full py-2.5 rounded-lg bg-transparent border border-[#ed4956] text-[#ed4956] text-sm font-semibold cursor-pointer hover:bg-[#ed4956]/10 disabled:opacity-50"
        >
          {deleting ? "Удаление..." : "Удалить аккаунт навсегда"}
        </button>
      </div>
    </section>
  );
};

export default PrivacySettings;
