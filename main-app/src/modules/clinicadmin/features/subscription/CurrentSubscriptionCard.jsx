import {
    BadgeCheck,
    CalendarDays,
    CreditCard,
    IndianRupee,
} from "lucide-react";

export default function CurrentSubscriptionCard({ subscription }) {
    const sub = subscription;
    const plan = subscription.plan;

    const formatBillingCycle = (cycle) =>
        cycle.replace("_", " ").toLowerCase();

    if (!plan) {
        return (
            <div className="rounded-2xl border border-orange-200 bg-white p-8 shadow-sm">
                <p className="text-gray-600">
                    No plan details available for this subscription.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm lg:flex-row">
            {/* Left Section */}
            <div className="flex-1 p-8">
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Current Subscription
                </span>

                <h2 className="mt-4 text-3xl font-bold text-gray-900">
                    {plan.subscriptionPlan}
                </h2>

                <p className="mt-2 flex items-center gap-2 text-lg font-medium text-gray-600">
                    <IndianRupee className="h-5 w-5 text-orange-500" />
                    ₹{plan.price.toLocaleString()} / {formatBillingCycle(plan.billingCycle)}
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-3">
                            <CalendarDays className="h-6 w-6 text-orange-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Subscription Started
                            </p>

                            <p className="text-lg font-bold text-gray-900">
                                {new Date(sub.planStartDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-green-100 p-3">
                            <CalendarDays className="h-6 w-6 text-green-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Remaining Days
                            </p>

                            <p className="text-3xl font-bold text-green-600">
                                {sub.remainingDays}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-blue-100 p-3">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Plan Status
                            </p>

                            <p className="text-lg font-bold text-gray-900">
                                {sub.status
                                    .toLowerCase()
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-3">
                            <IndianRupee className="h-6 w-6 text-orange-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Amount Paid
                            </p>

                            <p className="text-lg font-bold text-gray-900">
                                ₹{sub.amountPaid?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex w-full flex-col justify-center border-t border-orange-100 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 lg:w-80 lg:border-l lg:border-t-0">
                <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-4">
                            <BadgeCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <h3 className="mt-5 text-center text-xl font-bold text-gray-900">
                        Subscription Active
                    </h3>

                    <p className="mt-2 text-center text-sm text-gray-500">
                        Your clinic is currently subscribed to this plan.
                    </p>

                    <div className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-center">
                        <span className="text-sm font-semibold text-green-700">
                            {sub.status
                                .toLowerCase()
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </span>
                    </div>

                    <p className="mt-5 text-center text-xs text-gray-500">
                        Enjoy uninterrupted access to all subscribed HMS features.
                    </p>
                </div>
            </div>
        </div>
    );
}