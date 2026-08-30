import { Clock, CalendarDays, CreditCard } from "lucide-react";

export default function TrialSubscriptionCard({
    subscription,
    onUpgrade,
}) {
    return (
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">
            {/* Left Section */}
            <div className="flex-1 p-8">
                <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    Free Trial
                </span>

                <h2 className="mt-4 text-3xl font-bold text-gray-900">
                    Your{" "}
                    <span className="text-orange-500">
                        Trial
                    </span>{" "}
                    is Active
                </h2>

                <p className="mt-2 text-gray-600">
                    Enjoy all HMS features during your trial period. Upgrade anytime to
                    continue using the platform without interruption.
                </p>

                <div className="mt-8 flex flex-wrap gap-8">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-100 p-3">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Remaining Days
                            </p>

                            <p className="text-3xl font-bold text-orange-600">
                                {subscription.remainingDays}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-green-100 p-3">
                            <CalendarDays className="h-6 w-6 text-green-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Trial Ends On
                            </p>

                            <p className="text-lg font-bold text-gray-900">
                                {new Date(
                                    subscription.trialEndDate
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex w-full flex-col justify-center border-t border-orange-100 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 lg:w-80 lg:border-l lg:border-t-0">
                <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
                    <p className="text-center text-sm font-medium text-gray-500">
                        To continue using HMS after your trial,
                    </p>

                    <h3 className="mt-2 text-center text-xl font-bold text-gray-900">
                        Purchase an Initial Plan
                    </h3>

                    <button
                        onClick={onUpgrade}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                        <CreditCard size={18} />
                        Buy Initial Plan
                    </button>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        Secure payment • Instant activation
                    </p>
                </div>
            </div>
        </div>
    );
}