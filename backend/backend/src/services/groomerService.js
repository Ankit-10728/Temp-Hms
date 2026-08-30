const Groomer = require("../models/GroomerModel");

/**
 * Create Groomer
 */
const createGroomerService = async (data) => {
    return await Groomer.create(data);
};

/**
 * Get All Groomers
 */
const getAllGroomersService = async () => {
    return await Groomer.find()
        .populate("supervisor")
        .sort({ createdAt: -1 });
};

/**
 * Get Groomer By Id
 */
const getGroomerByIdService = async (id) => {
    return await Groomer.findById(id)
        .populate("supervisor");
};

/**
 * Get Groomer By Employee Id
 */
const getGroomerByEmployeeIdService = async (employeeId) => {
    return await Groomer.findOne({
        employeeId,
    });
};

/**
 * Update Groomer
 */
const updateGroomerService = async (
    id,
    updateData
) => {
    return await Groomer.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

/**
 * Delete Groomer
 */
const deleteGroomerService = async (id) => {
    return await Groomer.findByIdAndDelete(id);
};

module.exports = {
    createGroomerService,
    getAllGroomersService,
    getGroomerByIdService,
    getGroomerByEmployeeIdService,
    updateGroomerService,
    deleteGroomerService,
};