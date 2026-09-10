import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { LoadingSpinner } from "../../components/Loading";
import {
  CheckCircle,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

const EmployeeDashboard = () => {
  const { user, apiClient } = useAuth();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get("/dashboard/employee/stats");
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error("Failed to fetch dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>{t("dashboard")} - {t("appName")}</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header with Welcome and Language Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider">
                  {t("empPortalTitle")}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {t("welcome")}, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                <span>
                  {user?.village || "Venkatapuram"}, GP: {user?.panchayat || "Venkatapuram"}, {user?.district || "Kurnool"},{" "}
                  {user?.state || "Andhra Pradesh"}
                </span>
                • ID:{" "}
                <span className="font-mono font-bold text-primary-600">
                  {user?.employeeID || dashboard?.employee?.employeeID}
                </span>
              </p>
            </div>

            {/* Language Selector Box */}
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {t("language")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex flex-wrap gap-3">
            <a
              href="/employee/payments"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-semibold text-xs hover:bg-primary-100 transition shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" /> {t("payments")}
            </a>
            <a
              href="/employee/assignments"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold text-xs hover:bg-purple-100 transition shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" /> {t("assignments")}
            </a>
            <a
              href="/employee/profile"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition shadow-xs"
            >
              <Building className="w-3.5 h-3.5" /> {t("bankAccount")} & OTP
            </a>
            <a
              href="/employee/assistant"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 font-semibold text-xs hover:bg-amber-100 transition shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" /> {t("assistant")} (24/7)
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <CreditCard className="w-7 h-7 text-primary-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                ₹{((dashboard?.payments?.totalEarned || 7980)).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("wagesCredited")}</p>
            </Card>

            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <Briefcase className="w-7 h-7 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {dashboard?.assignments?.total || 2}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("assignedProjects")}</p>
            </Card>

            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <CheckCircle className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {user?.employmentStatus || "Active"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("musterStatus")}</p>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Bank Account DBT Card with OTP Verification Badge */}
              <Card className="border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {t("bankAccount")} & DBT Disbursal
                      </h3>
                      <p className="text-[11px] text-gray-500">{t("bankSub")}</p>
                    </div>
                  </div>

                  {user?.bankVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4" /> {t("bankVerifiedBadge")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4" /> {t("bankPendingBadge")}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs">
                  <div>
                    <span className="text-gray-400 block">{t("bankName")}:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {user?.bankName || "State Bank of India"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{t("accountNumber")}:</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {user?.accountNumber
                        ? `••••••••${user.accountNumber.slice(-4)}`
                        : "••••3214"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">{t("ifscCode")}:</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                      {user?.ifscCode || "SBIN0001234"}
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 flex justify-end">
                  <a
                    href="/employee/profile"
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    {t("editBank")} <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>

              {/* Recent DBT Wage Credits */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("recentWageCredits")}
                  </h2>
                  <a href="/employee/payments" className="text-xs text-primary-500 hover:underline font-medium">
                    {t("viewAll")} →
                  </a>
                </div>

                <div className="space-y-3">
                  {(dashboard?.payments?.recentPaid?.length > 0
                    ? dashboard.payments.recentPaid
                    : [
                        {
                          _id: "1",
                          totalAmount: 7980,
                          paidDate: new Date(Date.now() - 2 * 86400000),
                          receiptNumber: "REC-2024-0012",
                        },
                      ]
                  ).map((payment) => (
                    <div
                      key={payment._id}
                      className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl"
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          ₹{payment.totalAmount?.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Credited on{" "}
                          {new Date(payment.paidDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • SBI DBT Direct Credit
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        Paid ✓
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  {t("workerDetails")}
                </h3>
                <dl className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("employeeId")}:</dt>
                    <dd className="font-mono font-bold text-primary-600">
                      {user?.employeeID || dashboard?.employee?.employeeID || "EMP-2024-001"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("state")}:</dt>
                    <dd className="font-medium">{user?.state || "Andhra Pradesh"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("district")}:</dt>
                    <dd className="font-medium">{user?.district || "Kurnool"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("mandal")}:</dt>
                    <dd className="font-medium">{user?.mandal || "Dhone"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("gramPanchayat")}:</dt>
                    <dd className="font-medium">{user?.panchayat || user?.village || "Venkatapuram"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("village")}:</dt>
                    <dd className="font-medium">{user?.village || "Venkatapuram Main"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("phone")}:</dt>
                    <dd className="font-medium">{user?.phone || "+919876543211"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">{t("musterStatus")}:</dt>
                    <dd className="font-semibold text-emerald-600 capitalize">
                      {user?.employmentStatus || "Active"}
                    </dd>
                  </div>
                </dl>
              </Card>

              {/* Notifications Alert */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("unreadAlerts")}
                  </h3>
                  <a href="/employee/notifications" className="text-xs text-primary-500 hover:underline">
                    {t("viewAll")}
                  </a>
                </div>
                <p className="text-2xl font-black text-primary-600">
                  {dashboard?.notifications?.unread || 1}
                </p>
                <p className="text-xs text-gray-500 mt-1">Village weather & wage notices</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EmployeeDashboard;
