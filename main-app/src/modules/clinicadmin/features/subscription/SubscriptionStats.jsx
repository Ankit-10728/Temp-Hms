import {
    Calendar,
    Database,
    Users,
    HardDrive,
} from "lucide-react";

export default function SubscriptionStats({
    subscription,
}) {
    const sub = subscription;
    const plan = subscription.plan;

    const cards = [
        {
            label: "Remaining Days",
            value: subscription.remainingTrialDays || "Active",
            icon: Calendar,
        },
        {
            label: "Doctors",
            value: plan.featureLimits.maxDoctors,
            icon: Users,
        },
        {
            label: "Pet Records",
            value: plan.featureLimits.maxPetRecords,
            icon: Database,
        },
        {
            label: "Storage",
            value: `${plan.featureLimits.storageLimitGb} GB`,
            icon: HardDrive,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="rounded-xl border bg-white p-5"
                >
                    <card.icon size={20} />

                    <p className="mt-3 text-2xl font-bold">
                        {card.value}
                    </p>

                    <p className="text-sm text-gray-500">
                        {card.label}
                    </p>
                </div>
            ))}
        </div>
    );
}