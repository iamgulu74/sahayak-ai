'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  MapPin,
  IndianRupee,
  FileText,
  Clock,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Camera,
  RotateCcw
} from "lucide-react";
import { Scheme } from "@/lib/schemes-data";
import { useAuth } from "@/contexts/AuthContext";
import CameraCaptureModal from "@/components/CameraCaptureModal";
import {
  SubmittedApplication,
  saveApplication,
  generateApplicationId,
} from "@/lib/applications";

interface ApplySchemeModalProps {
  scheme: Scheme;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: SubmittedApplication) => void;
}

export default function ApplySchemeModal({
  scheme,
  isOpen,
  onClose,
  onSuccess,
}: ApplySchemeModalProps) {
  const router = useRouter();
  const { userProfile, user, loginWithGoogle, login } = useAuth();

  const [step, setStep] = useState<"details" | "verification" | "submitting" | "success">("details");
  const [applicantName, setApplicantName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [category, setCategory] = useState("SC");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("Khurda");
  const [loanAmountLakh, setLoanAmountLakh] = useState<number>(
    Math.min(scheme.maxLoanLakh, 2.5)
  );
  const [purpose, setPurpose] = useState("New Small Business / Equipment Purchase");
  const [submittedApp, setSubmittedApp] = useState<SubmittedApplication | null>(null);
  const [copied, setCopied] = useState(false);

  // Document Verification State
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>({});
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraDocName, setCameraDocName] = useState<string>("Passport-size photographs");

  // Auth gate state for unauthenticated users
  const [authMode, setAuthMode] = useState<"options" | "email">("options");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/schemes";
  const returnUrl = `${currentPath}?apply=${encodeURIComponent(scheme.id)}`;

  const requiredDocs =
    scheme.requiredDocuments && scheme.requiredDocuments.length > 0
      ? scheme.requiredDocuments
      : [
          "Aadhaar Card (Identity & Biometrics)",
          "Caste Certificate (SC/ST Verification)",
          "Income Certificate (Under ₹5.0 Lakh)",
          "Bank Passbook / Cancelled Cheque",
        ];

  const verifiedCount = requiredDocs.filter((d) => verifiedDocs[d]).length;
  const isReadyToSubmit = verifiedCount > 0;

  // Initialize with user profile if available
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setCopied(false);
      setAuthError("");
      setVerificationError(null);
      setVerificationSuccess(null);
      const name = userProfile?.name || user?.displayName || "";
      if (name) setApplicantName(name);
      else {
        try {
          const stored = sessionStorage.getItem("sahayak_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.name) setApplicantName(parsed.name);
          }
        } catch {}
      }
      const userPhone = user?.phoneNumber || userProfile?.phone || "";
      if (userPhone) {
        setPhone(userPhone.startsWith("+91") ? userPhone : `+91 ${userPhone}`);
      }
      if (userProfile?.category) setCategory(userProfile.category);
      if (userProfile?.state) setState(userProfile.state);
      if (userProfile?.district) setDistrict(userProfile.district);
      if (userProfile?.loanRequiredLakh) {
        setLoanAmountLakh(Math.min(scheme.maxLoanLakh, userProfile.loanRequiredLakh));
      }

      // Check pre-verified documents from localStorage
      try {
        const storedVerified = localStorage.getItem(`sahayak_verified_docs_${scheme.id}`);
        if (storedVerified) {
          setVerifiedDocs(JSON.parse(storedVerified));
        } else {
          const allVerified = localStorage.getItem("sahayak_all_verified_docs");
          if (allVerified) {
            setVerifiedDocs(JSON.parse(allVerified));
          }
        }
      } catch {}
    }
  }, [isOpen, userProfile, user, scheme]);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message?.replace("Firebase: ", "") || "Google sign-in failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await login(authEmail.trim(), authPassword);
    } catch (err: any) {
      setAuthError(err.message?.replace("Firebase: ", "") || "Sign-in failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) {
      setAuthError("Please enter the applicant full name.");
      return;
    }
    setAuthError("");
    setVerificationError(null);
    setStep("verification");
  };

  const handleUploadAndVerify = async (docName: string, file: File) => {
    if (!file) return;
    setVerifyingDoc(docName);
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const profilePhoto = userProfile?.photoUrl || (typeof window !== "undefined" ? localStorage.getItem("sahayak_profile_photo") : null);

      const res = await fetch("/api/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          mimeType: file.type || "image/jpeg",
          profile: {
            name: applicantName.trim() || undefined,
            category: category,
            state: state,
            photoUrl: profilePhoto || undefined,
          },
          documentTypeExpected: docName,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Verification analysis failed.");
      }

      const report = json.data;
      const hasNameMismatch =
        report.profileMatch?.nameStatus === "MISMATCH" || report.profileMatch?.isMatch === false;
      const hasFaceMismatch =
        report.faceMatch?.faceMatchStatus === "MISMATCH" || report.faceMatch?.isFaceMatch === false;
      const isClean =
        report.authenticityStatus === "AUTHENTIC" &&
        !hasNameMismatch &&
        !hasFaceMismatch &&
        !report.isTamperedOrForged &&
        report.tamperingRiskLevel !== "CRITICAL" &&
        report.tamperingRiskLevel !== "HIGH";

      if (isClean) {
        setVerifiedDocs((prev) => {
          const next = { ...prev, [docName]: true };
          try {
            localStorage.setItem(`sahayak_verified_docs_${scheme.id}`, JSON.stringify(next));
            localStorage.setItem("sahayak_all_verified_docs", JSON.stringify(next));
          } catch {}
          return next;
        });
        const faceBadge = report.faceMatch?.faceMatchStatus === "MATCH" ? " & Biometric Face Match Confirmed" : "";
        setVerificationSuccess(`✓ ${docName} verified authentic (Forensic Score: ${report.authenticityScore || 95}/100)${faceBadge}`);
      } else {
        // REVERSAL ON FAILED RE-SCAN: If this doc was previously verified, reverse it!
        setVerifiedDocs((prev) => {
          if (!prev[docName]) return prev;
          const next = { ...prev };
          delete next[docName];
          try {
            localStorage.setItem(`sahayak_verified_docs_${scheme.id}`, JSON.stringify(next));
            localStorage.setItem("sahayak_all_verified_docs", JSON.stringify(next));
          } catch {}
          return next;
        });
        const reason =
          (hasFaceMismatch ? report.faceMatch?.explanation : null) ||
          report.forensicSummary ||
          report.profileMatch?.explanation ||
          (report.tamperSignals && report.tamperSignals[0]) ||
          "Document could not be verified. Please ensure the upload is an authentic official certificate.";
        setVerificationError(`${docName} verification rejected: ${reason}`);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerificationError(err.message || "Failed to complete document verification. Please try again.");
    } finally {
      setVerifyingDoc(null);
    }
  };

  const handleRevertDoc = (docName: string) => {
    setVerifiedDocs((prev) => {
      const next = { ...prev };
      delete next[docName];
      try {
        localStorage.setItem(`sahayak_verified_docs_${scheme.id}`, JSON.stringify(next));
        localStorage.setItem("sahayak_all_verified_docs", JSON.stringify(next));
      } catch {}
      return next;
    });
    setVerificationSuccess(null);
    setVerificationError(`Verification for "${docName}" reverted to pending.`);
    setTimeout(() => setVerificationError(null), 3500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setAuthError("You must log in or sign up before applying for a scheme.");
      return;
    }
    if (!applicantName.trim()) {
      setStep("details");
      return;
    }
    if (!isReadyToSubmit) {
      setVerificationError("Mandatory document verification required: Please upload and verify at least one required certificate before submitting.");
      return;
    }

    setStep("submitting");

    setTimeout(() => {
      const now = new Date();
      const formattedDate =
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) + `, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

      const shortName = scheme.shortName || scheme.name.split(" ")[0];
      const newAppId = generateApplicationId(shortName);

      const channelPartner =
        state.toLowerCase() === "odisha"
          ? "OSFDC (Odisha SC & ST Dev Finance Corp) / District Collectorate"
          : `${scheme.channelRoute || "State Channelising Agency (SCA)"} — ${state} Branch`;

      const newApp: SubmittedApplication = {
        applicationId: newAppId,
        userId: user.uid,
        applicantEmail: user.email || undefined,
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeShortName: scheme.shortName || scheme.name,
        applicantName: applicantName.trim(),
        applicantPhone: phone.trim() || user.phoneNumber || "+91 98765 43210",
        applicantCategory: category,
        applicantState: state,
        applicantDistrict: district,
        loanAmountLakh: Number(loanAmountLakh),
        purpose: purpose.trim(),
        channelPartner,
        appliedDate: formattedDate,
        currentStageId: 1,
        stageDates: {
          1: now.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        },
        notes: `Application dossier successfully submitted with ${verifiedCount} verified certificates for ${scheme.name}. Routing to ${channelPartner}.`,
        verifiedDocuments: Object.keys(verifiedDocs).filter((k) => verifiedDocs[k]),
        documentVerificationStatus: "VERIFIED",
      };

      saveApplication(newApp);
      setSubmittedApp(newApp);
      setStep("success");
      if (onSuccess) onSuccess(newApp);
    }, 1200);
  };

  const handleCopyId = () => {
    if (!submittedApp) return;
    navigator.clipboard.writeText(submittedApp.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGoToTracker = () => {
    if (!submittedApp) return;
    onClose();
    router.push(`/tracker?appId=${encodeURIComponent(submittedApp.applicationId)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-xs">
              {scheme.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300 block">
                Official Scheme Application
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-[320px]">
                {scheme.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!user ? (
            <div className="space-y-5">
              {/* Security Header Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Authentication Required
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Sign In or Register to Apply
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    To safeguard government subsidies, verify beneficiary eligibility, and generate a legally valid tracking dossier, you must be logged in.
                  </p>
                </div>
              </div>

              {/* Scheme Context Card */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-indigo-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {scheme.icon}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Selected Scheme</span>
                    <span className="text-xs font-bold text-indigo-900 block truncate max-w-[240px] sm:max-w-xs">{scheme.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-medium">Max Loan</span>
                  <span className="text-xs font-extrabold text-emerald-700">₹{scheme.maxLoanLakh} Lakh</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">Verified Identity</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-medium">Direct SCA Routing</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">100% Free Service</span>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {authError}
                </div>
              )}

              {authMode === "options" ? (
                <div className="space-y-3 pt-1">
                  {/* Google 1-Click Sign-in */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google to Apply Instantly
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-[11px] font-medium">or choose account option</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAuthMode("email")}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In with Email
                    </button>

                    <Link
                      href={`/register?redirect=${encodeURIComponent(returnUrl)}`}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Register (Mobile OTP)
                    </Link>
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Already have an account? Go to Full Sign-In Page <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Inline Email Sign In Form */
                <form onSubmit={handleEmailSignIn} className="space-y-3 pt-1 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setAuthMode("options"); setAuthError(""); }}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {authLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-3.5 h-3.5" /> Sign In & Unlock Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : step === "details" ? (
            <form onSubmit={handleProceedToVerification} className="space-y-4 text-xs">
              {/* Step indicator badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                    Step 1 of 2
                  </span>
                  <span className="font-semibold text-slate-700 text-xs">
                    Applicant Information
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Next: Mandatory Document Audit
                </span>
              </div>

              {/* Scheme Summary Quick Badge */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between text-indigo-950">
                <div>
                  <span className="text-[10px] text-slate-500 block">Interest Rate:</span>
                  <span className="font-bold text-indigo-700">{scheme.interestRatePercent}% p.a.</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Max Limit:</span>
                  <span className="font-bold text-slate-800">₹{scheme.maxLoanLakh} Lakh</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Financing:</span>
                  <span className="font-bold text-emerald-700">{scheme.financingPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Moratorium:</span>
                  <span className="font-bold text-slate-800">{scheme.moratoriumMonthsMin} Mo</span>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Applicant Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Jasaswi das"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Social Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                      <option value="OBC">Other Backward Class (OBC)</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      State / UT *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Odisha"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      District / City
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Khurda / Bhubaneswar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Loan Amount Requested (₹ Lakh) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        step="0.1"
                        min="0.2"
                        max={scheme.maxLoanLakh}
                        required
                        value={loanAmountLakh}
                        onChange={(e) => setLoanAmountLakh(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Max allowed for this scheme: ₹{scheme.maxLoanLakh}L
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Business Activity / Purpose
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Workshop Equipment / Grocery"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Guarantee Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>100% Free Official Application:</strong> Next step requires uploading and verifying mandatory certificates before official submission.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to Document Verification</span> <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : step === "verification" ? (
            <div className="space-y-4 text-xs">
              {/* Step indicator badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Mandatory Document Verification
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Dual-Engine AI Forensic Scan & Seal Audit
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-indigo-700">
                    {verifiedCount} of {requiredDocs.length} Verified
                  </span>
                  <div className="w-24 h-1.5 bg-indigo-200 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${Math.round((verifiedCount / (requiredDocs.length || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Requirement Alert Banner */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-2.5 text-[11px] leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory Verification Rule:</strong> Schemes cannot be applied for without verifying documents.
                  {userProfile?.photoUrl ? (
                    <span className="text-indigo-700 font-medium"> Biometric face match against your profile photo is active for passport photographs.</span>
                  ) : (
                    <span> Upload your passport-size photo to match with your profile.</span>
                  )}
                </div>
              </div>

              {/* Error/Success alerts */}
              {verificationError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{verificationError}</span>
                  <button onClick={() => setVerificationError(null)} className="text-red-500 hover:text-red-800">×</button>
                </div>
              )}

              {verificationSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span className="flex-1 font-medium">{verificationSuccess}</span>
                  <button onClick={() => setVerificationSuccess(null)} className="text-emerald-500 hover:text-emerald-800">×</button>
                </div>
              )}

              {/* Documents Checklist & Uploads */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {requiredDocs.map((docName, idx) => {
                  const isVerified = !!verifiedDocs[docName];
                  const isVerifying = verifyingDoc === docName;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isVerified
                          ? "bg-emerald-50/60 border-emerald-200"
                          : isVerifying
                          ? "bg-indigo-50/70 border-indigo-200"
                          : "bg-slate-50 border-slate-200/80 hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {isVerified ? (
                          <button
                            type="button"
                            onClick={() => handleRevertDoc(docName)}
                            className="w-8 h-8 rounded-xl bg-emerald-100 hover:bg-rose-100 border border-emerald-300 hover:border-rose-300 text-emerald-700 hover:text-rose-700 flex items-center justify-center flex-shrink-0 group/icon cursor-pointer transition-colors"
                            title="Click to revert / un-verify this document"
                          >
                            <FileCheck className="w-4 h-4 group-hover/icon:hidden" />
                            <RotateCcw className="w-3.5 h-3.5 hidden group-hover/icon:block" />
                          </button>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isVerifying
                                ? "bg-indigo-100 text-indigo-700 animate-pulse"
                                : "bg-white border border-slate-200 text-slate-500"
                            }`}
                          >
                            {isVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                        )}

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-xs truncate">
                              {docName}
                            </span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded">
                              Required
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {isVerified
                              ? "✓ Verified Authentic (State Seal & OCR Matched)"
                              : isVerifying
                              ? "Forensic analysis in progress..."
                              : "Scan or upload physical certificate / photo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {(() => {
                          const isPhotoDoc = /photo|photograph|passport/i.test(docName);
                          return isVerified ? (
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                                <Check className="w-3 h-3" /> Verified
                              </span>
                              {isPhotoDoc ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCameraDocName(docName);
                                      setIsCameraOpen(true);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors"
                                    title="Re-scan passport photo using front camera"
                                  >
                                    <Camera className="w-2.5 h-2.5" /> Re-scan (Camera)
                                  </button>
                                  <label className="cursor-pointer px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1 transition-colors">
                                    <Upload className="w-2.5 h-2.5" /> Re-scan (Upload)
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={isVerifying}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadAndVerify(docName, f);
                                      }}
                                    />
                                  </label>
                                </>
                              ) : (
                                <label className="cursor-pointer px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold flex items-center gap-1 transition-colors">
                                  <Upload className="w-2.5 h-2.5" /> Re-scan & Verify
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    disabled={isVerifying}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleUploadAndVerify(docName, f);
                                    }}
                                  />
                                </label>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRevertDoc(docName)}
                                className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[10px] font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                                title="Revert / un-verify this document"
                              >
                                <RotateCcw className="w-2.5 h-2.5" /> Revert
                              </button>
                            </div>
                          ) : isVerifying ? (
                            <span className="px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Auditing...
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {isPhotoDoc && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCameraDocName(docName);
                                    setIsCameraOpen(true);
                                  }}
                                  className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                                  title="Take photo with front camera"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Front Camera
                                </button>
                              )}
                              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors">
                                <Upload className="w-3.5 h-3.5" /> Upload & Verify
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleUploadAndVerify(docName, f);
                                  }}
                                />
                              </label>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Studio Link */}
              <div className="text-center pt-1">
                <Link
                  href={`/documents?scheme=${scheme.id}`}
                  target="_blank"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Have complex documents? Open Full Document Inspection Studio ↗
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  ← Back to Details
                </button>

                {isReadyToSubmit ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Verified Application Dossier
                  </button>
                ) : (
                  <div className="flex flex-col items-end">
                    <button
                      type="button"
                      disabled
                      className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-400 font-bold flex items-center gap-2 cursor-not-allowed text-xs"
                    >
                      <Lock className="w-3.5 h-3.5" /> Verify Documents to Unlock Submit
                    </button>
                    <span className="text-[10px] text-amber-600 font-medium mt-1">
                      ⚠️ Upload at least one certificate above to apply
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {step === "submitting" && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Submitting Verified Application Dossier...
              </h4>
              <p className="text-xs text-slate-500">
                Attaching verified certificates and generating authentic tracking ID...
              </p>
            </div>
          )}

          {step === "success" && submittedApp && (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">
                  Application Submitted Successfully!
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your official scheme application dossier has been generated. Keep your Application ID safe for live status tracking.
                </p>
              </div>

              {/* Highlighted Application ID Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Official Application Tracking ID
                  </span>
                  <span className="text-emerald-400 font-bold">✓ Active in Tracker</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-indigo-300">
                    {submittedApp.applicationId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy ID
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Summary Details Grid */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Applicant:</span>
                    <span className="font-bold text-slate-800">{submittedApp.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Scheme Applied:</span>
                    <span className="font-bold text-slate-800">{submittedApp.schemeShortName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Submission Date:</span>
                    <span className="font-medium text-slate-700">{submittedApp.appliedDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Loan Amount:</span>
                    <span className="font-bold text-indigo-600">₹{submittedApp.loanAmountLakh.toFixed(2)} Lakh</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 block">Channel Partner Route:</span>
                    <span className="font-semibold text-slate-800">{submittedApp.channelPartner}</span>
                  </div>
                  {submittedApp.verifiedDocuments && submittedApp.verifiedDocuments.length > 0 && (
                    <div className="col-span-2 pt-1 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 block mb-1 font-medium">
                        Verified Certificates Attached:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {submittedApp.verifiedDocuments.map((d, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" /> {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Close Window
                </button>
                <button
                  onClick={handleGoToTracker}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4" /> Track Application Progress Now →
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Front Camera Live Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          if (cameraDocName) {
            handleUploadAndVerify(cameraDocName, file);
          }
        }}
        expectedDocType={cameraDocName}
        title="Passport-Size Photo Front Camera"
        subtitle="Capture live passport-size photo to complete your scheme document verification."
      />
    </div>
  );
}
