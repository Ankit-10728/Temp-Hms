import {
  CheckCircle,
  Crown,
  Calendar,
  Users,
  Database,
  ShieldCheck,
} from "lucide-react";

const features = [
  "Doctor Management",
  "Reception Management",
  "Lab Management",
  "Groomer Management",
  "Kennel Management",
  "Pet Owner Portal",
  "Unlimited Appointments",
  "Reports & Analytics",
  "Cloud Backup",
  "Role Based Access",
];

const limits = [
  { title: "Doctors", value: "20" },
  { title: "Receptionists", value: "10" },
  { title: "Lab Staff", value: "5" },
  { title: "Groomers", value: "5" },
  { title: "Kennel Staff", value: "5" },
  { title: "Storage", value: "50 GB" },
];

const Subscription = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Subscription</h1>
        <p className="text-slate-500 mt-1">
          View your current subscription plan and included features.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="text-orange-500" size={28} />
              <h2 className="text-2xl font-bold text-slate-800">
                Professional Plan
              </h2>
            </div>

            <p className="text-slate-500 mt-2">
              Suitable for medium to large veterinary clinics.
            </p>
          </div>

          <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <div className="bg-slate-50 rounded-2xl p-5">
            <Calendar className="text-orange-500 mb-2" />
            <p className="text-sm text-slate-500">Billing Cycle</p>
            <h3 className="font-bold text-lg">Monthly</h3>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5">
            <Users className="text-orange-500 mb-2" />
            <p className="text-sm text-slate-500">Price</p>
            <h3 className="font-bold text-lg">₹999 / Month</h3>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5">
            <ShieldCheck className="text-orange-500 mb-2" />
            <p className="text-sm text-slate-500">Valid Till</p>
            <h3 className="font-bold text-lg">31 July 2026</h3>
          </div>
        </div>
      </div>

      {/* Features + Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-5 text-slate-800">
            Included Features
          </h2>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-slate-100 pb-3"
              >
                <CheckCircle
                  className="text-green-500 flex-shrink-0"
                  size={20}
                />
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limits */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Database className="text-orange-500" />
            <h2 className="text-xl font-bold text-slate-800">
              Plan Limits
            </h2>
          </div>

          <div className="space-y-4">
            {limits.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-slate-100 pb-3"
              >
                <span className="text-slate-600">{item.title}</span>

                <span className="font-bold text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;