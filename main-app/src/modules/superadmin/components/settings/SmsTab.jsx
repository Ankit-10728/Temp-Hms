import React, { useState } from "react";

export default function SmsWhatsappTemplates() {
    const [templates, setTemplates] = useState([
        {
            id: 1,
            title: "OTP Verification",
            desc: "Configure OTP verification template",
            message:
                "Your OTP is {{otp}}. Please do not share it with anyone.",
        },
        {
            id: 2,
            title: "Appointment Reminder",
            desc: "Configure appointment reminder template",
            message:
                "Hello {{name}}, this is a reminder for your appointment on {{date}} at {{time}}.",
        },
        {
            id: 3,
            title: "Payment Confirmation",
            desc: "Configure payment confirmation template",
            message:
                "Your payment of ₹{{amount}} has been received successfully.",
        },
        {
            id: 4,
            title: "Subscription Renewal",
            desc: "Configure subscription renewal template",
            message:
                "Hello {{name}}, your subscription will renew on {{renewalDate}}.",
        },
    ]);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState({
        message: "",
    });

    const handleConfigure = (template) => {
        setSelected(template);

        setForm({
            message: template.message,
        });

        setOpen(true);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = () => {
        const updatedTemplates = templates.map((template) =>
            template.id === selected.id
                ? { ...template, ...form }
                : template
        );

        setTemplates(updatedTemplates);
        setOpen(false);
    };

    return (
        <>
            {/* TEMPLATE LIST */}

            <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-6">
                    SMS & WhatsApp Templates
                </h2>

                <div className="divide-y">
                    {templates.map((item) => (
                        <div
                            key={item.id}
                            className="
                                py-5
                                flex
                                flex-col
                                gap-4
                                md:flex-row
                                md:items-center
                                md:justify-between
                            "
                        >
                            <div className="min-w-0">
                                <h3 className="font-medium text-gray-900">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {item.desc}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleConfigure(item)}
                                className="
                                    w-full
                                    md:w-auto
                                    px-4
                                    py-2
                                    border
                                    border-orange-500
                                    text-orange-500
                                    rounded-xl
                                    hover:bg-orange-50
                                    transition
                                "
                            >
                                Configure
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}

            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div
                        className="
                            bg-white
                            w-full
                            max-w-2xl
                            rounded-2xl
                            shadow-xl
                            flex
                            flex-col
                            max-h-[95vh]
                        "
                    >
                        {/* Header */}

                        <div className="p-4 md:p-6 border-b">
                            <h2 className="text-lg md:text-xl font-semibold">
                                Configure {selected?.title}
                            </h2>
                        </div>

                        {/* Body */}

                        <div className="p-4 md:p-6 overflow-y-auto flex-1">
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={10}
                                placeholder="Enter SMS / WhatsApp template..."
                                className="
                                    w-full
                                    px-3
                                    py-2
                                    border
                                    rounded-xl
                                    focus:ring-2
                                    focus:ring-orange-400
                                    outline-none
                                "
                            />

                            <div className="mt-3 text-xs text-gray-500 break-words">
                                Available variables:
                                {" {{name}}, {{otp}}, {{date}}, {{time}}, {{amount}}, {{renewalDate}}"}
                            </div>
                        </div>

                        {/* Footer */}

                        <div className="p-4 md:p-6 border-t">
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="
                                        w-full
                                        sm:w-auto
                                        px-4
                                        py-2
                                        border
                                        rounded-xl
                                        hover:bg-gray-50
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="
                                        w-full
                                        sm:w-auto
                                        px-5
                                        py-2
                                        bg-orange-500
                                        text-white
                                        rounded-xl
                                        hover:bg-orange-600
                                    "
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}