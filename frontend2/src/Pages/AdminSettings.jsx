import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

const AdminSettings = () => {
  const [profile, setProfile] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🟢 Fetch current admin info
  useEffect(() => {
    const fetchUser = async () => {
      console.log("🔄 Fetching current user info...");
      try {
        const res = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Current user fetched:", res.data);
        setProfile((prev) => ({ ...prev, username: res.data.username }));
      } catch (err) {
        console.error("❌ Error fetching user:", err.response?.data || err);
        toast.error("Failed to load admin data");
      }
    };
    fetchUser();
  }, [token]);

  // Save profile updates
  const handleSaveProfile = async () => {
    console.log(" Saving profile data:", profile);
    setLoading(true);
    try {
      // Update username
      if (profile.username.trim()) {
        console.log("➡️ Updating username...");
        const res = await axios.put(
          `${API_URL}/update-user`,
          { username: profile.username },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Username updated:", res.data);
      }

      // Update password if both provided
      if (profile.currentPassword && profile.newPassword) {
        console.log("➡️ Updating password...");
        const res = await axios.put(
          `${API_URL}/update-password`,
          {
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Password updated:", res.data);
      }

      toast.success("Profile updated successfully!");
      setProfile({ ...profile, currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-full h-auto max-w-md">
        <UserRound  className="mx-auto mb-4 bg-white text-blue-500 border border-black   rounded-full " size={80} />
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Admin Settings
        </h2>

  
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Username :-
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Current Password :-
            </label>
            <input
              type="password"
              value={profile.currentPassword}
              onChange={(e) =>
                setProfile({ ...profile, currentPassword: e.target.value })
              }
              placeholder="Enter current password to change"
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              New Password :-
            </label>
            <input
              type="password"
              value={profile.newPassword}
              onChange={(e) =>
                setProfile({ ...profile, newPassword: e.target.value })
              }
              placeholder="Enter new password"
              className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto self-center disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
