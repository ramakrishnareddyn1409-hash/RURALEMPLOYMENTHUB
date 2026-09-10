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
  Bell,
  Send,
  Radio,
  AlertTriangle,
  CreditCard,
  Briefcase,
  Users,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminNotifications = () => {
  const { apiClient } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Broadcast Form
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    priority: "medium",
    recipientType: "all",
    recipientId: "",
    channels: {
      inApp: true,
      sms: true,
      whatsapp: false,
    },
  });

  useEffect(() => {
    fetchNotifications();
    fetchEmployees();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/notifications?limit=50");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get("/users/all?limit=100");
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      return toast.error("Please fill title and message");
    }

    try {
      setSubmitting(true);
      if (formData.recipientType === "all") {
        await apiClient.post("/notifications/broadcast/all", {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          channels: formData.channels,
        });
        toast.success("Broadcast message sent to all registered workers!");
      } else {
        if (!formData.recipientId) {
          return toast.error("Please select a recipient worker");
        }
        await apiClient.post("/notifications/send", {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          recipient: formData.recipientId,
          recipientType: "individual",
          channels: formData.channels,
        });
        toast.success("Notification delivered to selected worker!");
      }

      setFormData({
        title: "",
        message: "",
        type: "general",
        priority: "medium",
        recipientType: "all",
        recipientId: "",
        channels: { inApp: true, sms: true, whatsapp: false },
      });
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to dispatch notification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Broadcast Alerts - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Worker Communication & Broadcast Dispatch
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Dispatch multichannel alerts via In-App, SMS, and WhatsApp to gram panchayat muster workers.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Compose Broadcast */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 dark:border-gray-700 sticky top-24">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary-500" />
                  Compose Broadcast
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Recipient Target *
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, recipientType: "all" })}
                        className={`p-2 rounded-lg text-xs font-semibold border transition ${
                          formData.recipientType === "all"
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        📢 All Workers ({employees.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, recipientType: "individual" })}
                        className={`p-2 rounded-lg text-xs font-semibold border transition ${
                          formData.recipientType === "individual"
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        👤 Single Worker
                      </button>
                    </div>

                    {formData.recipientType === "individual" && (
                      <select
                        value={formData.recipientId}
                        onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                        className="input py-2 text-xs"
                        required
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeID}) - {emp.village}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <Input
                    label="Announcement Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Weather Alert or Wage Credit"
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Message Content *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="input py-2 text-xs"
                      placeholder="Enter detailed message in English or Telugu..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="input py-2 text-xs"
                      >
                        <option value="general">General</option>
                        <option value="payment">Wage / Payment</option>
                        <option value="work-assignment">Work Assignment</option>
                        <option value="emergency">Emergency / Alert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="input py-2 text-xs"
                      >
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Channels:
                    </label>
                    <div className="flex gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.channels.inApp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              channels: { ...formData.channels, inApp: e.target.checked },
                            })
                          }
                          className="rounded text-primary-500"
                        />
                        <span>In-App</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.channels.sms}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              channels: { ...formData.channels, sms: e.target.checked },
                            })
                          }
                          className="rounded text-primary-500"
                        />
                        <span>SMS Gateway</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.channels.whatsapp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              channels: { ...formData.channels, whatsapp: e.target.checked },
                            })
                          }
                          className="rounded text-primary-500"
                        />
                        <span>WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <Button full type="submit" loading={submitting} className="py-2.5 shadow-sm">
                    <Send className="w-4 h-4 mr-2" />
                    Dispatch Broadcast
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right Column: Sent Notifications Stream */}
            <div className="lg:col-span-2">
              <Card className="p-0 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Broadcast Activity Log
                  </h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {notifications.length} Messages Dispatched
                  </span>
                </div>

                {loading ? (
                  <div className="p-8"><LoadingSpinner /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      title="No broadcasts logged yet"
                      description="Compose a broadcast to notify workers across the taluk."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((n) => (
                      <div key={n._id} className="p-5 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {n.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {n.type}
                            </span>
                            {n.priority === "urgent" && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                                Urgent
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            Target: {n.recipientType === "all" ? "All Panchayat Workers" : "Individual Worker"}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            Delivered via In-App {n.channels?.sms ? "+ SMS" : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminNotifications;
