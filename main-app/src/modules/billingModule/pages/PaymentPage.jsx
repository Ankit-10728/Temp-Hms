import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ShieldCheck, CreditCard, BadgeIndianRupee } from "lucide-react";
import { getSubscriptionStatus } from "../../clinicadmin/api/subscriptionApi";
import SubscriptionRequiredModal from "./PlanExpiredPopUp";
import { useEffect, useState } from "react";
import {
    getSubscriptionDetails,
    createSubscriptionPayment,
} from "../api/paymentApi";


const Payment = ({
    title,
    description,
    planName,
    billingCycle,
    amount,
    paymentFeatures,
    onPay,
}) => {

    const { state } = useLocation();

    const clinicId = state?.clinicId;
    const email = state?.email;
    const navigate = useNavigate();

    console.log(email, clinicId);


    const handleBackToLogin = () => {

        localStorage.clear();
        sessionStorage.clear();

        navigate("/login");
    };


    const [plan, setPlan] = useState(null);
    const [showPaymentRequiredModal, setShowPaymentRequiredModal] = useState(false);

    const [showTrialPopup, setShowTrialPopup] = useState(false);

    const handleDashboard = async () => {
        try {
            const data = await getSubscriptionStatus();

            // Live response has subscription fields flattened under data.data
            // (data.data.subscriptionStatus), not a separate subscription key -
            // see the same fix in ProtectedRoute.jsx.
            const status = data?.data?.subscriptionStatus;

            if (status === "ACTIVE") {
                navigate("/clinic");
                return;
            }

            if (status === "TRIAL") {
                navigate("/clinic", {
                    state: {
                        forceTrialPopup: true,
                    },
                });
                return;
            }

            if (
                status === "PAYMENT_REQUIRED" ||
                status === "EXPIRED"
            ) {
                setShowPaymentRequiredModal(true)
                return;
            }

        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const loadSubscription = async () => {
            try {
                const data = await getSubscriptionDetails(clinicId);
                console.log(data);


                setPlan(data);
            } catch (err) {
                console.log(err);
            }
        };

        if (clinicId) {
            loadSubscription();
        }
    }, [clinicId]);

    const handlePay = async () => {
        try {
            const data = await createSubscriptionPayment(clinicId);

            const paymentData = data.paymentData;

            const form = document.createElement("form");
            form.method = "POST";
            form.action = import.meta.env.VITE_PAYU_BASE_URL;;

            Object.entries(paymentData).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <SubscriptionRequiredModal
                open={showPaymentRequiredModal}
                onClose={() => setShowPaymentRequiredModal(false)}
                clinicId={clinicId}
                email={email}
            />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Left Section */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">
                                Subscription Payment
                            </h1>

                            <p className="text-blue-100  leading-relaxed">
                                Continue your subscription for
                                {` ${plan?.clinicName}`}
                            </p>
                        </div>

                        <div className="space-y-4 mt-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={22} />
                                <span>100% Secure Payment via PayU</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <CreditCard size={22} />
                                <span>Supports UPI, Cards, Net Banking</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="p-10">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                            Subscription Details
                        </h2>

                        <div className="border rounded-xl p-6 bg-gray-50 mb-8">
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-semibold">{plan?.planName}</span>
                            </div>

                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Billing Cycle</span>
                                <span className="font-semibold">{plan?.billingCycle}</span>
                            </div>

                            <div className="flex justify-between items-center border-t pt-4">
                                <span className="text-lg font-medium text-gray-700">
                                    Total Amount
                                </span>

                                <div className="flex items-center text-2xl font-bold text-green-600">
                                    <BadgeIndianRupee size={24} />
                                    {plan?.price}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePay}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                        >
                            Proceed to Payment
                        </button>

                        <button
                            onClick={handleDashboard}
                            className="mt-4 w-full rounded-xl border-2 border-blue-600 bg-white py-4 font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-50"
                        >
                            Go to Dashboard
                        </button>

                        <button
                            onClick={handleBackToLogin}
                            className="mt-4 w-full rounded-xl py-3 font-medium text-gray-500 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                        >
                            Back to Login
                        </button>

                        <p className="text-sm text-gray-500 mt-6 text-center">
                            By proceeding, you agree to our Terms & Conditions and Subscription Policy.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payment;