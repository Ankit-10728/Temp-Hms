import React, { useState } from "react";

export default function SecuritySettings() {
    const [settings, setSettings] = useState({
        twoFactorAuth: true,
        passwordPolicy: true,
        ipWhitelisting: false,
        sessionTimeout: 30,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleToggle = (field) => {
        setSettings((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));

        if (saved) setSaved(false);
    };

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

            console.log("Security Settings:", settings);

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

    const Toggle = ({ enabled, onChange }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${
                enabled ? "bg-orange-500" : "bg-gray-300"
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                    enabled ? "translate-x-8" : "translate-x-1"
                }`}
            />
        </button>
    );

    return (
        <div className="bg-white border rounded-2xl p-4 md:p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-6">
                Security Settings
            </h2>

            <div className="divide-y">

                {/* 2FA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5">
                    <div>
                        <h3 className="font-medium text-base">
                            Two-Factor Authentication
                        </h3>

                        <p className="text-sm text-gray-500">
                            Require 2FA for all admin accounts
                        </p>
                    </div>

                    <Toggle
                        enabled={settings.twoFactorAuth}
                        onChange={() =>
                            handleToggle("twoFactorAuth")
                        }
                    />
                </div>

                {/* Password Policy */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5">
                    <div>
                        <h3 className="font-medium text-base">
                            Password Policy
                        </h3>

                        <p className="text-sm text-gray-500">
                            Enforce strong password requirements
                        </p>
                    </div>

                    <Toggle
                        enabled={settings.passwordPolicy}
                        onChange={() =>
                            handleToggle("passwordPolicy")
                        }
                    />
                </div>

                {/* IP Whitelisting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5">
                    <div>
                        <h3 className="font-medium text-base">
                            IP Whitelisting
                        </h3>

                        <p className="text-sm text-gray-500">
                            Restrict access to specific IPs
                        </p>
                    </div>

                    <Toggle
                        enabled={settings.ipWhitelisting}
                        onChange={() =>
                            handleToggle("ipWhitelisting")
                        }
                    />
                </div>

            </div>

            {/* Session Timeout */}
            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                    Session Timeout (minutes)
                </label>

                <input
                    type="number"
                    min="1"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="
                        w-full
                        sm:max-w-xs
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

            {/* Save Button */}
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
                        : "Save Security Settings"}
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