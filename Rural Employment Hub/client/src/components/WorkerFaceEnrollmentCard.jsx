import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, UserPlus, VideoOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { detectFacesInVideo, extractFaceEmbedding, getFaceQuality } from "../utils/faceRecognition";

const WorkerFaceEnrollmentCard = () => {
  const { apiClient } = useAuth();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [workers, setWorkers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Select a worker to begin enrollment");
  const [enrolledWorker, setEnrolledWorker] = useState(null);
  const captureTimer = useRef(null);
  const faceBoxRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    apiClient.get("/users/workers")
      .then((response) => setWorkers(response.data.workers || []))
      .catch(() => setWorkers([]));
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const enrollCurrentFace = async () => {
    if (!videoRef.current || busyRef.current) return;
    busyRef.current = true;
    setStatus("saving");
    setMessage("Saving secure face template...");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const selectedWorker = workers.find((worker) => worker._id === selectedId);

    try {
      await apiClient.post("/attendance/enroll-face", {
        workerId: selectedId,
        faceDescriptors: extractFaceEmbedding(videoRef.current, {
          ...(faceBoxRef.current || {
            x: 0,
            y: 0,
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          }),
        }),
        faceImages: [],
      });
      setEnrolledWorker(selectedWorker);
      setStatus("success");
      setMessage("Face registered successfully");
      stopCamera();
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Face enrollment failed");
      busyRef.current = false;
    }
  };

  const scanEnrollment = async () => {
    if (!videoRef.current || busyRef.current || !cameraOpen) return;
    try {
      const faces = await detectFacesInVideo(videoRef.current);
      if (faces.length === 0) {
        setStatus("ready");
        setMessage("Please position the worker's face inside the frame");
        return;
      }
      if (faces.length > 1) {
        setStatus("error");
        setMessage("Please make sure only one worker is in the camera");
        return;
      }
      const quality = getFaceQuality(videoRef.current, faces[0]);
      if (quality.brightness < 45) {
        setStatus("error");
        setMessage("Please move to a brighter area");
        return;
      }
      if (quality.frontFacing < 0.72) {
        setStatus("error");
        setMessage("Please look directly at the camera");
        return;
      }
      setStatus("detected");
      setMessage("Front face detected - capturing...");
      faceBoxRef.current = faces[0];
      captureTimer.current = window.setTimeout(enrollCurrentFace, 450);
    } catch {
      setStatus("error");
      setMessage("Please position the worker's face inside the frame");
    }
  };

  useEffect(() => {
    if (!cameraOpen) return undefined;
    const interval = window.setInterval(scanEnrollment, 500);
    return () => window.clearInterval(interval);
  }, [cameraOpen, selectedId]);

  const startEnrollment = async () => {
    if (!selectedId) {
      setStatus("error");
      setMessage("Select a worker before opening the camera");
      return;
    }
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOpen(true);
      setStatus("ready");
      setMessage("Look directly at the camera");
    } catch {
      setCameraError("Camera permission is required for face enrollment.");
      setStatus("error");
    }
  };

  const selectedWorker = workers.find((worker) => worker._id === selectedId);

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900/50 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center"><UserPlus size={22} /></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-600">Register Worker Face</p>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">Face Enrollment</h2>
          <p className="text-xs text-slate-500 mt-1">Select the worker, then capture one clear front-facing template.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Worker to enroll</label>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={cameraOpen} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white">
            <option value="">Select assigned worker</option>
            {workers.map((worker) => <option key={worker._id} value={worker._id}>{worker.name} - {worker.employeeID || worker.jobCardNumber || worker.village}</option>)}
          </select>
          {selectedWorker && (
            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">{selectedWorker.name}</p>
              <p>ID: {selectedWorker.employeeID || selectedWorker.jobCardNumber || "-"}</p>
              <p>Village: {selectedWorker.village || "-"}</p>
              <p>Phone: {selectedWorker.phone || "-"}</p>
            </div>
          )}
          {!cameraOpen && status !== "success" && <button type="button" onClick={startEnrollment} className="mt-4 w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5">Open Enrollment Camera</button>}
          {cameraOpen && <button type="button" onClick={stopCamera} className="mt-4 w-full rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs py-2.5">Cancel Enrollment</button>}
          {cameraError && <p className="mt-2 text-xs text-rose-600">{cameraError}</p>}
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <video ref={videoRef} playsInline muted className={`${cameraOpen ? "block" : "hidden"} w-full h-full object-cover -scale-x-100`} />
          {!cameraOpen && <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-500"><VideoOff size={28} className="mb-2" /><p className="text-xs">Camera preview</p></div>}
          <div className="absolute inset-[14%] rounded-[38%] border-2 border-cyan-300/80 pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-slate-950/80 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur">{message}</div>
        </div>
      </div>
      {status === "success" && enrolledWorker && <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-800"><CheckCircle2 size={16} /> Face registered successfully for {enrolledWorker.name}</div>}
    </section>
  );
};

export default WorkerFaceEnrollmentCard;
