// Shared failed-attempt/lockout tracking, used identically across all
// account types (SuperAdmin, ClinicAdmin, Staff, User) for both the
// password check and the OTP check. Two independent counters per account
// (password vs otp) so a wrong OTP guess never burns password-attempt
// budget and vice versa.

const MAX_ATTEMPTS = 10;
const LOCK_MINUTES = 15;

const LOCK_MESSAGE = {
  password: `Account is locked temporarily due to multiple attempts of wrong password kindly try after ${LOCK_MINUTES} minutes`,
  otp: `Account is locked temporarily due to multiple attempts of wrong otp kindly try after ${LOCK_MINUTES} minutes`,
};

const fieldNames = (field) => ({
  attempts: field === "otp" ? "failedOtpAttempts" : "failedPasswordAttempts",
  lockUntil: field === "otp" ? "otpLockUntil" : "passwordLockUntil",
});

// `doc` is the top-level Mongoose document (the thing .save() is called on).
// `fields` is where the counter/lock fields actually live - for most
// account types this is the same object as `doc` (flat fields), but Staff
// keeps them nested under `accountInfo`, so callers pass `staff.accountInfo`
// as `fields` while still saving via `staff` (the parent document).

const isLocked = (fields, field) => {
  const { lockUntil } = fieldNames(field);
  const until = fields[lockUntil];
  return Boolean(until && new Date(until) > new Date());
};

const registerFailedAttempt = async (
  doc,
  fields,
  field,
  { maxAttempts = MAX_ATTEMPTS, lockMinutes = LOCK_MINUTES } = {}
) => {
  const { attempts, lockUntil } = fieldNames(field);

  fields[attempts] = (fields[attempts] || 0) + 1;

  if (fields[attempts] >= maxAttempts) {
    fields[lockUntil] = new Date(Date.now() + lockMinutes * 60 * 1000);
  }

  await doc.save();
};

const resetAttempts = async (doc, fields, field) => {
  const { attempts, lockUntil } = fieldNames(field);

  if (!fields[attempts] && !fields[lockUntil]) {
    return;
  }

  fields[attempts] = 0;
  fields[lockUntil] = null;
  await doc.save();
};

module.exports = {
  MAX_ATTEMPTS,
  LOCK_MINUTES,
  LOCK_MESSAGE,
  isLocked,
  registerFailedAttempt,
  resetAttempts,
};
