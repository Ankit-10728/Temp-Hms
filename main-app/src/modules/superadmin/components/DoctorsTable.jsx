import { useState, useRef, useEffect } from "react";
import { Loader2, Eye, Pencil, RefreshCw, Trash2, ChevronDown, Check } from "lucide-react";

// Status configuration for 4 distinct visual states
const STATUS_CONFIG = {
    SUBMITTED: {
        label: "Submitted",
        pill: "bg-[#FFF4E5] text-[#F7931E] border-[#F7931E]/30 hover:bg-[#ffe3cc]",
        icon: "text-[#F7931E]",
        activeItem: "bg-[#F7931E] text-white",
        hoverItem: "text-[#F7931E] hover:bg-[#FFF4E5]",
    },
    APPROVED: {
        label: "Approved",
        pill: "bg-[#D9E8E3] text-[#0C3D2E] border-[#0C3D2E]/20 hover:bg-[#c8ded8]",
        icon: "text-[#0C3D2E]",
        activeItem: "bg-[#0C3D2E] text-white",
        hoverItem: "text-[#0C3D2E] hover:bg-[#D9E8E3]/50",
    },
    REJECTED: {
        label: "Rejected",
        pill: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
        icon: "text-rose-700",
        activeItem: "bg-rose-600 text-white",
        hoverItem: "text-rose-700 hover:bg-rose-50",
    },
    PENDING: {
        label: "Pending",
        pill: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
        icon: "text-slate-600",
        activeItem: "bg-slate-700 text-white",
        hoverItem: "text-slate-700 hover:bg-slate-100",
    },
};

const statusOptions = [
    ["SUBMITTED", "Submitted"],
    ["PENDING", "Pending"],
    ["APPROVED", "Approved"],
    ["REJECTED", "Rejected"],
];

/**
 * 4-Color Status Dropdown Component with Smart Upward/Downward Positioning
 */
