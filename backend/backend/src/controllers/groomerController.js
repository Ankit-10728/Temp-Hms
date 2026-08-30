const Groomer = require("../models/GroomerModel");

const safeParse = (data) => {
    try {
        if (!data) return [];
        return typeof data === "string" ? JSON.parse(data) : data;
    } catch (err) {
        return [];
    }
};

exports.createGroomer = async (req, res) => {
    try {
        console.log("reached");

        console.log("from create groomer ->>>", req.body);
        console.log("from create groomer ->>>", req.files);

        const clinicId = req.user.clinicId;

        const {
            experience,
            previousSalon,
            licenseNumber,
            dateOfJoining,
            certified,
            shift,
            shiftStart,
            shiftEnd,
            weeklyDays,
            onCall,
            tools,
            specialBreeds,
            status,
            department,
            supervisor,
            notes,
        } = req.body;
        const lastGroomer = await Groomer.findOne({
            clinicId,
        }).sort({
            createdAt: -1,
        });

        let employeeId = "GRM-001";

        if (lastGroomer?.employeeId) {
            const lastNumber = Number(
                lastGroomer.employeeId.split("-")[1]
            );

            if (!isNaN(lastNumber)) {
                employeeId = `GRM-${String(
                    lastNumber + 1
                ).padStart(3, "0")}`;
            }
        }



        const certificateDocument =
            req.files?.certificateDocument?.[0]?.path || "";

        const groomer = await Groomer.create({
            clinicId,
            employeeId,
            experience,
            previousSalon,
            licenseNumber,
            dateOfJoining,
            certified,
            shift,
            shiftStart,
            shiftEnd,
            weeklyDays,
            onCall,
            tools,
            specialBreeds,
            status,
            department,
            supervisor,
            notes,


            certificateDocument,

            certificates: safeParse(req.body.certificates),
            species: safeParse(req.body.species),
            services: safeParse(req.body.services),
        });

        return res.status(201).json({
            success: true,
            message: "Groomer created successfully",
            data: groomer,
        });

    } catch (error) {
        console.error("🔥 ERROR IN CREATE GROOMER:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};

/**
 * Get All Groomers
 */
exports.getAllGroomers = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const groomers = await Groomer.find({
            clinicId,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: groomers.length,
            data: groomers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get Groomer By Id
 */
exports.deleteGroomer = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;

        const groomer = await Groomer.findOne({
            _id: req.params.id,
            clinicId,
        });
        if (!groomer) {
            return res.status(404).json({
                success: false,
                message: "Groomer not found",
            });
        }

        await Groomer.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Groomer deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getGroomerById = async (req, res) => {
    try {
        const clinicId = req.user.clinicId;

        const groomer = await Groomer.findOne({
            _id: req.params.id,
            clinicId,
        });

        if (!groomer) {
            return res.status(404).json({
                success: false,
                message: "Groomer not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: groomer,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateGroomer = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;

        const groomer = await Groomer.findOne({
            _id: req.params.id,
            clinicId,
        });

        if (!groomer) {
            return res.status(404).json({
                success: false,
                message: "Groomer not found",
            });
        }

        const updateData = {
            ...req.body,
        };

        if (req.files?.profilePhoto?.[0]) {
            updateData.profilePhoto =
                req.files.profilePhoto[0].path;
        }

        if (req.files?.certificateDocument?.[0]) {
            updateData.certificateDocument =
                req.files.certificateDocument[0].path;
        }

        if (req.body.certificates) {
            updateData.certificates =
                JSON.parse(req.body.certificates);
        }

        if (req.body.species) {
            updateData.species =
                JSON.parse(req.body.species);
        }

        if (req.body.services) {
            updateData.services =
                JSON.parse(req.body.services);
        }

        const updatedGroomer =
            await Groomer.findOneAndUpdate(
                {
                    _id: req.params.id,
                    clinicId,
                },
                updateData,
                {
                    new: true,
                    runValidators: true,
                }
            );

        return res.status(200).json({
            success: true,
            message: "Groomer updated successfully",
            data: updatedGroomer,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteGroomer = async (req, res) => {
    try {

        const clinicId = req.user.clinicId;

        const groomer = await Groomer.findOne({
            _id: req.params.id,
            clinicId,
        });

        if (!groomer) {
            return res.status(404).json({
                success: false,
                message: "Groomer not found",
            });
        }

        await Groomer.findOneAndDelete({
            _id: req.params.id,
            clinicId,
        });

        return res.status(200).json({
            success: true,
            message: "Groomer deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
