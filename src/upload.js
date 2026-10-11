// Image uploads (products, cell batches, settings) stored in DATA_DIR/uploads.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { UPLOAD_DIR } = require("./db");

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ALLOWED[file.mimetype]}`),
  }),
  limits: { fileSize: 6 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => cb(null, Boolean(ALLOWED[file.mimetype])),
});

function removeUpload(name) {
  if (!name || name.includes("/") || name.includes("\\")) return;
  fs.unlink(path.join(UPLOAD_DIR, name), () => {});
}

module.exports = { upload, removeUpload };
