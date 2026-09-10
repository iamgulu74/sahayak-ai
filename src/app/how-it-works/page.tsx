'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Play,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calculator,
  FileCheck,
  TrendingUp,
  Volume2,
  VolumeX,
  ExternalLink,
  ArrowRight,
  Radio,
  BookOpen,
  MapPin,
  Mic
} from "lucide-react";
import TutorialDemoModal from "@/components/TutorialDemoModal";

interface TutorialStep {
  percent: number;
  badge: string;
  title: string;
  subtitle: string;
  appRoute: string;
  screenTitle: string;
  narrativeText: string;
  visualData: {
    label: string;
    value: string;
    sub?: string;
  }[];
  details: string[];
}

const STEPS: TutorialStep[] = [
  {
    percent: 12,
    badge: "Stage 1 • 0% to 12%",
    title: "1. Beneficiary Registration & Identity Verification",
    subtitle: "Quick mobile OTP verification with masked Aadhaar & income ceiling check",
    appRoute: "/register",
    screenTitle: "Beneficiary Profile & Verification Gate",
    narrativeText: "Welcome to Sahayak AI. In Stage 1, the entrepreneur enters their mobile number to receive a secure 6-digit OTP. We cross-verify their social category, state jurisdiction, and annual family income against the statutory ceiling of ₹5.00 Lakh under official NSFDC guidelines.",
    visualData: [
      { label: "Applicant Profile", value: "Verified Citizen", sub: "Mobile OTP Verified ✓" },
      { label: "Social Category", value: "Scheduled Caste (SC)", sub: "Target Beneficiary" },
      { label: "State Jurisdiction", value: "Odisha / District", sub: "Location Verified" },
      { label: "Annual Income Ceiling", value: "≤ ₹5.00 Lakh", sub: "Statutory Compliant ✓" },
    ],
    details: [
      "Instant 6-digit OTP secure mobile authentication",
      "Masked Aadhaar ID encryption for citizen data privacy",
      "Automatic verification against statutory income ceiling",
    ],
  },
  {
    percent: 25,
    badge: "Stage 2 • 13% to 25%",
    title: "2. Business Project Cost Itemization",
    subtitle: "Transparent equipment, inventory & working capital estimation",
    appRoute: "/project-cost",
    screenTitle: "Project Cost Calculator — Enterprise Unit",
    narrativeText: "In Stage 2, first-time entrepreneurs itemize their exact machinery cost, raw materials, and shop premises advance. This prevents under-financing and calculates the exact 90% government loan eligibility.",
    visualData: [
      { label: "Equipment (Machinery)", value: "₹1,80,000", sub: "Capital Machinery" },
      { label: "Raw Material & Stock", value: "₹70,000", sub: "Initial Working Capital" },
      { label: "Premises Advance", value: "₹50,000", sub: "Commercial Space" },
      { label: "Total Project Budget", value: "₹3,00,000", sub: "90% Loan + 10% Margin" },
    ],
    details: [
      "Automatic 90% loan vs 10% beneficiary contribution split",
      "Prevents under-financing and loan rejection at bank branch",
      "One-click synchronization to scheme recommendation engine",
    ],
  },
  {
    percent: 40,
    badge: "Stage 3 • 26% to 40%",
    title: "3. Dual-Engine AI Document Forensic OCR Inspection",
    subtitle: "Optical text extraction, biometric photo audit & forgery detection",
    appRoute: "/documents",
    screenTitle: "AI Forensic Document Inspection Engine",
    narrativeText: "In Stage 3, the AI engine scans uploaded identity cards and certificates using dual OCR.space and Gemini Vision. It validates state emblems, performs biometric face photo audits, checks ID syntax, and rejects web screenshots or tampered files.",
    visualData: [
      { label: "Caste Certificate", value: "Authentic (SC)", sub: "Tahasildar Seal Verified ✓" },
      { label: "Income Certificate", value: "Verified (≤ ₹5.0L)", sub: "Revenue Dept Validated" },
      { label: "Biometric Audit", value: "Face Photo PASS", sub: "Clarity 92% • Unaltered" },
      { label: "Template Audit", value: "Official Layout Match", sub: "100/100 Authenticity ✓" },
    ],
    details: [
      "Dual OCR.space and Gemini Vision multimodal forensic inspection",
      "Biometric facial photo verification and hologram edge overlap check",
      "Rejects web UI screenshots and digitally tampered fake certificates",
    ],
  },
  {
    percent: 55,
    badge: "Stage 4 • 41% to 55%",
    title: "4. Hybrid AI Scheme Matching & Rule Verification",
    subtitle: "Deterministic statutory gates combined with AI semantic scoring",
    appRoute: "/recommendations",
    screenTitle: "Hybrid AI Scheme Recommendation Engine",
    narrativeText: "In Stage 4, deterministic rule gates enforce strict statutory criteria while the AI semantic engine scores project suitability. It matches the beneficiary with top central schemes like NSFDC Suvidha or MUDRA.",
    visualData: [
      { label: "Top Recommendation", value: "NSFDC Suvidha Loan", sub: "Central Welfare Scheme" },
      { label: "Compatibility Score", value: "95% Match", sub: "Full Criteria Explainability" },
      { label: "Eligible Loan Limit", value: "₹2,70,000 Loan", sub: "Concessional 8.0% p.a." },
      { label: "Moratorium Relief", value: "6 Months Grace", sub: "5-Year Repayment Tenure" },
    ],
    details: [
      "100% explainable matching rules with zero AI hallucinations",
      "Concessional interest rate verification from official circulars",
      "Side-by-side scheme comparison for maximum subsidy benefit",
    ],
  },
  {
    percent: 70,
    badge: "Stage 5 • 56% to 70%",
    title: "5. Plain-Language Financial Literacy & Concessional EMI Calculator",
    subtitle: "Master 28 financial lessons and calculate monthly repayment schedules",
    appRoute: "/literacy",
    screenTitle: "Financial Literacy Hub & EMI Calculator",
    narrativeText: "In Stage 5, entrepreneurs learn key financial concepts like moratorium grace periods, credit scores, CIBIL rules, and anti-fraud guidelines across 28 plain-language lessons, paired with a live EMI calculator.",
    visualData: [
      { label: "Financial Lessons", value: "28 Master Guides", sub: "No Bureaucratic Jargon" },
      { label: "Monthly EMI", value: "₹5,475 / month", sub: "For ₹2.70L at 8.0% p.a." },
      { label: "Moratorium Window", value: "6 Months Buffer", sub: "Zero EMI during setup" },
      { label: "Credit Health", value: "CIBIL Protected", sub: "Anti-Default Guidelines" },
    ],
    details: [
      "28 master financial literacy guides designed for first-time borrowers",
      "Interactive EMI calculator with moratorium buffer support",
      "Statutory advice on avoiding illegal middlemen commission fees",
    ],
  },
  {
    percent: 85,
    badge: "Stage 6 • 71% to 85%",
    title: "6. Channel Partner Routing & Intelligent Auto-Failover",
    subtitle: "Geographic mapping to SCAs with real-time fund capacity steering",
    appRoute: "/partners",
    screenTitle: "Intelligent Channel Partner Locator & Steering",
    narrativeText: "In Stage 6, the system geocodes the applicant to the nearest State Channelising Agency or Public Sector Bank branch. If a branch faces backlog or quota exhaustion, intelligent auto-failover re-routes the dossier seamlessly.",
    visualData: [
      { label: "Primary Branch", value: "PNB Rourkela", sub: "Quota Busy (🟡)" },
      { label: "Auto-Rerouted SCA", value: "OSFDC Odisha", sub: "High Availability (🟢)" },
      { label: "Estimated Processing", value: "~14 Business Days", sub: "10 Days Faster" },
      { label: "Geographic Proximity", value: "8.2 km distance", sub: "Interactive Leaflet Map" },
    ],
    details: [
      "Evaluates distance, processing speed, and live fund capacity",
      "Intelligent failover prevents application stagnation in bureaucracy",
      "Direct phone numbers and district officer contact details provided",
    ],
  },
  {
    percent: 95,
    badge: "Stage 7 • 86% to 95%",
    title: "7. 7-Stage Application Parcel Tracker & Milestone Dossier",
    subtitle: "Transparent e-commerce style progression from draft to loan approval",
    appRoute: "/tracker",
    screenTitle: "Application Tracker — Dossier #SHK-OD-2026-8841",
    narrativeText: "In Stage 7, the entrepreneur tracks their application like an online delivery parcel across 7 transparent milestones: Draft, Document Audit, Field Inspection, Sanction Letter, Agreement, and Disbursement.",
    visualData: [
      { label: "Dossier Number", value: "SHK-OD-2026-8841", sub: "Applicant: Jasaswi Das" },
      { label: "Milestone Progress", value: "Stage 5: Agreement Signed", sub: "Sanction Letter Issued ✓" },
      { label: "Sanctioned Amount", value: "₹2,70,000", sub: "Disbursement Scheduled" },
      { label: "Next Action", value: "Direct Bank Transfer", sub: "DBT Account Credit" },
    ],
    details: [
      "7 milestone stages eliminating ambiguity and bribery opportunities",
      "Step-by-step guidance on exact physical paperwork needed at each stage",
      "Real-time SMS & email notifications for sanction updates",
    ],
  },
  {
    percent: 100,
    badge: "Stage 8 • 96% to 100%",
    title: "8. Direct Loan Disbursement & Enterprise Mentorship",
    subtitle: "Direct Benefit Transfer (DBT) to bank account & post-sanction support",
    appRoute: "/dashboard",
    screenTitle: "Loan Disbursement & Enterprise Dashboard",
    narrativeText: "Congratulations! In Stage 8, the sanctioned loan amount is directly credited to your Aadhaar-linked bank account via Direct Benefit Transfer. Sahayak AI continues supporting your business with post-sanction mentorship.",
    visualData: [
      { label: "Disbursement Method", value: "Direct Benefit Transfer (DBT)", sub: "Aadhaar Linked Account" },
      { label: "Disbursed Amount", value: "₹2,70,000 Credited", sub: "Transaction ID Verified ✓" },
      { label: "Repayment Schedule", value: "First EMI in 6 Months", sub: "Moratorium Active" },
      { label: "Enterprise Status", value: "Unit Active & Operational", sub: "Mentorship Enabled" },
    ],
    details: [
      "Direct Benefit Transfer (DBT) credited straight to beneficiary bank account",
      "100% free government scheme processing with zero hidden fees",
      "Ongoing AI business assistant support for scaling enterprise profits",
    ],
  },
];

