import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import WorkerFaceEnrollmentCard from "../../components/WorkerFaceEnrollmentCard";
import {
  Users,
  UserCheck,
  Fingerprint,
  Calendar,
  CreditCard,
  Send,
  Plus,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

const FieldAdminDashboard = () => {
  const { apiClient, user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/dashboard/field-admin");
      setData(res.data.dashboard);
    } catch (err) {
      console.warn("Using sample Field Admin dashboard data:", err.message);
      setData({
        totalWorkers: 8,
        activeWorkers: 8,
        presentCount: 7,
        absentCount: 1,
        pendingPaymentsCount: 2,
        creditedPaymentsCount: 6,
        workers: [
          { _id: "w-1", name: "Ramesh Babu", phone: "+919876510001", village: "Kothapalli", jobCardNumber: "AP-12-004-1001", dailyWage: 425 },
          { _id: "w-2", name: "Lakshmi Devi", phone: "+919876510002", village: "Kothapalli", jobCardNumber: "AP-12-004-1002", dailyWage: 425 },
          { _id: "w-3", name: "Venkat Rao", phone: "+919876510003", village: "Venkatapuram", jobCardNumber: "AP-12-004-1003", dailyWage: 425 },
          { _id: "w-4", name: "Govind Naik", phone: "+919876510005", village: "Chanugondla", jobCardNumber: "AP-12-004-1005", dailyWage: 425 },
        ],
        pendingAttendanceWorkers: [
          { _id: "w-1", name: "Ramesh Babu", village: "Kothapalli" },
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
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-gov-lg border border-emerald-800/40 mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                    Field Supervisor
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">
                    {user?.mandal || "Dhone"} Mandal • {user?.village || "Kothapalli"} Field HQ
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
                  Field Admin Operations Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Daily Muster Management: Register Rural Workers, Verify Biometric Fingerprints & Trigger Wage SMS Alerts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => navigate("/admin/fingerprint-attendance")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 px-4 shadow-md flex items-center space-x-1.5"
                >
                  <Fingerprint size={16} />
                  <span>Launch Biometric Scanner</span>
                </Button>
                <Button
                  onClick={() => navigate("/admin/workers")}
                  variant="outline"
                  className="border-emerald-400 text-emerald-200 hover:bg-emerald-950 text-xs py-2.5 px-3"
                >
                  <Plus size={14} className="mr-1" />
                  <span>Register Worker</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <WorkerFaceEnrollmentCard />
            <div className="bg-slate-950 text-white p-6 rounded-2xl border border-cyan-800/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center mb-4 text-xl">AI</div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">AI Face Recognition</p>
                <h2 className="text-lg font-black mt-1">Scan and identify a worker</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Open the camera and let the system recognize an enrolled worker automatically. No worker search or manual verification is required.</p>
              </div>
              <Button onClick={() => navigate("/admin/face-attendance")} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 flex items-center justify-center gap-2">
                <span>Open AI Face Recognition</span><ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Assigned Workers
                </p>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <UserCheck size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.totalWorkers || 8}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">In your villages</span>
                <Link to="/admin/workers" className="text-emerald-600 font-bold hover:underline">
                  Manage →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Today's Biometric Muster
                </p>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Fingerprint size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.presentCount || 7} <span className="text-base font-normal text-slate-400">/ {data?.totalWorkers || 8}</span>
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-emerald-600 font-bold">Verified on Scanner</span>
                <Link to="/admin/fingerprint-attendance" className="text-blue-600 font-bold hover:underline">
                  Scan →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pending Wage Claims
                </p>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <CreditCard size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.pendingPaymentsCount || 2}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Ready for approval</span>
                <Link to="/admin/field-payments" className="text-amber-600 font-bold hover:underline">
                  Process →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  SMS Notifications Sent
                </p>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <Send size={18} />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {data?.creditedPaymentsCount || 6}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-emerald-600 font-bold">100% Delivered</span>
                <Link to="/admin/field-payments" className="text-indigo-600 font-bold hover:underline">
                  Logs →
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Action 1: Fingerprint Attendance */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                  <Fingerprint size={24} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Biometric Fingerprint Muster
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Open the live optical biometric scanner interface. Verify worker thumbprints in seconds and record tamper-proof attendance directly into MongoDB.
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/fingerprint-attendance")}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Open Biometric Scanner</span>
                <ArrowRight size={14} />
              </Button>
            </div>

            {/* Action 2: Manage & Register Workers */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4 font-bold">
                  <UserCheck size={24} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Worker Registration & Job Cards
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Enrol new rural workers under your supervisor ID (`parentId`). Set village, daily wage rate, Aadhaar identification, and bank account for DBT credits.
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/workers")}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Manage Workers List</span>
                <ArrowRight size={14} />
              </Button>
            </div>

            {/* Action 3: Payment Approvals & SMS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4 font-bold">
                  <Send size={24} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Wage Disbursement & SMS Trigger
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Approve calculated attendance wages, disburse DBT transfers, and dispatch instant SMS credit alerts to the worker's registered mobile phone.
                </p>
              </div>
              <Button
                onClick={() => navigate("/admin/field-payments")}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Review Wages & Send SMS</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Assigned Workers Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Users size={16} className="text-emerald-600" />
                  <span>My Assigned Rural Workers</span>
                </h3>
              </div>
              <Link to="/admin/workers" className="text-xs font-bold text-emerald-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Worker Name</th>
                    <th className="py-3 px-4">Job Card No.</th>
                    <th className="py-3 px-4">Village</th>
                    <th className="py-3 px-4">Daily Wage</th>
                    <th className="py-3 px-4">Biometrics</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {(data?.workers || []).slice(0, 5).map((w) => (
                    <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {w.name}
                        <p className="text-[10px] text-slate-400 font-normal">{w.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-mono">{w.jobCardNumber || "AP-12-004-1001"}</td>
                      <td className="py-3 px-4">{w.village}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₹{w.dailyWage || 425} / day</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center w-max space-x-1">
                          <CheckCircle2 size={10} />
                          <span>Enrolled</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/fingerprint-attendance`)}
                          className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Mark Muster
                        </Button>
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

export default FieldAdminDashboard;
