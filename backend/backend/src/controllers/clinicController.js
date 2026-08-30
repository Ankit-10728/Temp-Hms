const Clinic = require('../models/Clinic');

exports.searchNearbyClinics = async (req, res) => {
  try {
    const { lat, lng, maxDistanceKm = 10, specialization } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Convert km to meters for MongoDB
    const maxDistanceMeters = maxDistanceKm * 1000;

    let query = {
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: maxDistanceMeters
        }
      },
      subscriptionStatus: 'ACTIVE' // Only show active clinics
    };

    // If the user filters by a specific vet specialty
    if (specialization) {
      query.servicesOffered = specialization; 
    }

    const clinics = await Clinic.find(query).select('name address location licenseLimits servicesOffered');

    res.status(200).json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};