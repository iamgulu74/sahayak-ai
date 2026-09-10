'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Calculator, MapPin, Filter, Send } from "lucide-react";
import { SCHEMES, Scheme, getSchemeById } from "@/lib/schemes-data";
import ApplySchemeModal from "@/components/ApplySchemeModal";

const PURPOSES = ["All", "Business Start", "Business Expansion", "Machinery", "Working Capital", "Agriculture"];
const CATEGORIES = ["All", "Micro", "Small", "Medium", "Agriculture"];

export default function SchemesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <SchemesContent />
    </Suspense>
  );
}

function SchemesContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<Scheme | null>(null);

  useEffect(() => {
    const applyParam = searchParams.get("apply");
    if (applyParam) {
      const found = getSchemeById(applyParam);
      if (found) {
        setSelectedSchemeForApply(found);
      }
    }
  }, [searchParams]);

  const filtered = SCHEMES.filter((s) => {
    if (s.status === "discontinued") return false;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.includes(search.toLowerCase()));
    const matchPurpose = purpose === "All" || s.purpose.some(p => p.replace("_", " ") === purpose.toLowerCase());
    const matchCategory = category === "All" || s.category.some(c => c === category.toLowerCase());
    return matchSearch && matchPurpose && matchCategory;
  });

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-surface-100 mb-3">Explore Schemes</h1>
            <p className="text-surface-400 text-lg">All verified government financial schemes for SC entrepreneurs — browse, filter, and find your match.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-surface-400 font-medium">Raw Seed Data:</span>
            <a href="/data/schemes.json" target="_blank" className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-surface-700 transition-colors">
              schemes.json ↗
            </a>
            <a href="/data/schemes.csv" target="_blank" className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-surface-700 transition-colors">
              schemes.csv ↗
            </a>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input className="input-field pl-10" placeholder="Search schemes by name, purpose, or keyword..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select className="select-field py-2 text-sm min-w-[140px]" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSES.map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="select-field py-2 text-sm min-w-[120px]" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <p className="text-surface-500 text-sm mb-5">{filtered.length} scheme{filtered.length !== 1 ? "s" : ""} found</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((scheme, i) => (
            <motion.div key={scheme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card-hover p-6 flex flex-col group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scheme.color} flex items-center justify-center text-2xl shadow-glow`}>{scheme.icon}</div>
                <div className="flex flex-col items-end gap-1">
                  <span className="badge-verified text-xs">Verified</span>
                  <span className="text-xs text-surface-500">Last verified {scheme.lastVerified}</span>
                </div>
              </div>
              <h3 className="text-base font-semibold text-surface-100 mb-1 leading-tight">{scheme.name}</h3>
              <p className="text-surface-500 text-xs mb-3">by {scheme.nodal}</p>
              <p className="text-surface-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{scheme.description}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-surface-800/40 rounded-lg">
                  <div className="text-success-400 font-bold text-xs">₹{scheme.maxLoanLakh}L</div>
                  <div className="text-surface-600 text-xs">Max Loan</div>
                </div>
                <div className="text-center p-2 bg-surface-800/40 rounded-lg">
                  <div className="text-info-400 font-bold text-xs">{scheme.interestRatePercent}%</div>
                  <div className="text-surface-600 text-xs">Rate p.a.</div>
                </div>
                <div className="text-center p-2 bg-surface-800/40 rounded-lg">
                  <div className="text-warning-400 font-bold text-xs">{scheme.financingPercent}%</div>
                  <div className="text-surface-600 text-xs">Financed</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {scheme.eligibleCategories.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 text-xs border border-primary-500/20">{c}</span>
                ))}
                {scheme.partnerTypes.map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-surface-700/40 text-surface-400 text-xs">{p}</span>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-surface-800/60 items-center">
                <button
                  onClick={() => setSelectedSchemeForApply(scheme)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" /> Apply
                </button>
                <Link href={`/schemes/${scheme.id}`} className="btn-primary text-xs py-2 px-3 flex-1 justify-center">
                  View Details <ArrowRight className="w-3 h-3" />
                </Link>
                <Link href={`/calculator?scheme=${scheme.id}`} className="btn-ghost text-xs py-2 px-3">
                  <Calculator className="w-3 h-3" />
                </Link>
                <Link href={`/partners?scheme=${scheme.id}`} className="btn-ghost text-xs py-2 px-3">
                  <MapPin className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass-card p-10 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-semibold text-surface-100 mb-2">No schemes found</h3>
            <p className="text-surface-400 mb-4">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(""); setPurpose("All"); setCategory("All"); }} className="btn-secondary">Clear Filters</button>
          </div>
        )}
        {/* Apply Scheme Modal */}
        {selectedSchemeForApply && (
          <ApplySchemeModal
            scheme={selectedSchemeForApply}
            isOpen={!!selectedSchemeForApply}
            onClose={() => setSelectedSchemeForApply(null)}
          />
        )}
      </div>
    </div>
  );
}
