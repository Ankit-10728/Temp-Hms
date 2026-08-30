const multer = require('multer');
// Upload middleware
// Local/dev simplification: store files in memory via multer.
// (Removes AWS/S3 usage so the backend relies only on MongoDB via mongoose.)

const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;


