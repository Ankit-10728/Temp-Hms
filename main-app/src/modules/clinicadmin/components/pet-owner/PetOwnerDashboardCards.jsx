/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import axios from "axios";

import {
  FaPaw,
  FaFileMedical,
  FaSyringe,
  FaFolderOpen,
  FaArrowUp,
} from "react-icons/fa";

const PetOwnerDashboardCards = () => {
  const [dashboard, setDashboard] = useState({
    cards: {
      totalVisits: 0,
      totalLabReports: 0,
      totalVaccinations: 0,
      totalDocuments: 0,
    },
    recentActivities: [],
    upcomingVaccination: null,
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/v1/pet-owner/dashboard"
      );

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Visits",
      value: dashboard.cards.totalVisits,
      icon: <FaPaw />,
      bg: "from-slate-900 via-slate-800 to-slate-700",
    },
    {
      title: "Lab Reports",
      value: dashboard.cards.totalLabReports,
      icon: <FaFileMedical />,
      bg: "from-orange-500 via-orange-600 to-orange-700",
    },
    {
      title: "Vaccinations",
      value: dashboard.cards.totalVaccinations,
      icon: <FaSyringe />,
      bg: "from-blue-500 via-blue-600 to-blue-700",
    },
    {
      title: "Documents",
      value: dashboard.cards.totalDocuments,
      icon: <FaFolderOpen />,
      bg: "from-emerald-500 via-emerald-600 to-emerald-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-slate-500">Loading Dashboard...</p>
      </div>
    );
  }




  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.bg}
            group relative overflow-hidden rounded-3xl p-6
            text-white shadow-xl transition-all duration-300
            hover:-translate-y-2 hover:shadow-2xl`}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"></div>

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-white/70">
                  {card.title}
                </p>

                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold">
                  {card.value}
                </h2>

                <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                  <FaArrowUp />
                  <span>12% this month</span>
                </div>
              </div>

              <div className="text-3xl md:text-4xl lg:text-5xl text-white/90">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-5 md:p-8 shadow-lg">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-2xl font-bold text-slate-800">
              Recent Activities
            </h3>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
              Live
            </span>
          </div>

          <div className="space-y-4">
            {dashboard.recentActivities.length > 0 ? (
              dashboard.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-50 p-5 transition hover:bg-slate-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="rounded-xl bg-green-100 p-3 text-xl">
                      📌
                    </div>

                    <div>
                      <h4 className="font-semibold">
                        {activity.status ||
                          activity.reportName ||
                          activity.labName ||
                          "Activity"}
                      </h4>

                      <p className="text-sm text-slate-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">
                No Recent Activities
              </div>
            )}
          </div>
        </div>

        {/* Reminder Card */}
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 p-5 md:p-8 text-white shadow-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-bold">
              Upcoming Vaccine
            </h3>

            <span className="text-4xl">💉</span>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <h4 className="text-xl font-bold">
              {dashboard.upcomingVaccination?.vaccineName || "No Upcoming Vaccine"}
            </h4>

            <p className="mt-2 text-orange-100">
              {dashboard.upcomingVaccination?.nextVaccinationDate
                ? `Due on ${new Date(
                  dashboard.upcomingVaccination.nextVaccinationDate
                ).toLocaleDateString()}`
                : "No Upcoming Vaccination"}
            </p>

            <div className="mt-6">
              <button
                className="
w-full sm:w-auto
rounded-xl
bg-white
px-5
py-3
font-semibold
text-orange-600
transition
hover:scale-105
"
              >
                View Details
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-orange-100">
              Keep your pet healthy by staying up to date with vaccinations.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PetOwnerDashboardCards;