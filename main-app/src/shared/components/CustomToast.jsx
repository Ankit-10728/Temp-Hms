import { X, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function CustomToast({
    t,
    type = "success",
    title,
    description,
    duration = 4000,
}) {
    const isSuccess = type === "success";
    const [width, setWidth] = useState(100);

    useEffect(() => {
        let start = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const percent = Math.max(100 - (elapsed / duration) * 100, 0);
            setWidth(percent);

            if (percent <= 0) {
                clearInterval(interval);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div
            className={`
        relative overflow-hidden
        w-95
        rounded-[18px]
        px-5 py-4
        flex gap-4
        shadow-[0_10px_25px_rgba(0,0,0,0.15)]
        ${isSuccess ? "bg-[#BFE7C8]" : "bg-[#FDE2E2]"}
      `}
        >

            <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10">
                <div
                    className={`h-full ${isSuccess ? "bg-green-600" : "bg-red-600"
                        } transition-all`}
                    style={{ width: `${width}%` }}
                />
            </div>


            <div className="absolute -bottom-8 -left-5 w-20 h-20 rounded-full bg-white/15" />


            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    {isSuccess ? (
                        <Check
                            className="w-7 h-7 text-green-600"
                            strokeWidth={3}
                        />
                    ) : (

                        <AlertCircle
                            className=" text-red-600 bg-red-100 w-full h-full rounded-full"
                            strokeWidth={3}
                        />
                    )}
                </div>
            </div>

            {/* Text */}
            <div className="flex-1">
                <h3 className="font-semibold text-[15px]">{title}</h3>
                <p className="text-[13px] text-slate-600 mt-1">
                    {description}
                </p>
            </div>

            {/* Close */}
            <button
                onClick={() => toast.dismiss(t.id)}
                className="text-black/30 hover:text-black/60"
            >
                <X size={18} />
            </button>
        </div>
    );
}