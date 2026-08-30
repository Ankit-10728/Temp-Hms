const express = require('express');
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');
const petRegistrationController = require("../controllers/petRegistrationController");
const visitController = require("../controllers/visitController")

router.use(authorize("RECEPTION", "RECEPTIONIST", "CLINIC_ADMIN", "CLINIC_STAFF", "STAFF", "RECEPTION_STAFF", "SUPER_ADMIN", "DOCTOR", "PRE_CONSULTATION"));
router.post("/visits/create", visitController.createVisit);
router.post("/new-registration/send-otp", petRegistrationController.sendRegistrationOtp);
router.post("/new-registration/verify-otp", petRegistrationController.verifyRegistrationOtp);
router.post("/new-registration", upload.single("petPhoto"), petRegistrationController.createRegistration);
router.get("/new-registration/mobile/:mobileNumber", petRegistrationController.searchCustomer);
router.get("/new-registration/owner/:ownerId", petRegistrationController.getOwnerDetails);
router.put("/new-registration/owner/:ownerId", petRegistrationController.updateOwner);
router.post("/new-registration/owner/:ownerId/pets", petRegistrationController.addPet);
router.put("/new-registration/owner/:ownerId/pets/:petId", petRegistrationController.updatePet);
router.delete("/new-registration/owner/:ownerId/pets/:petId", petRegistrationController.deletePet);
router.post("/new-registration/owner/:ownerId/pets/:petId/visit", petRegistrationController.addVisit);
router.put("/new-registration/owner/:ownerId/pets/:petId/visits/:visitId", petRegistrationController.updatePetVisit);
router.delete("/new-registration/owner/:ownerId/pets/:petId/visits/:visitId", petRegistrationController.deletePetVisit);
router.get("/petHistory", petRegistrationController.getPetHistory);


//clinic reception routes for checking history
router.get("/existing-customers/stats", petRegistrationController.getDashboardStats);
router.get("/existing-customers", petRegistrationController.getExistingCustomers);
router.get("/existing-customers/:ownerId/pets/:petId", petRegistrationController.getPetDetails);

module.exports = router;
