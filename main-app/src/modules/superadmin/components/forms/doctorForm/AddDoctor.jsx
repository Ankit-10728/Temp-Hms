import { useState } from "react";

import VeterinarianHeader from "../VeterinarianHeader";
import DoctorModal from "./DoctorModal";

export default function AddDoctorModal({ onCreated }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-0 py-8 space-y-6">

            {/* HEADER */}
            <VeterinarianHeader onAdd={() => setOpen(true)} />

            {/* MODAL */}
            {open && (
                <DoctorModal
                    onClose={() => setOpen(false)}
                    onCreated={onCreated}
                />
            )}

        </div>
    );
}
