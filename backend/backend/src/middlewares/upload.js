// Backward-compatible alias for uploads.js
// The codebase sometimes imports `../middlewares/upload` and sometimes `../middlewares/uploads`.
// This file ensures both paths work.

module.exports = require('./uploads');


