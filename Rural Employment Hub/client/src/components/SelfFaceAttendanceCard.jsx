import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Clock3, VideoOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  detectFacesInVideo,
  extractFaceEmbedding,
  getFaceQuality,
} from "../utils/faceRecognition";

const RESET_DELAY = 3500;

const SelfFaceAttendanceCard = () => {
  const { apiClient, user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const cameraReadyRef = useRef(false);
  const processingRef = useRef(false);
  const detectionInFlightRef = useRef(false);
  const resetTimerRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [state, setState] = useState("ready");
  const [message, setMessage] = useState("Look directly at the camera");
  const [attendance, setAttendance] = useState(null);
  const hasFaceEnrollment = Boolean(user?.faceEnrolled && user?.faceDescriptors?.length === 128);

  const reset = () => {
    setState("ready");
    setMessage("Look directly at the camera");
    setAttendance(null);
    processingRef.current = false;
  };

  const showResult = (nextState, nextMessage, record) => {
    setState(nextState);
    setMessage(nextMessage);
    if (record) setAttendance(record);
    resetTimerRef.current = window.setTimeout(reset, RESET_DELAY);
  };

  const recognize = async (embedding, canvas) => {
    if (processingRef.current) return;
    if (!hasFaceEnrollment) {
      setState("enrollment");
      setMessage("Face enrollment is required before attendance can start");
      return;
    }
    processingRef.current = true;
    setState("recognizing");
    setMessage("Recognizing your face...");

    try {
      const response = await apiClient.post("/attendance/self-face-mark", {
        faceEmbedding: embedding,
        capturedFaceThumbnail: canvas.toDataURL("image/jpeg", 0.55),
      });
      showResult("success", "Attendance marked successfully", {
        ...(response.data.worker || user),
        ...(response.data.attendance || {}),
      });
    } catch (error) {
      if (error.response?.status === 409) {
        showResult("duplicate", "Attendance already marked today", {
          ...(error.response.data.attendance || {}),
          ...(user || {}),
        });
      } else if (error.response?.status === 422) {
        showResult("unknown", "Face not recognized. Please try again.");
      } else {
        showResult("ready", error.response?.data?.message || "Look directly at the camera");
      }
    }
  };

  const scan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 2 && cameraReadyRef.current && hasFaceEnrollment && !processingRef.current && !detectionInFlightRef.current) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      detectionInFlightRef.current = true;
      detectFacesInVideo(video)
        .then((faces) => {
          if (faces.length === 0) {
            setState("ready");
            setMessage("Please position your face inside the frame");
            return;
          }
          if (faces.length > 1) {
            setState("multiple");
            setMessage("Please make sure only one person is in view");
            return;
          }
          const quality = getFaceQuality(video, faces[0]);
          if (quality.brightness < 45) {
            setState("quality");
            setMessage("Please move to a brighter area");
            return;
          }
          if (quality.frontFacing < 0.72) {
            setState("angle");
            setMessage("Please look directly at the camera");
            return;
          }
          setState("detected");
          setMessage("Face detected - verifying...");
          recognize(extractFaceEmbedding(video, faces[0]), canvas);
        })
        .catch(() => {
          setState("ready");
          setMessage("Please position your face inside the frame");
        })
        .finally(() => {
          detectionInFlightRef.current = false;
        });
    }
    frameRef.current = window.requestAnimationFrame(scan);
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
      cameraReadyRef.current = true;
      setCameraReady(true);
      frameRef.current = window.requestAnimationFrame(scan);
    } catch {
      cameraReadyRef.current = false;
      setCameraReady(false);
      setCameraError("Camera permission is required for face attendance.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const resultStyles = state === "success"
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : state === "duplicate"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : state === "unknown"
        ? "border-rose-300 bg-rose-50 text-rose-900"
        : "border-slate-200 bg-slate-50 text-slate-700";
  const worker = attendance || user || {};
  const isResult = state === "success" || state === "duplicate";

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">AI Face Attendance</p>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">Mark your attendance</h2>
          <p className="text-xs text-slate-500 mt-1">Look directly at the camera. Attendance starts automatically.</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cameraReady ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cameraReady ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          {cameraReady ? "Camera ready" : "Camera off"}
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] items-center">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100" />
          <div className="absolute inset-[14%] rounded-[38%] border-2 border-white/70 pointer-events-none" />
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-center p-4">
              <VideoOff size={30} className="text-slate-500 mb-2" />
              <p className="text-xs font-bold text-slate-300">Camera unavailable</p>
              <p className="text-[11px] text-slate-500 mt-1">{cameraError || "Requesting permission..."}</p>
            </div>
          )}
          <div className="absolute left-3 right-3 bottom-3 rounded-lg bg-slate-950/80 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur">
            {message}
          </div>
        </div>

        {isResult ? (
          <div className={`rounded-2xl border p-5 ${resultStyles}`}>
            <div className="flex items-center gap-2 font-black mb-4"><CheckCircle2 size={20} /> {message}</div>
            <div className="space-y-2 text-xs">
              <p className="text-lg font-black">{worker.name || `${worker.firstName || ""} ${worker.lastName || ""}`.trim()}</p>
              <p><span className="opacity-60">Worker ID:</span> {worker.employeeID || worker.jobCardNumber || "-"}</p>
              <p><span className="opacity-60">Village/Area:</span> {worker.village || "-"}</p>
              <p className="font-bold">Today's Status: PRESENT</p>
              <p><span className="opacity-60">Check-in Time:</span> {worker.checkInTime ? new Date(worker.checkInTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Recorded today"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
            <Camera size={30} className="mx-auto text-emerald-500 mb-3" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {hasFaceEnrollment ? message : "Face enrollment is required before attendance can start"}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">Your details will appear after successful recognition.</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500"><Clock3 size={13} /> One attendance record is kept per local day.</div>
    </section>
  );
};

export default SelfFaceAttendanceCard;
