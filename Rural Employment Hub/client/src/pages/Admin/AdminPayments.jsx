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
  CreditCard,
  PlusCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building,
  X,
  ArrowUpRight,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";
import toast from "react-hot-toast";

const AdminPayments = () => {
  const { apiClient } = useAuth();
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // New Payment Form
  const [newPayment, setNewPayment] = useState({
    employeeID: "",
    dailyWage: 320,
    workingDays: 15,
    bonus: 0,
    deductions: 0,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    paymentMethod: "bank-transfer",
  });

  useEffect(() => {
    fetchPayments();
    fetchEmployeesList();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payments?limit=100");
      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await apiClient.get("/users/all?limit=100");
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to load employees for payment:", error);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!newPayment.employeeID) {
      return toast.error("Please select an employee");
    }

    try {
      setSubmitting(true);
      const baseSalary = newPayment.dailyWage * newPayment.workingDays;
      const totalAmount = baseSalary + Number(newPayment.bonus) - Number(newPayment.deductions);

      await apiClient.post("/payments", {
        employeeID: newPayment.employeeID,
        paymentPeriod: {
          startDate: newPayment.startDate,
          endDate: newPayment.endDate,
        },
        dailyWage: Number(newPayment.dailyWage),
        workingDays: Number(newPayment.workingDays),
        baseSalary,
        bonus: Number(newPayment.bonus),
        deductions: Number(newPayment.deductions),
        totalAmount,
        paymentMethod: newPayment.paymentMethod,
        status: "pending",
      });

      toast.success("Payment created in payroll queue!");
      setShowCreateModal(false);
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        ...(newStatus === "paid" && {
          transactionID: `TXN-DBT-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      };
      await apiClient.put(`/payments/${id}`, payload);
      toast.success(`Payment updated to ${newStatus}`);
      fetchPayments();
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const openReceiptModal = async (id) => {
    try {
      const res = await apiClient.get(`/payments/${id}/receipt`);
      setSelectedReceipt(res.data.receipt);
    } catch (error) {
      toast.error("Failed to fetch receipt");
    }
  };

  const totalDisbursed = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const pendingAmount = payments
    .filter((p) => p.status === "pending" || p.status === "approved")
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  const paymentExportHeaders = [
    { label: "Transaction ID", key: "transactionID" },
    { label: "Worker ID", key: "employeeID" },
    { label: "Worker Name", key: "employee.firstName" },
    { label: "Daily Wage (₹)", key: "dailyWage" },
    { label: "Working Days", key: "workingDays" },
    { label: "Total Amount (₹)", key: "totalAmount" },
    { label: "Payment Method", key: "paymentMethod" },
    { label: "Status", key: "status" },
  ];

  const handleExportExcel = () => {
    exportToExcel("Payroll_Disbursements_Report", "Wage Disbursements", payments, paymentExportHeaders);
    toast.success("Payroll report exported to Excel");
  };

  const handleExportPDF = () => {
    exportToPDF(
      "Payroll_Disbursements_Report",
      "Wage Disbursements & DBT Payroll Summary",
      `Comprehensive muster payroll record for ${payments.length} wage transactions`,
      paymentExportHeaders,
      payments
    );
  };

  return (
    <>
      <Helmet>
        <title>Payroll & Disbursements - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-[#fcfaf5] dark:bg-[#071308]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Payroll & Wage Disbursements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Process muster wage disbursements, generate DBT vouchers, and approve transactions.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Export to Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                title="Export / Print PDF"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <Button onClick={() => setShowCreateModal(true)} className="py-2 px-3.5 shadow-sm text-xs">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Disburse Wage
              </Button>
            </div>
          </div>

          {/* Metric Overview */}
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Total Wages Disbursed
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                ₹{totalDisbursed.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {payments.filter((p) => p.status === "paid").length} successful transfers
              </p>
            </Card>

            <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-amber-500/10 to-transparent">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Pending Approval
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {payments.filter((p) => p.status === "pending").length} vouchers awaiting action
              </p>
            </Card>

            <Card className="p-5 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-500/10 to-transparent">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
                Total Workers on Payroll
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {employees.length} Workers
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                100% Aadhaar-linked accounts
              </p>
            </Card>
          </div>

          {/* Payments Table */}
          {loading ? (
            <LoadingSpinner />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No payment vouchers found"
              description="Click Generate Wage Disbursement above to create a new muster wage voucher."
            />
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs uppercase font-semibold text-gray-600 dark:text-gray-400">
                    <tr>
                      <th className="py-3.5 px-4">Worker</th>
                      <th className="py-3.5 px-4">Period / Days</th>
                      <th className="py-3.5 px-4">Wage Breakdown</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {p.employee?.firstName} {p.employee?.lastName}
                          </p>
                          <span className="text-[11px] font-mono text-primary-600">
                            {p.employeeID}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                          <p className="font-semibold">{p.workingDays} working days</p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(p.paymentPeriod?.startDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}{" "}
                            -{" "}
                            {new Date(p.paymentPeriod?.endDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                          <p>Base: ₹{p.baseSalary} (@ ₹{p.dailyWage}/day)</p>
                          <p className="text-[11px] text-gray-400">
                            +{p.bonus || 0} bonus / -{p.deductions || 0} ded.
                          </p>
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
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(p._id, "approved")}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                              >
                                Approve
                              </button>
                            )}
                            {p.status === "approved" && (
                              <button
                                onClick={() => handleUpdateStatus(p._id, "paid")}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => openReceiptModal(p._id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-gray-100"
                              title="View Slip"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Create Payment Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down my-8">
                <div className="p-5 bg-gradient-rural text-white flex justify-between items-center">
                  <h3 className="font-bold text-lg">Generate Wage Voucher</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Select Worker *
                    </label>
                    <select
                      value={newPayment.employeeID}
                      onChange={(e) => setNewPayment({ ...newPayment, employeeID: e.target.value })}
                      className="input py-2 text-xs"
                      required
                    >
                      <option value="">-- Choose Worker --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp.employeeID}>
                          {emp.firstName} {emp.lastName} ({emp.employeeID}) - {emp.village}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Daily Wage (₹)"
                      type="number"
                      value={newPayment.dailyWage}
                      onChange={(e) => setNewPayment({ ...newPayment, dailyWage: e.target.value })}
                      required
                    />
                    <Input
                      label="Working Days"
                      type="number"
                      value={newPayment.workingDays}
                      onChange={(e) => setNewPayment({ ...newPayment, workingDays: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Incentive / Bonus (₹)"
                      type="number"
                      value={newPayment.bonus}
                      onChange={(e) => setNewPayment({ ...newPayment, bonus: e.target.value })}
                    />
                    <Input
                      label="Deductions (₹)"
                      type="number"
                      value={newPayment.deductions}
                      onChange={(e) => setNewPayment({ ...newPayment, deductions: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Period Start"
                      type="date"
                      value={newPayment.startDate}
                      onChange={(e) => setNewPayment({ ...newPayment, startDate: e.target.value })}
                      required
                    />
                    <Input
                      label="Period End"
                      type="date"
                      value={newPayment.endDate}
                      onChange={(e) => setNewPayment({ ...newPayment, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-xs flex justify-between font-bold">
                    <span>Total Calculated Wage:</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      ₹
                      {(
                        newPayment.dailyWage * newPayment.workingDays +
                        Number(newPayment.bonus) -
                        Number(newPayment.deductions)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Create Voucher
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Receipt Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-in-down p-6">
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Wage Voucher Receipt</h3>
                    <p className="text-xs text-primary-600 font-mono">{selectedReceipt.receiptNumber || "REC-2024-0012"}</p>
                  </div>
                  <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <p className="flex justify-between">
                    <span>Beneficiary:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedReceipt.employee?.firstName} {selectedReceipt.employee?.lastName}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Total Working Days:</span>
                    <span>{selectedReceipt.workingDays} days</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Daily Wage:</span>
                    <span>₹{selectedReceipt.dailyWage} / day</span>
                  </p>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                    <span>Net Disbursed:</span>
                    <span>₹{selectedReceipt.totalAmount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button onClick={() => setSelectedReceipt(null)} className="text-xs py-2">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminPayments;
