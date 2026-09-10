import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner, EmptyState } from "../../components/Loading";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Briefcase,
  Clock,
  Info,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeNotifications = () => {
  const { apiClient } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: { ...n.status, read: true } } : n))
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: { ...n.status, read: true } }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.status?.read;
    if (filter === "payments") return n.type === "payment";
    if (filter === "assignments") return n.type === "work-assignment";
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case "attendance":
        return <Clock className="w-5 h-5 text-primary-500" />;
      case "work-assignment":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case "emergency":
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications & Alerts - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Notifications & Broadcasts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Real-time updates regarding wage credits, muster changes, and safety alerts.
              </p>
            </div>
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 shadow-xs transition"
            >
              <CheckCheck className="w-4 h-4 text-primary-500" />
              Mark All as Read
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Updates" },
              { id: "unread", label: "Unread Only" },
              { id: "payments", label: "Wage Credits" },
              { id: "assignments", label: "Work Orders" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filter === tab.id
                    ? "bg-primary-500 text-white shadow-xs"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No notifications to show"
              description="You are completely caught up with all village updates!"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <Card
                  key={item._id}
                  className={`p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 ${
                    !item.status?.read
                      ? "border-primary-300 dark:border-primary-800 bg-primary-50/20 dark:bg-primary-950/20 shadow-xs"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.priority === "urgent" && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 uppercase">
                            Urgent
                          </span>
                        )}
                        {!item.status?.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                        {item.message}
                      </p>
                      <span className="block text-[11px] text-gray-400 mt-2">
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {!item.status?.read && (
                    <button
                      onClick={() => markAsRead(item._id)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 shrink-0 p-1 hover:underline"
                    >
                      Mark Read
                    </button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeeNotifications;
