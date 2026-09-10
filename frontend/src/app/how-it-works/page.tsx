'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Sparkles, Calculator, MapPin, ChevronRight, ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01", title: "Tell Us Your Need", icon: <Users className="w-8 h-8" />, color: "from-primary-500 to-primary-700",
    details: [
      "Fill a simple 3-step form with your background, purpose, and financial details",
      "Describe your business need in plain language — our AI understands even if you don't know the official category names",
      "All fields have tooltips explaining why each piece of information is needed",
      "Auto-saves so you can pick up where you left off",
    ]
  },
  {
    num: "02", title: "AI Matches You", icon: <Sparkles className="w-8 h-8" />, color: "from-accent-500 to-accent-700",
    details: [
      "Hard eligibility rules (income, category, age, purpose) are checked first — no scheme that you genuinely don't qualify for is ranked above eligible ones",
      "Semantic AI scores how well your stated need aligns with each scheme's purpose",
      "Every match score decomposes into named criteria — Income ✓, Category ✓, Purpose ✓, Project Cost ✓",
      "Ineligible schemes are shown separately with the specific failed criterion named clearly",
    ]
  },
  {
    num: "03", title: "Calculate Your Finances", icon: <Calculator className="w-8 h-8" />, color: "from-info-500 to-info-700",
    details: [
      "Interactive EMI calculator pre-fills scheme-specific interest rate and moratorium",
      "See eligible loan amount, your own contribution, monthly EMI, and total repayment",
      "Adjust loan amount, tenure, and moratorium to explore different scenarios",
      "All outputs clearly labeled as ESTIMATES — not official quotes",
    ]
  },
  {
    num: "04", title: "Find Your Partner", icon: <MapPin className="w-8 h-8" />, color: "from-success-500 to-success-700",
    details: [
      "Partners are ranked by scheme compatibility (40%), routing eligibility (35%), and geographic distance (25%)",
      "Never distance alone — a closer partner who can't process your scheme is ranked lower",
      "Routing status (Available / Limited / Restricted) shown with a Demo Data label until connected to official feeds",
      "Get directions via OpenStreetMap and contact details to call ahead before visiting",
    ]
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-surface-100 mb-4">How Sahayak AI Works</h1>
          <p className="text-xl text-surface-400 max-w-2xl mx-auto">From your first question to your nearest authorized partner — a transparent, step-by-step process with explainable AI at every stage.</p>
        </motion.div>

        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 text-center md:text-left">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-glow-lg mx-auto md:mx-0 mb-3`}>
                  {step.icon}
                </div>
                <div className="text-5xl font-black text-surface-800/60">{step.num}</div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-surface-100 mb-4">{step.title}</h2>
                <ul className="space-y-3">
                  {step.details.map((d, j) => (
                    <li key={j} className="flex items-start gap-3 text-surface-300">
                      <ChevronRight className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-16 glass-card p-10">
          <h2 className="text-3xl font-bold text-surface-100 mb-4">Ready to Get Started?</h2>
          <p className="text-surface-400 mb-8">Answer 3 quick questions and let Sahayak AI do the rest.</p>
          <Link href="/questionnaire" className="btn-primary text-lg px-10 py-4 shadow-glow-lg">
            <Sparkles className="w-5 h-5" /> Find My Scheme <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
