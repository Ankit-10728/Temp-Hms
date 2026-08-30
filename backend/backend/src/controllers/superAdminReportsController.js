const PDFDocument = require("pdfkit");
const Clinic = require("../models/Clinic");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/DoctorDetails");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const sendEmail = require("../utils/emailService");

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const COLORS = {
  accentHex: "#0C3D2E",
  titleHex: "#0F172A",
  mutedHex: "#64748B",
  slateHex: "#334155",
  borderHex: "#E2E8F0",
  softHex: "#F8FAFC",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const monthLabel = (date) =>
  MONTH_NAMES[date.getMonth()] || date.toLocaleString("en-US", { month: "short" });

const getMonthDate = (baseDate, offset) =>
  new Date(baseDate.getFullYear(), baseDate.getMonth() - offset, 1);

const buildMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toCurrency = (value) => `INR ${formatINR(value)}`;

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const parseEmailList = (value) => {
  if (!value) return [];
  const rawValues = Array.isArray(value)
    ? value
    : String(value)
        .split(/[,;]+/)
        .map((item) => item.trim());
  return [...new Set(rawValues.filter((email) => EMAIL_REGEX.test(email)))];
};

const buildPdfBuffer = async (reportData) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    const renderHeader = () => {
      // Doubled top accent band height (from 14 to 28)
      doc.rect(0, 0, pageWidth, 28).fill(COLORS.accentHex);

      // Doubled spacing and larger font sizes to occupy double the vertical header height
      doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.accentHex);
      doc.text("PAHMS — Pet Animal Healthcare Management System", margin, 38, { align: "center", width: contentWidth });

      doc.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.titleHex);
      doc.text("Super Admin Basic Analytics Report", margin, 58, { align: "center", width: contentWidth });

      doc.font("Helvetica").fontSize(11).fillColor(COLORS.mutedHex);
      doc.text("Live database system overview and core performance metrics.", margin, 88, { align: "center", width: contentWidth });

      doc.font("Helvetica-Oblique").fontSize(9.5);
      doc.text(`Generated at ${new Date().toLocaleString("en-IN")}`, margin, 106, { align: "center", width: contentWidth });

      doc.strokeColor(COLORS.borderHex).lineWidth(1);
      doc.moveTo(margin, 122).lineTo(pageWidth - margin, 122).stroke();
    };

    renderHeader();

    // Adjusted cursor to sit properly below the doubled-height header block
    let cursorY = 138;

    doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.titleHex);
    doc.text("Summary Overview", margin, cursorY);
    cursorY += 16;

    const summaryItems = [
      { label: "Total Clinics", value: reportData.totalClinics },
      { label: "Active Clinics", value: reportData.activeClinics },
      { label: "Suspended / Expired Clinics", value: reportData.suspendedClinics },
      { label: "Total Payment Collected", value: toCurrency(reportData.totalPaymentCollected) },
    ];

    summaryItems.forEach((item) => {
      if (cursorY > pageHeight - 50) {
        doc.addPage();
        renderHeader();
        cursorY = 138;
      }

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(COLORS.titleHex);
      doc.text(`${item.label}:`, margin, cursorY, { width: 170 });

      doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.slateHex);
      doc.text(String(item.value), margin + 180, cursorY, { width: contentWidth - 180 });

      cursorY += 16;
    });

    cursorY += 8;

    const drawTable = (title, columns, rows) => {
      if (cursorY > pageHeight - 100) {
        doc.addPage();
        renderHeader();
        cursorY = 138;
      }

      doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.titleHex);
      doc.text(title, margin, cursorY);
      cursorY += 16;

      const colWidths = columns.map((col) => col.width || contentWidth / columns.length);
      const rowHeight = 20;

      if (cursorY + rowHeight > pageHeight - 50) {
        doc.addPage();
        renderHeader();
        cursorY = 138;
      }

      let xPos = margin;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFFFFF");
      columns.forEach((col, idx) => {
        doc.rect(xPos, cursorY, colWidths[idx], rowHeight).fill(COLORS.accentHex);
        doc.text(col.header, xPos + 6, cursorY + 5, { width: colWidths[idx] - 12 });
        xPos += colWidths[idx];
      });
      cursorY += rowHeight;

      rows.forEach((row, rowIndex) => {
        if (cursorY + rowHeight > pageHeight - 50) {
          doc.addPage();
          renderHeader();
          cursorY = 138;

          let redrawX = margin;
          doc.font("Helvetica-Bold").fontSize(9).fillColor("#FFFFFF");
          columns.forEach((col, idx) => {
            doc.rect(redrawX, cursorY, colWidths[idx], rowHeight).fill(COLORS.accentHex);
            doc.text(col.header, redrawX + 6, cursorY + 5, { width: colWidths[idx] - 12 });
            redrawX += colWidths[idx];
          });
          cursorY += rowHeight;
        }

        let rowXPos = margin;
        const bg = rowIndex % 2 === 0 ? 255 : 249;
        
        columns.forEach((col, idx) => {
          doc.fillColor(bg === 255 ? [255, 255, 255] : [249, 250, 251])
             .rect(rowXPos, cursorY, colWidths[idx], rowHeight)
             .fillAndStroke(bg === 255 ? [255, 255, 255] : [249, 250, 251], COLORS.borderHex);

          doc.font("Helvetica").fontSize(9).fillColor(COLORS.slateHex);
          doc.text(String(col.value(row)), rowXPos + 6, cursorY + 5, { width: colWidths[idx] - 12 });
          rowXPos += colWidths[idx];
        });
        cursorY += rowHeight;
      });

      cursorY += 16;
    };

    if (reportData.revenueTrend?.length) {
      drawTable(
        "Revenue Trend",
        [
          { header: "Month", width: 180, value: (r) => r.month },
          { header: "Revenue Collected", width: 345, value: (r) => toCurrency(r.revenue) },
        ],
        reportData.revenueTrend
      );
    }

    if (reportData.clinicTrend?.length) {
      drawTable(
        "Clinic Onboarding Trend",
        [
          { header: "Month", width: 180, value: (r) => r.month },
          { header: "New Clinics Registered", width: 345, value: (r) => r.clinics },
        ],
        reportData.clinicTrend
      );
    }

    if (reportData.clinicDistribution?.length) {
      drawTable(
        "Subscription Distribution",
        [
          { header: "Status State", width: 180, value: (r) => r.name },
          { header: "Count", width: 345, value: (r) => r.value },
        ],
        reportData.clinicDistribution
      );
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.font("Helvetica-Oblique").fontSize(8).fillColor(COLORS.mutedHex);
      doc.text("PAHMS Super-Admin System Report — Automated Snapshot Export.", margin, pageHeight - 25, {
        align: "left",
        width: contentWidth,
      });
    }

    doc.end();
  });

