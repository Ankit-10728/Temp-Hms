const PetRegistration = require("../models/PetRegistration");
const Visit = require("../models/visitModel");
const { generateOTP } = require("../utils/otpService");
const registrationOtps = new Map();

const normalizeSpecies = (species = "") => {
    const value = species.toString().trim().toUpperCase();
    return value === "RABBIT" || value === "BIRD" || value === "CAT" || value === "DOG"
        ? value
        : "OTHER";
};

const normalizeMobileNumber = (mobileNumber = "") =>
    String(mobileNumber || "").replace(/\D/g, "").slice(-10);

const generateGuaranteedUniquePetId = async (requestedId, offset = 0) => {
    let candidate = requestedId?.trim();

    const isTaken = async (id) => {
        if (!id) return true;
        const found = await PetRegistration.findOne({ "pets.uniquePetId": id });
        return !!found;
    };

    if (!candidate || candidate.toUpperCase() === "PET-AUTO" || (await isTaken(candidate))) {
        try {
            const totalPetsAgg = await PetRegistration.aggregate([
                { $unwind: "$pets" },
                { $count: "count" }
            ]);
            let nextNumber = (totalPetsAgg[0]?.count || 0) + 101 + offset;

            candidate = `PET-${String(nextNumber).padStart(3, "0")}`;
            while (await isTaken(candidate)) {
                nextNumber++;
                candidate = `PET-${String(nextNumber).padStart(3, "0")}`;
            }
        } catch (e) {
            candidate = `PET-${Date.now().toString().slice(-4)}${offset + 1}`;
        }
    }

    return candidate;
};

const generateGuaranteedTokenNumber = async (requestedToken, offset = 0) => {
    let candidate = requestedToken?.trim();

    if (candidate && candidate.toUpperCase().startsWith("TQ-")) {
        candidate = candidate.replace(/^TQ-/i, "TK-");
    }

    const isTaken = async (token) => {
        if (!token) return true;
        const found = await PetRegistration.findOne({ "pets.visits.tokenNumber": token });
        return !!found;
    };

    if (!candidate || candidate.toUpperCase() === "TK-AUTO" || (await isTaken(candidate))) {
        try {
            const totalVisitsAgg = await PetRegistration.aggregate([
                { $unwind: "$pets" },
                { $unwind: "$pets.visits" },
                { $count: "count" }
            ]);
            let nextNumber = (totalVisitsAgg[0]?.count || 0) + 101 + offset;

            candidate = `TK-${String(nextNumber).padStart(3, "0")}`;
            while (await isTaken(candidate)) {
                nextNumber++;
                candidate = `TK-${String(nextNumber).padStart(3, "0")}`;
            }
        } catch (e) {
            candidate = `TK-${Date.now().toString().slice(-4)}${offset + 1}`;
        }
    }

    return candidate;
};

const hasNumericValue = (value = "") => /\d/.test(String(value || ""));

const validateNameField = (value, label) => {
    if (!String(value || "").trim()) {
        return `${label} is required`;
    }

    if (hasNumericValue(value)) {
        return `${label} cannot contain numbers`;
    }

    return "";
};

const validateVisitDetails = (visitData = {}, label = "Visit") => {
    const requiredFields = [
        ["primaryReason", "primary reason"],
        ["complaint", "complaint"],
        ["appointmentDate", "appointment date"],
        ["appointmentTime", "appointment time"],
        ["assignedDoctor", "assigned doctor"],
    ];

    for (const [field, fieldLabel] of requiredFields) {
        if (!String(visitData?.[field] || "").trim()) {
            return `${label} ${fieldLabel} is required`;
        }
    }

    return "";
};


const sendRegistrationOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const cleanMobile = String(mobileNumber || "").replace(/\D/g, "").slice(-10);

        if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                message: "Valid 10 digit Indian mobile number starting with 6-9 is required",
            });
        }

        // Temporary fixed OTP requested for the reception registration flow.
        const otp = "123456";
        registrationOtps.set(cleanMobile, { otp: String(otp), expiresAt: Date.now() + 5 * 60 * 1000 });
        console.log("\n========================================");
        console.log(`🔑 [NEW REGISTRATION OTP] Mobile: ${cleanMobile} => OTP: ${otp}`);
        console.log("========================================\n");

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please check backend terminal to view OTP.",
        });
    } catch (error) {
        console.error("sendRegistrationOtp Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP",
        });
    }
};

