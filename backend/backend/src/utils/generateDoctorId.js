const Doctor = require("../models/DoctorDetails");

const generateDoctorId = async () => {
    const lastDoctor = await Doctor.findOne()
        .sort({ createdAt: -1 })
        .select("doctorId");

    if (!lastDoctor) {
        return "DOC-0001";
    }

    const lastNumber = parseInt(lastDoctor.doctorId.split("-")[1], 10);

    return `DOC-${String(lastNumber + 1).padStart(4, "0")}`;
};

module.exports = generateDoctorId;