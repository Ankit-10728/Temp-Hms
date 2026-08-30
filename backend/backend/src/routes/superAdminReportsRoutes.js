const express = require('express');
const router = express.Router();

const { authorize } = require('../middlewares/auth');
const {
  getSuperAdminBasicReports,
  getSuperAdminReportCatalog,
  downloadSuperAdminBasicReport,
  shareSuperAdminBasicReport,
} = require('../controllers/superAdminReportsController');

router.use(authorize('SUPER_ADMIN'));

router.get('/catalog', getSuperAdminReportCatalog);
router.get('/basic', getSuperAdminBasicReports);
router.get('/basic/download', downloadSuperAdminBasicReport);
router.post('/basic/share', shareSuperAdminBasicReport);

module.exports = router;
