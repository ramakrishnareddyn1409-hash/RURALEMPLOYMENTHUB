import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import LocationFilterBar from "../../components/LocationFilterBar";
import BiometricScanner from "../../components/BiometricScanner";
import {
  getAllStates,
  getDistricts,
  getMandals,
  getPanchayats,
  getVillages,
} from "../../data/locationHierarchy";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Camera,
  Fingerprint,
  CreditCard,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminEmployees = () => {
  const { apiClient } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Hierarchy filter state
  const [locationFilters, setLocationFilters] = useState({
    state: "all",
    district: "all",
    mandal: "all",
    panchayat: "all",
    village: "all",
  });

  // Enrollment Wizard Step (1: Info & Location, 2: Face Scan, 3: Fingerprint, 4: Bank & OTP)
  const [enrollStep, setEnrollStep] = useState(1);

  // Bank OTP state in enrollment
  const [bankOtpSent, setBankOtpSent] = useState(false);
  const [bankOtp, setBankOtp] = useState("");
  const [bankOtpLoading, setBankOtpLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState("");

  // New worker form state
  const [newWorker, setNewWorker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "Employee@123",
    state: "Andhra Pradesh",
    district: "Kurnool",
    mandal: "Dhone",
    panchayat: "Venkatapuram",
    village: "Venkatapuram Main",
    aadhaar: "",
    jobCardNumber: "",
    profilePhoto: null,
    faceRecognitionData: null,
    fingerprintData: null,
    bankName: "State Bank of India",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "SBIN0001234",
    bankVerified: false,
  });

  useEffect(() => {
    fetchEmployees();
  }, [locationFilters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100" });
      if (locationFilters.state !== "all") params.append("state", locationFilters.state);
      if (locationFilters.district !== "all") params.append("district", locationFilters.district);
      if (locationFilters.mandal && locationFilters.mandal !== "all") params.append("mandal", locationFilters.mandal);
      if (locationFilters.panchayat !== "all") params.append("panchayat", locationFilters.panchayat);
      if (locationFilters.village !== "all") params.append("village", locationFilters.village);

      const res = await apiClient.get(`/users/all?${params.toString()}`);
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to load worker directory");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFilterChange = (filters) => {
    setLocationFilters(filters);
  };

  const handleResetLocationFilters = () => {
    setLocationFilters({
      state: "all",
      district: "all",
      mandal: "all",
      panchayat: "all",
      village: "all",
    });
  };

  // Step 4: Send OTP for bank verification in enrollment
  const handleSendBankOtp = async () => {
    if (!newWorker.phone || newWorker.phone.length < 10) {
      return toast.error("Please enter a valid mobile number in Step 1 first");
    }
    try {
      setBankOtpLoading(true);
      // Simulate/Trigger OTP send
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtpHint(mockOtp);
      setBankOtp(mockOtp);
      setBankOtpSent(true);
      toast.success(`OTP sent to ${newWorker.phone}! (Code: ${mockOtp})`);
    } finally {
      setBankOtpLoading(false);
    }
  };

  const handleVerifyBankOtp = () => {
    if (!bankOtp || bankOtp.trim().length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }
    setNewWorker((prev) => ({ ...prev, bankVerified: true }));
    toast.success("Bank Account OTP Verified successfully! DBT Payment Connected.");
  };

  const handleCompleteEnrollment = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...newWorker,
        accountHolderName: newWorker.accountHolderName || `${newWorker.firstName} ${newWorker.lastName}`,
      };

      await apiClient.post("/users/enroll-facial-worker", payload);
      toast.success(`New worker ${newWorker.firstName} enrolled with biometric ID!`);

      // Reset and close
      setShowAddModal(false);
      setEnrollStep(1);
      setBankOtpSent(false);
      setBankOtp("");
      setNewWorker({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "Employee@123",
        state: "Andhra Pradesh",
        district: "Kurnool",
        mandal: "Dhone",
        panchayat: "Venkatapuram",
        village: "Venkatapuram Main",
        aadhaar: "",
        jobCardNumber: "",
        profilePhoto: null,
        faceRecognitionData: null,
        fingerprintData: null,
        bankName: "State Bank of India",
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "SBIN0001234",
        bankVerified: false,
      });

      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await apiClient.delete(`/users/deactivate/${id}`);
      toast.success(`${name} has been deactivated`);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to deactivate worker");
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone?.includes(searchQuery) ||
      emp.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.district?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || emp.employmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Helmet>
        <title>Manage Workers & Biometrics - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Rural Worker Directory & Biometrics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Manage worker profiles, facial enrollment, fingerprint data, and OTP-verified bank accounts.
              </p>
            </div>
            <Button
              onClick={() => {
                setEnrollStep(1);
                setShowAddModal(true);
              }}
              className="py-2.5 px-4 shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll New Facial Worker
            </Button>
          </div>

          {/* Location Hierarchy Filter Bar */}
          <LocationFilterBar
            selectedState={locationFilters.state}
            selectedDistrict={locationFilters.district}
            selectedMandal={locationFilters.mandal}
            selectedPanchayat={locationFilters.panchayat}
            selectedVillage={locationFilters.village}
            onChange={handleLocationFilterChange}
            onReset={handleResetLocationFilters}
          />

          {/* Search & Filter Card */}
          <Card className="p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, phone, village, state..."
                  className="input py-2 pl-9 pr-4 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</span>
                {["all", "active", "inactive"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-primary-500 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Worker List Table */}
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No workers match your search or location filter"
              description="Try adjusting your state/district hierarchy or enroll a new facial worker."
            />
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-4">Worker & ID</th>
                      <th className="py-3.5 px-4">Jurisdiction (State / Dist / GP)</th>
                      <th className="py-3.5 px-4">Assigned Admin</th>
                      <th className="py-3.5 px-4">Biometric Enrollment</th>
                      <th className="py-3.5 px-4">Bank & DBT OTP</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filtered.map((emp) => (
                      <tr key={emp._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {emp.profilePhoto ? (
                              <img
                                src={emp.profilePhoto}
                                alt={emp.firstName}
                                className="w-10 h-10 rounded-xl object-cover border border-primary-300 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-rural flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {emp.firstName?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <span className="text-[11px] font-mono text-primary-600 dark:text-primary-400">
                                {emp.employeeID || "EMP-PENDING"}
                              </span>
                              <p className="text-[11px] text-gray-400">{emp.phone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {emp.village || "Venkatapuram"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            GP: {emp.panchayat || emp.village || "Venkatapuram"} • {emp.district || "Kurnool"}
                          </p>
                          <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                            {emp.state || "Andhra Pradesh"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          {emp.assignedAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              🛡️ {emp.assignedAdmin.firstName} {emp.assignedAdmin.lastName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              Unallocated
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium w-fit ${
                                emp.faceEnrolled || emp.profilePhoto
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                              }`}
                            >
                              <Camera className="w-3 h-3" />
                              {emp.faceEnrolled || emp.profilePhoto ? "Face Enrolled" : "No Face Data"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium w-fit ${
                                emp.fingerprintEnrolled || emp.fingerprintData
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                              }`}
                            >
                              <Fingerprint className="w-3 h-3" />
                              {emp.fingerprintEnrolled || emp.fingerprintData ? "Thumb Enrolled" : "No Fingerprint"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {emp.bankName || "State Bank of India"}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5 ${
                              emp.bankVerified
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {emp.bankVerified ? "OTP Verified" : "OTP Pending"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              emp.employmentStatus === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                          >
                            {emp.employmentStatus || "active"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="View Full Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeactivate(emp._id, `${emp.firstName} ${emp.lastName}`)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                              title="Deactivate Worker"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ══════════ ENROLL NEW FACIAL WORKER WIZARD MODAL ══════════ */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden my-8 animate-slide-in-down">
                {/* Header */}
                <div className="p-5 bg-gradient-rural text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <UserPlus className="w-5 h-5" /> Enroll New Facial Worker
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Personal info, State-District hierarchy, Face capture, Thumb scan & Bank OTP
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Steps Header */}
                <div className="grid grid-cols-4 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-center">
                  {[
                    { num: 1, label: "Profile & Location" },
                    { num: 2, label: "Face Capture" },
                    { num: 3, label: "Thumb Scan" },
                    { num: 4, label: "Bank & OTP" },
                  ].map((s) => (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setEnrollStep(s.num)}
                      className={`py-2 px-1 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                        enrollStep === s.num
                          ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          enrollStep === s.num
                            ? "bg-primary-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {s.num}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Step 1: Personal Details & Location Hierarchy */}
                {enrollStep === 1 && (
                  <div className="p-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b pb-2">
                      1. Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="First Name"
                        value={newWorker.firstName}
                        onChange={(e) => setNewWorker({ ...newWorker, firstName: e.target.value })}
                        required
                        placeholder="e.g. Ramesh"
                      />
                      <Input
                        label="Last Name"
                        value={newWorker.lastName}
                        onChange={(e) => setNewWorker({ ...newWorker, lastName: e.target.value })}
                        required
                        placeholder="e.g. Kumar"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Mobile Phone (for Bank OTP)"
                        type="tel"
                        value={newWorker.phone}
                        onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                        placeholder="+919876543210"
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={newWorker.email}
                        onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                        placeholder="ramesh@ruralhub.in"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Aadhaar Number"
                        value={newWorker.aadhaar}
                        onChange={(e) => setNewWorker({ ...newWorker, aadhaar: e.target.value })}
                        placeholder="12-digit Aadhaar"
                      />
                      <Input
                        label="MGNREGA Job Card Number"
                        value={newWorker.jobCardNumber}
                        onChange={(e) => setNewWorker({ ...newWorker, jobCardNumber: e.target.value })}
                        placeholder="AP-03-012-0045"
                      />
                    </div>

                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b pb-2 pt-2">
                      2. Location Hierarchy (State → District → Mandal → Panchayat → Village)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <select
                          value={newWorker.state}
                          onChange={(e) => {
                            const st = e.target.value;
                            const dists = getDistricts(st);
                            const firstDist = dists[0] || "";
                            const mands = getMandals(st, firstDist);
                            const firstMand = mands[0] || "";
                            const panchs = getPanchayats(st, firstDist, firstMand);
                            const firstPanch = panchs[0] || "";
                            const vills = getVillages(st, firstDist, firstMand, firstPanch);
                            setNewWorker({
                              ...newWorker,
                              state: st,
                              district: firstDist,
                              mandal: firstMand,
                              panchayat: firstPanch,
                              village: vills[0] || firstPanch,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                        >
                          {getAllStates().map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          District
                        </label>
                        <select
                          value={newWorker.district}
                          onChange={(e) => {
                            const d = e.target.value;
                            const mands = getMandals(newWorker.state, d);
                            const firstMand = mands[0] || "";
                            const panchs = getPanchayats(newWorker.state, d, firstMand);
                            const firstPanch = panchs[0] || "";
                            const vills = getVillages(newWorker.state, d, firstMand, firstPanch);
                            setNewWorker({
                              ...newWorker,
                              district: d,
                              mandal: firstMand,
                              panchayat: firstPanch,
                              village: vills[0] || firstPanch,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                        >
                          {getDistricts(newWorker.state).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Mandal / Block*
                        </label>
                        <select
                          value={newWorker.mandal}
                          onChange={(e) => {
                            const m = e.target.value;
                            const panchs = getPanchayats(newWorker.state, newWorker.district, m);
                            const firstPanch = panchs[0] || "";
                            const vills = getVillages(newWorker.state, newWorker.district, m, firstPanch);
                            setNewWorker({
                              ...newWorker,
                              mandal: m,
                              panchayat: firstPanch,
                              village: vills[0] || firstPanch,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                        >
                          {getMandals(newWorker.state, newWorker.district).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Gram Panchayat
                        </label>
                        <select
                          value={newWorker.panchayat}
                          onChange={(e) => {
                            const p = e.target.value;
                            const vills = getVillages(newWorker.state, newWorker.district, newWorker.mandal, p);
                            setNewWorker({
                              ...newWorker,
                              panchayat: p,
                              village: vills[0] || p,
                            });
                          }}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                        >
                          {getPanchayats(newWorker.state, newWorker.district, newWorker.mandal).map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Village / Habitation*
                        </label>
                        {getVillages(newWorker.state, newWorker.district, newWorker.mandal, newWorker.panchayat).length > 0 ? (
                          <select
                            value={newWorker.village}
                            onChange={(e) => setNewWorker({ ...newWorker, village: e.target.value })}
                            className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                          >
                            {getVillages(newWorker.state, newWorker.district, newWorker.mandal, newWorker.panchayat).map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={newWorker.village}
                            onChange={(e) => setNewWorker({ ...newWorker, village: e.target.value })}
                            className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            placeholder="Village Name"
                            required
                          />
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                      <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!newWorker.firstName || !newWorker.phone || !newWorker.email) {
                            return toast.error("Please fill in first name, email, and phone");
                          }
                          setEnrollStep(2);
                        }}
                      >
                        Proceed to Face Capture <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Live Facial Recognition Capture */}
                {enrollStep === 2 && (
                  <div className="p-6 space-y-4">
                    <div className="text-center max-w-md mx-auto mb-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Live Facial Photo & Biometric Descriptor Enrollment
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Use the webcam to capture the worker's facial profile. The algorithm extracts 128 biometric facial landmark points.
                      </p>
                    </div>

                    <BiometricScanner
                      mode="face"
                      purpose="enroll"
                      workerName={`${newWorker.firstName} ${newWorker.lastName}`}
                      onCaptureFace={(photoData, faceDesc) => {
                        setNewWorker((prev) => ({
                          ...prev,
                          profilePhoto: photoData,
                          faceRecognitionData: faceDesc,
                        }));
                        toast.success("Facial profile captured & linked to ID!");
                      }}
                      onComplete={() => setEnrollStep(3)}
                    />

                    <div className="pt-4 flex justify-between items-center border-t">
                      <Button variant="outline" onClick={() => setEnrollStep(1)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button onClick={() => setEnrollStep(3)}>
                        Proceed to Thumb Scan <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Fingerprint Scanning Enrollment */}
                {enrollStep === 3 && (
                  <div className="p-6 space-y-4">
                    <div className="text-center max-w-md mx-auto mb-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Thumb / Fingerprint Biometric Scanner Enrollment
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Place the worker's thumb on the biometric sensor pad to register ridge minutiae.
                      </p>
                    </div>

                    <BiometricScanner
                      mode="fingerprint"
                      purpose="enroll"
                      workerName={`${newWorker.firstName} ${newWorker.lastName}`}
                      onCaptureFingerprint={(fpToken) => {
                        setNewWorker((prev) => ({ ...prev, fingerprintData: fpToken }));
                        toast.success("Thumb fingerprint scanned and encoded!");
                      }}
                      onComplete={() => setEnrollStep(4)}
                    />

                    <div className="pt-4 flex justify-between items-center border-t">
                      <Button variant="outline" onClick={() => setEnrollStep(2)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button onClick={() => setEnrollStep(4)}>
                        Proceed to Bank & OTP <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Bank Account Details & OTP Verification */}
                {enrollStep === 4 && (
                  <div className="p-6 space-y-4">
                    <div className="border-b pb-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary-500" />
                        Bank Account Details & OTP Confirmation
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Verify bank account details with an OTP before activating Direct Benefit Transfer (DBT).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Bank Name"
                        value={newWorker.bankName}
                        onChange={(e) => setNewWorker({ ...newWorker, bankName: e.target.value })}
                        placeholder="State Bank of India"
                        required
                      />
                      <Input
                        label="Account Holder Name"
                        value={newWorker.accountHolderName || `${newWorker.firstName} ${newWorker.lastName}`}
                        onChange={(e) => setNewWorker({ ...newWorker, accountHolderName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Account Number"
                        value={newWorker.accountNumber}
                        onChange={(e) => setNewWorker({ ...newWorker, accountNumber: e.target.value })}
                        placeholder="30294857102"
                        required
                      />
                      <Input
                        label="IFSC Code"
                        value={newWorker.ifscCode}
                        onChange={(e) => setNewWorker({ ...newWorker, ifscCode: e.target.value })}
                        placeholder="SBIN0001234"
                        required
                      />
                    </div>

                    {/* OTP Box */}
                    <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/50 dark:bg-primary-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-primary-600" />
                            Bank Account OTP Verification
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Sends a 6-digit confirmation code to registered mobile:{" "}
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {newWorker.phone || "+919876543210"}
                            </span>
                          </p>
                        </div>
                        {newWorker.bankVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" /> OTP Verified
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendBankOtp}
                            loading={bankOtpLoading}
                            className="text-xs py-1.5 px-3"
                          >
                            {bankOtpSent ? "Resend OTP" : "Send OTP"}
                          </Button>
                        )}
                      </div>

                      {bankOtpSent && !newWorker.bankVerified && (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={bankOtp}
                            onChange={(e) => setBankOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="input py-1.5 px-3 text-sm font-mono tracking-widest text-center w-40"
                          />
                          <Button type="button" onClick={handleVerifyBankOtp} className="text-xs py-1.5 px-3">
                            Confirm OTP
                          </Button>
                          {devOtpHint && (
                            <span className="text-[11px] font-mono text-primary-600">
                              (Dev Code: {devOtpHint})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-between items-center border-t">
                      <Button variant="outline" onClick={() => setEnrollStep(3)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button
                        type="button"
                        loading={submitting}
                        disabled={submitting}
                        onClick={handleCompleteEnrollment}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Enrollment & Issue ID
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ VIEW WORKER MODAL ══════════ */}
          {selectedEmployee && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {selectedEmployee.profilePhoto ? (
                      <img
                        src={selectedEmployee.profilePhoto}
                        alt={selectedEmployee.firstName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-400"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-rural text-white font-bold text-xl flex items-center justify-center">
                        {selectedEmployee.firstName?.[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h3>
                      <p className="text-xs text-primary-600 font-mono font-bold">
                        {selectedEmployee.employeeID}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 py-3 border-y border-gray-100 dark:border-gray-700">
                  <p className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-medium">{selectedEmployee.phone}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{selectedEmployee.email}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Location Jurisdiction:</span>
                    <span className="font-medium text-right">
                      {selectedEmployee.village}, GP: {selectedEmployee.panchayat || selectedEmployee.village},{" "}
                      {selectedEmployee.district}, {selectedEmployee.state || "Andhra Pradesh"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Face Recognition:</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedEmployee.faceEnrolled || selectedEmployee.profilePhoto ? "✓ Registered" : "Pending"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Fingerprint Scanner:</span>
                    <span className="font-semibold text-blue-600">
                      {selectedEmployee.fingerprintEnrolled || selectedEmployee.fingerprintData ? "✓ Enrolled" : "Pending"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">Bank Details & DBT OTP:</span>
                    <span className="font-medium">
                      {selectedEmployee.bankName || "SBI"} ({selectedEmployee.bankVerified ? "OTP Verified ✓" : "Pending"})
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-2 flex justify-end">
                  <Button onClick={() => setSelectedEmployee(null)} className="text-xs py-2">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminEmployees;
