'use client';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  X,
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
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

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

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    percent: 15,
    badge: "Stage 1 • 0% to 15%",
    title: "Beneficiary Registration & Verification",
    subtitle: "Quick mobile verification with masked Aadhaar protection",
    appRoute: "/register",
    screenTitle: "Beneficiary Profile & Verification",
    narrativeText: "The entrepreneur registers with their phone number and verifies via secure mobile OTP. Their social category, jurisdiction, and family income are validated under official NSFDC guidelines.",
    visualData: [
      { label: "Applicant Profile", value: "Verified Citizen", sub: "Mobile OTP Verified" },
      { label: "Social Category", value: "Scheduled Caste (SC)", sub: "Target Beneficiary" },
      { label: "Jurisdiction", value: "State / District", sub: "Jurisdiction Verification" },
      { label: "Annual Family Income", value: "≤ ₹5.00 Lakh", sub: "Within Statutory Ceiling ✓" },
    ],
    details: [
      "Instant 6-digit OTP secure authentication",
      "Masked Aadhaar ID encryption (XXXX-XXXX-XXXX)",
      "Strict data privacy with zero third-party leakage",
    ],
  },
  {
    percent: 35,
    badge: "Stage 2 • 16% to 35%",
    title: "Business Project Cost Itemization",
    subtitle: "Transparent equipment & working capital estimation",
    appRoute: "/project-cost",
    screenTitle: "Project Cost Calculator — Enterprise Unit",
    narrativeText: "First-time entrepreneurs often don't know their exact loan requirement. The Project Cost Calculator itemizes machines, raw materials, and rental advances to derive the exact project budget.",
    visualData: [
      { label: "Equipment (Machinery)", value: "₹1,80,000", sub: "Capital Machinery" },
      { label: "Raw Materials & Stock", value: "₹70,000", sub: "Initial Working Capital" },
      { label: "Premises Advance", value: "₹50,000", sub: "Commercial Space" },
      { label: "Total Project Cost", value: "₹3,00,000", sub: "Auto-synced to matching" },
    ],
    details: [
      "Automatic 90% loan vs 10% beneficiary margin calculation",
      "Prevents under-financing and loan rejection",
      "One-click sync to questionnaire & scheme matcher",
    ],
  },
  {
    percent: 55,
    badge: "Stage 3 • 36% to 55%",
    title: "Document Readiness & Real AI OCR Verification",
    subtitle: "Dual-engine optical character recognition & forensic forgery detection",
    appRoute: "/documents",
    screenTitle: "AI Document Verification Engine",
    narrativeText: "The system scans uploaded identity cards and certificates using OCR.space and Gemini Vision. It extracts official fields and catches fake, tampered, or mismatched paperwork before submission.",
    visualData: [
      { label: "Caste Certificate", value: "Authentic (SC)", sub: "Competent Authority Verified" },
      { label: "Income Certificate", value: "Verified (≤ ₹5.0L)", sub: "Within Statutory Ceiling" },
      { label: "AI OCR & Forensics", value: "Real Extraction & Match", sub: "Tampering Check Passed" },
      { label: "Document Readiness", value: "Ready to Sanction", sub: "Score: 100/100 ✓" },
    ],
    details: [
      "Real optical character recognition via OCR.space & Gemini Vision",
      "Forensic forgery, tampering, and fake template detection",
      "Checklist synchronization with official scheme requirements",
    ],
  },
  {
    percent: 75,
    badge: "Stage 4 • 56% to 75%",
    title: "Hybrid AI Semantic + Deterministic Scheme Matching",
    subtitle: "100% explainable matching against official NSFDC guidelines",
    appRoute: "/recommendations",
    screenTitle: "AI Scheme Engine — Top Recommendation",
    narrativeText: "The deterministic rule engine checks statutory gates (income ≤ ₹5.0L, SC category, age 18-60) while the AI semantic engine scores project suitability for small tailoring enterprises.",
    visualData: [
      { label: "Top Recommendation", value: "Suvidha Loan Scheme", sub: "NSFDC Central Scheme" },
      { label: "Match Score", value: "90% Compatibility", sub: "Full Criteria Explainability" },
      { label: "Sanction Amount", value: "₹2,70,000 Loan", sub: "90% of ₹3.00L project cost" },
      { label: "Concessional Terms", value: "8.0% p.a. • 6 Mo Moratorium", sub: "Within 5-year repayment" },
    ],
    details: [
      "Deterministic hard gate filtering eliminates non-eligible schemes",
      "Itemized explainability breakdown for every rule",
      "Zero AI hallucinations — all rates cited from official circulars",
    ],
  },
  {
    percent: 90,
    badge: "Stage 5 • 76% to 90%",
    title: "Channel Partner Routing & Live Auto-Failover",
    subtitle: "Geographic routing to SCAs with real-time fund capacity steering",
    appRoute: "/partners",
    screenTitle: "Intelligent Channel Partner Allocation",
    narrativeText: "When the applicant's nearest local bank branch encounters a quota exhaustion or high backlog, the system automatically triggers live re-routing to OSFDC Odisha State Channelising Agency.",
    visualData: [
      { label: "Original Partner", value: "PNB Rourkela", sub: "Limited Fund Quota (🟡)" },
      { label: "Re-Routed Partner", value: "OSFDC Odisha (SCA)", sub: "High Availability (🟢)" },
      { label: "Average Turnaround", value: "~14 Days", sub: "10 days faster processing" },
      { label: "Re-Routing Audit", value: "Logged to Admin", sub: "Automatic transparency" },
    ],
    details: [
      "Evaluates distance, processing speed, and live fund availability",
      "Automatic failover prevents application stagnation in bureaucratic backlogs",
      "Interactive map with leaflet geocoding across Indian states",
    ],
  },
  {
    percent: 100,
    badge: "Stage 6 • 91% to 100%",
    title: "7-Stage Application Parcel Tracking & Direct Disbursement",
    subtitle: "E-commerce-style milestone progression from draft to loan disbursement",
    appRoute: "/tracker",
    screenTitle: "Application Tracker — Application #SHK-OD-2026-8841",
    narrativeText: "The entrepreneur tracks their loan like an online delivery parcel across 7 transparent stages: Submission, Document Verification, SCA Inspection, Sanction Letter, Agreement, and DBT Disbursement.",
    visualData: [
      { label: "Tracking ID", value: "SHK-OD-2026-8841", sub: "Beneficiary: Ravi Kumar" },
      { label: "Current Status", value: "Stage 4: Loan Sanctioned", sub: "Sanction Letter Issued" },
      { label: "Sanctioned Amount", value: "₹2,70,000", sub: "At 8.0% p.a. via OSFDC" },
      { label: "Next Step", value: "Sign Loan Agreement", sub: "Disbursement in 3 days" },
    ],
    details: [
      "7 milestone stages eliminating ambiguity and bribery opportunities",
      "Clear citizen guidance on exactly what paperwork is required next",
      "Anti-fraud advisory guaranteeing 100% free government processing",
    ],
  },
];

