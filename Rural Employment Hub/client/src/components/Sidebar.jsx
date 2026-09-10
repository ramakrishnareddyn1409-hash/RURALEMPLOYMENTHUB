import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Camera,
  Fingerprint,
  CreditCard,
  BarChart3,
  Settings,
  Calendar,
  MessageSquareText,
  UserCheck,
  Building2,
  MapPin,
  Send,
  Layers,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isStateAdmin, isAssistantAdmin, isFieldAdmin, isWorker } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const path = location.pathname;

  // Determine current active level from route path
  let activeLevel = "state";

  if (path.startsWith("/employee")) {
    activeLevel = "worker";
  } else if (
    path === "/admin/assistant-admin" ||
    path === "/admin/field-admins" ||
    path === "/admin/assistant-reports"
  ) {
    activeLevel = "assistant";
  } else if (
    path === "/admin/field-admin" ||
    path === "/admin/face-attendance" ||
    path === "/admin/fingerprint-attendance" ||
    path === "/admin/field-payments" ||
    (path === "/admin/workers" && isFieldAdmin && !isStateAdmin)
  ) {
    activeLevel = "field";
  } else if (
    path === "/admin/state-admin" ||
    path === "/admin/superadmin" ||
    path === "/admin/assistant-admins" ||
    path === "/admin/reports" ||
    path === "/admin/analytics" ||
    path === "/admin/attendance" ||
    path === "/admin/payments" ||
    path === "/admin/settings" ||
    path === "/admin/workers"
  ) {
    activeLevel = "state";
  } else {
    if (isWorker) activeLevel = "worker";
    else if (isFieldAdmin) activeLevel = "field";
    else if (isAssistantAdmin) activeLevel = "assistant";
    else activeLevel = "state";
  }

  // Generate dynamic links & header based on activeLevel
  let links = [];
  let headerInfo = {};

  if (activeLevel === "worker") {
    headerInfo = {
      tag: "👤 RURAL WORKER",
      tagColor: "bg-indigo-950/90 text-indigo-300 border-indigo-800/60",
      title: user?.name || "MGNREGA Worker",
      sub: user?.village ? `${user.village} Village` : "Kothapalli Village",
    };
    links = [
      { path: "/employee/dashboard", label: "Worker Dashboard", icon: LayoutDashboard },
      { path: "/employee/attendance", label: "Attendance Calendar", icon: Calendar },
      { path: "/employee/payments", label: "Wage & DBT History", icon: CreditCard },
      { path: "/employee/sms-feed", label: "SMS Alerts & Logs", icon: MessageSquareText },
      { path: "/employee/profile", label: "Job Card & Profile", icon: UserCheck },
    ];
  } else if (activeLevel === "assistant") {
    headerInfo = {
      tag: "🏢 DIVISIONAL LEVEL",
      tagColor: "bg-sky-950/90 text-sky-300 border-sky-800/60",
      title: user?.name || "Assistant Regional Admin",
      sub: user?.district ? `${user.district} Division` : "Kurnool Division",
    };
    links = [
      { path: "/admin/assistant-admin", label: "Division Dashboard", icon: LayoutDashboard },
      { path: "/admin/field-admins", label: "Manage Field Admins", icon: Users, highlight: true },
      { path: "/admin/workers", label: "Workers in Division", icon: UserCheck },
      { path: "/admin/assistant-reports", label: "Village-Wise Reports", icon: MapPin },
      { path: "/admin/attendance", label: "Attendance Summary", icon: Calendar },
      { path: "/admin/payments", label: "Pending Payments", icon: CreditCard },
      { path: "/admin/settings", label: "Settings", icon: Settings },
    ];
  } else if (activeLevel === "field") {
    headerInfo = {
      tag: "📍 MANDAL / FIELD LEVEL",
      tagColor: "bg-emerald-950/90 text-emerald-300 border-emerald-800/60",
      title: user?.name || "Field Supervisor Admin",
      sub: user?.mandal ? `${user.mandal} Mandal (${user?.village || "Kothapalli"})` : "Dhone Mandal",
    };
    links = [
      { path: "/admin/field-admin", label: "Field Admin Dashboard", icon: LayoutDashboard },
      { path: "/admin/face-attendance", label: "🤖 AI Face Attendance", icon: Camera, highlight: true, badge: "AI Live" },
      { path: "/admin/fingerprint-attendance", label: "Fingerprint Muster", icon: Fingerprint },
      { path: "/admin/workers", label: "Manage Workers", icon: UserCheck },
      { path: "/admin/attendance", label: "Attendance History", icon: Calendar },
      { path: "/admin/field-payments", label: "Payment & SMS Triggers", icon: Send },
      { path: "/admin/settings", label: "Settings", icon: Settings },
    ];
  } else {
    headerInfo = {
      tag: "🏛️ STATE LEVEL AUTHORITY",
      tagColor: "bg-amber-950/90 text-amber-300 border-amber-800/60",
      title: user?.name || "State Commissioner HQ",
      sub: "All 26 Districts Access",
    };
    links = [
      { path: "/admin/state-admin", label: "State HQ Dashboard", icon: LayoutDashboard, badge: "All AP" },
      { path: "/admin/assistant-admins", label: "Manage Assistant Admins", icon: Building2, highlight: true },
      { path: "/admin/field-admins", label: "All Field Admins", icon: Users },
      { path: "/admin/workers", label: "All State Workers", icon: UserCheck },
      { path: "/admin/reports", label: "District & AI Analytics", icon: BarChart3 },
      { path: "/admin/attendance", label: "State Attendance Reports", icon: Calendar },
      { path: "/admin/payments", label: "DBT Payment Reports", icon: CreditCard },
      { path: "/admin/settings", label: "Portal Settings", icon: Settings },
    ];
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed bottom-5 left-5 z-50 md:hidden bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-2xl flex items-center justify-center focus:outline-none hover:scale-105 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#08150a] text-slate-200 border-r border-[#152e18] shadow-xl z-40 transform transition-transform duration-300 flex flex-col justify-between overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Role Header Card */}
          <div className="p-3.5 border-b border-[#152e18] bg-[#050f07]">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-1 ${headerInfo.tagColor}`}
            >
              {headerInfo.tag}
            </span>
            <p className="text-xs font-bold text-white truncate" title={headerInfo.title}>
              {headerInfo.title}
            </p>
            <p className="text-[10px] text-emerald-400/80 truncate">{headerInfo.sub}</p>
          </div>

          {/* Navigation links */}
          <nav className="p-2 space-y-0.5">
            {links.map(({ path, label, icon: Icon, highlight, badge }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950/60 font-bold"
                      : highlight
                      ? "text-sky-300 hover:bg-emerald-950/50 hover:text-white"
                      : "text-slate-300 hover:bg-emerald-950/40 hover:text-white"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                {badge && (
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase border border-emerald-800/60">
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Switcher & Language Controls */}
        {/* Bottom Switcher & Hierarchy Controls */}
        <div className="p-2.5 border-t border-[#152e18] bg-[#050f07]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
              <Layers size={11} className="inline mr-1" />
              <span>Switch Level</span>
            </span>
          </div>

          <div
            className={`grid gap-1 text-[10px] ${
              isStateAdmin || user?.role === "superadmin" || user?.role === "state_admin"
                ? "grid-cols-2"
                : isAssistantAdmin || user?.role === "assistant_admin"
                ? "grid-cols-3"
                : isFieldAdmin || user?.role === "field_admin" || user?.role === "admin"
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {(isStateAdmin || user?.role === "superadmin" || user?.role === "state_admin") && (
              <NavLink
                to="/admin/state-admin"
                className={({ isActive }) =>
                  `py-1.5 px-2 rounded-lg font-bold text-center border transition flex items-center justify-center space-x-1 ${
                    isActive
                      ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                      : "bg-[#091b0d] text-amber-300/90 border-amber-900/30 hover:bg-emerald-950"
                  }`
                }
              >
                <span>🏛️ State</span>
              </NavLink>
            )}
            {(isStateAdmin || isAssistantAdmin || user?.role === "superadmin" || user?.role === "state_admin" || user?.role === "assistant_admin") && (
              <NavLink
                to="/admin/assistant-admin"
                className={({ isActive }) =>
                  `py-1.5 px-2 rounded-lg font-bold text-center border transition flex items-center justify-center space-x-1 ${
                    isActive
                      ? "bg-sky-600 text-white border-sky-500 shadow-xs"
                      : "bg-[#091b0d] text-sky-300/90 border-sky-900/30 hover:bg-emerald-950"
                  }`
                }
              >
                <span>🏢 Asst.</span>
              </NavLink>
            )}
            {(isStateAdmin || isAssistantAdmin || isFieldAdmin || user?.role === "superadmin" || user?.role === "state_admin" || user?.role === "assistant_admin" || user?.role === "field_admin" || user?.role === "admin") && (
              <NavLink
                to="/admin/field-admin"
                className={({ isActive }) =>
                  `py-1.5 px-2 rounded-lg font-bold text-center border transition flex items-center justify-center space-x-1 ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                      : "bg-[#091b0d] text-emerald-300/90 border-emerald-900/30 hover:bg-emerald-950"
                  }`
                }
              >
                <span>📍 Field</span>
              </NavLink>
            )}
            <NavLink
              to="/employee/dashboard"
              className={({ isActive }) =>
                `py-1.5 px-2 rounded-lg font-bold text-center border transition flex items-center justify-center space-x-1 ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : "bg-[#091b0d] text-indigo-300/90 border-indigo-900/30 hover:bg-emerald-950"
                }`
              }
            >
              <span>👤 Worker</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className="md:ml-64" />
    </>
  );
};

export default Sidebar;
