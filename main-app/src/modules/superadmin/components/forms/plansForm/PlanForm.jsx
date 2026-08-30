import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createPlan, updatePlan } from "../../../api/planApi";
import { showToast } from "../../../../../shared/components/toast";

const today = new Date().toISOString().slice(0, 10);

const PLAN_TYPE_CONFIG = {
    Clinic: {
        planNames: ["Basic", "Standard", "Professional", "Enterprise"],
        defaults: {
            maxStaffAccounts: 5,
            maxDoctors: 2,
            maxPetRecords: 100,
            storageLimitGb: 5,
        },
        pricePresets: {
            Basic: { Monthly: 999, Quarterly: 2699, Annual: 9999 },
            Standard: { Monthly: 1999, Quarterly: 5399, Annual: 19999 },
            Professional: { Monthly: 3999, Quarterly: 10799, Annual: 39999 },
            Enterprise: { Monthly: 7999, Quarterly: 21599, Annual: 79999 },
          
        },
    },
    "Solo Doctor": {
        planNames: ["Solo Basic", "Solo Pro", "Custom"],
        defaults: {
            maxStaffAccounts: 0,
            maxDoctors: 1,
            maxPetRecords: 50,
            storageLimitGb: 2,
        },
        pricePresets: {
            "Solo Basic": { Monthly: 499, Quarterly: 1299, Annual: 4999 },
            "Solo Pro": { Monthly: 999, Quarterly: 2699, Annual: 9999 },
            Custom: { Monthly: 0, Quarterly: 0, Annual: 0 },
        },
    },
};

const BILLING_CYCLES = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];
const STATUS_OPTIONS = ["Active", "Inactive", "Archived"];

const clampNonNegativeNumber = (value) => Math.max(Number(value || 0), 0);

const resolvePlanType = (plan) => {
    if (plan?.planType === "Solo Doctor") return "Solo Doctor";
    if (["Solo Basic", "Solo Pro"].includes(plan?.subscriptionPlan)) return "Solo Doctor";
    return "Clinic";
};

const formatDateForInput = (value) => {
    if (!value) return today;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return today;

    return date.toISOString().slice(0, 10);
};

const getPlanPrice = (planType, subscriptionPlan, billingCycle) =>
    PLAN_TYPE_CONFIG[planType]?.pricePresets?.[subscriptionPlan]?.[billingCycle] ?? 0;

const getPlanDefaults = (planType) => PLAN_TYPE_CONFIG[planType]?.defaults || PLAN_TYPE_CONFIG.Clinic.defaults;

const buildInitialForm = (plan) => {
    const planType = resolvePlanType(plan);
    const planConfig = PLAN_TYPE_CONFIG[planType];
    const subscriptionPlan = plan?.subscriptionPlan && planConfig.planNames.includes(plan.subscriptionPlan)
        ? plan.subscriptionPlan
        : planConfig.planNames[0];
    const billingCycle = BILLING_CYCLES.includes(plan?.billingCycle) ? plan.billingCycle : "Monthly";
    const defaults = getPlanDefaults(planType);

    return {
        planType,
        subscriptionPlan,
        billingCycle,
        price: Number(plan?.price ?? getPlanPrice(planType, subscriptionPlan, billingCycle)),
        planStartDate: formatDateForInput(plan?.planStartDate),
        trialPeriodDays: Number(plan?.trialPeriodDays ?? 0),
        discountPromoCode: plan?.discountPromoCode ?? "",
        customPlanNotes: plan?.customPlanNotes ?? "",
        maxStaffAccounts: Number(plan?.featureLimits?.maxStaffAccounts ?? defaults.maxStaffAccounts),
        maxDoctors: Number(plan?.featureLimits?.maxDoctors ?? defaults.maxDoctors),
        maxPetRecords: Number(plan?.featureLimits?.maxPetRecords ?? defaults.maxPetRecords),
        maxPetRecordsUnlimited: Boolean(plan?.featureLimits?.maxPetRecordsUnlimited),
        storageLimitGb: Number(plan?.featureLimits?.storageLimitGb ?? defaults.storageLimitGb),
        labModuleEnabled: Boolean(plan?.modules?.lab),
        groomingModuleEnabled: Boolean(plan?.modules?.grooming),
        kennelModuleEnabled: Boolean(plan?.modules?.kennel),
        onlinePharmacyModuleEnabled: Boolean(plan?.modules?.onlinePharmacy),
        apiAccessEnabled: Boolean(plan?.modules?.apiAccess),
        whiteLabelCustomBranding: Boolean(plan?.modules?.whiteLabelBranding),
        status: plan?.status ?? "Active",
    };
};

const getRenewalDate = (startDate, billingCycle) => {
    const date = new Date(startDate);
    if (Number.isNaN(date.getTime())) return "";

    const months = { Monthly: 1, Quarterly: 3, "Half-Yearly": 6, Annual: 12 }[billingCycle] || 1;
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
};

