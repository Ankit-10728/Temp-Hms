import React, { useState } from "react";

import BrandingTab from "../components/settings/BrandingTab";
import EmailTab from "../components/settings/EmailTab";
import GeneralTab from "../components/settings/GeneralTab";
import PaymentTab from "../components/settings/PaymentTab";
import SecurityTab from "../components/settings/SecurityTab";
import SmsTab from "../components/settings/SmsTab";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("branding");

    const tabs = [
        ["branding", "Branding"],
        ["email", "Email"],
        ["sms", "SMS & WhatsApp"],
        ["payment", "Payment"],
        ["security", "Security"],
        ["general", "General"],
    ];

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-xl md:text-2xl font-semibold">
                    System Settings
                </h1>

                <p className="text-gray-500 text-sm md:text-base mb-4">
                    Platform configuration and preferences
                </p>

                {/* Responsive Tabs */}
                <div className="overflow-x-auto mb-6">
                    <div className="flex gap-2 bg-gray-200 p-1 rounded-xl w-max min-w-full md:min-w-0 md:w-fit">
                        {tabs.map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`
                                    whitespace-nowrap
                                    px-4 py-2
                                    rounded-xl
                                    text-sm
                                    transition
                                    ${activeTab === key
                                        ? "bg-white shadow text-black"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }
                                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="w-full">
                    {activeTab === "branding" && <BrandingTab />}
                    {activeTab === "email" && <EmailTab />}
                    {activeTab === "sms" && <SmsTab />}
                    {activeTab === "payment" && <PaymentTab />}
                    {activeTab === "security" && <SecurityTab />}
                    {activeTab === "general" && <GeneralTab />}
                </div>

            </div>
        </div>
    );
}
