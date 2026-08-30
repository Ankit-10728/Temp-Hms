import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import AddDoctor from "../components/forms/doctorForm/AddDoctor";
import DoctorDetailsModal from "../components/forms/doctorForm/DoctorDetailsModal";
import DoctorModal from "../components/forms/doctorForm/DoctorModal";
import DoctorsTable from "../components/DoctorsTable";
import { deleteDoctor, getDoctors, updateDoctorStatus } from "../api/doctorApi";
import { showToast } from "../../../shared/components/toast";

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewDoctor, setViewDoctor] = useState(null);
    const [editDoctor, setEditDoctor] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState("");

    const loadDoctors = useCallback(async (query = "") => {
        setLoading(true);
        setError("");

        try {
            const response = await getDoctors(query ? { search: query } : {});
            const records = Array.isArray(response.data) ? response.data : [];
            setDoctors(records);
        } catch (err) {
            setDoctors([]);
            setError(
                err.response?.data?.message ||
                "Unable to load veterinarians right now."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        loadDoctors(searchTerm);
    }, [loadDoctors, searchTerm]);

    const handleCreated = () => {
        loadDoctors(searchTerm);
    };

    const handleViewDoctor = (doctor) => {
        setEditDoctor(null);
        setViewDoctor(doctor);
    };

    const handleEditDoctor = (doctor) => {
        setViewDoctor(null);
        setEditDoctor(doctor);
    };

    const handleDeleteDoctor = async (doctor) => {
        if (!doctor?.id) return;

        const confirmed = window.confirm(
            `Delete veterinarian ${doctor.name}? This will remove the record from the registry.`
        );

        if (!confirmed) return;

        try {
            await deleteDoctor(doctor.id);
            showToast({
                type: "success",
                title: "Veterinarian deleted",
                description: `${doctor.name} was removed from the registry.`,
            });
            setViewDoctor((current) => (current?.id === doctor.id ? null : current));
            setEditDoctor((current) => (current?.id === doctor.id ? null : current));
            loadDoctors(searchTerm);
        } catch (err) {
            showToast({
                type: "error",
                title: "Delete failed",
                description:
                    err.response?.data?.message ||
                    "Unable to delete the veterinarian right now.",
            });
        }
    };

    const handleDoctorSaved = () => {
        setEditDoctor(null);
        loadDoctors(searchTerm);
    };

    const handleStatusChange = async (doctor, status) => {
        if (!doctor?.id || status === doctor.veterinarianStatus) return;
        setUpdatingStatusId(doctor.id);
        try {
            const response = await updateDoctorStatus(doctor.id, status);
            const updatedDoctor = response.data;
            setDoctors((current) => current.map((item) => item.id === doctor.id ? updatedDoctor : item));
            showToast({
                type: "success",
                title: "Veterinarian Status Updated",
                description: `${doctor.name} is now ${updatedDoctor.status}.`,
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Status Update Failed",
                description: err.response?.data?.message || "Unable to update veterinarian status.",
            });
        } finally {
            setUpdatingStatusId("");
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* VETERINARIAN HEADER */}
            <AddDoctor onCreated={handleCreated} />

            {/* SEARCH & FILTER BAR WITH ORANGE STATS CARD BG (PRESERVED ORIGINAL TEXT STYLES) */}
            <div className="rounded-2xl border border-[#F7931E]/30 bg-[#FFF4E5] px-5 py-4 shadow-xs sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#0C3D2E] tracking-tight">
                            Live Veterinarian Registry
                        </h2>

                        <p className="mt-0.5 text-xs md:text-sm font-medium text-gray-400">
                            Search and manage veterinarians synced from the backend.
                        </p>
                    </div>

                    <div className="w-full sm:max-w-sm">
                        <label htmlFor="veterinarian-search" className="sr-only">
                            Search veterinarians
                        </label>

                        <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 transition-all focus-within:border-[#F7931E] focus-within:ring-1 focus-within:ring-[#F7931E] shadow-2xs">
                            <Search size={18} className="text-gray-400 shrink-0" />

                            <input
                                id="veterinarian-search"
                                type="search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search by name, mobile, city, or specialization..."
                                className="w-full bg-transparent text-xs sm:text-sm font-medium outline-none text-gray-800 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* DOCTORS TABLE */}
            <DoctorsTable
                doctors={doctors}
                loading={loading}
                error={error}
                onRefresh={() => loadDoctors(searchTerm)}
                onView={handleViewDoctor}
                onEdit={handleEditDoctor}
                onDelete={handleDeleteDoctor}
                onStatusChange={handleStatusChange}
                updatingStatusId={updatingStatusId}
            />

            {/* VIEW DETAILS MODAL */}
            {viewDoctor && (
                <DoctorDetailsModal
                    doctor={viewDoctor}
                    onClose={() => setViewDoctor(null)}
                    onEdit={(doctor) => {
                        setViewDoctor(null);
                        setEditDoctor(doctor);
                    }}
                    onDelete={handleDeleteDoctor}
                />
            )}

            {/* EDIT MODAL */}
            {editDoctor && (
                <DoctorModal
                    mode="edit"
                    doctor={editDoctor}
                    onClose={() => setEditDoctor(null)}
                    onSaved={handleDoctorSaved}
                />
            )}
        </div>
    );
}