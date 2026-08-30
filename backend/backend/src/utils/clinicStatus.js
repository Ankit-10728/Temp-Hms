// Shared clinic-gate check, used at login (OTP request + verify) and on
// every subsequent authenticated request via the `protect` middleware.
// Two independent reasons a clinic account can't be used right now:
//   - not yet approved by the Super Admin (still SUBMITTED/UNDER_REVIEW/etc)
//   - approved but since deactivated/suspended (isActive: false)
// Kept as one function so all three call sites return the same
// code/message for the same condition instead of drifting apart.
const getClinicGateError = (clinic) => {
  if (!clinic) {
    return {
      code: 'CLINIC_INACTIVE',
      message: 'This clinic is inactive. Please contact the super admin.',
    };
  }

  if (clinic.verificationStatus && clinic.verificationStatus !== 'APPROVED') {
    return {
      code: 'CLINIC_PENDING_APPROVAL',
      message: 'Your account is under review. Please wait for Super Admin approval.',
    };
  }

  if (clinic.isActive === false) {
    return {
      code: 'CLINIC_INACTIVE',
      message: 'This clinic is inactive. Please contact the super admin.',
    };
  }

  return null;
};

module.exports = { getClinicGateError };
