// {

//  ANKIT's  CODE ++++++++++++

// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const { generateOTP, sendSMS, sendWhatsApp } = require('../utils/otpService');

// const bcrypt = require("bcryptjs");
// const SuperAdmin = require("../models/SuperAdmin");


// // Temporary in-memory store for OTPs (Use Redis or MongoDB in production)
// const otpStore = new Map();

// exports.requestLoginOTP = async (req, res) => {
//   try {
//     const { mobile, channel } = req.body; // channel can be 'SMS' or 'WHATSAPP'

//     if (!mobile || typeof mobile !== 'string') {
//       return res.status(400).json({ success: false, message: 'mobile is required' });
//     }

//     // Normalize channel
//     const normalizedChannel = channel === 'WHATSAPP' ? 'WHATSAPP' : 'SMS';

//     // Check if user exists (Staff or Owner)
//     const user = await User.findOne({ mobile });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const otp = generateOTP();

//     // Store OTP with an expiry (e.g., 5 minutes)
//     otpStore.set(mobile, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

//     // Route message based on user preference
//     if (normalizedChannel === 'WHATSAPP') {
//       await sendWhatsApp(mobile, otp);
//     } else {
//       await sendSMS(mobile, otp);
//     }

//     res.status(200).json({ success: true, message: `OTP sent via ${normalizedChannel}` });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// exports.verifyOTPAndLogin = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
//     const record = otpStore.get(mobile);

//     if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }

//     // OTP verified, remove it
//     otpStore.delete(mobile);

//     // Fetch user and generate JWT
//     const user = await User.findOne({ mobile });
//     const token = jwt.sign(
//       { id: user._id, role: user.role, clinicId: user.clinicId },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({ success: true, token, user });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };





// exports.verifySuperAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log("Email : " + email);
//     console.log("password : " + password);

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     const admin = await SuperAdmin.findOne({ email }).select("+password");;
//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials **",
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: admin._id,
//         role: admin.role,
//         email: admin.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//         issuer: "HMS-app",
//       }
//     );
//     console.log("GENERATED TOKEN:", token);
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: admin._id,
//         email: admin.email,
//         role: admin.role,
//       },
//     });

//   } catch (error) {
//     console.error("SUPER ADMIN LOGIN ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };


/* ==============================================================================================
=================================================================================================
================================================================================================== */

// const User = require("../models/User");
// const SuperAdmin = require("../models/SuperAdmin");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const {
//   generateOTP,
//   sendSMS,
//   sendWhatsApp,
// } = require("../utils/otpService");

// // Temporary OTP Store (Use Redis in Production)
// const otpStore = new Map();

// /* ==========================================
//    STAFF LOGIN (OTP BASED)
// ========================================== */

// exports.requestLoginOTP = async (req, res) => {
//   try {
//     const { mobile, role, channel = "SMS" } = req.body;

//     if (!mobile || !role) {
//       return res.status(400).json({
//         success: false,
//         message: "Mobile and role are required",
//       });
//     }

//     const user = await User.findOne({ mobile });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.role !== role) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid role selected",
//       });
//     }

//     const otp = generateOTP();

//     otpStore.set(mobile, {
//       otp,
//       expiresAt: Date.now() + 5 * 60 * 1000,
//     });

//     if (channel === "WHATSAPP") {
//       await sendWhatsApp(mobile, otp);
//     } else {
//       await sendSMS(mobile, otp);
//     }

//     res.status(200).json({
//       success: true,
//       message: `OTP sent via ${channel}`,
//     });
//   } catch (error) {
//     console.error("REQUEST OTP ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.verifyOTPAndLogin = async (req, res) => {
//   try {
//     const { mobile, otp, role } = req.body;

//     const record = otpStore.get(mobile);

//     if (
//       !record ||
//       record.otp !== otp ||
//       record.expiresAt < Date.now()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     const user = await User.findOne({ mobile });

//     if (!user || user.role !== role) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized login",
//       });
//     }

//     otpStore.delete(mobile);

