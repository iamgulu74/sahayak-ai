'use client';
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Calculator, Info, TrendingDown, PieChart, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calculate, formatCurrency, formatCurrencyExact, CalculatorInputs } from "@/lib/calculator";
import { SCHEMES } from "@/lib/schemes-data";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CalculatorContent() {
  const searchParams = useSearchParams();
  const schemeId = searchParams.get("scheme");
  const selectedScheme = schemeId ? SCHEMES.find(s => s.id === schemeId) : null;

  const loanParam = searchParams.get("loan");
  const parsedLoanRs = loanParam ? (Number(loanParam) < 100 ? Number(loanParam) * 100000 : Number(loanParam)) : null;

  const [inputs, setInputs] = useState<CalculatorInputs>({
    projectCostRs: parsedLoanRs ? Math.round(parsedLoanRs / 0.9) : (selectedScheme ? 300000 : 300000),
    loanAmountRs: parsedLoanRs || (selectedScheme ? 270000 : 270000),
    interestRatePercent: selectedScheme?.interestRatePercent || 8.0,
    tenureYears: selectedScheme?.repaymentYears || 5,
    moratoriumMonths: selectedScheme?.moratoriumMonthsMin || 6,
  });

  const [results, setResults] = useState(calculate(inputs));
  const [showTable, setShowTable] = useState(false);

  useEffect(() => { setResults(calculate(inputs)); }, [inputs]);
  const upd = (key: keyof CalculatorInputs, val: number) => setInputs(p => ({ ...p, [key]: val }));

  const chartData = results.repaymentSchedule.map(r => ({
    year: `Yr ${r.year}`,
    Principal: Math.round(r.principal / 1000),
    Interest: Math.round(r.interest / 1000),
  }));

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info-500 to-primary-600 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-surface-100">Financial Calculator</h1>
          </div>
          {selectedScheme && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-surface-400 text-sm">Pre-filled for:</span>
              <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30">{selectedScheme.name}</span>
            </div>
          )}
          <div className="flex items-start gap-2 p-3 bg-warning-500/10 border border-warning-500/20 rounded-xl max-w-2xl">
            <AlertTriangle className="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
            <p className="text-warning-400 text-sm">
              <strong>Estimate Only:</strong> These calculations are indicative. Final loan amount, EMI, interest rate, and repayment terms are determined by the authorized Channel Partner under scheme guidelines.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-surface-100 mb-5">Loan Details</h2>
              {[
                { label: "Project Cost", key: "projectCostRs" as const, min: 10000, max: 50000000, step: 10000, prefix: "₹" },
                { label: "Loan Amount", key: "loanAmountRs" as const, min: 5000, max: 50000000, step: 5000, prefix: "₹" },
              ].map((field) => (
                <div key={field.key} className="mb-4">
                  <label className="block text-sm font-medium text-surface-300 mb-2 flex justify-between">
                    <span>{field.label}</span>
                    <span className="text-primary-400 font-semibold">{formatCurrency(inputs[field.key])}</span>
                  </label>
                  <input type="range" min={field.min} max={field.max} step={field.step} value={inputs[field.key]}
                    onChange={(e) => upd(field.key, Number(e.target.value))}
                    className="w-full accent-primary-500 cursor-pointer" />
                  <input type="number" value={inputs[field.key]} onChange={(e) => upd(field.key, Number(e.target.value))}
                    className="input-field mt-2 text-sm py-2" />
                </div>
              ))}
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-surface-100 mb-1">Loan Terms</h2>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2 flex justify-between">
                  <span>Interest Rate</span>
                  <span className="text-primary-400 font-semibold">{inputs.interestRatePercent}% p.a.</span>
                </label>
                <input type="range" min={1} max={24} step={0.25} value={inputs.interestRatePercent}
                  onChange={(e) => upd("interestRatePercent", Number(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2 flex justify-between">
                  <span>Repayment Period</span>
                  <span className="text-primary-400 font-semibold">{inputs.tenureYears} Years</span>
                </label>
                <input type="range" min={1} max={15} step={1} value={inputs.tenureYears}
                  onChange={(e) => upd("tenureYears", Number(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2 flex justify-between">
                  <span className="flex items-center gap-1">Moratorium <Info className="w-3 h-3 text-surface-500" /></span>
                  <span className="text-primary-400 font-semibold">{inputs.moratoriumMonths} months</span>
                </label>
                <input type="range" min={0} max={24} step={1} value={inputs.moratoriumMonths}
                  onChange={(e) => upd("moratoriumMonths", Number(e.target.value))}
                  className="w-full accent-primary-500 cursor-pointer" />
                <p className="text-surface-500 text-xs mt-1">Grace period before EMI starts. Interest may accrue during moratorium.</p>
              </div>
              {selectedScheme && (
                <div className="text-xs text-surface-500 pt-2 border-t border-surface-800">
                  Scheme allows {selectedScheme.moratoriumMonthsMin}–{selectedScheme.moratoriumMonthsMax} months moratorium
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Key outputs */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Monthly EMI", value: formatCurrencyExact(results.monthlyEMI), sublabel: `after ${inputs.moratoriumMonths}m moratorium`, color: "from-primary-500 to-accent-500", big: true },
                { label: "Own Contribution", value: formatCurrency(results.ownContributionRs), sublabel: `${Math.round(results.ownContributionRs / inputs.projectCostRs * 100)}% of project cost`, color: "from-warning-500 to-orange-500", big: false },
                { label: "Total Interest", value: formatCurrency(results.totalInterestRs), sublabel: "over loan tenure", color: "from-danger-500 to-rose-500", big: false },
                { label: "Total Repayment", value: formatCurrency(results.totalRepaymentRs), sublabel: `over ${inputs.tenureYears} years`, color: "from-success-500 to-emerald-500", big: false },
              ].map((item) => (
                <div key={item.label} className={`glass-card p-5 ${item.big ? "col-span-2 md:col-span-1" : ""}`}>
                  <div className={`text-2xl md:text-3xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                    {item.value}
                  </div>
                  <div className="text-surface-200 font-semibold text-sm">{item.label}</div>
                  <div className="text-surface-500 text-xs mt-0.5">{item.sublabel}</div>
                </div>
              ))}
            </div>

            {/* Loan breakdown bar */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" /> Loan Composition</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-surface-400 mb-1">
                    <span>Principal</span><span>{formatCurrency(results.eligibleLoanRs)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 progress-fill"
                      style={{ width: `${Math.round(results.eligibleLoanRs / results.totalRepaymentRs * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-surface-400 mb-1">
                    <span>Total Interest</span><span>{formatCurrency(results.totalInterestRs)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-surface-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-danger-500 to-rose-500 progress-fill"
                      style={{ width: `${Math.round(results.totalInterestRs / results.totalRepaymentRs * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-surface-300 mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Yearly Repayment Schedule (₹ Thousands)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#f8fafc" }} />
                  <Bar dataKey="Principal" stackId="a" fill="#6366f1" radius={[0,0,4,4]} />
                  <Bar dataKey="Interest" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-surface-400"><div className="w-3 h-3 rounded-sm bg-primary-500" />Principal</div>
                <div className="flex items-center gap-1.5 text-xs text-surface-400"><div className="w-3 h-3 rounded-sm bg-danger-500" />Interest</div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {selectedScheme ? (
                <Link href={`/partners?scheme=${selectedScheme.id}`} className="btn-primary text-sm py-2 px-5">Find a Channel Partner →</Link>
              ) : (
                <Link href="/questionnaire" className="btn-primary text-sm py-2 px-5">Get Scheme Recommendations →</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-center text-surface-400">Loading calculator...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
