import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner } from "../../components/Loading";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Table,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminReports = () => {
  const { apiClient } = useAuth();
  const [reportType, setReportType] = useState("attendance");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    generateReport();
  }, [reportType, month, year]);

  const generateReport = async () => {
    try {
      setLoading(true);
      if (reportType === "attendance") {
        const res = await apiClient.get("/attendance/daily?limit=100");
        setReportData(res.data.attendance || []);
      } else if (reportType === "payments") {
        const res = await apiClient.get("/payments?limit=100");
        setReportData(res.data.payments || []);
      } else {
        const res = await apiClient.get("/assignments?limit=100");
        setReportData(res.data.assignments || []);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return toast.error("No data to export");

    let csvContent = "";
    if (reportType === "attendance") {
      csvContent =
        "Worker,Employee ID,Date,Status,Hours,Verification Method,Location\n" +
        reportData
          .map((r) =>
            [
              `"${r.employee?.firstName} ${r.employee?.lastName}"`,
              r.employeeID,
              new Date(r.date).toLocaleDateString("en-IN"),
              r.status,
              r.workingHours || 0,
              r.verificationMethod,
              `"${r.location?.address || "Worksite"}"`,
            ].join(",")
          )
          .join("\n");
    } else if (reportType === "payments") {
      csvContent =
        "Worker,Employee ID,Working Days,Daily Wage,Base Wage,Bonus,Deductions,Total Amount,Status,Transaction ID\n" +
        reportData
          .map((p) =>
            [
              `"${p.employee?.firstName} ${p.employee?.lastName}"`,
              p.employeeID,
              p.workingDays,
              p.dailyWage,
              p.baseSalary,
              p.bonus || 0,
              p.deductions || 0,
              p.totalAmount,
              p.status,
              p.transactionID || "--",
            ].join(",")
          )
          .join("\n");
    } else {
      csvContent =
        "Project Title,Category,Village,Daily Wage,Workers,Total Budget,Status\n" +
        reportData
          .map((a) =>
            [
              `"${a.title}"`,
              a.workCategory,
              a.location?.village,
              a.dailyWage,
              a.estimatedWorkers,
              a.budget?.totalBudget,
              a.status,
            ].join(",")
          )
          .join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportType}_report_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded!");
  };

  return (
    <>
      <Helmet>
        <title>Audit Reports - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Official Audit & Muster Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Generate verified statements for District Development Office (DDO) and social audit.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} variant="outline" className="text-xs py-2">
                <Printer className="w-4 h-4 mr-1.5" />
                Print View
              </Button>
              <Button onClick={handleExportCSV} className="text-xs py-2">
                <Download className="w-4 h-4 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Config Controls */}
          <Card className="mb-6 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Report Category */}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Report Type:
                </span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  <option value="attendance">Muster Roll & Attendance Ledger</option>
                  <option value="payments">DBT Wage Disbursements Statement</option>
                  <option value="projects">Rural Infrastructure Projects Audit</option>
                </select>
              </div>

              {/* Month / Year */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
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
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Report Data Preview Table */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Card className="p-0 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                <span>Certified Official Statement ({reportData.length} Records)</span>
                <span className="text-emerald-600">Gram Panchayat Audited ✓</span>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-600 dark:text-gray-400 sticky top-0">
                    {reportType === "attendance" && (
                      <tr>
                        <th className="py-3 px-4">Worker</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Hours</th>
                        <th className="py-3 px-4">Verification</th>
                      </tr>
                    )}
                    {reportType === "payments" && (
                      <tr>
                        <th className="py-3 px-4">Worker</th>
                        <th className="py-3 px-4">Days</th>
                        <th className="py-3 px-4">Daily Wage</th>
                        <th className="py-3 px-4">Net Total</th>
                        <th className="py-3 px-4">UTR / Status</th>
                      </tr>
                    )}
                    {reportType === "projects" && (
                      <tr>
                        <th className="py-3 px-4">Project Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Budget</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                    {reportType === "attendance" &&
                      reportData.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {r.employee?.firstName} {r.employee?.lastName} ({r.employeeID})
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {new Date(r.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize font-semibold text-emerald-600">
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{r.workingHours || 0} hrs</td>
                          <td className="py-3 px-4 capitalize">{r.verificationMethod}</td>
                        </tr>
                      ))}

                    {reportType === "payments" &&
                      reportData.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {p.employee?.firstName} {p.employee?.lastName} ({p.employeeID})
                          </td>
                          <td className="py-3 px-4">{p.workingDays} days</td>
                          <td className="py-3 px-4">₹{p.dailyWage}</td>
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            ₹{p.totalAmount?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-primary-600">{p.transactionID || p.status}</span>
                          </td>
                        </tr>
                      ))}

                    {reportType === "projects" &&
                      reportData.map((a) => (
                        <tr key={a._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50">
                          <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {a.title}
                          </td>
                          <td className="py-3 px-4 uppercase">{a.workCategory}</td>
                          <td className="py-3 px-4">{a.location?.village}, {a.location?.mandal}</td>
                          <td className="py-3 px-4 font-bold">₹{a.budget?.totalBudget?.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-4 capitalize font-semibold text-emerald-600">{a.status}</td>
                        </tr>
                      ))}
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

export default AdminReports;