const createRegistration = async (req, res) => {

    try {
        console.log("++++++++++++++++++++++++++++++++++++++++++++++")
        const {
            mobileNumber,
            ownerName,
            visitType,
            ownerIdType,
            ownerOtherIdType,
            ownerIdNumber,
            email,
            address,
            state,
            city,
            district,
            pincode,
            pet,
            history,
            visit,
        } = req.body;

        console.log(req.body);

        const clinicId = req.user.clinicId;
        const cleanMobile = normalizeMobileNumber(mobileNumber);

        if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                message: "Valid 10 digit Indian mobile number starting with 6-9 is required",
            });
        }

        const ownerNameError = validateNameField(ownerName, "Owner name");
        if (ownerNameError) {
            return res.status(400).json({
                success: false,
                message: ownerNameError,
            });
        }

        let owner = await PetRegistration.findOne({
            clinicId,
            mobileNumber: cleanMobile,
        });

        if (owner) {
            return res.status(409).json({
                success: false,
                message: "This mobile number is already registered",
                data: owner,
            });
        }

        const petsInput = Array.isArray(req.body.pets) && req.body.pets.length > 0
            ? req.body.pets
            : pet ? [pet] : [];

        for (let i = 0; i < petsInput.length; i++) {
            const currentPet = petsInput[i] || {};
            const petNameError = validateNameField(
                currentPet.petName || currentPet.name,
                `Pet #${i + 1} name`
            );

            if (petNameError) {
                return res.status(400).json({
                    success: false,
                    message: petNameError,
                });
            }

            const visitDetailsError = validateVisitDetails(
                currentPet.visit || visit,
                `Pet #${i + 1} visit`
            );

            if (visitDetailsError) {
                return res.status(400).json({
                    success: false,
                    message: visitDetailsError,
                });
            }
        }

        // New Owner
        owner = new PetRegistration({
            clinicId,
            mobileNumber: cleanMobile,
            ownerName,
            visitType,
            ownerIdType,
            ownerOtherIdType,
            ownerIdNumber,
            email,
            address,
            state,
            city,
            district,
            pincode,
            pets: [],
        });

        for (let i = 0; i < petsInput.length; i++) {
            const currentPet = petsInput[i];
            const uniquePetId = await generateGuaranteedUniquePetId(currentPet?.uniquePetId, i);
            const rawToken = currentPet?.tokenNumber?.trim() || currentPet?.visit?.tokenNumber?.trim();
            const tokenNumber = await generateGuaranteedTokenNumber(rawToken, i);

            const petData = {
                ...currentPet,
                name: currentPet?.name || currentPet?.petName || "Unnamed Pet",
                petName: currentPet?.petName || currentPet?.name || "Unnamed Pet",
                species: normalizeSpecies(currentPet?.species),
                isSterilised: currentPet?.sterilized === true || currentPet?.sterilized === "Yes",
                sterilized: currentPet?.sterilized === true || currentPet?.sterilized === "Yes",
                uniquePetId,
                ownerId: owner._id,
                history: {
                    vaccinations: currentPet?.history?.vaccinations || history?.vaccinations || [],
                    dewormings: currentPet?.history?.dewormings || history?.dewormings || [],
                    surgeries: currentPet?.history?.surgeries || history?.surgeries || [],
                    treatments: currentPet?.history?.treatments || history?.treatments || [],
                    allergies: currentPet?.history?.allergies || history?.allergies || "",
                    currentMedications: currentPet?.history?.currentMedications || history?.currentMedications || "",
                },
                visits: [
                    {
                        ...(currentPet?.visit || visit),
                        tokenNumber,
                    },
                ],
            };
            owner.pets.push(petData);
        }

        await owner.save();

        // Automatically create a Visit entry for each registered pet
        for (let i = 0; i < owner.pets.length; i++) {
            const createdPet = owner.pets[i];
            const petVisitInfo = petsInput[i]?.visit || visit || {};
            try {
                const tokenNum = lastVisit && typeof lastVisit.tokenNumber === "number" ? lastVisit.tokenNumber + 1 : (i + 1);
                const assignedToken = createdPet?.visits?.[0]?.tokenNumber || tokenNum;

                await Visit.create({
                    clinicId,
                    ownerId: owner._id,
                    petId: createdPet._id,
                    receptionistId: req.user?._id,
                    tokenNumber: assignedToken,
                    primaryReason: petVisitInfo?.primaryReason,
                    assignedDoctor: petVisitInfo?.assignedDoctor,
                    appointmentDate: petVisitInfo?.appointmentDate,
                    appointmentTime: petVisitInfo?.appointmentTime,
                    chiefComplaint: petVisitInfo?.complaint || petVisitInfo?.primaryReason || "New Patient Intake Assessment",
                    notes: petVisitInfo?.notes || "",
                    currentStage: "PRE_CONSULTATION",
                    status: "WAITING",
                    workflow: {
                        receptionCompleted: true,
                        preConsultationCompleted: false,
                        doctorCompleted: false,
                        labCompleted: false
                    }
                });
            } catch (visitErr) {
                console.error("Failed to auto-create visit for new registration pet:", visitErr);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Registration Created Successfully",
            data: owner,
        });
        
    } catch (error) {
        console.error(error);

        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This mobile number is already registered for this clinic",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
const searchCustomer = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const clinicId = req.user?.clinicId || req.user?.clinic;

        const cleanDigits = String(mobileNumber || "").replace(/\D/g, "").slice(-10);

        if (!cleanDigits || cleanDigits.length !== 10) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "Please enter a valid 10-digit mobile number."
            });
        }

        const filter = {
            mobileNumber: { $regex: cleanDigits + "$" }
        };

        if (clinicId) {
            filter.clinicId = clinicId;
        }

        const customer = await PetRegistration.findOne(filter);

        if (customer) {
            customer.isMobileVerified = true;
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            data: customer,
        });
    } catch (error) {
        console.error("searchCustomer Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error searching customer mobile number.",
        });
    }
};

