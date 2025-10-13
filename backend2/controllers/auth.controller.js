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
