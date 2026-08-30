const Review = require('../models/Review');

// POST /api/reviews -> Owner submits a review
exports.addReview = async (req, res) => {
  try {
    const { clinicId, doctorId, rating, reviewText } = req.body;
    const ownerId = req.user.id; // From JWT

    const review = await Review.create({
      clinicId,
      ownerId,
      doctorId,
      rating,
      reviewText
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/reviews/clinic/:id -> List reviews for a clinic (Public App View)
exports.getClinicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ clinicId: req.params.id })
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / (reviews.length || 1);

    res.status(200).json({ success: true, average: avgRating.toFixed(1), count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review securely deleted by Admin' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};