interface TutorialDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialDemoModal({ isOpen, onClose }: TutorialDemoModalProps) {
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioNarration, setAudioNarration] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isOpen) return;

    if (isPlaying) {
      const stepDuration = 6000 / playbackSpeed;
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => (prev + 1) % TUTORIAL_STEPS.length);
      }, stepDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, isPlaying, currentStepIndex, playbackSpeed]);

  // Speech synthesis for audio narration if enabled
  useEffect(() => {
    if (typeof window === "undefined" || !audioNarration || !isOpen) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(step.narrativeText);
      utterance.rate = playbackSpeed;
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    } catch {}
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    };
  }, [currentStepIndex, audioNarration, isOpen, playbackSpeed, language]);

  if (!isOpen) return null;

  const handleSeek = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-white"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Sahayak AI — Complete Process Guide
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    0% to 100% Process
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Interactive step-by-step guide of an entrepreneur&apos;s journey from registration to fund disbursement
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player Display Frame */}
          <div className="relative p-6 bg-gradient-to-b from-slate-900 to-slate-950 flex-1">
            {/* Step Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 border-b border-slate-800 scrollbar-none">
              {TUTORIAL_STEPS.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                return (
                  <button
                    key={s.percent}
                    onClick={() => handleSeek(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md border border-indigo-400"
                        : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: isActive ? "#38bdf8" : "#64748b" }} />
                    {s.percent}% • {s.title.split("&")[0].split("—")[0].trim()}
                  </button>
                );
              })}
            </div>

            {/* Simulated Video Frame Card */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* Top Meta info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-700/60">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-900/80 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/30">
                    Screen: {step.screenTitle}
                  </span>
                  <Link
                    href={step.appRoute}
                    onClick={onClose}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    Try Live <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Data Dashboard Visual Simulation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {step.visualData.map((d, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-900/90 border border-slate-700/70 rounded-xl"
                  >
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {d.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                      {d.value}
                    </span>
                    {d.sub && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        {d.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Implementation Highlights */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 mb-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Verification &amp; Architecture Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {step.details.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative Caption Subtitle Bar */}
              <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Narrative Voiceover (Subtitles)
                  </span>
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed mt-0.5">
                    &ldquo;{step.narrativeText}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Player Timeline & Control Bar */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
            {/* Scrubbable Progress Bar (0% to 100%) */}
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Progress: <strong className="text-white">{step.percent}% Complete</strong></span>
                <span>Stage {currentStepIndex + 1} of {TUTORIAL_STEPS.length}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"
                  style={{ width: `${step.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Transport & Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Play / Pause / Replay */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={handleRestart}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Restart Tutorial from 0%"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Audio controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
                  <span className="text-slate-400 px-1 text-[11px]">Speed:</span>
                  {[1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg font-semibold text-xs transition-colors ${
                        playbackSpeed === s
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setAudioNarration(!audioNarration)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    audioNarration
                      ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Browser Audio Narration"
                >
                  {audioNarration ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Voice: {audioNarration ? "ON" : "OFF"}
                </button>

                <button
                  onClick={() => {
                    const next = (currentStepIndex + 1) % TUTORIAL_STEPS.length;
                    setCurrentStepIndex(next);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  Next Stage <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
