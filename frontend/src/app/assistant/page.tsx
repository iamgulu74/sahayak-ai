'use client';
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Home,
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calculator,
  MapPin,
  ChevronRight,
  FileBadge,
  Clock,
  FileText,
  FileCheck
} from "lucide-react";
import { SCHEMES, getSchemeById, Scheme } from "@/lib/schemes-data";
import { CHANNEL_PARTNERS } from "@/lib/partners-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type FlowType = "menu" | "find_loan" | "eligibility" | "documents" | "emi" | "partners" | "tracker";

interface SelectionHistory {
  purpose?: string;
  projectType?: string;
  projectCost?: string;
  projectCostVal?: number;
  familyIncome?: string;
  familyIncomeVal?: number;
  applicantStatus?: string;
  socialCategory?: string;
  ageGroup?: string;
  targetDoc?: string;
  loanAmount?: number;
  loanTenure?: number;
  partnerType?: string;
  trackType?: string;
}

interface OptionItem {
  id: string;
  title: string;
  desc?: string;
  icon?: string;
}

export default function AssistantPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { userProfile } = useAuth();

  const [activeFlow, setActiveFlow] = useState<FlowType>("menu");
  const [step, setStep] = useState<number>(1);
  const [stepStack, setStepStack] = useState<number[]>([1]);
  const [selections, setSelections] = useState<SelectionHistory>({});
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = language === "hi" ? "hi-IN" : language === "or" ? "or-IN" : "en-IN";

        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript.toLowerCase().trim();
          handleVoiceMatch(transcript);
          setIsListening(false);
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, [language, activeFlow, step, selections]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported by your browser. Please use Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechNotice("Listening... Speak any visible option");
      setTimeout(() => setSpeechNotice(null), 3500);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const clean = text.replace(/[*_#•✓]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const navigateToFlow = (flow: FlowType) => {
    setActiveFlow(flow);
    setStep(1);
    setStepStack([1]);
    setSelections({});
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (stepStack.length > 1) {
      const newStack = [...stepStack];
      newStack.pop();
      const prevStep = newStack[newStack.length - 1];
      setStepStack(newStack);
      setStep(prevStep);
    } else {
      setActiveFlow("menu");
      setStep(1);
      setStepStack([1]);
    }
  };

  const restartFlow = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setStep(1);
    setStepStack([1]);
    setSelections({});
  };

  const advanceStep = (nextStep: number, updatedSelections?: Partial<SelectionHistory>) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (updatedSelections) {
      setSelections((prev) => ({ ...prev, ...updatedSelections }));
    }
    setStepStack((prev) => [...prev, nextStep]);
    setStep(nextStep);
  };

  const handleVoiceMatch = (transcript: string) => {
    const currentOptions = getCurrentOptions();
    for (const opt of currentOptions) {
      const titleLower = opt.title.toLowerCase();
      if (
        transcript.includes(titleLower) ||
        titleLower.includes(transcript) ||
        (opt.desc && transcript.includes(opt.desc.toLowerCase()))
      ) {
        handleOptionClick(opt.id);
        return;
      }
    }
    setSpeechNotice(`Couldn't match "${transcript}". Please tap an option below.`);
    setTimeout(() => setSpeechNotice(null), 3500);
  };

  const getCurrentOptions = (): OptionItem[] => {
    if (activeFlow === "menu") return MENU_OPTIONS;
    if (activeFlow === "find_loan") {
      if (step === 1) return PURPOSE_OPTIONS;
      if (step === 2) return PROJECT_TYPE_OPTIONS;
      if (step === 3) return PROJECT_COST_OPTIONS;
      if (step === 4) return FAMILY_INCOME_OPTIONS;
      if (step === 5) return APPLICANT_STATUS_OPTIONS;
    }
    if (activeFlow === "eligibility") {
      if (step === 1) return ELIGIBILITY_SELF_OPTIONS;
      if (step === 2) return CATEGORY_OPTIONS;
      if (step === 3) return FAMILY_INCOME_OPTIONS;
      if (step === 4) return PURPOSE_OPTIONS.slice(0, 3);
      if (step === 5) return AGE_OPTIONS;
    }
    if (activeFlow === "documents") {
      if (step === 1) return DOCUMENT_OPTIONS;
    }
    if (activeFlow === "emi") {
      if (step === 1) return EMI_MENU_OPTIONS;
      if (step === 2) return EMI_AMOUNT_OPTIONS;
      if (step === 3) return EMI_TENURE_OPTIONS;
    }
    if (activeFlow === "partners") {
      if (step === 1) return PARTNER_FILTER_OPTIONS;
    }
    if (activeFlow === "tracker") {
      if (step === 1) return TRACKER_SCHEME_OPTIONS;
    }
    return [];
  };

  const handleOptionClick = (optionId: string) => {
    if (activeFlow === "menu") {
      if (optionId === "find_loan") navigateToFlow("find_loan");
      else if (optionId === "eligibility") navigateToFlow("eligibility");
      else if (optionId === "documents") navigateToFlow("documents");
      else if (optionId === "emi") navigateToFlow("emi");
      else if (optionId === "partners") navigateToFlow("partners");
      else if (optionId === "tracker") navigateToFlow("tracker");
      return;
    }

    if (activeFlow === "find_loan") {
      if (step === 1) advanceStep(2, { purpose: optionId });
      else if (step === 2) advanceStep(3, { projectType: optionId });
      else if (step === 3) {
        const costMap: Record<string, number> = {
          cost_sub140: 1.2,
          cost_140_500: 3.5,
          cost_500_1000: 8.0,
          cost_1000_2500: 18.0,
          cost_2500_5000: 35.0,
          cost_above5000: 60.0,
        };
        advanceStep(4, { projectCost: optionId, projectCostVal: costMap[optionId] || 3.0 });
      } else if (step === 4) {
        const incomeMap: Record<string, number> = {
          inc_sub200: 1.8,
          inc_200_300: 2.5,
          inc_300_500: 3.5,
          inc_above500: 6.5,
        };
        advanceStep(5, { familyIncome: optionId, familyIncomeVal: incomeMap[optionId] || 3.0 });
      } else if (step === 5) {
        advanceStep(6, { applicantStatus: optionId });
      }
      return;
    }

    if (activeFlow === "eligibility") {
      if (step === 1) advanceStep(2, { purpose: optionId });
      else if (step === 2) advanceStep(3, { socialCategory: optionId });
      else if (step === 3) {
        const incomeMap: Record<string, number> = {
          inc_sub200: 1.8,
          inc_200_300: 2.5,
          inc_300_500: 3.5,
          inc_above500: 6.5,
        };
        advanceStep(4, { familyIncome: optionId, familyIncomeVal: incomeMap[optionId] || 3.0 });
      } else if (step === 4) advanceStep(5, { projectType: optionId });
      else if (step === 5) advanceStep(6, { ageGroup: optionId });
      return;
    }

    if (activeFlow === "documents") {
      if (step === 1) advanceStep(2, { targetDoc: optionId });
      return;
    }

    if (activeFlow === "emi") {
      if (step === 1) {
        if (optionId === "emi_calc") advanceStep(2);
        else advanceStep(10, { targetDoc: optionId });
      } else if (step === 2) {
        const amt = parseInt(optionId.replace("amt_", ""), 10);
        advanceStep(3, { loanAmount: amt });
      } else if (step === 3) {
        const tenure = parseInt(optionId.replace("tenure_", ""), 10);
        advanceStep(4, { loanTenure: tenure });
      }
      return;
    }

    if (activeFlow === "partners") {
      if (step === 1) advanceStep(2, { partnerType: optionId });
      return;
    }

    if (activeFlow === "tracker") {
      if (step === 1) advanceStep(2, { trackType: optionId });
      return;
    }
  };

  const recommendedScheme: Scheme = useMemo(() => {
    const isWoman = selections.applicantStatus === "stat_woman";
    const cost = selections.projectCostVal || 3.0;
    const income = selections.familyIncomeVal || 3.0;

    if (income > 5.0) {
      return getSchemeById("mudra-shishu") || SCHEMES[6] || SCHEMES[0];
    }
    if (isWoman && cost <= 1.40) return getSchemeById("nsfdc-msy") || SCHEMES[0];
    if (cost <= 1.40) return getSchemeById("nsfdc-mcf") || SCHEMES[1];
    if (cost <= 10.0) return getSchemeById("nsfdc-suvidha") || SCHEMES[2];
    if (cost <= 50.0) return getSchemeById("nsfdc-utkarsh") || SCHEMES[3];
    return getSchemeById("nsfdc-suvidha") || SCHEMES[2];
  }, [selections]);

  const calculatedEmi = useMemo(() => {
    const p = selections.loanAmount || 300000;
    const years = selections.loanTenure || 5;
    const annualRate = 0.08;
    const r = annualRate / 12;
    const n = years * 12;

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principal: p,
      years,
    };
  }, [selections.loanAmount, selections.loanTenure]);

  const breadcrumbText = useMemo(() => {
    const parts: string[] = [];
    if (selections.purpose) {
      const p = PURPOSE_OPTIONS.find((o) => o.id === selections.purpose);
      if (p) parts.push(p.title);
    }
    if (selections.projectType) {
      const pt = PROJECT_TYPE_OPTIONS.find((o) => o.id === selections.projectType);
      if (pt) parts.push(pt.title);
    }
    if (selections.projectCost) {
      const pc = PROJECT_COST_OPTIONS.find((o) => o.id === selections.projectCost);
      if (pc) parts.push(pc.title);
    }
    if (selections.familyIncome) {
      const fi = FAMILY_INCOME_OPTIONS.find((o) => o.id === selections.familyIncome);
      if (fi) parts.push(fi.title);
    }
    return parts.join(" → ");
  }, [selections]);

  return (
    <div className="page-container py-10 px-4 sm:px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-headline">
                    Sahayak AI Guided Assistant
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Official & Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tap-by-tap guided decision assistant for government financial schemes • No typing required
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleVoice}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title="Speak any visible option to tap it"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
                <span className="hidden sm:inline">{isListening ? "Listening..." : "Voice"}</span>
              </button>
            </div>
          </div>

          {speechNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
              <span className="animate-ping w-2 h-2 rounded-full bg-indigo-600" />
              {speechNotice}
            </div>
          )}

          {activeFlow !== "menu" && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={goBack}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => navigateToFlow("menu")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" /> Main Menu
                </button>
                <button
                  onClick={restartFlow}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>

              {activeFlow === "find_loan" && step <= 5 && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                  Step {step} of 5
                </span>
              )}
              {activeFlow === "eligibility" && step <= 5 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  Step {step} of 5
                </span>
              )}
              {activeFlow === "emi" && step <= 3 && step > 1 && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                  Step {step - 1} of 2
                </span>
              )}
            </div>
          )}

          {breadcrumbText && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2 overflow-x-auto">
              <span className="font-bold text-slate-800 flex-shrink-0">Your Selections:</span>
              <span className="text-indigo-700 font-medium whitespace-nowrap">{breadcrumbText}</span>
            </div>
          )}
        </div>

        {/* Dynamic Guided Flow Content */}
        <AnimatePresence mode="wait">
          {/* PRIMARY MENU */}
          {activeFlow === "menu" && (
            <motion.div
              key="primary_menu"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-white rounded-3xl border border-indigo-100 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200/80 shadow-xs flex items-center justify-center text-2xl">
                      🤖
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Namaste! How can I help you today?
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Choose an option below to get guided step-by-step assistance.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => speakText("Namaste! How can I help you today? Choose an option below to get guided step-by-step assistance.")}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-xs cursor-pointer"
                    title="Read question aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {MENU_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleOptionClick(opt.id)}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center text-xl flex-shrink-0 transition-colors shadow-xs">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {opt.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        {opt.desc}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* FLOW 1: FIND THE RIGHT LOAN */}
          {activeFlow === "find_loan" && (
            <motion.div
              key={`find_loan_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="What do you need financial assistance for?"
                  subtitle="Select your primary purpose to filter appropriate government credit schemes."
                  onSpeak={() => speakText("What do you need financial assistance for?")}
                >
                  <OptionGrid options={PURPOSE_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <QuestionCard
                  title="What type of business or activity are you planning?"
                  subtitle="Different sectors receive tailored subsidies and moratorium terms."
                  onSpeak={() => speakText("What type of business or activity are you planning?")}
                >
                  <OptionGrid options={PROJECT_TYPE_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 3 && (
                <QuestionCard
                  title="What is your estimated total project cost?"
                  subtitle="Includes equipment, raw materials, and initial working capital."
                  onSpeak={() => speakText("What is your estimated total project cost?")}
                >
                  <OptionGrid options={PROJECT_COST_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 4 && (
                <QuestionCard
                  title="What is your annual household family income?"
                  subtitle="Ministry of Social Justice (NSFDC) schemes have a statutory family income ceiling of ₹5.00 Lakh/year."
                  onSpeak={() => speakText("What is your annual household family income?")}
                >
                  <OptionGrid options={FAMILY_INCOME_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 5 && (
                <QuestionCard
                  title="What is your applicant category or status?"
                  subtitle="Special concessional rates apply for women entrepreneurs."
                  onSpeak={() => speakText("What is your applicant category or status?")}
                >
                  <OptionGrid options={APPLICANT_STATUS_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 6 && (
                <div className="bg-white rounded-3xl border border-indigo-100 p-6 shadow-md space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl text-white shadow-sm">
                        🎯
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                          Verified Scheme Match
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">
                          {recommendedScheme.name}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {recommendedScheme.ministry} • Guidelines Verified
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => speakText(`We recommend ${recommendedScheme.name}. Maximum loan is ${recommendedScheme.loan_limit || `₹${recommendedScheme.maxLoanLakh} Lakh`} with an interest rate of ${recommendedScheme.interest_rate_beneficiary_pct ? `${recommendedScheme.interest_rate_beneficiary_pct}%` : `${recommendedScheme.interestRatePercent}%`}.`)}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-xs cursor-pointer"
                      title="Read recommendation aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Why this scheme fits your requirement:
                    </h4>
                    <ul className="text-xs text-emerald-900 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">✓</span> Suitable for your enterprise ({recommendedScheme.eligibleCategories?.join(', ') || "Eligible Citizens"})
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">✓</span> Family income satisfied (Under ₹5.00 Lakh statutory ceiling)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">✓</span> Financing up to 90% with low beneficiary contribution
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Loan</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {recommendedScheme.loan_limit || `₹${recommendedScheme.maxLoanLakh} Lakh`}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Interest Rate</span>
                      <span className="text-sm font-extrabold text-indigo-600">
                        {recommendedScheme.interest_rate_beneficiary_pct ? `${recommendedScheme.interest_rate_beneficiary_pct}%` : `${recommendedScheme.interestRatePercent}%`}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Moratorium</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {recommendedScheme.moratorium_period || recommendedScheme.moratoriumPeriodDesc || `${recommendedScheme.moratoriumMonthsMin}-${recommendedScheme.moratoriumMonthsMax} mo`}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Repayment</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {recommendedScheme.repayment_period || recommendedScheme.repaymentPeriodDesc || `${recommendedScheme.repaymentYears} yrs`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                      href={`/schemes/${recommendedScheme.id}`}
                      className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <FileText className="w-4 h-4" /> View Full Scheme Details
                    </Link>
                    <Link
                      href={`/partners?scheme=${recommendedScheme.id}`}
                      className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Building2 className="w-4 h-4" /> Locate Channel Partner
                    </Link>
                    <Link
                      href="/documents"
                      className="py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileBadge className="w-4 h-4 text-indigo-600" /> Verify Documents in Real OCR
                    </Link>
                    <button
                      onClick={restartFlow}
                      className="py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Find Another Scheme
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* FLOW 2: CHECK ELIGIBILITY */}
          {activeFlow === "eligibility" && (
            <motion.div
              key={`eligibility_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="Who are you checking eligibility for?"
                  subtitle="Beneficiaries must apply under their own legal name or designated family representative."
                  onSpeak={() => speakText("Who are you checking eligibility for?")}
                >
                  <OptionGrid options={ELIGIBILITY_SELF_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <QuestionCard
                  title="What is your Social Category?"
                  subtitle="NSFDC credit schemes are targeted at Scheduled Caste (SC) entrepreneurs."
                  onSpeak={() => speakText("What is your Social Category?")}
                >
                  <OptionGrid options={CATEGORY_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 3 && (
                <QuestionCard
                  title="What is your annual household family income?"
                  subtitle="NSFDC circular specifies an annual family income ceiling of ₹5.00 Lakh."
                  onSpeak={() => speakText("What is your annual household family income?")}
                >
                  <OptionGrid options={FAMILY_INCOME_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 4 && (
                <QuestionCard
                  title="What is the purpose of the loan?"
                  subtitle="Choose whether you need business finance, working capital, or machinery."
                  onSpeak={() => speakText("What is the purpose of the loan?")}
                >
                  <OptionGrid options={PURPOSE_OPTIONS.slice(0, 3)} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 5 && (
                <QuestionCard
                  title="What is the applicant's age?"
                  subtitle="Statutory age requirement under central guidelines is between 18 and 60 years."
                  onSpeak={() => speakText("What is the applicant's age?")}
                >
                  <OptionGrid options={AGE_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  {(selections.familyIncomeVal || 3.0) <= 5.0 && selections.ageGroup !== "age_outside" ? (
                    <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-md space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl text-white shadow-sm">
                          ✓
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                            Eligibility Verified
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mt-1">
                            You Meet Basic Eligibility Criteria!
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900">
                        <p className="font-semibold">Statutory Requirements Satisfied:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Annual family income is within the statutory ₹5.00 Lakh ceiling ✓</li>
                          <li>Age criteria (18–60 years) satisfied ✓</li>
                          <li>Target category recognized under official guidelines ✓</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={() => navigateToFlow("find_loan")}
                          className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Find Matching Schemes
                        </button>
                        <Link
                          href="/documents"
                          className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                        >
                          <FileCheck className="w-4 h-4" /> Prepare & Check Documents
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-md space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-2xl text-white shadow-sm">
                          ⚠️
                        </div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                            Eligibility Advisory
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mt-1">
                            NSFDC Concessional Ceiling Exceeded
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-2">
                        <p className="font-semibold">Reason for Disqualification under NSFDC Schemes:</p>
                        <p>
                          {(selections.familyIncomeVal || 3.0) > 5.0
                            ? "Your reported annual household income exceeds the statutory ceiling of ₹5.00 Lakh per annum applicable to all NSFDC schemes (effective 07.01.2026)."
                            : "The applicant's age does not meet the standard 18–60 year eligibility window."}
                        </p>
                        <p className="font-semibold pt-1">Alternative Options (No Income Ceiling):</p>
                        <p>
                          You can apply under <strong>Pradhan Mantri MUDRA Yojana (PMMY)</strong> or <strong>Stand-Up India</strong>, which have NO household income ceiling.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Link
                          href="/schemes/mudra-kishore"
                          className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                        >
                          <Building2 className="w-4 h-4" /> Explore MUDRA Schemes
                        </Link>
                        <button
                          onClick={restartFlow}
                          className="py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" /> Start Over
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* FLOW 3: DOCUMENTS & KYC */}
          {activeFlow === "documents" && (
            <motion.div
              key={`documents_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="Which document information do you need?"
                  subtitle="Select a document to learn statutory requirements or verify it with our real OCR scanner."
                  onSpeak={() => speakText("Which document information do you need?")}
                >
                  <OptionGrid options={DOCUMENT_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5">
                  <DocumentDetailView
                    docId={selections.targetDoc || "doc_aadhaar"}
                    onTestOcr={() => router.push("/documents")}
                    onBack={goBack}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* FLOW 4: EMI & LOAN INFORMATION */}
          {activeFlow === "emi" && (
            <motion.div
              key={`emi_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="What would you like to know about loan repayment?"
                  subtitle="Tap an option below to calculate monthly installments or understand concessional terms."
                  onSpeak={() => speakText("What would you like to know about loan repayment?")}
                >
                  <OptionGrid options={EMI_MENU_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <QuestionCard
                  title="Select the loan amount you want to calculate for:"
                  subtitle="Choose the estimated amount you wish to borrow."
                  onSpeak={() => speakText("Select the loan amount you want to calculate for.")}
                >
                  <OptionGrid options={EMI_AMOUNT_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 3 && (
                <QuestionCard
                  title="Select the repayment tenure:"
                  subtitle="NSFDC concessional loans offer repayment terms between 3 and 7 years."
                  onSpeak={() => speakText("Select the repayment tenure in years.")}
                >
                  <OptionGrid options={EMI_TENURE_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 4 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl">
                      🧮
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Estimated Monthly Repayment
                      </span>
                      <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                        ₹{calculatedEmi.monthlyEmi.toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-slate-500">/ month</span>
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Principal Loan</span>
                      <span className="text-sm font-bold text-slate-800">
                        ₹{calculatedEmi.principal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Interest Rate</span>
                      <span className="text-sm font-bold text-indigo-600">8.0% p.a.</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenure</span>
                      <span className="text-sm font-bold text-slate-800">{calculatedEmi.years} Years</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-3 flex justify-between items-center">
                      <span className="text-xs text-slate-600">Total Interest Payable:</span>
                      <span className="text-xs font-bold text-slate-900">
                        ₹{calculatedEmi.totalInterest.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>6-Month Moratorium Included:</strong> Under NSFDC Suvidha, you do not pay monthly EMIs during the first 6 months while setting up your machinery.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2.5">
                    <Link
                      href={`/calculator?amount=${calculatedEmi.principal}&tenure=${calculatedEmi.years}`}
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Calculator className="w-4 h-4" /> Open Full Interactive Calculator
                    </Link>
                    <button
                      onClick={restartFlow}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              )}

              {step === 10 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5">
                  <EducationalExplainerView
                    topicId={selections.targetDoc || "emi_moratorium"}
                    onBack={goBack}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* FLOW 5: FIND A CHANNEL PARTNER */}
          {activeFlow === "partners" && (
            <motion.div
              key={`partners_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="How would you like to find an authorized channel partner?"
                  subtitle="Channel partners are authorized government agencies and nationalized banks that verify paperwork and disburse loans."
                  onSpeak={() => speakText("How would you like to find an authorized partner?")}
                >
                  <OptionGrid options={PARTNER_FILTER_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Recommended Authorized Partners
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        Verified Disbursing Institutions
                      </h3>
                    </div>
                    <Link
                      href="/partners"
                      className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Interactive Map View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {CHANNEL_PARTNERS.filter((p) => !p.isReferenceOnly).slice(0, 3).map((partner) => (
                      <div
                        key={partner.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/70 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{partner.name}</h4>
                            <p className="text-xs text-slate-500">
                              {partner.type} • {partner.district}, {partner.state}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            🟢 Accepting Applications
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          <strong>Office Address:</strong> {partner.address}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span>Processing speed: <strong>{partner.avgProcessingDays} days</strong></span>
                          <span>•</span>
                          <span>Phone: <strong>{partner.phone}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-3">
                    <Link
                      href="/partners"
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MapPin className="w-4 h-4" /> Open Full Channel Partner Directory & Map
                    </Link>
                    <button
                      onClick={restartFlow}
                      className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Change Filter
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* FLOW 6: TRACK MY APPLICATION */}
          {activeFlow === "tracker" && (
            <motion.div
              key={`tracker_step_${step}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {step === 1 && (
                <QuestionCard
                  title="Which scheme application would you like to track?"
                  subtitle="Select your submitted application to view real-time stage progression."
                  onSpeak={() => speakText("Which scheme application would you like to track?")}
                >
                  <OptionGrid options={TRACKER_SCHEME_OPTIONS} onSelect={handleOptionClick} />
                </QuestionCard>
              )}

              {step === 2 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                        Ref #SHK-2026-8941
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {selections.trackType === "track_suvidha"
                          ? "NSFDC Suvidha Business Loan"
                          : selections.trackType === "track_msy"
                          ? "Mahila Samriddhi Yojana (MSY)"
                          : "Micro Credit Finance (MCF)"}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      Current: Document Scrutiny
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center gap-3 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <span>Stage 1: Application Dossier Generated</span>
                          <span className="block text-[10px] text-slate-500 font-normal">Completed • Receipt generated</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-amber-900 font-bold">
                        <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] text-amber-600 font-mono">
                          2
                        </div>
                        <div>
                          <span>Stage 2: Document Verification (Current)</span>
                          <span className="block text-[10px] text-slate-500 font-normal">In Progress • Scrutinizing Caste & Income Certificate</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-mono">
                          3
                        </div>
                        <div>
                          <span>Stage 3: Channel Partner Loan Committee Review</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Pending Stage 2 clearance</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-mono">
                          4
                        </div>
                        <div>
                          <span>Stage 4: Formal Loan Sanction Letter</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Pending Committee Review</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-mono">
                          5
                        </div>
                        <div>
                          <span>Stage 5: Direct Vendor & Beneficiary Disbursement</span>
                          <span className="block text-[10px] text-slate-400 font-normal">Pending Sanction Execution</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-3">
                    <Link
                      href="/tracker"
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Clock className="w-4 h-4" /> Open 7-Stage Comprehensive Tracker
                    </Link>
                    <Link
                      href="/documents"
                      className="py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4 text-indigo-600" /> Check Documents in OCR
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Reusable Subcomponents
// ----------------------------------------------------------------------

function QuestionCard({
  title,
  subtitle,
  children,
  onSpeak,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onSpeak: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-headline">
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={onSpeak}
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-xs cursor-pointer flex-shrink-0"
          title="Read question aloud"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}

function OptionGrid({
  options,
  onSelect,
}: {
  options: OptionItem[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
      {options.map((opt) => (
        <motion.button
          key={opt.id}
          whileHover={{ scale: 1.015, y: -2 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => onSelect(opt.id)}
          className="p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all text-left flex items-start gap-3.5 cursor-pointer group"
        >
          {opt.icon && (
            <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center text-lg flex-shrink-0 transition-colors shadow-xs border border-slate-200/60 group-hover:border-transparent">
              {opt.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {opt.title}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
            {opt.desc && (
              <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                {opt.desc}
              </p>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function DocumentDetailView({
  docId,
  onTestOcr,
  onBack,
}: {
  docId: string;
  onTestOcr: () => void;
  onBack: () => void;
}) {
  const details: Record<
    string,
    { title: string; why: string; rules: string[]; rejectReasons: string[] }
  > = {
    doc_aadhaar: {
      title: "Aadhaar Card (Identity & Proof of Residence)",
      why: "Mandatory for digital identification and Direct Benefit Transfer (DBT) subsidy crediting.",
      rules: [
        "Masked Aadhaar (first 8 digits hidden: XXXX-XXXX-1234) is officially accepted.",
        "Name, Date of Birth, and Gender must strictly match the applicant profile.",
        "Must be linked with your active mobile number for authentication.",
      ],
      rejectReasons: [
        "Name spelling does not match bank passbook (e.g. 'Ravi Kumar' vs 'Ravi K').",
        "Blurred photograph or damaged QR code.",
      ],
    },
    doc_pan: {
      title: "Permanent Account Number (PAN Card)",
      why: "Required by lending banks and SCAs for credit scoring and statutory tax compliance.",
      rules: [
        "Must follow standard 10-character alphanumeric format (5 letters, 4 numbers, 1 letter).",
        "Father's name and DOB must match Aadhaar records.",
      ],
      rejectReasons: [
        "Incorrect PAN number entered on application dossier.",
        "Unlinked PAN-Aadhaar record.",
      ],
    },
    doc_income: {
      title: "Family Income Certificate (Annual Household Income)",
      why: "Mandatory statutory document to prove eligibility under the ₹5.00 Lakh NSFDC ceiling.",
      rules: [
        "Must be issued by an authorized Competent Revenue Authority (Tahasildar / SDM / Revenue Inspector).",
        "Valid for the current financial year.",
        "Total household annual income must not exceed ₹5,00,000.",
      ],
      rejectReasons: [
        "Expired certificate from a previous financial year.",
        "Issued by unauthorized local councilor rather than designated revenue officer.",
      ],
    },
    doc_caste: {
      title: "Caste Certificate (Scheduled Caste / SC)",
      why: "Statutory proof of Scheduled Caste beneficiary status under Ministry of Social Justice guidelines.",
      rules: [
        "Must explicitly state 'Scheduled Caste' and mention the specific recognized sub-caste in the Presidential Order.",
        "Issued by competent district / taluk revenue authority.",
      ],
      rejectReasons: [
        "Community not listed under the state's Scheduled Caste Presidential notification.",
        "Uncertified photocopy without digital signature / official seal.",
      ],
    },
    doc_address: {
      title: "Address & Premises Proof (Shop / Unit Site)",
      why: "Required for field inspection and bank branch jurisdiction mapping.",
      rules: [
        "Electricity bill, registered rent agreement, or panchayat trade license.",
        "Must show the physical address where tailoring machines or trade will operate.",
      ],
      rejectReasons: [
        "Commercial landlord NOC missing in rented premises.",
        "Discrepancy in municipal ward or village name.",
      ],
    },
    doc_checklist: {
      title: "Complete Official Document Dossier Checklist",
      why: "Having all 6 primary documents ready accelerates loan disbursement by up to 14 days.",
      rules: [
        "1. Identity: Masked Aadhaar Card & PAN Card.",
        "2. Eligibility: Caste Certificate (SC) & Income Certificate (≤ ₹5.0L).",
        "3. Business: Machinery Quotation from an authorized equipment vendor.",
        "4. Bank: Aadhaar-linked Savings Bank Passbook copy.",
      ],
      rejectReasons: [
        "Submitting incomplete dossier causing repeated partner desk rejections.",
      ],
    },
  };

  const info = details[docId] || details.doc_aadhaar;

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
          Official KYC & Statutory Document Guide
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{info.title}</h3>
      </div>

      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-2">
        <p className="font-bold text-indigo-950">Why is this document required?</p>
        <p className="text-slate-700 leading-relaxed">{info.why}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Mandatory Guidelines
          </span>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
            {info.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Common Rejection Reasons
          </span>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
            {info.rejectReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex gap-3">
        <button
          onClick={onTestOcr}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <FileBadge className="w-4 h-4" /> 📷 Scan & Verify in Real OCR Engine
        </button>
        <button
          onClick={onBack}
          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

function EducationalExplainerView({
  topicId,
  onBack,
}: {
  topicId: string;
  onBack: () => void;
}) {
  const topics: Record<string, { title: string; summary: string; points: string[] }> = {
    emi_rates: {
      title: "Concessional Interest Rates under NSFDC Schemes",
      summary:
        "Government schemes for SC beneficiaries are heavily subsidized compared to commercial bank rates.",
      points: [
        "Mahila Samriddhi Yojana (MSY): 6.0% p.a. (Women micro-finance).",
        "Micro Credit Finance (MCF): 6.5% p.a. (Petty trade).",
        "Suvidha Loan Scheme: 8.0% p.a. (Projects up to ₹10 Lakh).",
        "Utkarsh Loan Scheme: 9.0% p.a. (Projects between ₹10L and ₹50L).",
      ],
    },
    emi_moratorium: {
      title: "What is a Moratorium Grace Period?",
      summary:
        "A moratorium is an initial repayment holiday during which you do NOT pay monthly EMIs, allowing your business to establish cashflow.",
      points: [
        "Suvidha & Utkarsh schemes include a 6-month moratorium from loan disbursement.",
        "You use this grace period to purchase machines, set up shop, and generate initial revenues.",
        "Repayment begins only after the moratorium expires.",
      ],
    },
    emi_tenure: {
      title: "Repayment Period & Schedule",
      summary:
        "Loans are structured over comfortable multi-year periods to ensure monthly EMIs remain manageable for first-generation entrepreneurs.",
      points: [
        "Micro loans (MSY / MCF): 3 years repayment.",
        "Suvidha Scheme: 5 years repayment (including 6-month moratorium).",
        "Utkarsh Term Loans: 7 years repayment (including 6-month moratorium).",
        "Repayments are made quarterly or monthly via automated bank mandates (NACH).",
      ],
    },
    emi_whatis: {
      title: "What is an Equated Monthly Installment (EMI)?",
      summary:
        "An EMI is a fixed amount you pay back to the bank every month until the entire loan and subsidized interest is fully paid off.",
      points: [
        "Part of your EMI goes toward reducing the principal amount borrowed.",
        "Part of your EMI covers the low government concessional interest.",
        "Paying on time ensures you can get larger second-tranche loans in the future.",
      ],
    },
  };

  const info = topics[topicId] || topics.emi_moratorium;

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
          Financial Literacy Explainer
        </span>
        <h3 className="text-lg font-bold text-slate-900 mt-0.5">{info.title}</h3>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">{info.summary}</p>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <span className="text-xs font-bold text-slate-800 block">Key Official Principles:</span>
        <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
          {info.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      <div className="pt-2 border-t border-slate-100 flex gap-3">
        <Link
          href="/calculator"
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
        >
          <Calculator className="w-4 h-4" /> Open Full Interactive EMI Calculator
        </Link>
        <button
          onClick={onBack}
          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Static Options
// ----------------------------------------------------------------------

const MENU_OPTIONS: OptionItem[] = [
  {
    id: "find_loan",
    title: "💰 Find the Right Loan",
    desc: "Find a scheme based on your requirement",
    icon: "💰",
  },
  {
    id: "eligibility",
    title: "✅ Check My Eligibility",
    desc: "Find out if you qualify under statutory rules",
    icon: "✅",
  },
  {
    id: "documents",
    title: "📄 Documents & KYC",
    desc: "Know which documents you need & test OCR",
    icon: "📄",
  },
  {
    id: "emi",
    title: "💳 EMI & Loan Information",
    desc: "Understand repayments & calculate monthly installments",
    icon: "💳",
  },
  {
    id: "partners",
    title: "🏦 Find a Channel Partner",
    desc: "Locate authorized SCAs and banks nearby",
    icon: "🏦",
  },
  {
    id: "tracker",
    title: "📋 Track My Application",
    desc: "Check the status of an existing loan application",
    icon: "📋",
  },
];

const PURPOSE_OPTIONS: OptionItem[] = [
  { id: "purp_business_start", title: "🏪 Start a Business", desc: "New enterprise, machinery, or shop setup", icon: "🏪" },
  { id: "purp_business_expand", title: "🏭 Expand an Existing Business", desc: "Upgrade machinery or increase working capital", icon: "🏭" },
  { id: "purp_machinery", title: "⚙️ Equipment & Machinery", desc: "Purchase commercial equipment, tools, or vehicles", icon: "⚙️" },
  { id: "purp_agri", title: "🐄 Agriculture / Allied Activity", desc: "Dairy, livestock, farming, or processing", icon: "🐄" },
  { id: "purp_petty", title: "🛠️ Small Project / Petty Trade", desc: "Vending, micro trade, service repair", icon: "🛠️" },
];

const PROJECT_TYPE_OPTIONS: OptionItem[] = [
  { id: "type_tailoring", title: "🧵 Tailoring & Garments", desc: "Sewing machines, fabric stock, boutique", icon: "🧵" },
  { id: "type_dairy", title: "🥛 Dairy & Livestock", desc: "Cattle, milk chilling, animal husbandry", icon: "🥛" },
  { id: "type_food", title: "🍱 Food Business & Bakery", desc: "Catering, processing unit, grocery store", icon: "🍱" },
  { id: "type_repair", title: "📱 Mobile & Electronics Repair", desc: "Hardware tools, testing meters, spare parts", icon: "📱" },
  { id: "type_retail", title: "🛍️ Retail & General Store", desc: "Kirana shop, consumer goods, apparel", icon: "🛍️" },
  { id: "type_transport", title: "🚚 Transport & Logistics", desc: "Commercial vehicle, delivery auto, e-rickshaw", icon: "🚚" },
];

const PROJECT_COST_OPTIONS: OptionItem[] = [
  { id: "cost_sub140", title: "Below ₹1.40 Lakh", desc: "Micro finance focus (MSY / MCF)", icon: "🏷️" },
  { id: "cost_140_500", title: "₹1.40 Lakh – ₹5.0 Lakh", desc: "Small machinery & unit setup", icon: "💰" },
  { id: "cost_500_1000", title: "₹5.0 Lakh – ₹10.0 Lakh", desc: "Suvidha Loan Scheme sweet spot", icon: "🏭" },
  { id: "cost_1000_2500", title: "₹10.0 Lakh – ₹25.0 Lakh", desc: "Utkarsh Term Loan component", icon: "🏗️" },
  { id: "cost_2500_5000", title: "₹25.0 Lakh – ₹50.0 Lakh", desc: "Maximum NSFDC Utkarsh ceiling", icon: "🏢" },
  { id: "cost_above5000", title: "More than ₹50.0 Lakh", desc: "Stand-Up India / MUDRA", icon: "⭐" },
];

const FAMILY_INCOME_OPTIONS: OptionItem[] = [
  { id: "inc_sub200", title: "Below ₹2.0 Lakh / year", desc: "High priority economic category", icon: "🟢" },
  { id: "inc_200_300", title: "₹2.0 Lakh – ₹3.0 Lakh / year", desc: "Well within NSFDC ceiling", icon: "🟢" },
  { id: "inc_300_500", title: "₹3.0 Lakh – ₹5.0 Lakh / year", desc: "Within verified ₹5.0L statutory ceiling", icon: "🟢" },
  { id: "inc_above500", title: "Above ₹5.0 Lakh / year", desc: "Exceeds NSFDC limit; routes to MUDRA", icon: "⚠️" },
];

const APPLICANT_STATUS_OPTIONS: OptionItem[] = [
  { id: "stat_woman", title: "👩 SC Woman Entrepreneur", desc: "Eligible for 6% p.a. Mahila Samriddhi", icon: "👩" },
  { id: "stat_self", title: "👨 Self-Employed / Artisan", desc: "Individual trade, craftsmanship, tailoring", icon: "👨" },
  { id: "stat_first_time", title: "🚀 First-Time Entrepreneur", desc: "Starting a new micro or small enterprise", icon: "🚀" },
  { id: "stat_owner", title: "💼 Registered Business Owner", desc: "MSME / Udyam registered enterprise", icon: "💼" },
];

const ELIGIBILITY_SELF_OPTIONS: OptionItem[] = [
  { id: "self_yes", title: "🙋 Applying for Myself", desc: "Primary business owner or borrower", icon: "🙋" },
  { id: "self_other", title: "👥 Applying for a Family Member", desc: "Parent, spouse, or sibling", icon: "👥" },
];

const CATEGORY_OPTIONS: OptionItem[] = [
  { id: "cat_sc", title: "🏷️ Scheduled Caste (SC)", desc: "Primary target beneficiary of NSFDC", icon: "🏷️" },
  { id: "cat_st", title: "🏷️ Scheduled Tribe (ST)", desc: "National Scheduled Tribes Finance Corp", icon: "🏷️" },
  { id: "cat_other", title: "🏷️ Other Category", desc: "Routes to MUDRA or Nationalized Bank", icon: "🏷️" },
];

const AGE_OPTIONS: OptionItem[] = [
  { id: "age_18_60", title: "18 to 60 Years", desc: "Meets central statutory age window", icon: "✓" },
  { id: "age_outside", title: "Below 18 or Above 60 Years", desc: "Outside statutory lending limits", icon: "⚠️" },
];

const DOCUMENT_OPTIONS: OptionItem[] = [
  { id: "doc_aadhaar", title: "🪪 Aadhaar Card", desc: "Identity & address proof (masked allowed)", icon: "🪪" },
  { id: "doc_pan", title: "💳 PAN Card", desc: "Income tax & bank verification", icon: "💳" },
  { id: "doc_income", title: "📜 Income Certificate", desc: "Tahasildar issued (≤ ₹5.0 Lakh)", icon: "📜" },
  { id: "doc_caste", title: "🏷️ Caste Certificate (SC)", desc: "Competent authority verified", icon: "🏷️" },
  { id: "doc_address", title: "🏠 Address / Premises Proof", desc: "Rent agreement or electricity bill", icon: "🏠" },
  { id: "doc_checklist", title: "📋 Complete Dossier Checklist", desc: "View all 6 mandatory certificates", icon: "📋" },
];

const EMI_MENU_OPTIONS: OptionItem[] = [
  { id: "emi_calc", title: "💰 Calculate Monthly EMI", desc: "Select loan amount and tenure", icon: "💰" },
  { id: "emi_rates", title: "📈 Interest Rates (6% to 9%)", desc: "Concessional rates comparison", icon: "📈" },
  { id: "emi_moratorium", title: "⏳ What is a Moratorium?", desc: "6-month repayment holiday explained", icon: "⏳" },
  { id: "emi_tenure", title: "📅 Repayment Periods", desc: "3 to 7 years schedule overview", icon: "📅" },
  { id: "emi_whatis", title: "💡 What is an EMI?", desc: "Simple explanation for beginners", icon: "💡" },
];

const EMI_AMOUNT_OPTIONS: OptionItem[] = [
  { id: "amt_50000", title: "₹50,000", desc: "Petty trade micro finance", icon: "💵" },
  { id: "amt_100000", title: "₹1.0 Lakh", desc: "Small business start", icon: "💵" },
  { id: "amt_200000", title: "₹2.0 Lakh", desc: "Equipment & tools purchase", icon: "💵" },
  { id: "amt_300000", title: "₹3.0 Lakh", desc: "Tailoring or processing unit", icon: "💵" },
  { id: "amt_500000", title: "₹5.0 Lakh", desc: "Medium commercial enterprise", icon: "💵" },
  { id: "amt_1000000", title: "₹10.0 Lakh", desc: "Maximum Suvidha loan limit", icon: "💵" },
];

const EMI_TENURE_OPTIONS: OptionItem[] = [
  { id: "tenure_1", title: "1 Year (12 Months)", desc: "Rapid short-term repayment", icon: "📅" },
  { id: "tenure_3", title: "3 Years (36 Months)", desc: "Standard micro loan period", icon: "📅" },
  { id: "tenure_5", title: "5 Years (60 Months)", desc: "Suvidha recommended term (with 6 Mo grace)", icon: "📅" },
  { id: "tenure_7", title: "7 Years (84 Months)", desc: "Utkarsh term loan maximum", icon: "📅" },
];

const PARTNER_FILTER_OPTIONS: OptionItem[] = [
  { id: "sca", title: "📍 State Channelising Agencies (SCAs)", desc: "OSFDC & state corporation offices", icon: "📍" },
  { id: "psb", title: "🏦 Public Sector Banks (PSBs)", desc: "State Bank of India, Punjab National Bank", icon: "🏦" },
  { id: "rrb", title: "🌾 Regional Rural Banks (RRBs)", desc: "Odisha Gramya Bank & rural branches", icon: "🌾" },
];

const TRACKER_SCHEME_OPTIONS: OptionItem[] = [
  { id: "track_suvidha", title: "🏪 Small Business Loan (Suvidha)", desc: "Ref: #SHK-2026-8941", icon: "🏪" },
  { id: "track_msy", title: "👩‍💼 Women Micro-Finance (MSY)", desc: "Ref: #SHK-2026-4402", icon: "👩‍💼" },
  { id: "track_mcf", title: "🛍️ Petty Trade / Micro Credit (MCF)", desc: "Ref: #SHK-2026-1189", icon: "🛍️" },
];
