import { useState } from "react";
import { Search } from "lucide-react";

export default function CompletedPets() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("today");

  const completedCases = Array.from({ length: 50 }, (_, i) => ({
    petId: `PET${String(i + 1).padStart(3, "0")}`,
    owner: [
      "Rahul Sharma",
      "Amit Verma",
      "Rohan Singh",
      "Priya Gupta",
      "Neha Sharma",
      "Vikas Kumar",
      "Anjali Singh",
      "Karan Mehta",
      "Pooja Yadav",
      "Deepak Verma",
    ][i % 10],
    phone: `98${String(76543210 + i).padStart(8, "0")}`,
    status: "Completed",
    date: i < 15 ? "Today" : i < 30 ? "Yesterday" : "Past",
  }));

  const filteredCases = completedCases.filter(
    (item) =>
      (item.owner.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search)) &&
      item.date.toLowerCase() === filter.toLowerCase()
  );

  const filters = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Past Cases", value: "past" },
  ];

  return (
    <div className="space-y-5 sm:space-y-8 pt-16 md:pt-8">

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search by Owner Name or Phone Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-700 transition-all placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-xl px-4 py-3 text-sm font-medium transition sm:rounded-2xl sm:px-6 sm:text-base ${filter === item.value
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-orange-50"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Heading */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold text-slate-800">
          Completed Cases
        </h2>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCases.map((item) => (
          <div
            key={item.petId}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {item.petId}
                </h3>

                <p className="text-sm text-slate-500">
                  {item.owner}
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {item.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">
                  Phone:
                </span>{" "}
                {item.phone}
              </p>

              <p>
                <span className="font-semibold">
                  Date:
                </span>{" "}
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:rounded-[30px] lg:p-8">

        <h2 className="hidden md:block mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">
          Completed Cases List
        </h2>

        <div className="hidden md:block overflow-x-auto">

          <table className="min-w-180 w-full">

            <thead>
              <tr className="border-b text-sm text-slate-500">
                <th className="py-4 pr-4 text-left font-semibold">
                  Pet ID
                </th>

                <th className="py-4 pr-4 text-left font-semibold">
                  Owner Name
                </th>

                <th className="py-4 pr-4 text-left font-semibold">
                  Phone Number
                </th>

                <th className="py-4 pr-4 text-left font-semibold">
                  Status
                </th>

                <th className="py-4 text-left font-semibold">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCases.map((item) => (
                <tr
                  key={item.petId}
                  className="border-b text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <td className="py-4 pr-4 font-medium text-slate-900">
                    {item.petId}
                  </td>

                  <td className="pr-4">
                    {item.owner}
                  </td>

                  <td className="pr-4">
                    {item.phone}
                  </td>

                  <td className="pr-4">
                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}