const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const groomerController = require('../controllers/groomerController');

router.use(authorize("CLINIC_ADMIN"));

router.post('/create', upload.fields([
    { name: "certificateDocument", maxCount: 1 },
]), groomerController.createGroomer);

router.get("/", groomerController.getAllGroomers);
router.get("/:id", groomerController.getGroomerById);
router.put(
    "/:id",
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "certificateDocument", maxCount: 1 }
    ]),
    groomerController.updateGroomer
);

router.delete("/:id", groomerController.deleteGroomer);

module.exports = router;