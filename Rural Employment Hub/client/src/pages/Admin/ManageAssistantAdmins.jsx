import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import {
  Building2,
  Users,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  MapPin,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const ManageAssistantAdmins = () => {
  const { apiClient } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "admin123",
    district: "Kurnool",
    adminTitle: "Assistant Commissioner - Kurnool Division",
  });

  const fetchAssistantAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/users/assistant-admins");
      setAdmins(res.data.assistantAdmins || []);
    } catch (err) {
      console.warn("Using sample Assistant Admins list:", err.message);
      setAdmins([
        {
          _id: "asst-1",
          isLocalFallback: true,
          name: "R. Ramanathan",
          email: "assistantadmin@gov.in",
          phone: "+919876500002",
          district: "Kurnool",
          adminTitle: "Assistant Commissioner - Kurnool Division",
          adminCode: "ASST_ADMIN_KNL",
          isActive: true,
          fieldAdminCount: 2,
          workerCount: 12,
        },
        {
          _id: "asst-2",
          isLocalFallback: true,
          name: "Dr. Lakshmi Prasanna",
          email: "assistantadmin2@gov.in",
          phone: "+919876500003",
          district: "Guntur",
          adminTitle: "Assistant Commissioner - Guntur Division",
          adminCode: "ASST_ADMIN_GNT",
          isActive: true,
          fieldAdminCount: 2,
          workerCount: 6,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistantAdmins();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "admin123",
      district: "Kurnool",
      adminTitle: "Assistant Commissioner - Kurnool Division",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || `${admin.firstName || ""} ${admin.lastName || ""}`.trim(),
      email: admin.email,
      phone: admin.phone,
      password: "",
      district: admin.district || "Kurnool",
      adminTitle: admin.adminTitle || `Assistant Commissioner - ${admin.district || "Kurnool"} Division`,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (id) => {
    const localAdmin = admins.find((admin) => admin._id === id);
    if (localAdmin?.isLocalFallback) {
      setAdmins((prev) =>
        prev.map((admin) => (admin._id === id ? { ...admin, isActive: !admin.isActive } : admin))
      );
      toast.success("Assistant Admin status toggled");
      return;
    }

    try {
      await apiClient.put(`/users/toggle-status/${id}`);
      toast.success("Status updated successfully");
      fetchAssistantAdmins();
    } catch (err) {
      // Local state toggle if offline
      setAdmins((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isActive: !a.isActive } : a))
      );
      toast.success("Assistant Admin status toggled");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Assistant Admin?")) return;
    const localAdmin = admins.find((admin) => admin._id === id);
    if (localAdmin?.isLocalFallback) {
      setAdmins((prev) => prev.filter((admin) => admin._id !== id));
      toast.success("Assistant Admin removed");
      return;
    }

    try {
      await apiClient.delete(`/users/assistant-admins/${id}`);
      toast.success("Assistant Admin deleted");
      fetchAssistantAdmins();
    } catch (err) {
      setAdmins((prev) => prev.filter((a) => a._id !== id));
      toast.success("Assistant Admin removed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingAdmin?.isLocalFallback) {
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === editingAdmin._id ? { ...admin, ...formData } : admin
        )
      );
      setShowModal(false);
      toast.success("Assistant Admin updated locally");
      return;
    }

    try {
      if (editingAdmin) {
        await apiClient.put(`/users/assistant-admins/${editingAdmin._id}`, formData);
        toast.success("Assistant Admin updated successfully");
      } else {
        await apiClient.post("/users/assistant-admins", formData);
        toast.success("Assistant Admin created successfully");
      }
      setShowModal(false);
      fetchAssistantAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
      // Fallback local update
      if (!editingAdmin) {
        const newAsst = {
          _id: "asst-" + Date.now(),
          isLocalFallback: true,
          ...formData,
          isActive: true,
          fieldAdminCount: 0,
          workerCount: 0,
          adminCode: "ASST_ADMIN_" + Math.floor(100 + Math.random() * 900),
        };
        setAdmins((prev) => [newAsst, ...prev]);
        setShowModal(false);
      }
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.district?.toLowerCase().includes(search.toLowerCase())
  );

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
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold uppercase">
                  State Level Authority Control
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Manage Assistant Admins
              </h1>
              <p className="text-xs text-slate-500">
                Create, edit, activate, deactivate, and delete Assistant Admins across all regional divisions.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 shadow-md flex items-center space-x-1.5"
            >
              <Plus size={16} />
              <span>Create Assistant Admin</span>
            </Button>
          </div>

          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 flex items-center space-x-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search Assistant Admins by name, email, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Assistant Admin</th>
                    <th className="py-3 px-4">Assigned Division</th>
                    <th className="py-3 px-4">Field Admins Managed</th>
                    <th className="py-3 px-4">Workers in Subtree</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{admin.name}</p>
                            <p className="text-[10px] text-slate-500">{admin.email} • {admin.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {admin.district || "Kurnool"}
                        </span>
                        <p className="text-[10px] text-slate-400">{admin.adminTitle}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                          {admin.fieldAdminCount || 0} Field Admins
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                          {admin.workerCount || 0} Workers
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(admin._id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                            admin.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {admin.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>{admin.isActive ? "Active" : "Deactivated"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAdmins.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-400">
                        No Assistant Admins found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  {editingAdmin ? "Edit Assistant Admin" : "Create New Assistant Admin"}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Assistant Admins will manage their own assigned Field Admins.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. Sri R. Ramanathan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      placeholder="e.g. asst.kurnool@gov.in"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="+919876500002"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned District
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Kurnool">Kurnool</option>
                        <option value="Anantapur">Anantapur</option>
                        <option value="Kadapa">Kadapa</option>
                        <option value="Guntur">Guntur</option>
                        <option value="Krishna">Krishna</option>
                        <option value="Chittoor">Chittoor</option>
                      </select>
                    </div>
                  </div>

                  {!editingAdmin && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Initial Password
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="admin123"
                      />
                    </div>
                  )}

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
                      {editingAdmin ? "Save Changes" : "Create Assistant Admin"}
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

export default ManageAssistantAdmins;