function TableStatusDropdown({ value, onChange, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (disabled) return;

        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // If space below is less than 170px, open upwards
            setOpenUpward(spaceBelow < 170);
        }
        setIsOpen((prev) => !prev);
    };

    // Standardize input string key to match STATUS_CONFIG
    const formattedKey = String(value || "SUBMITTED").toUpperCase();
    const currentKey = STATUS_CONFIG[formattedKey] ? formattedKey : "SUBMITTED";
    const currentTheme = STATUS_CONFIG[currentKey];

    const handleSelect = (optionValue) => {
        onChange?.(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative w-full min-w-[115px]">
            {/* Trigger Pill Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                className={`w-full flex items-center justify-between gap-1.5 font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer border shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.pill}`}
            >
                <span className="truncate">{currentTheme.label}</span>
                <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${currentTheme.icon} ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Smart Dropdown Options Popup */}
            {isOpen && (
                <div
                    className={`absolute left-0 right-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 ${
                        openUpward ? "bottom-full mb-1" : "top-full mt-1"
                    }`}
                >
                    <div className="flex flex-col gap-0.5">
                        {statusOptions.map(([optVal, optLabel]) => {
                            const isSelected = optVal === currentKey;
                            const optTheme = STATUS_CONFIG[optVal] || STATUS_CONFIG.SUBMITTED;

                            return (
                                <button
                                    key={optVal}
                                    type="button"
                                    onClick={() => handleSelect(optVal)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isSelected
                                            ? optTheme.activeItem
                                            : optTheme.hoverItem
                                    }`}
                                >
                                    <span className="truncate">{optLabel}</span>
                                    {isSelected && <Check size={13} className="shrink-0 ml-1 text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DoctorsTable({
    doctors = [],
    loading = false,
    error = "",
    onRefresh,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
    updatingStatusId = "",
}) {
    const tableScrollRef = useRef(null);
    const tableContentRef = useRef(null);
    const [tableMaxScroll, setTableMaxScroll] = useState(0);
    const [tableScrollLeft, setTableScrollLeft] = useState(0);
    const [tableViewportWidth, setTableViewportWidth] = useState(0);

    useEffect(() => {
        const updateScrollMetrics = () => {
            const container = tableScrollRef.current;
            if (!container) return;

            setTableMaxScroll(Math.max(container.scrollWidth - container.clientWidth, 0));
            setTableScrollLeft(container.scrollLeft);
            setTableViewportWidth(container.clientWidth);
        };

        updateScrollMetrics();

        const observer = new ResizeObserver(updateScrollMetrics);
        if (tableContentRef.current) observer.observe(tableContentRef.current);
        if (tableScrollRef.current) observer.observe(tableScrollRef.current);

        return () => observer.disconnect();
    }, [doctors.length, loading, error]);

    const handleTableScroll = (event) => {
        setTableScrollLeft(event.currentTarget.scrollLeft);
    };

    const scrollTableTo = (nextScrollLeft) => {
        setTableScrollLeft(nextScrollLeft);

        if (tableScrollRef.current) {
            tableScrollRef.current.scrollLeft = nextScrollLeft;
        }
    };

    const tableThumbWidthPercent = tableMaxScroll
        ? Math.max(24, Math.min(70, (tableViewportWidth / (tableViewportWidth + tableMaxScroll)) * 100))
        : 100;
    const tableThumbLeftPercent = tableMaxScroll
        ? (tableScrollLeft / tableMaxScroll) * (100 - tableThumbWidthPercent)
        : 0;

    const handleTableTrackClick = (event) => {
        if (!tableMaxScroll) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickRatio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        scrollTableTo(clickRatio * tableMaxScroll);
    };

    const renderBody = () => {
        if (loading) {
            return (
                <div className="px-4 md:px-6 py-14 text-center text-gray-400 font-medium text-sm">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#F7931E]" />
                    Loading veterinarians...
                </div>
            );
        }

        if (error) {
            return (
                <div className="px-4 md:px-6 py-14 text-center">
                    <p className="text-sm font-medium text-rose-600">
                        {error}
                    </p>

                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#F7931E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e08319] shadow-xs cursor-pointer"
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    )}
                </div>
            );
        }

        if (!doctors.length) {
            return (
                <div className="px-4 md:px-6 py-14 text-center text-gray-400 font-medium text-sm">
                    No veterinarians found. Add a new veterinarian to get started.
                </div>
            );
        }

        return (
            <>
                <div ref={tableScrollRef} onScroll={handleTableScroll} className="overflow-x-auto">
                    <table ref={tableContentRef} className="min-w-[900px] w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-[#0C3D2E] uppercase text-xs font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-4 md:px-6 py-3.5">Veterinarian</th>
                                <th className="px-4 md:px-6 py-3.5">Mobile</th>
                                <th className="px-4 md:px-6 py-3.5">Location</th>
                                <th className="px-4 md:px-6 py-3.5">Practice</th>
                                <th className="px-4 md:px-6 py-3.5">Exp.</th>
                                <th className="px-4 md:px-6 py-3.5">Status</th>
                                <th className="px-4 md:px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {doctors.map((doctor, index) => {
                                const rawStatus = doctor.veterinarianStatus || doctor.status || "SUBMITTED";

                                return (
                                    <tr
                                        key={doctor.id}
                                        style={{ zIndex: doctors.length - index }}
                                        className="relative hover:bg-slate-50/80 transition-colors"
                                    >
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="font-bold text-gray-800 text-sm">
                                                {doctor.name}
                                            </div>

                                            <div className="text-xs text-gray-400 font-medium">
                                                {doctor.displayId || doctor.id}
                                            </div>
                                        </td>

                                        <td className="px-4 md:px-6 py-4 text-xs font-medium text-gray-600">
                                            {doctor.mobile}
                                        </td>

                                        <td className="px-4 md:px-6 py-4 text-xs font-medium text-gray-600">
                                            {doctor.location}
                                        </td>

                                        <td className="px-4 md:px-6 py-4 text-xs font-medium text-gray-600">
                                            {doctor.practice}
                                        </td>

                                        <td className="px-4 md:px-6 py-4 text-xs font-medium text-gray-600">
                                            {doctor.experience}
                                        </td>

                                        <td className="px-4 md:px-6 py-4">
                                            <TableStatusDropdown
                                                value={rawStatus}
                                                onChange={(newStatus) => onStatusChange?.(doctor, newStatus)}
                                                disabled={updatingStatusId === doctor.id}
                                            />
                                        </td>

                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => onView?.(doctor)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#0C3D2E] transition hover:bg-[#D9E8E3]/40 cursor-pointer"
                                                    title="View veterinarian"
                                                    aria-label="View veterinarian"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onEdit?.(doctor)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#F7931E]/30 bg-[#FFF4E5] text-[#F7931E] transition hover:bg-[#F7931E] hover:text-white cursor-pointer"
                                                    title="Edit veterinarian"
                                                    aria-label="Edit veterinarian"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onDelete?.(doctor)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white cursor-pointer"
                                                    title="Delete veterinarian"
                                                    aria-label="Delete veterinarian"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 bg-white px-5 py-3 sm:hidden">
                    <button
                        type="button"
                        onClick={handleTableTrackClick}
                        disabled={!tableMaxScroll}
                        className="relative block h-5 w-full cursor-pointer rounded-full disabled:cursor-default"
                        aria-label="Scroll veterinarian registry horizontally"
                    >
                        <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
                        <span
                            className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[#F7931E] shadow-[0_1px_4px_rgba(247,147,30,0.35)] transition-[left,width]"
                            style={{
                                left: `${tableThumbLeftPercent}%`,
                                width: `${tableThumbWidthPercent}%`,
                            }}
                        />
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100">
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-t-2xl">
                <div>
                    <h2 className="text-base md:text-lg font-bold text-[#0C3D2E] tracking-tight flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F7931E] shadow-xs"></span>
                        Veterinarian Registry
                    </h2>

                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        Live veterinarians from the super-admin onboarding database
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#D9E8E3] border border-[#0C3D2E]/10 px-3 py-1 text-xs font-bold text-[#0C3D2E]">
                        {doctors.length} {doctors.length === 1 ? "Veterinarian" : "Veterinarians"}
                    </span>

                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#0C3D2E] transition hover:bg-[#D9E8E3]/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin text-[#F7931E]" : "text-[#0C3D2E]"} />
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {renderBody()}
        </div>
    );
}
