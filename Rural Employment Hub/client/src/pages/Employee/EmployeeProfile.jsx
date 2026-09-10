import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import {
  getAllStates,
  getDistricts,
  getMandals,
  getPanchayats,
  getVillages,
} from "../../data/locationHierarchy";
import {
  User,
  Building,
  ShieldCheck,
  Key,
  CheckCircle,
  MapPin,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeProfile = () => {
  const { user, apiClient, getCurrentUser } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("personal"); // "personal", "bank", "security"
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    state: "",
    village: "",
    mandal: "",
    district: "",
    panchayat: "",
  });

  // Bank Form
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
  });

  // Bank OTP state
  const [bankOtp, setBankOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState("");
  const timerRef = useRef(null);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        state: user.state || "Andhra Pradesh",
        village: user.village || "",
        mandal: user.mandal || "",
        district: user.district || "",
        panchayat: user.panchayat || "",
      });
      setBankData({
        bankName: user.bankName || "State Bank of India",
        accountNumber: user.accountNumber || "",
        accountHolderName: user.accountHolderName || `${user.firstName} ${user.lastName}`,
        ifscCode: user.ifscCode || "SBIN0001234",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.put("/users/profile", profileData);
      if (getCurrentUser) await getCurrentUser();
      toast.success("Profile information updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendBankOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await apiClient.post("/users/bank-otp/send");
      toast.success(res.data?.message || "Verification OTP sent to registered mobile number!");
      setOtpSent(true);
      setResendTimer(45);
      if (res.data?.otp) {
        setDevOtpHint(res.data.otp);
        setBankOtp(res.data.otp);
        toast(`🔑 Dev OTP: ${res.data.otp}`, { duration: 8000, icon: "📱" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndSaveBank = async (e) => {
    e.preventDefault();
    if (!bankOtp || bankOtp.trim().length !== 6) {
      return toast.error("Please enter the 6-digit OTP sent to your phone");
    }
    try {
      setVerifyingOtp(true);
      const res = await apiClient.post("/users/bank-otp/verify", {
        ...bankData,
        otp: bankOtp.trim(),
      });
      toast.success(res.data?.message || "Bank details verified and updated!");
      setOtpSent(false);
      setBankOtp("");
      if (getCurrentUser) await getCurrentUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please check and try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      setLoading(true);
      await apiClient.post("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("profile")} - {t("appName")}</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-[#fcfaf5] dark:bg-[#071308]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="border border-emerald-800/40 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-gov-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white text-primary-600 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/40">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.firstName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    user?.firstName?.[0] || "E"
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                      {user?.employeeID || "EMP-2024-001"}
                    </span>
                  </div>
                  <p className="text-sm opacity-90 mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {user?.village || "Venkatapuram"}, GP: {user?.panchayat || "Venkatapuram"},{" "}
                    {user?.district || "Kurnool"}, {user?.state || "Andhra Pradesh"}
                  </p>
                  <div className="mt-3 flex gap-2 flex-wrap justify-center sm:justify-start text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs font-medium">
                      Job Card: {user?.jobCardNumber || "AP-03-012-0045"}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/40 text-emerald-100 font-medium">
                      Aadhaar Verified ✓
                    </span>
                    {user?.bankVerified && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/40 text-blue-100 font-medium">
                        Bank DBT Active ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Language Switcher in Profile */}
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl text-center">
                <span className="text-[11px] block font-semibold mb-1 text-white/90">
                  {t("language")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            {[
              { id: "personal", label: "Personal & Location", icon: User },
              { id: "bank", label: "Bank Account & OTP", icon: Building },
              { id: "security", label: "Password & Security", icon: Key },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === id
                    ? "bg-primary-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab 1: Personal & Location Details */}
          {activeTab === "personal" && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Personal Information & State Jurisdiction
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      State*
                    </label>
                    <select
                      value={profileData.state}
                      onChange={(e) => {
                        const st = e.target.value;
                        const dists = getDistricts(st);
                        const firstDist = dists[0] || "";
                        const mands = getMandals(st, firstDist);
                        const firstMand = mands[0] || "";
                        const panchs = getPanchayats(st, firstDist, firstMand);
                        const firstPanch = panchs[0] || "";
                        const vills = getVillages(st, firstDist, firstMand, firstPanch);
                        setProfileData({
                          ...profileData,
                          state: st,
                          district: firstDist,
                          mandal: firstMand,
                          panchayat: firstPanch,
                          village: vills[0] || firstPanch,
                        });
                      }}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                    >
                      {getAllStates().map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      District*
                    </label>
                    <select
                      value={profileData.district}
                      onChange={(e) => {
                        const d = e.target.value;
                        const mands = getMandals(profileData.state, d);
                        const firstMand = mands[0] || "";
                        const panchs = getPanchayats(profileData.state, d, firstMand);
                        const firstPanch = panchs[0] || "";
                        const vills = getVillages(profileData.state, d, firstMand, firstPanch);
                        setProfileData({
                          ...profileData,
                          district: d,
                          mandal: firstMand,
                          panchayat: firstPanch,
                          village: vills[0] || firstPanch,
                        });
                      }}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                    >
                      {getDistricts(profileData.state).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Mandal / Block*
                    </label>
                    <select
                      value={profileData.mandal}
                      onChange={(e) => {
                        const m = e.target.value;
                        const panchs = getPanchayats(profileData.state, profileData.district, m);
                        const firstPanch = panchs[0] || "";
                        const vills = getVillages(profileData.state, profileData.district, m, firstPanch);
                        setProfileData({
                          ...profileData,
                          mandal: m,
                          panchayat: firstPanch,
                          village: vills[0] || firstPanch,
                        });
                      }}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                    >
                      {getMandals(profileData.state, profileData.district).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gram Panchayat
                    </label>
                    <select
                      value={profileData.panchayat}
                      onChange={(e) => {
                        const p = e.target.value;
                        const vills = getVillages(profileData.state, profileData.district, profileData.mandal, p);
                        setProfileData({
                          ...profileData,
                          panchayat: p,
                          village: vills[0] || p,
                        });
                      }}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                    >
                      {getPanchayats(profileData.state, profileData.district, profileData.mandal).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Village / Habitation*
                    </label>
                    {getVillages(profileData.state, profileData.district, profileData.mandal, profileData.panchayat).length > 0 ? (
                      <select
                        value={profileData.village}
                        onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                        className="w-full text-xs py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                      >
                        {getVillages(profileData.state, profileData.district, profileData.mandal, profileData.panchayat).map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={profileData.village}
                        onChange={(e) => setProfileData({ ...profileData, village: e.target.value })}
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="pt-3">
                  <Button type="submit" loading={loading} className="px-6">
                    <Save className="w-4 h-4 mr-2" />
                    Save Details
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 2: Bank Details with Bank OTP Verification */}
          {activeTab === "bank" && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("bankTitle")}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {t("bankSub")}
                  </p>
                </div>

                {user?.bankVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <CheckCircle className="w-4 h-4" /> {t("bankVerifiedBadge")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4" /> {t("bankPendingBadge")}
                  </span>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleVerifyAndSaveBank} className="space-y-4 mt-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label={t("bankName")}
                    value={bankData.bankName}
                    onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    required
                  />
                  <Input
                    label={t("accountHolder")}
                    value={bankData.accountHolderName}
                    onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label={t("accountNumber")}
                    value={bankData.accountNumber}
                    onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                    placeholder="e.g. 30294857102"
                    required
                  />
                  <Input
                    label={t("ifscCode")}
                    value={bankData.ifscCode}
                    onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value })}
                    placeholder="e.g. SBIN0001234"
                    required
                  />
                </div>

                {/* ─── Bank OTP Verification Section ─── */}
                <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-900/60 bg-primary-50/60 dark:bg-primary-950/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-primary-600" />
                        Bank Account OTP Verification Step
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        An OTP will be dispatched to your registered mobile number{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {user?.phone ? `(${user.phone.slice(0, 3)}****${user.phone.slice(-3)})` : ""}
                        </span>{" "}
                        to protect your DBT payments.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      loading={otpLoading}
                      disabled={otpLoading || resendTimer > 0}
                      onClick={handleSendBankOtp}
                      className="text-xs py-2 px-3 whitespace-nowrap self-start sm:self-auto"
                    >
                      {resendTimer > 0
                        ? `${t("resendOtpIn")} ${resendTimer}s`
                        : otpSent
                        ? "Resend Bank OTP"
                        : t("sendBankOtp")}
                    </Button>
                  </div>

                  {/* OTP Input Field */}
                  {otpSent && (
                    <div className="pt-2 border-t border-primary-100 dark:border-primary-900/40 flex flex-wrap items-center gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("enterOtp")}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={bankOtp}
                          onChange={(e) => setBankOtp(e.target.value)}
                          placeholder={t("otpPlaceholder")}
                          className="input py-2 px-3 text-sm font-mono tracking-widest text-center w-44"
                          required
                        />
                      </div>
                      <div className="self-end">
                        <Button
                          type="submit"
                          loading={verifyingOtp}
                          disabled={verifyingOtp}
                          className="py-2 px-4 text-xs font-bold shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {t("verifyConfirmBank")}
                        </Button>
                      </div>
                      {devOtpHint && (
                        <div className="text-[11px] font-mono text-primary-600 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md border border-primary-200 dark:border-gray-700">
                          Dev Code: <strong>{devOtpHint}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!otpSent && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleSendBankOtp}
                      loading={otpLoading}
                      className="px-6 py-2.5 text-xs font-bold"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Proceed with Bank OTP Verification
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}

          {/* Tab 3: Security */}
          {activeTab === "security" && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Change Password & Security
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />

                <div className="pt-3">
                  <Button type="submit" loading={loading} className="px-6">
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeeProfile;
