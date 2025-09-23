import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRouter from "./routes/auth.route.js";
import pageRouter from "./routes/page.route.js";
import componentsRoute from "./routes/component.route.js"; 

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// Increase limits for JSON & URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded media files
app.use("/uploads", express.static(path.join("./uploads"))); // ✅ make uploads accessible

// Routes
app.use("/api/auth", authRouter);
app.use("/api/pages", pageRouter);

app.use("/api/components",componentsRoute);



// Start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error", err));
