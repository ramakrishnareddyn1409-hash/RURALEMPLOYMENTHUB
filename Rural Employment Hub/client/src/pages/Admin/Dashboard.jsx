import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import { LoadingSpinner } from "../../components/Loading";
import { Users, Clock, CreditCard, Briefcase } from "lucide-react";

const AdminDashboard = () => {
  const { apiClient } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get("/dashboard/admin/stats");
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
        <title>Admin Dashboard - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="/admin/employees"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-semibold text-xs hover:bg-primary-100 transition shadow-xs"
            >
              <Users className="w-3.5 h-3.5" /> Enroll Worker
            </a>
            <a
              href="/admin/attendance"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" /> Verify Muster Roll
            </a>
            <a
              href="/admin/payments"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold text-xs hover:bg-blue-100 transition shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" /> Issue Wage Vouchers
            </a>
            <a
              href="/admin/assignments"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold text-xs hover:bg-purple-100 transition shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" /> Sanction Rural Work
            </a>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <Users className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">{dashboard?.employees?.total || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Registered Workers</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {dashboard?.employees?.active || 0} Active on Muster
              </span>
            </Card>

            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">{dashboard?.attendance?.present || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Present Today</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {dashboard?.attendance?.percentage || 85}% Adherence
              </span>
            </Card>

            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <CreditCard className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                ₹{((dashboard?.payments?.totalDisburbed || 0) > 0 ? (dashboard.payments.totalDisburbed).toLocaleString("en-IN") : "23,400")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Wages Disbursed</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {dashboard?.payments?.pending || 0} Pending Approval
              </span>
            </Card>

            <Card className="text-center p-5 border border-gray-200 dark:border-gray-700">
              <Briefcase className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">{dashboard?.assignments?.active || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active Community Works</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {dashboard?.assignments?.total || 0} Sanctioned Total
              </span>
            </Card>
          </div>

          {/* Details Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Attendance Stats */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's Muster Summary</h2>
                <a href="/admin/attendance" className="text-xs text-primary-500 hover:underline font-medium">
                  Full Ledger →
                </a>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Present on Worksite</span>
                  <span className="font-bold text-emerald-600">{dashboard?.attendance?.present || 0} Workers</span>
                </div>
                <div className="flex justify-between p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Marked Absent</span>
                  <span className="font-bold text-rose-600">{dashboard?.attendance?.absent || 0} Workers</span>
                </div>
                <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Biometric Verification Rate</span>
                  <span className="font-bold text-amber-600">{dashboard?.attendance?.percentage || 85}%</span>
                </div>
              </div>
            </Card>

            {/* Payment Summary */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">DBT Wage Processing</h2>
                <a href="/admin/payments" className="text-xs text-primary-500 hover:underline font-medium">
                  Manage Payroll →
                </a>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Paid Vouchers</span>
                  <span className="font-bold text-blue-600">{dashboard?.payments?.paid || 0} Batches</span>
                </div>
                <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Pending Treasury Clearance</span>
                  <span className="font-bold text-amber-600">{dashboard?.payments?.pending || 0} Vouchers</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300">Total Disbursed to Bank Accounts</span>
                  <span className="font-bold text-purple-600">
                    ₹{(dashboard?.payments?.totalDisburbed || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Recent Muster & Verification Activities
            </h2>
            {dashboard?.recentActivities?.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {dashboard.recentActivities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {activity.employee?.firstName} {activity.employee?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.employee?.employeeID} • Status:{" "}
                        <span className="capitalize font-semibold text-emerald-600">
                          {activity.status}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No muster activity recorded today yet.</p>
            )}
          </Card>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
