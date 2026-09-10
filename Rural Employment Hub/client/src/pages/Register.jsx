import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import {
  UserCheck,
  Building2,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  MapPin,
  FileText,
  Phone,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const { apiClient } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleOptions = [
    { value: "state_admin", label: "State Admin" },
    { value: "assistant_admin", label: "Assistant Admin" },
    { value: "field_worker", label: "Field Worker" },
    { value: "worker", label: "Worker" },
  ];
  const selectedRole = roleOptions.some((option) => option.value === searchParams.get("role"))
    ? searchParams.get("role")
    : "";

  const [formData, setFormData] = useState({
    name: "",
    fatherOrHusbandName: "",
    gender: "Male",
    age: "32",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "Andhra Pradesh",
    district: "Kurnool",
    mandal: "Dhone",
    village: "Kothapalli",
    panchayat: "Kothapalli Gram Panchayat",
    address: "Main Village Street",
    aadhaar: "",
    jobCardNumber: "",
    bankName: "State Bank of India",
    accountNumber: "",
    ifscCode: "SBIN0001234",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.password) {
      return setErrorMessage("Please fill in all required fields (Name, Mobile, Password)");
    }

    if (!selectedRole) {
      return setErrorMessage("Please select the section you are registering for");
    }

    if (formData.password.length < 6) {
      return setErrorMessage("Password must be at least 6 characters");
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    if (formData.phone.replace(/[^0-9]/g, "").length < 10) {
      return setErrorMessage("Please enter a valid 10-digit mobile number");
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.post("/auth/register", { ...formData, role: selectedRole });
      setSubmittedData({
        ...formData,
        role: selectedRole,
        roleLabel: roleOptions.find((option) => option.value === selectedRole)?.label,
        employeeID: res.data?.user?.employeeID || "",
        jobCardNumber: res.data?.user?.jobCardNumber || formData.jobCardNumber || "",
      });
      toast.success(`${roleOptions.find((option) => option.value === selectedRole)?.label} registration submitted!`);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to submit registration. Please verify details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Rural Worker Job Card Registration - Rural Employment Hub | Govt. of India</title>
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fcfaf5] via-emerald-50/40 to-sky-50/30 dark:from-[#071308] dark:via-[#091b0c] dark:to-[#071308]">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-sky-800 text-white shadow-lg mb-3">
              <Landmark size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedRole ? `${roleOptions.find((option) => option.value === selectedRole)?.label} Registration` : "Registration"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
              MGNREGA Employment Scheme & Direct Benefit Transfer (DBT) Onboarding
            </p>
          </div>

          {/* If Submitted: Show Confirmation Screen */}
          {submittedData ? (
            <div className="bg-white dark:bg-[#0d1e0f] p-8 rounded-3xl border border-emerald-800/30 shadow-gov-lg text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Application Submitted for Verification
              </h2>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold my-4">
                <Clock size={13} />
                <span>Status: Pending Field Admin Review & Verification</span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900 dark:text-white">{submittedData.name}</strong>. Your worker registration application for <strong>{submittedData.village} Village ({submittedData.mandal} Mandal)</strong> has been recorded and assigned to your local <strong>Field Admin</strong> for verification.
              </p>

              {/* Summary Box */}
              <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-emerald-900/50 text-left grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Applicant Name:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{submittedData.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Registered Phone:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{submittedData.phone}</p>
                </div>
                <div>
                  <span className="text-slate-500">Village / Mandal:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{submittedData.village}, {submittedData.mandal}</p>
                </div>
                <div>
                  <span className="text-slate-500">Job Card Number:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{submittedData.jobCardNumber}</p>
                </div>
                <div>
                  <span className="text-slate-500">DBT Bank:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{submittedData.bankName} (A/C: •••• {submittedData.accountNumber.slice(-4)})</p>
                </div>
                <div>
                  <span className="text-slate-500">Reviewing Authority:</span>
                  <p className="font-bold text-sky-600 dark:text-sky-400">Dhone Mandal Field Admin</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-300 mb-6 text-left flex items-start space-x-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  Once your Field Admin approves your Job Card and bank verification, you can log in to view your attendance calendar, wage slips, and SMS alerts.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-6 py-2.5"
                >
                  <span>Go to Sign In Portal</span>
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmittedData(null);
                    setFormData({
                      ...formData,
                      name: "",
                      phone: "",
                      password: "",
                      confirmPassword: "",
                    });
                  }}
                  className="w-full sm:w-auto px-6 py-2.5"
                >
                  Register Another Worker
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0d1e0f] p-6 sm:p-10 rounded-3xl border border-emerald-900/10 dark:border-emerald-800/40 shadow-gov-lg">
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
                  Registration Section
                </label>
                <select
                  value={selectedRole}
                  onChange={(event) => setSearchParams({ role: event.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select a section</option>
                  {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <p className="mt-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  You are registering for: {selectedRole ? roleOptions.find((option) => option.value === selectedRole)?.label : "No section selected"}
                </p>
              </div>
              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 mb-6 flex items-start space-x-2.5">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">Official Registration Notice:</strong>
                  This form is exclusively for <strong>Rural Workers & MGNREGA Job Card applicants</strong>. Administrative accounts (State, Assistant & Field Admins) are provisioned directly by Department HQ.
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Personal Details */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-emerald-900/10 dark:border-emerald-800/40 pb-2 mb-4 flex items-center space-x-2">
                    <UserCheck size={16} />
                    <span>1. Worker Personal Details</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name (as per Aadhaar / Bank) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Ramesh Babu"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Father's / Husband's Name
                      </label>
                      <input
                        type="text"
                        name="fatherOrHusbandName"
                        value={formData.fatherOrHusbandName}
                        onChange={handleChange}
                        placeholder="e.g. Venkataiah"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number (for SMS Wage Alerts) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876510001"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          min="18"
                          max="70"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Village & Jurisdiction */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-emerald-900/10 dark:border-emerald-800/40 pb-2 mb-4 flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>2. Residence & Jurisdiction</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        District
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Kurnool">Kurnool</option>
                        <option value="Anantapur">Anantapur</option>
                        <option value="Guntur">Guntur</option>
                        <option value="Chittoor">Chittoor</option>
                        <option value="Kadapa">Kadapa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mandal / Block
                      </label>
                      <input
                        type="text"
                        name="mandal"
                        value={formData.mandal}
                        onChange={handleChange}
                        placeholder="e.g. Dhone"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Gram Panchayat / Village
                      </label>
                      <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        placeholder="e.g. Kothapalli"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Job Card, Aadhaar & Direct Benefit Transfer (DBT) Bank */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-emerald-900/10 dark:border-emerald-800/40 pb-2 mb-4 flex items-center space-x-2">
                    <CreditCard size={16} />
                    <span>3. Identification & DBT Bank Account</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        12-Digit Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaar"
                        value={formData.aadhaar}
                        onChange={handleChange}
                        placeholder="8765-4321-9012"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Existing Job Card Number (Optional)
                      </label>
                      <input
                        type="text"
                        name="jobCardNumber"
                        value={formData.jobCardNumber}
                        onChange={handleChange}
                        placeholder="AP-12-004-1001 (or auto-assigned)"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Name for Wage Credit
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g. State Bank of India"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Bank Account Number & IFSC
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          placeholder="Account Number"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        />
                        <input
                          type="text"
                          name="ifscCode"
                          value={formData.ifscCode}
                          onChange={handleChange}
                          placeholder="IFSC Code"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Password */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 border-b border-emerald-900/10 dark:border-emerald-800/40 pb-2 mb-4 flex items-center space-x-2">
                    <Lock size={16} />
                    <span>4. Portal Security Credentials</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Create Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Worker Registration to Field Admin</span>
                      <Send size={16} />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Already registered?{" "}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
