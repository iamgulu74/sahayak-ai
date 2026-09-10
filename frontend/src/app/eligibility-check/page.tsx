'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Calculator,
  MapPin,
  ShieldCheck,
  Sparkles,
  Info
} from "lucide-react";
import { SCHEMES, getSchemeById, formatLakh } from "@/lib/schemes-data";
import { INDIAN_STATES } from "@/lib/partner-router";
import { useAuth } from "@/contexts/AuthContext";

function EligibilityCheckContent() {
  const searchParams = useSearchParams();
  const initialSchemeId = searchParams.get("scheme") || "nsfdc-suvidha";
  const { userProfile } = useAuth();

  const [selectedSchemeId, setSelectedSchemeId] = useState(initialSchemeId);
  const [category, setCategory] = useState<string>(userProfile?.category || "SC");
  const [gender, setGender] = useState<string>(userProfile?.gender || "male");
  const [age, setAge] = useState<number>(userProfile?.age || 27);
  const [incomeLakh, setIncomeLakh] = useState<number>(userProfile?.annualIncomeLakh || 3.5);
  const [loanRequiredLakh, setLoanRequiredLakh] = useState<number>(userProfile?.loanRequiredLakh || 2.7);
  const [state, setState] = useState<string>(userProfile?.state || "Odisha");

  const activeSchemes = SCHEMES.filter((s) => s.status === "active");
  const currentScheme = getSchemeById(selectedSchemeId) || activeSchemes[0];

  // Evaluate eligibility using deterministic rule engine
  const isSC = category === "SC";
  const isCategoryEligible = currentScheme.eligibleCategories.includes(category);
  const isIncomeEligible = incomeLakh <= currentScheme.incomeLimitLakh;
  const isAgeEligible = age >= currentScheme.minAge && age <= currentScheme.maxAge;
  const isGenderEligible =
    currentScheme.genderCriteria === "women_only" ? gender === "female" : true;
  const isLoanFit =
    loanRequiredLakh >= currentScheme.minLoanLakh &&
    loanRequiredLakh <= currentScheme.maxLoanLakh;
  const isLoanBorderline =
    !isLoanFit && loanRequiredLakh <= currentScheme.maxLoanLakh * 1.25;

  const allHardGatesPassed =
    isCategoryEligible && isIncomeEligible && isAgeEligible && isGenderEligible;

  let overallStatus: "eligible" | "potential" | "ineligible" = "ineligible";
  if (allHardGatesPassed && isLoanFit) {
    overallStatus = "eligible";
  } else if (allHardGatesPassed && (!isLoanFit || incomeLakh >= currentScheme.incomeLimitLakh * 0.9)) {
    overallStatus = "potential";
  } else {
    overallStatus = "ineligible";
  }

  const handlePreloadRavi = () => {
    setSelectedSchemeId("nsfdc-suvidha");
    setCategory("SC");
    setGender("male");
    setAge(27);
    setIncomeLakh(3.5);
    setLoanRequiredLakh(2.7);
    setState("Odisha");
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Standalone Eligibility Checker
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Check Your Scheme Eligibility
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Already know which scheme you want? Test your eligibility directly against official rules with instant explainable results.
          </p>
        </div>

        {/* Demo Scenario Pill */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Quick Test Scenario</p>
              <p className="text-xs text-slate-600">Test Ravi’s profile (Odisha, SC, ₹3.5L Income, ₹2.7L Loan)</p>
            </div>
          </div>
          <button
            onClick={handlePreloadRavi}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-all whitespace-nowrap"
          >
            Load Ravi’s Profile
          </button>
        </div>

        {/* Form & Checker Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
                1. Select Target Scheme
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Government Scheme
                </label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  {activeSchemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shortName} ({s.implementingBody || "Central"})
                    </option>
                  ))}
                </select>
              </div>

              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pt-2 pb-2">
                2. Applicant Details
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Social Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General</option>
                    <option value="Minority">Minority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={17}
                    max={75}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Annual Family Income (₹ Lakh)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">₹{incomeLakh} Lakh/yr</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={12.0}
                  step={0.1}
                  value={incomeLakh}
                  onChange={(e) => setIncomeLakh(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>₹0.5L</span>
                  <span>Ceiling: ₹{currentScheme.incomeLimitLakh}L</span>
                  <span>₹12L</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Loan Amount Required (₹ Lakh)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">₹{loanRequiredLakh} Lakh</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={Math.max(10, currentScheme.maxLoanLakh * 1.2)}
                  step={0.1}
                  value={loanRequiredLakh}
                  onChange={(e) => setLoanRequiredLakh(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Min: ₹{currentScheme.minLoanLakh}L</span>
                  <span>Max: ₹{currentScheme.maxLoanLakh}L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results & Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status Card */}
            <motion.div
              key={`${selectedSchemeId}-${category}-${gender}-${incomeLakh}-${age}-${loanRequiredLakh}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-6 border shadow-sm transition-all ${
                overallStatus === "eligible"
                  ? "bg-emerald-50/80 border-emerald-200"
                  : overallStatus === "potential"
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-red-50/80 border-red-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white shadow-sm flex-shrink-0">
                  {overallStatus === "eligible" && (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  )}
                  {overallStatus === "potential" && (
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  )}
                  {overallStatus === "ineligible" && (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        overallStatus === "eligible"
                          ? "bg-emerald-100 text-emerald-800"
                          : overallStatus === "potential"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {overallStatus === "eligible"
                        ? "✅ Fully Eligible"
                        : overallStatus === "potential"
                        ? "⚠️ Potentially Eligible"
                        : "❌ Not Eligible"}
                    </span>
                    <span className="text-xs text-slate-500">
                      Rule Engine Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {currentScheme.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {overallStatus === "eligible"
                      ? "All hard eligibility criteria (social category, income limit, age, and loan scale) are completely satisfied."
                      : overallStatus === "potential"
                      ? "Basic social criteria match, but require specific supporting documents or loan parameter adjustment."
                      : "One or more deterministic eligibility requirements are not met for this specific scheme."}
                  </p>
                </div>
              </div>

              {/* Criteria Checkpoints Table */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 space-y-2.5">
                {/* 1. Category */}
                <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl">
                  <span className="font-semibold text-slate-700">Social Category</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">You: {category} | Required: {currentScheme.eligibleCategories.join(", ")}</span>
                    {isCategoryEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* 2. Income */}
                <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl">
                  <span className="font-semibold text-slate-700">Income Limit</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">You: ₹{incomeLakh}L | Max: ₹{currentScheme.incomeLimitLakh}L</span>
                    {isIncomeEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* 3. Gender */}
                <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl">
                  <span className="font-semibold text-slate-700">Gender Criteria</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      {currentScheme.genderCriteria === "women_only" ? "Women Only" : "All Genders"}
                    </span>
                    {isGenderEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* 4. Age */}
                <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl">
                  <span className="font-semibold text-slate-700">Age Range</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">You: {age} yrs | Limit: {currentScheme.minAge}–{currentScheme.maxAge} yrs</span>
                    {isAgeEligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* 5. Loan Fit */}
                <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl">
                  <span className="font-semibold text-slate-700">Loan Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">You: ₹{loanRequiredLakh}L | Range: ₹{currentScheme.minLoanLakh}–{currentScheme.maxLoanLakh}L</span>
                    {isLoanFit ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isLoanBorderline ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap gap-2.5">
                {overallStatus !== "ineligible" ? (
                  <>
                    <Link
                      href={`/schemes/${currentScheme.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      Scheme Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/calculator?scheme=${currentScheme.id}&loan=${loanRequiredLakh}`}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                    >
                      <Calculator className="w-3.5 h-3.5 text-indigo-600" /> Calculate EMI
                    </Link>
                    <Link
                      href={`/partners?scheme=${currentScheme.id}&state=${state}`}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Find Channel Partner
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/recommendations"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    View All Matching Schemes For You <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Scheme Quick Specs Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Verified Scheme Details
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentScheme.description}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800">{currentScheme.interestRatePercent}% p.a.</div>
                  <div className="text-[10px] text-slate-500">Interest Rate</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800">{currentScheme.financingPercent}%</div>
                  <div className="text-[10px] text-slate-500">Financing Share</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800">{currentScheme.moratoriumMonthsMin} Months</div>
                  <div className="text-[10px] text-slate-500">Moratorium</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-800">{currentScheme.repaymentYears} Years</div>
                  <div className="text-[10px] text-slate-500">Repayment Period</div>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Nodal: {currentScheme.nodal}</span>
                <a
                  href={currentScheme.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Official Source ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EligibilityCheckPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-24 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading Eligibility Checker...</p>
        </div>
      }
    >
      <EligibilityCheckContent />
    </Suspense>
  );
}
