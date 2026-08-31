import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import {
  registerUser,
  isUsernameTaken,
  isEmailTaken,
  isPhoneTaken,
} from "../../../features/auth/authApi";
import { useAuth } from "../../../features/auth/AuthContext";

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^\+?[\d\s\-()]{7,20}$/.test(String(value).trim());
}

const Register = function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    contact: "",
    fullName: "",
    username: "",
    pass: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    form.contact.trim() &&
    form.fullName.trim() &&
    form.username.trim().length >= 3 &&
    form.pass.length >= 6 &&
    form.confirmPassword === form.password;

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#121212",
      color: "#f5f5f5",
      fontSize: "12px",
      borderRadius: "3px",
      height: "38px",
      "& fieldset": { borderColor: "#363636", borderWidth: "1px" },
      "&:hover fieldset": { borderColor: "#a8a8a8" },
      "&.Mui-focused fieldset": { borderColor: "#a8a8a8", borderWidth: "1px" },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#a8a8a8",
      opacity: 1,
      fontSize: "12px",
    },
    input: { padding: "9px 8px 7px" },
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.confirmPassword !== form.pass) {
      setError("Пароли не совпадают");
      return;
    }

    if (!isFormValid || loading) return;

    setLoading(true);
    setError("");

    try {
      const contact = form.contact.trim();
      const username = form.username.trim();

      if (!isEmail(contact) && !isPhone(contact)) {
        setError("Введите корректный email или телефон");
        return;
      }

      if (await isUsernameTaken(username)) {
        setError("Это имя пользователя уже занято");
        return;
      }

      let email = null;
      let phone = null;

      if (isEmail(contact)) {
        if (await isEmailTaken(contact)) {
          setError("Этот email уже зарегистрирован");
          return;
        }
        email = contact.toLowerCase();
      } else {
        phone = contact.replace(/\s/g, "");
        if (await isPhoneTaken(phone)) {
          setError("Этот телефон уже зарегистрирован");
          return;
        }
      }

      const newUser = {
        id: String(Date.now()),
        email,
        phone,
        fullName: form.fullName.trim(),
        username,
        pass: form.pass,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`,
        bio: "",
        createdAt: new Date().toISOString(),
      };

      const created = await registerUser(newUser);
      login(created);

      const redirect = sessionStorage.getItem("redirectAfterAuth");
      sessionStorage.removeItem("redirectAfterAuth");

      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка регистрации. Проверьте json-server (порт 4000).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8 font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="w-full max-w-[350px] flex flex-col gap-3">
        <div className="bg-black border border-[#363636] rounded-sm px-10 pt-10 pb-6 flex flex-col items-center">
          <h1
            className="text-white text-[52px] font-normal tracking-tight text-center leading-none mb-3"
            style={{
              fontFamily:
                "Billabong, 'Grand Hotel', 'Segoe Script', 'Brush Script MT', cursive",
            }}
          >
            Whygram
          </h1>

          <p className="text-[#a8a8a8] text-[17px] font-semibold text-center mb-4 leading-5">
            Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.
          </p>
          <form
            className="w-full flex flex-col gap-2 mt-2"
            onSubmit={handleSubmit}
          >
            <TextField
              name="contact"
              value={form.contact}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Моб. телефон или эл. адрес"
              variant="outlined"
              sx={inputSx}
            />
            <TextField
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Имя и фамилия"
              variant="outlined"
              sx={inputSx}
            />
            <TextField
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Имя пользователя"
              variant="outlined"
              sx={inputSx}
            />
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.pass}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Пароль"
              variant="outlined"
              sx={inputSx}
              InputProps={{
                endAdornment: form.pass ? (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white text-[14px] font-semibold pr-2 bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? "Скрыть" : "Показать"}
                  </button>
                ) : null,
              }}
            />
            <TextField
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Подтвердите пароль"
              variant="outlined"
              sx={inputSx}
              InputProps={{
                endAdornment: form.confirmPassword ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white text-[14px] font-semibold pr-2 bg-transparent border-none cursor-pointer"
                  >
                    {showConfirmPassword ? "Скрыть" : "Показать"}
                  </button>
                ) : null,
              }}
            />

            {error ? (
              <p className="text-[#ed4956] text-[13px] text-center mt-1">
                {error}
              </p>
            ) : null}
            <p className="text-[#a8a8a8] text-[12px] text-center mt-2 leading-4">
              Регистрируясь, вы принимаете наши{" "}
              <a href="#" className="text-[#e0f1ff]">
                Условия
              </a>
              ,{" "}
              <a href="#" className="text-[#e0f1ff]">
                Политику конфиденциальности
              </a>{" "}
              и{" "}
              <a href="#" className="text-[#e0f1ff]">
                Политику в отношении файлов cookie
              </a>
              .
            </p>

            <Button
              type="submit"
              fullWidth
              disabled={!isFormValid || loading}
              sx={{
                mt: 2,
                height: "32px",
                backgroundColor:
                  isFormValid && !loading
                    ? "#0095f6"
                    : "rgba(0, 149, 246, 0.3)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    isFormValid && !loading
                      ? "#1877f2"
                      : "rgba(0, 149, 246, 0.3)",
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  color: "rgba(255,255,255,0.7)",
                  backgroundColor: "rgba(0, 149, 246, 0.3)",
                },
              }}
            >
              {loading ? "Регистрация..." : "Регистрация"}
            </Button>
          </form>
        </div>

        <div className="bg-black border border-[#363636] rounded-sm py-5 px-4 text-center">
          <p className="text-[#f5f5f5] text-[14px]">
            Есть аккаунт?{" "}
            <Link
              to="/login"
              className="text-[#0095f6] font-semibold hover:text-[#1877f2]"
            >
              Вход
            </Link>
          </p>
        </div>
      </div>

      <footer className="mt-12 w-full max-w-[935px] px-4">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[#a8a8a8] text-[12px] mb-4">
          {[
            "b0w9r",
            "Информация",
            "Блог",
            "Вакансии",
            "Помощь",
            "API",
            "Конфиденциальность",
            "Условия",
            "Места",
            "Whygram",
            "Threads",
            "b0w9r Verified",
          ].map((item) => (
            <a key={item} href="#" className="hover:underline">
              {item}
            </a>
          ))}
        </div>
        <div className="flex justify-center text-[#a8a8a8] text-[12px]">
          <span>© 2026 Whygram from b0w9r</span>
        </div>
      </footer>
    </div>
  );
};

export default Register;
