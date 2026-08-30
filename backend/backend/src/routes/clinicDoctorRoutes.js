const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const doctorController = require('../controllers/doctorDetailController');

router.use(authorize("DOCTOR", "CLINIC_ADMIN", "RECEPTION", "RECEPTIONIST"));

router.post('/create', upload.fields(
    [
        { name: "degreeCertificates", maxCount: 10 },
        { name: "registrationCertificate", maxCount: 1 },
        { name: "digitalSignature", maxCount: 1 },
        { name: "doctorLetterhead", maxCount: 1 },
    ]
), doctorController.createDoctor);

router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put(
    "/:id",
    upload.fields([
        { name: "degreeCertificates", maxCount: 10 },
        { name: "registrationCertificate", maxCount: 1 },
        { name: "digitalSignature", maxCount: 1 },
        { name: "doctorLetterhead", maxCount: 1 },
    ]),
    doctorController.updateDoctor
);
router.delete('/:id', doctorController.deleteDoctor);
router.post('/:id/verify', doctorController.verifyDoctor);
router.post('/:id/reject', doctorController.rejectDoctor);

module.exports = router;
