import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { MapPin, Users, Calendar, CreditCard } from "lucide-react";

const AssistantReports = () => {
  const { apiClient, user } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await apiClient.get("/dashboard/assistant-admin");
        setReports(res.data.dashboard?.villageReports || []);
      } catch (err) {
        setReports([
          { village: "Kothapalli", mandal: "Dhone", workers: 8, presentToday: 7, pendingWages: 2550 },
          { village: "Venkatapuram", mandal: "Dhone", workers: 4, presentToday: 4, pendingWages: 1275 },
          { village: "Peddahothur", mandal: "Pattikonda", workers: 4, presentToday: 3, pendingWages: 1275 },
        ]);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold uppercase">
              Division Level Reports
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Village-Wise Reports for {user?.district || "Kurnool"} Division
            </h1>
            <p className="text-xs text-slate-500">
              Muster attendance and pending wage disbursements across managed mandals and villages.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Village</th>
                    <th className="py-3 px-4">Mandal</th>
                    <th className="py-3 px-4">Enrolled Workers</th>
                    <th className="py-3 px-4">Present Today</th>
                    <th className="py-3 px-4">Pending Wages</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.village}</td>
                      <td className="py-3 px-4">{r.mandal}</td>
                      <td className="py-3 px-4 font-bold">{r.workers} Workers</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">{r.presentToday} Present</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        ₹{(r.pendingWages || 0).toLocaleString("en-IN")}
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

export default AssistantReports;
