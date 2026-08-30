export default function Card({ title, children }) {
    return (
        <div
            className="
                bg-white
                p-4 sm:p-6
                rounded-2xl
                shadow-sm
                border
                border-gray-200
                w-full
            "
        >
            {title && (
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                    {title}
                </h2>
            )}

            {children}
        </div>
    );
}