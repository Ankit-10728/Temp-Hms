import { useEffect, useState } from "react";
import axios from "axios";
import PetOwnerSidebar from "../../components/pet-owner/PetOwnerSidebar";
import {
  FaCloudUploadAlt,
  FaFileMedical,
  FaCalendarAlt,
  FaStickyNote,
  FaTimes,
} from "react-icons/fa";

const PetOwnerUploadDocuments = () => {
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [pets, setPets] = useState([]);

  const [formData, setFormData] = useState({
    petId: "",
    labName: "",
    reportTitle: "",
    reportDate: "",
    notes: "",
    file: null,
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/pet-owner/pets"
      );

      if (response.data.success) {
        setPets(response.data.data);
      }
    } catch (error) {
      console.error("Pets Error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const resetForm = () => {
    setFormData({
      petId: "",
      labName: "",
      reportTitle: "",
      reportDate: "",
      notes: "",
      file: null,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.petId) {
        return alert("Please select your pet.");
      }

      if (!formData.file) {
        return alert("Please upload report.");
      }

      if (!formData.labName) {
        return alert("Please enter lab name.");
      }

      if (!formData.reportDate) {
        return alert("Please select report date.");
      }

      setLoading(true);

      const uploadData = new FormData();

      uploadData.append("petId", formData.petId);
      uploadData.append("labName", formData.labName);
      uploadData.append("reportTitle", formData.reportTitle);
      uploadData.append("reportDate", formData.reportDate);
      uploadData.append("notes", formData.notes);
      uploadData.append("file", formData.file);

      const response = await axios.post(
        "http://localhost:5000/api/v1/pet-owner/report/upload",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);

      resetForm();

      setShowModal(false);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pet-owner-theme min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50">
      <PetOwnerSidebar />

      <div className="ml-0 lg:ml-[280px] pt-[80px] lg:pt-8 p-4 md:p-6 lg:p-8 min-w-0">
        {/* Header */}
        <div className="mb-8 rounded-[32px] bg-gradient-to-r from-[#063D31] via-[#075443] to-[#0A5243] p-5 md:p-8 text-white shadow-2xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Upload Documents
          </h1>

          <p className="mt-2 text-white/70">
            Upload external lab reports and share them
            with your doctor for review.
          </p>
        </div>

        {/* Upload Card */}
        <div
          onClick={() => setShowModal(true)}
          className="
          cursor-pointer
          rounded-3xl
          border-2
          border-dashed
          border-orange-300
          bg-white
         p-6 md:p-8 lg:p-12
          text-center
          shadow-lg
          transition-all
          hover:-translate-y-1
          hover:border-orange-500
          hover:shadow-2xl
        "
        >
          <div className="mx-auto mb-5 flex h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-orange-100">
            <FaCloudUploadAlt className="text-5xl text-orange-500" />
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
            Upload Lab Report
          </h2>

          <p className="mt-3 text-slate-500">
            PDF, JPG, PNG supported
          </p>
        </div>

        {/* Warning */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-red-500 to-red-600 p-6 text-center text-white shadow-xl">
          <h3 className="text-lg font-bold">
            Owner Submitted Reports
          </h3>

          <p className="mt-2 text-white/90">
            Uploaded reports are marked as
            <strong> Owner Submitted </strong>
            and become visible to doctors for review.
          </p>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start md:items-center justify-between gap-3 border-b p-4 md:p-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800">
                  Upload External Lab Report
                </h2>

                <button
                  onClick={() => setShowModal(false)}
                  className="
                  rounded-xl
                  p-2
                  text-slate-500
                  transition
                  hover:bg-slate-100
                "
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-5 p-4 md:p-6">
                {/* Upload */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <FaCloudUploadAlt className="text-orange-500" />
                    External Lab Report
                  </label>

                  <input
                    type="file"
                    name="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="
    w-full
    rounded-2xl
    border
    border-slate-200
    p-3
  "
                  />
                </div>
                {/* Select Pet */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    🐾 Select Pet
                  </label>

                  <select
                    name="petId"
                    value={formData.petId}
                    onChange={handleChange}
                    className="
      w-full
      rounded-2xl
      border
      border-slate-200
      p-3
      outline-none
      focus:border-orange-500
    "
                  >
                    <option value="">Select Your Pet</option>

                    {pets.map((pet) => (
                      <option key={pet._id} value={pet._id}>
                        {pet.petName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <FaFileMedical className="text-blue-500" />
                    Report Description / Lab Name
                  </label>

                  <input
                    type="text"
                    name="labName"
                    value={formData.labName}
                    onChange={handleChange}
                    placeholder="Enter lab name"
                    className="
    w-full
    rounded-2xl
    border
    border-slate-200
    p-3
    outline-none
    focus:border-orange-500
  "
                  />
                </div>


                {/* Report Title */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    📄 Report Title
                  </label>

                  <input
                    type="text"
                    name="reportTitle"
                    value={formData.reportTitle}
                    onChange={handleChange}
                    placeholder="Enter Report Title"
                    className="
      w-full
      rounded-2xl
      border
      border-slate-200
      p-3
      outline-none
      focus:border-orange-500
    "
                  />
                </div>

                {/* Date */}
                {/* Date */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <FaCalendarAlt className="text-green-500" />
                    Report Date
                  </label>

                  <input
                    type="date"
                    name="reportDate"
                    value={formData.reportDate}
                    onChange={handleChange}
                    className="
      w-full
      rounded-2xl
      border
      border-slate-200
      p-3
      outline-none
      focus:border-orange-500
    "
                  />
                </div>


                {/* Notes */}
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
                    <FaStickyNote className="text-purple-500" />
                    Notes / Query For Doctor
                  </label>

                  <textarea
                    rows={4}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Write your notes..."
                    className="
    w-full
    rounded-2xl
    border
    border-slate-200
    p-3
    outline-none
    focus:border-orange-500
  "
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t p-4 md:p-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="
w-full sm:w-auto
rounded-2xl
border
px-6
py-3
font-medium
hover:bg-slate-50
"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
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
    hover:shadow-xl
  "
                >
                  {loading ? "Uploading..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default PetOwnerUploadDocuments;
