const MIN_LENGTH = 8;

const REQUIREMENTS_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a symbol.";

const isStrongPassword = (password) => {
  if (typeof password !== "string" || password.length < MIN_LENGTH) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9\s]/.test(password)) return false;
  return true;
};

module.exports = { isStrongPassword, REQUIREMENTS_MESSAGE, MIN_LENGTH };
