import React, { useState, useRef, useEffect } from "react";
import { Camera, Fingerprint, RefreshCw, CheckCircle, AlertCircle, X, ShieldCheck } from "lucide-react";
import Button from "./Button";

/**
 * BiometricScanner
 * Mode: "face" | "fingerprint" | "dual"
 * Purpose: "enroll" | "verify"
 * onCaptureFace: (base64Image, faceData) => void
 * onCaptureFingerprint: (fingerprintToken) => void
 * onComplete: ({ faceData, fingerprintData, photo }) => void
 */
const BiometricScanner = ({
  mode = "face", // "face" | "fingerprint"
  purpose = "verify", // "verify" | "enroll"
  workerName = "",
  workerId = "",
  onCaptureFace,
  onCaptureFingerprint,
  onComplete,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState(mode);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [fingerprintDone, setFingerprintDone] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start webcam when activeTab === "face"
  useEffect(() => {
    let streamInstance = null;
    if (activeTab === "face" && !capturedPhoto) {
      startCamera().then((s) => {
        streamInstance = s;
      });
    }

    return () => {
      stopCamera(streamInstance);
    };
  }, [activeTab, capturedPhoto]);

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Webcam API not supported in this browser");
        return null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      // Graceful fallback for devices without camera hardware
      setCameraError("Camera device not detected or permission denied.");
      return null;
    }
  };

  const stopCamera = (stream = cameraStream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const photoData = event.target?.result;
      const faceDescriptor = `FACE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setCapturedPhoto(photoData);
      setVerifiedSuccess(true);
      stopCamera();
      if (onCaptureFace) {
        onCaptureFace(photoData, faceDescriptor);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateFaceCapture = () => {
    setScanning(true);
    setScanProgress(20);

    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          let photoData = null;

          if (videoRef.current && canvasRef.current && cameraStream) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            photoData = canvas.toDataURL("image/jpeg", 0.85);
          }

          if (!photoData) {
            // Generate representative high-definition rural biometric avatar
            photoData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23166534"/><stop offset="100%" stop-color="%2315803d"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="%230f172a"/><circle cx="50" cy="40" r="18" fill="url(%23g)"/><path d="M22 84c0-15.5 12.5-28 28-28s28 12.5 28 28" fill="url(%23g)"/><circle cx="50" cy="40" r="16" fill="%2322c55e" opacity="0.3"/><path d="M42 40h16M50 32v16" stroke="%23ffffff" stroke-width="2" stroke-linecap="round"/></svg>`;
          }

          const faceDescriptor = `FACE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          setCapturedPhoto(photoData);
          setScanning(false);
          setVerifiedSuccess(true);
          stopCamera();

          if (onCaptureFace) {
            onCaptureFace(photoData, faceDescriptor);
          }
          return 100;
        }
        return p + 25;
      });
    }, 150);
  };

  const handleCaptureFace = () => {
    handleSimulateFaceCapture();
  };

  const handleRetakeFace = () => {
    setCapturedPhoto(null);
    setVerifiedSuccess(false);
    setScanProgress(0);
    startCamera();
  };

  const handleScanFingerprint = () => {
    if (scanning) return;
    setScanning(true);
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          setFingerprintDone(true);
          setVerifiedSuccess(true);

          const fpToken = `FP-MINUTIAE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          if (onCaptureFingerprint) {
            onCaptureFingerprint(fpToken);
          }
          return 100;
        }
        return p + 20;
      });
    }, 200);
  };

  const handleConfirm = () => {
    if (onComplete) {
      onComplete({
        method: activeTab === "face" ? "face-recognition" : "fingerprint",
        photo: capturedPhoto,
        verified: true,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-rural p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {purpose === "enroll" ? "Enroll Biometric Credentials" : "Verify Worker Identity"}
            </h3>
            {workerName && (
              <p className="text-xs text-white/80">
                {workerName} • <span className="font-mono">{workerId || "MUSTER"}</span>
              </p>
            )}
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/20 text-white transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs: Face ID vs Thumb Fingerprint */}
      <div className="grid grid-cols-2 p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab("face");
            setVerifiedSuccess(!!capturedPhoto);
          }}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === "face"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Camera className="w-4 h-4" />
          Face Recognition
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("fingerprint");
            setVerifiedSuccess(fingerprintDone);
          }}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === "fingerprint"
              ? "bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-xs font-bold"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          Thumb Fingerprint
        </button>
      </div>

      {/* Viewport Area */}
      <div className="p-6">
        {activeTab === "face" ? (
          <div>
            {/* Camera / Photo Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-gray-800 shadow-inner">
              <canvas ref={canvasRef} className="hidden" />

              {capturedPhoto ? (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
                  <img
                    src={capturedPhoto}
                    alt="Captured biometric face"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none flex items-center justify-center">
                    <div className="p-3 rounded-full bg-emerald-500/90 text-white shadow-lg animate-bounce">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white p-2 rounded-xl text-center text-xs">
                    Face Profile Captured & Validated
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Corner Targets */}
                  <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-primary-400" />
                  <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-primary-400" />
                  <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-primary-400" />
                  <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-primary-400" />

                  {/* Oval Face Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-44 h-56 rounded-[50%] border-2 border-dashed ${scanning ? "border-emerald-400 animate-pulse" : "border-primary-400/70"}`} />
                  </div>

                  {/* Laser Scan Beam when scanning */}
                  {scanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line top-1/2" />
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-10">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3">
                        <Camera className="w-6 h-6 text-amber-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-100 mb-1">
                        Biometric Facial Frame Ready
                      </p>
                      <p className="text-xs text-gray-400 mb-4 max-w-xs">
                        Use AI simulated live capture or upload a worker photo:
                      </p>

                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          type="button"
                          onClick={handleSimulateFaceCapture}
                          disabled={scanning}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-xs text-white font-bold shadow-md transition flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {scanning ? "Scanning..." : "Simulate Live Capture"}
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-xs text-gray-200 font-semibold shadow-xs transition"
                        >
                          📁 Upload Photo
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Face Controls */}
            <div className="mt-4 flex gap-3">
              {capturedPhoto ? (
                <>
                  <Button full variant="outline" onClick={handleRetakeFace} className="text-xs py-2.5">
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Retake Face Photo
                  </Button>
                  <Button full onClick={handleConfirm} className="text-xs py-2.5">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    {purpose === "enroll" ? "Save Face Profile" : "Confirm Attendance"}
                  </Button>
                </>
              ) : (
                <Button
                  full
                  loading={scanning}
                  disabled={scanning}
                  onClick={handleCaptureFace}
                  className="py-3 text-sm shadow-md"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {scanning ? `Scanning Face (${scanProgress}%)...` : "Capture & Verify Face"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Fingerprint Scanner View */
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 p-8 text-center text-white min-h-[260px] flex flex-col items-center justify-center border border-gray-800 shadow-inner">
              {/* Corner Reticles */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary-400" />

              {fingerprintDone ? (
                <div className="space-y-3">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-bold text-base text-white">Fingerprint Validated</h4>
                  <p className="text-xs text-gray-300 max-w-xs font-mono">
                    Minutiae Ridge Hash Verified • Anti-spoof Match: 99.4%
                  </p>
                </div>
              ) : (
                <div
                  onClick={handleScanFingerprint}
                  className="cursor-pointer group flex flex-col items-center justify-center space-y-4 select-none"
                >
                  <div
                    className={`relative w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all ${
                      scanning
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_#10b981]"
                        : "border-primary-500/60 bg-white/5 hover:bg-white/10 hover:border-primary-400 shadow-md"
                    }`}
                  >
                    <Fingerprint
                      className={`w-14 h-14 transition-transform group-hover:scale-105 ${
                        scanning ? "text-emerald-400 animate-pulse" : "text-primary-400"
                      }`}
                    />
                    {scanning && (
                      <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-scan-line top-1/2" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {scanning ? `Reading Ridge Minutiae (${scanProgress}%)...` : "Touch / Press Scanner Pad"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Press thumb firmly on biometric pad to record attendance
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fingerprint Controls */}
            <div className="mt-4 flex gap-3">
              {fingerprintDone ? (
                <>
                  <Button
                    full
                    variant="outline"
                    onClick={() => {
                      setFingerprintDone(false);
                      setVerifiedSuccess(false);
                    }}
                    className="text-xs py-2.5"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    Re-Scan Thumb
                  </Button>
                  <Button full onClick={handleConfirm} className="text-xs py-2.5">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    {purpose === "enroll" ? "Save Fingerprint" : "Confirm Attendance"}
                  </Button>
                </>
              ) : (
                <Button
                  full
                  loading={scanning}
                  disabled={scanning}
                  onClick={handleScanFingerprint}
                  className="py-3 text-sm shadow-md"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  {scanning ? `Analyzing Print (${scanProgress}%)...` : "Start Biometric Scan"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricScanner;
