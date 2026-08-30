const express = require('express');
const router = express.Router();

const {
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deleteStaff,
    getManagers,
} = require("../controllers/staffController");

const {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
} = require("../controllers/doctorDetailController");

const {
    createLabTechnician,
    getAllLabTechnicians,
    getSingleLabTechnician,
    updateLabTechnician,
    deleteLabTechnician,
} = require("../controllers/labTechnicianController");

const {
    createGroomer,
    getAllGroomers,
    getGroomerById,
    updateGroomer,
    deleteGroomer,
} = require("../controllers/groomerController");

const {
    createKennel,
    getAllKennels,
    getKennelById,
    updateKennel,
    deleteKennel,
    toggleKennelStatus,
} = require("../controllers/kennelController");

const {
    getClinicSettings,
    updateClinicSettings,
    uploadClinicLogo,
} = require("../controllers/clinicSettingsController");

const {
    getDashboardSummary,
    getRevenueReport,
    getStaffRoleReport,
    getAppointmentTrend,
    getTopDoctors,
} = require("../controllers/adminReportsController");

const { upload } = require("../middlewares/uploadMiddleware");

/* =========================
   STAFF ROUTES
========================= */

router.get("/managers", getManagers);

router.post(
    "/staff",
    upload.single("profilePhoto"),
    createStaff
);

router.get("/staff", getAllStaff);
router.get("/staff/:id", getStaffById);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

/* =========================
   DOCTOR ROUTES
========================= */

router.post(
    "/doctors/create",
    upload.fields([
        {
            name: "degreeCertificates",
            maxCount: 10,
        },
        {
            name: "registrationCertificate",
            maxCount: 1,
        },
        {
            name: "digitalSignature",
            maxCount: 1,
        },
        {
            name: "doctorLetterhead",
            maxCount: 1,
        },
    ]),
    createDoctor
);

router.get("/doctors", getAllDoctors);
router.get("/doctors/:id", getDoctorById);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

/* =========================
   LAB TECHNICIAN ROUTES
========================= */

router.post(
    "/lab-technicians/create",
    upload.fields([
        {
            name: "certificate",
            maxCount: 1,
        },
        {
            name: "idProof",
            maxCount: 1,
        },
    ]),
    createLabTechnician
);

router.get("/lab-technicians", getAllLabTechnicians);
router.get("/lab-technicians/:id", getSingleLabTechnician);
router.put("/lab-technicians/:id", updateLabTechnician);
router.delete("/lab-technicians/:id", deleteLabTechnician);

/* =========================
   GROOMER ROUTES
========================= */

router.post(
    "/groomers/create",
    upload.fields([
        {
            name: "profilePhoto",
            maxCount: 1,
        },
        {
            name: "certificateDocument",
            maxCount: 1,
        },
    ]),
    createGroomer
);

router.get("/groomers", getAllGroomers);

router.get("/groomers/:id", getGroomerById);

router.put(
    "/groomers/:id",
    upload.fields([
        {
            name: "profilePhoto",
            maxCount: 1,
        },
        {
            name: "certificateDocument",
            maxCount: 1,
        },
    ]),
    updateGroomer
);

router.delete("/groomers/:id", deleteGroomer);


/* =========================
   KENNEL ROUTES
========================= */

router.post(
    "/kennel/create",
    upload.fields([
        {
            name: "firstAidCertificate",
            maxCount: 1,
        },
    ]),
    createKennel
);

router.get("/kennel", getAllKennels);

router.get("/kennel/:id", getKennelById);

router.put(
    "/kennel/:id",
    upload.fields([
        {
            name: "firstAidCertificate",
            maxCount: 1,
        },
    ]),
    updateKennel
);

router.patch("/kennel/:id/status", toggleKennelStatus);

router.delete("/kennel/:id", deleteKennel);

/* =========================
   CLINIC SETTINGS ROUTES
========================= */

// Get Clinic Settings
router.get(
    "/clinic-settings",
    getClinicSettings
);

// Update Clinic Settings
router.put(
    "/clinic-settings",
    updateClinicSettings
);

// Upload Clinic Logo
router.post(
    "/clinic-settings/logo",
    upload.single("logo"),
    uploadClinicLogo
);

/* =========================
   REPORT ROUTES
========================= */

// Dashboard KPI Summary
router.get(
    "/reports/dashboard-summary",
    getDashboardSummary
);

// Revenue vs Target
router.get(
    "/reports/revenue",
    getRevenueReport
);

// Staff Distribution
router.get(
    "/reports/staff-role",
    getStaffRoleReport
);

// Appointment Trend
router.get(
    "/reports/appointment-trend",
    getAppointmentTrend
);

// Top Performing Doctors
router.get(
    "/reports/top-doctors",
    getTopDoctors
);

module.exports = router;