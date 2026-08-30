// Central mapping for dashboard access.
// Frontend should call GET /api/v1/dashboard with JWT and then navigate using redirectUrl.
const DASHBOARD = {
  SUPER_ADMIN: '/superadmin',                  // Matches your frontend fallback
  CLINIC_ADMIN: '/clinic',                     // Matches <Route path="/clinic">
  RECEPTIONIST: '/clinic/reception',           // Matches <Route path="/clinic/reception">
  PRE_CONSULTATION: '/clinic/preconsultation', // Matches <Route path="/clinic/preconsultation">
  DOCTOR: '/clinic/doctor',                    // Matches <Route path="/clinic/doctor">
  LAB_TECHNICIAN: '/clinic/lab',
  GROOMER: '/coming-soon',
  KENNEL: '/coming-soon',
  KENNEL_STAFF: '/coming-soon',
  PHARMACIST: '/coming-soon',
  PHARMACY: '/coming-soon',
  OWNER: '/clinic/owner'                       // Matches <Route path="/clinic/owner">
};


// roleId mapping concept: each role gets a unique stable id.
// These IDs are returned as part of the API response for frontend usage/logging.
const ROLE_IDS = {
  SUPER_ADMIN: 'role_super_admin_001',
  CLINIC_ADMIN: 'role_clinic_admin_002',
  RECEPTIONIST: 'role_receptionist_003',
  OWNER: 'role_owner_004',
  DOCTOR: 'role_doctor_005',
  PRE_CONSULTATION: 'role_pre_consultation_006',
  LAB_TECHNICIAN: 'role_lab_technician_007',
  GROOMER: 'role_groomer_008',
  KENNEL: 'role_kennel_009',
  KENNEL_STAFF: 'role_kennel_staff_010',
  PHARMACIST: 'role_pharmacist_011',
  PHARMACY: 'role_pharmacy_012'
};

// Requested UI roles -> backend JWT roles.
// Your backend currently uses: SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, PARA_MEDICAL, RECEPTIONIST.
// We map:
// - PARA_MEDICAL -> PRE_CONSULTATION (as requested)
// - PARA_MEDICAL -> LAB_TECHNICIAN (as requested) via heuristics/override key (see controller)
//
// If you later introduce explicit JWT roles OWNER / PRE_CONSULTATION / LAB_TECHNICIAN, update this mapping.
const REQUESTED_ROLE_KEYS = {
  'super admin': 'SUPER_ADMIN',
  'clinic admin': 'CLINIC_ADMIN',
  receptionist: 'RECEPTIONIST',
  'pet owner': 'OWNER',
  doctor: 'DOCTOR',
  'pre-consultation': 'PRE_CONSULTATION',
  'pre consultation': 'PRE_CONSULTATION',
  'lab - technician': 'LAB_TECHNICIAN',
  'lab technician': 'LAB_TECHNICIAN'
};

module.exports = {
  DASHBOARD,
  ROLE_IDS,
  REQUESTED_ROLE_KEYS
};

