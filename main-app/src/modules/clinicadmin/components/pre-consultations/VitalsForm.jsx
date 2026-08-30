import { useEffect } from "react";

const getLoggedInStaffName = () => {
  try {
    // 1. Direct local/session storage name keys
    const directName =
      localStorage.getItem("userName") ||
      localStorage.getItem("staffName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("fullName") ||
      sessionStorage.getItem("userName") ||
      sessionStorage.getItem("staffName") ||
      sessionStorage.getItem("name");
    if (directName && directName.trim()) return directName.trim();

    // 2. Parsed JSON objects in localStorage / sessionStorage
    const userKeys = ["user", "userData", "userInfo", "staff", "staffData", "profile", "auth", "currentUser"];
    for (const key of userKeys) {
      const stored = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const name =
            parsed.name ||
            parsed.fullName ||
            parsed.personalInfo?.fullName ||
            parsed.staffName ||
            parsed.username ||
            parsed.nameEn ||
            parsed.user?.name ||
            parsed.user?.fullName;
          if (name && name.trim()) return name.trim();
        } catch (_) {}
      }
    }

    // 3. JWT Token Payload Decoding
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && token.includes(".")) {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const decoded = JSON.parse(jsonPayload);
        const tokenName =
          decoded.name ||
          decoded.fullName ||
          decoded.staffName ||
          decoded.userName ||
          decoded.username ||
          decoded.user_name ||
          decoded.sub;
        if (tokenName && !tokenName.includes("@") && tokenName.length < 50) return tokenName.trim();
        if (decoded.email) {
          const nameFromEmail = decoded.email.split("@")[0].replace(/[._-]/g, " ");
          return nameFromEmail.replace(/\b\w/g, (l) => l.toUpperCase()).trim();
        }
      }
    }

    // 4. Stored Email in localStorage or sessionStorage
    const email = localStorage.getItem("userEmail") || localStorage.getItem("email") || sessionStorage.getItem("userEmail");
    if (email) {
      const nameFromEmail = email.split("@")[0].replace(/[._-]/g, " ");
      return nameFromEmail.replace(/\b\w/g, (l) => l.toUpperCase()).trim();
    }

    // 5. Role fallback formatted as title
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (role) {
      return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()).trim();
    }
  } catch (e) {
    console.warn("Failed to extract staff name:", e);
  }
  return "Duty Staff";
};

// Strips everything except digits (and, if allowed, a single decimal point),
// then caps the integer part to `maxIntDigits` digits and the decimal part
// to 1 digit - this is what actually blocks garbage like "0-1-09643..." at
// the keystroke level instead of only after Number() parsing.
const sanitizeNumeric = (value, { allowDecimal = false, maxIntDigits = 3 } = {}) => {
  let cleaned = value.replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");

  if (allowDecimal) {
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
    }
  }

  const [intPart, decPart] = cleaned.split(".");
  const truncatedInt = intPart.slice(0, maxIntDigits);
  return decPart !== undefined ? `${truncatedInt}.${decPart.slice(0, 1)}` : truncatedInt;
};

const NUMERIC_FIELD_RULES = {
  bodyTemperature: { allowDecimal: true, maxIntDigits: 3, max: 120 },
  heartRate: { allowDecimal: false, maxIntDigits: 3, max: 300 },
  respiratoryRate: { allowDecimal: false, maxIntDigits: 3, max: 300 },
  spo2: { allowDecimal: false, maxIntDigits: 3, max: 100 },
  bodyWeight: { allowDecimal: true, maxIntDigits: 3, max: 200 },
};

