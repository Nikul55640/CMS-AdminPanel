import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
};

// Auth middleware WITH auto-refresh
const authMiddleware = AsyncHandler(async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
      // Try verifying the access token first
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      req.user = user;
      return next();
    } catch (err) {
      // IF ACCESS TOKEN EXPIRED → check refresh token
      if (err.name !== "TokenExpiredError" || !refreshToken) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      // Verify refresh token
      let refreshDecoded;
      try {
        refreshDecoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
      } catch (err2) {
        return res.status(401).json({ message: "Unauthorized: Refresh failed" });
      }

      // Find user
      const user = await User.findByPk(refreshDecoded.id);
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Save new refresh token
      user.refresh_token = newRefreshToken;
      await user.save();

      // Set new cookies
      res.cookie("accessToken", newAccessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.user = user;
      return next();
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authMiddleware;