const buildCsv = (reportData) => {
  const lines = [];

  lines.push("Section,Metric,Value");
  lines.push([csvCell("Summary"), csvCell("Total Clinics"), csvCell(reportData.totalClinics)].join(","));
  lines.push([csvCell("Summary"), csvCell("Active Clinics"), csvCell(reportData.activeClinics)].join(","));
  lines.push([csvCell("Summary"), csvCell("Suspended Clinics"), csvCell(reportData.suspendedClinics)].join(","));
  lines.push([csvCell("Summary"), csvCell("Total Payment Collected"), csvCell(reportData.totalPaymentCollected)].join(","));

  lines.push("");
  lines.push("Revenue Trend");
  lines.push("Month,Revenue");
  reportData.revenueTrend.forEach((item) => {
    lines.push([csvCell(item.month), csvCell(item.revenue)].join(","));
  });

  lines.push("");
  lines.push("Clinic Onboarding");
  lines.push("Month,Clinics");
  reportData.clinicTrend.forEach((item) => {
    lines.push([csvCell(item.month), csvCell(item.clinics)].join(","));
  });

  lines.push("");
  lines.push("Subscription Distribution");
  lines.push("Status,Count");
  reportData.clinicDistribution.forEach((item) => {
    lines.push([csvCell(item.name), csvCell(item.value)].join(","));
  });

  return lines.join("\n");
};

