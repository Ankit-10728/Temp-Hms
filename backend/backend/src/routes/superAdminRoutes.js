const express = require('express');
const router = express.Router();

const { authorize } = require('../middlewares/auth');
const {
    createClinic,
    checkClinicContactAvailability,
    getNextClinicCodePreview,
    sendClinicAdminOtp,
    verifyClinicAdminOtp,
    getAllClinics,
    updateClinic, // <--- 1. ADDED IMPORT HERE
    deleteClinic,
    updateSubscription,
    getAdminDashboard,
    updateClinicVerification,
    updateClinicActivity,
    uploadClinicDocuments,
    getVeterinarians,
    deleteVeterinarian,
    updateVeterinarianStatus,
    updateVeterinarian,
    createVeterinarian
} = require('../controllers/adminController');
const {
    createPlan,
    getPlans,
    updatePlan,
    deletePlan
} = require('../controllers/subscriptionPlanController');

const upload = require('../middlewares/upload');
const uploadClinicDocumentsToCloudinary = require('../middlewares/uploadClinicDocuments');

router.use(authorize('SUPER_ADMIN'));

router.post('/clinics', createClinic);
router.get('/clinics/contact-availability', checkClinicContactAvailability);
router.get('/clinics/next-code', getNextClinicCodePreview);
router.post('/clinics/admin-otp/send', sendClinicAdminOtp);
router.post('/clinics/admin-otp/verify', verifyClinicAdminOtp);
router.get('/clinics', getAllClinics);
router.put('/clinics/:id', updateClinic); // <--- 2. ADDED ROUTE HERE
router.delete('/clinics/:id', deleteClinic);
router.put('/clinics/:id/subscription', updateSubscription);
router.get('/dashboard', getAdminDashboard);
router.get('/veterinarians', getVeterinarians);
router.delete('/veterinarians/:id', deleteVeterinarian);
router.put('/veterinarians/:id/status', updateVeterinarianStatus);
router.put(
    '/veterinarians/:id',
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'govtIdDocument', maxCount: 1 },
        { name: 'degreeCertificates', maxCount: 10 },
        { name: 'registrationCertificate', maxCount: 1 }
    ]),
    updateVeterinarian
);
router.post(
    '/veterinarians',
    upload.fields([
        { name: 'profilePhoto', maxCount: 1 },
        { name: 'govtIdDocument', maxCount: 1 },
        { name: 'degreeCertificates', maxCount: 10 },
        { name: 'registrationCertificate', maxCount: 1 }
    ]),
    createVeterinarian
);
router.post('/plans', createPlan);
router.get('/plans', getPlans);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

router.put('/clinics/:id/verification', updateClinicVerification);
router.put('/clinics/:id/activity', updateClinicActivity);

router.post(
    '/clinics/:id/documents',
    uploadClinicDocumentsToCloudinary.fields([
        { name: 'clinicLogo', maxCount: 1 },
        { name: 'vetCouncilCertificate', maxCount: 1 },
        { name: 'tradeLicense', maxCount: 1 },
        { name: 'drugLicense', maxCount: 1 },
        { name: 'cancelledCheque', maxCount: 1 },
        { name: 'adminProfile', maxCount: 1 },
        { name: 'idDocument', maxCount: 1 }
    ]),
    uploadClinicDocuments
);

module.exports = router;
