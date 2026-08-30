const LabRecord = require("../models/LabRecord");

/* ==========================================================
   Dashboard Statistics
   GET /api/v1/lab/dashboard
========================================================== */

exports.getDashboardStats = async (req, res) => {
    try {

        const totalReports = await LabRecord.countDocuments();

        const pendingUploads = await LabRecord.countDocuments({
            status: "Pending",
        });

        const criticalCases = await LabRecord.countDocuments({
            criticalValuesFlag: true,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayReports = await LabRecord.countDocuments({
            createdAt: {
                $gte: today,
            },
        });

        res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully",
            data: {
                totalReports,
                pendingUploads,
                criticalCases,
                todayReports,
            },
        });

    } catch (error) {

        console.error("Dashboard Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


/* ==========================================================
   Recent Activities
   GET /api/v1/lab/recent
========================================================== */

exports.getRecentActivities = async (req, res) => {

    try {

        const activities = await LabRecord.find()
            .select(
                "labOrderId petName reportType status createdAt"
            )
            .sort({
                createdAt: -1,
            })
            .limit(5);

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities,
        });

    } catch (error) {

        console.error("Recent Activity Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


/* ==========================================================
   Pending Reports Summary
   GET /api/v1/lab/pending-summary
========================================================== */

exports.getPendingSummary = async (req, res) => {
    try {

        const summary = await LabRecord.aggregate([
            {
                $match: {
                    status: "Pending",
                },
            },
            {
                $group: {
                    _id: "$reportType",
                    total: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    reportType: "$_id",
                    total: 1,
                },
            },
            {
                $sort: {
                    total: -1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            count: summary.length,
            data: summary,
        });

    } catch (error) {

        console.error("Pending Summary Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


/* ==========================================================
   Search Report
   Search By:
   - Lab Order ID
   - Owner Phone
   - Pet Name

   GET /api/v1/lab/report/search?keyword=
========================================================== */

exports.searchReport = async (req, res) => {

    try {

        const { keyword } = req.query;

        if (!keyword) {

            return res.status(400).json({
                success: false,
                message: "Search keyword is required",
            });

        }

        const reports = await LabRecord.find({

            $or: [

                {
                    labOrderId: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    ownerPhone: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

                {
                    petName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },

            ],

        })
            .sort({
                createdAt: -1,
            });

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });

    } catch (error) {

        console.error("Search Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

/* ==========================================================
   Create Lab Report
   POST /api/v1/lab/report
========================================================== */

exports.createReport = async (req, res) => {
    try {

        const {
            labOrderId,
            petName,
            ownerName,
            ownerPhone,
            reportType,
            testsRequired,
            remarks,
        } = req.body;

        // Validation
        if (
            !labOrderId ||
            !petName ||
            !ownerName ||
            !ownerPhone ||
            !reportType
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        // Duplicate Check
        const alreadyExists = await LabRecord.findOne({
            labOrderId,
        });

        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: "Lab Order ID already exists.",
            });
        }

        const report = await LabRecord.create({
            labOrderId,
            petName,
            ownerName,
            ownerPhone,
            reportType,
            testsRequired,
            remarks,
            status: "Pending",
        });

        res.status(201).json({
            success: true,
            message: "Lab Report Created Successfully",
            data: report,
        });

    } catch (error) {

        console.error("Create Report Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};



/* ==========================================================
   Get All Reports
   GET /api/v1/lab/report
========================================================== */

exports.getAllReports = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const totalReports = await LabRecord.countDocuments();

        const reports = await LabRecord.find()
            .sort({
                createdAt: -1,
            })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalReports / limit),
            totalReports,
            count: reports.length,
            data: reports,
        });

    } catch (error) {

        console.error("Get Reports Error :", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
exports.getSingleReport = async (req, res) => {
    try {

        const report = await LabRecord.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            data: report,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


exports.uploadReport = async (req, res) => {

    try {

        const report = await LabRecord.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

   if (req.body.testsCompleted) {
    try {
        report.testsCompleted = JSON.parse(req.body.testsCompleted);
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Invalid testsCompleted format",
        });
    }
}

        if (req.file) {
    report.reportFiles = [req.file.path];
}
        report.sampleCollectedAt =
            req.body.sampleCollectedAt || report.sampleCollectedAt;

        report.reportDate =
            req.body.reportDate || new Date();

        report.externalLabName =
            req.body.externalLabName || report.externalLabName;

        if (req.body.criticalValuesFlag !== undefined) {
    report.criticalValuesFlag =
        req.body.criticalValuesFlag === "true";
}

        report.criticalNotes =
            req.body.criticalNotes || report.criticalNotes;

        report.remarks =
            req.body.remarks || report.remarks;

        report.status = "Completed";

        await report.save();

        res.status(200).json({
            success: true,
            message: "Report Uploaded Successfully",
            data: report,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};