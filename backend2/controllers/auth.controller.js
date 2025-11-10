import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// ===================================================
// 🔧 Helper: Generate Tokens
// ===================================================
const generateTokens = (user) => {
  const timestamp = new Date().toLocaleString();
  console.log("\n============================");
  console.log(`🧩 [generateTokens] ${timestamp}`);
  console.log("============================");

  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" } // shorter access token
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } // longer refresh token
  );

  console.log("✅ Access Token (partial):", accessToken.slice(0, 25) + "...");
  console.log("✅ Refresh Token (partial):", refreshToken.slice(0, 25) + "...");

  return { accessToken, refreshToken };
};

// ===================================================
// 🧩 Register User
// ===================================================
export const registerUser = AsyncHandler(async (req, res) => {
  console.log("\n🟢 [registerUser] Incoming request:", req.body);

  const { username, password } = req.body;
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ message: "Username and password required" });

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    console.log("⚠️ Username already exists:", username);
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashedPassword });

  console.log("✅ New user registered:", newUser.username);
  const { password: _, ...userData } = newUser.toJSON();
  res.status(201).json({ message: "User registered", user: userData });
});

// ===================================================
// 🔐 Login User — Always issue new tokens
// ===================================================
// In loginUser
export const loginUser = async (req, res) => {
  try {
    console.log("\n============================");
    console.log("🟡 [loginUser] Request received:", req.body);
    console.log("============================");

    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    // Generate tokens
    const tokens = generateTokens({ id: user.id, username: user.username });
    console.log("🧩 [generateTokens]", new Date().toLocaleString());
    console.log("✅ Access Token (partial):", tokens.accessToken.slice(0, 30) + "...");
    console.log("✅ Refresh Token (partial):", tokens.refreshToken.slice(0, 30) + "...");

    // ✅ Force overwrite refresh token in DB
    await user.update({ refresh_token: tokens.refreshToken });

    console.log(`✅ Login successful for: ${user.username}`);
    console.log("🧾 Tokens saved in DB and sent to client\n");

    res.status(200).json({
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("❌ [loginUser] Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ===================================================
// ♻️ Refresh Access Token
// ===================================================
export const refresh_token = AsyncHandler(async (req, res) => {
  console.log("\n============================");
  console.log("🔄 [refresh_token] Request body:", req.body);
  console.log("============================");

  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("✅ Decoded Refresh Token:", decoded);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.refresh_token !== refreshToken) {
      console.log("⚠️ Token mismatch for user:", user.username);
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // 🧩 Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    console.log("✅ New access token generated for:", user.username);
    res.json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.log("❌ Refresh token verification failed:", err.message);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});

// ===================================================
// 👤 Get Current User
// ===================================================
export const getCurrentUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { password, refresh_token, ...userData } = user.toJSON();
  res.json(userData);
});

// ===================================================
// 🔑 Update Password
// ===================================================
export const updatePassword = AsyncHandler(async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword?.trim() || !newPassword?.trim())
    return res
      .status(400)
      .json({ message: "Current and new password required" });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid)
    return res.status(401).json({ message: "Invalid current password" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json({ message: "Password updated successfully" });
});

// ===================================================
// 🗑️ Delete User
// ===================================================
export const deleteUser = AsyncHandler(async (req, res) => {
  await req.user.destroy();
  res.json({ message: "User account deleted" });
});

// ===================================================
// 🚪 Logout User
// ===================================================
export const logoutUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (user) {
    await user.update({ refresh_token: null });
    console.log("✅ Refresh token cleared for:", user.username);
  }
  res.json({ message: "Logout successful" });
});
