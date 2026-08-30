const MedicalRecord = require('../models/MedicalRecord');

exports.getVaccinationSchedule = async (req, res) => {
  try {
    const { petId } = req.params;

    // Find all records where vaccines were administered
    const records = await MedicalRecord.find({ 
      petId, 
      'vaccinesAdministered.0': { $exists: true } // Only fetch records that have vaccines
    }).select('vaccinesAdministered');

    const schedule = {
      completed: [],
      pending: [],
      overdue: []
    };

    const today = new Date();

    // Loop through records and categorize them
    records.forEach(record => {
      record.vaccinesAdministered.forEach(vaccine => {
        schedule.completed.push({ name: vaccine.vaccineName, dateGiven: vaccine.dateGiven });
        
        if (vaccine.nextDueDate) {
          if (new Date(vaccine.nextDueDate) < today) {
            schedule.overdue.push({ name: vaccine.vaccineName, dueDate: vaccine.nextDueDate });
          } else {
            schedule.pending.push({ name: vaccine.vaccineName, dueDate: vaccine.nextDueDate });
          }
        }
      });
    });

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};