import {
    Check,
    Crown,
    Users,
    Stethoscope,
    PawPrint,
    HardDrive,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MODULE_LABELS = [
    ["lab", "Lab Module"],
    ["grooming", "Grooming"],
    ["kennel", "Kennel"],
    ["onlinePharmacy", "Online Pharmacy"],
    ["apiAccess", "API Access"],
    ["whiteLabelBranding", "White Label Branding"],
];

export default function SubscriptionPlanCard({
    status,
    plan,
    isCurrent,
}) {
    const navigate = useNavigate();
    const handleContactAdmin = () => {
        navigate("/contact");
    };
    const includedModules = MODULE_LABELS.filter(([key]) => plan.modules[key]);
    const excludedModules = MODULE_LABELS.filter(([key]) => !plan.modules[key]);
    const petRecordsLabel = plan.featureLimits.maxPetRecordsUnlimited
        ? "Unlimited"
        : plan.featureLimits.maxPetRecords ?? "-";

    return (
        <div
            className={`relative flex min-w-[330px] flex-col justify-between rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isCurrent
                ? "border-orange-500 ring-2 ring-orange-100"
                : "border-gray-200"
                }`}
        >
            {isCurrent && status !== "TRIAL" && (
                <div className="absolute right-5 top-5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    Current Plan
                </div>
            )}

            <div>
                {/* Header */}

                <div className="flex items-center gap-3">

                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${isCurrent
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-100 text-slate-700"
                            }`}
                    >
                        <Crown size={22} />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {plan.subscriptionPlan}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {plan.billingCycle.replace("_", " ")}
                        </p>
                    </div>

                </div>

                {/* Price */}

                <div className="mt-6">

                    <span className="text-4xl font-bold text-slate-900">
                        ₹{plan.price.toLocaleString()}
                    </span>

                    <span className="ml-2 text-gray-500">
                        / {plan.billingCycle.replace("_", " ").toLowerCase()}
                    </span>

                </div>

                {/* Limits */}

                <div className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <div className="flex items-center gap-3 text-gray-700">
                        <Stethoscope
                            size={18}
                            className="text-orange-500"
                        />
                        <span>
                            Up to{" "}
                            <strong>
                                {plan.featureLimits.maxDoctors}
                            </strong>{" "}
                            Doctors
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <Users
                            size={18}
                            className="text-orange-500"
                        />
                        <span>
                            Up to{" "}
                            <strong>
                                {
                                    plan.featureLimits
                                        .maxStaffAccounts
                                }
                            </strong>{" "}
                            Staff Members
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <PawPrint
                            size={18}
                            className="text-orange-500"
                        />
                        <span>
                            <strong>{petRecordsLabel}</strong> Pet Records
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                        <HardDrive
                            size={18}
                            className="text-orange-500"
                        />
                        <span>
                            <strong>{plan.featureLimits.storageLimitGb} GB</strong> Storage
                        </span>
                    </div>

                </div>

                {/* Features */}

                <div className="mt-6">

                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                        Modules
                    </h4>

                    <div className="space-y-3">

                        {includedModules.map(([key, label]) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 text-sm text-gray-700"
                            >
                                <Check
                                    size={16}
                                    className="text-green-600"
                                />

                                {label}
                            </div>
                        ))}

                        {excludedModules.map(([key, label]) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 text-sm text-gray-400"
                            >
                                <X
                                    size={16}
                                    className="text-gray-300"
                                />

                                {label}
                            </div>
                        ))}

                    </div>

                </div>

            </div>

            {/* Button */}

            <button
                onClick={handleContactAdmin}
                disabled={isCurrent && status !== "TRIAL"}
                className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                    isCurrent && status !== "TRIAL"
                        ? "cursor-not-allowed border border-orange-200 bg-orange-50 text-orange-600"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
            >
                {isCurrent && status !== "TRIAL"
                    ? "Current Plan"
                    : "Contact Admin To Change Plan"}
            </button>

        </div>
    );
}