export default function VitalsForm({ formData, setFormData }) {
  useEffect(() => {
    // Auto fill recordedBy strictly from logged in staff name if empty
    if (!formData.recordedBy) {
      const staffName = getLoggedInStaffName();
      setFormData((prev) => ({ ...prev, recordedBy: staffName }));
    }

    // Auto set vitalsRecordedAt if empty
    if (!formData.vitalsRecordedAt) {
      setFormData((prev) => ({ ...prev, vitalsRecordedAt: new Date().toISOString() }));
    }
  }, [formData.recordedBy]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "bcs") {
      let numVal = value === "" ? "" : Number(value);
      if (typeof numVal === "number" && numVal > 9) numVal = 9;
      setFormData((prev) => ({ ...prev, bcs: numVal }));
      return;
    }

    const rule = NUMERIC_FIELD_RULES[name];
    if (!rule) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    let cleaned = sanitizeNumeric(value, rule);

    // Only clamp the upper bound once the value is a complete number -
    // clamping mid-decimal-entry (e.g. "98.") would fight the user's typing.
    if (cleaned !== "" && !cleaned.endsWith(".")) {
      const numVal = Number(cleaned);
      if (numVal > rule.max) cleaned = String(rule.max);
    }

    setFormData((prev) => ({ ...prev, [name]: cleaned }));
  };

  const handleUnitChange = (e) => {
    setFormData((prev) => ({ ...prev, bodyTemperatureUnit: e.target.value }));
  };

  return (
    <div>
      <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8">
        Vitals Information
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Body Temperature */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Body Temperature
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              name="bodyTemperature"
              value={formData.bodyTemperature}
              onChange={handleChange}
              placeholder="Enter Temperature"
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
            <select
              value={formData.bodyTemperatureUnit || "F"}
              onChange={handleUnitChange}
              className="shrink-0 w-20 border border-slate-200 rounded-2xl px-2 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
            >
              <option value="F">°F</option>
              <option value="C">°C</option>
            </select>
          </div>
        </div>

        {/* Heart Rate */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Heart Rate (bpm)
          </label>

          <input
            type="text"
            inputMode="numeric"
            name="heartRate"
            value={formData.heartRate}
            onChange={handleChange}
            placeholder="Enter Heart Rate"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* Respiratory Rate */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Respiratory Breath (Breaths/min)
          </label>

          <input
            type="text"
            inputMode="numeric"
            name="respiratoryRate"
            value={formData.respiratoryRate}
            onChange={handleChange}
            placeholder="Enter Respiratory Rate"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* Blood Pressure */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Blood Pressure (mmHg)
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Systolic
              </label>

              <select
                value={formData.bloodPressure?.systolic || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...(prev.bloodPressure || {}),
                      systolic: e.target.value,
                    },
                  }))
                }
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              >
                <option value="">Select</option>
                {Array.from({ length: 121 }, (_, i) => i + 80).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Diastolic
              </label>

              <select
                value={formData.bloodPressure?.diastolic || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bloodPressure: {
                      ...(prev.bloodPressure || {}),
                      diastolic: e.target.value,
                    },
                  }))
                }
                className="w-full border border-slate-200 rounded-2xl px-4 py-3"
              >
                <option value="">Select</option>
                {Array.from({ length: 81 }, (_, i) => i + 40).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SpO2 */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            SpO2 %
          </label>

          <input
            type="text"
            inputMode="numeric"
            name="spo2"
            value={formData.spo2}
            onChange={handleChange}
            placeholder="Enter SpO2 %"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* Body Weight */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Body Weight (KG)
          </label>

          <input
            type="text"
            inputMode="decimal"
            name="bodyWeight"
            value={formData.bodyWeight}
            onChange={handleChange}
            placeholder="Enter Weight in KG"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* BCS */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Body Condition Score (BCS)
          </label>

          <select
            name="bcs"
            value={formData.bcs}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">Select BCS Scale (1–9)</option>
            <option value={1}>1 - Emaciated</option>
            <option value={2}>2 - Very Thin</option>
            <option value={3}>3 - Thin</option>
            <option value={4}>4 - Underweight</option>
            <option value={5}>5 - Ideal</option>
            <option value={6}>6 - Slightly Overweight</option>
            <option value={7}>7 - Overweight</option>
            <option value={8}>8 - Obese</option>
            <option value ={9}>9 - Severely Obese</option>
          </select>
        </div>

        {/* Recorded By */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-slate-700">
              Vitals Recorded By <span className="text-red-500 font-bold ml-1">*</span>
            </label>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Auto filled name of logged in staff
            </span>
          </div>

          <input
            type="text"
            name="recordedBy"
            value={formData.recordedBy || ""}
            onChange={handleChange}
            placeholder="Logged in staff name"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-50 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
          />
        </div>

        {/* Vitals Recorded At */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-slate-700">
              Vitals Recorded At
            </label>
            <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Auto timestamp
            </span>
          </div>

          <input
            type="text"
            value={
              formData.vitalsRecordedAt
                ? new Date(formData.vitalsRecordedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : new Date().toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
            }
            readOnly
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 text-slate-600 text-sm md:text-base outline-none cursor-not-allowed font-mono font-medium"
          />
        </div>
      </div>
    </div>
  );
}