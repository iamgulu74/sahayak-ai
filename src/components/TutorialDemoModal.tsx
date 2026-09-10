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
  ChevronLeft,
  ArrowRight,
  Mic,
  Radio,
  Zap,
  Globe,
  Compass
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
  narrativeTextHindi?: string;
  visualData: {
    label: string;
    value: string;
    sub?: string;
  }[];
  details: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    percent: 12,
    badge: "Stage 1 • 0% to 12%",
    title: "1. Beneficiary Registration & Identity Verification",
    subtitle: "Quick mobile OTP verification with masked Aadhaar & income ceiling check",
    appRoute: "/register",
    screenTitle: "Beneficiary Profile & Verification Gate",
    narrativeText: "Welcome to Sahayak A I. In Stage 1, the entrepreneur enters their mobile number to receive a secure 6-digit O T P. We cross-verify their social category, state jurisdiction, and annual family income against the statutory ceiling of 5 Lakh rupees under official N S F D C guidelines.",
    narrativeTextHindi: "सहायक एआई में आपका स्वागत है। चरण 1 में, उद्यमी अपना मोबाइल नंबर दर्ज करके 6-अंकीय ओटीपी प्राप्त करते हैं। हम उनकी सामाजिक श्रेणी, राज्य और वार्षिक पारिवारिक आय को ₹5.00 लाख की सीमा के तहत सत्यापित करते हैं।",
    visualData: [
      { label: "Applicant Profile", value: "Verified Citizen", sub: "Mobile OTP Verified ✓" },
      { label: "Social Category", value: "Scheduled Caste (SC)", sub: "Target Beneficiary" },
      { label: "State Jurisdiction", value: "Odisha / District", sub: "Location Verified" },
      { label: "Annual Income Ceiling", value: "≤ ₹5.00 Lakh", sub: "Statutory Compliant ✓" },
    ],
    details: [
      "Instant 6-digit OTP secure mobile authentication",
      "Masked Aadhaar encryption for citizen data privacy",
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
    narrativeTextHindi: "चरण 2 में, प्रथम बार के उद्यमी अपनी मशीनरी लागत, कच्चे माल और दुकान के अग्रिम किराए का विवरण जोड़ते हैं। यह 90% सरकारी ऋण पात्रता की सटीक गणना करता है।",
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
    narrativeText: "In Stage 3, the AI engine scans uploaded identity cards and certificates using dual OCR and Gemini Vision. It validates state emblems, performs biometric face photo audits, checks ID syntax, and rejects web screenshots or tampered files.",
    narrativeTextHindi: "चरण 3 में, एआई इंजन ओसीआर और जेमिनी विजन का उपयोग करके अपलोड किए गए दस्तावेजों का स्कैन करता है। यह राज्य प्रतीक, बायोमेट्रिक फोटो जांच और जालसाजी का निरीक्षण करता है।",
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
    narrativeText: "In Stage 4, deterministic rule gates enforce strict statutory criteria while the AI semantic engine scores project suitability. It matches the beneficiary with top central schemes like N S F D C Suvidha or M U D R A.",
    narrativeTextHindi: "चरण 4 में, हाइब्रिड एआई इंजन सरकारी योजनाओं के साथ आपकी पात्रता का मिलान करता है। यह एनएसएफडीसी सुविधा या मुद्रा जैसी सर्वोत्तम योजनाओं का सुझाव देता है।",
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
    narrativeText: "In Stage 5, entrepreneurs learn key financial concepts like moratorium grace periods, credit scores, C I B I L rules, and anti-fraud guidelines across 28 plain-language lessons, paired with a live E M I calculator.",
    narrativeTextHindi: "चरण 5 में, उद्यमी 28 सरल पाठों के माध्यम से मोराटोरियम अवधि, सिबिल स्कोर और वित्तीय साक्षरता सीखते हैं, तथा लाइव ईएमआई कैलकुलेटर का उपयोग करते हैं।",
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
    narrativeTextHindi: "चरण 6 में, प्रणाली निकटतम राज्य सरणीकरण एजेंसी या बैंक शाखा का चयन करती है। यदि किसी शाखा में देरी होती है, तो ऑटो-फ़ेलओवर स्वचालित रूप से फ़ाइल को री-रूट करता है।",
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
    narrativeTextHindi: "चरण 7 में, उद्यमी अपने आवेदन को ऑनलाइन पार्सल की तरह 7 पारदर्शी चरणों में ट्रैक करते हैं: ड्राफ्ट, दस्तावेज़ ऑडिट, स्वीकृति पत्र, और अंतिम संवितरण।",
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
    narrativeText: "Congratulations! In Stage 8, the sanctioned loan amount is directly credited to your Aadhaar-linked bank account via Direct Benefit Transfer. Sahayak A I continues supporting your business with post-sanction mentorship.",
    narrativeTextHindi: "बधाई हो! चरण 8 में, स्वीकृत ऋण राशि आपके आधार से जुड़े बैंक खाते में सीधे ट्रांसफर की जाती है। सहायक एआई व्यवसाय संवर्धन में आपका सहयोग जारी रखता है।",
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

interface TutorialDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialDemoModal({ isOpen, onClose }: TutorialDemoModalProps) {
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [audioNarration, setAudioNarration] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Speech synthesis launcher that advances state ONLY after voice completes
  const speakAndSyncStep = (stepIndex: number) => {
    if (typeof window === "undefined") return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!("speechSynthesis" in window) || !audioNarration) {
      setIsSpeaking(false);
      if (isPlayingRef.current) {
        // Fallback timer if voice is muted / unsupported
        const fallbackDuration = 10000 / playbackSpeedRef.current;
        timerRef.current = setTimeout(() => {
          setCurrentStepIndex((prev) => (prev + 1) % TUTORIAL_STEPS.length);
        }, fallbackDuration);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const targetStep = TUTORIAL_STEPS[stepIndex];
      const textToSpeak = language === "hi" && targetStep.narrativeTextHindi
        ? targetStep.narrativeTextHindi
        : targetStep.narrativeText;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = playbackSpeedRef.current;
      utterance.pitch = 1.0;
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.includes(utterance.lang) || v.name.toLowerCase().includes("india") || v.name.toLowerCase().includes("hindi")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // CRITICAL FIX: Only advance AFTER voice narration completes!
        if (isPlayingRef.current) {
          const pauseBuffer = 1200 / playbackSpeedRef.current;
          timerRef.current = setTimeout(() => {
            setCurrentStepIndex((prev) => (prev + 1) % TUTORIAL_STEPS.length);
          }, pauseBuffer);
        }
      };

      utterance.onerror = (err) => {
        console.warn("Speech synthesis notice:", err);
        setIsSpeaking(false);
        if (isPlayingRef.current) {
          timerRef.current = setTimeout(() => {
            setCurrentStepIndex((prev) => (prev + 1) % TUTORIAL_STEPS.length);
          }, 8000 / playbackSpeedRef.current);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      if (isPlayingRef.current) {
        timerRef.current = setTimeout(() => {
          setCurrentStepIndex((prev) => (prev + 1) % TUTORIAL_STEPS.length);
        }, 8000 / playbackSpeedRef.current);
      }
    }
  };

  // Synchronize voice playback & step progression
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSpeaking(false);
      return;
    }

    speakAndSyncStep(currentStepIndex);

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentStepIndex, audioNarration, isOpen, playbackSpeed, isPlaying, language]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-white"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Radio className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Sahayak AI — Voice-Guided Step-by-Step Tutorial
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    🔊 Voice Enabled
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Complete interactive tutorial of an entrepreneur&apos;s journey from registration to direct loan disbursement
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tutorial Screen Body */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-b from-slate-900 to-slate-950 flex-1">
            {/* Step Chip Navigator */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-800 scrollbar-none">
              {TUTORIAL_STEPS.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                return (
                  <button
                    key={s.percent}
                    onClick={() => handleSeek(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md border border-indigo-400 font-bold"
                        : "bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: isActive ? "#38bdf8" : "#64748b" }}
                    />
                    Stage {idx + 1} ({s.percent}%)
                  </button>
                );
              })}
            </div>

            {/* Stage Screen Simulator */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/60">
                <div>
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest block mb-0.5">
                    {step.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-900/90 rounded-lg text-xs font-mono text-emerald-400 border border-emerald-500/30">
                    Screen: {step.screenTitle}
                  </span>
                  <Link
                    href={step.appRoute}
                    onClick={() => {
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  >
                    Try Live <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Live Data Simulation Grid */}
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
                      <span className="text-[10px] text-emerald-400 block mt-0.5 font-semibold">
                        {d.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Key Highlights */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 mb-4">
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  System Architecture & Implementation Rules
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

              {/* Voice Narrator Subtitle Banner with Active Waveform */}
              <div className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                isSpeaking
                  ? "bg-indigo-950/80 border-indigo-500/60 ring-2 ring-indigo-500/30 shadow-lg"
                  : "bg-slate-900/70 border-slate-700/70"
              }`}>
                <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                  isSpeaking ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                }`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                      <span>🔊 AI Voice Narrator (Step-by-Step Audio)</span>
                      {isSpeaking && (
                        <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold">
                          <span className="w-1 h-3 bg-emerald-400 animate-bounce rounded-full" />
                          <span className="w-1 h-4 bg-emerald-400 animate-bounce rounded-full [animation-delay:0.15s]" />
                          <span className="w-1 h-2 bg-emerald-400 animate-bounce rounded-full [animation-delay:0.3s]" />
                          <span>Speaking...</span>
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => speakAndSyncStep(currentStepIndex)}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
                    >
                      Re-play Voice 🔊
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                    &ldquo;{language === "hi" && step.narrativeTextHindi ? step.narrativeTextHindi : step.narrativeText}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transport & Playback Control Bar */}
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
            {/* Timeline Progress Bar (0% to 100%) */}
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Progress: <strong className="text-emerald-400 font-bold">{step.percent}% Complete</strong></span>
                <span className="font-semibold text-slate-300">Stage {currentStepIndex + 1} of {TUTORIAL_STEPS.length}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                const targetIdx = Math.min(Math.floor(ratio * TUTORIAL_STEPS.length), TUTORIAL_STEPS.length - 1);
                handleSeek(targetIdx);
              }}>
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                  style={{ width: `${step.percent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Play / Pause / Prev / Next / Replay */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = (currentStepIndex - 1 + TUTORIAL_STEPS.length) % TUTORIAL_STEPS.length;
                    setCurrentStepIndex(prev);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center border border-slate-700 cursor-pointer"
                  title="Previous Stage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause Tutorial" : "Play Tutorial"}
                </button>
                <button
                  onClick={() => {
                    const next = (currentStepIndex + 1) % TUTORIAL_STEPS.length;
                    setCurrentStepIndex(next);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center border border-slate-700 cursor-pointer"
                  title="Next Stage"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRestart}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  title="Restart Tutorial from 0%"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Voice & Speed controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
                  <span className="text-slate-400 px-1 text-[11px]">Speed:</span>
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
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
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    audioNarration
                      ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                  title="Toggle Voice Audio Narration"
                >
                  {audioNarration ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                  <span>Voice: {audioNarration ? "ON 🔊" : "OFF 🔇"}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