export default function HowItWorksPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSpeechStep, setActiveSpeechStep] = useState<number | null>(null);

  const handleSpeakStep = (index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (activeSpeechStep === index) {
      setActiveSpeechStep(null);
      return;
    }

    const step = STEPS[index];
    const utterance = new SpeechSynthesisUtterance(step.narrativeText);
    utterance.rate = 1.0;
    utterance.lang = "en-IN";

    utterance.onstart = () => setActiveSpeechStep(index);
    utterance.onend = () => setActiveSpeechStep(null);
    utterance.onerror = () => setActiveSpeechStep(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-4">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Voice-Guided Step-by-Step Tutorial
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-3 leading-tight font-headline">
              How Sahayak AI Works
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Follow our 8-stage voice-guided tutorial to understand how an entrepreneur goes from initial registration to document forensic verification, scheme matching, channel partner re-routing, and direct loan disbursement.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Launch Interactive Voice Tutorial Player
              </button>
              <Link
                href="/questionnaire"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
              >
                Start Eligible Loan Match →
              </Link>
            </div>
          </div>
        </div>

        {/* 8 Step-by-Step Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Complete 8-Stage Process Breakdown
            </h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              0% to 100% Process
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {STEPS.map((s, idx) => (
              <motion.div
                key={s.percent}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                      {s.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {s.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakStep(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeSpeechStep === idx
                          ? "bg-emerald-600 text-white shadow-sm animate-pulse"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {activeSpeechStep === idx ? "Speaking..." : "Listen Voice 🔊"}
                    </button>

                    <Link
                      href={s.appRoute}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      Try Live <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Voice Narrative Banner */}
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-0.5">
                      Audio Voice Explanation:
                    </span>
                    <p className="text-slate-800 leading-relaxed">
                      &ldquo;{s.narrativeText}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Visual Data Items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {s.visualData.map((v, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">{v.label}</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{v.value}</span>
                      {v.sub && <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">{v.sub}</span>}
                    </div>
                  ))}
                </div>

                {/* Implementation Rules */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600">
                  {s.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Video Player */}
      <TutorialDemoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
