import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { sequelize } from "./db/sequelize.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import pageRouter from "./routes/page.routes.js";
import menuRouter from "./routes/menu.routes.js";
import componentRouter from "./routes/component.routes.js";
import blogRouter from "./routes/blog.routes.js";
import settingsRouter from "./routes/settings.routes.js";
import { ApiError } from "./utils/ApiHelpers.js";
import uploadRouter from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// ------------------- Middleware -------------------

// CORS
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

app.use(cookieParser());
// Parse JSON and URL-encoded payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploads
app.use("/uploads", express.static("uploads"));

// ------------------- Routes -------------------
app.use("/api/blogs", blogRouter);
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);

app.use("/api/pages", pageRouter);
app.use("/api/menus", menuRouter);
app.use("/api/components", componentRouter);
app.use("/api/settings", settingsRouter);

// ------------------- 404 Handler -------------------
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ------------------- Global Error Handler -------------------
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected via Sequelize");

    await sequelize.sync({}); // This will automatically adjust columns
    // // just ensure models exist, no altering
    console.log("✅ Sequelize models synced");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;
