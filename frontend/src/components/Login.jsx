import axios from "axios";
import { useState, useContext } from "react";
import PageContext from "../context/PageContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setToken ,  setLoggedIn } = useContext(PageContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        username,
        password,
      });
      const token = res.data.token;
      setToken(token); // save in context
      alert("Login successful!");
      setLoggedIn(true);
      navigate("/admin"); // redirect to admin dashboard
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-gray-700 p-8 rounded-lg shadow w-96 h-96">
        <h2 className="text-4xl font-bold text-white text-center mb-10">
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
          className="w-full mb-6 p-2 rounded bg-white"
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