const buildXlsHtml = (reportData) => {
  const summaryRows = [
    ["Total Clinics", reportData.totalClinics],
    ["Active Clinics", reportData.activeClinics],
    ["Suspended Clinics", reportData.suspendedClinics],
    ["Total Payment Collected", toCurrency(reportData.totalPaymentCollected)],
  ]
    .map(([label, value]) => `<tr><td><b>${label}</b></td><td>${value}</td></tr>`)
    .join("");

  const revenueRows = reportData.revenueTrend
    .map((item) => `<tr><td>${item.month}</td><td>${toCurrency(item.revenue)}</td></tr>`)
    .join("");

  const clinicRows = reportData.clinicTrend
    .map((item) => `<tr><td>${item.month}</td><td>${item.clinics}</td></tr>`)
    .join("");

  const distributionRows = reportData.clinicDistribution
    .map((item) => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`)
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #111827; }
    h1 { color: #0C3D2E; font-size: 20px; margin-bottom: 4px; }
    h2 { color: #0F172A; font-size: 14px; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #0C3D2E; padding-bottom: 4px; }
    p { color: #64748B; font-size: 12px; margin-top: 0; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; margin-bottom: 16px; }
    th, td { border: 1px solid #E2E8F0; padding: 8px 12px; text-align: left; font-size: 11px; }
    th { background: #0C3D2E; color: #FFFFFF; }
    tr:nth-child(even) { background-color: #F8FAFC; }
  </style>
</head>
<body>
  <h1>PAHMS — Super Admin Basic Report</h1>
  <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
  
  <h2>Summary Overview</h2>
  <table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${summaryRows}</tbody></table>
  
  <h2>Revenue Trend</h2>
  <table><thead><tr><th>Month</th><th>Revenue</th></tr></thead><tbody>${revenueRows}</tbody></table>
  
  <h2>Clinic Onboarding Trend</h2>
  <table><thead><tr><th>Month</th><th>New Clinics</th></tr></thead><tbody>${clinicRows}</tbody></table>
  
  <h2>Subscription Distribution</h2>
  <table><thead><tr><th>Status State</th><th>Count</th></tr></thead><tbody>${distributionRows}</tbody></table>
</body>
</html>`;
};

const buildReportData = async () => {
  const totalClinics = await Clinic.countDocuments();
  // Matches the Super Admin Dashboard's own definition of "active" - a
  // clinic that hasn't been manually deactivated AND has actually been
  // approved in verification. A still-pending SUBMITTED clinic isn't
  // active yet, so "not rejected" alone isn't strict enough.
  const activeClinics = await Clinic.countDocuments({
    isActive: true,
    verificationStatus: "APPROVED",
  });
  const suspendedClinics = await Clinic.countDocuments({
    $or: [
      { subscriptionStatus: { $in: ["SUSPENDED", "EXPIRED"] } },
      { isActive: false },
      { verificationStatus: { $ne: "APPROVED" } },
    ],
  });

  const revenueAggregation = await Appointment.aggregate([
    {
      $match: {
        status: "COMPLETED",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$doctor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fee: { $ifNull: ["$doctor.consultationFee", 0] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
        },
        revenue: { $sum: "$fee" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const clinicTrendAggregation = await Clinic.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        clinics: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const subscriptionAggregation = await Clinic.aggregate([
    {
      $group: {
        _id: "$subscriptionStatus",
        value: { $sum: 1 },
      },
    },
  ]);

  const revenueByMonth = new Map(
    revenueAggregation.map((item) => [
      buildMonthKey(new Date(item._id.year, item._id.month - 1, 1)),
      Number(item.revenue || 0),
    ])
  );

  const clinicByMonth = new Map(
    clinicTrendAggregation.map((item) => [
      buildMonthKey(new Date(item._id.year, item._id.month - 1, 1)),
      Number(item.clinics || 0),
    ])
  );

  const now = new Date();
  const revenueTrend = [];
  const clinicTrend = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = getMonthDate(now, offset);
    const monthKey = buildMonthKey(monthDate);

    revenueTrend.push({
      month: monthLabel(monthDate),
      revenue: Number(revenueByMonth.get(monthKey) || 0),
    });

    clinicTrend.push({
      month: monthLabel(monthDate),
      clinics: Number(clinicByMonth.get(monthKey) || 0),
    });
  }

  const clinicDistribution = [
    {
      name: "Active",
      value: activeClinics,
      color: "#22C55E",
    },
    {
      name: "Suspended",
      value: suspendedClinics,
      color: "#F59E0B",
    },
    {
      name: "Expired",
      value: Number(
        subscriptionAggregation.find((item) => item._id === "EXPIRED")?.value || 0
      ),
      color: "#EF4444",
    },
  ];

  const totalPaymentCollected = revenueAggregation.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  );

  return {
    totalClinics,
    activeClinics,
    suspendedClinics,
    totalPaymentCollected,
    revenueTrend,
    clinicTrend,
    clinicDistribution,
    generatedAt: new Date().toISOString(),
  };
};

const buildClinicPerformanceData = async (clinics) => {
  const clinicIds = clinics.map((clinic) => clinic._id);

  const [doctorCounts, appointmentCounts, doctorUsers] = await Promise.all([
    Doctor.aggregate([
      {
        $match: {
          clinicId: { $in: clinicIds },
        },
      },
      {
        $group: {
          _id: "$clinicId",
          doctorCount: { $sum: 1 },
        },
      },
    ]),
    Appointment.aggregate([
      {
        $match: {
          clinicId: { $in: clinicIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          fee: { $ifNull: ["$doctor.consultationFee", 0] },
        },
      },
      {
        $group: {
          _id: "$clinicId",
          appointmentCount: { $sum: 1 },
          completedAppointments: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
            },
          },
          paidAppointments: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, "$fee", 0],
            },
          },
          lastAppointmentAt: { $max: "$appointmentDate" },
        },
      },
    ]),
    User.find({ role: "DOCTOR" })
      .select("_id name clinicId specialization practiceType consultationFee isActive createdAt")
      .populate("clinicId", "name")
      .lean(),
  ]);

  const doctorCountByClinic = new Map(
    doctorCounts.map((item) => [String(item._id), Number(item.doctorCount || 0)])
  );

  const appointmentStatsByClinic = new Map(
    appointmentCounts.map((item) => [
      String(item._id),
      {
        appointmentCount: Number(item.appointmentCount || 0),
        completedAppointments: Number(item.completedAppointments || 0),
        paidAppointments: Number(item.paidAppointments || 0),
        revenue: Number(item.revenue || 0),
        lastAppointmentAt: item.lastAppointmentAt || null,
      },
    ])
  );

  return clinics.map((clinic) => {
    const stats = appointmentStatsByClinic.get(String(clinic._id)) || {};
    const doctorCount = doctorCountByClinic.get(String(clinic._id)) || 0;
    const matchingDoctors = doctorUsers.filter((doctor) => String(doctor.clinicId?._id || doctor.clinicId) === String(clinic._id));

    return {
      _id: clinic._id,
      name: clinic.name,
      contactEmail: clinic.contactEmail,
      subscriptionType: clinic.subscriptionType,
      subscriptionStatus: clinic.subscriptionStatus,
      verificationStatus: clinic.verificationStatus,
      expiryDate: clinic.expiryDate,
      createdAt: clinic.createdAt,
      address: clinic.address,
      addressDetails: clinic.addressDetails,
      servicesOffered: clinic.servicesOffered || [],
      doctorCount,
      doctorUserCount: matchingDoctors.length,
      ...stats,
    };
  });
};