export default function PlanForm({ plan, onClose, onSaved, onCreated, readOnly = false }) {
    const isEditing = Boolean(plan?._id);
    const [form, setForm] = useState(() => buildInitialForm(plan));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setForm(buildInitialForm(plan));
        setError("");
    }, [plan]);

    const planEndRenewalDate = useMemo(
        () => getRenewalDate(form.planStartDate, form.billingCycle),
        [form.planStartDate, form.billingCycle]
    );

    const subscriptionPlanOptions = PLAN_TYPE_CONFIG[form.planType]?.planNames || PLAN_TYPE_CONFIG.Clinic.planNames;

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => {
            if (name === "planType") {
                const nextPlanType = value in PLAN_TYPE_CONFIG ? value : "Clinic";
                const nextPlanOptions = PLAN_TYPE_CONFIG[nextPlanType].planNames;
                const nextSubscriptionPlan = nextPlanOptions.includes(previous.subscriptionPlan)
                    ? previous.subscriptionPlan
                    : nextPlanOptions[0];
                const nextBillingCycle = BILLING_CYCLES.includes(previous.billingCycle) ? previous.billingCycle : "Monthly";
                const nextDefaults = getPlanDefaults(nextPlanType);

                return {
                    ...previous,
                    planType: nextPlanType,
                    subscriptionPlan: nextSubscriptionPlan,
                    price: getPlanPrice(nextPlanType, nextSubscriptionPlan, nextBillingCycle),
                    maxStaffAccounts: nextDefaults.maxStaffAccounts,
                    maxDoctors: nextDefaults.maxDoctors,
                    maxPetRecords: nextDefaults.maxPetRecords,
                    maxPetRecordsUnlimited: false,
                    storageLimitGb: nextDefaults.storageLimitGb,
                };
            }

            const numericFields = new Set([
                "price",
                "trialPeriodDays",
                "maxStaffAccounts",
                "maxDoctors",
                "maxPetRecords",
                "storageLimitGb",
            ]);

            const nextValue = type === "checkbox"
                ? checked
                : numericFields.has(name)
                    ? clampNonNegativeNumber(value)
                    : value;

            const nextForm = {
                ...previous,
                [name]: nextValue,
            };

            if (name === "subscriptionPlan" || name === "billingCycle") {
                const nextSubscriptionPlan = name === "subscriptionPlan" ? value : nextForm.subscriptionPlan;
                const nextBillingCycle = name === "billingCycle" ? value : nextForm.billingCycle;
                nextForm.price = getPlanPrice(nextForm.planType, nextSubscriptionPlan, nextBillingCycle);
            }

            return nextForm;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (readOnly) return;
        setSaving(true);
        setError("");

        const payload = {
            ...form,
            price: clampNonNegativeNumber(form.price),
            trialPeriodDays: clampNonNegativeNumber(form.trialPeriodDays),
            planEndRenewalDate,
            // Only Lab is actually selectable in the UI right now - force the
            // rest off so an old plan's stale enabled flags (from before this
            // restriction existed) can't be silently carried forward.
            groomingModuleEnabled: false,
            kennelModuleEnabled: false,
            onlinePharmacyModuleEnabled: false,
            apiAccessEnabled: false,
            whiteLabelCustomBranding: false,
        };

        try {
            const response = isEditing
                ? await updatePlan(plan._id, payload)
                : await createPlan(payload);

            showToast({
                type: "success",
                title: isEditing ? "Plan Updated" : "Plan Created",
                description: response?.message || `The ${form.planType.toLowerCase()} plan has been saved successfully.`,
            });

            onSaved?.(response?.data);
            onCreated?.(response?.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || (isEditing ? "Unable to update plan" : "Unable to create plan"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center px-2 py-[max(2rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-4">
            <div className="bg-white w-full max-w-6xl h-[calc(100svh-3.25rem)] max-h-[calc(100svh-3.25rem)] sm:h-auto sm:max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                
                {/* HEADER MATCHING CLINIC FORM */}
                <div className="flex items-start justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5 bg-[#EEF6F3] border-b border-[#0C3D2E]/15">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-3xl font-bold text-[#0C3D2E] tracking-tight">
                            {readOnly ? "View Subscription Plan" : isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
                        </h2>
                        <p className="text-[#0C3D2E]/70 text-xs sm:text-sm mt-0.5 font-semibold">
                            {readOnly
                                ? "Complete plan details in read-only mode."
                                : "Configure clinic and solo doctor pricing, limits, modules and renewal details."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full hover:bg-[#0C3D2E]/10 flex items-center justify-center text-gray-400 hover:text-[#0C3D2E] transition-colors font-bold cursor-pointer"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="min-h-0 flex flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-6 bg-slate-50/50 p-4 sm:space-y-8 sm:p-6">
                        {error && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                                {error}
                            </div>
                        )}

                        <Section title="Plan Selection" />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            <SelectField label="Plan Type" name="planType" value={form.planType} onChange={handleChange} options={Object.keys(PLAN_TYPE_CONFIG)} required disabled={readOnly} />
                            <SelectField label="Subscription Plan" name="subscriptionPlan" value={form.subscriptionPlan} onChange={handleChange} options={subscriptionPlanOptions} required disabled={readOnly} />
                            <SelectField label="Billing Cycle" name="billingCycle" value={form.billingCycle} onChange={handleChange} options={BILLING_CYCLES} required disabled={readOnly} />
                            <Field label="Price (INR)" name="price" type="number" min="0" value={form.price} onChange={handleChange} required readOnly={readOnly} />
                            <Field label="Plan Start Date" name="planStartDate" type="date" value={form.planStartDate} onChange={handleChange} required readOnly={readOnly} />
                            <Field label="Plan End / Renewal Date" name="planEndRenewalDate" type="date" value={planEndRenewalDate} readOnly />
                            <Field label="Trial Period (Days)" name="trialPeriodDays" type="number" min="0" value={form.trialPeriodDays} onChange={handleChange} readOnly={readOnly} />
                            <SelectField label="Status" name="status" value={form.status} onChange={handleChange} options={STATUS_OPTIONS} required disabled={readOnly} />
                            <Field label="Discount / Promo Code" name="discountPromoCode" value={form.discountPromoCode} onChange={handleChange} readOnly={readOnly} />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Custom Plan Notes</label>
                            <textarea
                                name="customPlanNotes"
                                value={form.customPlanNotes}
                                onChange={handleChange}
                                rows={3}
                                readOnly={readOnly}
                                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-hidden focus:border-[#0C3D2E] focus:ring-1 focus:ring-[#0C3D2E] transition-all bg-white read-only:bg-slate-100"
                            />
                        </div>

                        <Section title="Feature Limits Per Plan" />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            <Field label="Max Staff Accounts" name="maxStaffAccounts" type="number" min="0" value={form.maxStaffAccounts} onChange={handleChange} required readOnly={readOnly} />
                            <Field label="Max Doctors" name="maxDoctors" type="number" min="0" value={form.maxDoctors} onChange={handleChange} required readOnly={readOnly} />
                            <Field label="Max Pet Records" name="maxPetRecords" type="number" min="0" value={form.maxPetRecords} onChange={handleChange} disabled={form.maxPetRecordsUnlimited} readOnly={readOnly} />
                            <Field label="Storage Limit (GB)" name="storageLimitGb" type="number" min="0" value={form.storageLimitGb} onChange={handleChange} required readOnly={readOnly} />
                        </div>

                        <Section title="Module Access" />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[
                                ["labModuleEnabled", "Lab module enabled", false],
                                ["groomingModuleEnabled", "Grooming module enabled", true],
                                ["kennelModuleEnabled", "Kennel module enabled", true],
                                ["onlinePharmacyModuleEnabled", "Online pharmacy module enabled", true],
                                ["apiAccessEnabled", "API access enabled", true],
                                ["whiteLabelCustomBranding", "White-label / custom branding", true],
                            ].map(([name, label, isDisabled]) => (
                                <label
                                    key={name}
                                    className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xs transition-colors ${
                                        isDisabled || readOnly
                                            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                            : "border-gray-200 bg-white text-gray-700 cursor-pointer hover:border-[#F7931E]/40"
                                    }`}
                                >
                                    <span>{label}{isDisabled ? " (coming soon)" : ""}</span>
                                    <input
                                        type="checkbox"
                                        name={name}
                                        checked={isDisabled ? false : form[name]}
                                        onChange={isDisabled || readOnly ? undefined : handleChange}
                                        disabled={isDisabled || readOnly}
                                        className="h-4 w-4 accent-[#F7931E] rounded-xs cursor-pointer disabled:cursor-not-allowed"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                            <div className="text-xs font-bold text-[#0C3D2E]">Subscription Invoice</div>
                            <div className="mt-0.5 text-xs font-medium text-gray-400">Invoice will be shared manually by Super Admin</div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        {readOnly ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-[#F7931E] hover:bg-[#e08319] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#F7931E] hover:bg-[#e08319] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                                >
                                    {saving ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Plan" : "Create Plan")}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

function Section({ title }) {
    return <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">{title}</h3>;
}

function Field({ label, name, value, onChange, type = "text", readOnly = false, disabled = false, required = false, min }) {
    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                disabled={disabled}
                required={required}
                min={min}
                className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-hidden focus:border-[#0C3D2E] focus:ring-1 focus:ring-[#0C3D2E] transition-all bg-white disabled:bg-slate-100 read-only:bg-slate-100 font-medium text-gray-800"
            />
        </div>
    );
}

function SelectField({ label, name, value, onChange, options, required = false, disabled = false }) {
    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full mt-1.5 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-hidden focus:border-[#0C3D2E] focus:ring-1 focus:ring-[#0C3D2E] transition-all bg-white font-medium text-gray-800 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
