const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
    // Dashboard
    getDashboardStats,
    getRecentActivities,
    getPendingSummary,

    // Lab Panel
    searchReport,
    createReport,
    getAllReports,
    getSingleReport,
    uploadReport,

} = require("../controllers/labDashboardController");

/* =====================================================
                    DASHBOARD
===================================================== */

// Dashboard Cards
router.get("/dashboard", getDashboardStats);

// Recent Activity
router.get("/recent", getRecentActivities);

// Pending Reports Summary
router.get("/pending-summary", getPendingSummary);



/* =====================================================
                    LAB PANEL
===================================================== */

// Search
router.get("/report/search", searchReport);

// Create Report
router.post("/report", createReport);

// Get All Reports
router.get("/report", getAllReports);

// View Single Report
router.get("/report/:id", getSingleReport);

// Upload Report
// Upload Report
router.put(
    "/report/upload/:id",
    upload.single("reportFile"),
    uploadReport
);

module.exports = router;