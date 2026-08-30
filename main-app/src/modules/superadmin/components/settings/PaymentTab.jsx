import React, { useState } from "react";

export default function PaymentGatewaySettings() {
    const [formData, setFormData] = useState({
        provider: "Razorpay",
        apiKey: "",
        secretKey: "",
        gstRate: "18",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (saved) setSaved(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            console.log("Payment Settings:", formData);

            await new Promise((resolve) =>
                setTimeout(resolve, 1000)
            );

            setSaved(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-6">
                Payment Gateway
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Gateway Provider */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Gateway Provider
                    </label>

                    <select
                        name="provider"
                        value={formData.provider}
                        onChange={handleChange}
                        className="
                            w-full
                            px-4
                            py-3
                            border
                            rounded-xl
                            focus:ring-2
                            focus:ring-orange-400
                            outline-none
                        "
                    >
                        <option value="Razorpay">
                            Razorpay
                        </option>

                        <option value="Stripe">
                            Stripe
                        </option>

                        <option value="PayU">
                            PayU
                        </option>
                    </select>
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        API Key
                    </label>

                    <input
                        type="text"
                        name="apiKey"
                        value={formData.apiKey}
                        onChange={handleChange}
                        placeholder="Enter API key"
                        className="
                            w-full
                            px-4
                            py-3
                            border
                            rounded-xl
                            focus:ring-2
                            focus:ring-orange-400
                            outline-none
                        "
                    />
                </div>

                {/* Secret Key */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Secret Key
                    </label>

                    <input
                        type="password"
                        name="secretKey"
                        value={formData.secretKey}
                        onChange={handleChange}
                        placeholder="Enter secret key"
                        className="
                            w-full
                            px-4
                            py-3
                            border
                            rounded-xl
                            focus:ring-2
                            focus:ring-orange-400
                            outline-none
                        "
                    />
                </div>

                {/* GST Rate */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        GST Rate (%)
                    </label>

                    <input
                        type="number"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleChange}
                        placeholder="Enter GST rate"
                        className="
                            w-full
                            px-4
                            py-3
                            border
                            rounded-xl
                            focus:ring-2
                            focus:ring-orange-400
                            outline-none
                        "
                    />
                </div>

            </div>

            {/* Save Section */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="
                        w-full
                        sm:w-auto
                        px-5
                        py-3
                        bg-orange-500
                        text-white
                        rounded-xl
                        hover:bg-orange-600
                        disabled:opacity-60
                        transition
                    "
                >
                    {isSaving
                        ? "Saving..."
                        : "Save Payment Settings"}
                </button>

                {saved && (
                    <span className="text-sm text-green-600">
                        Settings saved successfully
                    </span>
                )}
            </div>
        </div>
    );
}