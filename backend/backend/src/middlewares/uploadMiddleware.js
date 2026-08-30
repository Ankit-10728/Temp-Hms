const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

let upload;

if (process.env.S3_BUCKET) {
  const multerS3 = require("multer-s3");
  const { S3Client } = require("@aws-sdk/client-s3");
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  const s3Storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `hms-staff/${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
  });

  const storage = {
    _handleFile(req, file, cb) {
      s3Storage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        cb(null, { ...info, path: info.location, filename: info.key });
      });
    },
    _removeFile(req, file, cb) {
      s3Storage._removeFile(req, file, cb);
    },
  };

  const pdfOnlyFields = new Set([
    "degreeCertificates",
    "registrationCertificate",
    "doctorLetterhead",
  ]);

  const imageOnlyFields = new Set([
    "profilePhoto",
    "digitalSignature",
  ]);

  const fileFilter = (req, file, cb) => {
    if (pdfOnlyFields.has(file.fieldname)) {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      }
      return cb(new Error(`${file.fieldname} must be a PDF file`));
    }

    if (imageOnlyFields.has(file.fieldname)) {
      if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
      }
      return cb(new Error(`${file.fieldname} must be an image file`));
    }

    return cb(null, true);
  };

  upload = multer({ storage, fileFilter });
} else {
  upload = multer({ storage: multer.memoryStorage() });
}

module.exports = upload;
