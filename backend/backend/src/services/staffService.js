const Staff = require("../models/Staff.js");

export const createStaffService = async (
    data
) => {
    return await Staff.create(data);
};

export const getAllStaffService =
    async () => {
        return await Staff.find();
    };

export const getStaffService =
    async (id) => {
        return await Staff.findById(id);
    };

export const deleteStaffService =
    async (id) => {
        return await Staff.findByIdAndDelete(id);
    };