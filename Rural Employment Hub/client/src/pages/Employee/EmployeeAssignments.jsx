import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LanguageSwitcher from "../../components/LanguageSwitcher";
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
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Users,
  Building,
  CheckCheck,
  Search,
  Sparkles,
  X,
  Compass,
  RotateCcw,
  Home,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeAssignments = () => {
  const { user, apiClient } = useAuth();
  const { t } = useLanguage();
  const [assignments, setAssignments] = useState([]);
  const [activeList, setActiveList] = useState([]);
  const [tab, setTab] = useState("my"); // "my" or "available"
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Search Box / Find Jobs state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Jurisdictional Location Filters (State -> District -> Mandal -> Panchayat -> Village)
  const [locationFilters, setLocationFilters] = useState({
    state: "all",
    district: "all",
    mandal: "all",
    panchayat: "all",
    village: "all",
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [myRes, activeRes] = await Promise.all([
        apiClient.get("/assignments/employee/my-assignments"),
        apiClient.get("/assignments/active/list"),
      ]);
      setAssignments(myRes.data.assignments || []);
      setActiveList(activeRes.data.assignments || []);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Failed to load work assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (assignmentId, responseType) => {
    try {
      setActionLoading(assignmentId);
      await apiClient.post(`/assignments/${assignmentId}/respond`, { response: responseType });
      toast.success(
        responseType === "accepted"
          ? "Assignment accepted! You are enrolled in the project roster."
          : "Assignment declined."
      );
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setActionLoading(null);
    }
  };

  // Location Handlers
  const handleStateChange = (e) => {
    setLocationFilters({
      state: e.target.value,
      district: "all",
      mandal: "all",
      panchayat: "all",
      village: "all",
    });
  };

  const handleDistrictChange = (e) => {
    setLocationFilters((prev) => ({
      ...prev,
      district: e.target.value,
      mandal: "all",
      panchayat: "all",
      village: "all",
    }));
  };

  const handleMandalChange = (e) => {
    setLocationFilters((prev) => ({
      ...prev,
      mandal: e.target.value,
      panchayat: "all",
      village: "all",
    }));
  };

  const handlePanchayatChange = (e) => {
    setLocationFilters((prev) => ({
      ...prev,
      panchayat: e.target.value,
      village: "all",
    }));
  };

  const handleVillageChange = (e) => {
    setLocationFilters((prev) => ({
      ...prev,
      village: e.target.value,
    }));
  };

  const handleQuickMyVillage = () => {
    if (!user?.village && !user?.panchayat) {
      toast("Profile location not found, setting default Andhra Pradesh / Kurnool / Dhone", { icon: "ℹ️" });
    }
    setLocationFilters({
      state: user?.state || "Andhra Pradesh",
      district: user?.district || "Kurnool",
      mandal: user?.mandal || "Dhone",
      panchayat: user?.panchayat || "Venkatapuram",
      village: user?.village || "Venkatapuram Main",
    });
    toast.success(`Filtered for your village: ${user?.village || "Venkatapuram"}!`);
  };

  const handleResetFilters = () => {
    setLocationFilters({
      state: "all",
      district: "all",
      mandal: "all",
      panchayat: "all",
      village: "all",
    });
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const availableStates = getAllStates();
  const availableDistricts = locationFilters.state !== "all" ? getDistricts(locationFilters.state) : [];
  const availableMandals =
    locationFilters.state !== "all" && locationFilters.district !== "all"
      ? getMandals(locationFilters.state, locationFilters.district)
      : [];
  const availablePanchayats =
    locationFilters.state !== "all" && locationFilters.district !== "all"
      ? getPanchayats(locationFilters.state, locationFilters.district, locationFilters.mandal !== "all" ? locationFilters.mandal : null)
      : [];
  const availableVillages =
    locationFilters.state !== "all" && locationFilters.district !== "all" && locationFilters.panchayat !== "all"
      ? getVillages(
          locationFilters.state,
          locationFilters.district,
          locationFilters.mandal !== "all" ? locationFilters.mandal : null,
          locationFilters.panchayat
        )
      : [];

  const isLocationFiltered =
    locationFilters.state !== "all" ||
    locationFilters.district !== "all" ||
    locationFilters.mandal !== "all" ||
    locationFilters.panchayat !== "all" ||
    locationFilters.village !== "all";

  const baseList = tab === "my" ? assignments : activeList;

  // Filtered by Search Box, Category Chips, and Location Dropdowns
  const filteredList = baseList.filter((project) => {
    const q = searchQuery.toLowerCase().trim();
    const title = project.title?.toLowerCase() || "";
    const desc = project.description?.toLowerCase() || "";
    const pVillage = project.location?.village?.toLowerCase() || "";
    const pMandal = project.location?.mandal?.toLowerCase() || "";
    const pDistrict = project.location?.district?.toLowerCase() || "";
    const pPanchayat = project.location?.panchayat?.toLowerCase() || "";
    const pState = project.location?.state?.toLowerCase() || "";
    const category = project.workCategory?.toLowerCase() || "";

    const matchesQuery =
      !q ||
      title.includes(q) ||
      desc.includes(q) ||
      pVillage.includes(q) ||
      pMandal.includes(q) ||
      pDistrict.includes(q) ||
      pPanchayat.includes(q) ||
      pState.includes(q) ||
      category.includes(q);

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "road-construction" && category.includes("road")) ||
      (selectedCategory === "water-management" && (category.includes("water") || category.includes("canal"))) ||
      (selectedCategory === "agriculture" && (category.includes("agri") || category.includes("forest") || category.includes("rural"))) ||
      (selectedCategory === "sanitation" && category.includes("sanitation"));

    const matchesState =
      locationFilters.state === "all" ||
      !pState ||
      pState === locationFilters.state.toLowerCase() ||
      pState.includes(locationFilters.state.toLowerCase()) ||
      locationFilters.state.toLowerCase().includes(pState);

    const matchesDistrict =
      locationFilters.district === "all" ||
      !pDistrict ||
      pDistrict === locationFilters.district.toLowerCase() ||
      pDistrict.includes(locationFilters.district.toLowerCase()) ||
      locationFilters.district.toLowerCase().includes(pDistrict);

    const matchesMandal =
      locationFilters.mandal === "all" ||
      !pMandal ||
      pMandal === locationFilters.mandal.toLowerCase() ||
      pMandal.includes(locationFilters.mandal.toLowerCase()) ||
      locationFilters.mandal.toLowerCase().includes(pMandal);

    const matchesPanchayat =
      locationFilters.panchayat === "all" ||
      !pPanchayat ||
      pPanchayat === locationFilters.panchayat.toLowerCase() ||
      pPanchayat.includes(locationFilters.panchayat.toLowerCase()) ||
      locationFilters.panchayat.toLowerCase().includes(pPanchayat);

    const matchesVillage =
      locationFilters.village === "all" ||
      !pVillage ||
      pVillage === locationFilters.village.toLowerCase() ||
      pVillage.includes(locationFilters.village.toLowerCase()) ||
      locationFilters.village.toLowerCase().includes(pVillage);

    return matchesQuery && matchesCategory && matchesState && matchesDistrict && matchesMandal && matchesPanchayat && matchesVillage;
  });

  return (
    <>
      <Helmet>
        <title>{t("assignments")} - {t("appName")}</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t("ruralWorkAssignments")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                {t("assignmentsSub")}
              </p>
            </div>

            {/* Language Switcher & Tab Switcher */}
            <div className="flex items-center gap-3 flex-wrap">
              <LanguageSwitcher />

              <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl">
                <button
                  onClick={() => setTab("my")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    tab === "my"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {t("myProjects")} ({assignments.length})
                </button>
                <button
                  onClick={() => setTab("available")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                    tab === "available"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {t("activeProjects")} ({activeList.length})
                </button>
              </div>
            </div>
          </div>

          {/* ══════════ SEARCH BOX • FIND JOBS • DISCOVER OPPORTUNITIES ══════════ */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Search Box • Find Jobs • Discover Opportunities
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Explore Active Rural Employment & Schemes
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Lookup live MGNREGA muster openings, daily wage rates, and village worksites.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                {[
                  { id: "all", label: "All Works" },
                  { id: "road-construction", label: "🛣️ Road" },
                  { id: "water-management", label: "💧 Water & Canal" },
                  { id: "agriculture", label: "🌾 Forestry" },
                  { id: "sanitation", label: "🧹 Sanitation" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedCategory === c.id
                        ? "bg-primary-600 text-white shadow-xs font-bold"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Box: Find jobs by scheme, skill, village, or district (e.g. Canal, Road, Kurnool, MGNREGA)..."
                className="w-full py-2.5 pl-10 pr-9 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ══════════ JURISDICTIONAL LOCATION HIERARCHY SELECTORS ══════════ */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>Filter by Village Worksite Jurisdiction:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickMyVillage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition"
                    title="Quickly filter to your enrolled village"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>My Village Works</span>
                  </button>

                  {isLocationFiltered && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                      title="Clear location filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 5-Level Cascading Dropdowns: State -> District -> Mandal -> Gram Panchayat -> Village */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {/* 1. State Option */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    State
                  </label>
                  <select
                    value={locationFilters.state}
                    onChange={handleStateChange}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All States</option>
                    {availableStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. District Option */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    District
                  </label>
                  <select
                    value={locationFilters.district}
                    onChange={handleDistrictChange}
                    disabled={locationFilters.state === "all"}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Districts</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Mandal / Block Option */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Mandal / Block
                  </label>
                  <select
                    value={locationFilters.mandal}
                    onChange={handleMandalChange}
                    disabled={locationFilters.district === "all"}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Mandals</option>
                    {availableMandals.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Gram Panchayat Option */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Gram Panchayat
                  </label>
                  <select
                    value={locationFilters.panchayat}
                    onChange={handlePanchayatChange}
                    disabled={locationFilters.district === "all"}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Panchayats</option>
                    {availablePanchayats.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Village / Habitation Option */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Village / Habitation
                  </label>
                  <select
                    value={locationFilters.village}
                    onChange={handleVillageChange}
                    disabled={locationFilters.panchayat === "all"}
                    className="w-full text-xs font-medium py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 disabled:opacity-50 focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Villages</option>
                    {availableVillages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Scope Status Bar */}
              {isLocationFiltered && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-xs text-primary-700 dark:text-primary-300 font-semibold">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Showing assigned works in:{" "}
                      {[
                        locationFilters.village !== "all" ? `Village: ${locationFilters.village}` : null,
                        locationFilters.panchayat !== "all" ? `GP: ${locationFilters.panchayat}` : null,
                        locationFilters.mandal !== "all" ? `Mandal: ${locationFilters.mandal}` : null,
                        locationFilters.district !== "all" ? `Dist: ${locationFilters.district}` : null,
                        locationFilters.state !== "all" ? locationFilters.state : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/60 text-[11px]">
                    {filteredList.length} project{filteredList.length === 1 ? "" : "s"} found
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assignments Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredList.length === 0 ? (
            <EmptyState
              title={
                isLocationFiltered
                  ? "No assigned works found for the selected village location"
                  : searchQuery
                  ? `No jobs match "${searchQuery}"`
                  : tab === "my"
                  ? "No assignments assigned to you yet"
                  : "No active projects in this panchayat"
              }
              description={
                isLocationFiltered
                  ? "Try selecting 'All Villages' or reset location filters to browse nearby rural projects."
                  : "Try adjusting your Search Box keywords or category filter."
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredList.map((project) => {
                const myAssignment = project.assignedEmployees?.find(
                  (a) => a.employee === user?._id || a.employee?._id === user?._id
                );
                const assignmentStatus = myAssignment?.status || "assigned";
                const isMyHomeVillage =
                  user?.village &&
                  project.location?.village &&
                  (project.location.village.toLowerCase() === user.village.toLowerCase() ||
                    project.location.village.toLowerCase().includes(user.village.toLowerCase()));

                return (
                  <Card
                    key={project._id}
                    className={`border transition-all flex flex-col justify-between ${
                      isMyHomeVillage
                        ? "border-primary-300 dark:border-primary-700/60 bg-gradient-to-b from-primary-50/20 to-transparent"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-400"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                            {project.workCategory?.replace("-", " ")}
                          </span>
                          {isMyHomeVillage && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <Home className="w-3 h-3" /> Home Village Worksite
                            </span>
                          )}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            project.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : project.status === "completed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {project.description}
                      </p>

                      {/* Project Meta Info with Location Hierarchy */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                          <span className="truncate font-medium">
                            <strong className="text-gray-900 dark:text-gray-100">{project.location?.village || "Venkatapuram"}</strong>, GP:{" "}
                            {project.location?.panchayat || "Venkatapuram"}, {project.location?.mandal ? `Mandal: ${project.location.mandal}, ` : ""}{project.location?.district || "Kurnool"} (
                            {project.location?.state || "Andhra Pradesh"})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Coins className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>₹{project.dailyWage} {t("dailyWage")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{project.estimatedDuration} days {t("duration")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 col-span-2">
                          <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>
                            {project.assignedEmployees?.length || 0} / {project.estimatedWorkers || 20} workers on roster
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions / Enrollment Status */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="text-xs font-semibold">
                        <span className="text-gray-500 dark:text-gray-400">My Status: </span>
                        <span
                          className={`capitalize ${
                            assignmentStatus === "accepted"
                              ? "text-emerald-600 dark:text-emerald-400 font-bold"
                              : assignmentStatus === "rejected"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {assignmentStatus}
                        </span>
                      </div>

                      {assignmentStatus === "assigned" && (
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading === project._id}
                            onClick={() => handleResponse(project._id, "rejected")}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
                          >
                            {t("declineWork")}
                          </button>
                          <button
                            disabled={actionLoading === project._id}
                            onClick={() => handleResponse(project._id, "accepted")}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                          >
                            {t("acceptWork")}
                          </button>
                        </div>
                      )}

                      {assignmentStatus === "accepted" && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCheck className="w-4 h-4" /> Enrolled on Muster
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeeAssignments;
