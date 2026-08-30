const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const valueOrDash = (value) => {
    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (value === undefined || value === null || String(value).trim() === "") {
        return "-";
    }

    return value;
};

const Section = ({ title, children }) => (
    <section className="rounded-2xl border border-gray-100 bg-slate-50/50 p-4 sm:p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C3D2E]">
            {title}
        </h3>

        <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
            {children}
        </div>
    </section>
);

const Field = ({ label, value, wide = false }) => (
    <div className={wide ? "sm:col-span-2" : ""}>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-gray-800 break-words">
            {valueOrDash(value)}
        </p>
    </div>
);

const isFileUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

// Degree/registration certificates are stored as full URLs once uploaded -
// render those as an actual openable link instead of inert text so "view"
// really lets you view the file, not just see its name.
const FileField = ({ label, value, wide = false }) => {
    const values = Array.isArray(value) ? value : [value];
    const links = values.filter(isFileUrl);
    const fallback = values.filter((item) => item && !isFileUrl(item));

    return (
        <div className={wide ? "sm:col-span-2" : ""}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>
            {links.length || fallback.length ? (
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                    {links.map((url, index) => (
                        <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-[#F7931E] underline break-words"
                        >
                            {links.length > 1 ? `View file ${index + 1}` : "View file"}
                        </a>
                    ))}
                    {fallback.map((name, index) => (
                        <span key={`${name}-${index}`} className="text-sm font-semibold text-gray-800 break-words">
                            {name}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="mt-0.5 text-sm font-semibold text-gray-800">-</p>
            )}
        </div>
    );
};

export default function DoctorDetailsModal({ doctor, onClose, onEdit, onDelete }) {
    if (!doctor) return null;

    const bankDetails = doctor.bankDetails || {};
    const qualifications = Array.isArray(doctor.qualifications) ? doctor.qualifications : [];
    const degreeCertificates = Array.isArray(doctor.degreeCertificates) ? doctor.degreeCertificates : [];
    const profilePhotoName = typeof doctor.profilePhoto === "string" ? doctor.profilePhoto : doctor.profilePhoto?.name || "-";
    const govtIdDocumentName = typeof doctor.govtIdDocument === "string" ? doctor.govtIdDocument : doctor.govtIdDocument?.name || "-";
    const registrationCertificateName = typeof doctor.registrationCertificate === "string" ? doctor.registrationCertificate : doctor.registrationCertificate?.name || "-";

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs px-4 py-6 sm:px-6 sm:py-10 flex items-center justify-center">
            <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col border border-gray-100">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#F7931E]">
                            Veterinarian Profile
                        </p>

                        <h2 className="mt-0.5 text-2xl font-bold text-[#0C3D2E] tracking-tight">
                            {doctor.fullName || doctor.name || "Unnamed Veterinarian"}
                        </h2>

                        <p className="mt-0.5 text-xs font-semibold text-gray-400">
                            {doctor.displayId || doctor.id}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full hover:bg-orange-50 text-gray-400 hover:text-[#F7931E] flex items-center justify-center transition-colors font-bold text-sm"
                        aria-label="Close veterinarian details"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="grid gap-4">
                        <Section title="Overview">
                            <Field label="Status" value={doctor.status} />
                            <Field label="Mobile" value={doctor.mobile} />
                            <Field label="Email" value={doctor.email} />
                            <Field label="Practice" value={doctor.practiceType || doctor.practice} />
                            <Field label="Experience" value={doctor.experience} />
                        </Section>

                        <Section title="Personal Information">
                            <Field label="Gender" value={doctor.gender} />
                            <Field label="Date of Birth" value={formatDate(doctor.dob || doctor.dateOfBirth)} />
                            <Field label="Languages" value={doctor.languages} wide />
                            <Field label="Address" value={doctor.address} wide />
                            <Field label="City" value={doctor.city} />
                            <Field label="State" value={doctor.state} />
                            <Field label="PIN Code" value={doctor.pincode} />
                            <Field label="Profile Photo" value={profilePhotoName} wide />
                        </Section>

                        <Section title="Government ID">
                            <Field label="ID Type" value={doctor.govtIdType} />
                            <Field label="ID Number" value={doctor.govtIdNumber} />
                            <Field label="Document" value={govtIdDocumentName} wide />
                        </Section>

                        <Section title="Qualifications">
                            <Field label="Specializations" value={doctor.specializations} wide />
                            <Field label="Vet Council Number" value={doctor.vetCouncilRegistrationNumber} />
                            <Field label="State Council" value={doctor.stateVetCouncil} />
                            <Field label="Validity" value={formatDate(doctor.certificateValidityDate || doctor.certificateValidityRaw)} />
                            <Field label="Renewable" value={doctor.isRenewable} />
                            <FileField label="Registration Certificate" value={registrationCertificateName} wide />
                            <FileField label="Degree Certificates" value={degreeCertificates} wide />
                            <Field label="Qualifications" value={qualifications.map((qualification) => `${qualification.degree} - ${qualification.institution} (${qualification.year})`)} wide />
                        </Section>

                        <Section title="Practice">
                            <Field label="Practice Type" value={doctor.practiceType} />
                            <Field label="Consultation Fee" value={doctor.consultationFee ? `Rs. ${doctor.consultationFee}` : ""} />
                            <Field label="Emergency Available" value={doctor.emergencyAvailable} />
                            <Field label="Service Areas" value={doctor.serviceAreas || doctor.serviceAreasText} wide />
                            <Field label="GST / PAN" value={doctor.gstPan} />
                        </Section>

                        <Section title="Banking">
                            <Field label="Account Holder" value={bankDetails.accountName || doctor.accountName} />
                            <Field label="Account Number" value={bankDetails.accountNumber || doctor.accountNumber} />
                            <Field label="IFSC" value={bankDetails.ifsc || doctor.ifsc} />
                            <Field label="Bank Name" value={bankDetails.bankName || doctor.bankName} />
                            <Field label="Branch" value={bankDetails.branch || doctor.branch} />
                            <Field label="Plan" value={doctor.plan} />
                        </Section>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(doctor)}
                            className="w-full rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white sm:w-auto shadow-xs"
                        >
                            Delete
                        </button>
                    )}

                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(doctor)}
                            className="w-full rounded-xl border border-[#F7931E]/30 bg-[#FFF4E5] px-5 py-2.5 text-xs font-bold text-[#F7931E] transition hover:bg-[#F7931E] hover:text-white sm:w-auto shadow-xs"
                        >
                            Edit
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#0C3D2E] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#08281E] sm:w-auto shadow-xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}