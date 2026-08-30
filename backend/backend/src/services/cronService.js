const cron = require('node-cron');
const MedicalRecord = require('../models/MedicalRecord');
const { sendSMS } = require('../utils/otpService');
const startCronJobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily vaccine reminder check...');

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      // Find all medical records containing a vaccine due tomorrow
      const records = await MedicalRecord.find({
        'vaccinesAdministered.nextDueDate': {
          $gte: startOfTomorrow,
          $lte: endOfTomorrow
        }
      })
        .populate('petId', 'name')
        .populate({ path: 'appointmentId', populate: { path: 'ownerId', select: 'name mobile' } })
        .populate('clinicId', 'name');

      records.forEach(record => {
        const owner = record.appointmentId.ownerId;
        const pet = record.petId;
        const clinic = record.clinicId;

        // Find the specific vaccine that is due tomorrow
        const dueVaccines = record.vaccinesAdministered.filter(v =>
          new Date(v.nextDueDate) >= startOfTomorrow && new Date(v.nextDueDate) <= endOfTomorrow
        );

        dueVaccines.forEach(async (vaccine) => {
          const message = `Hi ${owner.name}, reminder that ${pet.name} is due for their ${vaccine.vaccineName} vaccine tomorrow at ${clinic.name}. Please book your slot via our app!`;

          // Fire the SMS via your utility
          await sendSMS(owner.mobile, 'OTP_REPLACED_BY_TEXT', message);
          console.log(`[CRON] Reminder sent to ${owner.mobile} for pet ${pet.name}`);
        });
      });

    } catch (error) {
      console.error('[CRON] Error running vaccine reminder job:', error);
    }
  });
};

module.exports = startCronJobs;