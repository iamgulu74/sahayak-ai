'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, X, Check, AlertCircle, SwitchCamera, Sparkles, Upload } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, dataUrl: string) => void;
  title?: string;
  subtitle?: string;
  expectedDocType?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = "Passport-Size Photo Front Camera",
  subtitle = "Position your face straight inside the passport frame with good lighting.",
  expectedDocType = "Passport-size photographs",
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Start video stream when modal opens with 3-tier fallback
  const startCamera = useCallback(async () => {
    stopTracks();
    setCameraError(null);
    setCapturedDataUrl(null);
    setCapturedBlob(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by this browser. You can upload an existing photo or use the sample passport photo.");
      return;
    }

    let stream: MediaStream | null = null;
    let lastErr: any = null;

    // Tier 1: Try with preferred facingMode and resolution
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1: any) {
      lastErr = err1;
      // Tier 2: Try with basic facingMode constraint
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
      } catch (err2: any) {
        lastErr = err2;
        // Tier 3: Try any available video device
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: any) {
          lastErr = err3;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsStreaming(true)).catch(() => {});
        };
      }
    } else {
      console.error("Camera access failed all tiers:", lastErr);
      if (lastErr?.name === "NotAllowedError" || lastErr?.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser, or select an existing photo file.");
      } else if (lastErr?.name === "NotFoundError" || lastErr?.name === "DevicesNotFoundError") {
        setCameraError("No webcam device detected on this system. You can open your camera app, upload a photo, or use a sample passport photo.");
      } else if (lastErr?.name === "NotReadableError" || lastErr?.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another program. Please close other camera apps and retry, or choose a file.");
      } else {
        setCameraError("Unable to access the front camera. You can choose a photo file or use the sample photo.");
      }
    }
  }, [facingMode, stopTracks]);

  // Handle file selected via file input or device camera app
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedDataUrl(dataUrl);
      setCapturedBlob(file);
      setCameraError(null);
    };
    reader.readAsDataURL(file);
  };

  // Generate instant sample passport portrait for verification testing
  const handleUseSamplePassportPhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 750; // 35mm x 45mm ratio
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background - clean studio light blue gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 750);
    bgGrad.addColorStop(0, "#f0f4f8");
    bgGrad.addColorStop(1, "#d9e2ec");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 600, 750);

    // Subtle studio light halo
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(300, 320, 240, 0, Math.PI * 2);
    ctx.fill();

    // Body / Shoulders (Dark formal jacket)
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(300, 690, 230, 160, 0, 0, Math.PI * 2);
    ctx.fill();

    // White shirt collar
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(255, 520);
    ctx.lineTo(300, 580);
    ctx.lineTo(345, 520);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = "#e2a97f";
    ctx.fillRect(265, 430, 70, 100);

    // Head / Face oval
    ctx.fillStyle = "#f5c5a3";
    ctx.beginPath();
    ctx.ellipse(300, 330, 105, 135, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = "#1e1e24";
    ctx.beginPath();
    ctx.arc(300, 280, 110, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(300, 220, 100, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(240, 295);
    ctx.quadraticCurveTo(260, 285, 280, 295);
    ctx.moveTo(320, 295);
    ctx.quadraticCurveTo(340, 285, 360, 295);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(260, 315, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(340, 315, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(260, 315, 6, 0, Math.PI * 2);
    ctx.arc(340, 315, 6, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = "#c68d65";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(300, 310);
    ctx.lineTo(296, 355);
    ctx.lineTo(306, 355);
    ctx.stroke();

    // Mouth
    ctx.strokeStyle = "#b85d5d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(300, 385, 20, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Standard Passport Spec Watermark
    ctx.fillStyle = "#334155";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PASSPORT SPECIFICATION (35x45mm) • SAMPLE VERIFIED PORTRAIT", 300, 725);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedDataUrl(dataUrl);
        setCameraError(null);
      }
    }, "image/jpeg", 0.95);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopTracks();
    }
    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode, startCamera, stopTracks]);

  // Capture current frame from video onto canvas
  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If using front camera (facingMode === 'user'), mirror image so it reflects natural orientation
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Get JPEG data URL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedDataUrl(dataUrl);

    // Convert to Blob & File
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
      }
    }, "image/jpeg", 0.92);

    // Pause video playback
    video.pause();
  };

  // Retake photo: resume camera
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setCapturedBlob(null);
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsStreaming(true)).catch(() => {});
    }
  };

  // Confirm photo & send to parent
  const handleConfirmPhoto = () => {
    if (!capturedDataUrl || !capturedBlob) return;
    setIsProcessing(true);

    const fileName = `passport_photo_front_camera_${Date.now()}.jpg`;
    const file = new File([capturedBlob], fileName, { type: "image/jpeg" });

    stopTracks();
    onCapture(file, capturedDataUrl);
    setIsProcessing(false);
    onClose();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 relative animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                {title}
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                  {facingMode === "user" ? "Front Camera" : "Rear Camera"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden inputs for device camera app and file upload */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Viewfinder / Capture Box */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
          {cameraError ? (
            <div className="p-5 text-center text-white space-y-3.5 max-w-sm mx-auto">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-rose-200 leading-snug">
                  {cameraError}
                </p>
                <p className="text-[11px] text-slate-400">
                  Select an option below to proceed without interruptions:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Device Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Upload className="w-3.5 h-3.5" /> Choose Photo
                </button>
                <button
                  type="button"
                  onClick={handleUseSamplePassportPhoto}
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-amber-500/30 col-span-1 sm:col-span-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Use Sample Passport Photo (Instant Test)
                </button>
              </div>

              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Live Camera Stream
                </button>
              </div>
            </div>
          ) : capturedDataUrl ? (
            /* Snapshot Review View */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedDataUrl}
                alt="Captured passport preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-xs border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" /> Photo Selected & Ready
              </div>
            </div>
          ) : (
            /* Live Camera Stream View */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Passport Photo Frame Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Oval/Portrait Head Box Guide */}
                <div className="w-[52%] aspect-[3.5/4.5] border-2 border-dashed border-white/80 rounded-[45%] shadow-2xl relative flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] font-bold text-white/90 bg-slate-950/60 backdrop-blur-xs px-2 py-0.5 rounded-full -mt-3.5">
                    Align Face Here
                  </span>
                  <div className="w-full border-t border-dashed border-white/30" />
                  <span className="text-[9px] text-white/80 bg-slate-950/60 backdrop-blur-xs px-2 py-0.5 rounded-full -mb-3">
                    Chin Level
                  </span>
                </div>
              </div>

              {/* Camera Switch Toggle Button */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-md"
                  title="Switch between front and back camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Passport Photo Guidelines */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Passport Photo Guidelines:
          </div>
          <p className="text-slate-500 leading-snug">
            Look directly forward with eyes open. Ensure your face is evenly lit without hats, sunglasses, or heavy shadows.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Fallback shortcuts */}
          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-medium text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" /> Upload file
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleUseSamplePassportPhoto}
              className="font-medium text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" /> Sample photo
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake / Clear
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmPhoto}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Use & Verify This Photo
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!isStreaming || !!cameraError}
                onClick={handleCaptureFrame}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
