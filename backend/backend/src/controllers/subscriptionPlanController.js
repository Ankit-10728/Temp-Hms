const SubscriptionPlan = require('../models/SubscriptionPlan');
const Clinic = require("../models/Clinic");
const clinincSubscriptionTracker = require("../models/ClinicSubscriptionTracker")
const crypto = require("crypto");
const { log } = require('console');

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const SOLO_DOCTOR_PLAN_NAMES = new Set(['Solo Basic', 'Solo Pro']);

const normalizePlanType = (planType, subscriptionPlan) => {
  const explicitPlanType = typeof planType === 'string' ? planType.trim() : '';

  if (explicitPlanType === 'Solo Doctor') {
    return 'Solo Doctor';
  }

  if (SOLO_DOCTOR_PLAN_NAMES.has(subscriptionPlan)) {
    return 'Solo Doctor';
  }

  return 'Clinic';
};


exports.getCurrentSubscription = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const [subscription, clinic] = await Promise.all([
      clinincSubscriptionTracker
        .findOne({ clinicId })
        .populate("planId"),
      Clinic.findById(clinicId).select("contactEmail"),
    ]);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found.",
      });
    }

    let remainingDays = 0;

    if (subscription.status === "TRIAL") {
      if (subscription.trialEndDate) {
        remainingDays = Math.max(
          0,
          Math.ceil(
            (subscription.trialEndDate - new Date()) /
            (1000 * 60 * 60 * 24)
          )
        );
      }
    } else if (subscription.status === "ACTIVE") {
      if (subscription.planEndRenewalDate) {
        remainingDays = Math.max(
          0,
          Math.ceil(
            (subscription.planEndRenewalDate - new Date()) /
            (1000 * 60 * 60 * 24)
          )
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        clinicId,
        email: clinic?.contactEmail || null,
        status: subscription.status,
        paymentStatus: subscription.paymentStatus,
        paymentDate: subscription.paymentDate,
        planStartDate: subscription.planStartDate,
        planEndRenewalDate: subscription.planEndRenewalDate,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        amountPaid: subscription.amountPaid,
        transactionId: subscription.transactionId,
        remainingDays,
        plan: subscription.planId,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current subscription.",
    });
  }
};


exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({
      planType: "Clinic",
      status: "Active",
    }).sort({
      price: 1,
    });

    return res.status(200).json({
      success: true,
      totalPlans: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription plans.",
    });
  }
};

const normalizePlanName = (planName) =>
  typeof planName === 'string' ? planName.trim() : planName;


