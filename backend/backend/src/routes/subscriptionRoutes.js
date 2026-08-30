
const express = require("express");
const router = express.Router();

const { authorize } = require('../middlewares/auth');
const {
    createSubscriptionPayment,
    getSubscriptionDetails,
    paymentFailure,
    paymentSuccess,

} = require("../controllers/subscriptionPlanController");

router.post("/payment-success", paymentSuccess);

router.post("/payment-failure", paymentFailure);



router.post(
    "/create-subscription",
    createSubscriptionPayment
);

router.get(
    "/:clinicId",
    getSubscriptionDetails
);


module.exports = router;