import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  Building2,
  Users,
  Fingerprint,
  UserCheck,
} from "lucide-react";
import Button from "./Button";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const { isAuthenticated, logout, user, isStateAdmin, isAssistantAdmin, isFieldAdmin, isWorker } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const isPortal = path.startsWith("/admin") || path.startsWith("/employee");

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/", { replace: true });
  };

  const getRoleBadge = () => {
    const role = user?.role || "";
    if (role === "superadmin") {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Super Admin
        </span>
      );
    }
    if (role === "state_admin" || isStateAdmin) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          State Admin
        </span>
      );
    }
    if (role === "assistant_admin" || isAssistantAdmin) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
          Assistant Admin
        </span>
      );
    }
    if (role === "field_admin" || role === "admin" || isFieldAdmin) {
      return (
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Field Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
        Worker
      </span>
    );
  };

  // Determine active level for switcher highlighting
  const isStateActive = path.startsWith("/admin/state-admin") || path.startsWith("/admin/superadmin") || path.startsWith("/admin/assistant-admins") || path.startsWith("/admin/reports") || path.startsWith("/admin/analytics");
  const isAsstActive = path.startsWith("/admin/assistant-admin") || path.startsWith("/admin/field-admins") || path.startsWith("/admin/assistant-reports");
  const isFieldActive = path.startsWith("/admin/field-admin") || path.startsWith("/admin/face-attendance") || path.startsWith("/admin/fingerprint-attendance") || path.startsWith("/admin/field-payments") || (path === "/admin/workers" && !isStateAdmin);
  const isWorkerActive = path.startsWith("/employee");

  const userName = user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || (isWorker ? "Worker User" : "Admin User");

  return (
    <nav className="sticky top-0 z-50 bg-[#fcfaf5]/95 dark:bg-[#08170a]/95 backdrop-blur-md shadow-xs border-b border-emerald-900/10 dark:border-emerald-800/30">
      {/* Government Tricolor Top Accent */}
      <div className="gov-header-strip"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Emblems */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-white group-hover:scale-105 transition">
              <img
                src="/rural-employment-favicon.svg"
                alt="Rural Employment Hub logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight tracking-tight">
                  Rural Employment Hub
                </span>
                <span className="hidden lg:inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold rounded border border-emerald-300 dark:border-emerald-800">
                  Govt. of India
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-emerald-700 dark:text-emerald-400 font-medium leading-none">
                Direct Benefit Transfer & Biometric Muster
              </span>
            </div>
          </Link>

          {/* Center: Hierarchical Dashboard Switcher (Visible when logged in on Desktop) */}
          {isAuthenticated && path !== "/" && (
            <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-[#0d2212] p-1 rounded-xl border border-slate-200 dark:border-emerald-900/60 shadow-xs">
              {(isStateAdmin || user?.role === "superadmin" || user?.role === "state_admin") && (
                <Link
                  to="/admin/state-admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    isStateActive
                      ? "bg-white dark:bg-emerald-800/90 text-amber-700 dark:text-amber-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300"
                  }`}
                  title="State Level Authority"
                >
                  <span>🏛️ State</span>
                </Link>
              )}
              {(isStateAdmin || isAssistantAdmin || user?.role === "superadmin" || user?.role === "state_admin" || user?.role === "assistant_admin") && (
                <Link
                  to="/admin/assistant-admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    isAsstActive
                      ? "bg-white dark:bg-emerald-800/90 text-sky-700 dark:text-sky-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300"
                  }`}
                  title="Divisional Level Authority"
                >
                  <span>🏢 Assistant</span>
                </Link>
              )}
              {(isStateAdmin || isAssistantAdmin || isFieldAdmin || user?.role === "superadmin" || user?.role === "state_admin" || user?.role === "assistant_admin" || user?.role === "field_admin" || user?.role === "admin") && (
                <Link
                  to="/admin/field-admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    isFieldActive
                      ? "bg-white dark:bg-emerald-800/90 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300"
                  }`}
                  title="Mandal / Field Level"
                >
                  <span>📍 Field</span>
                </Link>
              )}
              <Link
                to="/employee/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  isWorkerActive
                    ? "bg-white dark:bg-emerald-800/90 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300"
                }`}
                title="Worker Portal"
              >
                <span>👤 Worker</span>
              </Link>
            </div>
          )}

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition px-2 py-1"
                >
                  Home
                </Link>
                <Link
                  to="/features"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition px-2 py-1 whitespace-nowrap"
                >
                  Features
                </Link>
                <Link
                  to="/about"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition px-2 py-1"
                >
                  About
                </Link>
              </>
            ) : null}

            {!isPortal && path !== "/" && path !== "/features" && path !== "/about" && <LanguageSwitcher compact={true} />}

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-emerald-950/60 rounded-xl text-slate-700 dark:text-slate-300 transition"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
            </button>

            {!isAuthenticated && !isPortal && path !== "/" && path !== "/features" && path !== "/about" ? (
              <div className="flex items-center space-x-2 pl-1">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="text-xs py-1.5 px-3"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin")}
                  className="text-xs py-1.5 px-3.5 shadow-sm"
                >
                  Portal Login
                </Button>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-emerald-900/60">
                {/* User Avatar & Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                    {userName[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left max-w-[140px] truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {userName}
                    </p>
                    <div className="mt-0.5">{getRoleBadge()}</div>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-emerald-950/60"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-emerald-900/40 space-y-2">
            {isAuthenticated && path !== "/" && (
              <div className="p-2 bg-emerald-50/60 dark:bg-emerald-950/50 rounded-xl mb-2">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                  Switch Dashboard
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    to="/admin/state-admin"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 font-bold text-amber-800 dark:text-amber-300 border border-slate-200 dark:border-emerald-800 text-center"
                  >
                    🏛️ State
                  </Link>
                  <Link
                    to="/admin/assistant-admin"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 font-bold text-sky-800 dark:text-sky-300 border border-slate-200 dark:border-emerald-800 text-center"
                  >
                    🏢 Assistant
                  </Link>
                  <Link
                    to="/admin/field-admin"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 font-bold text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 text-center"
                  >
                    📍 Field
                  </Link>
                  <Link
                    to="/employee/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-white dark:bg-emerald-900/60 font-bold text-indigo-800 dark:text-indigo-300 border border-slate-200 dark:border-emerald-800 text-center"
                  >
                    👤 Worker
                  </Link>
                </div>
              </div>
            )}

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              Home
            </Link>
            <Link
              to="/features"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              Features
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            >
              About
            </Link>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/40">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </div>
            ) : !isPortal && path !== "/" && path !== "/features" && path !== "/about" ? (
              <div className="pt-2 border-t border-slate-200 dark:border-emerald-900/40 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                >
                  Portal Login
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
