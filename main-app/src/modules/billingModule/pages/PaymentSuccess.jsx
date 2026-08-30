import React from "react";
import {
    CheckCircle2,
    FileText,
    LayoutDashboard,
    Download,
    ShieldCheck,
    CreditCard,
    CalendarDays,
    BadgeCheck,
    Receipt,
} from "lucide-react";
import html2canvas from "html2canvas";
import { useNavigate, useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
const PaymentSuccess = ({
    receiptData,
    title,
    subtitle,
    badgeText,
    dashboardPath,
    receiptPath,
    trustCards,
}) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 flex items-center justify-center px-6 py-12">

            {/* Decorative Blobs */}

            <div className="fixed top-0 left-0 w-96 h-96 bg-green-300/20 blur-3xl rounded-full" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-300/20 blur-3xl rounded-full" />

            <div className="relative w-full max-w-5xl">

                <div className="bg-white/90 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white">

                    {/* HERO */}

                    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white px-10 py-16">

                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl" />
                        </div>

                        <div className="relative text-center">

                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-6">

                                <CheckCircle2 size={58} />

                            </div>

                            <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-sm font-medium mb-6">

                                <BadgeCheck size={16} />
                                {badgeText}

                            </div>

                            <h1 className="text-5xl font-bold mb-4">
                                {title}
                            </h1>

                            <p className="text-lg text-green-50 max-w-2xl mx-auto">
                                {subtitle}
                            </p>

                            <div className="flex flex-wrap justify-center gap-3 mt-8">

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    Secure Payment
                                </div>

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    Verified Transaction
                                </div>

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    HMS Premium Subscription
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* SUMMARY CARDS */}

                    <div className="p-8">

                        <div className="grid md:grid-cols-3 gap-6 mb-8">

                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border shadow-sm">

                                <p className="text-sm text-slate-500 mb-2">
                                    Amount Paid
                                </p>

                                <h2 className="text-4xl font-bold text-emerald-600">
                                    ₹{receiptData.amount}
                                </h2>

                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border shadow-sm">

                                <p className="text-sm text-slate-500 mb-2">
                                    Subscription Plan
                                </p>

                                <h2 className="text-xl font-semibold">
                                    {receiptData.productinfo}
                                </h2>

                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border shadow-sm">

                                <p className="text-sm text-slate-500 mb-2">
                                    Status
                                </p>

                                <span className="inline-flex bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                                    {receiptData.status}
                                </span>

                            </div>

                        </div>

                        {/* TRANSACTION DETAILS */}

                        <div className="bg-slate-50 rounded-3xl border p-8 mb-8">

                            <div className="flex items-center gap-3 mb-8">

                                <Receipt className="text-emerald-600" />

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Transaction Details
                                    </h2>

                                    <p className="text-slate-500">
                                        Payment information and subscription details
                                    </p>

                                </div>

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Clinic Name
                                    </p>
                                    <h3 className="font-semibold text-lg mt-1">
                                        {receiptData.firstname}
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Email Address
                                    </p>
                                    <h3 className="font-semibold text-lg mt-1 break-all">
                                        {receiptData.email}
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Transaction ID
                                    </p>
                                    <h3 className="font-semibold mt-1 break-all">
                                        {receiptData.txnid}
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        PayU Payment ID
                                    </p>
                                    <h3 className="font-semibold mt-1 break-all">
                                        {receiptData.mihpayid}
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Payment Mode
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <CreditCard size={18} />
                                        <h3 className="font-semibold">
                                            {receiptData.mode}
                                        </h3>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Payment Date
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                        <CalendarDays size={18} />
                                        <h3 className="font-semibold">
                                            {receiptData.addedon}
                                        </h3>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* TRUST SECTION */}

                        <div className="grid md:grid-cols-3 gap-5 mb-8">

                            <div className="bg-white border rounded-2xl p-5 text-center">
                                <ShieldCheck
                                    className="mx-auto mb-3 text-green-600"
                                    size={32}
                                />
                                <h3 className="font-semibold">
                                    Secure Payment
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Protected transaction processing
                                </p>
                            </div>

                            <div className="bg-white border rounded-2xl p-5 text-center">
                                <BadgeCheck
                                    className="mx-auto mb-3 text-green-600"
                                    size={32}
                                />
                                <h3 className="font-semibold">
                                    Verified Subscription
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Successfully activated plan
                                </p>
                            </div>

                            <div className="bg-white border rounded-2xl p-5 text-center">
                                <CheckCircle2
                                    className="mx-auto mb-3 text-green-600"
                                    size={32}
                                />
                                <h3 className="font-semibold">
                                    HMS Ready
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Start managing your clinic today
                                </p>
                            </div>

                        </div>

                        {/* ACTION BUTTONS */}

                        <div className="space-y-4">



                            <button
                                onClick={() =>
                                    navigate("/receipt", {
                                        state: receiptData,
                                    })
                                }
                                className="w-full py-4 rounded-2xl border border-slate-300 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-3"
                            >
                                <FileText size={20} />
                                View Detailed Receipt
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/clinic")
                                }
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
                            >
                                <LayoutDashboard size={20} />
                                Proceed To Dashboard
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default PaymentSuccess;