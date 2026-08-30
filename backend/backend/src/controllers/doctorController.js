const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// Doctor Dashboard: Get today's queue[cite: 2]
exports.getDoctorQueue = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const clinicId = req.user.clinicId;

    // Fetch appointments for this specific doctor and clinic[cite: 1]
    const queue = await Appointment.find({ 
      doctorId, 
      clinicId, 
      status: { $in: ['WAITING', 'IN_CONSULTATION'] } 
    }).populate('petId ownerId');

    res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Consultation Screen & Prescription[cite: 2]
exports.saveConsultation = async (req, res) => {
  try {
    const { recordId, diagnosisNotes, privateNotes, prescription, labTestsSuggested, followUpDate } = req.body;

    // Update the existing medical record with doctor's notes & prescription
    const record = await MedicalRecord.findByIdAndUpdate(
      recordId,
      { diagnosisNotes, privateNotes, prescription, labTestsSuggested, followUpDate },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'MedicalRecord not found' });
    }

    // If doctor suggested lab tests => move to LAB_PENDING
    const suggested = Array.isArray(labTestsSuggested)
      ? labTestsSuggested
      : (labTestsSuggested ? [labTestsSuggested] : []);

    const nextStatus = suggested.length > 0 ? 'LAB_PENDING' : 'COMPLETED';

    await Appointment.findByIdAndUpdate(record.appointmentId, {
      status: nextStatus,
    });

    res.status(200).json({ success: true, record, status: nextStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/v1/clinic/doctorModule/close-case/:appointmentId
// Doctor finalizes the case after LAB_COMPLETED
exports.closeCase = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'LAB_COMPLETED') {
      return res.status(400).json({ success: false, message: 'Lab is not completed for this appointment' });
    }

    // Update MedicalRecord caseStatus to CLOSED (if record exists)
    await MedicalRecord.updateOne(
      { appointmentId: appointment._id },
      { $set: { 'plan.caseStatus': 'CLOSED' } }
    );

    await Appointment.findByIdAndUpdate(appointmentId, { status: 'COMPLETED' });

    res.status(200).json({ success: true, appointmentId, status: 'COMPLETED' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

