import { Check } from "lucide-react";

const symptomOptions = [
  "Vomiting",
  "Diarrhea",
  "Lethargy",
  "Coughing",
  "Sneezing",
  "Discharge",
  "Skin Lesion",
  "Lameness",
  "Other",
];

export default function ProblemDescriptionForm({ formData, setFormData }) {

  const handleAlphaOnlyChange = (e) => {
    const { name, value } = e.target;
    const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: cleaned,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSymptom = (symptom) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.associatedSymptoms)
        ? prev.associatedSymptoms
        : [];
      const exists = current.includes(symptom);
      return {
        ...prev,
        associatedSymptoms: exists
          ? current.filter((s) => s !== symptom)
          : [...current, symptom],
      };
    });
  };

  return (
    <div>
      <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8">
        Problem Description
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Primary Complaint — letters and spaces only */}
        <div className="lg:col-span-2">
          <label className="block mb-2 font-medium text-slate-700">
            Primary Complaint{" "}
            <span className="text-red-500 font-bold ml-1">*</span>
          </label>
          <textarea
            rows={4}
            name="primaryComplaint"
            value={formData.primaryComplaint}
            onChange={handleAlphaOnlyChange}
            placeholder="Enter primary complaint (alphabets only)..."
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          <p className="text-xs text-slate-400 mt-1">
            Only alphabetic characters and spaces are allowed.
          </p>
        </div>

        {/* Associated Symptoms Multi-Select */}
        <div className="lg:col-span-2">
          <label className="block mb-2 font-medium text-slate-700 flex items-center justify-between">
            <span>Associated Symptoms (Multi Select)</span>
            <span className="text-xs text-slate-400 font-normal">
              Select all symptoms that apply
            </span>
          </label>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-wrap gap-2.5">
              {symptomOptions.map((symptom) => {
                const isSelected = (formData.associatedSymptoms || []).includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer border select-none ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200 scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    <span>{symptom}</span>
                  </button>
                );
              })}
            </div>
            {(formData.associatedSymptoms || []).length > 0 && (
              <p className="mt-3 text-xs text-orange-600 font-medium">
                Selected: {(formData.associatedSymptoms || []).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Severity */}
        <div className="lg:col-span-2">
          <label className="block mb-2 font-medium text-slate-700">Severity</label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">Select Severity</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

      </div>
    </div>
  );
}
