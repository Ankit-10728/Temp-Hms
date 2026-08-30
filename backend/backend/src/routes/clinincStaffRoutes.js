const express = require('express');
const router = express.Router();
const {
    protect,
    authorize
} = require("../middlewares/auth");
const upload = require('../middlewares/uploadMiddleware');
const staffController = require('../controllers/staffController');

router.get(
    "/",
    protect,
    authorize("CLINIC_ADMIN"),
    staffController.getAllStaff
);

router.get(
    "/doctor-list",
    authorize("CLINIC_ADMIN", "RECEPTION", "RECEPTIONIST"),
    staffController.getDoctorStaff
);

router.post(
    "/",
    authorize("CLINIC_ADMIN"),
    upload.single("profilePhoto"),
    staffController.createStaff
);

router.get("/managers", authorize("CLINIC_ADMIN"), staffController.getManagers);
router.get("/contact-availability", authorize("CLINIC_ADMIN"), staffController.checkStaffContactAvailability);
router.get("/:id", authorize("CLINIC_ADMIN"), staffController.getStaffById);

router.put(
    "/:id",
    authorize("CLINIC_ADMIN"),
    upload.single("profilePhoto"),
    staffController.updateStaff
);

router.delete("/:id", authorize("CLINIC_ADMIN"), staffController.deleteStaff);

module.exports = router;
