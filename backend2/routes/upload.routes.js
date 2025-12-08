import express from "express";
import { upload } from "../middleware/upload.js"; // your multer config

const router = express.Router();

// Match the route expected by GrapesJS AssetManager
// routes/upload.routes.js
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});


export default router;
