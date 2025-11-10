import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserRound, Eye, EyeOff } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

const AdminSettings = () => {
  const [profile, setProfile] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, { withCredentials: true });
        setProfile((prev) => ({ ...prev, username: res.data.username }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load admin data");
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.username) return toast.error("Username cannot be empty");

    setLoading(true);
    try {
      // Update username
      await axios.put(
        `${API_URL}/update-profile`,
        { username: profile.username },
        { withCredentials: true }
      );

      // Update password if provided
      if (profile.currentPassword && profile.newPassword) {
        await axios.put(
          `${API_URL}/update-password`,
          {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword,
          },
          { withCredentials: true }
        );
      }

      toast.success("Profile updated successfully!");
      setProfile((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-gradient-to-br from-gray-700 to-blue-400 p-6 rounded-2xl text-white shadow-lg w-full h-auto max-w-md">
        <UserRound
          className="mx-auto mb-4 bg-white text-blue-500 border border-black rounded-full"
          size={80}
        />
        <h2 className="text-3xl font-bold mb-6 text-center">Admin Settings</h2>
        <div className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block mb-1 font-semibold">Username:</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, username: e.target.value }))
              }
              className="border px-3 py-2 rounded w-full text-black focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Current Password */}
          <div>
            <label className="block mb-1 font-semibold">
              Current Password:
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={profile.currentPassword}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter current password to change"
                className="border px-3 py-2 rounded w-full text-black focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-1 font-semibold">New Password:</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={profile.newPassword}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password"
                className="border px-3 py-2 rounded w-full text-black focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-blue-400 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto self-center disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
