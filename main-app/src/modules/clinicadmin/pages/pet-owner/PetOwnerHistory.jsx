import { useEffect, useState } from "react";
import axios from "axios";
import PetOwnerSidebar from "../../components/pet-owner/PetOwnerSidebar";
import { FaDownload, FaFilePdf } from "react-icons/fa";

const PetOwnerHistory = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      fetchPetHistory(selectedPet);
    }
  }, [selectedPet]);

  const fetchPets = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/v1/pet-owner/pets"
      );

      if (response.data.success) {
        setPets(response.data.data);

        if (response.data.data.length > 0) {
          setSelectedPet(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Pets Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetHistory = async (petId) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/v1/pet-owner/history/${petId}`
      );

      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error("History Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const pet = history?.petProfile;

    return (
        <div className="pet-owner-theme min-h-screen bg-slate-50">
            <PetOwnerSidebar />

           <div className="ml-0 lg:ml-[280px] pt-[80px] lg:pt-8 p-4 md:p-6 lg:p-8 min-w-0">
                {/* Header */}
                <div className="mb-8 rounded-[32px] bg-gradient-to-r from-[#063D31] via-[#075443] to-[#0A5243] p-5 md:p-8 text-white shadow-2xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                        Pet Medical Records
                    </h1>

                    <p className="mt-2 text-white/70">
                        Complete healthcare history, prescriptions, lab reports and vaccination records.
                    </p>
                </div>

                {/* Pet Select */}
                <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-orange-500">🐾</span>
                        <h2 className="font-bold text-slate-800">
                            Select Pet
                        </h2>
                    </div>

           <select
  value={selectedPet}
  onChange={(e) => setSelectedPet(e.target.value)}
  className="
    w-full max-w-md
    rounded-2xl
    border border-slate-200
    bg-slate-50
    px-4 py-3
    focus:border-orange-500
    focus:outline-none
  "
>
  {pets.map((pet) => (
    <option key={pet._id} value={pet._id}>
      {pet.petName}
    </option>
  ))}
</select>
                </div>

                {/* Profile */}
                <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl">
                    <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                                🐾
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                   {pet?.petName || "Pet Name"}
                                </h2>

                                <p className="text-white/80">
                                    {pet?.breed || "--"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                        <Info title="Age" value={pet?.age} />
                        <Info title="Gender" value={pet?.gender} />
                        <Info title="Weight" value={pet?.weight} />
                        <Info title="Status"  value={pet?.status || "Healthy"} />
                    </div>
                </div>

                {/* Vitals */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <VitalCard
                        title="Weight"
                       value={pet?.weight || "--"}
                        icon="⚖️"
                    />

                    <VitalCard
                        title="Temperature"
                       value={history?.vitals?.temperature || "--"}
                        icon="🌡️"
                    />

                    <VitalCard
                        title="Heart Rate"
                        value={history?.vitals?.heartRate || "--"}
                        icon="❤️"
                    />

                    <VitalCard
                        title="Respiratory"
                        value={history?.vitals?.respiratoryRate || "--"}
                        icon="🫁"
                    />
                </div>

                {/* Diagnosis */}
                <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-bold">
                        Doctor Observation & Diagnosis
                    </h2>

                    <div className="rounded-2xl border-l-4 border-orange-500 bg-orange-50 p-5">
                        {history?.diagnosis || "No Diagnosis Available"}
                    </div>
                </div>

                {/* Prescription + Lab */}
<div className="rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="mb-5 text-xl font-bold">
    Prescriptions
  </h2>

  {history?.prescription?.length > 0 ? (
    history.prescription.map((item, index) => (
      <div
        key={index}
        className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:bg-slate-100 hover:shadow-md"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              {item.title}
            </p>

            <p className="text-sm text-slate-500">
              {item.issuedDate
                ? new Date(item.issuedDate).toLocaleDateString()
                : ""}
            </p>
          </div>

          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-white"
          >
            <FaDownload />
            PDF
          </a>
        </div>
      </div>
    ))
  ) : (
    <div className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">
      No Prescription Available
    </div>
  )}
</div>

                {/* Reminder */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

  {/* Follow Up */}
  <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-xl">
    <h2 className="text-xl font-bold">
      Follow-Up Reminder
    </h2>

    <p className="mt-3">
      {history?.followUpDate
        ? new Date(history.followUpDate).toLocaleDateString()
        : "No Follow-Up Scheduled"}
    </p>
  </div>

  {/* Vaccination */}
  <div className="rounded-3xl bg-gradient-to-r from-[#063D31] to-[#0A5243] p-6 text-white shadow-xl">
    <h2 className="text-xl font-bold">
      Next Vaccination
    </h2>

    <p className="mt-3">
      {history?.nextVaccination?.vaccineName
        ? `${history.nextVaccination.vaccineName} - ${new Date(
            history.nextVaccination.nextVaccinationDate
          ).toLocaleDateString()}`
        : "No Vaccination Scheduled"}
    </p>
  </div>

</div>

                {/* Timeline */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="mb-6 text-xl font-bold">
    Treatment History
  </h2>

  {history?.treatmentHistory?.length > 0 ? (
    <div className="space-y-5">
      {history.treatmentHistory.map((item, index) => (
        <TimelineItem
  key={index}
  date={
    item.date
      ? new Date(item.date).toLocaleDateString()
      : ""
  }
  text={item.title}
  description={item.description}
/>
      ))}
    </div>
  ) : (
    <div className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">
      No Treatment History Available
    </div>
  )}
</div>
            </div>
        </div>
    );
};



const Info = ({ title, value }) => (
  <div className="rounded-2xl bg-slate-50 p-5 transition-all hover:bg-slate-100 hover:shadow-md">
    <p className="text-xs uppercase tracking-wider text-slate-400">
      {title}
    </p>

    <p className="mt-2 text-lg font-bold text-slate-800">
      {value || "--"}
    </p>
  </div>
);

const VitalCard = ({ title, value, icon }) => (
  <div
    className="
      rounded-3xl
      bg-white
      p-6
      shadow-lg
      transition-all
      hover:-translate-y-1
      hover:shadow-xl
    "
  >
    <div className="mb-3 text-2xl">
      {icon}
    </div>

    <p className="text-sm text-slate-500">
      {title}
    </p>

    <h3 className="mt-2 text-3xl font-bold text-slate-800">
      {value || "--"}
    </h3>
  </div>
);

const TimelineItem = ({ date, text, description }) => (
  <div className="flex flex-col gap-4 sm:flex-row">
    <div
      className="
        flex h-12 w-12 items-center justify-center
        rounded-full
        bg-orange-500
        text-white
        shadow-lg
      "
    >
      ✓
    </div>

    <div className="flex-1 rounded-2xl bg-slate-50 p-4">
      <p className="font-semibold text-slate-800">
        {text || "No Title"}
      </p>

      {description && (
        <p className="mt-2 text-sm text-slate-600">
          {description}
        </p>
      )}

      <p className="mt-2 text-sm text-slate-500">
        {date || "--"}
      </p>
    </div>
  </div>
);

export default PetOwnerHistory;
