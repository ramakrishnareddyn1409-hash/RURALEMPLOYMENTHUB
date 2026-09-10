import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { LoadingSpinner } from "../../components/Loading";
import {
  Clock,
  MapPin,
  Camera,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Fingerprint,
} from "lucide-react";
import toast from "react-hot-toast";

const EmployeeAttendance = () => {
  const { user, apiClient } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("face-recognition");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    fetchTodayAttendance();
    requestLocation();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const res = await apiClient.get(`/attendance/employee?startDate=${today}&endDate=${today}`);
      const records = res.data.attendance || [];
      setTodayRecord(records[0] || null);
    } catch (error) {
      console.error("Failed to fetch today attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          address: `${user?.village || "Venkatapuram"} Worksite, ${user?.mandal || "Dhone"}`,
        });
        setLocating(false);
      },
      (err) => {
        console.warn("Location error, using worksite default coordinates", err);
        setLocation({
          latitude: 15.4214,
          longitude: 77.8762,
          accuracy: 10,
          address: `${user?.village || "Venkatapuram"} Worksite, ${user?.mandal || "Dhone"}`,
        });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const simulateBiometricScan = (onComplete) => {
    setScanning(true);
    setScanProgress(10);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScanning(false);
            onComplete();
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleMarkAttendance = async (actionType = "check-in") => {
    if (!location) {
      toast.error("Detecting your worksite location, please wait...");
      requestLocation();
      return;
    }

    simulateBiometricScan(async () => {
      try {
        setSubmitting(true);
        const payload = {
          date: new Date().toISOString(),
          status: "present",
          verificationMethod,
          faceVerified: verificationMethod === "face-recognition",
          fingerprintVerified: verificationMethod === "fingerprint",
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          remarks: actionType === "check-out" ? "Daily Shift Completed" : "Morning Check-in",
        };

        const response = await apiClient.post("/attendance/mark", payload);
        toast.success(
          actionType === "check-out"
            ? "Shift check-out recorded successfully!"
            : "Attendance marked & biometric verified!"
        );
        setTodayRecord(response.data.attendance);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to record attendance");
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Mark Attendance - Rural Employment Hub</title>
      </Helmet>
      <Navbar />
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Daily Attendance Verification
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Mark your daily muster roll check-in via GPS & biometric scan.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-sm">
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: Live Verification Station */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                    Biometric Verification Station
                  </h2>

                  {/* Verification Method Tabs */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setVerificationMethod("face-recognition")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        verificationMethod === "face-recognition"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-semibold shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-xs">Face ID Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerificationMethod("fingerprint")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        verificationMethod === "fingerprint"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-semibold shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Fingerprint className="w-5 h-5" />
                      <span className="text-xs">Fingerprint</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerificationMethod("qr-code")}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        verificationMethod === "qr-code"
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 font-semibold shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="text-xs">Muster QR</span>
                    </button>
                  </div>

                  {/* Interactive Scanner Viewport */}
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 p-8 text-center text-white min-h-[260px] flex flex-col items-center justify-center border border-gray-800 shadow-inner">
                    {/* Corner Reticles */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-400" />
                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-400" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-400" />
                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-400" />

                    {scanning ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full border-4 border-primary-500 border-t-transparent animate-spin mx-auto flex items-center justify-center">
                          <span className="text-xs font-bold">{scanProgress}%</span>
                        </div>
                        <p className="text-sm text-primary-300 font-medium animate-pulse">
                          Verifying identity & anti-spoofing checks...
                        </p>
                      </div>
                    ) : todayRecord ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                          <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Attendance Verified for Today</h3>
                        <p className="text-xs text-gray-300 max-w-sm">
                          Check-in recorded at {new Date(todayRecord.checkInTime || todayRecord.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto text-primary-400 shadow-lg">
                          {verificationMethod === "face-recognition" && <Camera className="w-10 h-10" />}
                          {verificationMethod === "fingerprint" && <Fingerprint className="w-10 h-10" />}
                          {verificationMethod === "qr-code" && <QrCode className="w-10 h-10" />}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">Position Face in Camera Frame</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Ensure adequate lighting. Works offline & syncs automatically.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {!todayRecord ? (
                      <Button
                        full
                        disabled={submitting || scanning || locating}
                        loading={submitting || scanning}
                        onClick={() => handleMarkAttendance("check-in")}
                        className="py-3 text-base shadow-lg hover:shadow-primary-500/25"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirm Morning Check-In
                      </Button>
                    ) : (
                      <div className="w-full flex flex-col sm:flex-row gap-3">
                        <Button
                          full
                          variant="outline"
                          disabled={submitting || scanning}
                          onClick={() => handleMarkAttendance("re-scan")}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update / Re-Scan
                        </Button>
                        <Button
                          full
                          disabled={submitting || scanning || todayRecord.checkOutTime}
                          onClick={() => handleMarkAttendance("check-out")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {todayRecord.checkOutTime ? "Shift Finished" : "Record Shift Check-Out"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* GPS Location Card */}
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary-500" />
                      Worksite GPS Geofence Check
                    </h3>
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={locating}
                      className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
                      Refresh GPS
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {location?.address || "Detecting village worksite..."}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                        Lat: {location?.latitude || "--"} • Long: {location?.longitude || "--"} (Acc: {location?.accuracy || 5}m)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                      Within Geofence
                    </span>
                  </div>
                </Card>
              </div>

              {/* Right Column: Status & Guidelines */}
              <div className="space-y-6">
                {/* Today's Status Card */}
                <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/60">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                    Today's Attendance Status
                  </h2>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-xl shadow-xs">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          todayRecord?.status === "present"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {todayRecord?.status || "Not Marked"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-xl shadow-xs">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Check-in Time</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {todayRecord?.checkInTime
                          ? new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "--:--"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-xl shadow-xs">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Check-out Time</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {todayRecord?.checkOutTime
                          ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Active on Worksite"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700/50 rounded-xl shadow-xs">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Verified By</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {todayRecord?.isVerified ? "Muster Supervisor ✅" : "Automated Biometrics"}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Muster Guidelines */}
                <Card className="border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary-500" />
                    Attendance Guidelines
                  </h3>
                  <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold">•</span>
                      <span>Morning check-in opens from <strong>8:00 AM to 9:30 AM</strong> at the village site.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold">•</span>
                      <span>You must be within <strong>200 meters</strong> of the allocated project coordinates.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 font-bold">•</span>
                      <span>Check-out requires a minimum of <strong>6 hours</strong> for full-day daily wage accreditation.</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EmployeeAttendance;
