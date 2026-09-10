import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeAttendanceHistory = () => {
  const { apiClient } = useAuth();
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const start = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();

      const res = await apiClient.get(
        `/attendance/employee?startDate=${start}&endDate=${end}&limit=50`
      );
      setAttendance(res.data.attendance || []);
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendance.filter((rec) => {
    if (statusFilter === "all") return true;
    return rec.status === statusFilter;
  });

  const totalPresent = attendance.filter((r) => r.status === "present").length;
  const totalAbsent = attendance.filter((r) => r.status === "absent").length;
  const totalHalfDays = attendance.filter((r) => r.status === "half-day").length;
  const totalLeaves = attendance.filter((r) => r.status === "leave").length;
  const attendanceRate =
    attendance.length > 0
      ? Math.round(((totalPresent + totalHalfDays * 0.5) / attendance.length) * 100)
      : 0;

  const exportCSV = () => {
    if (attendance.length === 0) return toast.error("No records to export");
    const headers = ["Date,Status,Check-In,Check-Out,Hours,Method,Verified\n"];
    const rows = attendance.map((r) =>
      [
        new Date(r.date).toLocaleDateString("en-IN"),
        r.status,
        r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "--",
        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "--",
        r.workingHours || 0,
        r.verificationMethod,
        r.isVerified ? "Yes" : "No",
      ].join(",")
    );
    const blob = new Blob([headers.concat(rows.join("\n"))], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_${selectedMonth}_${selectedYear}.csv`;
    a.click();
    toast.success("Attendance report downloaded!");
  };

  return (
    <>
      <Helmet>
        <title>{t("attendanceMusterHistory")} - {t("appName")}</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t("attendanceMusterHistory")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                {t("attendanceHistorySub")}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <LanguageSwitcher />
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 shadow-xs transition"
              >
                <Download className="w-4 h-4 text-primary-500" />
                {t("downloadStatement")}
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="text-center p-4 border border-gray-200 dark:border-gray-700">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPresent}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("daysPresent")}</p>
            </Card>

            <Card className="text-center p-4 border border-gray-200 dark:border-gray-700">
              <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAbsent}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("daysAbsent")}</p>
            </Card>

            <Card className="text-center p-4 border border-gray-200 dark:border-gray-700">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHalfDays}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("halfDays")}</p>
            </Card>

            <Card className="text-center p-4 border border-gray-200 dark:border-gray-700">
              <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeaves}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("sanctionedLeave")}</p>
            </Card>

            <Card className="col-span-2 md:col-span-1 text-center p-4 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-800">
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                {t("attendanceRate")}
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {attendanceRate}%
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Target: &gt;80%</p>
            </Card>
          </div>

          {/* Filters Bar */}
          <Card className="mb-6 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t("selectPeriod")}:
                </span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December",
                  ].map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>

              {/* Status Pill Filters */}
              <div className="flex items-center gap-1.5">
                {["all", "present", "absent", "half-day", "leave"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                      statusFilter === st
                        ? "bg-primary-500 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Records Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              title="No attendance records found"
              description="No muster roll entries match your selected month or filter."
            />
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-4">{t("date")}</th>
                      <th className="py-3.5 px-4">{t("status")}</th>
                      <th className="py-3.5 px-4">{t("inOutTime")}</th>
                      <th className="py-3.5 px-4">{t("hours")}</th>
                      <th className="py-3.5 px-4">{t("verification")}</th>
                      <th className="py-3.5 px-4">{t("locationRemarks")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRecords.map((record) => {
                      const dateObj = new Date(record.date);
                      return (
                        <tr
                          key={record._id}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition"
                        >
                          <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {dateObj.toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                  : record.status === "absent"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : record.status === "half-day"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            {record.checkInTime ? (
                              <span>
                                {new Date(record.checkInTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {record.checkOutTime
                                  ? new Date(record.checkOutTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "In Progress"}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            {record.workingHours ? `${record.workingHours} hrs` : "--"}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {record.verificationMethod?.replace("-", " ")}
                            {record.isVerified && (
                              <span className="ml-1.5 text-emerald-600 font-bold" title="Supervisor Verified">
                                ✓
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {record.location?.address || record.remarks || "Panchayat Worksite"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeeAttendanceHistory;
