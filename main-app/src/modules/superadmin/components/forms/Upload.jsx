import { useEffect, useMemo } from "react";

export default function Upload({
    label,
    requiredField = false,
    value,
    onChange,
    onRemove,
    accept = ".pdf,application/pdf",
    error = "",
}) {
    const hasError = Boolean(error);
    const fileName = typeof value === "string" ? value : value?.name || "";
    const previewUrl = useMemo(() => {
        if (!value || typeof value === "string" || !value.type?.startsWith("image/")) return "";
        return URL.createObjectURL(value);
    }, [value]);
    const isImage = Boolean(previewUrl);

    useEffect(() => {
        if (!previewUrl) return undefined;

        return () => URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    return (
        <div className="w-full">
            <label className={`block mb-2 text-xs sm:text-sm font-semibold uppercase tracking-wider ${hasError ? "text-red-600" : "text-gray-600"}`}>
                {label}
                {requiredField && (
                    <span className="text-red-600 ml-1">*</span>
                )}
            </label>

            <label
                className={`
                    w-full
                    min-h-[48px] sm:min-h-[52px]
                    border-2
                    border-dashed
                    rounded-lg sm:rounded-xl
                    bg-white
                    transition-all
                    duration-200
                    cursor-pointer
                    flex
                    items-center
                    justify-center
                    px-3 sm:px-4
                    py-2 sm:py-3
                    ${hasError
                        ? "border-red-500 bg-red-50/30 hover:bg-red-50/50"
                        : "border-gray-300 hover:border-orange-500 hover:bg-orange-50/20"
                    }
                `}
            >
                {!value ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
                            />
                        </svg>

                        <span className="text-xs sm:text-sm font-medium">
                            Upload File
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isImage && (
                                <img
                                    src={previewUrl}
                                    alt="preview"
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border border-gray-200"
                                />
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-xs sm:text-sm font-semibold text-green-600">
                                    {fileName}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onRemove && onRemove();
                            }}
                            className="
                                text-red-500
                                hover:text-red-700
                                text-lg sm:text-xl
                                font-bold
                                flex-shrink-0
                                transition-colors
                            "
                            aria-label={`Remove ${label}`}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={onChange}
                />
            </label>

            {hasError && (
                <p className="mt-1.5 text-xs sm:text-sm font-semibold text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
