const express = require("express");
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const {
    getDashboard,
    getPendingPets,
    getCompletedPets,
    getHistory,
    getPatient,
    getLabPets,
    updatePatient,
    deletePatient,
    createPatient,
    getLabReportByVisit,
    getPreConsultationByVisit,
    downloadLabFile,
} = require("../controllers/DoctorModuleController");

// Public direct download route for lab files inside generated PDFs
router.get("/download-lab-file", downloadLabFile);

router.use(authorize("DOCTOR", "CLINIC_ADMIN"));

// Dashboard
router.get("/dashboard", getDashboard);

// Pending Pets
router.get("/pending-pets", getPendingPets);

// Completed Pets
router.get("/completed-pets", getCompletedPets);

// History
router.get("/history", getHistory);

// Edit Button
router.get("/patient/:id", getPatient);

// Save Complete Form
router.put("/patient/:id", updatePatient);
router.delete("/patient/:id", deletePatient);
router.get("/report/lab/:id", getLabReportByVisit);
router.get("/report/pre-consultation/:id", getPreConsultationByVisit);

router.get("/lab-pets", getLabPets);

router.post("/patient", createPatient);

module.exports = router;
