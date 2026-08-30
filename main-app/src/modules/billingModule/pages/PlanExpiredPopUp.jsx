import { X, AlertTriangle, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionRequiredModal({
    open,
    onClose,
    clinicId,
    email,
}) {
    const navigate = useNavigate();

    if (!open) return null;

    const handleShowPlans = () => {
        onClose?.();

        navigate("/payment", {
            state: {
                clinicId,
                email,
            },
        });
    };

    const handleBackToLogin = () => {
        localStorage.clear();
        sessionStorage.clear();

        navigate("/login", { replace: true });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)]">

                {/* Header */}
                <div className="relative border-b bg-white px-8 py-7">

                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                            <AlertTriangle
                                className="text-red-600"
                                size={28}
                            />
                        </div>

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                                Subscription Required
                            </span>

                            <h2 className="text-2xl font-bold text-gray-900">
                                Plan Expired
                            </h2>

                            <p className="text-gray-500">
                                Your subscription is no longer active.
                            </p>
                        </div>

                    </div>

                </div>

                {/* Body */}
                <div className="space-y-6 p-8">

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                        <h3 className="text-lg font-semibold text-red-700">
                            Access Restricted
                        </h3>

                        <p className="mt-3 leading-7 text-gray-700">
                            Your subscription has expired or payment is pending.
                            To continue accessing the Clinic Dashboard and all
                            HMS features, please activate a subscription plan.
                        </p>

                    </div>

                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">

                        <h4 className="font-semibold text-orange-700">
                            What happens now?
                        </h4>

                        <ul className="mt-3 space-y-2 text-sm text-gray-700">
                            <li>• Dashboard access is temporarily restricted.</li>
                            <li>• Your clinic data remains safe and secure.</li>
                            <li>• Activate a plan to regain full access instantly.</li>
                        </ul>

                    </div>

                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 p-6 sm:flex-row sm:justify-end">

                    <button
                        onClick={handleBackToLogin}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100"
                    >
                        <LogOut size={18} />
                        Back to Login
                    </button>

                    <button
                        onClick={handleShowPlans}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700"
                    >
                        <CreditCard size={18} />
                        Pay
                    </button>

                </div>

            </div>
        </div>
    );
}