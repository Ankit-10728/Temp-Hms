import { useState } from "react";

export default function GeneralSettings() {
    const [settings, setSettings] = useState({
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",
        currency: "INR (₹)",
        language: "English",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (saved) setSaved(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            console.log("General Settings:", settings);

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
                General Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Timezone */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Default Timezone
                    </label>

                    <select
                        name="timezone"
                        value={settings.timezone}
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
                        <option value="Asia/Kolkata">
                            Asia/Kolkata
                        </option>

                        <option value="Asia/Dubai">
                            Asia/Dubai
                        </option>

                        <option value="Europe/London">
                            Europe/London
                        </option>

                        <option value="America/New_York">
                            America/New_York
                        </option>
                    </select>
                </div>

                {/* Date Format */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Date Format
                    </label>

                    <select
                        name="dateFormat"
                        value={settings.dateFormat}
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
                        <option value="DD/MM/YYYY">
                            DD/MM/YYYY
                        </option>

                        <option value="MM/DD/YYYY">
                            MM/DD/YYYY
                        </option>

                        <option value="YYYY-MM-DD">
                            YYYY-MM-DD
                        </option>
                    </select>
                </div>

                {/* Currency */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Currency
                    </label>

                    <select
                        name="currency"
                        value={settings.currency}
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
                        <option value="INR (₹)">
                            INR (₹)
                        </option>

                        <option value="USD ($)">
                            USD ($)
                        </option>

                        <option value="EUR (€)">
                            EUR (€)
                        </option>

                        <option value="GBP (£)">
                            GBP (£)
                        </option>
                    </select>
                </div>

                {/* Language */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Default Language
                    </label>

                    <select
                        name="language"
                        value={settings.language}
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
                        <option value="English">
                            English
                        </option>

                        <option value="Hindi">
                            Hindi
                        </option>

                        <option value="Spanish">
                            Spanish
                        </option>

                        <option value="French">
                            French
                        </option>
                    </select>
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
                    {isSaving ? "Saving..." : "Save Settings"}
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