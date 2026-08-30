const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const labController = require('../controllers/labTechnicianController');
const Clinic = require('../models/Clinic');

router.use(authorize("LAB_TECHNICIAN", "CLINIC_ADMIN", "STAFF", "RECEPTION", "RECEPTIONIST", "SUPER_ADMIN", "DOCTOR"));

// Sup-016: the Lab module is a paid add-on (Clinic.features.labModule) -
// a clinic whose plan doesn't have it ticked shouldn't be able to use
// these endpoints even if a role would otherwise be allowed to.
// Super Admin is exempt so support/verification can still inspect data.
router.use(async (req, res, next) => {
  if (req.user?.role === 'SUPER_ADMIN') return next();

  try {
    const clinic = await Clinic.findById(req.user?.clinicId).select('features.labModule');
    if (!clinic?.features?.labModule) {
      return res.status(403).json({
        success: false,
        code: 'MODULE_NOT_ENABLED',
        message: 'The Lab module is not enabled for this clinic\'s plan. Contact the super admin to upgrade.',
      });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/dashboard', labController.getLabDashboard);
router.post('/create', upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
]), labController.createLabTechnician);

router.get('/', labController.getAllLabTechnicians);
router.get('/pending-pets', labController.getLabPendingPets);
router.get('/required-tests', labController.getRequiredLabTests);
router.get('/reports', labController.getAllPatientReports);

router.post(
    "/upload-lab-reports",
    upload.fields([
        { name: "CBC" },
        { name: "Biochemistry" },
        { name: "Urinalysis" },
        { name: "Culture & Sensitivity" },
        { name: "X-Ray" },
        { name: "USG" },
        { name: "Cytology" },
        { name: "ELISA" },
        { name: "PCR" },
        { name: "Blood" },
        { name: "Urine" },
        { name: "Stool" },
        { name: "Swab" },
        { name: "Biopsy" }
    ]),
    labController.uploadLabReports
);
router.put("/update/:id", labController.updateLabResults);
router.put("/completed-pets", labController.getCompletedLabPets);
router.get("/:id", labController.getSingleLabTechnician)
router.put("/:id", upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
]), labController.updateLabTechnician);
router.delete("/:id", labController.deleteLabTechnician);
router.post("/:id/verify", labController.verifyLabTechnician);
router.post("/:id/reject", labController.rejectLabTechnician);

module.exports = router;
