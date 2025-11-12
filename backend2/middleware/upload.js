import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.warn("⚠️ Invalid file type:", file.mimetype);
    cb(new Error("Invalid file type. Only JPEG, PNG, and WEBP allowed."));
  }
};

export const upload = multer({ storage, fileFilter });
