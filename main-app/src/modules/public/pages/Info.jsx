import { useState } from "react";
import {
    Users,
    Building2,
    Scissors,
    Home,
    Stethoscope,
    FlaskConical,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function InfoDashboard() {
    const [stats] = useState({
        totalUsers: 1240,
        users: 600,
        clinics: 120,
        groomers: 150,
        kennels: 90,
        labTechnicians: 80,
        doctors: 200,
    });

    const chartData = [
        { name: "Users", value: stats.users },
        { name: "Clinics", value: stats.clinics },
        { name: "Groomers", value: stats.groomers },
        { name: "Kennels", value: stats.kennels },
        { name: "Lab Techs", value: stats.labTechnicians },
        { name: "Doctors", value: stats.doctors },
    ];

    const COLORS = [
        "#f97316", // orange
        "#fb923c",
        "#fdba74",
        "#ea580c",
        "#c2410c",
        "#9a3412",
    ];

    const Card = ({ title, value, icon: Icon }) => (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <h2 className="text-3xl font-bold text-white mt-1">
                        {value}
                    </h2>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Icon className="text-orange-500" size={28} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard Overview
                </h1>
                <p className="text-gray-400 mt-1">
                    Monitor platform users and services
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card title="Total Users" value={stats.totalUsers} icon={Users} />
                <Card title="Users" value={stats.users} icon={Users} />
                <Card title="Clinics" value={stats.clinics} icon={Building2} />
                <Card title="Groomers" value={stats.groomers} icon={Scissors} />
                <Card title="Kennels" value={stats.kennels} icon={Home} />
                <Card title="Lab Technicians" value={stats.labTechnicians} icon={FlaskConical} />
                <Card title="Doctors" value={stats.doctors} icon={Stethoscope} />
            </div>

            {/* Chart Section */}
            <div className="bg-[#111111] border border-[#1f1f1f] p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-white">
                    User Distribution
                </h2>

                <div className="flex justify-center">
                    <PieChart width={420} height={400}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            outerRadius={140}
                            label
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f1f1f",
                                border: "none",
                                color: "#fff",
                            }}
                        />
                        <Legend />
                    </PieChart>
                </div>
            </div>
        </div>
    );
}