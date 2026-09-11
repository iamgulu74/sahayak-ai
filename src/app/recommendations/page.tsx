'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calculator, MapPin, Info, CheckCircle, XCircle, AlertCircle, Filter, SortAsc } from "lucide-react";
import { matchSchemes, UserProfile, SchemeMatch, DEFAULT_DEMO_PROFILE } from "@/lib/matching-engine";
import { useAuth } from "@/contexts/AuthContext";

function MatchScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function CriterionBadge({ status }: { status: string }) {
  if (status === "eligible") return <CheckCircle className="w-4 h-4 text-success-500" />;
  if (status === "partial") return <AlertCircle className="w-4 h-4 text-warning-500" />;
  return <XCircle className="w-4 h-4 text-danger-500" />;
}

function SchemeCard({ match, index }: { match: SchemeMatch; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { scheme, matchScore, isEligible, criteria, failedCriteria, financialSummary } = match;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className={`glass-card p-6 ${!isEligible ? "opacity-60" : "glass-card-hover"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scheme.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-glow`}>
            {scheme.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-semibold text-surface-100">{scheme.name}</h3>
              {index === 0 && isEligible && (
                <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs">⭐ Best Match</span>
              )}
              {!isEligible && <span className="badge-danger text-xs">Not Eligible</span>}
            </div>
            <p className="text-surface-400 text-sm">by {scheme.nodal}</p>
          </div>
        </div>
        <MatchScoreRing score={matchScore} />
      </div>

      <p className="text-surface-400 text-sm mb-4 leading-relaxed line-clamp-2">{scheme.description}</p>

      {/* Key figures */}
      {isEligible && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-card p-3 text-center bg-surface-800/40">
            <div className="text-success-400 font-bold text-sm">₹{financialSummary.eligibleLoanLakh}L</div>
            <div className="text-surface-500 text-xs">Eligible Loan</div>
          </div>
          <div className="glass-card p-3 text-center bg-surface-800/40">
            <div className="text-info-400 font-bold text-sm">{scheme.interestRatePercent}% p.a.</div>
            <div className="text-surface-500 text-xs">Interest Rate</div>
          </div>
          <div className="glass-card p-3 text-center bg-surface-800/40">
            <div className="text-warning-400 font-bold text-sm">₹{financialSummary.estimatedEMI.toLocaleString("en-IN")}</div>
            <div className="text-surface-500 text-xs">Est. EMI/mo</div>
          </div>
        </div>
      )}

      {/* Criteria breakdown */}
      <button onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium mb-3 transition-colors">
        <Info className="w-4 h-4" />
        {expanded ? "Hide" : "Show"} Eligibility Breakdown
      </button>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="space-y-2 mb-4 bg-surface-800/30 rounded-xl p-4">
          {[...(isEligible ? criteria : []), ...failedCriteria].map((c) => (
            <div key={c.key} className="flex items-start gap-3">
              <CriterionBadge status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-surface-200 text-xs font-medium">{c.label}</span>
                  <span className="text-surface-500 text-xs">| You: {c.userValue}</span>
                  <span className="text-surface-600 text-xs">| Scheme: {c.schemeValue}</span>
                </div>
                <p className="text-surface-400 text-xs mt-0.5">{c.reason}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Not eligible failed criteria */}
      {!isEligible && failedCriteria.length > 0 && (
        <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl">
          <p className="text-danger-400 text-xs font-medium mb-1">Failed criteria:</p>
          {failedCriteria.map((c) => (
            <p key={c.key} className="text-danger-300 text-xs">• {c.label}: {c.reason}</p>
          ))}
        </div>
      )}

      {isEligible && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200/80">
          <Link href={`/schemes/${scheme.id}`} className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href={`/calculator?scheme=${scheme.id}&loan=${financialSummary.eligibleLoanLakh}`} className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1">
            <Calculator className="w-3 h-3 text-indigo-600" /> Calculate EMI
          </Link>
          <Link href={`/partners?scheme=${scheme.id}`} className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-600" /> Find Partner (OSFDC)
          </Link>
          <Link href={`/documents`} className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1">
            Check Docs & OCR →
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function RecommendationsPage() {
  const { userProfile } = useAuth();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [filter, setFilter] = useState<"all" | "eligible" | "not_eligible">("all");
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    let profile: UserProfile | null = null;
    try {
      const stored = sessionStorage.getItem("sahayak_profile") || localStorage.getItem("sahayak_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.projectCostLakh || parsed.annualIncomeLakh)) {
          profile = parsed;
        }
      }
    } catch {}
    if (!profile && userProfile && (userProfile.projectCostLakh || userProfile.annualIncomeLakh)) {
      profile = userProfile as UserProfile;
    }
    if (profile && profile.projectCostLakh && profile.loanRequiredLakh && profile.annualIncomeLakh) {
      setHasProfile(true);
      setMatches(matchSchemes(profile));
    } else {
      setHasProfile(false);
      setMatches([]);
    }
  }, [userProfile]);

  const filtered = filter === "all" ? matches : filter === "eligible" ? matches.filter(m => m.isEligible) : matches.filter(m => !m.isEligible);
  const eligibleCount = matches.filter(m => m.isEligible).length;

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="badge-verified mb-3">AI Matching Complete</div>
          <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">Your Scheme Recommendations</h1>
          <p className="text-surface-400">Found <strong className="text-success-400">{eligibleCount} eligible schemes</strong> out of {matches.length} total. Each match is scored by eligibility, financial fit, and purpose alignment.</p>
          <div className="flex items-center gap-2 mt-3 p-3 bg-info-500/10 border border-info-500/20 rounded-xl">
            <Info className="w-4 h-4 text-info-400 flex-shrink-0" />
            <p className="text-info-300 text-sm">Match scores decompose into named criteria below each card. All figures shown are estimates — verify with your Channel Partner.</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 text-surface-400"><Filter className="w-4 h-4" /><span className="text-sm">Filter:</span></div>
          {(["all", "eligible", "not_eligible"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-primary-600/30 text-primary-300 border border-primary-500/40" : "text-surface-400 hover:text-surface-200 border border-transparent"}`}>
              {f === "all" ? `All (${matches.length})` : f === "eligible" ? `Eligible (${eligibleCount})` : `Not Eligible (${matches.length - eligibleCount})`}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((match, i) => <SchemeCard key={match.scheme.id} match={match} index={i} />)}
        </div>

        {eligibleCount === 0 && (
          <div className="glass-card p-8 text-center mt-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-surface-100 mb-2">No strong matches found</h3>
            <p className="text-surface-400 mb-6">We couldn't find a strong match based on your current information.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/questionnaire" className="btn-primary">Update Profile</Link>
              <Link href="/schemes" className="btn-secondary">Explore All Schemes</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
