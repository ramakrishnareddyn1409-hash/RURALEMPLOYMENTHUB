import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import {
  getAllStates,
  getDistricts,
  getMandals,
  getPanchayats,
  getVillages,
} from "../../data/locationHierarchy";
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  Calendar,
  Coins,
  CheckCircle,
  Clock,
  X,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminAssignments = () => {
  const { apiClient } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assigningProject, setAssigningProject] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // New Project Form
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    workCategory: "road-construction",
    state: "Andhra Pradesh",
    district: "Kurnool",
    mandal: "Dhone",
    panchayat: "Venkatapuram",
    village: "Venkatapuram",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    estimatedDuration: 30,
    dailyWage: 320,
    estimatedWorkers: 25,
    totalBudget: 240000,
  });

  useEffect(() => {
    fetchAssignments();
    fetchEmployeesList();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/assignments?limit=100");
      setAssignments(res.data.assignments || []);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await apiClient.get("/users/all?limit=100");
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post("/assignments", {
        title: newProject.title,
        description: newProject.description,
        workCategory: newProject.workCategory,
        location: {
          state: newProject.state || "Andhra Pradesh",
          district: newProject.district || "Kurnool",
          mandal: newProject.mandal || "Dhone",
          panchayat: newProject.panchayat || "Venkatapuram",
          village: newProject.village || "Venkatapuram",
        },
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        estimatedDuration: Number(newProject.estimatedDuration),
        dailyWage: Number(newProject.dailyWage),
        estimatedWorkers: Number(newProject.estimatedWorkers),
        totalBudget: Number(newProject.totalBudget),
        status: "active",
      });

      toast.success("New rural project sanctioned and active!");
      setShowCreateModal(false);
      setNewProject({
        title: "",
        description: "",
        workCategory: "road-construction",
        village: "Venkatapuram",
        mandal: "Dhone",
        district: "Kurnool",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        estimatedDuration: 30,
        dailyWage: 320,
        estimatedWorkers: 25,
        totalBudget: 240000,
      });
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignWorkers = async (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      return toast.error("Please select at least one worker");
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/assignments/${assigningProject._id}/assign-employees`, {
        employeeIDs: selectedEmployees,
      });
      toast.success("Workers allocated to project roster!");
      setAssigningProject(null);
      setSelectedEmployees([]);
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign workers");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiClient.put(`/assignments/${id}/status`, { status });
      toast.success(`Project status updated to ${status}`);
      fetchAssignments();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleWorkerSelection = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  return (
    <>
      <Helmet>
        <title>Rural Work Projects - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Rural Work Projects & Muster
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Sanction new community works, monitor muster rosters, and allocate workers.
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="py-2.5 px-4 shadow-sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Sanction New Project
            </Button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : assignments.length === 0 ? (
            <EmptyState
              title="No work projects found"
              description="Click Sanction New Project to register a rural infrastructure assignment."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {assignments.map((project) => (
                <Card
                  key={project._id}
                  className="border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        {project.workCategory?.replace("-", " ")}
                      </span>
                      <select
                        value={project.status}
                        onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 capitalize focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        <span className="truncate">
                          {project.location?.village || "Venkatapuram"}, GP: {project.location?.panchayat || "Venkatapuram"} ({project.location?.state || "AP"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Coins className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>₹{project.dailyWage}/day wage</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{project.estimatedDuration} days ({new Date(project.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })})</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{project.assignedEmployees?.length || 0} / {project.estimatedWorkers || 25} Workers</span>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Action */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">
                      Budget: ₹{project.budget?.totalBudget?.toLocaleString("en-IN") || "--"}
                    </span>
                    <button
                      onClick={() => setAssigningProject(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Allocate Workers
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Sanction Project Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down my-8">
                <div className="p-5 bg-gradient-rural text-white flex justify-between items-center">
                  <h3 className="font-bold text-lg">Sanction New Rural Project</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                  <Input
                    label="Project Title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="e.g. Check Dam Construction & Desilting"
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Project Description *
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                      className="input py-2 text-xs"
                      placeholder="Detailed worksite objectives, beneficiaries, and road link..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Work Category *
                      </label>
                      <select
                        value={newProject.workCategory}
                        onChange={(e) => setNewProject({ ...newProject, workCategory: e.target.value })}
                        className="input py-2 text-xs"
                      >
                        <option value="road-construction">Road Construction</option>
                        <option value="water-management">Water Management</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="rural-development">Rural Development</option>
                        <option value="sanitation">Sanitation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <Input
                      label="Daily Wage (₹)"
                      type="number"
                      value={newProject.dailyWage}
                      onChange={(e) => setNewProject({ ...newProject, dailyWage: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        State*
                      </label>
                      <select
                        value={newProject.state || "Andhra Pradesh"}
                        onChange={(e) => {
                          const st = e.target.value;
                          const dists = getDistricts(st);
                          const firstDist = dists[0] || "";
                          const mands = getMandals(st, firstDist);
                          const firstMand = mands[0] || "";
                          const panchs = getPanchayats(st, firstDist, firstMand);
                          const firstPanch = panchs[0] || "";
                          const vills = getVillages(st, firstDist, firstMand, firstPanch);
                          setNewProject({
                            ...newProject,
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
                        District*
                      </label>
                      <select
                        value={newProject.district}
                        onChange={(e) => {
                          const d = e.target.value;
                          const mands = getMandals(newProject.state || "Andhra Pradesh", d);
                          const firstMand = mands[0] || "";
                          const panchs = getPanchayats(newProject.state || "Andhra Pradesh", d, firstMand);
                          const firstPanch = panchs[0] || "";
                          const vills = getVillages(newProject.state || "Andhra Pradesh", d, firstMand, firstPanch);
                          setNewProject({
                            ...newProject,
                            district: d,
                            mandal: firstMand,
                            panchayat: firstPanch,
                            village: vills[0] || firstPanch,
                          });
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                      >
                        {getDistricts(newProject.state || "Andhra Pradesh").map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Mandal / Block*
                      </label>
                      <select
                        value={newProject.mandal}
                        onChange={(e) => {
                          const m = e.target.value;
                          const panchs = getPanchayats(newProject.state || "Andhra Pradesh", newProject.district, m);
                          const firstPanch = panchs[0] || "";
                          const vills = getVillages(newProject.state || "Andhra Pradesh", newProject.district, m, firstPanch);
                          setNewProject({
                            ...newProject,
                            mandal: m,
                            panchayat: firstPanch,
                            village: vills[0] || firstPanch,
                          });
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                      >
                        {getMandals(newProject.state || "Andhra Pradesh", newProject.district).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Gram Panchayat
                      </label>
                      <select
                        value={newProject.panchayat}
                        onChange={(e) => {
                          const p = e.target.value;
                          const vills = getVillages(newProject.state || "Andhra Pradesh", newProject.district, newProject.mandal, p);
                          setNewProject({
                            ...newProject,
                            panchayat: p,
                            village: vills[0] || p,
                          });
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                      >
                        {getPanchayats(newProject.state || "Andhra Pradesh", newProject.district, newProject.mandal).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Village / Habitation*
                      </label>
                      {getVillages(newProject.state || "Andhra Pradesh", newProject.district, newProject.mandal, newProject.panchayat).length > 0 ? (
                        <select
                          value={newProject.village}
                          onChange={(e) => setNewProject({ ...newProject, village: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                        >
                          {getVillages(newProject.state || "Andhra Pradesh", newProject.district, newProject.mandal, newProject.panchayat).map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newProject.village}
                          onChange={(e) => setNewProject({ ...newProject, village: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          placeholder="Village Name"
                          required
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Duration (Days)"
                      type="number"
                      value={newProject.estimatedDuration}
                      onChange={(e) => setNewProject({ ...newProject, estimatedDuration: e.target.value })}
                      required
                    />
                    <Input
                      label="Workers Needed"
                      type="number"
                      value={newProject.estimatedWorkers}
                      onChange={(e) => setNewProject({ ...newProject, estimatedWorkers: e.target.value })}
                      required
                    />
                    <Input
                      label="Budget (₹)"
                      type="number"
                      value={newProject.totalBudget}
                      onChange={(e) => setNewProject({ ...newProject, totalBudget: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Sanction Project
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Allocate Workers Modal */}
          {assigningProject && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down my-8">
                <div className="p-5 bg-gradient-rural text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base">Allocate Workers to Muster</h3>
                    <p className="text-xs opacity-90 truncate max-w-xs">{assigningProject.title}</p>
                  </div>
                  <button onClick={() => setAssigningProject(null)} className="p-1 text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAssignWorkers} className="p-5 space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select registered employees to add to this project roster:
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-100 dark:divide-gray-700">
                    {employees.map((emp) => {
                      const isSelected = selectedEmployees.includes(emp._id);
                      return (
                        <div
                          key={emp._id}
                          onClick={() => toggleWorkerSelection(emp._id)}
                          className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                            isSelected
                              ? "bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div>
                            <p className="font-bold">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[11px] text-gray-400">{emp.employeeID} • {emp.village}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isSelected ? "bg-primary-500 border-primary-500 text-white" : "border-gray-300"
                          }`}>
                            {isSelected && "✓"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedEmployees.length} selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" type="button" onClick={() => setAssigningProject(null)} className="text-xs py-1.5">
                        Cancel
                      </Button>
                      <Button type="submit" loading={submitting} className="text-xs py-1.5">
                        Confirm Allocation
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminAssignments;
