'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Clock
} from "lucide-react";
import { Scheme } from "@/lib/schemes-data";
import { useAuth } from "@/contexts/AuthContext";
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
  const { userProfile, user } = useAuth();

  const [step, setStep] = useState<"form" | "submitting" | "success">("form");
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

  // Initialize with user profile if available
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setCopied(false);
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
      if (userProfile?.category) setCategory(userProfile.category);
      if (userProfile?.state) setState(userProfile.state);
      if (userProfile?.district) setDistrict(userProfile.district);
      if (userProfile?.loanRequiredLakh) {
        setLoanAmountLakh(Math.min(scheme.maxLoanLakh, userProfile.loanRequiredLakh));
      }
    }
  }, [isOpen, userProfile, user, scheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;

    setStep("submitting");

    setTimeout(() => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB", {
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
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeShortName: scheme.shortName || scheme.name,
        applicantName: applicantName.trim(),
        applicantPhone: phone.trim() || "+91 98765 43210",
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
        notes: `Application dossier successfully submitted for ${scheme.name}. Next step: Prepare original caste and income certificates for Channel Partner physical scrutiny.`,
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
          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Applicant Full Name (as on Aadhaar) *
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
                  <strong>100% Free Government Application:</strong> Submitting via Sahayak AI generates an official Application Dossier with a unique tracking reference number.
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit & Generate Application ID
                </button>
              </div>
            </form>
          )}

          {step === "submitting" && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Submitting Application Dossier...
              </h4>
              <p className="text-xs text-slate-500">
                Generating verified Application ID and linking Channel Partner routing...
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
    </div>
  );
}
