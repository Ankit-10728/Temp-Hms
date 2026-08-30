const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const kennelController = require('../controllers/kennelController');



router.use(authorize("KENNEL", "CLINIC_ADMIN"));

router.post('/create', upload.fields([
    { name: "firstAidCertificate", maxCount: 1 },
]), kennelController.createKennel);
router.get("/", kennelController.getAllKennels);
router.get("/:id", kennelController.getKennelById);
router.put("/:id", upload.fields([
    { name: "firstAidCertificate", maxCount: 1, },
]), kennelController.updateKennel);
router.patch("/:id/status", kennelController.toggleKennelStatus);
router.delete("/:id", kennelController.deleteKennel);

module.exports = router;