import React, { useState } from "react";

export default function BrandingTab() {
    const [form, setForm] = useState({
        platformName: "PAHMS",
        tagline: "Pet & Animal Healthcare Management System",
        supportEmail: "support@pahms.com",
        logo: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleFile = (e) => {
        setForm({
            ...form,
            logo: e.target.files[0],
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Branding Data:", form);
    };

    /* UI Components */

    const Card = ({ title, children }) => (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow border border-gray-200">
            <h2 className="text-md font-semibold mb-4 md:mb-6">
                {title}
            </h2>
            {children}
        </div>
    );

    const Grid = ({ children }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    );

    const Full = ({ children }) => (
        <div className="md:col-span-2">
            {children}
        </div>
    );

    const Input = ({ label, ...props }) => (
        <div>
            <label className="text-sm text-gray-600">
                {label}
            </label>

            <input
                {...props}
                className="
                    w-full
                    border
                    border-gray-300
                    px-3
                    py-2
                    rounded-xl
                    mt-1
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                "
            />
        </div>
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full"
        >
            <Card title="Branding Settings">
                <Grid>

                    <Input
                        label="Platform Name"
                        name="platformName"
                        value={form.platformName}
                        onChange={handleChange}
                    />

                    <Input
                        label="Tagline"
                        name="tagline"
                        value={form.tagline}
                        onChange={handleChange}
                    />

                    <Input
                        label="Support Email"
                        name="supportEmail"
                        value={form.supportEmail}
                        onChange={handleChange}
                    />

                    {/* Upload */}

                    <Full>
                        <label className="text-sm text-gray-600">
                            Logo Upload
                        </label>

                        <label
                            className="
                                border-2
                                border-dashed
                                border-gray-300
                                rounded-2xl
                                mt-2
                                p-6
                                md:p-10
                                flex
                                flex-col
                                items-center
                                justify-center
                                text-center
                                cursor-pointer
                                hover:border-orange-400
                                transition
                            "
                        >
                            <p className="text-sm md:text-base text-gray-500">
                                Drag and drop your logo or click to browse
                            </p>

                            <p className="text-xs text-gray-400 mt-2">
                                PNG, JPG up to 2MB
                            </p>

                            <p className="text-xs text-gray-400">
                                Recommended: 200×60px
                            </p>

                            {form.logo && (
                                <p className="mt-3 text-sm text-green-600 font-medium">
                                    {form.logo.name}
                                </p>
                            )}

                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFile}
                            />
                        </label>
                    </Full>

                </Grid>

                {/* Save Button */}

                <div className="mt-6">
                    <button
                        type="submit"
                        className="
                            w-full
                            sm:w-auto
                            bg-orange-500
                            hover:bg-orange-600
                            text-white
                            px-6
                            py-3
                            rounded-xl
                            shadow-sm
                            transition
                        "
                    >
                        Save Branding
                    </button>
                </div>
            </Card>
        </form>
    );
}