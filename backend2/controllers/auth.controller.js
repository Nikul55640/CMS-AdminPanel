// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";  

// Register user
export const registerUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ message: "Username and password required" });

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser)
    return res.status(409).json({ message: "Username already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashedPassword });

  const { password: _, ...userData } = newUser.toJSON();
  res.status(201).json({ message: "User registered", user: userData });
});

// Login user
export const loginUser = AsyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ message: "Username and password required" });

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, username: user.username },
  });
});

export const refreshToken = AsyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized - No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized - User not found" });

    const newToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      message: "Token refreshed",
      token: newToken,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
}); 
// Get current user
export const getCurrentUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { password, ...userData } = user.toJSON();
  res.json(userData);
});

// Update user password
export const updatePassword = AsyncHandler(async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword?.trim() || !newPassword?.trim())
    return res
      .status(400)
      .json({ message: "Current and new password required" });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid current password" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json({ message: "Password updated successfully" });
});

// Delete user account
export const deleteUser = AsyncHandler(async (req, res) => {
  const user = req.user;
  await user.destroy();
  res.json({ message: "User account deleted" });
});

export const logoutUser = AsyncHandler(async (req, res) => {
  res.json({ message: "Logout successful" });
});
