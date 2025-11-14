import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";

import ms from "ms";

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,    // must be false in localhost
  sameSite: "lax",  // allow cookies between 5173 ↔ 5000
  path: "/",        // <--- VERY IMPORTANT!
};


// --- Helper to create JWT ---
const createToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short-lived access token
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // refresh token
  );
};

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

// --- Login user ---
export const loginUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ message: "Username and password required" });

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = createToken(user);
  const refreshToken = createRefreshToken(user);

  // Save refresh token in DB
  user.refresh_token = refreshToken;
  await user.save();

  // Convert env values to ms
  const accessMaxAge = ms(process.env.JWT_EXPIRES_IN) || 900000; // default 15 min
  const refreshMaxAge = ms(process.env.JWT_REFRESH_EXPIRES_IN) || 604800000; // default 7 days

  res
    .cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessMaxAge,
      httpOnly: true, // now frontend can't read it via JS
    })
    .cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: refreshMaxAge,
      httpOnly: true, // secure refresh token
    })
    .json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
      // Remove tokens from response JSON
    });
});

// --- Refresh token ---
export const refreshTokenController = AsyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = createToken(user);
    const newRefreshToken = createRefreshToken(user);

    user.refresh_token = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
    });

    res.json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

// --- Logout ---
export const logoutUser = AsyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) {
        user.refresh_token = null;
        await user.save();
      }
    } catch (err) {
      console.error(err);
    }
  }

  res.clearCookie("accessToken", COOKIE_OPTIONS);
  res.clearCookie("refreshToken", COOKIE_OPTIONS);

  res.json({ message: "Logout successful" });
});

export const getCurrentUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { password, refresh_token, ...userData } = user.toJSON();
  res.json(userData);
});

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

export const deleteUser = AsyncHandler(async (req, res) => {
  await req.user.destroy();
  res.json({ message: "User account deleted" });
});
