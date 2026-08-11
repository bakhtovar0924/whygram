import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import ProfileSettings from "../../widgets/settings/profile-settings/ProfileSettings";
import PrivacySettings from "../../widgets/settings/privacy-settings/PrivacySettings";

const Settings = function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <ProfileSettings />
      <PrivacySettings />

      <div className="mt-10 pt-6 border-t border-[#262626]">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full py-2.5 rounded-lg bg-transparent border border-[#ed4956] text-[#ed4956] text-sm font-semibold cursor-pointer hover:bg-[#ed4956]/10"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default Settings;
