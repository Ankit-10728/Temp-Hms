const read = (key) => localStorage.getItem(key) || sessionStorage.getItem(key) || "";

const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getSessionProfile = (fallbackRole, fallbackName) => {
  let user = {};

  try {
    user = JSON.parse(read("user") || read("userData") || read("userInfo") || "{}");
  } catch {
    user = {};
  }

  const account = user.user || user;
  return {
    name: read("userName") || account.name || account.fullName || fallbackName,
    email: read("userEmail") || read("email") || account.email || "Email unavailable",
    role: titleCase(read("role") || account.role || fallbackRole),
    clinicName:
      read("clinicName") ||
      account.clinicName ||
      account.clinic?.clinicName ||
      account.clinic?.name ||
      "Clinic Station",
  };
};
