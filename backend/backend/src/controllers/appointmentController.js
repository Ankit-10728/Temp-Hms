const Appointment = require('../models/Appointment');

exports.getDoctorSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    // Parse the requested date to get start and end of that day
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    // Find all booked appointments for this doctor on this day
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['CANCELLED', 'NO_SHOW'] } // Ignore cancelled ones
    }).select('appointmentDate');

    // Extract just the times that are booked (e.g., "10:00 AM")
    const bookedTimes = bookedAppointments.map(app => 
      app.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );

    // Generate standard clinic slots (e.g., 10 AM to 5 PM, every 30 mins)
    const allSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    // Filter out the booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({ success: true, date: startOfDay.toISOString().split('T')[0], availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/appointments/owner -> Mobile App: Owner's upcoming/past bookings
exports.getOwnerAppointments = async (req, res) => {
  try {
    // For mobile app, the ID is pulled securely from their JWT token
    const ownerId = req.user.id; 

    const appointments = await Appointment.find({ ownerId })
      .populate('clinicId', 'name address location')
      .populate('doctorId', 'name specialization')
      .populate('petId', 'name species')
      .sort({ appointmentDate: -1 }); // Newest first

    // Categorize for the mobile frontend
    const today = new Date();
    const upcoming = appointments.filter(app => new Date(app.appointmentDate) >= today && app.status !== 'CANCELLED');
    const past = appointments.filter(app => new Date(app.appointmentDate) < today || app.status === 'CANCELLED');

    res.status(200).json({ success: true, data: { upcoming, past } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};