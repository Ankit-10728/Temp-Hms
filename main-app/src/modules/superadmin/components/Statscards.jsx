import { Building2, Users, ClipboardList, IndianRupee } from "lucide-react";

const DEFAULT_CARDS = [
    {
        label: "Total Clinics",
        value: "0",
        change: "No data yet",
        theme: "green",
        icon: Building2,
    },
    {
        label: "Total Veterinarians",
        value: "0",
        change: "No data yet",
        theme: "orange",
        icon: Users,
    },
    {
        label: "Active Plans",
        value: "0",
        change: "No data yet",
        theme: "green",
        icon: ClipboardList,
    },
    {
        label: "Total Revenue",
        value: "₹0",
        change: "No data yet",
        theme: "orange",
        icon: IndianRupee,
    },
];

// Richer background tinting and contrast styling
const CARD_THEMES = {
    green: {
        cardBg: "bg-[#D9E8E3]/35 border-[#0C3D2E]/15 hover:border-[#0C3D2E]/40",
        iconBg: "bg-[#0C3D2E] text-white shadow-xs",
        labelColor: "text-[#0C3D2E]/80",
        valueColor: "text-[#0C3D2E]",
        badgeBg: "bg-[#0C3D2E]/10 text-[#0C3D2E]",
    },
    orange: {
        cardBg: "bg-[#FFF4E5] border-[#F7931E]/20 hover:border-[#F7931E]/50",
        iconBg: "bg-[#F7931E] text-white shadow-xs",
        labelColor: "text-amber-900/80",
        valueColor: "text-[#0C3D2E]",
        badgeBg: "bg-[#F7931E]/15 text-[#F7931E]",
    },
};

const StatsCards = ({ cards = DEFAULT_CARDS }) => {
    const visibleCards = Array.isArray(cards) && cards.length ? cards : DEFAULT_CARDS;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {visibleCards.map((card, index) => {
                const Icon = card.icon;
                const themeKey = card.theme || (index % 2 === 0 ? "green" : "orange");
                const currentTheme = CARD_THEMES[themeKey] || CARD_THEMES.green;

                return (
                    <div
                        key={card.label}
                        className={`rounded-2xl p-4 md:p-5 flex items-start gap-4 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${currentTheme.cardBg}`}
                    >
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${currentTheme.iconBg}`}
                        >
                            <Icon size={22} className="currentColor" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs font-bold uppercase tracking-wider truncate ${currentTheme.labelColor}`}>
                                    {card.label}
                                </p>

                                <span className="text-gray-400/60 font-bold text-xs">⋯</span>
                            </div>

                            <h3 className={`text-2xl md:text-3xl font-black mt-1.5 break-words tracking-tight ${currentTheme.valueColor}`}>
                                {card.value}
                            </h3>

                            {card.change ? (
                                <div className="mt-2.5">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${currentTheme.badgeBg}`}>
                                        {card.change}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;