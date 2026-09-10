'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Edit3,
  Calendar,
  FileCheck,
  Send,
  Building2,
  Eye,
  FileSignature,
  CreditCard,
  ChevronRight,
  Search,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  MapPin,
  IndianRupee,
  FilePlus2
} from "lucide-react";
import { SCHEMES, getSchemeById } from "@/lib/schemes-data";
import {
  SubmittedApplication,
  getStoredApplications,
  getApplicationById,
  saveApplication,
  updateApplicationStage,
} from "@/lib/applications";
import Link from "next/link";

interface TimelineStage {
  id: number;
  label: string;
  shortDesc: string;
  actionGuidance: string;
  estimatedDuration: string;
  icon: React.ReactNode;
}

const STAGES: TimelineStage[] = [
  {
    id: 1,
    label: "Application Submitted",
    shortDesc: "Application dossier generated and submitted via online portal or at the authorized Channel Partner office.",
    actionGuidance: "Ensure you obtain an acknowledgment receipt or application reference number from the SCA or bank counter.",
    estimatedDuration: "Day 1",
    icon: <Send className="w-4 h-4" />,
  },
  {
    id: 2,
    label: "Document Verification",
    shortDesc: "The Channel Partner scrutinizes caste certificate, income proof (under ₹5 Lakh), project quotation, and Aadhaar.",
    actionGuidance: "Keep original certificates ready for physical verification. Use the Sahayak OCR scanner to check for spelling mismatches.",
    estimatedDuration: "3–5 Days",
    icon: <FileCheck className="w-4 h-4" />,
  },
  {
    id: 3,
    label: "Partner Review & Due Diligence",
    shortDesc: "Technical and financial viability of the business proposal is reviewed by the loan officer.",
    actionGuidance: "Be ready to explain your machinery choices, monthly turnover estimates, and supplier quotation.",
    estimatedDuration: "5–7 Days",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 4,
    label: "Field Verification",
    shortDesc: "Bank or SCA field inspector visits the proposed shop, unit premises, or residence.",
    actionGuidance: "Have the rent agreement or site NOC ready. Neighbors or local panchayat members may be asked for identification.",
    estimatedDuration: "7–10 Days",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: 5,
    label: "Loan Sanction",
    shortDesc: "Formal sanction letter issued stating approved loan amount, interest rate, and moratorium term.",
    actionGuidance: "Carefully check that the subsidized interest rate matches official NSFDC/scheme guidelines.",
    estimatedDuration: "10–14 Days",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: 6,
    label: "Agreement Execution",
    shortDesc: "Borrower signs the tripartite loan agreement, hypothecation of machinery, and NACH/e-mandate.",
    actionGuidance: "Confirm your bank savings account is active and Aadhaar-linked for seamless DBT subsidy credit.",
    estimatedDuration: "14–18 Days",
    icon: <FileSignature className="w-4 h-4" />,
  },
  {
    id: 7,
    label: "Fund Disbursement",
    shortDesc: "Loan proceeds credited directly to the equipment vendor (for machinery) and borrower account (working capital).",
    actionGuidance: "Obtain machinery delivery challan and invoice to submit to the bank within 30 days.",
    estimatedDuration: "18–25 Days",
    icon: <CreditCard className="w-4 h-4" />,
  },
];

function TrackerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialAppId = searchParams.get("appId") || "";

  const [applications, setApplications] = useState<SubmittedApplication[]>([]);
  const [searchInput, setSearchInput] = useState(initialAppId);
  const [currentApp, setCurrentApp] = useState<SubmittedApplication | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Load stored applications on mount
  useEffect(() => {
    const stored = getStoredApplications();
    setApplications(stored);

    let targetApp: SubmittedApplication | null = null;
    if (initialAppId) {
      targetApp = stored.find(
        (a) => a.applicationId.toUpperCase() === initialAppId.trim().toUpperCase()
      ) || null;
      if (!targetApp) {
        setSearchError(`Application ID "${initialAppId}" was not found in local records.`);
      }
    }

    if (!targetApp && stored.length > 0) {
      targetApp = stored[0];
    }

    if (targetApp) {
      setCurrentApp(targetApp);
      setSearchInput(targetApp.applicationId);
      setNotes(targetApp.notes || "");
      setSearchError(null);
    }
  }, [initialAppId]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    const found = applications.find(
      (a) => a.applicationId.toUpperCase() === query
    );

    if (found) {
      setCurrentApp(found);
      setNotes(found.notes || "");
      setSearchError(null);
      router.replace(`/tracker?appId=${encodeURIComponent(found.applicationId)}`);
    } else {
      setSearchError(`No application found with ID "${searchInput}". Please verify the ID or select one below.`);
    }
  };

  const handleSelectApplication = (app: SubmittedApplication) => {
    setCurrentApp(app);
    setSearchInput(app.applicationId);
    setNotes(app.notes || "");
    setSearchError(null);
    router.replace(`/tracker?appId=${encodeURIComponent(app.applicationId)}`);
  };

  const handleStageChange = (newStageId: number) => {
    if (!currentApp) return;

    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const updatedDates = {
      ...currentApp.stageDates,
      [newStageId]: currentApp.stageDates[newStageId] || today,
    };

    const updatedApp: SubmittedApplication = {
      ...currentApp,
      currentStageId: newStageId,
      stageDates: updatedDates,
    };

    setCurrentApp(updatedApp);
    saveApplication(updatedApp);

    // Refresh application list
    setApplications((prev) =>
      prev.map((a) => (a.applicationId === updatedApp.applicationId ? updatedApp : a))
    );
  };

  const handleSaveNotes = (newNotes: string) => {
    if (!currentApp) return;
    setNotes(newNotes);
    setIsEditingNotes(false);

    const updatedApp: SubmittedApplication = {
      ...currentApp,
      notes: newNotes,
    };

    setCurrentApp(updatedApp);
    saveApplication(updatedApp);

    setApplications((prev) =>
      prev.map((a) => (a.applicationId === updatedApp.applicationId ? updatedApp : a))
    );
  };

  const handleCopyId = () => {
    if (!currentApp) return;
    navigator.clipboard.writeText(currentApp.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Matched scheme from data
  const scheme = currentApp ? getSchemeById(currentApp.schemeId) || SCHEMES[0] : SCHEMES[0];
  const currentStageId = currentApp?.currentStageId || 1;
  const stageDates = currentApp?.stageDates || { 1: "Day 1" };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold mb-3">
            <Clock className="w-3.5 h-3.5" /> 7-Stage Parcel-Style Application Timeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Application Progress Tracker
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Track your scheme journey using your unique Application ID from submission to final fund disbursement.
          </p>
        </div>

        {/* Application ID Search / Tracker Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" /> Track by Application ID
              </h2>
              <p className="text-xs text-slate-500">
                Enter the Application ID received upon applying for a scheme.
              </p>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <FilePlus2 className="w-3.5 h-3.5" /> Apply for Another Scheme
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                placeholder="e.g. SHK-2026-SUVIDHA-84920"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Track Application →
            </button>
          </form>

          {/* Search Error Alert */}
          {searchError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick Select from Recent Applications */}
          {applications.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Your Registered Applications:
              </span>
              <div className="flex flex-wrap gap-2">
                {applications.map((app) => {
                  const isSelected = currentApp?.applicationId === app.applicationId;
                  return (
                    <button
                      key={app.applicationId}
                      type="button"
                      onClick={() => handleSelectApplication(app)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold ring-2 ring-indigo-200"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>{app.applicationId}</span>
                      <span className="font-sans font-medium text-[10px] text-slate-500">
                        • {app.schemeShortName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-sans font-bold">
                        Stage {app.currentStageId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Current Tracked Application Verified Dossier Banner */}
        {currentApp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Live Application Status
                  </span>
                  <span className="text-slate-400 text-xs">
                    Submitted: {currentApp.appliedDate}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {currentApp.schemeName}
                </h2>
              </div>

              {/* Application ID Pill with Copy */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-indigo-300 font-semibold block uppercase tracking-wider">
                    Application ID
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-white">
                    {currentApp.applicationId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                  title="Copy Application ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Dossier Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-400" /> Applicant Name
                </span>
                <span className="font-bold text-white text-xs truncate block">
                  {currentApp.applicantName}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-indigo-400" /> Loan Requested
                </span>
                <span className="font-bold text-emerald-400 text-xs">
                  ₹{currentApp.loanAmountLakh.toFixed(2)} Lakh
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-400" /> State & District
                </span>
                <span className="font-bold text-white text-xs truncate block">
                  {currentApp.applicantState}
                  {currentApp.applicantDistrict ? `, ${currentApp.applicantDistrict}` : ""}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-400" /> Channel Route
                </span>
                <span className="font-bold text-white text-xs truncate block" title={currentApp.channelPartner}>
                  {currentApp.channelPartner.split("—")[0].trim()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 7-Stage Visual Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-2">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Tracking Milestone</span>
              <h3 className="text-base font-bold text-slate-900">
                Stage {currentStageId} of 7: {STAGES[currentStageId - 1]?.label}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {currentStageId === 7 ? "🎉 Disbursement Complete" : "● In Progress"}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative mb-8 px-2">
            <div className="space-y-6">
              {STAGES.map((st, idx) => {
                const isPassed = st.id < currentStageId;
                const isCurrent = st.id === currentStageId;
                const isUpcoming = st.id > currentStageId;

                return (
                  <div key={st.id} className="relative flex items-start gap-4">
                    {/* Connecting vertical line */}
                    {idx < STAGES.length - 1 && (
                      <div
                        className={`absolute left-4 top-9 bottom-[-16px] w-0.5 ${
                          isPassed ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Step Icon Button */}
                    <button
                      onClick={() => handleStageChange(st.id)}
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                        isPassed
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-300 hover:border-slate-400"
                      }`}
                      title={`Click to mark Stage ${st.id}`}
                    >
                      {isPassed ? <CheckCircle className="w-4 h-4" /> : st.id}
                    </button>

                    {/* Stage Card */}
                    <div
                      className={`flex-1 p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-indigo-50/60 border-indigo-200 shadow-sm"
                          : isPassed
                          ? "bg-slate-50/40 border-slate-200/80"
                          : "bg-white border-slate-100 opacity-60"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3
                          className={`text-sm font-bold ${
                            isCurrent ? "text-indigo-950" : isPassed ? "text-slate-800" : "text-slate-500"
                          }`}
                        >
                          {st.label}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{st.estimatedDuration}</span>
                          {stageDates[st.id] && (
                            <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {stageDates[st.id]}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {st.shortDesc}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-[11px] text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-indigo-600 uppercase text-[10px]">Action:</span>
                        <span>{st.actionGuidance}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleStageChange(Math.max(1, currentStageId - 1))}
              disabled={currentStageId <= 1}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              ← Previous Stage
            </button>
            <button
              onClick={() => handleStageChange(Math.min(7, currentStageId + 1))}
              disabled={currentStageId >= 7}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              Advance to Next Stage →
            </button>
          </div>
        </div>

        {/* Personal Notes & Action Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" /> Case Notes & Follow-Up Log
            </h3>
            <button
              onClick={() => {
                if (isEditingNotes) {
                  handleSaveNotes(notes);
                } else {
                  setIsEditingNotes(true);
                }
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              {isEditingNotes ? "Save Notes" : "Edit Notes"}
            </button>
          </div>

          {isEditingNotes ? (
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Record your interactions with the bank or SCA office here..."
            />
          ) : (
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
              {notes || "No case notes logged yet. Click 'Edit Notes' to record visits to the bank or SCA office."}
            </p>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/documents"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> Verify Documents via OCR
            </Link>
            <Link
              href={`/partners?scheme=${currentApp?.schemeId || "nsfdc-suvidha"}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Channel Partner Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-24 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading Application Tracker...</p>
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
