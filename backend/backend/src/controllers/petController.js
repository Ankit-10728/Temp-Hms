const Pet = require('../models/Pet');
const MedicalRecord = require('../models/MedicalRecord');

// POST /api/pets -> Add another pet to an existing owner
exports.addPet = async (req, res) => {
  try {
    const { ownerId, name, species, breed, dob, gender, color } = req.body;

    const finalOwnerId = req.user.role === 'OWNER' ? req.user.id : ownerId;

    const pet = await Pet.create({
      ownerId: finalOwnerId,
      name,
      species,
      breed,
      dob,
      gender,
      color
    });

    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/pets/:id -> Get pet details & health summary
exports.getPetDetails = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('ownerId', 'name mobile');
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Fetch a quick summary of their last visit
    const lastVisit = await MedicalRecord.findOne({ petId: pet._id })
      .sort({ createdAt: -1 })
      .select('diagnosisNotes followUpDate createdAt');

    res.status(200).json({ success: true, data: { pet, lastVisit } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/pets/:id -> Update weight, allergies, RFID tag
exports.updatePet = async (req, res) => {
  try {
    const { weight, newAllergy, rfidTag } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Append new weight to the tracker array if provided
    if (weight) {
      pet.weightTracker.push({ weight, date: new Date() });
    }
    // Append new allergy if provided
    if (newAllergy && !pet.allergies.includes(newAllergy)) {
      pet.allergies.push(newAllergy);
    }
    if (rfidTag) pet.rfidTag = rfidTag;

    await pet.save();
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};