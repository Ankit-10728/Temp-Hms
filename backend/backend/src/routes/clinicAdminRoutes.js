
const express = require('express');
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");


const StaffRoutes = require("./clinincStaffRoutes")
const DoctorRoutes = require("./clinicDoctorRoutes")
const GroomerRoutes = require("./clinicGroomerRoutes")
const KennelRoutes = require("./clinicKennelRoutes")
const LabRoutes = require("./clinicLabRoutes")
const preConsultationRoutes = require("./clinicPreConsultationRoutes")
const ReceptionRoutes = require("./clinisReceptionRoutes")
const subscriptionRoutes = require("./subscriptionRoutes")
const subscriptionController = require("../controllers/subscriptionPlanController")
const DoctorModuleRoutes = require("./DoctorModuleRoutes")
const clinicDashboardController = require("../controllers/clinicDashboardController");
const clinicSubscriptionRoutes = require("./clinicSubscriptionRoutes")
router.use(protect);


router.use("/staff", StaffRoutes);
router.use("/doctors", DoctorRoutes);
router.use("/doctor-module", DoctorModuleRoutes);
router.use("/lab-module", LabRoutes);
router.use("/groomers", GroomerRoutes);
router.use("/kennel", KennelRoutes);
router.use("/reception", ReceptionRoutes);
router.use("/pre-consultation", preConsultationRoutes);
router.get("/subscription/status", subscriptionController.getSubscriptionStatus);
router.use("/subscription", clinicSubscriptionRoutes);





// old - routes (unorganised) -> no seprate file createde yet for these routes 

const upload = require('../middlewares/uploadMiddleware');

// controllers

const settingsController = require('../controllers/clinicSettingsController');
const reportsController = require('../controllers/adminReportsController');
const labController = require('../controllers/labTechnicianController');
const petRegistrationController = require('../controllers/petRegistrationController');
// const labReportController = require("../controllers/labDashboardController");






router.use(authorize('CLINIC_ADMIN'));

router.get("/dashboard", clinicDashboardController.getDashboard);


// labreport was commented from start

//labReportDashboard

// router.get("/stats", labReportController.getDashboardStats);
// router.get("/recent-activities", labReportController.getRecentActivities);
// router.get("/pending-summary", labReportController.getPendingSummary);

// // for create report

// router.post("/report", upload.single("reportFile"), labReportController.createReport);
// router.get("/report", labReportController.getAllReports);
// router.get("/report/:id", labReportController.getSingleReport);
// router.put("/report/:id", labReportController.updateReport);
// router.delete("/report/:id", labReportController.deleteReport);

// labreport was commented from start



// /* SETTINGS */
// router.get('/clinic-settings', settingsController.getClinicSettings);
// router.put('/clinic-settings', settingsController.updateClinicSettings);
// router.post("/clinic-settings/logo", upload.single("logo"), settingsController.uploadClinicLogo);

/* REPORTS */

router.get("/reports/dashboard-summary", reportsController.getDashboardSummary);
router.get("/reports/revenue", reportsController.getRevenueReport);
router.get("/reports/staff-role", reportsController.getStaffRoleReport);
router.get("/reports/appointment-trend", reportsController.getAppointmentTrend);
router.get("/reports/top-doctors", reportsController.getTopDoctors);


//reception routes
console.log("Reception routes loaded");

router.post("/reception/new-registration/send-otp", petRegistrationController.sendRegistrationOtp);
router.post("/reception/new-registration", upload.single("petPhoto"), petRegistrationController.createRegistration);
router.get("/reception/new-registration/mobile/:mobileNumber", petRegistrationController.searchCustomer);
router.get("/reception/new-registration/owner/:ownerId", petRegistrationController.getOwnerDetails);
router.post("/reception/new-registration/owner/:ownerId/pets", petRegistrationController.addPet);
router.post("/reception/new-registration/owner/:ownerId/pets/:petId/visit", petRegistrationController.addVisit);
router.get("/reception/petHistory", petRegistrationController.getPetHistory);


//clinic reception routes for checking history
router.get("/reception/existing-customers/stats", petRegistrationController.getDashboardStats);
router.get("/reception/existing-customers", petRegistrationController.getExistingCustomers);
router.get("/reception/existing-customers/:ownerId/pets/:petId", petRegistrationController.getPetDetails);


/* LAB WORKFLOW (Reception -> Pre -> Doctor -> Lab -> Doctor -> Closed) */
// Lab technician queue: appointments waiting for lab results
router.get('/lab/queue-pending', labController.getLabPendingQueue);

// Lab uploads results for a specific appointment and moves it back to doctor
// Body should match LabRecord.results fields
router.put('/lab/records/:appointmentId/results', labController.uploadLabResults);

/* Doctor close-case after lab */
// <<<<<<< HEAD
// //router.put('/doctorModule/close-case/:appointmentId', doctorController.closeCase);
// =======
// // router.put('/doctorModule/close-case/:appointmentId', doctorController.closeCase);
// >>>>>>> 5606716492815681e88d6735fe893702c2f51a40

module.exports = router;


