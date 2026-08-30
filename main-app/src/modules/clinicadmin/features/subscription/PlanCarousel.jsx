import SubscriptionPlanCard from "./SubscriptionPlanCard";
import { Sparkles } from "lucide-react";
export default function PlanCarousel({
    status,
    plans,
    currentPlanId,
}) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">

                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Available Plans
                        </h2>

                        <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                            <Sparkles size={14} />
                            Coming Soon
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Compare plans and upgrade your clinic whenever you're ready.
                    </p>
                </div>



                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                    {plans.length} Plans
                </span>

            </div>

            {/* Plans */}
            <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">

                {plans.map((plan) => (
                    <div
                        key={plan._id}
                        className="min-w-[330px] flex-shrink-0"
                    >
                        <SubscriptionPlanCard
                            status={status}
                            plan={plan}
                            isCurrent={plan._id === currentPlanId}
                        />
                    </div>
                ))}

            </div>

        </section>
    );
}