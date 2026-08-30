import { useEffect, useState } from "react";
import {
  FlaskConical,
  Search,
  FileUp,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  PawPrint,
  Loader2,
  X,
  ShieldCheck,
  Check,
  Building2,
  Trash2,
  Paperclip,
} from "lucide-react";
import {
  getLabPendingPets,
  getRequiredLabTests,
  uploadLabReports,
} from "../../api/labApi";
import { showToast } from "../../../../shared/components/toast";

export default function LabPendingCases() {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedCase, setSelectedCase] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [files, setFiles] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await getLabPendingPets();
      setCases(res?.data || []);
    } catch (error) {
      console.error("Error fetching lab cases:", error);
      showToast({
        type: "error",
        title: "Fetch Error",
        description: "Failed to load pending lab cases.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (testName, file) => {
    if (file && file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      showToast({
        type: "error",
        title: "Invalid File Type",
        description: "Please upload PDF or Image report files.",
      });
      return;
    }
    setFiles((prev) => ({ ...prev, [testName]: file }));
  };

  const handleRemoveFile = (testName) => {
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[testName];
      return copy;
    });
  };

  const handleOpenModal = async (item) => {
    try {
      const res = await getRequiredLabTests(item.pet?._id || item.petId, item._id);
      setSelectedCase({ ...item, tests: res?.data || [] });
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching tests:", error);
      showToast({
        type: "error",
        title: "Error",
        description: "Failed to load required lab tests.",
      });
    }
  };

  const handleUpload = async () => {
    if (Object.keys(files).length === 0) {
      showToast({
        type: "error",
        title: "No Files Selected",
        description: "Please select at least one lab report file to upload.",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(files).forEach(([testName, file]) => {
      if (file) formData.append(testName, file);
    });

    formData.append("petId", selectedCase.pet?._id || selectedCase.petId);
    formData.append("visitId", selectedCase._id);

    try {
      setUploading(true);
      await uploadLabReports(formData);
      showToast({
        type: "success",
        title: "Upload Successful",
        description: "Lab reports uploaded & returned to Doctor successfully!",
      });
      setShowUploadModal(false);
      setFiles({});
      setSelectedCase(null);
      await fetchCases();
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Upload Failed",
        description: err?.response?.data?.message || "Failed to upload lab reports.",
      });
    } finally {
      setUploading(false);
    }
  };

  const filtered = cases.filter((item) => {
    const query = search.toLowerCase().trim();
    const token = (item.tokenNumber?.toString() || "").toLowerCase();
    const ownerName = (item.owner?.ownerName || item.ownerName || "").toLowerCase();
    const phone = (item.owner?.mobileNumber || item.owner?.phone || item.phoneNumber || "").toLowerCase();
    const petName = (item.pet?.petName || item.pet?.name || item.petName || "").toLowerCase();
    return (
      !query ||
      token.includes(query) ||
      ownerName.includes(query) ||
      phone.includes(query) ||
      petName.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/70 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold shadow-inner">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Lab Diagnostics Queue</h1>
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">
              Process doctor diagnostic requisitions, upload PDF test attachments, and notify attending doctors
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Lab Technician Desk</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 flex-1">

          {/* Search & Count */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Token, Owner Name, Phone Number, or Pet Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 bg-white text-slate-700 font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition outline-none text-sm shadow-2xs"
              />
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-700 px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shrink-0 justify-center">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{filtered.length} Pending Requisitions</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Diagnostic Test Requisitions</h3>
                <p className="text-xs text-slate-400 font-medium">Cases referred by attending veterinarians</p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span>Loading lab pending cases...</span>
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3.5 px-4">Token</th>
                      <th className="py-3.5 px-4">Owner Info</th>
                      <th className="py-3.5 px-4">Pet Patient</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Requisition</th>
                      <th className="py-3.5 px-4 text-right">Diagnostic Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filtered.map((item) => (
                      <tr key={item._id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-slate-800">
                          <span className="inline-block bg-slate-900 text-white px-3 py-1 rounded-xl text-xs shadow-2xs">
                            TK-{item.tokenNumber || item._id?.slice(-4)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.owner?.ownerName || item.ownerName || "N/A"}</p>
                          <p className="text-xs text-slate-400 font-mono font-medium">{item.owner?.mobileNumber || item.owner?.phone || item.phoneNumber || "N/A"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                              <PawPrint className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.pet?.petName || item.pet?.name || item.petName || "Patient"}</p>
                              <p className="text-xs text-slate-400">{item.pet?.species || "Pet"} • {item.pet?.breed || "N/A"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300/80 px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Lab
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-700 border border-orange-200 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Required Tests</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              // FIX Bug 3: reuse handleOpenModal's fetch pattern inline
                              try {
                                const res = await getRequiredLabTests(item.pet?._id || item.petId, item._id);
                                setSelectedCase({ ...item, tests: res?.data || [] });
                                setFiles({}); // FIX Bug 2: always start with clean file state
                                setShowUploadModal(true);
                              } catch {
                                showToast({
                                  type: "error",
                                  title: "Error",
                                  description: "Failed to load required lab tests.",
                                });
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20 border-none inline-flex items-center gap-1.5"
                          >
                            <FileUp className="w-4 h-4" />
                            <span>Upload Reports</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-base">No Pending Lab Requisitions</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  All diagnostic test requisitions have been completed and returned to attending doctors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* VIEW REQUIRED TESTS MODAL */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Doctor Requisition Details</h3>
                  <p className="text-xs text-slate-300">
                    Patient: {selectedCase.pet?.petName || selectedCase.pet?.name || "Pet"} • Token: TK-{selectedCase.tokenNumber || "00"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition border-none cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 font-semibold text-[10px] uppercase">Owner</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedCase.owner?.ownerName || selectedCase.ownerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold text-[10px] uppercase">Mobile</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedCase.owner?.mobileNumber || selectedCase.phoneNumber || "N/A"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold uppercase text-slate-500 mb-2.5 text-[11px]">Requested Tests List</h4>
                {selectedCase.tests && selectedCase.tests.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCase.tests.map((test, index) => (
                      <div key={index} className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">
                              {typeof test === "string" ? test : test.testName || test.name || "Lab Test"}
                            </p>
                            {test.instructions && (
                              <p className="text-slate-600 mt-0.5 italic">{test.instructions}</p>
                            )}
                          </div>
                        </div>
                        <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          Required
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                    No specific test names attached in requisition.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border-none"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD REPORT MODAL */}
      {showUploadModal && selectedCase && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Upload Diagnostic Reports</h3>
                  <p className="text-xs text-slate-300">
                    Patient: <span className="text-white font-semibold">{selectedCase.pet?.petName || selectedCase.pet?.name || "Pet"}</span> • Token:{" "}
                    <span className="font-mono text-white font-bold">TK-{selectedCase.tokenNumber || "00"}</span>
                  </p>
                </div>
              </div>
              {/* FIX Bug 2: clear files on X close */}
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setFiles({});
                }}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center transition border-none cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-5 max-h-[68vh] overflow-y-auto text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                <span>Upload official PDF or image diagnostic report files to return test findings to doctor.</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>

              {selectedCase.tests && selectedCase.tests.length > 0 ? (
                selectedCase.tests.map((test, index) => {
                  const testName = typeof test === "string" ? test : test.testName || test.name || `Test_${index + 1}`;
                  const hasFile = !!files[testName];

                  return (
                    <div
                      key={index}
                      className={`border rounded-2xl p-4 transition-all ${
                        hasFile ? "bg-emerald-50/50 border-emerald-300" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-orange-500" />
                          <span>{testName}</span>
                        </label>
                        {hasFile && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ✓ Ready to Attach
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileChange(testName, e.target.files[0])}
                          className="flex-1 border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-orange-500 cursor-pointer transition-all"
                        />
                        {hasFile && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(testName)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {hasFile && (
                        <p className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selected:{" "}
                          <span className="underline">{files[testName].name}</span>{" "}
                          ({(files[testName].size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-orange-500" />
                    <span>General Diagnostic Report PDF / Image</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange("General_Report", e.target.files[0])}
                      className="flex-1 border border-slate-200 rounded-xl p-2.5 bg-white text-xs text-slate-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-orange-500 cursor-pointer transition-all"
                    />
                    {files["General_Report"] && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("General_Report")}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
                        title="Remove attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {files["General_Report"] && (
                    <p className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selected:{" "}
                      <span className="underline">{files["General_Report"].name}</span>{" "}
                      ({(files["General_Report"].size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end gap-3 shrink-0">
              {/* FIX Bug 2: clear files on Cancel */}
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setFiles({});
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-600/20 cursor-pointer border-none flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Reports...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit Reports & Send Back to Doctor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
