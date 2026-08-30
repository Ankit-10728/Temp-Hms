import { Phone } from "lucide-react";
import countryCodes, { DEFAULT_COUNTRY_CODE } from "../constants/countryCodes";

// Dial-code select + a 10-digit national number field, matching the
// digits-only/10-char pattern already used everywhere else in this
// codebase (Login, StaffEnrollment, ClinicForm, DoctorForm). `onChange`
// receives the combined value as `{ dialCode, digits, full }`.
export default function PhoneInput({
  dialCode = DEFAULT_COUNTRY_CODE,
  digits = "",
  onChange,
  error,
  className = "",
  placeholder = "Phone number",
}) {
  const emit = (nextDialCode, nextDigits) => {
    onChange?.({
      dialCode: nextDialCode,
      digits: nextDigits,
      full: `${nextDialCode}${nextDigits}`,
    });
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <select
          value={dialCode}
          onChange={(e) => emit(e.target.value, digits)}
          className="rounded-xl border border-slate-200 px-2 py-3 text-sm"
        >
          {countryCodes.map((country) => (
            <option key={`${country.iso}-${country.dialCode}`} value={country.dialCode}>
              {country.dialCode} {country.iso}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            inputMode="numeric"
            value={digits}
            onChange={(e) => {
              const nextDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
              emit(dialCode, nextDigits);
            }}
            placeholder={placeholder}
            className={`w-full rounded-xl pl-10 pr-4 py-3 ${
              error ? "border border-red-500" : "border border-slate-200"
            }`}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
