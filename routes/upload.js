const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFiles, deleteFile } = require("../controllers/uploadController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed"));
    }
  },
});

router.post("/", upload.array("files", 10), uploadFiles);
router.delete("/", deleteFile);

module.exports = router;
