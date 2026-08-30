const express = require("express");

const router = express.Router();

const petOwnerController = require("../controllers/petOwnerController");
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/auth");

router.use(protect);

// Dashboard
router.get("/dashboard", petOwnerController.getDashboard
);

// Pet History
router.get(
    "/history/:petId",
    petOwnerController.getPetHistory
);


// Upload Owner Report
router.post(
    "/report/upload",
    upload.single("file"),
    petOwnerController.uploadOwnerReport
);

// Get All Reports
router.get(
    "/report",
    petOwnerController.getOwnerReports
);

// Get Single Report
router.get(
    "/report/:id",
    petOwnerController.getReportById
);

// Download Report
router.get(
    "/report/download/:id",
    petOwnerController.downloadReport
);

// Delete Report
router.delete(
    "/report/:id",
    petOwnerController.deleteOwnerReport
);

router.get("/pets", petOwnerController.getOwnerPets);

module.exports = router;