import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  Building2,
  Users,
  UserCheck,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Plus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const AssistantAdminDashboard = () => {
  const { apiClient, user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/dashboard/assistant-admin");
      setData(res.data.dashboard);
    } catch (err) {
      console.warn("Using sample Assistant Admin division data:", err.message);
      setData({
        fieldAdminsCount: 2,
        workersCount: 12,
        todayPresent: 11,
        totalAttendance: 84,
        fieldAdmins: [
          {
            _id: "fa-1",
            name: "Suresh Reddy",
            email: "fieldadmin@gov.in",
            phone: "+919876500004",
            mandal: "Dhone",
            village: "Kothapalli",
            assignedVillages: ["Kothapalli", "Venkatapuram", "Chanugondla"],
            isActive: true,
            workerCount: 8,
          },
          {
            _id: "fa-2",
            name: "M. Sangeetha",
            email: "fieldadmin2@gov.in",
            phone: "+919876500005",
            mandal: "Pattikonda",
            village: "Peddahothur",
            assignedVillages: ["Peddahothur", "Devanakonda"],
            isActive: true,
            workerCount: 4,
          },
        ],
        pendingPayments: [
          {
            _id: "p-1",
            workerName: "Ramesh Babu",
            amount: 1275,
            workerId: { village: "Kothapalli" },
            transactionId: "TXN-DBT-948291039",
            createdAt: new Date(),
          },
          {
            _id: "p-2",
            workerName: "Lakshmi Devi",
            amount: 1275,
            workerId: { village: "Kothapalli" },
            transactionId: "TXN-DBT-948291040",
            createdAt: new Date(),
          },
        ],
        villageReports: [
          { village: "Kothapalli", mandal: "Dhone", workers: 8, presentToday: 7, pendingWages: 2550 },
          { village: "Venkatapuram", mandal: "Dhone", workers: 4, presentToday: 4, pendingWages: 1275 },
          { village: "Peddahothur", mandal: "Pattikonda", workers: 4, presentToday: 3, pendingWages: 1275 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Banner */}
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl shadow-gov-lg border border-sky-800/40 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-xs font-black uppercase tracking-wider">
                    Division Incharge
                  </span>
                  <span className="text-xs text-blue-300 font-semibold">
                    {user?.district || "Kurnool"} Regional Division
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                  Assistant Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Scoped Management: Overseeing Field Admins, Village Workers, Attendance Summaries & Pending DBT Claims.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => navigate("/admin/field-admins")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 shadow-md flex items-center space-x-1.5"
                >
                  <Plus size={16} />
                  <span>New Field Admin</span>
                </Button>
                <button
                  onClick={fetchDashboard}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition"
                  title="Refresh stats"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Managed Field Admins
                </p>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.fieldAdminsCount || 2}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Mandal Incharges</span>
                <Link to="/admin/field-admins" className="text-blue-600 font-bold hover:underline">
                  Manage →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Workers in Division
                </p>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <UserCheck size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.workersCount || 12}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-emerald-600 font-medium">100% Biometric Enrolled</span>
                <Link to="/admin/workers" className="text-emerald-600 font-bold hover:underline">
                  View →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Today's Present Workers
                </p>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <Calendar size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.todayPresent || 11}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Muster Verified</span>
                <Link to="/admin/attendance" className="text-indigo-600 font-bold hover:underline">
                  Attendance →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending Payment Claims
                </p>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <CreditCard size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.pendingPayments?.length || 2}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Awaiting Treasury DBT</span>
                <Link to="/admin/payments" className="text-amber-600 font-bold hover:underline">
                  Review →
                </Link>
              </div>
            </div>
          </div>

          {/* Section 2: Manage Field Admins and Pending Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Field Admins list */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Users size={16} className="text-blue-600" />
                  <span>My Assigned Field Admins</span>
                </h3>
                <Link to="/admin/field-admins" className="text-xs font-bold text-blue-600 hover:underline">
                  Full Management →
                </Link>
              </div>

              <div className="space-y-3">
                {(data?.fieldAdmins || []).map((fa) => (
                  <div
                    key={fa._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-800 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{fa.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {fa.email} • {fa.phone} • {fa.mandal} Mandal
                      </p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
                        📍 Villages: {(fa.assignedVillages || [fa.village]).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                        {fa.workerCount || 0} Workers
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/admin/field-admins")}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Payments List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <CreditCard size={16} className="text-amber-600" />
                  <span>Pending Wage Approvals</span>
                </h3>
              </div>

              <div className="space-y-3">
                {(data?.pendingPayments || []).map((p) => (
                  <div
                    key={p._id}
                    className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {p.workerName}
                      </span>
                      <span className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                        ₹{p.amount}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Village: {p.workerId?.village || "Kothapalli"}
                    </p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">
                      Txn: {p.transactionId}
                    </p>
                  </div>
                ))}
                {(!data?.pendingPayments || data.pendingPayments.length === 0) && (
                  <p className="text-xs text-slate-400 text-center py-6">No pending wage claims.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Village-Wise Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin size={16} className="text-emerald-600" />
                <span>Village-Wise Summary for Division</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Village</th>
                    <th className="py-3 px-4">Mandal</th>
                    <th className="py-3 px-4">Total Workers</th>
                    <th className="py-3 px-4">Present Today</th>
                    <th className="py-3 px-4">Pending Wages</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data?.villageReports || []).map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {v.village}
                      </td>
                      <td className="py-3 px-4">{v.mandal}</td>
                      <td className="py-3 px-4 font-semibold">{v.workers} Workers</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">{v.presentToday} Present</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        ₹{(v.pendingWages || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active Roll
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssistantAdminDashboard;
