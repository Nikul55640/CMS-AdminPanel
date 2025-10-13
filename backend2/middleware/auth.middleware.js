// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// Auth middleware
const authMiddleware = AsyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findByPk(decoded.id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  req.user = user; // attach user object
  next();
});

export default authMiddleware;
