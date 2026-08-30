export const normalizeRole = (role) =>
  role
    ? role.toUpperCase().replace(/[\s-]+/g, "_").replace(/_+/g, "_")
    : "";

const DASHBOARD_PATHS = {
  SUPER_ADMIN: "/superadmin",
  CLINIC_ADMIN: "/clinic",
  DOCTOR: "/clinic/doctor",
  RECEPTIONIST: "/clinic/reception",
  PRE_CONSULTATION: "/clinic/preconsultation",
  PRE_CONSULTATION_STAFF: "/clinic/preconsultation",
  PARA_MEDICAL: "/clinic/preconsultation",
  LAB_TECHNICIAN: "/clinic/lab",
  GROOMER: "/coming-soon",
  KENNEL: "/coming-soon",
  KENNEL_STAFF: "/coming-soon",
  PHARMACIST: "/coming-soon",
  PHARMACY: "/coming-soon",
  OWNER: "/clinic/owner",
};

export const getDashboardPathForRole = (role) =>
  DASHBOARD_PATHS[normalizeRole(role)] || null;
