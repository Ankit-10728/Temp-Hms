import React from "react";

export default function ViewStaffModal({
    staff,
    onClose,
    onDelete,
}) {
    if (!staff) return null;

    console.log(staff);

    let reportTo = staff.employmentInfo.reportingTo?.personalInfo?.fullName

    if (!reportTo) {
        reportTo = "Clinic Admin"
    }

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            style={{
                backgroundColor:
                    "rgba(17,24,39,0.55)",
                backdropFilter:
                    "blur(4px)",
            }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-[1100px] max-h-[90vh] overflow-y-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1A1D2E]">
                            Staff Profile
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Complete employee
                            information
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-xl text-gray-500 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Profile Section */}
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-[#FEF3EB] flex items-center justify-center text-2xl font-bold text-[#E8630A]">
                            {staff.personalInfo?.fullName
                                ?.split(" ")
                                .map(
                                    (n) => n[0]
                                )
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#1A1D2E]">
                                {
                                    staff
                                        .personalInfo
                                        ?.fullName
                                }
                            </h3>

                            <p className="text-gray-500">
                                {
                                    staff
                                        .employmentInfo
                                        ?.role
                                }
                            </p>

                            <span className="inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                                {staff
                                    .accountInfo
                                    ?.accountActive
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-5">
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <Info
                                label="Email"
                                value={
                                    staff
                                        .personalInfo
                                        ?.email
                                }
                            />

                            <Info
                                label="Mobile"
                                value={
                                    staff
                                        .personalInfo
                                        ?.mobileNumber
                                }
                            />

                            <Info
                                label="Gender"
                                value={
                                    staff
                                        .personalInfo
                                        ?.gender
                                }
                            />

                            <Info
                                label="Date Of Birth"
                                value={
                                    staff
                                        .personalInfo
                                        ?.dateOfBirth
                                        ?.split(
                                            "T"
                                        )[0]
                                }
                            />
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-5">
                            Employment Information
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <Info
                                label="Staff ID"
                                value={
                                    staff
                                        .employmentInfo
                                        ?.staffId
                                }
                            />

                            <Info
                                label="Role"
                                value={
                                    staff
                                        .employmentInfo
                                        ?.role
                                }
                            />

                            <Info
                                label="Department"
                                value={
                                    staff
                                        .employmentInfo
                                        ?.department
                                }
                            />

                            <Info
                                label="Employment Type"
                                value={
                                    staff
                                        .employmentInfo
                                        ?.employmentType
                                }
                            />

                            <Info
                                label="Date Of Joining"
                                value={
                                    staff
                                        .employmentInfo
                                        ?.dateOfJoining
                                        ?.split(
                                            "T"
                                        )[0]
                                }
                            />

                            <Info
                                label="Reporting To"
                                value={
                                    reportTo
                                }
                            />
                        </div>
                    </div>

                    {/* Module Access */}                    {/* Module Access */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-5">
                            Module Access
                        </h3>

                        <div className="flex flex-wrap gap-3">
                            {Object.entries(staff.moduleAccess || {})
                                .filter(([_, value]) => value)
                                .map(([module]) => (
                                    <span
                                        key={module}
                                        className="px-4 py-2 rounded-xl bg-[#FEF3EB] text-[#E8630A] font-semibold"
                                    >
                                        {module}
                                    </span>
                                ))}
                        </div>
                    </div>
                    {/* Uploaded Documents */}
{staff.personalInfo?.profilePhoto && (
    <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-5">
            Uploaded Documents
        </h3>

        <div className="flex flex-col gap-2">
            
                <a href={staff.personalInfo.profilePhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#E8630A] hover:underline"
            >
                🖼 View Profile Photo
            </a>
        </div>
    </div>
)}

                    {/* Footer */}
                    <div className="mt-8 border-t border-gray-200 pt-6 flex items-center justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-[#E8630A] text-white font-semibold hover:bg-[#d35400] transition-all duration-200"
                        >
                            Close
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase mb-1">
                {label}
            </p>

            <p className="font-semibold text-[#1A1D2E]">
                {value || "-"}
            </p>
        </div>
    );
}