'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  ChevronRight
} from "lucide-react";
import { SCHEMES, getSchemeById } from "@/lib/schemes-data";
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

export default function TrackerPage() {
  const activeSchemes = SCHEMES.filter((s) => s.status === "active");
  const [selectedSchemeId, setSelectedSchemeId] = useState(activeSchemes[0]?.id || "nsfdc-suvidha");
  const [currentStageId, setCurrentStageId] = useState(1);
  const [stageDates, setStageDates] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState(
    "Application dossier submitted. Prepare original caste and income certificates for verification."
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    try {
      const savedStage = localStorage.getItem("sahayak_tracker_stage");
      const savedNotes = localStorage.getItem("sahayak_tracker_notes");
      const savedDates = localStorage.getItem("sahayak_tracker_dates");
      if (savedStage) setCurrentStageId(parseInt(savedStage, 10));
      if (savedNotes) setNotes(savedNotes);
      if (savedDates) setStageDates(JSON.parse(savedDates));
      else {
        const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        setStageDates({ 1: today });
      }
    } catch {}
  }, []);

  const scheme = getSchemeById(selectedSchemeId) || activeSchemes[0];

  const handleStageChange = (newStageId: number) => {
    setCurrentStageId(newStageId);
    try { localStorage.setItem("sahayak_tracker_stage", newStageId.toString()); } catch {}
    if (!stageDates[newStageId]) {
      const today = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const updated = { ...stageDates, [newStageId]: today };
      setStageDates(updated);
      try { localStorage.setItem("sahayak_tracker_dates", JSON.stringify(updated)); } catch {}
    }
  };

  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
    setIsEditingNotes(false);
    try { localStorage.setItem("sahayak_tracker_notes", newNotes); } catch {}
  };

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
            Track your scheme journey from initial dossier submission to final machinery fund disbursement with step-by-step guidance.
          </p>
        </div>

        {/* Self-Managed Disclaimer Banner */}
        <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-indigo-950 leading-relaxed">
            <strong>Self-Managed Borrower Tracker:</strong> This timeline is an applicant self-tracking guidance tool. Status updates reflect your self-reported progress and help prepare necessary documentation at each milestone. Final sanction records are maintained by your authorized Channel Partner.
          </div>
        </div>

        {/* Scheme Selector */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm mb-8 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Currently Tracking Scheme:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeSchemes.slice(0, 6).map((s) => {
              const isSelected = s.id === selectedSchemeId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSchemeId(s.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-sm"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs truncate">{s.shortName}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7-Stage Visual Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Scheme</span>
              <h2 className="text-base font-bold text-slate-900">{scheme.name}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Current Status</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Stage {currentStageId} of 7: {STAGES[currentStageId - 1].label}
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
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-300"
                      }`}
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
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
            >
              ← Previous Stage
            </button>
            <button
              onClick={() => handleStageChange(Math.min(7, currentStageId + 1))}
              disabled={currentStageId >= 7}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-40"
            >
              Advance to Next Stage →
            </button>
          </div>
        </div>

        {/* Personal Notes & Action Box */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" /> Personal Case Notes & Follow-Ups
            </h3>
            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              {isEditingNotes ? "Done Editing" : "Edit Notes"}
            </button>
          </div>

          {isEditingNotes ? (
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ) : (
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
              {notes || "No notes logged yet. Record visits to the bank or SCA office here."}
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
              href={`/partners?scheme=${selectedSchemeId}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Channel Partner Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
