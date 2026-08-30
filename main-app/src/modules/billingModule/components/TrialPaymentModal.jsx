import {
    ShieldCheck,
    Clock3,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TrialPaymentModal({
    open,
    onClose,
    remainingTrialDays,
    clinicId,
    email,
}) {
    const navigate = useNavigate();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)]">

                {/* Header */}
                <div className="border-b bg-white px-6 py-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                            <Sparkles className="text-orange-600" size={24} />
                        </div>

                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                PetCare HMS
                            </span>

                            <h2 className="text-xl font-bold text-gray-900">
                                Trial Activated
                            </h2>

                            <p className="text-sm text-gray-500">
                                Your clinic is ready to explore every premium feature.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Trial Card */}
                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-emerald-50 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    Trial Active
                                </span>

                                <h3 className="mt-3 text-lg font-semibold text-gray-800">
                                    Remaining Trial
                                </h3>
                            </div>

                            <div className="text-center">
                                <p className="text-5xl font-extrabold text-blue-700">
                                    {remainingTrialDays}
                                </p>

                                <p className="text-sm text-gray-500">
                                    Days Left
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6">
                        <h4 className="mb-4 text-lg font-semibold text-gray-800">
                            During your trial you get
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    className="shrink-0 text-green-600"
                                    size={20}
                                />
                                <span className="text-sm text-gray-700">
                                    Unlimited access to HMS features
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <ShieldCheck
                                    className="shrink-0 text-blue-600"
                                    size={20}
                                />
                                <span className="text-sm text-gray-700">
                                    Secure patient & clinic management
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock3
                                    className="shrink-0 text-orange-500"
                                    size={20}
                                />
                                <span className="text-sm text-gray-700">
                                    Upgrade anytime without losing data
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <p className="text-sm leading-6 text-gray-700">
                            Once your trial expires, your clinic access will be
                            restricted until a subscription plan is activated.
                            Upgrade now to ensure uninterrupted access.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:bg-gray-100"
                    >
                        Continue Trial
                    </button>

                    <button
                        onClick={() =>
                            navigate("/payment", {
                                state: {
                                    clinicId,
                                    email,
                                },
                            })
                        }
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-orange-600 hover:to-orange-700"
                    >
                        Upgrade Now →
                    </button>
                </div>
            </div>
        </div>
    );
}