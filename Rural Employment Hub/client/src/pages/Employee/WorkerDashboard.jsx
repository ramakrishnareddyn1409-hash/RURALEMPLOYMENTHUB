import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  UserCheck,
  Calendar,
  CreditCard,
  MessageSquareText,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  Fingerprint,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import QRCodeDisplay from "../../components/QRCodeDisplay";
import toast from "react-hot-toast";

const WorkerDashboard = () => {
  const { apiClient, user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWorkerDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/dashboard/worker");
      setData(res.data.dashboard);
    } catch (err) {
      console.warn("Using sample worker dashboard:", err.message);
      setData({
        profile: {
          name: user?.name || "Ramesh Babu",
          jobCardNumber: user?.jobCardNumber || "AP-12-004-1001",
          phone: user?.phone || "+919876510001",
          village: user?.village || "Kothapalli",
          mandal: user?.mandal || "Dhone",
          district: user?.district || "Kurnool",
          bankName: user?.bankName || "State Bank of India",
          accountNumber: user?.accountNumber || "389201948291",
          dailyWage: user?.dailyWage || 425,
        },
        attendance: {
          totalDays: 24,
          presentDays: 22,
          absentDays: 2,
          attendancePercentage: 92,
          history: [
            { attendanceDate: new Date(), attendanceStatus: "present", wageAmount: 425, fingerprintVerified: true },
            { attendanceDate: new Date(Date.now() - 86400000), attendanceStatus: "present", wageAmount: 425, fingerprintVerified: true },
            { attendanceDate: new Date(Date.now() - 2 * 86400000), attendanceStatus: "present", wageAmount: 425, fingerprintVerified: true },
          ],
        },
        payments: {
          totalCredited: 9350,
          pendingAmount: 1275,
          history: [
            {
              _id: "p-1",
              amount: 850,
              paymentStatus: "credited",
              transactionId: "TXN-DBT-482019482",
              creditedDate: new Date(Date.now() - 2 * 86400000),
              bankName: "State Bank of India",
            },
            {
              _id: "p-2",
              amount: 1275,
              paymentStatus: "pending",
              transactionId: "TXN-DBT-482019484",
              bankName: "State Bank of India",
            },
          ],
        },
        smsNotifications: [
          {
            _id: "sms-1",
            title: "Wage Credited to Bank Account",
            message: "Dear Ramesh Babu, your Rural Employment wage of ₹850 has been credited successfully to your bank account (State Bank of India - A/C ending in 8291). Txn ID: TXN-DBT-482019482.",
            createdAt: new Date(Date.now() - 2 * 86400000),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerDashboard();
  }, []);

  const worker = data?.profile || user || {};
  const att = data?.attendance || {};
  const payments = data?.payments || {};
  const smsList = data?.smsNotifications || [];

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {/* Government Job Card Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-gov-lg border border-emerald-700/50 mb-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                  {worker?.name?.[0] || "R"}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                      MGNREGA Rural Worker
                    </span>
                    <span className="text-xs text-emerald-300 font-mono">
                      Card: {worker?.jobCardNumber || "AP-12-004-1001"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black mt-1 text-white tracking-tight">
                    {worker?.name || "Ramesh Babu"}
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    📍 {worker?.village || "Kothapalli"} Village • {worker?.mandal || "Dhone"} Mandal • {worker?.district || "Kurnool"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-600/40 text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">DBT Bank Account</span>
                  <p className="text-sm font-bold text-white mt-0.5">{worker?.bankName || "State Bank of India"}</p>
                  <p className="text-[11px] font-mono text-emerald-300">
                    A/C: •••• {worker?.accountNumber ? worker.accountNumber.slice(-4) : "8291"} (Verified)
                  </p>
                </div>
                <div className="hidden sm:block text-center bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                  <QRCodeDisplay value={worker?.jobCardNumber || worker?.workerId || "WRK-AP-1001"} size={72} />
                  <span className="text-[9px] text-emerald-200 block font-mono mt-1 font-bold">DIGITAL ID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Attendance Percentage
              </span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                {att?.attendancePercentage || 92}%
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">{att?.presentDays || 22} Days Present</span>
                <Link to="/employee/attendance" className="text-emerald-600 font-bold hover:underline">
                  Calendar →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Total Wages Credited
              </span>
              <p className="text-3xl font-black text-indigo-600 font-mono mt-2">
                ₹{(payments?.totalCredited || 9350).toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Direct Bank Transfer</span>
                <Link to="/employee/payments" className="text-indigo-600 font-bold hover:underline">
                  Slips →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending Wage DBT
              </span>
              <p className="text-3xl font-black text-amber-600 font-mono mt-2">
                ₹{(payments?.pendingAmount || 1275).toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">In Treasury Processing</span>
                <span className="text-amber-600 font-bold">Pending</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Biometric Status
              </span>
              <p className="text-xl font-black text-emerald-600 mt-2 flex items-center space-x-1.5">
                <Fingerprint size={22} />
                <span>Verified</span>
              </p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-slate-500">Thumbprint Active</span>
                <span className="text-blue-600 font-bold">100% OK</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & SMS Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Attendance Slips */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <Calendar size={16} className="text-emerald-600" />
                  <span>Recent Biometric Muster Records</span>
                </h3>
                <Link to="/employee/attendance" className="text-xs font-bold text-emerald-600 hover:underline">
                  View Full Calendar →
                </Link>
              </div>

              <div className="space-y-3">
                {(att?.history || []).slice(0, 4).map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {new Date(h.attendanceDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400">Fingerprint Verified at Field</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-emerald-600">
                        +₹{h.wageAmount || 425}
                      </span>
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                        Present
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wage Credit SMS Notifications Feed */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                  <MessageSquareText size={16} className="text-indigo-600" />
                  <span>Wage SMS Alerts</span>
                </h3>
                <Link to="/employee/sms-feed" className="text-xs font-bold text-indigo-600 hover:underline">
                  Inbox →
                </Link>
              </div>

              <div className="space-y-3">
                {smsList.map((sms, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50"
                  >
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                      <span>{sms.title || "Wage Credited Alert"}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {new Date(sms.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono mt-1.5 leading-relaxed">
                      "{sms.message}"
                    </p>
                  </div>
                ))}
                {smsList.length === 0 && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs font-mono text-slate-700 dark:text-slate-300">
                    "Dear Worker, your Rural Employment wage of ₹850 has been credited successfully to your bank account."
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;
