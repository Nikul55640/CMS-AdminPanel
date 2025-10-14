import axios from "axios";
import { useState, useContext } from "react";
import CmsContext from "../context/CmsContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const { setToken ,  setLoggedIn } = useContext(CmsContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });
    const token = res.data.token;

    // save in context and localStorage
    setToken(token);
    localStorage.setItem("token", token);
    toast.success("Login successful!");
    setLoggedIn(true);
    navigate("/admin");
  } catch (err) {
    console.error(err);
    toast(err.response?.data?.message || "Login failed!");
  }
};


  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-gray-700 p-8 shadow-xl shadow-red-500/50 rounded-lg w-96 h-96">
        <h2 className="text-4xl font-bold underline underline-offset-4 text-white text-center mb-10">
          Admin Login
        </h2>
        <label className="text-white text-xl font-semibold mt-8">Username:</label>
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
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-800 cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
