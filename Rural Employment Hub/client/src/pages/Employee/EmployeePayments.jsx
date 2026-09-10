import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import {
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  X,
  Building,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeePayments = () => {
  const { user, apiClient } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payments/employee/list");
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  const openReceiptModal = async (paymentId) => {
    try {
      setLoadingReceipt(true);
      const res = await apiClient.get(`/payments/${paymentId}/receipt`);
      setSelectedReceipt(res.data.receipt);
    } catch (error) {
      console.error("Failed to fetch receipt:", error);
      toast.error("Could not load digital receipt");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const totalEarned = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const totalDaysWorked = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.workingDays || 0), 0);

  return (
    <>
      <Helmet>
        <title>Wage & Payment Management - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Wage & DBT Disbursements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Direct Benefit Transfer (DBT) wage records, salary breakdown, and digital slips.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Building className="w-4 h-4" />
              <span>Aadhaar DBT Linked: {user?.bankName || "SBI Primary"}</span>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Total Wages Disbursed
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    ₹{totalEarned.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Across {totalDaysWorked} verified muster days
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Pending / Processing
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    ₹{totalPending.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    In treasury approval queue
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-500/10 to-transparent">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                    Average Daily Wage
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    ₹{payments[0]?.dailyWage || 320} / day
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Category: Skilled Rural Construction
                  </p>
                </div>
                <div className="p-3 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Statement Table */}
          {loading ? (
            <LoadingSpinner />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No payment records yet"
              description="Once your muster roll is closed by the Panchayat, wage credits will appear here."
            />
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Payment Disbursement History
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {payments.length} Statements Found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-4">Period</th>
                      <th className="py-3.5 px-4">Days Worked</th>
                      <th className="py-3.5 px-4">Base Wage</th>
                      <th className="py-3.5 px-4">Bonus / Ded.</th>
                      <th className="py-3.5 px-4">Net Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Digital Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition">
                        <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {new Date(p.paymentPeriod?.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          -{" "}
                          {new Date(p.paymentPeriod?.endDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          {p.workingDays} days
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                          ₹{p.baseSalary}
                          <span className="text-[11px] text-gray-400 ml-1">(@ ₹{p.dailyWage})</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          <span className="text-emerald-600 font-medium">+₹{p.bonus || 0}</span>
                          <span className="text-rose-500 font-medium ml-2">-₹{p.deductions || 0}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          ₹{p.totalAmount?.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              p.status === "paid"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : p.status === "approved"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                : p.status === "pending"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => openReceiptModal(p._id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Digital Receipt Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down">
                <div className="p-5 bg-gradient-rural text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Digital Wage Receipt</h3>
                    <p className="text-xs opacity-90">Govt. Rural Employment Hub</p>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Receipt No:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {selectedReceipt.receiptNumber || "REC-2024-0012"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Employee:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedReceipt.employee?.firstName} {selectedReceipt.employee?.lastName} ({selectedReceipt.employeeID})
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Bank & DBT Account:</span>
                    <span>
                      {selectedReceipt.employee?.bankName || "State Bank of India"} ••••{selectedReceipt.employee?.accountNumber?.slice(-4) || "7102"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="text-gray-500">Days Credited:</span>
                    <span className="font-semibold">{selectedReceipt.workingDays} Days @ ₹{selectedReceipt.dailyWage}/day</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span>Base Wages:</span>
                      <span>₹{selectedReceipt.baseSalary}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Incentive / Bonus:</span>
                      <span>+₹{selectedReceipt.bonus || 0}</span>
                    </div>
                    <div className="flex justify-between text-rose-500">
                      <span>Statutory Deductions:</span>
                      <span>-₹{selectedReceipt.deductions || 0}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                      <span>Total Credited:</span>
                      <span>₹{selectedReceipt.totalAmount?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {selectedReceipt.transactionID && (
                    <div className="text-xs text-gray-500">
                      Transaction UTR: <span className="font-mono">{selectedReceipt.transactionID}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      full
                      onClick={() => {
                        window.print();
                      }}
                      className="text-xs py-2"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Print / Save Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeePayments;
