import { Stethoscope } from "lucide-react";

export default function Header({ title, subtitle, icon: IconComponent = Stethoscope }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-[#D9E8E3]/30 p-[20px] md:p-[24px] rounded-[16px] border border-[#0C3D2E]/15 shadow-sm transition-all duration-200 mb-6">
      <div className="flex items-center gap-[16px]">
        <div className="w-[48px] h-[48px] rounded-[12px] bg-[#0C3D2E] text-white flex items-center justify-center shrink-0">
          <IconComponent className="w-[22px] h-[22px]" />
        </div>
        <div>
          <h1 className="text-[20px] md:text-[24px] font-[900] tracking-tight text-[#0C3D2E]">
            {title}
          </h1>
          <p className="text-[12px] md:text-[14px] font-[600] text-[#0C3D2E]/70 mt-[2px]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}