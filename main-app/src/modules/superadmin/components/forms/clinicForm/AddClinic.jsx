import { useState } from "react";
import { ClinicModal, ClinicHeader } from "../../index.js";

export default function ClinicPage() {
    const [open, setOpen] = useState(false);

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-[calc(100vh-4.375rem)]">

            {/* HEADER */}
            <ClinicHeader 
                onAdd={() => {
                    console.log("CLICK WORKING");
                    setOpen(true);
                }} 
            />

            {/* MODAL */}
            {open && <ClinicModal onClose={() => setOpen(false)} />}

        </div>
    );
}