import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ✅ Register new user
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({ username, password: hashedPassword });

    // Remove password before sending response
    const { password: _, ...userData } = newUser.toJSON();

    return res.status(201).json({
      message: "✅ User registered successfully",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "✅ Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
