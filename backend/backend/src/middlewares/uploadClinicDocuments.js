const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

let upload;

if (process.env.S3_BUCKET) {
  const multerS3 = require("multer-s3");
  const { S3Client } = require("@aws-sdk/client-s3");
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  const storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `hms-clinics/${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
  });
  upload = multer({ storage });
} else {
  upload = multer({ storage: multer.memoryStorage() });
}

module.exports = upload;
