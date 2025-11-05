import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Optional file filter (only images)
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only image files are allowed"), false);
  } else {
    cb(null, true);
  }
};

export const upload = multer({ storage, fileFilter });
export default upload;``