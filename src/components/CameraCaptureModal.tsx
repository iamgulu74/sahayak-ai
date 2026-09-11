'use client';
import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, X, Check, AlertCircle, SwitchCamera, Sparkles } from "lucide-react";

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

  // Start video stream when modal opens
  const startCamera = useCallback(async () => {
    stopTracks();
    setCameraError(null);
    setCapturedDataUrl(null);
    setCapturedBlob(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by your browser. Please use standard file upload.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => setIsStreaming(true)).catch(() => {});
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser settings to take your passport photo.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device detected on this system. Please select an existing photo file instead.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is currently in use by another application. Please close other camera apps and retry.");
      } else {
        setCameraError("Unable to access front camera. You may upload a photo file directly.");
      }
    }
  }, [facingMode, stopTracks]);

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

        {/* Viewfinder / Capture Box */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center text-white space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200 leading-relaxed max-w-xs mx-auto">
                {cameraError}
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
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
                <Check className="w-3 h-3 text-emerald-400" /> Photo Captured
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
        <div className="flex items-center justify-end gap-2.5 pt-1">
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
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
  );
}
