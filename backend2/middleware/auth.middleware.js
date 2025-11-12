import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";
// Auth middleware
const authMiddleware = AsyncHandler(async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies || !cookies.accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    console.log(req.cookies);
    const token = cookies.accessToken;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user; // attach user object
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}); // end authMiddleware 

export default authMiddleware;
