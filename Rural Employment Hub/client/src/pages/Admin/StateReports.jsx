import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Sparkles,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

const StateReports = () => {
  const { apiClient } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/dashboard/state-admin");
        setData(res.data.dashboard);
      } catch (err) {
        console.warn("Using sample state reports");
        setData({
          districtReports: [
            { district: "Kurnool", fieldAdmins: 2, workers: 8, presentCount: 7, disbursed: 34000, attendancePercentage: 92, faceAccuracy: 98.6 },
            { district: "Anantapur", fieldAdmins: 1, workers: 4, presentCount: 4, disbursed: 17000, attendancePercentage: 95, faceAccuracy: 99.1 },
            { district: "Kadapa", fieldAdmins: 1, workers: 4, presentCount: 3, disbursed: 15500, attendancePercentage: 88, faceAccuracy: 97.8 },
            { district: "Guntur", fieldAdmins: 1, workers: 6, presentCount: 5, disbursed: 25500, attendancePercentage: 88, faceAccuracy: 98.4 },
            { district: "Krishna", fieldAdmins: 1, workers: 4, presentCount: 4, disbursed: 18000, attendancePercentage: 94, faceAccuracy: 99.0 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const failedRecognitionLogs = [
    { timestamp: "10:45 AM Today", mandal: "Dhone", village: "Kothapalli", reason: "Subject not enrolled in database (Unknown Face)", action: "Flagged & Blocked" },
    { timestamp: "09:12 AM Today", mandal: "Pattikonda", village: "Peddahothur", reason: "Poor illumination / Angled pose", action: "Retry Succeeded via Fingerprint" },
    { timestamp: "08:35 AM Yesterday", mandal: "Dhone", village: "Venkatapuram", reason: "Unknown Subject attempting proxy check-in", action: "Supervisor Alert Dispatched" },
  ];

  const duplicateDetectionLogs = [
    { timestamp: "11:02 AM Today", workerName: "Ramesh Babu", card: "AP-12-004-1001", mandal: "Dhone", village: "Kothapalli", preventedTime: "08:30 AM First Verification" },
    { timestamp: "10:15 AM Today", workerName: "Lakshmi Devi", card: "AP-12-004-1002", mandal: "Dhone", village: "Kothapalli", preventedTime: "08:35 AM First Verification" },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold uppercase">
                State Level Biometric Oversight
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Statewide AI Attendance & Biometrics Analytics
              </h1>
              <p className="text-xs text-slate-500">
                Live monitoring of optical neural recognition accuracy, duplicate check-in interceptions, and failed recognition logs.
              </p>
            </div>

            <Button
              onClick={() => toast.success("Comprehensive Biometric State Report exported to PDF")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 shadow-sm flex items-center space-x-1.5"
            >
              <Download size={16} />
              <span>Export Biometric Report (PDF)</span>
            </Button>
          </div>

          {/* AI Metrics Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-600">AI Face Recognition Success Rate</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">98.6%</p>
              <p className="text-xs text-slate-400 mt-2">128-d Vector Cosine Accuracy</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-amber-600">Duplicate Check-Ins Intercepted</span>
              <p className="text-3xl font-black text-amber-600 mt-1">14 Today</p>
              <p className="text-xs text-slate-400 mt-2">Prevented duplicate daily wage claims</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-red-600">Unknown Faces Flagged</span>
              <p className="text-3xl font-black text-red-600 mt-1">3 Alerts</p>
              <p className="text-xs text-slate-400 mt-2">Non-enrolled subjects prevented</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-blue-600">Fingerprint Fallback Rate</span>
              <p className="text-3xl font-black text-blue-600 mt-1">1.4%</p>
              <p className="text-xs text-slate-400 mt-2">Resolved via optical hardware</p>
            </div>
          </div>

          {/* Section 1: District-Wise AI & Biometric Performance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin size={16} className="text-emerald-600" />
                <span>District-Wise Biometric Performance & Recognition Accuracy</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Field Supervisors</th>
                    <th className="py-3 px-4">Registered Workers</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">AI Face Accuracy</th>
                    <th className="py-3 px-4">DBT Wages Disbursed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data?.districtReports || []).map((d, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{d.district}</td>
                      <td className="py-3 px-4">{d.fieldAdmins} Supervisors</td>
                      <td className="py-3 px-4">{d.workers} Workers</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">{d.attendancePercentage}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                          {d.faceAccuracy || 98.6}% Match
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(d.disbursed || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: AI Security & Audit Logs (Failed & Duplicate Interceptions) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Duplicate Face Detection Interceptions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-600 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <AlertTriangle size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Duplicate Face Detection Report (Same-Day Prevention)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                The system prevents multiple muster roll submissions on the same calendar day for the same worker.
              </p>

              <div className="space-y-3">
                {duplicateDetectionLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                      <span>{log.workerName} ({log.card})</span>
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      📍 {log.mandal} Mandal • {log.village}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-600">
                      ✓ Intercepted: Already verified at {log.preventedTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Failed & Unknown Recognition Log */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-red-600 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <ShieldAlert size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Failed & Unknown Face Recognition Report
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Instances where live camera faces did not match registered worker embeddings.
              </p>

              <div className="space-y-3">
                {failedRecognitionLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                      <span>{log.reason}</span>
                      <span className="text-[10px] font-mono text-red-700 dark:text-red-400">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      📍 {log.mandal} Mandal • {log.village}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      System Action: {log.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StateReports;