//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//         clinicId: user.clinicId,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user,
//     });
//   } catch (error) {
//     console.error("VERIFY OTP ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ==========================================
//    SUPER ADMIN LOGIN (EMAIL + PASSWORD)
// ========================================== */

// exports.verifySuperAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password are required",
//       });
//     }

//     const admin = await SuperAdmin.findOne({ email }).select("+password");

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: admin._id,
//         role: admin.role,
//         email: admin.email,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1d",
//         issuer: "HMS-app",
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: admin._id,
//         email: admin.email,
//         role: admin.role,
//       },
//     });
//   } catch (error) {
//     console.error("SUPER ADMIN LOGIN ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

//}

const User = require("../models/User");
const SuperAdmin = require("../models/SuperAdmin");
const ClinicAdmin = require("../models/ClinicAdmin");
const Clinic = require("../models/Clinic");
const LoginOtp = require('../models/LoginOtp');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { generateOTP } = require('../utils/otpService');
const { sendOtpMultiChannel, createOtpPair } = require('../utils/sendOtpMultiChannel');
const sendEmail = require('../utils/emailService');
const { passwordResetOtpEmail } = require('../utils/emailTemplates');
const lockoutService = require('../utils/lockoutService');
const passwordPolicy = require('../utils/passwordPolicy');
const { getClinicGateError } = require('../utils/clinicStatus');

const Staff = require("../models/Staff");

const normalizePhone = (value) =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

const GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

const verifyGoogleCredential = async (credential) => {
  if (!credential) {
    const error = new Error("Google credential is required");
    error.statusCode = 400;
    throw error;
  }

  const { default: axios } = await import("axios");
  const { data } = await axios.get(GOOGLE_TOKENINFO_URL, {
    params: { id_token: credential },
  });

  const expectedClientId = process.env.GOOGLE_CLIENT_ID;
  if (!expectedClientId) {
    const error = new Error("GOOGLE_CLIENT_ID is not configured");
    error.statusCode = 500;
    throw error;
  }

  if (data.aud !== expectedClientId) {
    const error = new Error("Invalid Google client");
    error.statusCode = 401;
    throw error;
  }

  if (!data.email || data.email_verified !== "true") {
    const error = new Error("Google email is not verified");
    error.statusCode = 401;
    throw error;
  }

  return {
    email: data.email.toLowerCase(),
    name: data.name,
    picture: data.picture,
  };
};

const normalizeRole = (role) =>
  typeof role === "string"
    ? role.trim().toUpperCase().replace(/[\s-]+/g, "_")
    : "";

const comparePasswordWithWhitespaceFallback = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  const exactMatch = await bcrypt.compare(plainPassword, hashedPassword);
  if (exactMatch) {
    return true;
  }

  const trimmedPassword = plainPassword.trim();
  if (trimmedPassword !== plainPassword) {
    return bcrypt.compare(trimmedPassword, hashedPassword);
  }

  return false;
};

const assertClinicIsActive = async (clinicId) => {
  const clinic = await Clinic.findById(clinicId).select('isActive verificationStatus');
  const gateError = getClinicGateError(clinic);
  if (gateError) {
    const error = new Error(gateError.message);
    error.statusCode = 403;
    error.code = gateError.code;
    throw error;
  }
};

// Invalidates any still-valid unconsumed LOGIN OTPs for this account before
// a new one is issued - otherwise multiple valid OTPs can coexist (e.g. an
// old one from a prior login attempt still verifies after a fresh one was
// sent), since the verify endpoints match ANY unconsumed unexpired OTP
// equal to what was submitted, not just the newest.
const invalidatePriorLoginOtps = async (userType, userId) => {
  await LoginOtp.updateMany(
    { userType, purpose: "LOGIN", userId, isConsumed: false },
    { isConsumed: true }
  );
};

