import { FileText } from "lucide-react";

export default function ReportsGrid({
    categories,
    selected,
    onSelect,
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category) => {
                const isSelected = selected?.id === category.id;

                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelect(category)}
                        className={`
                            text-left
                            bg-white
                            border
                            rounded-2xl
                            p-4 md:p-6
                            shadow-xs
                            transition-all
                            duration-200
                            w-full
                            cursor-pointer

                            ${
                                isSelected
                                    ? "border-[#0C3D2E] ring-2 ring-[#0C3D2E]/10 bg-[#D9E8E3]/20"
                                    : "border-gray-100 hover:border-[#F7931E]/40 hover:shadow-md"
                            }
                        `}
                    >
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "bg-[#0C3D2E] text-white" : "bg-[#FFF4E5] text-[#F7931E]"
                            }`}>
                                <FileText size={22} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base md:text-lg text-[#0C3D2E] tracking-tight">
                                    {category.title}
                                </h3>

                                <p className="text-xs md:text-sm font-medium text-gray-400 mt-1 break-words leading-relaxed">
                                    {category.description}
                                </p>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}