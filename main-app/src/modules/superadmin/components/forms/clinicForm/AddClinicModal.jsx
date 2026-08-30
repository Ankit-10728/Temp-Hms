import { useState } from "react";

import ClinicModal from "./ClinicModal";
import ClinicHeader from "../ClinicHeader";

export default function AddClinicModal() {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <ClinicHeader onAdd={() => setOpen(true)} />

            {/* MODAL */}
            {open && <ClinicModal onClose={() => setOpen(false)} />}
        </div>
    );
}