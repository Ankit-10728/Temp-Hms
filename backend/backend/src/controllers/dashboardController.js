const { DASHBOARD, ROLE_IDS } = require('../config/roleDashboards');

const normalizeRole = (role) =>
  role
    ? role.toUpperCase().replace(/[\s-]+/g, '_').replace(/_+/g, '_')
    : '';

const resolveDashboardRole = (role, requestedView = '') => {
  const normalizedRole = normalizeRole(role);

  if (DASHBOARD[normalizedRole]) {
    return normalizedRole;
  }

  if (normalizedRole === 'PARA_MEDICAL') {
    return requestedView.includes('lab') ? 'LAB_TECHNICIAN' : 'PRE_CONSULTATION';
  }

  if (
    normalizedRole === 'PRE_CONSULTATION_STAFF' ||
    normalizedRole.includes('PRE_CONSULTATION')
  ) {
    return 'PRE_CONSULTATION';
  }

  if (normalizedRole.includes('LAB')) {
    return 'LAB_TECHNICIAN';
  }

  return null;
};

// Centralized dashboard redirect.
// Backend returns an API response (no 302). Frontend decides navigation.
exports.getDashboardRedirect = async (req, res) => {
  const authUser = req.user || {};

  // Unique id for the login id concept.
  // - For staff login via JWT: req.user.id is Mongo _id of User
  // - For super admin login via JWT: req.user.id is SuperAdmin _id
  const loginId = authUser.id || null;

  const normalizedRoleKey = resolveDashboardRole(
    authUser.role,
    (req.query?.as || '').toLowerCase()
  );

  if (!normalizedRoleKey) {
    return res.status(403).json({
      success: false,
      message: 'Role not supported for dashboard',
      role: authUser.role
    });
  }

  const redirectUrl = DASHBOARD[normalizedRoleKey];
  const roleId = ROLE_IDS[normalizedRoleKey];

  return res.status(200).json({
    success: true,
    data: {
      loginId,
      roleKey: normalizedRoleKey,
      roleId,
      redirectUrl
    }
  });
};
