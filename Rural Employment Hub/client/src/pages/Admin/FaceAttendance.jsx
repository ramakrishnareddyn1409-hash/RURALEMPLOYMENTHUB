import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Clock3, Users, VideoOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  detectFacesInVideo,
  extractFaceEmbedding,
  drawBiometricHUD,
  getFaceQuality,
} from "../../utils/faceRecognition";

const RESET_DELAY = 3500;

const FaceAttendance = () => {
  const { apiClient, user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const processingRef = useRef(false);
  const resetTimerRef = useRef(null);
  const detectionInFlightRef = useRef(false);
  const cameraReadyRef = useRef(false);
  const [workers, setWorkers] = useState([]);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [state, setState] = useState("ready");
  const [message, setMessage] = useState("Look at the camera");
  const [recognizedWorker, setRecognizedWorker] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [statistics, setStatistics] = useState({ present: 0, total: 0 });

  const resetRecognition = () => {
    setState("ready");
    setMessage("Look at the camera");
    setRecognizedWorker(null);
    setCheckInTime(null);
    processingRef.current = false;
  };

  const loadAttendance = async () => {
    try {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
      const [workersResponse, attendanceResponse] = await Promise.all([
        apiClient.get("/users/workers"),
        apiClient.get(`/attendance/scoped?date=${today}`),
      ]);
      const workerList = workersResponse.data.workers || [];
      const attendanceList = attendanceResponse.data.attendance || [];
      setWorkers(workerList);
      setStatistics({
        present: attendanceList.filter((item) => (item.status || "").toLowerCase() === "present").length,
        total: workerList.length,
      });
    } catch {
      setWorkers([]);
      setStatistics({ present: 0, total: 0 });
    }
  };

  const finishRecognition = (nextState, nextMessage, worker, record) => {
    setState(nextState);
    setMessage(nextMessage);
    if (worker) setRecognizedWorker(worker);
    if (record?.checkInTime) setCheckInTime(record.checkInTime);
    resetTimerRef.current = window.setTimeout(resetRecognition, RESET_DELAY);
  };

  const recognizeFace = async (embedding, canvas) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setState("recognizing");
    setMessage("Recognizing worker...");

    try {
      const response = await apiClient.post("/attendance/face-mark", {
        faceEmbedding: embedding,
        capturedFaceThumbnail: canvas.toDataURL("image/jpeg", 0.55),
      });
      finishRecognition("success", "Attendance marked successfully", response.data.worker, response.data.attendance);
      await loadAttendance();
    } catch (error) {
      if (error.response?.status === 409) {
        finishRecognition("duplicate", "Attendance already marked today", error.response.data.worker, error.response.data.attendance);
      } else if (error.response?.status === 422) {
        finishRecognition("unknown", "Worker not recognized");
      } else {
        finishRecognition("ready", error.response?.data?.message || "Look at the camera");
      }
    }
  };

  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 2 && cameraReadyRef.current) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      if (!processingRef.current && !detectionInFlightRef.current) {
        detectionInFlightRef.current = true;
        detectFacesInVideo(video)
          .then((faces) => {
            const context = canvas.getContext("2d");
            if (faces.length === 0) {
              setState("ready");
              setMessage("Look at the camera");
              return;
            }
            if (faces.length > 1) {
              setState("multiple");
              setMessage("Please make sure only one person is in view");
              return;
            }
            const face = faces[0];
            if (context) drawBiometricHUD(context, face, state, recognizedWorker?.name, 0, 0);
            const quality = getFaceQuality(video, face);
            if (quality.brightness < 45) {
              setState("poor_quality");
              setMessage("Move into better lighting");
            } else if (quality.frontFacing < 0.72) {
              setState("poor_angle");
              setMessage("Please look directly at the camera");
            } else {
              setState("detected");
              setMessage("Face detected - verifying...");
              recognizeFace(extractFaceEmbedding(video, face), canvas);
            }
          })
          .catch(() => {
            setState("ready");
            setMessage("Look at the camera");
          })
          .finally(() => {
            detectionInFlightRef.current = false;
          });
      }
    }
    frameRef.current = window.requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      cameraReadyRef.current = true;
      setCameraReady(true);
      frameRef.current = window.requestAnimationFrame(scanFrame);
    } catch {
      setCameraError("Camera permission denied or no webcam was found.");
      cameraReadyRef.current = false;
      setCameraReady(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    startCamera();
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stateStyles = {
    success: "border-emerald-400 bg-emerald-950/80 text-emerald-200",
    duplicate: "border-amber-400 bg-amber-950/80 text-amber-200",
    unknown: "border-rose-400 bg-rose-950/80 text-rose-200",
    poor_angle: "border-sky-400 bg-sky-950/80 text-sky-200",
    poor_quality: "border-orange-400 bg-orange-950/80 text-orange-200",
  }[state] || "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <header className="text-center mb-6">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">Automatic attendance</p>
            <h1 className="text-3xl font-black text-white mt-2">AI Face Attendance</h1>
            <p className="text-sm text-slate-400 mt-2">Stand in front of the camera. No worker selection required.</p>
          </header>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100" />
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
                    <VideoOff size={42} className="text-slate-600 mb-3" />
                    <p className="font-bold text-slate-300">Camera ready when you are</p>
                    <p className="text-xs text-slate-500 mt-2">{cameraError || "Requesting camera access..."}</p>
                  </div>
                )}
                <div className={`absolute left-4 right-4 bottom-4 border rounded-xl px-4 py-3 backdrop-blur-md ${stateStyles}`}>
                  <p className="text-sm font-bold text-center">{message}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${cameraReady ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                <span>{cameraReady ? "Camera active - automatic recognition" : "Camera unavailable"}</span>
              </div>
            </section>
            <aside className="space-y-4">
              {(state === "success" || state === "duplicate") && recognizedWorker ? (
                <section className={`rounded-3xl border p-6 ${stateStyles}`}>
                  <div className="flex items-center gap-2 mb-5"><CheckCircle2 size={22} /><h2 className="font-black">{message}</h2></div>
                  <div className="space-y-3 text-sm">
                    <p className="text-xl font-black text-white">{recognizedWorker.name}</p>
                    <p><span className="opacity-70">Worker ID:</span> {recognizedWorker.employeeID || recognizedWorker.jobCardNumber || "Registered worker"}</p>
                    <p><span className="opacity-70">Village:</span> {recognizedWorker.village || "-"}</p>
                    {recognizedWorker.phone && <p><span className="opacity-70">Phone:</span> {recognizedWorker.phone}</p>}
                    <p className="font-bold">Today's Attendance: PRESENT</p>
                    <p><span className="opacity-70">Check-in:</span> {checkInTime ? new Date(checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Recorded today"}</p>
                    <p className="font-bold text-emerald-300">Recognition Status: VERIFIED</p>
                  </div>
                </section>
              ) : (
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
                  <Camera size={34} className="mx-auto text-emerald-400 mb-3" />
                  <h2 className="font-bold text-white">{message}</h2>
                  <p className="text-xs text-slate-500 mt-2">Worker details appear after successful recognition.</p>
                </section>
              )}
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-950 p-4 text-center"><Users size={18} className="mx-auto text-emerald-400 mb-2" /><p className="text-2xl font-black text-white">{statistics.present}</p><p className="text-[10px] uppercase text-slate-500 font-bold">Present today</p></div>
                <div className="rounded-2xl bg-slate-950 p-4 text-center"><Clock3 size={18} className="mx-auto text-sky-400 mb-2" /><p className="text-2xl font-black text-white">{Math.max(statistics.total - statistics.present, 0)}</p><p className="text-[10px] uppercase text-slate-500 font-bold">Awaiting check-in</p></div>
              </section>
              <p className="text-[11px] text-slate-600 text-center">{user?.mandal || "Assigned"} attendance center</p>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FaceAttendance;