exports.createSubscriptionPayment = async (req, res) => {
  try {
    const { clinicId } = req.body;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID is required",
      });
    }

    // Get Clinic
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const billingCycleMap = {
      Monthly: "Monthly",
      Quarterly: "Quarterly",
      "6_MONTHS": "Half-Yearly",
      "12_MONTHS": "Annual",
    };

    const billingCycle =
      billingCycleMap[clinic.subscriptionType] ||
      clinic.subscriptionType;

    // Same drift issue as getSubscriptionDetails above: clinic.subscriptionType
    // can point at a billing cycle with no currently-active plan - prefer the
    // clinic's own assigned plan by name first, then fall back to cycle match.
    const plan =
      (await SubscriptionPlan.findOne({
        subscriptionPlan: clinic.plan,
        status: "Active",
      })) ||
      (await SubscriptionPlan.findOne({
        billingCycle,
        status: "Active",
      }));

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    const txnid = `TXN_${Date.now()}`;

    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    const amount = Number(plan.price).toFixed(2);

    const productinfo = plan.subscriptionPlan;

    const firstname = clinic.name;

    // Falls back to "" (never undefined): a missing value here would
    // otherwise get embedded in the hash string as the literal text
    // "undefined" via template-literal coercion, while the JSON response's
    // "email" key gets silently dropped by JSON.stringify (which omits
    // undefined values) - so PayU would receive no email field at all and
    // recompute a different hash, failing with "incorrectly calculated
    // hash parameter" even though nothing in the request looked wrong.
    const email = clinic.contactEmail || clinic.email || "";



    let successUrl = process.env.PAYU_SUCCESS_URL;

    let failureUrl = process.env.PAYU_FAILURE_URL;


    console.log(successUrl);


    const udf1 = clinic._id.toString();

    const hashString =
      `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}` +
      `||||||||||${salt}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");



    return res.status(200).json({
      success: true,
      paymentData: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,

        surl: successUrl,
        furl: failureUrl,
        hash,
        service_provider: "payu_paisa",
        udf1: clinic._id.toString(),
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment.",
    });
  }
};


exports.getSubscriptionDetails = async (req, res) => {
  try {
    console.log("reached");

    const { clinicId } = req.params;

    // 1. Get Clinic
    const clinic = await Clinic.findById(clinicId).select(
      "name plan subscriptionType subscriptionStatus expiryDate"
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // 2. Find matching subscription plan
    const billingCycleMap = {
      Monthly: "Monthly",
      Quarterly: "Quarterly",
      "6_MONTHS": "Half-Yearly",
      "12_MONTHS": "Annual",
    };

    const billingCycle =
      billingCycleMap[clinic.subscriptionType] ||
      clinic.subscriptionType;

    // clinic.subscriptionType can drift out of sync with which plans are
    // actually Active (e.g. billing cycle changed since the clinic was set
    // up) - prefer the clinic's own assigned plan by name first, and only
    // fall back to any active plan on that billing cycle, same as the
    // fallback already used in getSubscriptionStatus/paymentSuccess above.
    const plan =
      (await SubscriptionPlan.findOne({
        subscriptionPlan: clinic.plan,
        status: "Active",
      }).select("subscriptionPlan billingCycle price featureLimits modules")) ||
      (await SubscriptionPlan.findOne({
        billingCycle,
        status: "Active",
      }).select("subscriptionPlan billingCycle price featureLimits modules"));
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // 3. Return combined response
    return res.status(200).json({
      success: true,
      data: {
        clinicId: clinic._id,
        clinicName: clinic.name,

        subscriptionStatus: clinic.subscriptionStatus,
        expiryDate: clinic.expiryDate,

        planName: plan.subscriptionPlan,
        billingCycle: plan.billingCycle,
        price: plan.price,

        featureLimits: plan.featureLimits,
        modules: plan.modules,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription details",
      error: error.message,
    });
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const clinicId = req.body.udf1;
    const transactionId = req.body.txnid;
    const amountPaid = Number(req.body.amount);

    // Update Clinic
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        subscriptionStatus: "ACTIVE",
      },
      { new: true }
    );

    if (!clinic) {
      return res.status(404).send("Clinic not found");
    }

    // Find Subscription
    const subscription = await clinincSubscriptionTracker.findOne({
      clinicId,
    }).populate("planId");

    if (!subscription) {
      return res.status(404).send("Subscription not found");
    }

    const planStartDate = new Date();
    const planEndRenewalDate = new Date(planStartDate);

    // Calculate remaining trial days
    let remainingTrialDays = 0;

    if (
      subscription.trialEndDate &&
      subscription.trialEndDate > planStartDate
    ) {
      const diff =
        subscription.trialEndDate.getTime() - planStartDate.getTime();

      remainingTrialDays = Math.ceil(
        diff / (1000 * 60 * 60 * 24)
      );
    }

    // Add subscription duration
    const latestPlanBillingCycle = clinic.subscriptionType === "12_MONTHS"
      ? "Annual"
      : clinic.subscriptionType === "6_MONTHS"
        ? "Half-Yearly"
        : clinic.subscriptionType;

    // Prefer a plan matching the clinic's assigned plan name, not just its
    // billing cycle - with more than one plan sharing a cycle (e.g. Basic
    // Annual and Enterprise Annual), matching on cycle alone could silently
    // move a clinic onto a different plan's pricing. Match by name alone
    // (not also requiring the cycle) since clinic.subscriptionType can drift
    // out of sync with which cycle the assigned plan is actually Active on -
    // the switch below uses latestPlan.billingCycle for the renewal math, so
    // it still stays correct even when the matched cycle differs from
    // subscriptionType's stale mapping.
    const latestPlan =
      (await SubscriptionPlan.findOne({
        subscriptionPlan: clinic.plan,
        status: "Active",
      })) ||
      (await SubscriptionPlan.findOne({
        billingCycle: latestPlanBillingCycle,
        status: "Active",
      }));

    if (!latestPlan) {
      return res.status(404).send("Subscription plan not found");
    }

    // Update tracker with latest plan
    subscription.planId = latestPlan._id;

    // Calculate renewal date
    switch (latestPlan.billingCycle) {

      case "Monthly":
        planEndRenewalDate.setMonth(
          planEndRenewalDate.getMonth() + 1
        );
        break;

      case "Quarterly":
        planEndRenewalDate.setMonth(
          planEndRenewalDate.getMonth() + 3
        );
        break;

      case "Half-Yearly":
        planEndRenewalDate.setMonth(
          planEndRenewalDate.getMonth() + 6
        );
        break;

      case "Annual":
        planEndRenewalDate.setFullYear(
          planEndRenewalDate.getFullYear() + 1
        );
        break;
    }

    // Add remaining trial days
    planEndRenewalDate.setDate(
      planEndRenewalDate.getDate() + remainingTrialDays
    );

    subscription.status = "ACTIVE";
    subscription.paymentStatus = "PAID";

    subscription.paymentDate = new Date();
    subscription.amountPaid = amountPaid;
    subscription.transactionId = transactionId;
    subscription.paymentGateway = "PAYU";

    subscription.planStartDate = planStartDate;
    subscription.planEndRenewalDate = planEndRenewalDate;

    // Trial is finished
    subscription.trialStartDate = null;
    subscription.trialEndDate = null;

    await subscription.save();

    console.log("Clinic:", clinic.name);

    return res.redirect(`${process.env.FRONTEND_URL}/clinic`);
  } catch (err) {
    console.error("========== PAYMENT SUCCESS ERROR ==========");
    console.error(err);
    console.error(err.stack);

    return res.status(500).send(err.stack);
  }
};

exports.paymentFailure = async (req, res) => {
  console.log("Payment Failed");
  console.log(req.body);

  const clinicId = req.body.udf1;

  let clinic = null;

  if (clinicId) {
    clinic = await Clinic.findById(clinicId).select(
      "name contactEmail subscriptionType"
    );
  }

  console.log(clinic);


  const params = new URLSearchParams({
    status: req.body.status || "FAILED",
    message: req.body.error_Message || req.body.error || "Payment Failed",
    txnid: req.body.txnid || "",
    amount: req.body.amount || "",
    mode: req.body.mode || "",
    attemptedAt: req.body.addedon || "",

    clinicName: clinic?.name || "",
    email: clinic?.contactEmail || "",
    plan: clinic?.subscriptionType || "",
  });

  return res.redirect(
    `${process.env.FRONTEND_URL}/payment-failure?${params.toString()}`
  );
};


exports.getSubscriptionStatus = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.user.clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Find subscription
    let subscription = await clinincSubscriptionTracker.findOne({
      clinicId: clinic._id,
    }).populate("planId");

    // Create subscription on first login
    if (!subscription) {
      console.log(clinic.plan);
      console.log(clinic.subscriptionType);

      // Clinic.subscriptionType is stored as a code (6_MONTHS, 12_MONTHS)
      // but SubscriptionPlan.billingCycle uses human-readable labels
      // (Half-Yearly, Annual) - same translation paymentSuccess uses below.
      const billingCycle =
        clinic.subscriptionType === "12_MONTHS"
          ? "Annual"
          : clinic.subscriptionType === "6_MONTHS"
            ? "Half-Yearly"
            : clinic.subscriptionType;

      // Prefer a plan matching the clinic's assigned plan name, not just its
      // billing cycle - see the same fix in paymentSuccess above for why.
      const defaultPlan =
        (await SubscriptionPlan.findOne({
          subscriptionPlan: clinic.plan,
          billingCycle,
          status: "Active",
        })) ||
        (await SubscriptionPlan.findOne({
          billingCycle,
          status: "Active",
        })) ||
        (await SubscriptionPlan.findOne({

          status: "Active",
        }))
        ;

      if (!defaultPlan) {


        return res.status(400).json({
          success: false,
          checking: true,
          message: "Subscription plan not found",
        });
      }

      const trialStartDate = new Date();

      const trialDays = Math.max(
        Number(clinic.trialDays ?? defaultPlan.trialPeriodDays ?? 0),
        0
      );
      const trialEndDate = new Date(trialStartDate);
      trialEndDate.setDate(
        trialEndDate.getDate() + trialDays
      );

      subscription = await clinincSubscriptionTracker.create({
        clinicId: clinic._id,
        planId: defaultPlan._id,

        status: trialDays > 0 ? "TRIAL" : "PAYMENT_REQUIRED",

        trialStartDate,
        trialEndDate,

        paymentStatus: "PENDING",
      });

      subscription = await clinincSubscriptionTracker.findById(
        subscription._id
      ).populate("planId");
    }

    // ===============================
    // Trial Expiry Check
    // ===============================
    if (
      subscription.status === "TRIAL" &&
      subscription.trialEndDate &&
      new Date() > subscription.trialEndDate
    ) {
      subscription.status = "PAYMENT_REQUIRED";
      await subscription.save();
    }

    // ===============================
    // Active Plan Expiry Check
    // ===============================
    if (
      subscription.status === "ACTIVE" &&
      subscription.planEndRenewalDate &&
      new Date() > subscription.planEndRenewalDate
    ) {
      subscription.status = "EXPIRED";
      await subscription.save();
    }

    // ===============================
    // Remaining Trial Days
    // ===============================
    let remainingTrialDays = 0;

    if (
      subscription.status === "TRIAL" &&
      subscription.trialEndDate
    ) {
      const diff =
        subscription.trialEndDate.getTime() - Date.now();

      remainingTrialDays = Math.max(
        0,
        Math.ceil(diff / (1000 * 60 * 60 * 24))
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: clinic._id,
        name: clinic.name,
        contactEmail: clinic.contactEmail,
        subscriptionStatus: clinic.subscriptionStatus,
        subscriptionType: clinic.subscriptionType,
        expiryDate: clinic.expiryDate,
      },
      subscription,
      remainingTrialDays,

    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription status",
    });
  }
};


const getRenewalDate = (startDate, billingCycle) => {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return null;

  if (billingCycle === 'Monthly') return addMonths(date, 1);
  if (billingCycle === 'Quarterly') return addMonths(date, 3);
  if (billingCycle === 'Half-Yearly') return addMonths(date, 6);
  if (billingCycle === 'Annual') return addMonths(date, 12);
  if (billingCycle === '6_MONTHS') return addMonths(date, 6);
  if (billingCycle === '12_MONTHS') return addMonths(date, 12);

  return null;
};

const buildPlanPayload = (body) => {
  const planType = normalizePlanType(body.planType, body.subscriptionPlan);
  const subscriptionPlan = normalizePlanName(body.subscriptionPlan);
  const renewalDate = body.planEndRenewalDate || getRenewalDate(body.planStartDate, body.billingCycle);

  return {
    planType,
    subscriptionPlan,
    billingCycle: body.billingCycle,
    price: Number(body.price || 0),
    planStartDate: body.planStartDate,
    planEndRenewalDate: renewalDate,
    trialPeriodDays: Number(body.trialPeriodDays || 0),
    discountPromoCode: body.discountPromoCode || '',
    customPlanNotes: body.customPlanNotes || '',
    featureLimits: {
      maxStaffAccounts: Number(body.maxStaffAccounts || 0),
      maxDoctors: Number(body.maxDoctors || 0),
      maxPetRecords: body.maxPetRecordsUnlimited ? undefined : Number(body.maxPetRecords || 0),
      maxPetRecordsUnlimited: Boolean(body.maxPetRecordsUnlimited),
      storageLimitGb: Number(body.storageLimitGb || 0)
    },
    modules: {
      lab: Boolean(body.labModuleEnabled),
      grooming: Boolean(body.groomingModuleEnabled),
      kennel: Boolean(body.kennelModuleEnabled),
      onlinePharmacy: Boolean(body.onlinePharmacyModuleEnabled),
      apiAccess: Boolean(body.apiAccessEnabled),
      whiteLabelBranding: Boolean(body.whiteLabelCustomBranding)
    },
    subscriptionInvoice: 'Shared manually by Super Admin',
    status: body.status || 'Active'
  };
};

exports.createPlan = async (req, res) => {
  try {
    const payload = buildPlanPayload(req.body);

    // Without this, submitting the same plan name + billing cycle twice
    // (e.g. an accidental double-click) silently inserted a second full
    // document instead of erroring, which is how duplicate plans and
    // orphaned clinic subscription references have happened before.
    const existing = await SubscriptionPlan.findOne({
      subscriptionPlan: payload.subscriptionPlan,
      billingCycle: payload.billingCycle,
      planType: payload.planType,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A ${payload.subscriptionPlan} / ${payload.billingCycle} plan already exists. Edit that plan instead of creating a new one.`,
      });
    }

    const lastPlan = await SubscriptionPlan.findOne({ planCode: /^PL\d+$/ }).sort({ planCode: -1 });
    const lastNumber = lastPlan ? parseInt(lastPlan.planCode.slice(2), 10) || 0 : 0;

    const plan = await SubscriptionPlan.create({
      ...payload,
      planCode: `PL${String(lastNumber + 1).padStart(4, '0')}`,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const payload = buildPlanPayload(req.body);

    const existing = await SubscriptionPlan.findOne({
      _id: { $ne: req.params.id },
      subscriptionPlan: payload.subscriptionPlan,
      billingCycle: payload.billingCycle,
      planType: payload.planType,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A ${payload.subscriptionPlan} / ${payload.billingCycle} plan already exists. Edit that one instead.`,
      });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id).select('subscriptionPlan');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // clinincSubscriptionTracker.countDocuments({ planId }) alone
    // overcounts: tracker records aren't cleaned up when a clinic is
    // deleted, so a plan can show far more "in use" clinics than
    // actually exist. Count by the clinic's own current plan name
    // instead - that's the authoritative "what plan is this clinic on"
    // source used everywhere else in this file (getSubscriptionDetails,
    // createSubscriptionPayment, paymentSuccess).
    const inUseCount = await Clinic.countDocuments({ plan: plan.subscriptionPlan });

    if (inUseCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This plan is still assigned to ${inUseCount} clinic${inUseCount === 1 ? '' : 's'} and cannot be deleted. Move those clinics to another plan first.`,
      });
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
