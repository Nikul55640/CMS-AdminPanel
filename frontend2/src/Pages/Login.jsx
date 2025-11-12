// src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import CmsContext from "../context/CmsContext";

const Login = () => {

  const { setLoggedIn } = useContext(CmsContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  console.log("🔹 [Login] Attempting login for username:", username);
  if (!username.trim() || !password.trim()) {
    toast.error("Please enter username and password");
    return;
  }
  setLoading(true);

  try {
    const loginRes = await axios.post(
      "http://localhost:5000/api/auth/login",
      { username, password },
      { withCredentials: true }
    );
    console.log("✅ [Login] Login response:", loginRes.data);

    const meRes = await axios.get("http://localhost:5000/api/auth/me", { withCredentials: true });
    console.log("✅ [Login] /auth/me response:", meRes.data);

    if (meRes.data) {
      setLoggedIn(true);
      toast.success("Login successful!");
      navigate("/admin");
    } else {
      toast.error("Login failed: unable to verify user");
      console.warn("⚠️ [Login] /auth/me returned empty data");
    }
  } catch (err) {
    console.error("❌ [Login] Login error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Login failed!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-gradient-to-t from-gray-400 to-gray-700 p-8 shadow-xl shadow-red-500/50 rounded-lg w-96 h-96">
        <h2 className="text-4xl font-bold underline underline-offset-4 text-white text-center mb-10">
          Admin Login
        </h2>

        <label className="text-white text-xl font-semibold mt-8">
          Username:
        </label>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-6 p-2 rounded-lg bg-white"
        />

        <label className="text-white text-xl font-semibold">Password:</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-2 rounded-lg bg-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-800 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
