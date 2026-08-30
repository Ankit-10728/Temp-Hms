import React, { useState } from "react";

export default function EmailTemplates() {
    const [templates, setTemplates] = useState([
        {
            id: 1,
            title: "Welcome Email",
            desc: "Customize the welcome email sent to users",
            subject: "Welcome 🎉",
            body: "Hello {{name}}, welcome!",
        },
        {
            id: 2,
            title: "Approval Email",
            desc: "Customize the approval email sent to users",
            subject: "Approved ✅",
            body: "Your account is approved.",
        },
        {
            id: 3,
            title: "Rejection Email",
            desc: "Customize the rejection email sent to users",
            subject: "Application Rejected ❌",
            body: "Hello {{name}}, unfortunately your application was not approved.",
        },
        {
            id: 4,
            title: "Subscription Expiry",
            desc: "Customize the subscription expiry sent to users",
            subject: "Subscription Expiring Soon ⏰",
            body: "Hello {{name}}, your subscription will expire on {{expiryDate}}.",
        },
        {
            id: 5,
            title: "Password Reset",
            desc: "Customize the password reset sent to users",
            subject: "Reset Your Password 🔑",
            body: "Hello {{name}}, click the link below to reset your password:\n\n{{resetLink}}",
        },
    ]);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState({
        subject: "",
        body: "",
    });

    const handleEdit = (item) => {
        setSelected(item);

        setForm({
            subject: item.subject,
            body: item.body,
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
            <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="font-semibold text-lg mb-6">
                    Email Templates
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
                                onClick={() => handleEdit(item)}
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
                                Edit Template
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4">
                    <div
                        className="
                            bg-white
                            w-full
                            max-w-3xl
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
                                Edit {selected?.title}
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="p-4 md:p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Subject
                                    </label>

                                    <input
                                        type="text"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder="Enter email subject"
                                        className="
                                            w-full
                                            px-3
                                            py-2
                                            border
                                            rounded-xl
                                            outline-none
                                            focus:ring-2
                                            focus:ring-orange-400
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Email Body
                                    </label>

                                    <textarea
                                        name="body"
                                        rows={10}
                                        value={form.body}
                                        onChange={handleChange}
                                        placeholder="Enter email body"
                                        className="
                                            w-full
                                            px-3
                                            py-2
                                            border
                                            rounded-xl
                                            outline-none
                                            focus:ring-2
                                            focus:ring-orange-400
                                        "
                                    />
                                </div>
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