const buildDoctorReportData = async (clinics) => {
  const clinicNameMap = new Map(
    clinics.map((clinic) => [String(clinic._id), clinic.name])
  );

  const [doctorRegistryRaw, doctorAppointments] = await Promise.all([
    Doctor.find()
      .populate("clinicId", "name")
      .select(
        "doctorId name clinicId staffCode experience registrationNumber stateVetCouncil consultationFees avgConsultationDuration emergencyAvailability status certificateValidityDate renewalReminderDays specializations createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$doctorId",
          doctorName: { $first: "$doctor.name" },
          clinicId: { $first: "$clinicId" },
          appointments: { $sum: 1 },
          completedAppointments: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
            },
          },
          paidAppointments: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                { $ifNull: ["$doctor.consultationFee", 0] },
                0,
              ],
            },
          },
    lastAppointmentAt: { $max: "$appointmentDate" },
        },
      },
      {
        $sort: {
          revenue: -1,
          appointments: -1,
        },
      },
    ]),
  ]);

  const doctorRegistry = doctorRegistryRaw.map((doctor) => ({
    ...doctor,
    clinicName: doctor.clinicId?.name || clinicNameMap.get(String(doctor.clinicId?._id || doctor.clinicId)) || "",
  }));

  // Doctor Activity/Consultation previously listed doctors from the legacy
  // User/role=DOCTOR collection instead of the real doctors clinics
  // actually manage via DoctorDetails - that's why a doctor's Active/
  // Inactive status here never matched what Doctor Registration correctly
  // showed (it already used DoctorDetails). Source both reports from
  // doctorRegistry instead; appointment activity is only ever recorded
  // against legacy User accounts today, so it's joined in as a best-effort
  // name match, defaulting to zero when there's no match rather than
  // showing a doctor that isn't actually managed by any clinic.
  const doctorAppointmentsByName = new Map(
    doctorAppointments
      .filter((item) => item.doctorName)
      .map((item) => [
        String(item.doctorName).trim().toLowerCase(),
        {
          appointments: Number(item.appointments || 0),
          completedAppointments: Number(item.completedAppointments || 0),
          paidAppointments: Number(item.paidAppointments || 0),
          revenue: Number(item.revenue || 0),
          lastAppointmentAt: item.lastAppointmentAt || null,
        },
      ])
  );

  const buildDoctorRow = (doctor) => {
    const stats = doctorAppointmentsByName.get(String(doctor.name || "").trim().toLowerCase()) || {};
    return {
      doctorId: String(doctor._id),
      doctorName: doctor.name,
      clinicId: doctor.clinicId?._id ? String(doctor.clinicId._id) : String(doctor.clinicId || ""),
      clinicName: doctor.clinicName,
      specialization: (doctor.specializations || []).join(", "),
      consultationFees: Number(doctor.consultationFees || 0),
      appointments: Number(stats.appointments || 0),
      completedAppointments: Number(stats.completedAppointments || 0),
      paidAppointments: Number(stats.paidAppointments || 0),
      revenue: Number(stats.revenue || 0),
      lastAppointmentAt: stats.lastAppointmentAt || null,
      status: doctor.status || "Active",
    };
  };

  const sortByAppointmentsThenName = (left, right) =>
    Number(right.appointments || 0) - Number(left.appointments || 0) ||
    Number(right.revenue || 0) - Number(left.revenue || 0) ||
    String(left.doctorName || "").localeCompare(String(right.doctorName || ""));

  return {
    registry: doctorRegistry,
    activity: doctorRegistry.map(buildDoctorRow).sort(sortByAppointmentsThenName),
    consultation: doctorRegistry.map(buildDoctorRow).sort(sortByAppointmentsThenName),
  };
};

