export default function Loader({ size = 54 }) {
    return (
        <svg
            className="animate-spin"
            width={size}
            height={size}
            viewBox="0 0 50 50"
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#F5D2BB"
                strokeWidth="4"
            />

            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#E8630A"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="95"
                strokeDashoffset="70"
            />
        </svg>
    );
}