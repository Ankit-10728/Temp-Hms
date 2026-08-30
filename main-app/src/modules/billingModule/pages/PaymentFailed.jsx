import React from "react";
import {
    XCircle,
    RotateCcw,
    LogIn,
    AlertTriangle,
    CreditCard,
    CalendarDays,
    Receipt,
    ShieldAlert,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentFailure = ({
    type = "failure",
    paymentData,
    title,
    subtitle,
    badgeText,
    statusText,
    amountLabel,
    detailsTitle,
    detailsSubtitle,
    alertTitle,
    alertMessage,
    primaryButton,
    secondaryButton,
}) => {
    const navigate = useNavigate();


    const [searchParams] = useSearchParams();

    const clinicName = searchParams.get("clinicName");
    const email = searchParams.get("email");
    const plan = searchParams.get("plan");

    const txnid = searchParams.get("txnid");
    const amount = searchParams.get("amount");
    const mode = searchParams.get("mode");
    const attemptedAt = searchParams.get("attemptedAt");
    const message = searchParams.get("message");

    const handleBackToLogin = () => {
        localStorage.clear();
        sessionStorage.clear();

        navigate("/login", { replace: true });
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-100 flex items-center justify-center px-6 py-12">

            {/* Decorative Background */}

            <div className="fixed top-0 left-0 w-96 h-96 bg-red-300/20 blur-3xl rounded-full" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-rose-300/20 blur-3xl rounded-full" />

            <div className="relative w-full max-w-5xl">

                <div className="bg-white/90 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-white">

                    {/* HERO */}

                    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-10 py-16">

                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl" />
                        </div>

                        <div className="relative text-center">

                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-6">

                                <XCircle size={58} />

                            </div>

                            <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full text-sm font-medium mb-6">

                                <AlertTriangle size={16} />
                                Subscription Payment Failed

                            </div>

                            <h1 className="text-5xl font-bold mb-4">
                                Payment Failed
                            </h1>

                            <p className="text-lg text-red-50 max-w-2xl mx-auto">
                                We could not process your payment. No worries,
                                you can retry the payment or login again and continue.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3 mt-8">

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    Secure Gateway
                                </div>

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    No Subscription Activated
                                </div>

                                <div className="bg-white/15 px-4 py-2 rounded-full text-sm">
                                    Retry Available
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* DETAILS */}

                    <div className="p-8">

                        <div className="grid md:grid-cols-3 gap-6 mb-8">

                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border shadow-sm">

                                <p className="text-sm text-slate-500 mb-2">
                                    Amount Attempted
                                </p>

                                <h2 className="text-4xl font-bold text-red-600">
                                    ₹{amount || "0"}
                                </h2>

                            </div>


                            <div className="bg-white rounded-2xl border p-5">
                                <p className="text-sm text-slate-500">
                                    Transaction ID
                                </p>
                                <h3 className="font-semibold mt-1 break-all">
                                    {txnid || "-"}
                                </h3>
                            </div>



                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border shadow-sm">

                                <p className="text-sm text-slate-500 mb-2">
                                    Subscription Plan
                                </p>

                                <h2 className="text-xl font-semibold">
                                    {plan || "N/A"}
                                </h2>

                            </div>



                        </div>

                        {/* FAILURE DETAILS */}

                        <div className="bg-slate-50 rounded-3xl border p-8 mb-8">

                            <div className="flex items-center gap-3 mb-8">

                                <Receipt className="text-red-600" />

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Clinic Details
                                    </h2>

                                    <p className="text-slate-500">
                                        Information about the failed transaction
                                    </p>

                                </div>

                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Clinic Name
                                    </p>
                                    <h3 className="font-semibold text-lg mt-1">
                                        {clinicName || "-"}
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl border p-5">
                                    <p className="text-sm text-slate-500">
                                        Email
                                    </p>
                                    <h3 className="font-semibold mt-1 break-all">
                                        {email || "-"}
                                    </h3>
                                </div>







                            </div>

                        </div>

                        {/* ALERT BOX */}

                        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8">

                            <div className="flex items-start gap-4">

                                <ShieldAlert
                                    size={28}
                                    className="text-red-600"
                                />

                                <div>

                                    <h3 className="font-bold text-red-700 mb-2">
                                        Subscription Not Activated
                                    </h3>

                                    <p className="text-red-600">
                                        Since the payment was unsuccessful,
                                        your HMS subscription has not been activated.
                                        Please retry the payment to continue.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* BUTTONS */}

                        <div className="space-y-4">



                            <button
                                onClick={handleBackToLogin}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
                            >
                                <LogIn size={20} />
                                Back To Login
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default PaymentFailure;