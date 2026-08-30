const mongoose = require("mongoose");

const clinicSubscriptionSchema = new mongoose.Schema(
    {
        clinicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Clinic",
            required: true,
            unique: true,
        },

        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubscriptionPlan",
            required: true,
        },

        // Subscription Lifecycle
        status: {
            type: String,
            enum: [
                "TRIAL",
                "PAYMENT_REQUIRED",
                "ACTIVE",
                "EXPIRED",
                "SUSPENDED",
                "CANCELLED",
            ],
            default: "TRIAL",
        },

        // Trial Details
        trialStartDate: {
            type: Date,
            default: null,
        },

        trialEndDate: {
            type: Date,
            default: null,
        },

        // Paid Subscription
        paymentDate: {
            type: Date,
            default: null,
        },

        planStartDate: {
            type: Date,
            default: null,
        },

        planEndRenewalDate: {
            type: Date,
            default: null,
        },

        // Payment Details
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
            default: "PENDING",
        },

        amountPaid: {
            type: Number,
            default: 0,
        },

        transactionId: {
            type: String,
            default: null,
        },

        paymentGateway: {
            type: String,
            default: null,
        },

        // Optional Future Fields
        autoRenew: {
            type: Boolean,
            default: false,
        },

        lastReminderSent: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ClinicSubscriptionTracker",
    clinicSubscriptionSchema
);