// Get Owner Details
const getOwnerDetails = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const owner = await PetRegistration.findOne({
            _id: req.params.ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        return res.status(200).json({
            success: true,
            data: owner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateOwner = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const allowedFields = [
            "ownerName",
            "mobileNumber",
            "alternateNumber",
            "visitType",
            "ownerIdType",
            "ownerOtherIdType",
            "ownerIdNumber",
            "email",
            "address",
            "state",
            "city",
            "district",
            "pincode",
        ];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (updateData.ownerName !== undefined) {
            const ownerNameError = validateNameField(updateData.ownerName, "Owner name");
            if (ownerNameError) {
                return res.status(400).json({
                    success: false,
                    message: ownerNameError,
                });
            }
        }

        const owner = await PetRegistration.findOneAndUpdate(
            { _id: req.params.ownerId, clinicId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Owner Updated Successfully",
            data: owner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Add New Pet
const addPet = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const owner = await PetRegistration.findOne({
            _id: req.params.ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        const petNameError = validateNameField(req.body.petName || req.body.name, "Pet name");
        if (petNameError) {
            return res.status(400).json({
                success: false,
                message: petNameError,
            });
        }

        const uniquePetId = await generateGuaranteedUniquePetId(req.body.uniquePetId);

        owner.pets.push({
            ...req.body,
            name: req.body.name || req.body.petName,
            petName: req.body.petName || req.body.name,
            species: normalizeSpecies(req.body.species),
            ownerId: owner._id,
            isSterilised: req.body.sterilized === true || req.body.sterilized === "Yes",
            sterilized: req.body.sterilized === true || req.body.sterilized === "Yes",
            uniquePetId,
        });

        await owner.save();

        return res.status(200).json({
            success: true,
            message: "Pet Added Successfully",
            data: owner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updatePet = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;
        const { ownerId, petId } = req.params;

        const owner = await PetRegistration.findOne({
            _id: ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        const pet = owner.pets.id(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet Not Found",
            });
        }

        if (req.body.petName !== undefined || req.body.name !== undefined) {
            const petNameError = validateNameField(req.body.petName || req.body.name, "Pet name");
            if (petNameError) {
                return res.status(400).json({
                    success: false,
                    message: petNameError,
                });
            }
        }

        const allowedFields = [
            "petName",
            "name",
            "species",
            "otherSpecies",
            "breed",
            "dob",
            "age",
            "gender",
            "color",
            "identificationArea",
            "identificationMarks",
            "rfid",
            "rfidTag",
            "photoUrl",
            "photoName",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                pet[field] = field === "species" ? normalizeSpecies(req.body[field]) : req.body[field];
            }
        });

        if (req.body.petName || req.body.name) {
            pet.name = req.body.name || req.body.petName;
            pet.petName = req.body.petName || req.body.name;
        }

        if (req.body.sterilized !== undefined) {
            const sterilized = req.body.sterilized === true || req.body.sterilized === "Yes";
            pet.sterilized = sterilized;
            pet.isSterilised = sterilized;
        }

        if (req.body.history) {
            pet.history = {
                ...(pet.history || {}),
                ...req.body.history
            };
        }

        await owner.save();

        return res.status(200).json({
            success: true,
            message: "Pet Updated Successfully",
            data: owner,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Add Visit
const addVisit = async (req, res) => {
    try {
        const { ownerId, petId } = req.params;

        const clinicId = req.user.clinicId;

        const owner = await PetRegistration.findOne({
            _id: ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        const pet = owner.pets.id(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet Not Found",
            });
        }

        const visitDetailsError = validateVisitDetails(req.body);
        if (visitDetailsError) {
            return res.status(400).json({
                success: false,
                message: visitDetailsError,
            });
        }

        const newTokenNumber = req.body.tokenNumber || `TK-${Date.now()}`;
        pet.visits.push({
            ...req.body,
            tokenNumber: newTokenNumber,
        });

        await owner.save();

        // Create Visit document for Pre-Consultation / Doctor workflow
        try {
            const lastVisit = await Visit.findOne({ clinicId }).sort({ createdAt: -1 });
            const tokenNum = lastVisit && typeof lastVisit.tokenNumber === "number" ? lastVisit.tokenNumber + 1 : 1;

            await Visit.create({
                clinicId,
                ownerId: owner._id,
                petId: pet._id,
                receptionistId: req.user?._id,
                tokenNumber: req.body.tokenNumber || newTokenNumber || tokenNum,
                primaryReason: req.body.primaryReason,
                assignedDoctor: req.body.assignedDoctor,
                appointmentDate: req.body.appointmentDate,
                appointmentTime: req.body.appointmentTime,
                chiefComplaint: req.body.complaint || req.body.primaryReason || "Patient Intake Assessment",
                notes: req.body.notes || "",
                currentStage: "PRE_CONSULTATION",
                status: "WAITING",
                workflow: {
                    receptionCompleted: true,
                    preConsultationCompleted: false,
                    doctorCompleted: false,
                    labCompleted: false
                }
            });
        } catch (vErr) {
            console.error("Error creating Visit model entry in addVisit:", vErr);
        }

        return res.status(200).json({
            success: true,
            message: "Visit Added Successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Pet History by Id
const getPetHistoryByID = async (req, res) => {
    try {
        console.log("---------------------------------------------------------")
        const { ownerId, petId } = req.params;

        const clinicId = req.user.clinicId;

        await PetRegistration.findOne({
            _id: ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found",
            });
        }

        const pet = owner.pets.id(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet Not Found",
            });
        }

        return res.status(200).json({
            success: true,
            data: pet.history,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPetHistory = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const owners = await PetRegistration.find({
            clinicId,
        });
        const history = [];

        owners.forEach((owner) => {
            owner.pets.forEach((pet) => {

                // No visits at all
                if (!pet.visits || pet.visits.length === 0) {
                    history.push({
                        ownerId: owner._id,
                        petId: pet._id,
                        petName: pet.petName || "-",
                        owner: owner.ownerName || "-",
                        reason: "-",
                        doctor: "-",
                        status: "-",
                        age: pet.age || "-",
                        date: owner.createdAt,
                        formattedDate: owner.createdAt
                            ? new Date(owner.createdAt).toLocaleDateString()
                            : "-"
                    });

                    return;
                }

                pet.visits.forEach((visit) => {
                    const hasRealVisitData =
                        visit.primaryReason ||
                        visit.assignedDoctor ||
                        visit.appointmentDate ||
                        visit.complaint;

                    history.push({
                        ownerId: owner._id,
                        petId: pet._id,
                        petName: pet.petName || "-",
                        owner: owner.ownerName || "-",

                        reason: hasRealVisitData ? visit.primaryReason || "-" : "-",
                        doctor: hasRealVisitData ? visit.assignedDoctor || "-" : "-",
                        status: visit.status || "Pending",

                        age: pet.age || "-",
                        bill: "-",

                        date: hasRealVisitData
                            ? visit.appointmentDate || owner.createdAt
                            : owner.createdAt,

                        formattedDate: hasRealVisitData
                            ? new Date(
                                visit.appointmentDate || owner.createdAt
                            ).toLocaleDateString()
                            : new Date(owner.createdAt).toLocaleDateString(),

                        tokenNumber: visit.tokenNumber || "-",
                        visitId: visit._id,
                        appointmentTime: visit.appointmentTime || "-",
                        complaint: visit.complaint || "-",
                    });
                });
            });
        });

        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getExistingCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        const clinicId = req.user.clinicId;

        const owners = await PetRegistration.find({ clinicId });

        let result = [];

        [...owners].reverse().forEach((owner) => {
            [...owner.pets].reverse().forEach((pet) => {
                if (search) {
                    const value = search.toLowerCase();

                    if (
                        !owner.ownerName.toLowerCase().includes(value) &&
                        !pet.petName.toLowerCase().includes(value) &&
                        !(pet.uniquePetId || "").toLowerCase().includes(value)
                    ) {
                        return;
                    }
                }

                result.push({
                    owner,
                    pet,
                });
            });
        });

        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPetDetails = async (req, res) => {
    try {

        const { ownerId, petId } = req.params;

        const clinicId = req.user.clinicId;

        const owner = await PetRegistration.findOne({
            _id: ownerId,
            clinicId,
        });

        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner not found"
            });
        }

        const pet = owner.pets.id(petId);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                owner,
                pet
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deletePet = async (req, res) => {
    try {
        const { ownerId, petId } = req.params;
        const owner = await PetRegistration.findOne({ _id: ownerId, clinicId: req.user.clinicId });
        const pet = owner?.pets?.id(petId);

        if (!pet) {
            return res.status(404).json({ success: false, message: "Pet record not found" });
        }

        pet.deleteOne();
        await owner.save();
        return res.status(200).json({ success: true, message: "Pet record deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const verifyRegistrationOtp = async (req, res) => {
    const cleanMobile = String(req.body.mobileNumber || "").replace(/\D/g, "").slice(-10);
    const otp = String(req.body.otp || "").trim();
    const entry = registrationOtps.get(cleanMobile);

    if (!entry || entry.expiresAt < Date.now() || entry.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    registrationOtps.delete(cleanMobile);
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
};

const deletePetVisit = async (req, res) => {
    try {
        const { ownerId, petId, visitId } = req.params;
        const owner = await PetRegistration.findOne({ _id: ownerId, clinicId: req.user.clinicId });
        const pet = owner?.pets?.id(petId);
        const visit = pet?.visits?.id(visitId);

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit record not found" });
        }

        visit.deleteOne();
        await owner.save();
        return res.status(200).json({ success: true, message: "Visit record deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePetVisit = async (req, res) => {
    try {
        const { ownerId, petId, visitId } = req.params;
        const owner = await PetRegistration.findOne({ _id: ownerId, clinicId: req.user.clinicId });
        const pet = owner?.pets?.id(petId);
        const visit = pet?.visits?.id(visitId);

        if (!visit) {
            return res.status(404).json({ success: false, message: "Visit record not found" });
        }

        const updatedVisit = {
            primaryReason: req.body.primaryReason ?? visit.primaryReason,
            complaint: req.body.complaint ?? visit.complaint,
            appointmentDate: req.body.appointmentDate ?? visit.appointmentDate,
            appointmentTime: req.body.appointmentTime ?? visit.appointmentTime,
            assignedDoctor: req.body.assignedDoctor ?? visit.assignedDoctor,
        };
        const visitDetailsError = validateVisitDetails(updatedVisit);
        if (visitDetailsError) {
            return res.status(400).json({ success: false, message: visitDetailsError });
        }

        ["primaryReason", "complaint", "appointmentDate", "appointmentTime", "assignedDoctor", "tokenNumber", "status"].forEach((field) => {
            if (req.body[field] !== undefined) visit[field] = req.body[field];
        });

        await owner.save();
        return res.status(200).json({ success: true, message: "Visit updated successfully", data: visit });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const owners = await PetRegistration.find({
            clinicId,
        });

        let totalPets = 0;
        let activeVisits = 0;
        let pendingVisits = 0;

        owners.forEach(owner => {
            totalPets += owner.pets.length;

            owner.pets.forEach(pet => {
                const visits = pet.visits || [];

                visits.forEach(v => {
                    if (v.status === "In Progress") activeVisits++;
                    if (v.status === "Pending") pendingVisits++;
                });
            });
        });

        res.status(200).json({
            success: true,
            data: {
                totalPets,
                activeVisits,
                pendingVisits
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    sendRegistrationOtp,
    verifyRegistrationOtp,
    createRegistration,
    searchCustomer,
    getOwnerDetails,
    updateOwner,
    addPet,
    updatePet,
    addVisit,
    getPetHistory,
    getPetHistoryByID,
    getDashboardStats,
    getPetDetails,
    getExistingCustomers,
    deletePet,
    deletePetVisit,
    updatePetVisit
};
