const PetOwnerUploadForm = () => {
  return (
    <div className="mt-4 rounded-3xl bg-white p-4 md:p-6 shadow-lg">
      <div className="space-y-5">
        {/* Lab Report */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Lab Report
          </label>

          <input
            type="file"
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Lab Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Lab Name
          </label>

          <input
            type="text"
            placeholder="Enter Lab Name"
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Report Date */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Report Date
          </label>

          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Notes
          </label>

          <textarea
            rows={4}
            placeholder="Notes for Doctor"
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Button */}
        <button
          className="
            w-full sm:w-auto
            rounded-2xl
            bg-gradient-to-r
            from-orange-500
            to-orange-600
            px-6
            py-3
            font-medium
            text-white
            shadow-lg
            transition
            hover:shadow-xl
          "
        >
          Upload Report
        </button>
      </div>
    </div>
  );
};

export default PetOwnerUploadForm;