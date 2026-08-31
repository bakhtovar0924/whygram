import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TextField, Button, InputAdornment } from "@mui/material";
import { loginUser } from "../../../features/auth/authApi";
import { useAuth } from "../../../features/auth/AuthContext";

const Login = function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ login: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = form.login.trim() && form.password.length >= 6;

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

  const handleChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    setError("");
    try {
      const user = await loginUser(form.login, form.password);
      login(user);

      // Куда вернуть после входа
      const redirect = sessionStorage.getItem("redirectAfterAuth");
      sessionStorage.removeItem("redirectAfterAuth");

      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate(from || "/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err); // ← обязательно посмотри в консоли

      if (
        err.message === "USER_NOT_FOUND" ||
        err.message === "WRONG_PASSWORD"
      ) {
        setError("Неверный логин или пароль");
      } else {
        setError("Ошибка сети или сервера. Проверь подключение к mokky.dev");
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8 font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="w-full max-w-[350px] flex flex-col gap-3">
        <div className="bg-black border border-[#363636] rounded-sm px-10 pt-10 pb-6 flex flex-col items-center">
          <h1
            className="text-white text-[52px] font-normal tracking-tight mb-8"
            style={{
              fontFamily:
                "Billabong, 'Grand Hotel', 'Segoe Script', 'Brush Script MT', cursive",
            }}
          >
            WHYGRAM
          </h1>

          <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
            <TextField
              name="login"
              value={form.login}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Телефон, имя пользователя или эл. адрес"
              variant="outlined"
              sx={inputSx}
            />
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Пароль"
              variant="outlined"
              sx={inputSx}
              InputProps={{
                endAdornment: form.password ? (
                  <InputAdornment position="end">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white text-[14px] font-semibold pr-2 bg-transparent border-none cursor-pointer"
                    >
                      {showPassword ? "Скрыть" : "Показать"}
                    </button>
                  </InputAdornment>
                ) : null,
              }}
            />

            {error ? (
              <p className="text-[#ed4956] text-[13px] text-center">{error}</p>
            ) : null}

            <Button
              type="submit"
              fullWidth
              disabled={!isFormValid || loading}
              sx={{
                mt: 1.5,
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
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>

        <div className="bg-black border border-[#363636] rounded-sm py-5 text-center text-[14px] text-[#f5f5f5]">
          У вас ещё нет аккаунта?{" "}
          <Link to="/register" className="text-[#0095f6] font-semibold">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
