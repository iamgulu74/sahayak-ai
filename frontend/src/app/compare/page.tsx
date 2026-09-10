'use client';
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GitCompare, Plus, X, CheckCircle, ArrowRight } from "lucide-react";
import { SCHEMES, Scheme } from "@/lib/schemes-data";
import { useSearchParams } from "next/navigation";

function CompareContent() {
  const searchParams = useSearchParams();
  const initialScheme = searchParams.get("scheme");
  const [selected, setSelected] = useState<string[]>(initialScheme ? [initialScheme] : []);

  const addScheme = (id: string) => {
    if (selected.length >= 3 || selected.includes(id)) return;
    setSelected([...selected, id]);
  };
  const removeScheme = (id: string) => setSelected(selected.filter(s => s !== id));
  const schemes = selected.map(id => SCHEMES.find(s => s.id === id)!).filter(Boolean);

  const ROWS = [
    { label: "Max Loan Amount", key: (s: Scheme) => `₹${s.maxLoanLakh} Lakh` },
    { label: "Min Loan Amount", key: (s: Scheme) => `₹${s.minLoanLakh} Lakh` },
    { label: "Financing %", key: (s: Scheme) => `${s.financingPercent}%` },
    { label: "Interest Rate", key: (s: Scheme) => `${s.interestRatePercent}% p.a.` },
    { label: "Moratorium", key: (s: Scheme) => `${s.moratoriumMonthsMin}–${s.moratoriumMonthsMax} months` },
    { label: "Repayment Period", key: (s: Scheme) => `${s.repaymentYears} years` },
    { label: "Income Limit", key: (s: Scheme) => `₹${s.incomeLimitLakh} Lakh/yr` },
    { label: "Age Range", key: (s: Scheme) => `${s.minAge}–${s.maxAge} years` },
    { label: "Eligible Categories", key: (s: Scheme) => s.eligibleCategories.join(", ") },
    { label: "Partner Types", key: (s: Scheme) => s.partnerTypes.join(", ") },
    { label: "States Covered", key: (s: Scheme) => s.states === "all" ? "All India" : "Selected States" },
  ];

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-100">Compare Schemes</h1>
          </div>
          <p className="text-surface-400">Select up to 3 schemes to compare side by side. The best match based on common SC criteria is highlighted.</p>
        </motion.div>

        {/* Scheme Selector */}
        {selected.length < 3 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="text-sm font-semibold text-surface-300 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" />Add a scheme to compare</h3>
            <div className="flex flex-wrap gap-2">
              {SCHEMES.filter(s => s.status === "active" && !selected.includes(s.id)).map(s => (
                <button key={s.id} onClick={() => addScheme(s.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-surface-700/50 text-surface-300 hover:border-primary-500/40 hover:text-primary-300 transition-all bg-surface-800/40 flex items-center gap-1.5">
                  <span>{s.icon}</span>{s.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        {schemes.length === 0 && (
          <div className="glass-card p-10 text-center">
            <GitCompare className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-surface-300 mb-2">No schemes selected</h3>
            <p className="text-surface-500 mb-6">Add schemes above or start from a scheme details page.</p>
            <Link href="/schemes" className="btn-primary">Browse Schemes</Link>
          </div>
        )}

        {schemes.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
            {/* Scheme headers */}
            <div className="grid border-b border-surface-800" style={{ gridTemplateColumns: `180px repeat(${schemes.length}, 1fr)` }}>
              <div className="p-4 bg-surface-900/60" />
              {schemes.map((scheme, i) => (
                <div key={scheme.id} className={`p-5 border-l border-surface-800 ${i === 0 ? "bg-primary-500/10" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scheme.color} flex items-center justify-center text-xl`}>{scheme.icon}</div>
                    <button onClick={() => removeScheme(scheme.id)} className="text-surface-600 hover:text-surface-300 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {i === 0 && <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs mb-2 block w-fit">Best Value</span>}
                  <h3 className="text-sm font-semibold text-surface-100 leading-tight">{scheme.name}</h3>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            {ROWS.map((row, ri) => (
              <div key={row.label} className={`grid border-b border-surface-800/50 ${ri % 2 === 0 ? "bg-surface-900/20" : ""}`}
                style={{ gridTemplateColumns: `180px repeat(${schemes.length}, 1fr)` }}>
                <div className="p-4 text-surface-400 text-sm font-medium flex items-center">{row.label}</div>
                {schemes.map((scheme, si) => (
                  <div key={scheme.id} className={`p-4 border-l border-surface-800/50 text-sm font-medium ${si === 0 ? "text-primary-300 bg-primary-500/5" : "text-surface-200"}`}>
                    {row.key(scheme)}
                  </div>
                ))}
              </div>
            ))}

            {/* Actions row */}
            <div className="grid border-t border-surface-700" style={{ gridTemplateColumns: `180px repeat(${schemes.length}, 1fr)` }}>
              <div className="p-4" />
              {schemes.map((scheme) => (
                <div key={scheme.id} className="p-4 border-l border-surface-800 flex flex-col gap-2">
                  <Link href={`/schemes/${scheme.id}`} className="btn-primary text-xs py-2 justify-center">View Details</Link>
                  <Link href={`/calculator?scheme=${scheme.id}`} className="btn-secondary text-xs py-2 justify-center">Calculate EMI</Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-center text-surface-400">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
