import { Suspense, lazy, useEffect } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "../features/auth/ProtectedRoute";
import Layout from "../widgets/layout/Layout";
import PublicProfile from "../pages/profile/PublicProfile";

const Login = lazy(() => import("../pages/auth/login/Login"));
const Register = lazy(() => import("../pages/auth/register/Register"));
const Home = lazy(() => import("../pages/home/Home"));
const Top = lazy(() => import("../pages/top/Top"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const Reels = lazy(() => import("../pages/reels/Reels"));
const Chat = lazy(() => import("../pages/chat/Chat"));
const Settings = lazy(() => import("../pages/settings/Settings"));

function Loader() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading...
    </div>
  );
}

const App = function App() {
  const mode = useSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.classList.toggle("light", mode === "light");
  }, [mode]);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/top" element={<Top />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
