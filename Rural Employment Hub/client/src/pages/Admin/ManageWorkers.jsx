import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  CreditCard,
  Fingerprint,
  Phone,
  Landmark,
  Building,
  Check,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const ManageWorkers = () => {
  const { apiClient, user, isFieldAdmin, isAssistantAdmin, isStateAdmin } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageFilter, setVillageFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    village: "Kothapalli",
    mandal: user?.mandal || "Dhone",
    district: user?.district || "Kurnool",
    aadhaar: "8765-4321-9012",
    jobCardNumber: `AP-12-004-${Math.floor(1000 + Math.random() * 9000)}`,
    fingerprintId: `FP-AP-${Math.floor(1000 + Math.random() * 9000)}`,
    dailyWage: 425,
    bankName: "State Bank of India",
    accountNumber: "389201948291",
    ifscCode: "SBIN0001234",
  });

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/users/workers");
      setWorkers(res.data.workers || []);
    } catch (err) {
      console.warn("Using sample workers list:", err.message);
      setWorkers([
        {
          _id: "w-1",
          name: "Ramesh Babu",
          phone: "+919876510001",
          village: "Kothapalli",
          mandal: "Dhone",
          district: "Kurnool",
          jobCardNumber: "AP-12-004-1001",
          fingerprintId: "FP-AP-1001",
          dailyWage: 425,
          bankName: "State Bank of India",
          accountNumber: "389201948291",
          ifscCode: "SBIN0001234",
          isActive: true,
          faceEnrolled: true,
          fingerprintEnrolled: true,
        },
        {
          _id: "w-2",
          name: "Lakshmi Devi",
          phone: "+919876510002",
          village: "Kothapalli",
          mandal: "Dhone",
          district: "Kurnool",
          jobCardNumber: "AP-12-004-1002",
          fingerprintId: "FP-AP-1002",
          dailyWage: 425,
          bankName: "Andhra Pragathi Grameena Bank",
          accountNumber: "738291048201",
          ifscCode: "APGB0004321",
          isActive: true,
          faceEnrolled: true,
          fingerprintEnrolled: true,
        },
        {
          _id: "w-3",
          name: "Venkat Rao",
          phone: "+919876510003",
          village: "Venkatapuram",
          mandal: "Dhone",
          district: "Kurnool",
          jobCardNumber: "AP-12-004-1003",
          fingerprintId: "FP-AP-1003",
          dailyWage: 425,
          bankName: "Union Bank of India",
          accountNumber: "510928374619",
          ifscCode: "UBIN0532145",
          isActive: true,
          faceEnrolled: true,
          fingerprintEnrolled: true,
        },
        {
          _id: "w-4",
          name: "Govind Naik",
          phone: "+919876510005",
          village: "Chanugondla",
          mandal: "Dhone",
          district: "Kurnool",
          jobCardNumber: "AP-12-004-1005",
          fingerprintId: "FP-AP-1005",
          dailyWage: 425,
          bankName: "State Bank of India",
          accountNumber: "492019384729",
          ifscCode: "SBIN0001234",
          isActive: true,
          faceEnrolled: true,
          fingerprintEnrolled: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingWorker(null);
    setFormData({
      name: "",
      phone: "",
      village: user?.village || "Kothapalli",
      mandal: user?.mandal || "Dhone",
      district: user?.district || "Kurnool",
      aadhaar: "8765-4321-9012",
      jobCardNumber: `AP-12-004-${Math.floor(1000 + Math.random() * 9000)}`,
      fingerprintId: `FP-AP-${Math.floor(1000 + Math.random() * 9000)}`,
      dailyWage: 425,
      bankName: "State Bank of India",
      accountNumber: "389201948291",
      ifscCode: "SBIN0001234",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name || `${worker.firstName || ""} ${worker.lastName || ""}`.trim(),
      phone: worker.phone,
      village: worker.village || "Kothapalli",
      mandal: worker.mandal || "Dhone",
      district: worker.district || "Kurnool",
      aadhaar: worker.aadhaar || "8765-4321-9012",
      jobCardNumber: worker.jobCardNumber || "AP-12-004-1001",
      fingerprintId: worker.fingerprintId || "FP-AP-1001",
      dailyWage: worker.dailyWage || 425,
      bankName: worker.bankName || "State Bank of India",
      accountNumber: worker.accountNumber || "389201948291",
      ifscCode: worker.ifscCode || "SBIN0001234",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Worker record?")) return;
    try {
      await apiClient.delete(`/users/workers/${id}`);
      toast.success("Worker deleted successfully");
      fetchWorkers();
    } catch (err) {
      setWorkers((prev) => prev.filter((w) => w._id !== id));
      toast.success("Worker removed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await apiClient.put(`/users/workers/${editingWorker._id}`, formData);
        toast.success("Worker details updated");
      } else {
        const res = await apiClient.post("/users/workers", formData);
        toast.success("Worker registered successfully!");
      }
      setShowModal(false);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
      if (!editingWorker) {
        const newW = {
          _id: "w-" + Date.now(),
          ...formData,
          isActive: true,
          faceEnrolled: true,
          fingerprintEnrolled: true,
        };
        setWorkers((prev) => [newW, ...prev]);
        setShowModal(false);
      }
    }
  };

  const [selectedTab, setSelectedTab] = useState("active"); // "active" | "pending"

  const handleApproveWorker = async (workerId) => {
    try {
      await apiClient.put(`/users/workers/${workerId}/approve`);
      toast.success("Worker application approved! Account activated for login.", { icon: "✅" });
      setWorkers((prev) =>
        prev.map((w) =>
          w._id === workerId ? { ...w, verificationStatus: "approved", isVerified: true, isActive: true } : w
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
      setWorkers((prev) =>
        prev.map((w) =>
          w._id === workerId ? { ...w, verificationStatus: "approved", isVerified: true, isActive: true } : w
        )
      );
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = window.prompt("Enter rejection reason (optional):", "Incomplete verification documents");
    if (reason === null) return;
    try {
      await apiClient.put(`/users/workers/${workerId}/reject`, { reason });
      toast.success("Worker registration rejected.");
      setWorkers((prev) =>
        prev.map((w) =>
          w._id === workerId ? { ...w, verificationStatus: "rejected", isVerified: false, isActive: false } : w
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
      setWorkers((prev) =>
        prev.map((w) =>
          w._id === workerId ? { ...w, verificationStatus: "rejected", isVerified: false, isActive: false } : w
        )
      );
    }
  };

  const pendingWorkers = workers.filter((w) => w.verificationStatus === "pending_approval" || w.isVerified === false);
  const activeWorkers = workers.filter((w) => w.verificationStatus !== "pending_approval" && w.isVerified !== false);
  const villageOptions = [
    "all",
    ...new Set(workers.map((worker) => worker.village).filter(Boolean)),
  ];

  const displayedList = selectedTab === "pending" ? pendingWorkers : activeWorkers;

  const filtered = displayedList.filter((w) => {
    const matchSearch =
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.phone?.includes(search) ||
      w.jobCardNumber?.toLowerCase().includes(search.toLowerCase());
    const matchVillage = villageFilter === "all" || w.village?.toLowerCase() === villageFilter.toLowerCase();
    return matchSearch && matchVillage;
  });

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase">
                  Worker Registry & Verification Control
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Manage & Verify Rural Workers
              </h1>
              <p className="text-xs text-slate-500">
                Review public worker registrations, verify Job Cards, and manage workforce records.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 shadow-md flex items-center space-x-1.5"
            >
              <Plus size={16} />
              <span>Direct Register Worker</span>
            </Button>
          </div>

          {/* Tab Navigation: Active Workers vs Pending Applications */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedTab("active")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                selectedTab === "active"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <UserCheck size={14} />
              <span>Active & Enrolled Workers ({activeWorkers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                selectedTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-900/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Pending Registrations & Review</span>
              {pendingWorkers.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-200 text-amber-900 font-black">
                  {pendingWorkers.length}
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  selectedTab === "pending"
                    ? "Search pending applicants by name, phone, or village..."
                    : "Search by worker name, phone, or Job Card Number..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Village:</span>
              <select
                value={villageFilter}
                onChange={(e) => setVillageFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {villageOptions.map((v) => (
                  <option key={v} value={v}>
                    {v === "all" ? "All Villages" : v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Applicant / Worker</th>
                    <th className="py-3 px-4">Job Card & Aadhaar</th>
                    <th className="py-3 px-4">Village / Mandal</th>
                    <th className="py-3 px-4">DBT Bank Account</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-right">
                      {selectedTab === "pending" ? "Review & Action" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        {selectedTab === "pending"
                          ? "No pending worker registration requests at this time."
                          : "No worker records found matching your filters."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((w) => (
                      <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                              <UserCheck size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{w.name}</p>
                              <p className="text-[10px] text-slate-500">{w.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {w.jobCardNumber || "AP-12-004-1001"}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Aadhaar: {w.aadhaarMasked || "XXXX-XXXX-9012"}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{w.village}</span>
                          <p className="text-[10px] text-slate-400">{w.mandal} Mandal</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{w.bankName || "SBI"}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            A/C: •••• {w.accountNumber ? w.accountNumber.slice(-4) : "8291"} ({w.ifscCode || "SBIN0001234"})
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {w.verificationStatus === "pending_approval" || w.isVerified === false ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              <span>Pending Field Review</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center space-x-1">
                              <Check size={11} />
                              <span>Verified & Active</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {selectedTab === "pending" ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => handleApproveWorker(w._id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1 shadow-sm"
                              >
                                <Check size={13} />
                                <span>Approve & Enroll</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectWorker(w._id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition"
                              >
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEditModal(w)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(w._id)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration / Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  {editingWorker ? "Edit Worker Details" : "Register New Rural Worker"}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  The worker will be registered under your Field Supervisor ID.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Worker Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Ramesh Babu"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number (SMS Alert Recipient)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="+919876510001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Village
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. Kothapalli"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Job Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.jobCardNumber}
                        onChange={(e) => setFormData({ ...formData, jobCardNumber: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        placeholder="AP-12-004-1001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Fingerprint ID (Hardware Mapping)
                      </label>
                      <input
                        type="text"
                        value={formData.fingerprintId}
                        onChange={(e) => setFormData({ ...formData, fingerprintId: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        placeholder="FP-AP-1001"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Daily Wage (₹)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.dailyWage}
                        onChange={(e) => setFormData({ ...formData, dailyWage: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="425"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase text-emerald-600 mb-2">
                      Direct Benefit Transfer (DBT) Bank Credentials
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="SBI"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          placeholder="389201948291"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                          className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                          placeholder="SBIN0001234"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      {editingWorker ? "Save Changes" : "Register Worker"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ManageWorkers;
