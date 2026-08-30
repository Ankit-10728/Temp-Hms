function UploadBox({
    label,
    helperText = "Recommended size: 600×600px square ratio",
}) {
    return (
        <div className="w-full">
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                {label}
            </label>

            <label
                className="
                    border-2
                    border-dashed
                    border-[#d6dbe1]
                    rounded-2xl
                    md:rounded-[24px]
                    p-6
                    sm:p-8
                    md:p-12
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    bg-[#fafafa]
                    hover:border-orange-400
                    transition-all
                    cursor-pointer
                    min-h-[220px]
                "
            >
                <div
                    className="
                        w-12 h-12
                        sm:w-14 sm:h-14
                        rounded-full
                        border
                        border-orange-200
                        bg-orange-50
                        flex
                        items-center
                        justify-center
                        mb-4
                    "
                >
                    <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>

                <p className="text-slate-700 font-medium text-sm sm:text-base">
                    Drag & Drop or{" "}
                    <span className="text-orange-500 underline">
                        Browse files
                    </span>
                </p>

                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
                    {helperText}
                </p>

                <input
                    type="file"
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default UploadBox;