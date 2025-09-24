// routes/auth.routes.js
import express from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";

const authRouter = express.Router();


// ✅ Login existing user
authRouter.post("/login",loginUser);

export default authRouter;
