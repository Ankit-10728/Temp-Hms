const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  planType: {
    type: String,
    enum: ['Clinic', 'Solo Doctor'],
    default: 'Clinic'
  },
  planCode: {
    type: String,
    unique: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  subscriptionPlan: {
    type: String,
    enum: ['Basic', 'Standard', 'Professional', 'Enterprise', 'Solo Basic', 'Solo Pro', 'Custom'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', '6_MONTHS', '12_MONTHS', 'FREE_TIER'],
    required: true
  },
  planStartDate: {
    type: Date,
    required: true
  },
  planEndRenewalDate: {
    type: Date,
    required: true
  },
  trialPeriodDays: {
    type: Number,
    default: 0,
    min: 0
  },
  discountPromoCode: {
    type: String,
    trim: true
  },
  customPlanNotes: {
    type: String,
    trim: true
  },
  featureLimits: {
    maxStaffAccounts: { type: Number, required: true, min: 0 },
    maxDoctors: { type: Number, required: true, min: 0 },
    maxPetRecords: { type: Number, min: 0 },
    maxPetRecordsUnlimited: { type: Boolean, default: false },
    storageLimitGb: { type: Number, required: true, min: 0 }
  },
  modules: {
    lab: { type: Boolean, default: false },
    grooming: { type: Boolean, default: false },
    kennel: { type: Boolean, default: false },
    onlinePharmacy: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabelBranding: { type: Boolean, default: false }
  },
  subscriptionInvoice: {
    type: String,
    default: 'Shared manually by Super Admin'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
