export const passwordRequirements = [
  ['At least 10 characters', (password) => password.length >= 10],
  ['One uppercase letter', (password) => /[A-Z]/.test(password)],
  ['One lowercase letter', (password) => /[a-z]/.test(password)],
  ['One number', (password) => /\d/.test(password)],
  ['One special character', (password) => /[^\w\s]/.test(password)],
];

export const isStrongPassword = (password) =>
  passwordRequirements.every(([, test]) => test(password));
