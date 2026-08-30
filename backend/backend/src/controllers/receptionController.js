const Owner = require('../models/Owner');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const MedicalRecord = require('../models/MedicalRecord');
const { parseDateOrUndefined, pickNestedOrFlat } = require('../utils/payloadUtils');

// GET /api/owners/search -> Find returning owners by mobile number
exports.searchOwner = async (req, res) => {
  try {
    const { mobile } = req.query;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Please provide a mobile number' });
    }

    // Populate pets so the receptionist instantly sees the owner's animals
    const owner = await Owner.findOne({ mobile }).lean();
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner not found' });
    }

    // Since pets are in a separate collection referencing ownerId
    const pets = await Pet.find({ ownerId: owner._id });

    res.status(200).json({ success: true, data: { ...owner, pets } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/owners/register -> Create owner + one pet (used by reception desk)
exports.registerOwnerAndPet = async (req, res) => {
  try {
    // Support BOTH:
    // 1) nested payload: { owner: {...}, pet: {...} }
    // 2) flat payload: { name, mobile, species, breed, ... }
    const ownerPayload = pickNestedOrFlat({
      body: req.body,
      nestedKey: 'owner',
      fallbackKeys: ['name', 'mobile', 'alternateMobile', 'email', 'govtId']
    });

    const petPayload = pickNestedOrFlat({
      body: req.body,
      nestedKey: 'pet',
      fallbackKeys: ['species', 'breed', 'dob', 'gender', 'color', 'rfidTag']
    });

    const {
      name,
      mobile,
      alternateMobile,
      email,
      govtId,
      address,
      location
    } = ownerPayload;

    const {
      species,
      breed,
      dob,
      gender,
      color,
      identificationMarks,
      photoUrl,
      isSterilised,
      allergies,
      rfidTag
    } = petPayload;

    const normalizedDob = parseDateOrUndefined(dob);

    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Owner name and mobile are required' });
    }
    if (!species) {
      return res.status(400).json({ success: false, message: 'Pet species is required' });
    }

    const owner = await Owner.create({
      name,
      mobile,
      alternateMobile,
      email,
      govtId,
      address,
      location
    });

    const pet = await Pet.create({
      ownerId: owner._id,
      species,
      breed,
      dob: normalizedDob,
      gender,
      color,
      identificationMarks,
      photoUrl,
      isSterilised,
      allergies,
      rfidTag
    });

    res.status(201).json({ success: true, data: { owner, pet } });
  } catch (error) {
    // Keep DB unchanged; only return useful error.
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/appointments/book -> Book appointment (reception desk)
exports.bookAppointment = async (req, res) => {
  try {
    // Accept only the fields we need; normalize nested payloads if frontend sends them that way.
    const payload = req.body || {};
    const ownerId = payload.ownerId ?? payload.owner?.ownerId;
    const petId = payload.petId ?? payload.pet?.petId;
    const doctorId = payload.doctorId ?? payload.doctor?.doctorId;
    const type = payload.type ?? payload.appointmentType;
    const appointmentDateRaw = payload.appointmentDate ?? payload.date;
    const videoLink = payload.videoLink;

    const appointmentDate = parseDateOrUndefined(appointmentDateRaw);

    const clinicId = req.user.clinicId;

    if (!ownerId || !petId || !doctorId || !type || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: 'ownerId, petId, doctorId, type and appointmentDate are required',
        received: {
          ownerId: Boolean(ownerId),
          petId: Boolean(petId),
          doctorId: Boolean(doctorId),
          type: Boolean(type),
          appointmentDateValid: Boolean(appointmentDate)
        }
      });
    }

    const appt = await Appointment.create({
      clinicId,
      doctorId,
      ownerId,
      petId,
      type,
      appointmentDate,
      videoLink
    });

    // If you want MedicalRecord creation at booking time, it can be added here.
    // Current schema requires appointmentId/clinicId/petId/doctorId.
    // We'll create an empty record placeholder so doctor vitals/consultation updates have a record.
    await MedicalRecord.create({
      appointmentId: appt._id,
      clinicId,
      petId,
      doctorId
    });

    res.status(201).json({ success: true, data: appt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/records/vitals -> Para-medical vitals fill (but routed via /api/records/vitals)
exports.updateVitals = async (req, res) => {
  try {
    const payload = req.body || {};
    const recordId = payload.recordId ?? payload.record?.recordId;
    const vitals = payload.vitals ?? payload.vitalsData;
    const initialAssessment = payload.initialAssessment ?? payload.assessment;

    const vitalsNormalized = vitals && typeof vitals === 'object' ? vitals : undefined;
    const initialAssessmentNormalized = initialAssessment && typeof initialAssessment === 'object' ? initialAssessment : undefined;

    if (!recordId) {
      return res.status(400).json({ success: false, message: 'recordId is required' });
    }

    const update = {};
    if (vitalsNormalized) update.vitals = vitalsNormalized;
    if (initialAssessmentNormalized) update.initialAssessment = initialAssessmentNormalized;

    const record = await MedicalRecord.findByIdAndUpdate(
      recordId,
      update,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'MedicalRecord not found' });
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/appointments/queue -> Clinic-wide waiting list for Reception
exports.getClinicQueue = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    // Get all appointments for today at this clinic
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const queue = await Appointment.find({
      clinicId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('doctorId', 'name')
      .populate('petId', 'name breed')
      .populate('ownerId', 'name mobile')
      .sort({ appointmentDate: 1 }); // Sort by time

    res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/appointments/:id/status -> Reception manually updating queue status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const payload = req.body || {};
    const status = payload.status ?? payload.appointmentStatus;
    const { id } = req.params;
    const clinicId = req.user.clinicId;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    // Allowed manual overrides by receptionist
    // Reception can start flow by moving to IN_CONSULTATION.
    const allowedStatuses = ['WAITING', 'IN_CONSULTATION', 'NO_SHOW', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }


    // Ensure the receptionist only updates appointments belonging to their clinic
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, clinicId },
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found in your clinic' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getDashboardStats = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayVisits = await Appointment.countDocuments({
      clinicId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const newPets = await Pet.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const appointments = await Appointment.countDocuments({
      clinicId,
    });

    const pending = await Appointment.countDocuments({
      clinicId,
      status: "WAITING",
    });

    res.status(200).json({
      success: true,
      data: {
        todayVisits,
        newPets,
        appointments,
        pending,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getPendingRegistrations = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const registrations = await Appointment.find({
      clinicId,
      status: "WAITING",
    })
      .populate("ownerId", "name mobile")
      .populate("petId", "name")
      .sort({ createdAt: -1 });

    const data = registrations.map((item) => ({
      id: item._id,
      token: item._id.toString().slice(-6),
      owner: item.ownerId?.name,
      pet: item.petId?.name,
      status: item.status,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

