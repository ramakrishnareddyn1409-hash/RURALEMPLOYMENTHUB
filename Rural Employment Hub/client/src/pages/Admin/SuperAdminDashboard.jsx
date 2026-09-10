import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import {
  Crown,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  Filter,
  CheckCheck,
  AlertCircle,
  FileText,
  UserPlus,
  RefreshCw,
  Search,
  MapPin,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const SuperAdminDashboard = () => {
  const { user, apiClient } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "reports", "payments", "allocations"
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  // Super Admin Data
  const [overviewData, setOverviewData] = useState(null);
  const [allWorkers, setAllWorkers] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSuperAdminData();
  }, [selectedDate]);

  const fetchSuperAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, workersRes, adminsRes] = await Promise.all([
        apiClient.get(`/attendance/superadmin/overview?date=${selectedDate}`),
        apiClient.get("/users/all?limit=100"),
        apiClient.get("/users/admins/list"),
      ]);

      setOverviewData(overviewRes.data);
      setAllWorkers(workersRes.data.employees || []);
      setAdminsList(adminsRes.data.admins || []);
    } catch (error) {
      console.error("Super Admin Data Fetch Error:", error);
      toast.error("Failed to load Super Admin overview data");
    } finally {
      setLoading(false);
    }
  };

  // Batch Payment Approval for Super Admin
  const handleApprovePayments = async (adminId = "all") => {
    try {
      setApproving(true);
      const res = await apiClient.post("/attendance/superadmin/approve-payments", {
        date: selectedDate,
        adminId: adminId !== "all" ? adminId : undefined,
      });
      toast.success(res.data.message || "Wages approved successfully for DBT disbursement!");
      fetchSuperAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment approval failed");
    } finally {
      setApproving(false);
    }
  };

  // Re-assign worker to an Admin
  const handleAssignWorker = async (workerId, adminId) => {
    try {
      const res = await apiClient.put(`/users/${workerId}/assign-admin`, { adminId });
      toast.success(res.data.message || "Worker assignment updated!");
      fetchSuperAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update assignment");
    }
  };

  const filteredLogs = (overviewData?.recentAttendanceLogs || []).filter((log) => {
    const q = searchQuery.toLowerCase();
    const workerName = `${log.employee?.firstName || ""} ${log.employee?.lastName || ""}`.toLowerCase();
    const workerId = (log.employeeID || "").toLowerCase();
    const adminName = (log.adminName || "").toLowerCase();
    const village = (log.location?.address || "").toLowerCase();

    const matchesSearch = workerName.includes(q) || workerId.includes(q) || adminName.includes(q) || village.includes(q);
    const matchesAdmin =
      selectedAdminFilter === "all" ||
      (log.verifiedBy && log.verifiedBy.toString() === selectedAdminFilter) ||
      (log.adminCode && log.adminCode === selectedAdminFilter);

    return matchesSearch && matchesAdmin;
  });

  return (
    <>
      <Helmet>
        <title>Super Admin Governance Hub — Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Banner with Architecture Summary */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-amber-200" />
                  <span>State Level Super Admin Governance Hub</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  All Admins Attendance & DBT Wage Approval
                </h1>
                <p className="text-xs sm:text-sm text-white/90 max-w-2xl">
                  Centralized supervisory portal monitoring Field Supervisors (Admin A & Admin B), consolidated worker reports, and state treasury payment authorizations.
                </p>
              </div>

              {/* Date Selector & Refresh */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <Calendar className="w-4 h-4 text-white/80" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none [color-scheme:dark]"
                />
                <button
                  onClick={fetchSuperAdminData}
                  className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Visual Architecture Map Badge */}
            <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-amber-200 block">Top Level</span>
                <span className="font-bold">Super Admin Oversight</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-blue-200 block">Admin A</span>
                <span className="font-bold">Workers 1, 2, 3 (Dhone Zone)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">Admin B</span>
                <span className="font-bold">Workers 4, 5, 6 (Pattikonda)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-purple-200 block">DBT Payroll</span>
                <span className="font-bold">Direct State Treasury Transfer</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
            {[
              { id: "overview", label: "All Admins Attendance", icon: ShieldCheck },
              { id: "payments", label: "DBT Payment Approval", icon: Coins },
              { id: "reports", label: "Consolidated Worker Reports", icon: FileText },
              { id: "allocations", label: "Worker-to-Admin Allocations", icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === id
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* ══════════ TAB 1: ALL ADMINS ATTENDANCE BREAKDOWN ══════════ */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* High Level Stats Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Enrolled Workers</span>
                        <Users className="w-4 h-4 text-primary-500" />
                      </div>
                      <p className="text-2xl font-black mt-2">{overviewData?.overview?.totalEmployees || 0}</p>
                      <p className="text-[11px] text-gray-500 mt-1">Across all Admin jurisdictions</p>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Marked Attendance Today</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
                        {overviewData?.overview?.totalAttendanceMarked || 0}
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        {overviewData?.overview?.totalPresentToday || 0} Full Present
                      </p>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending DBT Approval</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">
                        ₹{overviewData?.overview?.totalPendingWages || 0}
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">Awaiting Super Admin Sign-off</p>
                    </Card>

                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Field Admins</span>
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-2xl font-black mt-2">{adminsList.filter(a => a.role === "admin").length} Supervisors</p>
                      <p className="text-[11px] text-gray-500 mt-1">Admin A & Admin B Active</p>
                    </Card>
                  </div>

                  {/* Admin A & Admin B Detailed Comparative Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {(overviewData?.adminBreakdown || []).filter(a => a.adminCode !== "SUPER_ADMIN").map((adm) => {
                      const isAdminA = adm.adminCode === "ADMIN_A";

                      return (
                        <Card
                          key={adm.adminId}
                          className={`p-6 border rounded-2xl shadow-sm ${
                            isAdminA
                              ? "border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/20 to-transparent"
                              : "border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/20 to-transparent"
                          }`}
                        >
                          {/* Admin Card Header */}
                          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                                  isAdminA ? "bg-blue-600" : "bg-emerald-600"
                                }`}
                              >
                                {isAdminA ? "A" : "B"}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                  {adm.adminName}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {adm.adminTitle} ({adm.email})
                                </p>
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isAdminA
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              }`}
                            >
                              {adm.adminCode}
                            </span>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 text-center mb-4">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Assigned Workers</span>
                              <span className="text-lg font-black">{adm.assignedWorkersCount}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block font-medium">Present Today</span>
                              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{adm.presentCount}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
                              <span className="text-[11px] text-amber-700 dark:text-amber-300 block font-medium">Wage Accrual</span>
                              <span className="text-lg font-black text-amber-700 dark:text-amber-300">₹{adm.totalWages}</span>
                            </div>
                          </div>

                          {/* Assigned Workers Roster under this Admin */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
                              <span>Assigned Workers:</span>
                              <span className="text-[11px] text-primary-600 font-semibold">{adm.completionRate}% Verified</span>
                            </h4>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {adm.assignedWorkers && adm.assignedWorkers.length > 0 ? (
                                adm.assignedWorkers.map((w, idx) => (
                                  <div
                                    key={w._id || idx}
                                    className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-[10px]">
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <span className="font-bold block">{w.firstName} {w.lastName}</span>
                                        <span className="text-[10px] text-gray-500">{w.employeeID} • {w.village}</span>
                                      </div>
                                    </div>

                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                      Marked by {adm.adminCode}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400 italic py-2 text-center">No workers assigned to this admin yet.</p>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions for this Admin */}
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Pending DBT Approval: <strong className="text-amber-600">₹{adm.pendingApprovalCount * 320}</strong>
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleApprovePayments(adm.adminId)}
                              disabled={adm.pendingApprovalCount === 0 || approving}
                              className="text-xs font-bold"
                            >
                              <CheckCheck className="w-3.5 h-3.5 mr-1" />
                              Approve {adm.adminCode} Wages
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════ TAB 2: SUPER ADMIN PAYMENT APPROVAL (DBT) ══════════ */}
              {activeTab === "payments" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Coins className="w-5 h-5 text-amber-500" />
                          Direct Benefit Transfer (DBT) Wage Authorization Portal
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Review daily muster hours marked by Admin A and Admin B, then sanction state treasury wage credits.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleApprovePayments("all")}
                          loading={approving}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCheck className="w-4 h-4 mr-1.5" />
                          Approve All Verified Wages for Today
                        </Button>
                      </div>
                    </div>

                    {/* Pending Table */}
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 uppercase font-bold">
                          <tr>
                            <th className="py-3 px-4">Worker / Job Card</th>
                            <th className="py-3 px-4">Supervising Admin</th>
                            <th className="py-3 px-4">Worksite / GP</th>
                            <th className="py-3 px-4">Status & Hours</th>
                            <th className="py-3 px-4">Daily Wage</th>
                            <th className="py-3 px-4">DBT Authorization</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {overviewData?.recentAttendanceLogs && overviewData.recentAttendanceLogs.length > 0 ? (
                            overviewData.recentAttendanceLogs.map((log) => (
                              <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td className="py-3 px-4 font-semibold">
                                  <span className="block text-gray-900 dark:text-white">
                                    {log.employee?.firstName} {log.employee?.lastName}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    {log.employeeID || log.employee?.employeeID}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {log.adminName || log.adminCode || "Field Admin"}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                  {log.location?.address || `${log.employee?.village}, ${log.employee?.mandal}`}
                                </td>

                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                                      log.status === "present"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    }`}
                                  >
                                    {log.status} ({log.workingHours || 8} hrs)
                                  </span>
                                </td>

                                <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                  ₹{log.wageAmount || 320}
                                </td>

                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                      log.paymentStatus === "approved" || log.paymentStatus === "credited"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    }`}
                                  >
                                    {log.paymentStatus === "approved" ? (
                                      <>
                                        <CheckCheck className="w-3.5 h-3.5" /> Approved by Super Admin
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="w-3.5 h-3.5" /> Pending Authorization
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-gray-400">
                                No attendance records found for {selectedDate}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════ TAB 3: CONSOLIDATED WORKER REPORTS ══════════ */}
              {activeTab === "reports" && (
                <div className="space-y-4">
                  {/* Search & Filter Bar */}
                  <Card className="p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filter reports by worker, Admin A, Admin B, village..."
                          className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">Filter by Admin:</span>
                        <select
                          value={selectedAdminFilter}
                          onChange={(e) => setSelectedAdminFilter(e.target.value)}
                          className="text-xs font-semibold py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          <option value="all">All Field Admins</option>
                          {adminsList.filter(a => a.role === "admin").map((adm) => (
                            <option key={adm._id} value={adm._id}>
                              {adm.adminCode} — {adm.firstName} {adm.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </Card>

                  {/* Reports List */}
                  <Card className="p-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 uppercase font-bold">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Worker</th>
                            <th className="py-3 px-4">Marked By (Admin)</th>
                            <th className="py-3 px-4">Verification Method</th>
                            <th className="py-3 px-4">Worksite Coordinates</th>
                            <th className="py-3 px-4">Wage Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="py-3 px-4 font-mono font-semibold">
                                {new Date(log.date).toLocaleDateString("en-IN")}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold block text-gray-900 dark:text-white">
                                  {log.employee?.firstName} {log.employee?.lastName}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">{log.employeeID}</span>
                              </td>
                              <td className="py-3 px-4 font-bold text-primary-600 dark:text-primary-400">
                                {log.adminName || log.adminCode || "Field Supervisor"}
                              </td>
                              <td className="py-3 px-4 capitalize">
                                {log.verificationMethod?.replace("-", " ")}
                              </td>
                              <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                                {log.location?.address || "GPS Geofence Verified"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                    log.paymentStatus === "approved"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                  }`}
                                >
                                  ₹{log.wageAmount || 320} • {log.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* ══════════ TAB 4: WORKER-TO-ADMIN ALLOCATION MANAGER ══════════ */}
              {activeTab === "allocations" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Worker to Field Admin Jurisdiction Allocation
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Assign workers between Admin A (Dhone) and Admin B (Pattikonda) to control who takes their muster.
                      </p>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                      {allWorkers.length} Workers Registered
                    </span>
                  </div>

                  <Card className="p-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 uppercase font-bold">
                          <tr>
                            <th className="py-3 px-4">Worker ID & Name</th>
                            <th className="py-3 px-4">Location (Mandal, GP, Village)</th>
                            <th className="py-3 px-4">Currently Assigned Admin</th>
                            <th className="py-3 px-4 text-right">Reassign / Change Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {allWorkers.map((w) => (
                            <tr key={w._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60">
                              <td className="py-3 px-4 font-semibold">
                                <span className="block text-gray-900 dark:text-white">
                                  {w.firstName} {w.lastName}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">{w.employeeID}</span>
                              </td>

                              <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                {w.village}, {w.panchayat}, {w.mandal} ({w.district})
                              </td>

                              <td className="py-3 px-4">
                                {w.assignedAdmin ? (
                                  <span className="inline-flex items-center gap-1 font-bold text-primary-600 dark:text-primary-400">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {w.assignedAdmin.firstName} {w.assignedAdmin.lastName} ({w.assignedAdmin.adminCode || "Admin"})
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">Unassigned (Pool)</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <select
                                  value={w.assignedAdmin?._id || ""}
                                  onChange={(e) => handleAssignWorker(w._id, e.target.value)}
                                  className="text-xs py-1.5 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold"
                                >
                                  <option value="">-- Select Admin --</option>
                                  {adminsList.filter(a => a.role === "admin").map((adm) => (
                                    <option key={adm._id} value={adm._id}>
                                      {adm.adminCode} • {adm.firstName} {adm.lastName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default SuperAdminDashboard;
