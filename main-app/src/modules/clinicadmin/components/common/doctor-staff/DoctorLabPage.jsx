/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import axios from "axios";

export default function DoctorLabPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [labPets, setLabPets] = useState([]);

  const [selectedPet, setSelectedPet] = useState(null);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getLabPets();
  }, []);

  const getLabPets = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/doctorModule/lab-pets"
      );

      setLabPets(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const completeCase = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/doctorModule/patient/${selectedPet._id}`,
        {
          status: "COMPLETED",
        }
      );

      if (response.data.success) {
        alert("Case Completed Successfully");

        setShowModal(false);

        setSelectedPet(null);

        getLabPets();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredPets = labPets.filter(
    (pet) =>
      pet.petName?.toLowerCase().includes(search.toLowerCase()) ||
      pet.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      pet.petId?.toLowerCase().includes(search.toLowerCase()) ||
      pet.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">

      {/* Header */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Doctor Lab Panel
          </h1>

          <p className="mt-1 text-slate-500">
            Cases Sent For Laboratory
          </p>

        </div>

      </div>

      {/* Search */}

      <div className="rounded-3xl bg-white p-5 shadow">

        <input
          type="text"
          placeholder="Search by Pet ID, Owner Name, Pet Name or Phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-14 w-full rounded-2xl border border-slate-300 px-5 outline-none focus:border-orange-500"
        />

      </div>
            {/* Mobile Cards */}

      <div className="space-y-4 lg:hidden">

        {filteredPets.map((pet) => (

          <div
            key={pet._id}
            className="rounded-3xl border bg-white p-5 shadow"
          >

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {pet.petName}
                </h2>

                <p className="text-sm text-slate-500">
                  {pet.petId}
                </p>

              </div>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                {pet.status}
              </span>

            </div>

            <div className="mt-5 space-y-2 text-sm">

              <p>
                <span className="font-semibold">
                  Owner :
                </span>{" "}
                {pet.ownerName}
              </p>

              <p>
                <span className="font-semibold">
                  Phone :
                </span>{" "}
                {pet.phone}
              </p>

              <p>
                <span className="font-semibold">
                  Tests :
                </span>{" "}
                {pet.labRequisition?.tests?.join(", ")}
              </p>

              <p>
                <span className="font-semibold">
                  Sample :
                </span>{" "}
                {pet.labRequisition?.sampleType?.join(", ")}
              </p>

            </div>

            <button
              onClick={() => {

                setSelectedPet(pet);

                setShowModal(true);

              }}
              className="mt-5 w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white"
            >
              View
            </button>

          </div>

        ))}

      </div>

      {/* Desktop Table */}

      <div className="hidden overflow-x-auto rounded-3xl bg-white p-6 shadow lg:block">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="py-4 text-left">
                Pet ID
              </th>

              <th className="text-left">
                Pet Name
              </th>

              <th className="text-left">
                Owner
              </th>

              <th className="text-left">
                Phone
              </th>

              <th className="text-left">
                Tests
              </th>

              <th className="text-left">
                Status
              </th>

              <th className="text-left">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredPets.map((pet) => (

              <tr
                key={pet._id}
                className="border-b hover:bg-slate-50"
              >

                <td className="py-5">
                  {pet.petId}
                </td>

                <td>
                  {pet.petName}
                </td>

                <td>
                  {pet.ownerName}
                </td>

                <td>
                  {pet.phone}
                </td>

                <td>
                  {pet.labRequisition?.tests?.join(", ")}
                </td>

                <td>

                  <span className="rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-600">

                    {pet.status}

                  </span>

                </td>

                <td>

                  <button
                    onClick={() => {

                      setSelectedPet(pet);

                      setShowModal(true);

                    }}
                    className="rounded-xl bg-orange-500 px-5 py-2 text-white"
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
            {/* View Modal */}

      {showModal && selectedPet && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">

          <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b p-5">

              <div>

                <h2 className="text-3xl font-bold">
                  {selectedPet.petName}
                </h2>

                <p className="mt-1 text-slate-500">
                  {selectedPet.petId}
                </p>

              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPet(null);
                }}
                className="rounded-xl bg-red-500 px-5 py-2 text-white"
              >
                Close
              </button>

            </div>

            {/* Body */}

            <div className="flex-1 overflow-y-auto p-6">

              <div className="grid gap-6 lg:grid-cols-2">

                {/* Pet Information */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    🐶 Pet Information
                  </h3>

                  <div className="space-y-3">

                    <p><b>Pet ID :</b> {selectedPet.petId}</p>

                    <p><b>Pet Name :</b> {selectedPet.petName}</p>

                    <p><b>Species :</b> {selectedPet.petSpecies}</p>

                    <p><b>Breed :</b> {selectedPet.petBreed}</p>

                    <p><b>Age :</b> {selectedPet.petAge}</p>

                    <p><b>Gender :</b> {selectedPet.petGender}</p>

                    <p><b>Weight :</b> {selectedPet.petWeight} Kg</p>

                  </div>

                </div>

                {/* Owner Information */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    👨 Owner Information
                  </h3>

                  <div className="space-y-3">

                    <p><b>Owner :</b> {selectedPet.ownerName}</p>

                    <p><b>Phone :</b> {selectedPet.phone}</p>

                    <p><b>Email :</b> {selectedPet.email}</p>

                    <p><b>Address :</b> {selectedPet.address}</p>

                    <p><b>Doctor :</b> {selectedPet.doctorName}</p>

                  </div>

                </div>

                {/* Requested Tests */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    🔬 Requested Lab Tests
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {selectedPet.labRequisition?.tests?.map((test) => (

                      <span
                        key={test}
                        className="rounded-full bg-orange-100 px-4 py-2 text-orange-600"
                      >
                        {test}
                      </span>

                    ))}

                  </div>

                </div>

                {/* Sample */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    🧪 Sample Type
                  </h3>

                  <div className="flex flex-wrap gap-3">

                    {selectedPet.labRequisition?.sampleType?.map((sample) => (

                      <span
                        key={sample}
                        className="rounded-full bg-blue-100 px-4 py-2 text-blue-700"
                      >
                        {sample}
                      </span>

                    ))}

                  </div>

                </div>

                {/* Instructions */}

                <div className="rounded-3xl border bg-slate-50 p-6 lg:col-span-2">

                  <h3 className="mb-5 text-xl font-bold">
                    📝 Instructions
                  </h3>

                  <p className="leading-8 text-slate-600">

                    {selectedPet.labRequisition?.instructions ||
                      "No Instructions"}

                  </p>

                </div>
                                {/* Report Status */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    📄 Lab Report
                  </h3>

                  <div className="space-y-4">

                    <div>
                      <span className="font-semibold">
                        Report Status :
                      </span>

                      <span className="ml-3 rounded-full bg-green-100 px-4 py-2 text-green-700">
                        {selectedPet.labRequisition?.status || "Pending"}
                      </span>
                    </div>

                    {selectedPet.labRequisition?.reportUrl ? (

                      <a
                        href={selectedPet.labRequisition.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-xl bg-blue-600 px-5 py-3 text-white"
                      >
                        View Report
                      </a>

                    ) : (

                      <p className="text-slate-500">
                        Report not uploaded yet.
                      </p>

                    )}

                  </div>

                </div>

                {/* Remarks */}

                <div className="rounded-3xl border bg-slate-50 p-6">

                  <h3 className="mb-5 text-xl font-bold">
                    💬 Lab Remarks
                  </h3>

                  <p className="leading-8 text-slate-600">

                    {selectedPet.labRequisition?.reportRemarks ||
                      "No Remarks"}

                  </p>

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:justify-end">

              <button
                onClick={() => {

                  setShowModal(false);

                  setSelectedPet(null);

                }}
                className="rounded-xl bg-slate-300 px-6 py-3"
              >
                Close
              </button>

              <button
                onClick={completeCase}
                className="rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700"
              >
                Complete Case
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}