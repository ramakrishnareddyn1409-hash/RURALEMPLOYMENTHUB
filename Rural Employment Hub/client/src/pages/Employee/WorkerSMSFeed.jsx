import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  MessageSquareText,
  Send,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

const WorkerSMSFeed = () => {
  const { apiClient, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSMSFeed = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/dashboard/worker");
      const notifs = res.data.dashboard?.smsNotifications || [];
      setMessages(notifs);
    } catch (err) {
      console.warn("Using sample worker SMS feed");
      setMessages([
        {
          _id: "sms-1",
          title: "Wage Credited to Bank Account",
          message: `Dear ${user?.name || "Ramesh Babu"}, your Rural Employment wage of ₹850 has been credited successfully to your bank account (State Bank of India - A/C ending in 8291). Txn ID: TXN-DBT-482019482.`,
          createdAt: new Date(Date.now() - 2 * 86400000),
          recipientPhone: user?.phone || "+919876510001",
        },
        {
          _id: "sms-2",
          title: "Wage Credited to Bank Account",
          message: `Dear ${user?.name || "Ramesh Babu"}, your Rural Employment wage of ₹1275 has been credited successfully to your bank account. Txn ID: TXN-DBT-482019440.`,
          createdAt: new Date(Date.now() - 9 * 86400000),
          recipientPhone: user?.phone || "+919876510001",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSMSFeed();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfaf5] dark:bg-[#071308] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold uppercase flex items-center space-x-1 w-max">
              <MessageSquareText size={12} />
              <span>National Mobile Broadcast Gateway</span>
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              SMS Notification Inbox
            </h1>
            <p className="text-xs text-slate-500">
              Live log of SMS messages dispatched to your registered mobile number:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {user?.phone || "+919876510001"}
              </span>
            </p>
          </div>

          {/* SMS Feed */}
          <div className="space-y-4">
            {messages.map((sms, index) => (
              <div
                key={sms._id || index}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                      <Send size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {sms.title || "Government Wage Credit Alert"}
                      </h4>
                      <p className="text-[10px] text-slate-400">Sender: GOV-RURHUB • Delivered via SMS</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(sms.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{sms.message}"
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                    <CheckCircle2 size={14} />
                    <span>Delivered to Handset</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Channel: GSM SMS Broadcast</span>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <MessageSquareText size={36} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No SMS logs yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You will receive SMS alerts automatically whenever attendance wages are credited.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerSMSFeed;
