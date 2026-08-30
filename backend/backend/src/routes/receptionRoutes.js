const express = require('express');
const router = express.Router();

const { authorize } = require('../middlewares/auth');

const {
    searchOwner,
    getClinicQueue,
    updateAppointmentStatus,
    registerOwnerAndPet,
    bookAppointment
} = require('../controllers/receptionController');

router.use(authorize('RECEPTIONIST', 'CLINIC_ADMIN'));

router.post('/owners/register', registerOwnerAndPet);
router.get('/owners/search', searchOwner);
router.get('/appointments/queue', getClinicQueue);
router.post('/appointments/book', bookAppointment);
router.put('/appointments/:id/status', updateAppointmentStatus);

// router.post('/vitals', authorize('PARA_MEDICAL'), updateVitals);

module.exports = router;
