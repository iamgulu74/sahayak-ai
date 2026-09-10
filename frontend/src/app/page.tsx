'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  Users,
  Calculator,
  MapPin,
  Shield,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Star,
  Building2,
  Landmark,
  Banknote,
  Zap,
  ShieldCheck,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { SCHEMES, getActiveSchemes } from "@/lib/schemes-data";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import TutorialDemoModal from "@/components/TutorialDemoModal";

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "1. Tell Us Your Need",
    desc: "Speak or enter 3 simple questions about your profile, business idea, and financial requirement.",
    icon: <Users className="w-6 h-6" />,
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    step: "02",
    title: "2. Explainable AI Matching",
    desc: "Our deterministic rule engine + semantic matching checks hard criteria with zero hallucination.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    step: "03",
    title: "3. Auto-Rerouted Partner",
    desc: "Connects you to nearest SCAs and banks, automatically rerouting away from congested branches.",
    icon: <MapPin className="w-6 h-6" />,
    color: "from-sky-500 to-sky-600",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
  {
    step: "04",
    title: "4. Track All 7 Stages",
    desc: "Self-manage your journey from application submission to final machinery fund disbursement.",
    icon: <Clock className="w-6 h-6" />,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
];

const TRUST_STATS = [
  { value: 8, suffix: " Verified", label: "Central & State Schemes", icon: <Shield className="w-5 h-5" />, color: "text-indigo-500", bg: "bg-indigo-50" },
  { value: 5, suffix: ".0 Lakh", label: "Official Income Ceiling", icon: <Banknote className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-50" },
  { value: 90, suffix: "%", label: "Max Scheme Financing", icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-50" },
  { value: 100, suffix: "%", label: "Grounded & Free to Apply", icon: <ShieldCheck className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function LandingPage() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const { t } = useLanguage();
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const activeSchemes = getActiveSchemes();

  return (
    <div className="overflow-x-hidden bg-[#fafaf9]">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #4c1d95 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          }}
        />

        <div className="relative section-container pt-28 pb-20 md:pt-36 md:pb-28 text-center">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-white/95 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI-Driven Scheme Discovery & Intelligent Routing for Marginalized Entrepreneurs
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight font-headline"
          >
            Find Government Schemes
            <span className="block text-indigo-200">Built for Your Enterprise</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl md:text-2xl text-white/85 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            <strong>The Right Scheme. The Right Partner. The Right Path.</strong>
            <br className="hidden sm:inline" />
            Transparent eligibility matching, automatic partner re-routing, and document readiness with zero hallucination.
          </motion.p>

          {/* CTAs Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12"
          >
            <button
              onClick={() => setTutorialOpen(true)}
              id="hero-cta-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              {t.watchTutorialBtn || "▶ Watch Tutorial Demo (0-100% Process)"}
            </button>

            <Link
              href="/assistant"
              id="hero-cta-guided-assistant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-purple-500 via-indigo-600 to-indigo-700 hover:from-purple-600 hover:to-indigo-800 text-white shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
              Guided AI Assistant (Tap to Decide)
            </Link>

            <Link
              href="/questionnaire"
              id="hero-cta-find-scheme"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white text-indigo-700 shadow-lg hover:bg-slate-50 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Find My Schemes
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/schemes"
              id="hero-cta-explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white border border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              Explore All Schemes
            </Link>
          </motion.div>

          {/* Pipeline Badges */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-2 md:gap-3 flex-wrap text-xs text-white/90"
          >
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              Deterministic Rule Engine
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40 hidden sm:inline" />
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              Verified NSFDC Circulars
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40 hidden sm:inline" />
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              Live Auto-Rerouting (OSFDC)
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40 hidden sm:inline" />
            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              Dual-Engine Real OCR
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="relative -mt-8 section-container z-10">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="text-center sm:text-left flex items-center gap-3.5 p-2">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} flex-shrink-0 mx-auto sm:mx-0`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Banner: Button-Based Guided AI Assistant */}
      <section className="section-container pt-12">
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-indigo-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                NEW FEATURE • 100% BUTTON-BASED ASSISTANT
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-headline mb-2 text-white">
                Stuck or Not Sure Where to Start? Tap, Don&apos;t Type.
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                Experience our Flipkart-style tap-by-tap guided decision assistant. No open typing or confusing chatbot hallucinations. Click structured options to find matching loans, verify criteria, check required documents, and calculate monthly EMIs.
              </p>
            </div>
            <Link
              href="/assistant"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-extrabold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2 flex-shrink-0"
            >
              Open Guided Assistant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Navigation Tiles (New v1.1 Hub) */}
      <section className="section-container py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 mb-2">
            Complete Toolkit for Marginalized Entrepreneurs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything needed to eliminate discovery friction, prepare paperwork, check eligibility, and avoid predatory agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Eligibility Checker */}
          <Link
            href="/eligibility-check"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Eligibility Checker
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct yes/no verification against hard constraints (income, category, age, loan limit) for any chosen scheme.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-4">
              Check Eligibility →
            </span>
          </Link>

          {/* Card 2: OCR & Documents */}
          <Link
            href="/documents"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Document OCR Scanner
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check required paperwork and scan sample identity cards to catch name and DOB spelling discrepancies.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-4">
              Test OCR Scanner →
            </span>
          </Link>

          {/* Card 3: Project Cost Calculator */}
          <Link
            href="/project-cost"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Project Cost Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Itemize sewing machines, raw materials, and shop advances to automatically build your project total.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-4">
              Build Cost Estimate →
            </span>
          </Link>

          {/* Card 4: Partner Locator & Auto-Reroute */}
          <Link
            href="/partners"
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Intelligent Partner Routing
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Live fund availability monitoring (🟢/🟡/🔴) with automatic re-routing when a branch faces quota limits.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-4">
              Explore Partners →
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Verified Schemes */}
      <section className="section-container py-12 bg-white/60 rounded-3xl border border-slate-200/60 my-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Verified Government Sourcing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Active NSFDC & Central Schemes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Reflecting the official ₹5.0 Lakh annual family income ceiling (effective 07.01.2026).
            </p>
          </div>
          <Link
            href="/schemes"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All {activeSchemes.length} Schemes <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeSchemes.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center text-xl shadow-xs`}
                  >
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Verified
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{s.name}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{s.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Max Loan</span>
                    <span className="font-bold text-slate-800">₹{s.maxLoanLakh} Lakh</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Interest Rate</span>
                    <span className="font-bold text-indigo-600">{s.interestRatePercent}% p.a.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/schemes/${s.id}`}
                  className="text-xs font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/calculator?scheme=${s.id}`}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  EMI →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works (4 Steps) */}
      <section className="section-container py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 mb-2">
            How Sahayak AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From first-time discovery to official fund disbursement at your district SCA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.step}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${step.bg} ${step.text} flex items-center justify-center mb-4 font-bold`}
              >
                {step.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Anti-Fraud Citizen Shield */}
      <section className="section-container py-8 mb-12">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-600 text-white rounded-2xl flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-red-950">
                Beware of Unauthorized Loan Agents & Fake Sanction Letters
              </h3>
              <p className="text-xs sm:text-sm text-red-800 mt-1 max-w-2xl leading-relaxed">
                All government scheme applications and portal submissions are <strong>100% free</strong>. Never pay upfront commissions or fees to private brokers.
              </p>
            </div>
          </div>
          <Link
            href="/fraud-protection"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all whitespace-nowrap"
          >
            Visit Fraud Prevention Center →
          </Link>
        </div>
      </section>

      {/* Full Process 0% to 100% Tutorial Demo Modal */}
      <TutorialDemoModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
}
