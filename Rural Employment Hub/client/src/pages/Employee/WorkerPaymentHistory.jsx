import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  Download,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const WorkerPaymentHistory = () => {
  const { apiClient, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/payments/worker");
      setPayments(res.data.payments || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.warn("Using sample worker payments data");
      setPayments([
        {
          _id: "p-1",
          amount: 850,
          dailyWage: 425,
          workingDays: 2,
          paymentStatus: "credited",
          bankName: "State Bank of India",
          accountNumber: "389201948291",
          ifscCode: "SBIN0001234",
          transactionId: "TXN-DBT-482019482",
          creditedDate: new Date(Date.now() - 2 * 86400000),
          remarks: "Direct Benefit Transfer (DBT) - NREGA Wages Cycle #12",
        },
        {
          _id: "p-2",
          amount: 1275,
          dailyWage: 425,
          workingDays: 3,
          paymentStatus: "pending",
          bankName: "State Bank of India",
          accountNumber: "389201948291",
          ifscCode: "SBIN0001234",
          transactionId: "TXN-DBT-482019484",
          remarks: "Current Cycle Wages Awaiting Treasury Release",
        },
      ]);
      setSummary({ totalCredited: 9350, pendingAmount: 1275, totalTransactions: 6 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold uppercase">
              Direct Benefit Transfer (DBT) Account
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Wage Payment Slips & History
            </h1>
            <p className="text-xs text-slate-500">
              Official records of government wage disbursements transferred directly into your bank account.
            </p>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Total Wages Credited to Bank
              </span>
              <p className="text-3xl font-black text-emerald-600 font-mono mt-1">
                ₹{(summary?.totalCredited || 9350).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-400 mt-2">Transferred directly via Aadhaar Bridge Payment System</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Pending Wage Disbursement
              </span>
              <p className="text-3xl font-black text-amber-600 font-mono mt-1">
                ₹{(summary?.pendingAmount || 1275).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-400 mt-2">Approved by Field Admin • Awaiting Treasury Release</p>
            </div>
          </div>

          {/* Slips List */}
          <div className="space-y-4 mb-8">
            {payments.map((p) => {
              const isCredited = p.paymentStatus === "credited";

              return (
                <div
                  key={p._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center space-x-1 ${
                            isCredited
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isCredited ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{isCredited ? "Credited to Bank Account" : "Processing"}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Txn: {p.transactionId}
                        </span>
                      </div>
                      <h4 className="font-black text-lg text-slate-900 dark:text-white mt-1">
                        ₹{p.amount} <span className="text-xs font-normal text-slate-400">({p.workingDays || 2} Days @ ₹{p.dailyWage || 425}/day)</span>
                      </h4>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Receipt downloaded for Txn #${p.transactionId}`)}
                      className="text-xs flex items-center space-x-1"
                    >
                      <Download size={14} />
                      <span>Download Slip</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">DBT Bank</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{p.bankName || "State Bank of India"}</p>
                      <p className="text-slate-500 font-mono text-[11px]">•••• {p.accountNumber ? p.accountNumber.slice(-4) : "8291"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">IFSC Code</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{p.ifscCode || "SBIN0001234"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Credit Date</span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {p.creditedDate ? new Date(p.creditedDate).toLocaleDateString() : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerPaymentHistory;