const createOtpChallengeForLogin = async ({ account, accountType, email }) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const otpLockFields = accountType === "STAFF" ? account.accountInfo : account;

  if (lockoutService.isLocked(otpLockFields, 'otp')) {
    const error = new Error(lockoutService.LOCK_MESSAGE.otp);
    error.statusCode = 403;
    throw error;
  }

  if (accountType === "SUPER_ADMIN") {
    const mobile = process.env.SUPER_ADMIN_MOBILE;
    const otpEmail = generateOTP();

    await invalidatePriorLoginOtps("SUPER_ADMIN", account._id);

    // Create LoginOtp with only email if mobile is not configured
    const otpData = {
      userType: "SUPER_ADMIN",
      userId: account._id,
      email: account.email,
      otpEmail,
      expiresAt,
    };

    // Add mobile OTP only if SUPER_ADMIN_MOBILE is configured
    if (mobile) {
      const otpMobile = generateOTP();
      otpData.mobile = mobile;
      otpData.otpMobile = otpMobile;
    }

    await LoginOtp.create(otpData);

    // Send OTP via email (and SMS if mobile is configured)
    await sendOtpMultiChannel({
      email: account.email,
      ...(mobile && { mobile, otpMobile: otpData.otpMobile }),
      otpEmail,
      emailSender: sendEmail,
    });

    return {
      message: "OTP sent to registered email. Verify to login.",
      otpExpiresAt: expiresAt,
      role: "SUPER_ADMIN",
      user: {
        id: account._id,
        email: account.email,
        role: "SUPER_ADMIN",
      },
    };
  }

  if (accountType === "CLINIC_ADMIN") {
    await assertClinicIsActive(account.clinicId);
    const otpEmail = generateOTP();

    console.log(otpEmail);


    await invalidatePriorLoginOtps("CLINIC_ADMIN", account._id);
    await LoginOtp.create({
      userType: "CLINIC_ADMIN",
      userId: account._id,
      email: account.email,
      otpEmail,
      expiresAt,
    });

    await sendOtpMultiChannel({
      email: account.email,
      otpEmail,
      emailSender: sendEmail,
    });

    const clinic = await Clinic.findById(account.clinicId).select("adminDetails.adminName").lean();

    return {
      message: "OTP sent to registered email. Verify to login.",
      otpExpiresAt: expiresAt,
      role: "CLINIC_ADMIN",
      user: {
        id: account._id,
        name: clinic?.adminDetails?.adminName || undefined,
        email: account.email,
        role: "CLINIC_ADMIN",
        clinicId: account.clinicId || account.clinic,
      },
    };
  }

  if (accountType === "STAFF") {
    await assertClinicIsActive(account.clinicId);
    if (!account.accountInfo.accountActive) {
      const error = new Error("Account is inactive");
      error.statusCode = 403;
      throw error;
    }

    const { otpEmail, otpMobile } = createOtpPair();
    const mobile = account.personalInfo.mobileNumber;

    await invalidatePriorLoginOtps("STAFF", account._id);
    await LoginOtp.create({
      userType: "STAFF",
      userId: account._id,
      email: account.personalInfo.email,
      mobile,
      otpEmail,
      otpMobile,
      expiresAt,
    });

    await sendOtpMultiChannel({
      email: account.personalInfo.email,
      mobile,
      otpEmail,
      otpMobile,
      emailSender: sendEmail,
    });

    return {
      message: "OTP sent to registered email and mobile. Verify to login.",
      otpExpiresAt: expiresAt,
      role: account.employmentInfo.role,
      user: {
        id: account._id,
        name: account.personalInfo.fullName,
        email: account.personalInfo.email,
        mobile,
        role: account.employmentInfo.role,
        clinicId: account.clinicId,
      },
    };
  }

  const error = new Error("Unsupported account type");
  error.statusCode = 400;
  throw error;
};

const findOtpLoginAccountByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();

  const admin = await SuperAdmin.findOne({ email: normalizedEmail }).select("+password");
  if (admin) return { account: admin, accountType: "SUPER_ADMIN" };

  const clinicAdmin = await ClinicAdmin.findOne({ email: normalizedEmail }).select("+password");
  if (clinicAdmin) return { account: clinicAdmin, accountType: "CLINIC_ADMIN" };

  const staff = await Staff.findOne({
    "personalInfo.email": normalizedEmail,
    isDeleted: false,
  });
  if (staff) return { account: staff, accountType: "STAFF" };

  return null;
};

exports.resendLoginOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const match = await findOtpLoginAccountByEmail(email);
    if (!match) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const latestOtp = await LoginOtp.findOne({
      userId: match.account._id,
      userType: match.accountType,
      purpose: 'LOGIN',
      isConsumed: false,
    }).sort({ createdAt: -1 });

    const elapsedMs = latestOtp ? Date.now() - latestOtp.createdAt.getTime() : Infinity;
    if (elapsedMs < 30 * 1000) {
      const retryAfter = Math.ceil((30 * 1000 - elapsedMs) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${retryAfter} seconds before requesting another OTP.`,
        retryAfter,
      });
    }

    // A newly issued code replaces every outstanding login code for this account.
    await LoginOtp.updateMany(
      { userId: match.account._id, userType: match.accountType, purpose: 'LOGIN', isConsumed: false },
      { $set: { isConsumed: true } }
    );

    const challenge = await createOtpChallengeForLogin({
      account: match.account,
      accountType: match.accountType,
      email,
    });

    return res.status(200).json({ success: true, ...challenge });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Unable to resend OTP.',
    });
  }
};

/* ==========================================
   UNIVERSAL LOGIN (EMAIL + PASSWORD)
========================================== */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN REQUEST");
    console.log("email:", email);
    console.log("password:", password);

    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* =========================
       1. CHECK SUPER ADMIN
    ========================= */
    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() }).select("+password");
    if (admin) {


      if (lockoutService.isLocked(admin, 'password')) {
        return res.status(403).json({
          success: false,
          message: lockoutService.LOCK_MESSAGE.password,
        });
      }


      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        await lockoutService.registerFailedAttempt(admin, admin, 'password');
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      await lockoutService.resetAttempts(admin, admin, 'password');

      const challenge = await createOtpChallengeForLogin({
        account: admin,
        accountType: "SUPER_ADMIN",
        email: admin.email,
      });

      return res.status(200).json({ success: true, ...challenge });
    }

    /* =========================
       2. CHECK CLINIC ADMIN
    ========================= */
    const clinicAdmin = await ClinicAdmin.findOne({ email: email.toLowerCase() }).select("+password");

    if (clinicAdmin) {


      await assertClinicIsActive(clinicAdmin.clinicId);


      if (lockoutService.isLocked(clinicAdmin, 'password')) {
        return res.status(403).json({
          success: false,
          message: lockoutService.LOCK_MESSAGE.password,
        });
      }

      const isMatch = await bcrypt.compare(password, clinicAdmin.password);
      console.log("Clininc ADMIN FOUND:", !!admin);
      let phoneMatches = true;
      if (phone) {
        const clinicForPhone = await Clinic.findById(clinicAdmin.clinicId).select('adminDetails.adminPhone').lean();
        phoneMatches = normalizePhone(phone) === normalizePhone(clinicForPhone?.adminDetails?.adminPhone);
      }

      if (!isMatch || !phoneMatches) {
        await lockoutService.registerFailedAttempt(clinicAdmin, clinicAdmin, 'password');
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      await lockoutService.resetAttempts(clinicAdmin, clinicAdmin, 'password');

      const challenge = await createOtpChallengeForLogin({
        account: clinicAdmin,
        accountType: "CLINIC_ADMIN",
        email: clinicAdmin.email,
      });

      return res.status(200).json({ success: true, ...challenge });
    }

    /* =========================
       3. CHECK STAFF
    ========================= */
    const staff = await Staff.findOne({
      "personalInfo.email": email.toLowerCase(),
      isDeleted: false,
    });

    if (staff) {
      await assertClinicIsActive(staff.clinicId);

      if (!staff.accountInfo.accountActive) {
        return res.status(403).json({
          success: false,
          message: "Account is inactive",
        });
      }

      if (lockoutService.isLocked(staff.accountInfo, 'password')) {
        return res.status(403).json({
          success: false,
          message: lockoutService.LOCK_MESSAGE.password,
        });
      }

      const isMatch = await bcrypt.compare(
        password,
        staff.accountInfo.password
      );

      if (!isMatch || normalizePhone(phone) !== normalizePhone(staff.personalInfo.mobileNumber)) {
        await lockoutService.registerFailedAttempt(staff, staff.accountInfo, 'password');
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      await lockoutService.resetAttempts(staff, staff.accountInfo, 'password');

      const challenge = await createOtpChallengeForLogin({
        account: staff,
        accountType: "STAFF",
        email: staff.personalInfo.email,
      });

      return res.status(200).json({ success: true, ...challenge });
    }

    /* =========================
       4. CHECK NORMAL USERS
    ========================= */
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    if (lockoutService.isLocked(user, 'password')) {
      return res.status(403).json({
        success: false,
        message: lockoutService.LOCK_MESSAGE.password,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || normalizePhone(phone) !== normalizePhone(user.mobile)) {
      await lockoutService.registerFailedAttempt(user, user, 'password');
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await lockoutService.resetAttempts(user, user, 'password');

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.headers['x-forwarded-for'] || req.ip || null;
    user.lastLoginDevice = req.headers['user-agent'] || null;
    await user.save();

    const requiresPasswordReset = Boolean(user.forcePasswordReset);

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        clinicId: user.clinicId,
        // flags for frontend (not security)
        passwordResetRequired: requiresPasswordReset,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      requiresPasswordReset: requiresPasswordReset,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login.",
      error: error.message
    });
  }
};

const findPasswordResetAccount = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await SuperAdmin.findOne({ email: normalizedEmail }).select('+password');
  if (admin) return { account: admin, type: 'SUPER_ADMIN' };

  const clinicAdmin = await ClinicAdmin.findOne({ email: normalizedEmail }).select('+password');
  if (clinicAdmin) return { account: clinicAdmin, type: 'CLINIC_ADMIN' };

  const staff = await Staff.findOne({ 'personalInfo.email': normalizedEmail, isDeleted: false });
  if (staff) return { account: staff, type: 'STAFF' };

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (user) return { account: user, type: 'USER' };
  return null;
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const match = await findPasswordResetAccount(email);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'No account is registered with this email address.',
      });
    }

    const latestOtp = await LoginOtp.findOne({
      userType: match.type,
      purpose: 'PASSWORD_RESET',
      userId: match.account._id,
      isConsumed: false,
    }).sort({ createdAt: -1 });
    const elapsedMs = latestOtp ? Date.now() - latestOtp.createdAt.getTime() : Infinity;
    if (elapsedMs < 30 * 1000) {
      const retryAfter = Math.ceil((30 * 1000 - elapsedMs) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${retryAfter} seconds before requesting another OTP.`,
        retryAfter,
      });
    }

    await LoginOtp.updateMany(
      { userType: match.type, purpose: 'PASSWORD_RESET', userId: match.account._id, isConsumed: false },
      { $set: { isConsumed: true } }
    );

    const otpEmail = generateOTP();
    await LoginOtp.create({
      userType: match.type,
      purpose: 'PASSWORD_RESET',
      userId: match.account._id,
      email,
      otpEmail,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await sendEmail({
      email,
      subject: 'Reset your HMS password',
      ...passwordResetOtpEmail(otpEmail),
    });
    return res.json({ success: true, message: 'A password reset OTP has been sent to your registered email.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to send reset OTP' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    if (!passwordPolicy.isStrongPassword(newPassword)) {
      return res.status(400).json({ success: false, message: passwordPolicy.REQUIREMENTS_MESSAGE });
    }

    const match = await findPasswordResetAccount(email);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid or expired reset OTP' });

    const lockFields = match.type === 'STAFF' ? match.account.accountInfo : match.account;
    if (lockoutService.isLocked(lockFields, 'otp')) {
      return res.status(403).json({ success: false, message: lockoutService.LOCK_MESSAGE.otp });
    }

    const otpRecord = await LoginOtp.findOne({
      userType: match.type, purpose: 'PASSWORD_RESET', userId: match.account._id,
      email, otpEmail: otp, isConsumed: false, expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
    if (!otpRecord) {
      await lockoutService.registerFailedAttempt(match.account, lockFields, 'otp');
      return res.status(400).json({ success: false, message: 'Invalid or expired reset OTP' });
    }

    const currentPasswordHash = match.type === 'STAFF'
      ? match.account.accountInfo.password
      : match.account.password;
    if (currentPasswordHash && await bcrypt.compare(newPassword, currentPasswordHash)) {
      return res.status(400).json({ success: false, message: 'New password must be different from your current password' });
    }

    const password = await bcrypt.hash(newPassword, 10);
    if (match.type === 'STAFF') {
      match.account.accountInfo.password = password;
      match.account.accountInfo.forcePasswordReset = false;
    } else {
      match.account.password = password;
      if ('forcePasswordReset' in match.account) match.account.forcePasswordReset = false;
    }
    await lockoutService.resetAttempts(match.account, lockFields, 'otp');
    await match.account.save();
    otpRecord.isConsumed = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();
    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to reset password' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const role = normalizeRole(req.user?.role);
    const userId = req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (!passwordPolicy.isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: passwordPolicy.REQUIREMENTS_MESSAGE,
      });
    }

    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    if (role === "SUPER_ADMIN") {
      const admin = await SuperAdmin.findById(userId).select("+password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Super admin not found",
        });
      }

      const isMatch = await comparePasswordWithWhitespaceFallback(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (await comparePasswordWithWhitespaceFallback(newPassword, admin.password)) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from your current password",
        });
      }

      admin.password = hashedNewPassword;
      await admin.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    if (role === "CLINIC_ADMIN") {
      const admin = await ClinicAdmin.findOne({ _id: userId }).select("+password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Clinic admin not found",
        });
      }

      const isMatch = await comparePasswordWithWhitespaceFallback(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (await comparePasswordWithWhitespaceFallback(newPassword, admin.password)) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from your current password",
        });
      }

      admin.password = hashedNewPassword;
      admin.forcePasswordReset = false;
      await admin.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    const staff = await Staff.findOne({
      _id: userId,
      clinicId: req.user?.clinicId,
      isDeleted: false,
    });

    if (staff) {
      const storedPassword = staff.accountInfo?.password;
      const isMatch = await comparePasswordWithWhitespaceFallback(currentPassword, storedPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (await comparePasswordWithWhitespaceFallback(newPassword, storedPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from your current password",
        });
      }

      staff.accountInfo.password = hashedNewPassword;
      staff.accountInfo.forcePasswordReset = false;
      staff.accountInfo.temporaryPassword = "";

      await staff.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    const userAccount = await User.findOne({
      _id: userId,
    }).select("+password");

    if (userAccount) {
      const storedPassword = userAccount.password;
      const isMatch = await comparePasswordWithWhitespaceFallback(currentPassword, storedPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (await comparePasswordWithWhitespaceFallback(newPassword, storedPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from your current password",
        });
      }

      userAccount.password = hashedNewPassword;
      userAccount.forcePasswordReset = false;
      userAccount.temporaryPassword = "";

      await userAccount.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Account not found for password update",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
};

/* ==========================================
   GOOGLE LOGIN (GOOGLE ACCOUNT + OTP)
========================================== */

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const googleUser = await verifyGoogleCredential(credential);
    const match = await findOtpLoginAccountByEmail(googleUser.email);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const challenge = await createOtpChallengeForLogin({
      account: match.account,
      accountType: match.accountType,
      email: googleUser.email,
    });

    return res.status(200).json({
      success: true,
      ...challenge,
      googleUser,
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};
