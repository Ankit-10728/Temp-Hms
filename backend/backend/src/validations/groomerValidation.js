const Joi = require("joi");

const createGroomerValidation = Joi.object({
    employeeId: Joi.string().required(),

    experience: Joi.number()
        .min(0)
        .required(),

    previousSalon: Joi.string()
        .allow("", null),

    licenseNumber: Joi.string()
        .allow("", null),

    dateOfJoining: Joi.date()
        .allow(null),

    certified: Joi.boolean(),

    certificates: Joi.array().items(
        Joi.object({
            type: Joi.string().required(),
            name: Joi.string().required(),
        })
    ),

    species: Joi.array()
        .items(Joi.string())
        .min(1)
        .required(),

    services: Joi.array()
        .items(Joi.string())
        .min(1)
        .required(),

    shift: Joi.string()
        .valid(
            "Full Day",
            "Half Day",
            "Weekends"
        )
        .required(),

    shiftStart: Joi.string()
        .allow("", null),

    shiftEnd: Joi.string()
        .allow("", null),

    weeklyDays: Joi.string()
        .allow("", null),

    onCall: Joi.string()
        .allow("", null),

    tools: Joi.string()
        .allow("", null),

    specialBreeds: Joi.string()
        .allow("", null),

    status: Joi.string()
        .valid(
            "Active",
            "Inactive",
            "On Leave",
            "Probation"
        ),

    department: Joi.string()
        .allow("", null),

    supervisor: Joi.string()
        .allow("", null),

    notes: Joi.string()
        .allow("", null),
});

module.exports = {
    createGroomerValidation,
};