const MedicalRecord = require('../models/MedicalRecord');

exports.getPetMedicalHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    const clinicId = req.user.clinicId; // Multi-tenant isolation

    // Fetch all past records for this pet at this specific clinic
    const history = await MedicalRecord.find({ petId, clinicId })
      .populate('doctorId', 'name specialization') // Get the doctor's name who treated them
      .sort({ createdAt: -1 }); // Newest records first

    if (!history || history.length === 0) {
      return res.status(404).json({ success: false, message: 'No medical history found for this pet' });
    }

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};