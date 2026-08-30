const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Step 2: Vitals & Initial Assessment (Pre-Consultation Staff)
  vitals: {
    temperature: Number, 
    heartRate: Number, 
    respiratoryRate: Number,
    bpSystolic: Number, 
    bpDiastolic: Number, 
    spo2: Number, 
    weight: Number,
    bodyConditionScore: Number
  },
  initialAssessment: {
    durationOfIllness: String, 
    onset: String, 
    progression: String,
    previousEpisodes: String, 
    recentTravel: String, 
    primaryComplaint: String,
    associatedSymptoms: [String], 
    severity: String, 
    generalDemeanour: String,
    gaitPosture: String, 
    visibleLesions: String, 
    eentAbnormalities: String,
    skinCoatCondition: String, 
    staffNotes: String
  },

  // Step 3: Doctor's Consultation
  doctorReview: {
    dietType: String, 
    dietFrequency: Number, 
    waterIntake: String,
    behaviouralHabits: [String], 
    exerciseLevel: String
  },
  clinicalObservations: {
    cardiovascular: String, 
    respiratory: String, 
    digestive: String,
    musculoskeletal: String, 
    neurological: String, 
    urogenital: String,
    skinCoat: String, 
    eent: String, 
    lymphNodes: String, 
    detailedNotes: String
  },
  diagnosis: {
    provisional: String, 
    differentials: [String], 
    confirmed: String
  },
  treatment: {
    medicines: [{ 
      drug: String, 
      dose: String, 
      route: String, 
      frequency: String, 
      duration: String, 
      instructions: String 
    }],
    procedures: [{ name: String, description: String, outcome: String }],
    fluids: { given: Boolean, type: String, volume: Number, rate: String },
    deworming: { given: Boolean, product: String, dose: String, date: Date }
  },
  plan: {
    dietaryAdvice: String, 
    activityRestrictions: String, 
    homeCare: String,
    preventiveCare: String, 
    prognosis: String, 
    caseStatus: { type: String, default: 'OPEN' }
  },
  
  vaccinesAdministered: [{ 
    vaccineName: String, 
    dateGiven: { type: Date, default: Date.now }, 
    nextDueDate: Date 
  }],
  followUpDate: Date
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);