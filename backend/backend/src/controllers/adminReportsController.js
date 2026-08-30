const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Patient = require("../models/Pet");

/**
 * Dashboard Summary
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const totalRevenueResult = await Appointment.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$consultationFee"
                    },
                    appointments: {
                        $sum: 1
                    }
                }
            }
        ]);

        const totalRevenue =
            totalRevenueResult[0]?.totalRevenue || 0;

        const appointments =
            totalRevenueResult[0]?.appointments || 0;

        const newPatients = await Patient.countDocuments();

        const staffAttendance = 94.2;

        res.status(200).json({
            totalRevenue,
            appointments,
            newPatients,
            attendance: staffAttendance,
            revenueGrowth: 22,
            appointmentGrowth: 15,
            patientGrowth: 8,
            attendanceGrowth: 1.2
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
/**
 * Revenue vs Target
 */
exports.getRevenueReport = async (req, res) => {
    try {

        const revenue = await Appointment.aggregate([
            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: "$appointmentDate"
                        }
                    },
                    revenue: {
                        $sum: "$consultationFee"
                    }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const data = revenue.map(item => ({
            month: months[item._id.month - 1],
            revenue: item.revenue,
            target: 100000
        }));

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Staff Role Report
 */
exports.getStaffRoleReport = async (req, res) => {
    try {

        const roles = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    value: {
                        $sum: 1
                    }
                }
            }
        ]);

        const formatted = roles.map(item => ({
            name: item._id,
            value: item.value
        }));

        res.status(200).json(formatted);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Weekly Appointment Trend
 */
exports.getAppointmentTrend = async (req, res) => {
    try {

        const trend = await Appointment.aggregate([
            {
                $group: {
                    _id: {
                        week: {
                            $week: "$appointmentDate"
                        }
                    },
                    appts: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id.week": 1
                }
            }
        ]);

        const data = trend.map((item, index) => ({
            week: `W${index + 1}`,
            appts: item.appts
        }));

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Top Doctors
 */
exports.getSuperAdminBasicReports = async (req, res) => {
    try {
        const totalClinics = await require("../models/Clinic").countDocuments();

        const paymentAgg = await Appointment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: null,
                    totalPaymentCollected: { $sum: "$consultationFee" }
                }
            }
        ]);

        const totalPaymentCollected = paymentAgg[0]?.totalPaymentCollected || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalClinics,
                totalPaymentCollected
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Top Doctors
 */
exports.getTopDoctors = async (req, res) => {
    try {

        const doctors = await Appointment.aggregate([

            {
                $match: {
                    status: "completed"
                }
            },
            {
                $group: {
                    _id: "$doctorId",
                    patients: {
                        $sum: 1
                    },
                    revenue: {
                        $sum: "$consultationFee"
                    }
                }
            },
            {
                $sort: {
                    revenue: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "doctor"
                }
            },
            {
                $unwind: "$doctor"
            }
        ]);

        const result = doctors.map(doc => ({
            name: doc.doctor.name,
            spec: doc.doctor.specialization,
            patients: doc.patients,
            revenue: doc.revenue,
            rating: doc.doctor.rating || 0
        }));

        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};