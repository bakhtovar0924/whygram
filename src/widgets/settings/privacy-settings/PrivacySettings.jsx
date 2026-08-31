import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/AuthContext";
import { getUserById, updateUserApi } from "../../../features/auth/authApi";
import { deleteUserAccount } from "../../../features/settings/settingsApi";
import fieldClass from "../lib/fieldClass";

const PrivacySettings = function PrivacySettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onPwd = (e) =>
    setPwd((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

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
      if (serverUser.pass !== pwd.current) {
        setError("Текущий пароль неверный");
        return;
      }
      await updateUserApi(user.id, { pass: pwd.next });
      setPwd({ current: "", next: "", confirm: "" });
      setSuccess("Пароль изменён");
    } catch {
      setError("Не удалось изменить пароль. Проверьте подключение к серверу.");
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
      setError("Не удалось удалить аккаунт. Проверьте подключение к серверу.");
      setDeleting(false);
    }
  };

  // Общий стиль для кнопки "Показать / Скрыть"
  const showBtnClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-white bg-transparent border-none cursor-pointer select-none";

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
        {/* Текущий пароль */}
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Текущий пароль
          </label>
          <div className="relative">
            <input
              name="current"
              type={show.current ? "text" : "password"}
              value={pwd.current}
              onChange={onPwd}
              className={fieldClass}
              placeholder="Текущий пароль"
              autoComplete="current-password"
            />
            {pwd.current && (
              <button
                type="button"
                onClick={() => toggleShow("current")}
                className={showBtnClass}
              >
                {show.current ? "Скрыть" : "Показать"}
              </button>
            )}
          </div>
        </div>

        {/* Новый пароль */}
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Новый пароль
          </label>
          <div className="relative">
            <input
              name="next"
              type={show.next ? "text" : "password"}
              value={pwd.next}
              onChange={onPwd}
              className={fieldClass}
              placeholder="Новый пароль"
              autoComplete="new-password"
            />
            {pwd.next && (
              <button
                type="button"
                onClick={() => toggleShow("next")}
                className={showBtnClass}
              >
                {show.next ? "Скрыть" : "Показать"}
              </button>
            )}
          </div>
        </div>

        {/* Подтверждение нового пароля */}
        <div>
          <label className="block text-xs text-[#a8a8a8] mb-1">
            Новый пароль ещё раз
          </label>
          <div className="relative">
            <input
              name="confirm"
              type={show.confirm ? "text" : "password"}
              value={pwd.confirm}
              onChange={onPwd}
              className={fieldClass}
              placeholder="Повторите новый пароль"
              autoComplete="new-password"
            />
            {pwd.confirm && (
              <button
                type="button"
                onClick={() => toggleShow("confirm")}
                className={showBtnClass}
              >
                {show.confirm ? "Скрыть" : "Показать"}
              </button>
            )}
          </div>
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
        <div className="text-sm font-semibold text-[#ed4956] mb-2">
          Опасная зона
        </div>
        <p className="text-xs text-[#a8a8a8] mb-3">
          Удаление аккаунта навсегда уберёт ваш профиль и все ваши данные без
          возможности восстановления.
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
