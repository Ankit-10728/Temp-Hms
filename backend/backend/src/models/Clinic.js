const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  clinicCode: { type: String, unique: true, sparse: true, index: true },
  name: { type: String, required: true },
  facilityType: { type: String },
  yearOfEstablishment: { type: String },
  address: { type: String, required: true },
  contactEmail: { type: String, lowercase: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String },
  altPhone: { type: String },
  website: { type: String },
  plan: { type: String },
  trialDays: { type: Number, default: 0 },
  customPlanPrice: { type: Number },
  discountCode: { type: String },
  notes: { type: String },
  
  subscriptionType: { type: String, required: true },
  subscriptionStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'EXPIRED'], default: 'ACTIVE' },
  expiryDate: { type: Date },
  planStartDate: { type: Date },
  planEndDate: { type: Date },
  billingCycle: { type: String },
  
  licenseLimits: {
    maxDoctors: { type: Number, default: 5 },
    maxStaff: { type: Number, default: 10 },
    maxPets: { type: Number },
    maxPetsUnlimited: { type: Boolean, default: false },
    storageLimit: { type: Number }
  },
  
  location: { type: { type: String, enum: ['Point'] }, coordinates: { type: [Number] } },
  
  addressDetails: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    serviceAreas: [String]
  },

  adminDetails: {
    adminName: String,
    adminEmail: String,
    adminPhone: String,
    designation: String,
    govtIdType: String,
    govtIdNumber: String
  },

  taxDetails: {
    gstNumber: String,
    panNumber: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },

  registrationDetails: {
    vetRegistrationNumber: String,
    stateCouncil: String,
    vetExpiry: Date,
    tradeLicenseNumber: String,
    tradeExpiry: Date,
    drugLicenseNumber: String,
    drugExpiry: Date
  },

  features: {
    labModule: { type: Boolean, default: false },
    groomingModule: { type: Boolean, default: false },
    kennelModule: { type: Boolean, default: false },
    pharmacyModule: { type: Boolean, default: false },
    inventoryModule: { type: Boolean, default: false },
    telemedicineModule: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false }
  },

  servicesOffered: [{ type: String }],
  
  legalDocuments: {
    clinicLogoUrl: String,
    clinicLogoName: String,
    vetCouncilCertificateUrl: String,
    vetCouncilCertificateName: String,
    tradeLicenseUrl: String,
    tradeLicenseName: String,
    drugLicenseUrl: String,
    drugLicenseName: String,
    cancelledChequeUrl: String,
    cancelledChequeName: String,
    adminProfileUrl: String,
    adminProfileName: String,
    idDocumentUrl: String,
    idDocumentName: String
  },
  
  verificationStatus: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'DOCS_VERIFIED', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  isActive: { type: Boolean, default: true, index: true },
  rejectionReason: { type: String }
}, { timestamps: true });

clinicSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Clinic', clinicSchema);