const buildSubscriptionReportData = async () => {
  const plans = await SubscriptionPlan.find()
    .select(
      "planCode subscriptionPlan billingCycle price status planStartDate planEndRenewalDate trialPeriodDays discountPromoCode featureLimits modules subscriptionInvoice createdAt updatedAt"
    )
    .sort({ createdAt: -1 })
    .lean();

  const activePlans = plans.filter((plan) => plan.status === "Active");
  const expiredPlans = plans.filter((plan) => plan.status !== "Active");

  return {
    plans: plans.map((plan) => ({
      ...plan,
      activeModuleCount: Object.values(plan.modules || {}).filter(Boolean).length,
    })),
    summary: {
      totalPlans: plans.length,
      activePlans: activePlans.length,
      expiredPlans: expiredPlans.length,
      billingCycleBreakdown: plans.reduce((accumulator, plan) => {
        const key = plan.billingCycle || "Unknown";
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    },
  };
};

const buildRevenuePeriodData = async () => {
  const revenueByQuarter = await Appointment.aggregate([
    {
      $match: {
        status: "COMPLETED",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$doctor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fee: { $ifNull: ["$doctor.consultationFee", 0] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
          quarter: { $ceil: { $divide: [{ $month: "$appointmentDate" }, 3] } },
        },
        revenue: { $sum: "$fee" },
        appointments: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.quarter": 1,
      },
    },
  ]);

  const revenueByYear = await Appointment.aggregate([
    {
      $match: {
        status: "COMPLETED",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$doctor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        fee: { $ifNull: ["$doctor.consultationFee", 0] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
        },
        revenue: { $sum: "$fee" },
        appointments: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
      },
    },
  ]);

  return {
    quarterlyRevenue: revenueByQuarter.map((item) => ({
      period: `Q${item._id.quarter} ${item._id.year}`,
      revenue: Number(item.revenue || 0),
      appointments: Number(item.appointments || 0),
    })),
    yearlyRevenue: revenueByYear.map((item) => ({
      period: String(item._id.year),
      revenue: Number(item.revenue || 0),
      appointments: Number(item.appointments || 0),
    })),
  };
};

exports.getSuperAdminReportCatalog = async (req, res) => {
  try {
    const [basicReport, clinics, subscriptionReportData] = await Promise.all([
      buildReportData(),
      Clinic.find()
        .select(
          "name contactEmail subscriptionType subscriptionStatus isActive verificationStatus expiryDate createdAt address addressDetails servicesOffered"
        )
        .sort({ createdAt: -1 })
        .lean(),
      buildSubscriptionReportData(),
    ]);

    const clinicPerformance = await buildClinicPerformanceData(clinics);
    const doctorReport = await buildDoctorReportData(clinics);
    const revenuePeriods = await buildRevenuePeriodData();

    const verificationSummary = clinics.reduce(
      (accumulator, clinic) => {
        const status = clinic.verificationStatus || "UNKNOWN";
        accumulator[status] = (accumulator[status] || 0) + 1;
        return accumulator;
      },
      {
        SUBMITTED: 0,
        UNDER_REVIEW: 0,
        DOCS_VERIFIED: 0,
        APPROVED: 0,
        REJECTED: 0,
      }
    );

    const summary = {
      ...basicReport,
      totalDoctors: doctorReport.registry.length,
      activeDoctors: doctorReport.registry.filter((doctor) => doctor.status === "Active").length,
      inactiveDoctors: doctorReport.registry.filter((doctor) => doctor.status !== "Active").length,
      totalPlans: subscriptionReportData.summary.totalPlans,
      activePlans: subscriptionReportData.summary.activePlans,
      expiredPlans: subscriptionReportData.summary.expiredPlans,
      verificationSummary,
    };

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: basicReport.generatedAt,
        summary,
        clinics,
        clinicPerformance,
        doctorRegistry: doctorReport.registry,
        doctorActivity: doctorReport.activity,
        doctorConsultation: doctorReport.consultation,
        plans: subscriptionReportData.plans,
        subscriptionSummary: subscriptionReportData.summary,
        revenueTrend: basicReport.revenueTrend,
        clinicTrend: basicReport.clinicTrend,
        clinicDistribution: basicReport.clinicDistribution,
        quarterlyRevenue: revenuePeriods.quarterlyRevenue,
        yearlyRevenue: revenuePeriods.yearlyRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSuperAdminBasicReports = async (req, res) => {
  try {
    const reportData = await buildReportData();

    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadSuperAdminBasicReport = async (req, res) => {
  try {
    const reportData = await buildReportData();
    const format = String(req.query.format || "pdf").toLowerCase();
    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const fileName = `superadmin-basic-report-${stamp}.csv`;
      const csv = buildCsv(reportData);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.status(200).send(csv);
    }

    if (format === "xls" || format === "xlsx" || format === "excel") {
      const fileName = `superadmin-basic-report-${stamp}.xls`;
      const html = buildXlsHtml(reportData);
      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.status(200).send(html);
    }

    const pdfBuffer = await buildPdfBuffer(reportData);
    const fileName = `superadmin-basic-report-${stamp}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.shareSuperAdminBasicReport = async (req, res) => {
  try {
    const recipients = parseEmailList(req.body?.recipientEmail || req.body?.email || req.body?.recipients);
    const subject = String(req.body?.subject || "Super Admin Report").trim();
    const message = String(
      req.body?.message || "Please find the attached super admin report."
    ).trim();
    const format = String(req.body?.format || "pdf").toLowerCase();

    if (!recipients.length) {
      return res.status(400).json({
        success: false,
        message: "A valid recipient email is required",
      });
    }

    const reportData = await buildReportData();
    let attachment;

    if (format === "csv") {
      attachment = {
        filename: "superadmin-basic-report.csv",
        content: Buffer.from(buildCsv(reportData), "utf8"),
        contentType: "text/csv",
      };
    } else if (format === "xls" || format === "xlsx" || format === "excel") {
      attachment = {
        filename: "superadmin-basic-report.xls",
        content: Buffer.from(buildXlsHtml(reportData), "utf8"),
        contentType: "application/vnd.ms-excel",
      };
    } else {
      attachment = {
        filename: "superadmin-basic-report.pdf",
        content: await buildPdfBuffer(reportData),
        contentType: "application/pdf",
      };
    }

    await Promise.all(
      recipients.map((recipientEmail) =>
        sendEmail({
          email: recipientEmail,
          subject,
          message,
          attachments: [attachment],
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: `Report shared with ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};