const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'PetRegistration' },
  name: { type: String, required: true },
  petName: { type: String },
  uniquePetId: { type: String },
  species: { type: String, enum: ['DOG', 'CAT', 'BIRD', 'OTHER', 'RABBIT'], required: true },
  otherSpecies: { type: String, trim: true },
  breed: { type: String },
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String },
  color: { type: String },
  identificationMarks: { type: String },
  identificationArea: { type: String },
  photoUrl: { type: String },
  photoName: { type: String },
  isSterilised: { type: Boolean, default: false },
  sterilized: { type: Boolean, default: false },
  weightTracker: [{
    weight: Number,
    date: { type: Date, default: Date.now }
  }],
  allergies: [{ type: String }],
  rfidTag: { type: String },
  rfid: { type: String },
  history: {
    vaccinations: [{
      name: String,
      vaccineName: String,
      date: Date,
      vaccinationDate: Date,
      batchNumber: String,
      clinicName: String
    }],
    dewormings: [{
      product: String,
      dewormingProduct: String,
      date: Date,
      dewormingDate: Date,
      dose: String
    }],
    surgeries: [{
      procedure: String,
      surgicalProcedure: String,
      date: Date,
      surgeryDate: Date,
      hospital: String
    }],
    treatments: [{
      details: String,
      treatment: String,
      condition: String,
      date: Date,
      treatmentDate: Date
    }],
    allergies: String,
    currentMedications: String,
    notes: String
  },
  visits: [{
    primaryReason: {
      type: String,
      enum: ["Treatment", "Vaccination", "Checkup", "Certificate"],
      required: true
    },
    assignedDoctor: {
      type: String,
      required: true
    },
    complaint: {
      type: String,
      required: true
    },
    tokenNumber: String,
    appointmentDate: {
      type: Date,
      required: true
    },
    appointmentTime: {
      type: String,
      required: true
    },
    status: { type: String, default: "Pending" }
  }]
}, { timestamps: true });


const Pet = mongoose.model("Pet", petSchema);

module.exports = {
  Pet,
  petSchema,
};
