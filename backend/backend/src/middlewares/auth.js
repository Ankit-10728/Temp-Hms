const jwt = require("jsonwebtoken");
const Clinic = require('../models/Clinic');
const { getClinicGateError } = require('../utils/clinicStatus');
// console.log("AUTH FILE LOADED");

const protect = async (req, res, next) => {
  console.log("===== PROTECT =====");
  console.log(req.method, req.originalUrl);
  const authHeader =
    req.headers.authorization ||
    req.headers.Authorization;
  // console.log("Authorization Header:", authHeader);

  const match =
    typeof authHeader === "string"
      ? authHeader.match(/^Bearer\s+(.+)$/i)
      : null;

  const token = match?.[1];
  // console.log("Token:", token);

  if (!token) {

    return res.status(401).json({
      success: false,
      message: "Not authorized"
    });

  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    console.log("Decoded:", decoded)

    req.user = decoded;

    if (decoded.clinicId) {
      const clinic = await Clinic.findById(decoded.clinicId).select('isActive verificationStatus');
      const gateError = getClinicGateError(clinic);
      if (gateError) {
        return res.status(403).json({ success: false, ...gateError });
      }
    }

    next();

  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });

  }

};

const authorize = (...roles) => {

  console.log("************ AUTHORIZE V2 ************");
  return (req, res, next) => {
    console.log("AUTHORIZE CALLED");
    console.log("req.user:", req.user);

    // Normalize the role string to match constants (e.g., "Clinic Admin" -> "CLINIC_ADMIN")
    const rawRole = req.user?.role || "";
   const normalizedRole = rawRole
  .toUpperCase()
  .replace(/[\s-]+/g, "_");

    // DEBUG role matching
    console.log("AUTHZ ROLE CHECK:", { expectedRoles: roles, rawRole, normalizedRole, tokenRole: req.user?.role });

    // Check against the normalized role
    if (!roles.includes(normalizedRole)) {
      console.log(`Access Denied: Expected one of [${roles}], but got '${normalizedRole}'`);
      
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });

    }

    next();

  };

};

module.exports = {
  protect,
  authorize
};
