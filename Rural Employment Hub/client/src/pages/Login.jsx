import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Helmet } from "react-helmet-async";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Fingerprint,
  Lock,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  Landmark,
} from "lucide-react";
import toast from "react-hot-toast";

const Login = ({ portal = "worker" }) => {
  const isAdminPortal = portal === "admin";
  const [selectedRole, setSelectedRole] = useState(isAdminPortal ? "state_admin" : "field_admin");
  const [emailOrPhone, setEmailOrPhone] = useState(
    isAdminPortal ? "stateadmin@gov.in" : "fieldadmin@gov.in"
  );
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, isStateAdmin, isAssistantAdmin, isFieldAdmin, isWorker } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getLoginErrorMessage = (error) => {
    const validationErrors = error.response?.data?.errors;
    if (validationErrors?.length) {
      return validationErrors.map((item) => item.message).join(" ");
    }
    return error.response?.data?.message || "Invalid email/phone or password";
  };

  const validateLoginFields = () => {
    const identifier = emailOrPhone.trim();
    const passwordValue = password;

    if (!identifier) return "Email or phone number is required";
    if (!passwordValue.trim()) return "Password is required";

    if (identifier.includes("@")) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        return "Please enter a valid email address";
      }
      return "";
    }

    if (/^[a-z]{2,}[a-z0-9-]*$/i.test(identifier)) {
      return "";
    }

    const phoneDigits = identifier.replace(/[^0-9]/g, "");
    const normalizedPhoneDigits = phoneDigits.startsWith("91") && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;
    if (normalizedPhoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(normalizedPhoneDigits)) {
      return "Please enter a valid 10-digit Indian phone number";
    }

    return "";
  };

  // Demo accounts map
  const demoAccounts = {
    state_admin: {
      role: "state_admin",
      title: "State Admin (HQ Commissioner)",
      email: "stateadmin@gov.in",
      password: "admin123",
      desc: "Top Level Authority • Manages Assistant Admins • State-wide Reports",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      redirect: "/admin/state-admin",
    },
    assistant_admin: {
      role: "assistant_admin",
      title: "Assistant Admin (Division)",
      email: "assistantadmin@gov.in",
      password: "admin123",
      desc: "Kurnool Division • Manages Field Admins • Subtree Reports",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
      redirect: "/admin/assistant-admin",
    },
    field_admin: {
      role: "field_admin",
      title: "Field Admin (Mandal)",
      email: "fieldadmin@gov.in",
      password: "admin123",
      desc: "Dhone Mandal • Worker Registration • Biometric Fingerprint Muster",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      redirect: "/admin/field-admin",
    },
    worker: {
      role: "worker",
      title: "Rural Worker (Job Card Holder)",
      email: "worker1@gov.in",
      password: "admin123",
      desc: "Kothapalli Village • Personal Attendance • DBT Wage Slips & SMS",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
      redirect: "/employee/dashboard",
    },
  };

  const portalRoles = isAdminPortal
    ? ["state_admin", "assistant_admin"]
    : ["field_admin", "worker"];

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmailOrPhone(demoAccounts[roleKey].email);
    setPassword(demoAccounts[roleKey].password);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage("");

    const validationMessage = validateLoginFields();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(emailOrPhone, password);
      const user = res.user;

      // Navigate according to user's actual authenticated role
      const userRole = user.role;
      if (userRole === "state_admin" || userRole === "superadmin") {
        navigate("/admin/state-admin");
      } else if (userRole === "assistant_admin") {
        navigate("/admin/assistant-admin");
      } else if (userRole === "field_worker") {
        navigate("/employee/dashboard");
      } else if (userRole === "field_admin" || userRole === "admin") {
        navigate("/admin/field-admin");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (roleKey) => {
    const acc = demoAccounts[roleKey];
    setSelectedRole(roleKey);
    setEmailOrPhone(acc.email);
    setPassword(acc.password);
    setTimeout(() => {
      login(acc.email, acc.password)
        .then((res) => {
          navigate(acc.redirect);
        })
        .catch((err) => {
          setErrorMessage(getLoginErrorMessage(err));
        });
    }, 100);
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Rural Employment Hub | Govt. of India</title>
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fcfaf5] via-emerald-50/40 to-sky-50/30 dark:from-[#071308] dark:via-[#091b0c] dark:to-[#071308]">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-sky-800 text-white shadow-lg mb-3">
              <Landmark size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Rural Employment Hub
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
              National Direct Benefit Transfer & Biometric Muster System
            </p>
            <Link
              to="/"
              className="inline-flex items-center mt-3 px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-500 dark:hover:border-emerald-500 transition"
            >
              Home
            </Link>
            <Link
              to={isAdminPortal ? "/login" : "/admin"}
              className="inline-flex items-center ml-2 mt-3 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {isAdminPortal ? "Worker Login" : "Admin Login"}
            </Link>
          </div>

          {/* Card Container */}
          <div className="bg-white dark:bg-[#0d1e0f] py-8 px-6 shadow-gov-lg rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 sm:px-10">
            {/* Portal role selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Portal Access Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {portalRoles.includes("state_admin") && (
                <button
                  type="button"
                  onClick={() => handleRoleSelect("state_admin")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border text-center ${
                    selectedRole === "state_admin"
                      ? "bg-saffron-600 text-white border-saffron-600 shadow-md scale-102"
                      : "bg-[#fcfaf5] dark:bg-[#08170a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/60 hover:border-saffron-400"
                  }`}
                >
                  <Building2 size={16} className="mb-1" />
                  <span>State Admin</span>
                </button>
                )}

                {portalRoles.includes("assistant_admin") && (
                <button
                  type="button"
                  onClick={() => handleRoleSelect("assistant_admin")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border text-center ${
                    selectedRole === "assistant_admin"
                      ? "bg-sky-600 text-white border-sky-600 shadow-md scale-102"
                      : "bg-[#fcfaf5] dark:bg-[#08170a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/60 hover:border-sky-400"
                  }`}
                >
                  <ShieldCheck size={16} className="mb-1" />
                  <span>Assistant Admin</span>
                </button>
                )}

                {portalRoles.includes("field_admin") && (
                <button
                  type="button"
                  onClick={() => handleRoleSelect("field_admin")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border text-center ${
                    selectedRole === "field_admin"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-102"
                      : "bg-[#fcfaf5] dark:bg-[#08170a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/60 hover:border-emerald-400"
                  }`}
                >
                  <Fingerprint size={16} className="mb-1" />
                  <span>Field Admin</span>
                </button>
                )}

                {portalRoles.includes("worker") && (
                <button
                  type="button"
                  onClick={() => handleRoleSelect("worker")}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border text-center ${
                    selectedRole === "worker"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-md scale-102"
                      : "bg-[#fcfaf5] dark:bg-[#08170a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900/60 hover:border-emerald-500"
                  }`}
                >
                  <UserCheck size={16} className="mb-1" />
                  <span>Worker</span>
                </button>
                )}
              </div>
            </div>

            {/* Selected Role Banner */}
            <div className={`p-3 rounded-xl border mb-6 text-xs ${demoAccounts[selectedRole].badgeColor}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">{demoAccounts[selectedRole].title}</span>
                <span className="font-mono text-[10px] uppercase font-semibold">Ready</span>
              </div>
              <p className="mt-0.5 opacity-90">{demoAccounts[selectedRole].desc}</p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Official Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. stateadmin@gov.in or 9876500001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            {/* Quick 1-Click Demo Login Shortcuts */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
                ⚡ 1-Click Instant Demo Login (Evaluation Mode)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {portalRoles.includes("state_admin") && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("state_admin")}
                  className="px-2.5 py-2 text-left bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 transition"
                >
                  <p className="text-xs font-bold truncate">🏛️ State Admin</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">stateadmin@gov.in</p>
                </button>
                )}

                {portalRoles.includes("assistant_admin") && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("assistant_admin")}
                  className="px-2.5 py-2 text-left bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-200 transition"
                >
                  <p className="text-xs font-bold truncate">🏢 Assistant Admin</p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 font-mono">assistantadmin@gov.in</p>
                </button>
                )}

                {portalRoles.includes("field_admin") && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("field_admin")}
                  className="px-2.5 py-2 text-left bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 transition"
                >
                  <p className="text-xs font-bold truncate">📍 Field Admin</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">fieldadmin@gov.in</p>
                </button>
                )}

                {portalRoles.includes("worker") && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("worker")}
                  className="px-2.5 py-2 text-left bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-900 dark:text-indigo-200 transition"
                >
                  <p className="text-xs font-bold truncate">👤 Rural Worker</p>
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-mono">worker1@gov.in</p>
                </button>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                New registration request? Register for Job Card
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
