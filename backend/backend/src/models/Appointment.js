const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  type: { type: String, enum: ['PHYSICAL', 'ONLINE_VIDEO'], required: true },
  appointmentDate: { type: Date, required: true },
  status: {
    type: String,
    enum: [
      'WAITING',
      'IN_CONSULTATION',
      'LAB_PENDING',
      'LAB_COMPLETED',
      'COMPLETED',
      'NO_SHOW',
      'CANCELLED'
    ],
    default: 'WAITING'
  },
  videoLink: { type: String },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'REFUNDED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
