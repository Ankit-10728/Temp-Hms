export default function BriefHistoryForm({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hasPrevious = formData.previousEpisodes?.hasPreviousEpisodes || false;

  const handleDurationChange = (e) => {
    const raw = e.target.value;
    const numeric = raw.replace(/\D/g, "");
    const clamped = numeric.slice(0, 3);
    const final =
      clamped === ""
        ? ""
        : Math.min(999, Math.max(1, Number(clamped)));
    setFormData((prev) => ({
      ...prev,
      durationOfIllness: {
        ...prev.durationOfIllness,
        value: final,
      },
    }));
  };

  return (
    <div>
      <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8">
        Brief History Of Problem
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Duration Of Illness */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Duration Of Illness
          </label>
          <input
            type="number"
            min="1"
            max="999"
            value={formData.durationOfIllness?.value || ""}
            onChange={handleDurationChange}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            placeholder="Enter Duration (1–999)"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        {/* Duration Unit */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">
            Duration Unit
          </label>
          <select
            value={formData.durationOfIllness?.unit || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                durationOfIllness: {
                  ...prev.durationOfIllness,
                  unit: e.target.value,
                },
              }))
            }
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
          >
            <option value="" disabled>Select Duration Unit</option>
            <option value="Days">Days</option>
            <option value="Weeks">Weeks</option>
            <option value="Months">Months</option>
            <option value="Years">Years</option>
          </select>
        </div>

        {/* Onset */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">Onset</label>
          <select
            name="onset"
            value={formData.onset}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
          >
            <option value="">Select Onset</option>
            <option value="Sudden">Sudden</option>
            <option value="Gradual">Gradual</option>
          </select>
        </div>

        {/* Progression */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">Progression</label>
          <select
            name="progression"
            value={formData.progression}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 font-medium"
          >
            <option value="">Select Progression</option>
            <option value="Improving">Improving</option>
            <option value="Worsening">Worsening</option>
            <option value="Stable">Stable</option>
          </select>
        </div>

        {/* Recent Travel */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <label className="block font-semibold text-slate-800 text-sm md:text-base">
                Recent Travel
              </label>
              <p className="text-xs text-slate-500">
                Has the pet travelled recently? If yes, mention where and when.
              </p>
            </div>
            <div className="flex items-center bg-slate-200 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    recentTravel: { hasTravel: false, description: "" },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !formData.recentTravel?.hasTravel
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    recentTravel: { ...prev.recentTravel, hasTravel: true },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formData.recentTravel?.hasTravel
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yes
              </button>
            </div>
          </div>
          {formData.recentTravel?.hasTravel && (
            <textarea
              rows={3}
              placeholder="Enter travel history..."
              value={formData.recentTravel?.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recentTravel: {
                    ...prev.recentTravel,
                    hasTravel: true,
                    description: e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, ""),
                  },
                }))
              }
              className="w-full mt-3 border border-slate-200 rounded-xl p-3 bg-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 resize-none"
            />
          )}
        </div>

        {/* Contact With Other Animals */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <label className="block font-semibold text-slate-800 text-sm md:text-base">
                Contact With Other Animals
              </label>
              <p className="text-xs text-slate-500">
                Has the pet had recent contact with other animals?
              </p>
            </div>
            <div className="flex items-center bg-slate-200 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    animalContact: { hasContact: false, description: "" },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !formData.animalContact?.hasContact
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    animalContact: { ...prev.animalContact, hasContact: true },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  formData.animalContact?.hasContact
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yes
              </button>
            </div>
          </div>
          {formData.animalContact?.hasContact && (
            <textarea
              rows={3}
              placeholder="Describe the contact with other animals..."
              value={formData.animalContact?.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  animalContact: {
                    ...prev.animalContact,
                    hasContact: true,
                    description: e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, ""),
                  },
                }))
              }
              className="w-full mt-3 border border-slate-200 rounded-xl p-3 bg-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 resize-none"
            />
          )}
        </div>

        {/* Previous Similar Episodes */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <label className="block font-semibold text-slate-800 text-sm md:text-base">
                Previous Similar Episodes
              </label>
              <p className="text-xs text-slate-500">
                Has the pet experienced similar health episodes in the past?
              </p>
            </div>
            <div className="flex items-center bg-slate-200 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    previousEpisodes: { hasPreviousEpisodes: false, description: "" },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !hasPrevious
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    previousEpisodes: {
                      ...prev.previousEpisodes,
                      hasPreviousEpisodes: true,
                    },
                  }))
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  hasPrevious
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yes
              </button>
            </div>
          </div>
          {hasPrevious && (
            <div className="mt-3 animate-in fade-in duration-200">
              <textarea
                rows="3"
                value={formData.previousEpisodes?.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    previousEpisodes: {
                      ...prev.previousEpisodes,
                      hasPreviousEpisodes: true,
                      description: e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, ""),
                    },
                  }))
                }
                placeholder="Describe previous similar episodes..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm md:text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 resize-none bg-white"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
