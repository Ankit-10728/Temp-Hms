const express = require("express");
const router = express.Router();
const { authorize } = require('../middlewares/auth');
const subscriptionPlanController = require("../controllers/subscriptionPlanController")



router.use(authorize("CLINIC_ADMIN"));


router.use("/status", subscriptionPlanController.getSubscriptionStatus);
router.use("/all-plans", subscriptionPlanController.getAllPlans);
router.use("/current-status", subscriptionPlanController.getCurrentSubscription);


module.exports = router;