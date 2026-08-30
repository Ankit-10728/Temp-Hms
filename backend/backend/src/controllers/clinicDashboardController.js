const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Staff = require("../models/Staff");
const PetRegistration = require("../models/PetRegistration");
const DoctorDetails = require("../models/DoctorDetails");

const ROLE_COLORS = {
  Doctor: "#6366F1",
  "Lab Technician": "#22C55E",
  Groomer: "#A855F7",
  "Kennel Staff": "#F97316",
  Receptionist: "#EC4899",
  default: "#64748B",
};

const APPOINTMENT_STATUS_LABELS = {
  WAITING: "Pending",
  IN_CONSULTATION: "In Progress",
  LAB_PENDING: "Lab Pending",
  LAB_COMPLETED: "Lab Completed",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
};

const APPOINTMENT_TYPE_LABELS = {
  PHYSICAL: "Physical Visit",
  ONLINE_VIDEO: "Online Video",
};

const getRange = (date, tzOffsetMinutes = 330) => {
  const localMs = date.getTime() + tzOffsetMinutes * 60 * 1000;
  const localNow = new Date(localMs);

  const y = localNow.getUTCFullYear();
  const m = localNow.getUTCMonth();
  const d = localNow.getUTCDate();

  const start = new Date(Date.UTC(y, m, d, 0, 0, 0, 0) - tzOffsetMinutes * 60 * 1000);
  const end   = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - tzOffsetMinutes * 60 * 1000);

  return { start, end };
};

const buildMonthKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const buildDayKey = (date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const formatTime = (dateValue) => {
  if (!dateValue) return "--";
  return new Date(dateValue).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "NA";

exports.getDashboard = async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic context is missing",
      });
    }

    const clinicObjectId = mongoose.Types.ObjectId.isValid(clinicId)
      ? new mongoose.Types.ObjectId(clinicId)
      : clinicId;

    const tzOffsetMinutes = req.user?.tzOffset ?? 330;

    const now = new Date();
    const todayRange     = getRange(now, tzOffsetMinutes);
    const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart          = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const nextAfterPreviousMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const trendStart = new Date(todayRange.start);
    trendStart.setDate(trendStart.getDate() - 6);
    trendStart.setHours(0, 0, 0, 0);
    const revenueStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalStaff,
      activeDoctors,
      staffThisMonth,
      doctorsThisMonth,
      pendingAppointments,
      todayAppointments,
      staffCollection,
      registrationsToday,
      revenueAggregation,
      previousMonthRevenueAggregation,
      appointmentTrendAggregation,
    ] = await Promise.all([

      Staff.countDocuments({ clinicId: clinicObjectId, isDeleted: false }),

      DoctorDetails.countDocuments({
        clinicId: clinicObjectId,
        status: "Active",
      }),

      Staff.countDocuments({
        clinicId: clinicObjectId,
        isDeleted: false,
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      }),

      DoctorDetails.countDocuments({
        clinicId: clinicObjectId,
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      }),

      Appointment.countDocuments({
        clinicId: clinicObjectId,
        status: "WAITING",
      }),

      Appointment.find({
        clinicId: clinicObjectId,
        appointmentDate: { $gte: todayRange.start, $lte: todayRange.end },
      })
        .sort({ appointmentDate: 1 })
        .populate("doctorId", "name consultationFee")
        .populate("petId",    "name species breed")
        .populate("ownerId",  "name")
        .select("appointmentDate status type doctorId petId ownerId"),

      Staff.find({ clinicId: clinicObjectId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "personalInfo.fullName personalInfo.profilePhoto employmentInfo.role employmentInfo.department accountInfo.accountActive createdAt"
        ),

      PetRegistration.countDocuments({
        clinicId: clinicObjectId,
        createdAt: { $gte: todayRange.start, $lte: todayRange.end },
      }),

      Appointment.aggregate([
        {
          $match: {
            clinicId: clinicObjectId,
            status: "COMPLETED",
            appointmentDate: { $gte: revenueStart },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            fee: { $ifNull: ["$doctorDetails.consultationFees", 0] },
          },
        },
        {
          $group: {
            _id: {
              year:  { $year: "$appointmentDate" },
              month: { $month: "$appointmentDate" },
            },
            revenue: { $sum: "$fee" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]),

      Appointment.aggregate([
        {
          $match: {
            clinicId: clinicObjectId,
            status: "COMPLETED",
            appointmentDate: {
              $gte: previousMonthStart,
              $lt: nextAfterPreviousMonthStart,
            },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            fee: { $ifNull: ["$doctorDetails.consultationFees", 0] },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$fee" },
          },
        },
      ]),

      Appointment.aggregate([
        {
          $match: {
            clinicId: clinicObjectId,
            appointmentDate: { $gte: trendStart, $lte: todayRange.end },
          },
        },
        {
          $group: {
            _id: {
              year:  { $year: "$appointmentDate" },
              month: { $month: "$appointmentDate" },
              day:   { $dayOfMonth: "$appointmentDate" },
            },
            appts: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]),
    ]);

    const revenueMap = new Map(
      revenueAggregation.map((item) => [
        `${item._id.year}-${item._id.month}`,
        Number(item.revenue || 0),
      ])
    );

    const previousMonthRevenue = Number(
      previousMonthRevenueAggregation[0]?.revenue || 0
    );
    const currentMonthRevenue = Number(
      revenueMap.get(buildMonthKey(monthStart)) || 0
    );

    const revenueData = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      revenueData.push({
        month:   monthDate.toLocaleString("en-US", { month: "short" }),
        revenue: Number(revenueMap.get(buildMonthKey(monthDate)) || 0),
      });
    }

    const trendMap = new Map(
      appointmentTrendAggregation.map((item) => [
        buildDayKey(new Date(item._id.year, item._id.month - 1, item._id.day)),
        Number(item.appts || 0),
      ])
    );

    const appointmentTrend = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const dayDate = new Date(todayRange.start);
      dayDate.setDate(dayDate.getDate() - offset);
      appointmentTrend.push({
        day:   dayDate.toLocaleDateString("en-US", { weekday: "short" }),
        appts: Number(trendMap.get(buildDayKey(dayDate)) || 0),
      });
    }

    const roleGroups = await Staff.aggregate([
      { $match: { clinicId: clinicObjectId, isDeleted: false } },
      { $group: { _id: "$employmentInfo.role", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
    ]);

    const roleDistribution = roleGroups.map((group) => ({
      role:  group._id || "Unassigned",
      count: Number(group.count || 0),
      total: totalStaff || 1,
      color: ROLE_COLORS[group._id] || ROLE_COLORS.default,
    }));

    const recentEnrollments = staffCollection.map((staff) => {
      const fullName   = staff.personalInfo?.fullName || "Unnamed Staff";
      const role       = staff.employmentInfo?.role || "Staff";
      const department = staff.employmentInfo?.department || role;
      return {
        id:        staff._id,
        initials:  getInitials(fullName),
        name:      fullName,
        role,
        dept:      department,
        status:    staff.accountInfo?.accountActive === false ? "Inactive" : "Active",
        color:     ROLE_COLORS[role] || ROLE_COLORS.default,
        createdAt: staff.createdAt,
      };
    });

    const formattedTodayAppointments = todayAppointments.map((appointment) => {
      const petName    = appointment.petId?.name    || "Unnamed Pet";
      const breed      = appointment.petId?.breed   || "";
      const ownerName  = appointment.ownerId?.name  || "Owner";
      const doctorName = appointment.doctorId?.name || "Assigned Doctor";

      return {
        id:     appointment._id,
        time:   formatTime(appointment.appointmentDate),
        pet:    breed ? `${petName} (${breed})` : petName,
        owner:  ownerName,
        doctor: doctorName,
        type:   APPOINTMENT_TYPE_LABELS[appointment.type] || appointment.type || "Physical Visit",
        status: APPOINTMENT_STATUS_LABELS[appointment.status] || appointment.status || "Pending",
      };
    });

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalStaff,
          activeDoctors,
          todayAppointments: formattedTodayAppointments.length,
          monthlyRevenue:    currentMonthRevenue,
          pendingAppointments,
          newRegistrationsToday: registrationsToday,
          staffThisMonth,
          doctorJoiningsThisMonth: doctorsThisMonth,
          previousMonthRevenue,
        },
        revenueData,
        appointmentTrend,
        recentEnrollments,
        roleDistribution,
        todayAppointments: formattedTodayAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
