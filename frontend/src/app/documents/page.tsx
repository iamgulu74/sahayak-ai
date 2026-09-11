'use client';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Info,
  ArrowRight,
  FileSearch,
  CheckCircle2,
  XCircle,
  Camera,
  AlertOctagon,
  FileBadge,
  UserCheck
} from "lucide-react";
import { SCHEMES, getSchemeById } from "@/lib/schemes-data";
import { useAuth } from "@/contexts/AuthContext";
import CameraCaptureModal from "@/components/CameraCaptureModal";

interface VerificationReport {
  isGovernmentDocument: boolean;
  documentTypeDetected: string;
  authenticityStatus: "AUTHENTIC" | "SUSPICIOUS_TAMPERED" | "BLATANT_FAKE" | "NOT_A_DOCUMENT";
  authenticityScore: number;
  isTamperedOrForged: boolean;
  tamperingRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  tamperSignals: string[];
  biometricAudit?: {
    photoDetected: boolean;
    faceTamperStatus: "PASS" | "SUSPICIOUS" | "MISSING_PHOTO" | "FACE_SWAP_DETECTED";
    clarityScore: number;
    hologramOverlapVerified: boolean;
    biometricSummary: string;
  };
  templateAudit?: {
    templateNameMatched: string;
    templateCompliance: "FULL_MATCH" | "PARTIAL_DEVIATION" | "NON_STANDARD_TEMPLATE" | "REJECTED";
    officialHeaderVerified: boolean;
    stampAndSignatureVerified: boolean;
    securityWatermarkPattern: boolean;
    templateSummary: string;
  };
  extractedData: {
    fullName?: string;
    dob?: string;
    documentNumber?: string;
    fatherName?: string;
    category?: string;
    annualIncome?: string;
    issuingAuthority?: string;
    issueDate?: string;
    address?: string;
  };
  profileMatch: {
    isMatch: boolean;
    nameMatchScore: number;
    nameStatus: string;
    dobStatus: string;
    explanation: string;
  };
  faceMatch?: {
    isFaceMatch: boolean;
    faceMatchScore: number;
    faceMatchStatus: string;
    explanation: string;
  };
  securityFeatures?: {
    emblemPresent: boolean;
    qrCodePresent: boolean;
    signatureOrSealPresent: boolean;
    typographyConsistent: boolean;
    syntaxValid: boolean;
  };
  forensicSummary: string;
  recommendations: string[];
  rawOCRPreview?: string;
}

function findMatchingChecklistDoc(
  requiredDocs: string[],
  target: string,
  detected?: string
): string | null {
  if (!requiredDocs || requiredDocs.length === 0) return null;

  // 1. Direct exact or substring match with target
  const exact = requiredDocs.find(
    (d) => d.toLowerCase().trim() === target.toLowerCase().trim()
  );
  if (exact) return exact;

  const sub = requiredDocs.find(
    (d) =>
      d.toLowerCase().includes(target.toLowerCase()) ||
      target.toLowerCase().includes(d.toLowerCase())
  );
  if (sub) return sub;

  // 2. Keyword-based matching groups
  const groups = [
    {
      keys: ["aadhaar", "uidai", "voter", "epic", "identity"],
      matchWords: ["aadhaar", "voter", "identity"],
    },
    {
      keys: ["caste", "community", "sc category", "sc"],
      matchWords: ["caste", "community"],
    },
    {
      keys: ["income", "salary", "family income"],
      matchWords: ["income"],
    },
    {
      keys: ["bank", "passbook", "statement", "cheque", "account"],
      matchWords: ["bank", "passbook", "account"],
    },
    {
      keys: ["project", "quotation", "proposal", "estimate", "machine", "machinery", "activity", "trade"],
      matchWords: ["project", "quotation", "trade", "activity", "business"],
    },
    {
      keys: ["photo", "photograph", "passport"],
      matchWords: ["photo", "photograph"],
    },
    {
      keys: ["rent", "lease", "ownership", "shop"],
      matchWords: ["rent", "ownership", "shop"],
    },
    {
      keys: ["pan"],
      matchWords: ["pan", "identity", "aadhaar"],
    },
  ];

  const targetLower = target.toLowerCase();
  const detectedLower = (detected || "").toLowerCase();

  for (const g of groups) {
    const matchedTarget = g.keys.some((k) => targetLower.includes(k));
    const matchedDetected = g.keys.some((k) => detectedLower.includes(k));
    if (matchedTarget || matchedDetected) {
      const found = requiredDocs.find((doc) => {
        const docLower = doc.toLowerCase();
        return g.matchWords.some((w) => docLower.includes(w));
      });
      if (found) return found;
    }
  }

  // 3. Fallback: match by first significant word
  const firstWord = targetLower.split(" ")[0]?.replace(/[^a-z]/g, "");
  if (firstWord && firstWord.length > 2) {
    const firstMatch = requiredDocs.find((d) => d.toLowerCase().includes(firstWord));
    if (firstMatch) return firstMatch;
  }

  return requiredDocs[0] || null;
}

const optimizeImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL("image/jpeg", 0.85);
        resolve(optimized);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function DocumentsPage() {
  const { userProfile } = useAuth();
  const [applicantName, setApplicantName] = useState(userProfile?.name || "");
  const [selectedSchemeId, setSelectedSchemeId] = useState("nsfdc-suvidha");
  const [targetDocType, setTargetDocType] = useState("Aadhaar Card");
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [justVerifiedDoc, setJustVerifiedDoc] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (file: File, dataUrl: string) => {
    setErrorMsg(null);
    setReport(null);
    setJustVerifiedDoc(null);
    setSelectedFile(file);
    setPreviewUrl(dataUrl);
    runVerification(dataUrl, "image/jpeg", file.name);
  };

  // Load saved checklist ticks from localStorage on scheme change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sahayak_verified_docs_${selectedSchemeId}`);
      if (saved) {
        setCheckedDocs(JSON.parse(saved));
      } else {
        setCheckedDocs({});
      }
    } catch {}
    setJustVerifiedDoc(null);
  }, [selectedSchemeId]);

  useEffect(() => {
    if (userProfile?.name && !applicantName) {
      setApplicantName(userProfile.name);
    } else {
      try {
        const stored = sessionStorage.getItem("sahayak_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name && !applicantName) setApplicantName(parsed.name);
        }
      } catch {}
    }
  }, [userProfile]);

  const scheme = getSchemeById(selectedSchemeId) || SCHEMES[0];
  const isReportMismatch = report?.profileMatch?.nameStatus === "MISMATCH" || report?.profileMatch?.isMatch === false;
  const isReportAuthentic = report?.authenticityStatus === "AUTHENTIC" && !isReportMismatch;

  // Keep targetDocType aligned with scheme requirements
  useEffect(() => {
    if (scheme?.requiredDocuments?.length > 0) {
      const exists = scheme.requiredDocuments.includes(targetDocType);
      if (!exists && targetDocType === "Aadhaar Card") {
        const aadhaarItem = scheme.requiredDocuments.find(d => d.toLowerCase().includes("aadhaar"));
        if (aadhaarItem) setTargetDocType(aadhaarItem);
      }
    }
  }, [scheme, targetDocType]);

  const handleResetChecklist = () => {
    setCheckedDocs({});
    try {
      localStorage.removeItem(`sahayak_verified_docs_${selectedSchemeId}`);
    } catch {}
    setJustVerifiedDoc(null);
    setReport(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1MB limit

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setErrorMsg(null);
    setReport(null);
    setJustVerifiedDoc(null);

    // Enforce maximum 1MB file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`File size exceeds 1MB limit (${sizeMB} MB uploaded). Please select a document file up to 1MB.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);

    try {
      setProcessingStage("Optimizing document image resolution for optical inspection...");
      const dataUrl = await optimizeImageFile(file);
      setPreviewUrl(dataUrl);
      runVerification(dataUrl, file.type || "image/jpeg", file.name);
    } catch (err: any) {
      console.error("File processing error:", err);
      setErrorMsg("Failed to read the selected file. Please try another image.");
    }
  };

  const runVerification = async (dataUrl: string, mimeType: string, fileName: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStage("Extracting text fields & typography via OCR.space...");

    try {
      setTimeout(() => {
        setProcessingStage("Running Multimodal Forensic Tampering & Authenticity Analysis...");
      }, 1200);

      const profilePhoto = userProfile?.photoUrl || (typeof window !== "undefined" ? localStorage.getItem("sahayak_profile_photo") : null);

      const res = await fetch("/api/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          mimeType,
          profile: {
            name: applicantName.trim() || undefined,
            category: userProfile?.category || "SC",
            state: userProfile?.state || "Odisha",
            photoUrl: profilePhoto || undefined,
          },
          documentTypeExpected: targetDocType,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Verification failed");
      }

      setReport(json.data);

      // Automatically tick off document in checklist ONLY if authentic AND profile matched without error:
      const hasNameMismatch = json.data.profileMatch?.nameStatus === "MISMATCH" || json.data.profileMatch?.isMatch === false;
      const hasDobMismatch = json.data.profileMatch?.dobStatus === "MISMATCH";
      const hasFaceMismatch = json.data.faceMatch?.faceMatchStatus === "MISMATCH" || json.data.faceMatch?.isFaceMatch === false;

      const isClean =
        json.data.authenticityStatus === "AUTHENTIC" &&
        !hasNameMismatch &&
        !hasDobMismatch &&
        !hasFaceMismatch &&
        !json.data.isTamperedOrForged &&
        json.data.tamperingRiskLevel !== "CRITICAL" &&
        json.data.tamperingRiskLevel !== "HIGH";

      if (isClean) {
        const matchedReq = findMatchingChecklistDoc(
          scheme.requiredDocuments,
          targetDocType,
          json.data.documentTypeDetected
        );

        if (matchedReq) {
          setCheckedDocs((prev) => {
            const next = { ...prev, [matchedReq]: true };
            try {
              localStorage.setItem(
                `sahayak_verified_docs_${selectedSchemeId}`,
                JSON.stringify(next)
              );
            } catch {}
            return next;
          });
          setJustVerifiedDoc(matchedReq);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during verification. Please ensure the image is clear and try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const completedDocsCount = scheme.requiredDocuments.filter((d) => checkedDocs[d]).length;
  const progressPercent = Math.round(
    (completedDocsCount / (scheme.requiredDocuments.length || 1)) * 100
  );

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Official AI Document Verification & Forensic Audit
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Document Readiness & Identity Verification
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl">
            Upload identity cards, caste certificates, and income proofs. Our dual-engine optical character recognition (OCR.space) and multimodal forensic intelligence (Gemini Vision) analyze authentic government typography, detect tampered files, catch fake documents, and cross-verify with your applicant profile.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Scheme Checklist (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Financial Scheme
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {SCHEMES.filter((s) => s.status === "active").map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.ministry})
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Dossier Preparedness</span>
                  <span className="text-indigo-600 font-bold">{progressPercent}% Ready</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
                  <span>{completedDocsCount} of {scheme.requiredDocuments.length} mandatory documents verified</span>
                  {progressPercent === 100 && (
                    <span className="text-emerald-600 font-semibold">✓ Dossier Complete</span>
                  )}
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Required Documents Checklist
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-semibold">Auto-synced on verification</span>
                      {completedDocsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetChecklist}
                          className="text-[10px] text-slate-400 hover:text-red-600 underline cursor-pointer"
                          title="Clear verified documents for this scheme"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  {scheme.requiredDocuments.map((doc, idx) => {
                    const isChecked = !!checkedDocs[doc];
                    const isJustVerified = justVerifiedDoc === doc;
                    const isCurrentTarget = targetDocType === doc;
                    return (
                      <div
                        key={idx}
                        onClick={() => setTargetDocType(doc)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isChecked
                            ? isJustVerified
                              ? "bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-400 text-slate-900 shadow-sm"
                              : "bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs"
                            : isCurrentTarget
                            ? "bg-indigo-50/50 border-indigo-300 text-slate-900 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
                          {isChecked ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isCurrentTarget ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isCurrentTarget ? "bg-indigo-600" : "bg-slate-300"
                              }`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`leading-snug block ${isChecked ? "font-semibold text-emerald-950" : isCurrentTarget ? "font-semibold text-indigo-950" : "text-slate-800"}`}>
                              {doc}
                            </span>
                            {isChecked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 mt-0.5 font-semibold">
                                ✓ Verified via AI Inspection
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 mt-0.5 block">
                                {isCurrentTarget ? "Selected for upload →" : "Pending verification (upload to check)"}
                              </span>
                            )}
                            {isJustVerified && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-200/90 px-1.5 py-0.5 rounded ml-1.5 animate-pulse">
                                ✨ Auto-Ticked!
                              </span>
                            )}
                          </div>
                        </div>

                        {(() => {
                          const isPhotoDoc = /photo|photograph|passport/i.test(doc);
                          return isChecked ? (
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {isPhotoDoc && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTargetDocType(doc);
                                    setIsCameraOpen(true);
                                  }}
                                  className="flex-shrink-0 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                                  title={`Capture photo via front camera`}
                                >
                                  <Camera className="w-3 h-3" /> Camera
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetDocType(doc);
                                  fileInputRef.current?.click();
                                }}
                                className="flex-shrink-0 text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                title={`Re-upload and verify ${doc}`}
                              >
                                Re-scan
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {isPhotoDoc && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTargetDocType(doc);
                                    setIsCameraOpen(true);
                                  }}
                                  className="flex-shrink-0 text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-2.5 py-1 rounded-lg shadow-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                                  title={`Take passport-size photo using front camera`}
                                >
                                  <Camera className="w-3 h-3" /> Front Camera
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetDocType(doc);
                                  fileInputRef.current?.click();
                                }}
                                className="flex-shrink-0 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title={`Upload and verify ${doc}`}
                              >
                                <Upload className="w-3 h-3" /> Upload & Verify
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Official Portal Application:</span>
                  <a
                    href={scheme.applicationPortal || scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    PM-SURAJ / Portal ↗
                  </a>
                </div>
              </div>

              {/* Statutory Advisory */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Statutory Verification Norms:
                </div>
                <ul className="list-disc list-inside space-y-1 text-indigo-800 text-[11px] leading-relaxed">
                  <li>Annual household family income ceiling is strictly <strong>₹5.00 Lakh</strong> (effective 07.01.2026).</li>
                  <li>Caste certificates must be issued by a designated Tahasildar / SDM authority.</li>
                  <li>Masked Aadhaar cards (first 8 digits hidden) are accepted for privacy protection.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Real OCR & Forensic Verification Engine (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-indigo-600" />
                    Real-Time OCR & Forensic Tamper Inspector
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload an authentic document file. The AI engine extracts official text and checks for digital forgery or invalid uploads.
                  </p>
                </div>

                {/* Just Verified Notification Banner */}
                {justVerifiedDoc && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block text-emerald-900">
                          Document Verified Without Error!
                        </span>
                        <span className="text-slate-700">
                          <strong>&ldquo;{justVerifiedDoc}&rdquo;</strong> was scanned and automatically ticked in your checklist.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setJustVerifiedDoc(null)}
                      className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5 text-xs rounded hover:bg-emerald-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}

                {/* Document Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Document Category Being Uploaded
                    </label>
                    <select
                      value={targetDocType}
                      onChange={(e) => setTargetDocType(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {Array.from(
                        new Set([
                          ...scheme.requiredDocuments,
                          "Aadhaar Card (Identity & Address)",
                          "Caste Certificate (SC)",
                          "Income Certificate (Family income up to ₹5.0 Lakh)",
                          "PAN Card (Tax Identification)",
                          "Voter ID / EPIC Card",
                          "Bank Passbook / Statement",
                          "Project Report / Business Quotation",
                        ])
                      ).map((docOption, idx) => (
                        <option key={idx} value={docOption}>
                          {docOption}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Applicant Name to Match
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Enter full name on profile"
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Verification Mode Choice: Upload or Live Front Camera */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!/photo|photograph|passport/i.test(targetDocType)) {
                        const photoDoc = scheme.requiredDocuments.find(d => /photo|photograph|passport/i.test(d)) || "Passport-size photographs";
                        setTargetDocType(photoDoc);
                      }
                      setIsCameraOpen(true);
                    }}
                    className="p-3.5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/70 hover:border-indigo-400 hover:shadow-md transition-all text-left group cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          Use Front Camera
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase">
                          Live Selfie
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Capture passport-size photo directly using your front camera.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80 transition-all text-left group cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-900 block">
                        Upload Document / Photo
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Upload existing JPG, PNG, or PDF file (up to 1MB).
                      </p>
                    </div>
                  </button>
                </div>

                {/* Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
                    isDragging
                      ? "border-indigo-600 bg-indigo-100/60 scale-[1.01]"
                      : "border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-indigo-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-1">
                    Click to Browse or Drag & Drop Document / Photo
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Accepts JPG, PNG, WEBP, or PDF scans (max 1MB)
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 text-xs font-semibold shadow-xs">
                      <Upload className="w-3.5 h-3.5" /> Select File from Device
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCameraOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" /> Open Front Camera
                    </button>
                  </div>
                </div>

              {/* Processing Spinner with Step Descriptions */}
              {isProcessing && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">
                    {processingStage}
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Inspecting micro-typography, state seals, syntax structures, and cross-matching against applicant profile &quot;{applicantName || "Applicant"}&quot;...
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
                  <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-0.5">Verification Warning</div>
                    <div>{errorMsg}</div>
                  </div>
                </div>
              )}

              {/* Verification Results Report */}
              {report && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Status Banner */}
                  <div
                    className={`rounded-2xl p-5 border shadow-xs ${
                      isReportAuthentic
                        ? "bg-emerald-50/90 border-emerald-200"
                        : isReportMismatch || report.authenticityStatus === "BLATANT_FAKE"
                        ? "bg-red-50/90 border-red-200"
                        : report.authenticityStatus === "NOT_A_DOCUMENT"
                        ? "bg-slate-100 border-slate-300"
                        : "bg-amber-50/90 border-amber-200"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {isReportAuthentic ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : isReportMismatch || report.authenticityStatus === "BLATANT_FAKE" ? (
                        <AlertOctagon className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : report.authenticityStatus === "NOT_A_DOCUMENT" ? (
                        <XCircle className="w-7 h-7 text-slate-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isReportAuthentic
                                ? "bg-emerald-600 text-white"
                                : isReportMismatch || report.authenticityStatus === "BLATANT_FAKE"
                                ? "bg-red-600 text-white"
                                : report.authenticityStatus === "NOT_A_DOCUMENT"
                                ? "bg-slate-700 text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            {isReportAuthentic
                              ? "✓ Authentic & Verified"
                              : isReportMismatch
                              ? "🚨 Identity Mismatch — Document Rejected"
                              : report.authenticityStatus === "NOT_A_DOCUMENT"
                              ? "❌ Not a Government Document"
                              : report.authenticityStatus === "BLATANT_FAKE"
                              ? "🚨 Fake / Forged Document Detected"
                              : "⚠️ Discrepancy / Tampering Risk"}
                          </span>
                          <span className="text-xs font-extrabold text-slate-700">
                            Authenticity Score: {isReportMismatch ? 0 : report.authenticityScore}%
                          </span>
                        </div>

                            <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1">
                              {report.documentTypeDetected}
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed mb-3">
                              {report.forensicSummary}
                            </p>

                        {/* Tamper / Forensic Red Flags */}
                        {report.tamperSignals && report.tamperSignals.length > 0 && (
                          <div className="mb-3 p-3 bg-red-100/70 border border-red-200 rounded-xl space-y-1">
                            <span className="text-[11px] font-bold text-red-900 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                              Forensic Red Flags Detected:
                            </span>
                            <ul className="list-disc list-inside text-xs text-red-800 space-y-0.5">
                              {report.tamperSignals.map((sig, i) => (
                                <li key={i}>{sig}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Extracted Fields Table */}
                        <div className="bg-white/95 rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
                          <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <FileBadge className="w-3.5 h-3.5 text-indigo-600" />
                            Extracted Real Document Fields
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">Name on Document</span>
                              <span className="font-bold text-slate-900">
                                {report.extractedData?.fullName || "Not detected"}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">Registered Profile Name</span>
                              <span className="font-bold text-slate-900">
                                {applicantName || "Unspecified"}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">Document / Certificate ID</span>
                              <span className="font-bold text-slate-900 font-mono">
                                {report.extractedData?.documentNumber || "N/A"}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-500 block">Date / Year of Birth</span>
                              <span className="font-bold text-slate-900">
                                {report.extractedData?.dob || "N/A"}
                              </span>
                            </div>
                            {report.extractedData?.issuingAuthority && (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                                <span className="text-[10px] text-slate-500 block">Issuing Authority / Dept</span>
                                <span className="font-bold text-slate-900">
                                  {report.extractedData.issuingAuthority}
                                </span>
                              </div>
                            )}
                            {report.extractedData?.category && (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">Social Category</span>
                                <span className="font-bold text-slate-900">
                                  {report.extractedData.category}
                                </span>
                              </div>
                            )}
                            {report.extractedData?.annualIncome && (
                              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">Annual Income</span>
                                <span className="font-bold text-slate-900">
                                  {report.extractedData.annualIncome}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Biometric & Certificate Template Audits */}
                        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Biometric Verification Audit Card */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="flex items-center gap-1.5 text-xs text-indigo-950">
                                <UserCheck className="w-4 h-4 text-indigo-600" />
                                Biometric Photo & Face Audit
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                                report.biometricAudit?.faceTamperStatus === "PASS"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : report.biometricAudit?.faceTamperStatus === "MISSING_PHOTO"
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {report.biometricAudit?.faceTamperStatus === "PASS"
                                  ? "✓ BIOMETRIC PASS"
                                  : report.biometricAudit?.faceTamperStatus === "MISSING_PHOTO"
                                  ? "NO PHOTO DETECTED"
                                  : "🚨 BIOMETRIC ALERT"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {report.biometricAudit?.biometricSummary || "Biometric facial photo scan complete."}
                            </p>
                            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-[10px]">
                              <div>
                                <span className="text-slate-400 block">Photo Presence:</span>
                                <span className="font-semibold text-slate-800">
                                  {report.biometricAudit?.photoDetected ? "✓ Face Photo Found" : "Not Found"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Hologram Edge Overlap:</span>
                                <span className="font-semibold text-slate-800">
                                  {report.biometricAudit?.hologramOverlapVerified ? "✓ Verified Seal" : "Unverified"}
                                </span>
                              </div>
                            </div>
                            {report.faceMatch && (
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-medium">Biometric Profile Face Match:</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  report.faceMatch.faceMatchStatus === "MATCH"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : report.faceMatch.faceMatchStatus === "MISMATCH"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}>
                                  {report.faceMatch.faceMatchStatus === "MATCH"
                                    ? `✓ Match (${report.faceMatch.faceMatchScore}%)`
                                    : report.faceMatch.faceMatchStatus === "MISMATCH"
                                    ? "🚨 Face Mismatch"
                                    : "No Profile Photo"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Official Certificate Template Audit Card */}
                          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span className="flex items-center gap-1.5 text-xs text-indigo-950">
                                <FileBadge className="w-4 h-4 text-indigo-600" />
                                Certificate Template Audit
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                                report.templateAudit?.templateCompliance === "FULL_MATCH"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : report.templateAudit?.templateCompliance === "PARTIAL_DEVIATION"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {report.templateAudit?.templateCompliance === "FULL_MATCH"
                                  ? "✓ TEMPLATE MATCHED"
                                  : report.templateAudit?.templateCompliance === "PARTIAL_DEVIATION"
                                  ? "PARTIAL DEVIATION"
                                  : "NON-STANDARD LAYOUT"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {report.templateAudit?.templateSummary || "Official certificate template format verified."}
                            </p>
                            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-[10px]">
                              <div>
                                <span className="text-slate-400 block">Official Layout Format:</span>
                                <span className="font-semibold text-slate-800 truncate block" title={report.templateAudit?.templateNameMatched}>
                                  {report.templateAudit?.templateNameMatched || "Standard Format"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Stamp / Digital Signature:</span>
                                <span className="font-semibold text-slate-800">
                                  {report.templateAudit?.stampAndSignatureVerified ? "✓ Seal/Sign Valid" : "Unverified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security Features Audit */}
                        {report.securityFeatures && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className={`p-2 rounded-lg border text-center ${report.securityFeatures.emblemPresent ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                              <span className="block font-semibold">National / State Emblem</span>
                              <span>{report.securityFeatures.emblemPresent ? "✓ Present" : "Missing / Unclear"}</span>
                            </div>
                            <div className={`p-2 rounded-lg border text-center ${report.securityFeatures.typographyConsistent ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                              <span className="block font-semibold">Typography Consistency</span>
                              <span>{report.securityFeatures.typographyConsistent ? "✓ Unaltered" : "🚨 Altered Fonts"}</span>
                            </div>
                            <div className={`p-2 rounded-lg border text-center ${report.securityFeatures.syntaxValid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                              <span className="block font-semibold">ID Number Syntax</span>
                              <span>{report.securityFeatures.syntaxValid ? "✓ Valid Format" : "Format Discrepancy"}</span>
                            </div>
                            <div className={`p-2 rounded-lg border text-center ${report.profileMatch.isMatch ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                              <span className="block font-semibold">Name Cross-Check</span>
                              <span>{report.profileMatch.isMatch ? "✓ Matched" : "Discrepancy"}</span>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {report.recommendations && report.recommendations.length > 0 && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                            <span className="font-bold text-slate-900 block mb-1">Recommended Action:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                              {report.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Preview Image Thumbnail */}
                  {previewUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={previewUrl}
                          alt="Uploaded Document"
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {selectedFile?.name || "Uploaded Document"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {((selectedFile?.size || 0) / 1024).toFixed(1)} KB • {selectedFile?.type || "image"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                      >
                        Upload Another
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Navigation CTAs */}
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/tracker"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  Go to 7-Stage Application Tracker <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/partners?scheme=${selectedSchemeId}`}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  Locate Authorized Channel Partner →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Front Camera Live Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        expectedDocType={targetDocType}
        title="Passport-Size Photo Front Camera"
        subtitle="Position your face inside the passport frame with neutral expression & good lighting."
      />
    </div>
  );
}
