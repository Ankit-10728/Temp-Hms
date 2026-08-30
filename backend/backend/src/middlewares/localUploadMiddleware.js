const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");

const uploadsDir = path.resolve(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
});

const localUpload = multer({ storage });

module.exports = localUpload;
