import PetOwnerDashboardCards from "../../components/pet-owner/PetOwnerDashboardCards";
import PetOwnerSidebar from "../../components/pet-owner/PetOwnerSidebar";

const PetOwnerDashboard = () => {
  return (
    <div className="pet-owner-theme flex min-h-screen bg-slate-50">
      <PetOwnerSidebar />

      <div className="flex-1 ml-0 lg:ml-[280px] pt-[72px] lg:pt-0 min-w-0">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b bg-white px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Pet Owner Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your pet health records and documents
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center md:gap-4">
            <button className="rounded-xl border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50">
              Notifications
            </button>

            <div className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                P
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  Pet Owner
                </p>

                <p className="text-xs text-slate-500">
                  Premium Account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Hero Banner */}
          <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#063D31] via-[#075443] to-[#0A5243] p-5 text-white shadow-lg md:p-8">
            <h2 className="text-2xl font-bold md:text-3xl">
              Welcome Back 👋
            </h2>

            <p className="mt-2 max-w-xl text-slate-200">
              Track appointments, prescriptions, vaccinations and upload
              medical reports for your pet.
            </p>
          </div>

          {/* Dashboard Cards + Recent Activities + Upcoming Vaccine */}
          <PetOwnerDashboardCards />
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
