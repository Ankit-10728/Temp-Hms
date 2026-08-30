const mongoose = require('mongoose');

const loginOtpSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      // Ensure 'STAFF' is in this enum array
      enum: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'STAFF', 'USER'], 
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'PASSWORD_RESET'],
      default: 'LOGIN',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: false, // <--- FIX 1: MUST BE FALSE
      index: true,
      trim: true,
    },
    otpEmail: {
      type: String,
      required: true,
    },
    otpMobile: {
      type: String,
      required: false, // <--- FIX 2: MUST BE FALSE (Yehi error de raha tha)
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    isConsumed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index so expired docs are auto removed
loginOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('LoginOtp', loginOtpSchema);
