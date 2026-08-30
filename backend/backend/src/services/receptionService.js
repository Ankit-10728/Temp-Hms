const Owner = require("../models/Owner");
const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");

class ReceptionService {

    /* ================= OWNER ================= */
    async findOwnerByMobile(mobile, clinicId) {
        const owner = await Owner.findOne({ mobile, clinicId }).lean();
        if (!owner) return null;

        const pets = await Pet.find({ ownerId: owner._id, clinicId });
        return { ...owner, pets };
    }

    async createOwnerWithPet(ownerData, petData) {
        const owner = await Owner.create(ownerData);

        const pet = await Pet.create({
            ...petData,
            ownerId: owner._id,
        });

        return { owner, pet };
    }

    /* ================= APPOINTMENT ================= */

    async createAppointment(data) {
        const appt = await Appointment.create(data);

        await MedicalRecord.create({
            appointmentId: appt._id,
            clinicId: data.clinicId,
            petId: data.petId,
            doctorId: data.doctorId,
        });

        return appt;
    }

    async getTodayQueue(clinicId, start, end) {
        return await Appointment.find({
            clinicId,
            appointmentDate: { $gte: start, $lte: end },
        })
            .populate("doctorId", "name")
            .populate("petId", "name breed")
            .populate("ownerId", "name mobile")
            .sort({ appointmentDate: 1 });
    }

    async updateStatus(id, clinicId, status) {
        return await Appointment.findOneAndUpdate(
            { _id: id, clinicId },
            { status },
            { new: true }
        );
    }

    /* ================= DASHBOARD ================= */

    async getStats(clinicId, start, end) {
        const todayVisits = await Appointment.countDocuments({
            clinicId,
            appointmentDate: { $gte: start, $lte: end },
        });

        const newPets = await Pet.countDocuments({
            clinicId,
            createdAt: { $gte: start, $lte: end },
        });

        const appointments = await Appointment.countDocuments({ clinicId });

        const pending = await Appointment.countDocuments({
            clinicId,
            status: "WAITING",
        });

        return {
            todayVisits,
            newPets,
            appointments,
            pending,
        };
    }
}

module.exports = new ReceptionService();