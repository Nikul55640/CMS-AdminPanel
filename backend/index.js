import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { sequelize } from "./db/sequelize.js";

import menuRoutes from "./routes/menu.routes.js";
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

// Increase JSON & URL-encoded limits for editor content
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join("./uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/pages", pageRouter);
app.use("/api/menus", menuRoutes);
app.use("/api/components", componentsRoute);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected via Sequelize");

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("✅ Sequelize models synced");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

startServer();

export default app;
