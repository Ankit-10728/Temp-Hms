const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
  degree: { type: String, trim: true, default: '' },
  institution: { type: String, trim: true, default: '' },
  year: { type: String, trim: true, default: '' },
}, { _id: false });

const bankDetailsSchema = new mongoose.Schema({
  accountName: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  ifsc: { type: String, trim: true, default: '' },
  bankName: { type: String, trim: true, default: '' },
  branch: { type: String, trim: true, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Removed `required: true` to support Solo Practitioners (Doctors not attached to a hospital)
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  name: { type: String, required: true },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
  },
  mobile: { type: String, required: true, unique: true },
  password: {
    type: String,
    select: false,
  },
  temporaryPassword: {
    type: String,
    default: '',
  },
  forcePasswordReset: {
    type: Boolean,
    default: true,
  },
  failedPasswordAttempts: { type: Number, default: 0 },
  passwordLockUntil: { type: Date, default: null },
  failedOtpAttempts: { type: Number, default: 0 },
  otpLockUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  lastLoginIp: { type: String, default: null },
  lastLoginDevice: { type: String, default: null },
  role: {
    type: String, 
    enum: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'PARA_MEDICAL', 'RECEPTIONIST'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  veterinarianStatus: {
    type: String,
    enum: ['SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED',
  },
  specialization: { type: String }, // Only populated if role is DOCTOR
  specializations: {
    type: [String],
    default: [],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  dateOfBirth: {
    type: Date,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  languages: {
    type: [String],
    default: [],
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  pincode: {
    type: String,
    default: '',
  },
  govtIdType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Passport'],
    default: '',
  },
  govtIdNumber: {
    type: String,
    default: '',
  },
  govtIdDocument: {
    type: String,
    default: '',
  },
  qualifications: {
    type: [qualificationSchema],
    default: [],
  },
  degreeCertificates: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
  },
  vetCouncilRegistrationNumber: {
    type: String,
    default: '',
  },
  stateVetCouncil: {
    type: String,
    default: '',
  },
  registrationCertificate: {
    type: String,
    default: '',
  },
  certificateValidityDate: {
    type: Date,
  },
  isRenewable: {
    type: Boolean,
    default: false,
  },
  
  // ==========================================
  // NEW: SOLO PRACTITIONER DETAILS
  // ==========================================
  practiceType: { 
    type: String,
    enum: [
      'Home visits',
      'Telemedicine',
      'Mobile clinic',
      'Freelance',
      'Government',
      'HOSPITAL',
      'SOLO_TELEMEDICINE',
      'SOLO_HOME_VISIT',
    ],
    default: '',
  },
  consultationFee: { type: Number, default: 0 },
  emergencyAvailable: {
    type: Boolean,
    default: false,
  },
  serviceAreas: {
    type: [String],
    default: [],
  },
  gstPan: {
    type: String,
    default: '',
  },
  bankDetails: {
    type: bankDetailsSchema,
    default: () => ({}),
  },
  plan: {
    type: String,
    default: '',
  }
}, { timestamps: true });

userSchema.index({ clinicId: 1, role: 1 });
module.exports = mongoose.model('User', userSchema);
