import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("\n============================");
  console.log("🧩 [authMiddleware] Incoming Request");
  console.log("📦 Path:", req.originalUrl);
  console.log("📬 Method:", req.method);
  console.log("🔍 Raw Authorization header:", authHeader);
  console.log("============================\n");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("🚫 [authMiddleware] Missing or invalid Bearer token format");
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  console.log(
    "🎟️ [authMiddleware] Extracted Token:",
    token.slice(0, 30) + "..."
  );

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [authMiddleware] Token verified successfully");
    console.log("🧑‍💻 Decoded Payload:", decoded);
    console.log(
      "⏰ Token Expiration:",
      new Date(decoded.exp * 1000).toLocaleString()
    );

    // Check user existence
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log(
        "❌ [authMiddleware] User not found in DB for ID:",
        decoded.id
      );
      return res.status(401).json({ message: "User not found" });
    }

    console.log("👤 [authMiddleware] Authenticated user:", user.username);

    req.user = user;
    next();
  } catch (err) {
    console.log("❌ [authMiddleware] JWT verification failed!");
    console.log("🧨 Error Message:", err.message);
    console.log("🕒 Time:", new Date().toLocaleString());

    // Differentiate common JWT errors
    if (err.name === "TokenExpiredError") {
      console.log(
        "⚠️ [authMiddleware] Token expired at:",
        new Date(err.expiredAt).toLocaleString()
      );
    } else if (err.name === "JsonWebTokenError") {
      console.log(
        "🚫 [authMiddleware] Invalid token signature or malformed token"
      );
    } else {
      console.log("❗ [authMiddleware] Unexpected error type:", err.name);
    }

    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
