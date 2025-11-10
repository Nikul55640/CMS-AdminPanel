// routes/auth.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  loginUser,
  registerUser,
  refresh_token,
  getCurrentUser,
  updatePassword,
  deleteUser,
  logoutUser
} from "../controllers/auth.controller.js";

const authRouter = express.Router();



// Register new user
authRouter.post("/register", registerUser);

// Login user
authRouter.post("/login", loginUser);

// Refresh JWT token
authRouter.post("/refresh-token", refresh_token);

// Logout user
authRouter.post("/logout", authMiddleware, logoutUser);



// Get current logged-in user
authRouter.get("/me", authMiddleware, getCurrentUser);



// Update user password
authRouter.put("/update-password", authMiddleware, updatePassword);

// Delete user account
authRouter.delete("/delete", authMiddleware, deleteUser);

export default authRouter;
