import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import pageRouter from "./routes/page.route.js";
import componentsRouter from "./routes/component.route.js"; // ✅ import components route

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/pages", pageRouter);
app.use("/api/components", componentsRouter); // ✅ add components route

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error", err));
