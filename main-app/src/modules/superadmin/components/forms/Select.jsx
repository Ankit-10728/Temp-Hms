export default function Select({
    label,
    options = [],
    requiredField = false,
    error = "",
    ...props
}) {
    const hasError = Boolean(error);

    return (
        <div className="w-full">
            <label className={`text-sm font-medium ${hasError ? "text-red-600" : "text-slate-700"}`}>
                {label}
                {requiredField && (
                    <span className="text-red-500"> *</span>
                )}
            </label>

            <select
                {...props}
                required={requiredField}
                value={props.value ?? ""}
                aria-invalid={hasError}
                className={`
                    w-full
                    mt-1
                    px-3
                    py-2.5
                    text-sm md:text-base
                    border
                    rounded-xl
                    outline-none
                    transition
                    ${hasError
                        ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                        : "border-slate-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    }
                `}
            >
                <option value="">Select</option>

                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>

            {hasError && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
