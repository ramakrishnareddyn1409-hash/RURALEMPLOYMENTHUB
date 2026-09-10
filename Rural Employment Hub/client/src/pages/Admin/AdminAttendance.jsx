import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import LocationFilterBar from "../../components/LocationFilterBar";
import BiometricScanner from "../../components/BiometricScanner";
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  ShieldCheck,
  MapPin,
  RefreshCw,
  CheckCheck,
  Camera,
  Fingerprint,
  UserCheck,
  X,
  FileSpreadsheet,
  Printer,
  Download,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import toast from "react-hot-toast";

const AdminAttendance = () => {
  const { user, apiClient } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

  // Location filter state
  const [locationFilters, setLocationFilters] = useState({
    state: "all",
    district: "all",
    mandal: "all",
    panchayat: "all",
    village: "all",
  });

  // Biometric Record Modal state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedWorkerForAttendance, setSelectedWorkerForAttendance] = useState(null);
  const [workerSearchTerm, setWorkerSearchTerm] = useState("");
  const [recordingMethod, setRecordingMethod] = useState("face"); // "face" | "fingerprint"
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, locationFilters]);

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        date: selectedDate,
        limit: "100",
      });
      if (locationFilters.state !== "all") params.append("state", locationFilters.state);
      if (locationFilters.district !== "all") params.append("district", locationFilters.district);
      if (locationFilters.mandal && locationFilters.mandal !== "all") params.append("mandal", locationFilters.mandal);
      if (locationFilters.panchayat !== "all") params.append("panchayat", locationFilters.panchayat);
      if (locationFilters.village !== "all") params.append("village", locationFilters.village);

      const res = await apiClient.get(`/attendance/daily?${params.toString()}`);
      setAttendance(res.data.attendance || []);
    } catch (error) {
      console.error("Failed to fetch daily attendance:", error);
      toast.error("Failed to load muster records");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const res = await apiClient.get("/users/all?limit=100");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees list for muster");
    }
  };

  const handleVerify = async (id) => {
    try {
      setVerifyingId(id);
      await apiClient.put(`/attendance/verify/${id}`, { isVerified: true });
      toast.success("Attendance verified and locked for payroll");
      setAttendance((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isVerified: true } : item))
      );
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleBiometricComplete = async ({ method, photo }) => {
    if (!selectedWorkerForAttendance) {
      return toast.error("Please select a worker first");
    }

    try {
      setSubmittingAttendance(true);
      const payload = {
        employeeID: selectedWorkerForAttendance.employeeID,
        date: selectedDate,
        status: "present",
        verificationMethod: method === "face-recognition" ? "face-recognition" : "fingerprint",
        faceVerified: method === "face-recognition",
        fingerprintVerified: method === "fingerprint",
        location: {
          address: `${selectedWorkerForAttendance.village || "Venkatapuram"} Worksite, ${selectedWorkerForAttendance.district || "Kurnool"}`,
          latitude: 15.4214,
          longitude: 77.8762,
        },
        remarks: `Biometric Verified via ${method === "face-recognition" ? "Face Recognition" : "Thumb Fingerprint"} by Site Supervisor`,
      };

      await apiClient.post("/attendance/mark", payload);
      toast.success(
        `✓ ${selectedWorkerForAttendance.firstName}'s identity verified & attendance marked!`
      );
      setShowRecordModal(false);
      setSelectedWorkerForAttendance(null);
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const filtered = attendance.filter((item) => {
    const name = `${item.employee?.firstName} ${item.employee?.lastName}`.toLowerCase();
    const id = item.employeeID?.toLowerCase() || "";
    const village = item.employee?.village?.toLowerCase() || "";
    const district = item.employee?.district?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || id.includes(q) || village.includes(q) || district.includes(q);
  });

  const matchingWorkersForSelect = employees.filter((e) => {
    const q = workerSearchTerm.toLowerCase();
    return (
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeID?.toLowerCase().includes(q) ||
      e.phone?.includes(q)
    );
  });

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const halfDayCount = attendance.filter((a) => a.status === "half-day").length;
  const verifiedCount = attendance.filter((a) => a.isVerified).length;

  const exportHeaders = [
    { label: "Worker ID", key: "employeeID" },
    { label: "Worker Name", key: "employee.firstName" },
    { label: "Status", key: "status" },
    { label: "Verification Method", key: "verificationMethod" },
    { label: "Village", key: "employee.village" },
    { label: "Mandal", key: "employee.mandal" },
    { label: "District", key: "employee.district" },
    { label: "Payment Status", key: "paymentStatus" },
  ];

  const handleExportExcel = () => {
    exportToExcel(`Muster_Attendance_${selectedDate}`, `Attendance ${selectedDate}`, filtered, exportHeaders);
    toast.success("Muster report exported to Excel");
  };

  const handleExportPDF = () => {
    exportToPDF(
      `Muster_Attendance_${selectedDate}`,
      `Daily Muster Roll - ${selectedDate}`,
      `Verified Biometric Attendance Record for ${filtered.length} workers`,
      exportHeaders,
      filtered
    );
  };

  return (
    <>
      <Helmet>
        <title>Muster Roll & Biometric Attendance - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-[#fcfaf5] dark:bg-[#071308]">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Muster Roll Attendance Control
                </h1>
                {user?.role === "superadmin" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-300">
                    👑 Super Admin Control
                  </span>
                ) : user?.adminCode === "ADMIN_A" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-300">
                    🛡️ Admin A (Dhone / Zone A)
                  </span>
                ) : user?.adminCode === "ADMIN_B" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300">
                    🛡️ Admin B (Pattikonda / Zone B)
                  </span>
                ) : null}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Record worker attendance on-site using Face Recognition & Fingerprint scanner to prevent proxy attendance.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Date Picker */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
                <Calendar className="w-4 h-4 text-primary-500 ml-2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-0 text-sm font-semibold text-gray-800 dark:text-gray-200 focus:outline-none pr-2"
                />
              </div>

              {/* Export Buttons */}
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Export to Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Export / Print PDF"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>

              {/* Record Attendance Button */}
              <Button
                onClick={() => {
                  setSelectedWorkerForAttendance(null);
                  setShowRecordModal(true);
                }}
                className="py-2 px-3.5 shadow-sm text-xs"
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                Biometric Mark
              </Button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-gray-200 dark:border-gray-700 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Present on Site</p>
            </Card>
            <Card className="p-4 border border-gray-200 dark:border-gray-700 text-center">
              <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Marked Absent</p>
            </Card>
            <Card className="p-4 border border-gray-200 dark:border-gray-700 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{halfDayCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Half Days / Late</p>
            </Card>
            <Card className="p-4 border border-gray-200 dark:border-gray-700 text-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-800">
              <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {verifiedCount} / {attendance.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Locked for Payroll</p>
            </Card>
          </div>

          {/* Location Hierarchy Filter Bar */}
          <LocationFilterBar
            selectedState={locationFilters.state}
            selectedDistrict={locationFilters.district}
            selectedMandal={locationFilters.mandal}
            selectedPanchayat={locationFilters.panchayat}
            selectedVillage={locationFilters.village}
            onChange={(filters) => setLocationFilters((prev) => ({ ...prev, ...filters }))}
            onReset={() =>
              setLocationFilters({
                state: "all",
                district: "all",
                mandal: "all",
                panchayat: "all",
                village: "all",
              })
            }
          />

          {/* Search Bar */}
          <Card className="p-4 border border-gray-200 dark:border-gray-700">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search worker by name, ID, or village..."
                className="input py-2 pl-9 pr-4 text-xs"
              />
            </div>
          </Card>

          {/* Attendance Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No muster entries for this date / location"
              description="Click 'Record Biometric Attendance' above to scan a worker's face or thumb on site."
            />
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-4">Worker</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Recorded By</th>
                      <th className="py-3.5 px-4">Biometric Verification</th>
                      <th className="py-3.5 px-4">Worksite / GP</th>
                      <th className="py-3.5 px-4">DBT Payment Status</th>
                      <th className="py-3.5 px-4 text-right">Approve / Lock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {item.employee?.firstName} {item.employee?.lastName}
                          </p>
                          <span className="text-[11px] font-mono text-primary-600">
                            {item.employeeID}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              item.status === "present"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : item.status === "absent"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            🛡️ {item.adminName || item.adminCode || "Field Supervisor"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              item.verificationMethod === "face-recognition"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : item.verificationMethod === "fingerprint"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {item.verificationMethod === "face-recognition" && <Camera className="w-3.5 h-3.5" />}
                            {item.verificationMethod === "fingerprint" && <Fingerprint className="w-3.5 h-3.5" />}
                            {item.verificationMethod === "face-recognition"
                              ? "Face Verified"
                              : item.verificationMethod === "fingerprint"
                              ? "Thumb Verified"
                              : "Manual Verified"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-secondary-500 shrink-0" />
                            {item.employee?.village || "Venkatapuram"}, {item.employee?.district || "Kurnool"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              item.paymentStatus === "approved" || item.paymentStatus === "credited"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {item.paymentStatus === "approved"
                              ? "✓ Super Admin Approved (DBT)"
                              : item.paymentStatus === "credited"
                              ? "✓ Disbursed"
                              : "⏳ Pending Super Admin Approval"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {item.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCheck className="w-4 h-4" />
                              Approved
                            </span>
                          ) : (
                            <button
                              disabled={verifyingId === item._id}
                              onClick={() => handleVerify(item._id)}
                              className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                            >
                              Verify & Lock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ══════════ RECORD BIOMETRIC ATTENDANCE MODAL ══════════ */}
          {showRecordModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden my-8 animate-slide-in-down">
                <div className="p-4 bg-gradient-rural text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold text-base">On-Site Biometric Attendance Verification</h3>
                  </div>
                  <button
                    onClick={() => setShowRecordModal(false)}
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Step A: Select Worker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      1. Select Arriving Worker
                    </label>
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={workerSearchTerm}
                        onChange={(e) => setWorkerSearchTerm(e.target.value)}
                        placeholder="Search worker by name, ID or mobile..."
                        className="input py-2 pl-9 pr-3 text-xs"
                      />
                    </div>

                    <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50 dark:bg-gray-900">
                      {matchingWorkersForSelect.slice(0, 10).map((w) => (
                        <div
                          key={w._id}
                          onClick={() => setSelectedWorkerForAttendance(w)}
                          className={`p-2.5 px-3 flex justify-between items-center cursor-pointer transition text-xs ${
                            selectedWorkerForAttendance?._id === w._id
                              ? "bg-primary-100 dark:bg-primary-900/40 font-bold text-primary-800 dark:text-primary-200"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div>
                            <p className="font-bold">
                              {w.firstName} {w.lastName}
                            </p>
                            <span className="text-[11px] font-mono text-gray-500">
                              {w.employeeID} • {w.village}, {w.district}
                            </span>
                          </div>
                          {selectedWorkerForAttendance?._id === w._id && (
                            <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step B: Biometric Scanner */}
                  {selectedWorkerForAttendance && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          2. Biometric Scan for:{" "}
                          <span className="text-primary-600">
                            {selectedWorkerForAttendance.firstName} {selectedWorkerForAttendance.lastName}
                          </span>
                        </p>
                        <span className="text-[11px] font-mono text-gray-500">
                          {selectedWorkerForAttendance.employeeID}
                        </span>
                      </div>

                      <BiometricScanner
                        mode="face"
                        purpose="verify"
                        workerName={`${selectedWorkerForAttendance.firstName} ${selectedWorkerForAttendance.lastName}`}
                        workerId={selectedWorkerForAttendance.employeeID}
                        onComplete={handleBiometricComplete}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminAttendance;
