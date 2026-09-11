'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Bookmark, Calculator, MapPin, Bell, ChevronRight, CheckCircle, Clock, User, BarChart3, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { matchSchemes, UserProfile, SchemeMatch, DEFAULT_DEMO_PROFILE, EMPTY_USER_PROFILE } from "@/lib/matching-engine";
import { rankPartners } from "@/lib/partner-router";

const APP_STAGES = ["Not Started", "Documents Preparing", "Partner Contacted", "Application Submitted", "Under Review", "Approved/Rejected"];

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold text-surface-100 mb-1">{value}</div>
      <div className="text-surface-400 text-sm">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, userProfile, resetProfile } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [appStage, setAppStage] = useState(0);
  const [partners, setPartners] = useState<any[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);
  const [completionPct, setCompletionPct] = useState(0);

  useEffect(() => {
    let profile: UserProfile | null = null;
    try {
      const stored = sessionStorage.getItem("sahayak_profile") || localStorage.getItem("sahayak_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.projectCostLakh || parsed.district || parsed.annualIncomeLakh)) {
          profile = parsed as UserProfile;
        }
      }
    } catch {}

    if (!profile && userProfile && (userProfile.projectCostLakh || userProfile.district)) {
      profile = userProfile as UserProfile;
    }

    if (profile && profile.projectCostLakh && profile.loanRequiredLakh && profile.annualIncomeLakh) {
      const m = matchSchemes(profile);
      setMatches(m);
      const p = rankPartners({ state: profile.state || "Odisha", schemeId: m[0]?.scheme.id, category: profile.category || "SC", limit: 3 });
      setPartners(p);

      const completionFields = ["name", "age", "state", "district", "category", "annualIncomeLakh", "projectCostLakh", "purpose", "businessType"];
      const pct = Math.round((completionFields.filter(f => (profile as any)[f]).length / completionFields.length) * 100);
      setCompletionPct(pct);
    } else {
      setMatches([]);
      setPartners([]);
      setCompletionPct(0);
    }
  }, [userProfile]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetProfile();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("sahayak_profile");
        localStorage.removeItem("sahayak_profile");
        localStorage.removeItem("sahayak_all_verified_docs");
      }
      setMatches([]);
      setPartners([]);
      setCompletionPct(0);
      setShowResetModal(false);
      setResetSuccessToast(true);
      setTimeout(() => setResetSuccessToast(false), 3500);
    } catch (e) {
      console.error("Failed to reset profile:", e);
    } finally {
      setIsResetting(false);
    }
  };

  const topMatches = matches.filter(m => m.isEligible).slice(0, 3);
  const displayName = userProfile?.name || user?.displayName || "Entrepreneur";

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-surface-100 mb-2">
            Welcome back, <span className="gradient-text">{displayName}</span> 👋
          </h1>
          <p className="text-surface-400">Here's your personalized overview and top scheme recommendations.</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Sparkles className="w-5 h-5 text-primary-400" />} label="Eligible Schemes" value={`${matches.filter(m => m.isEligible).length}`} color="bg-primary-500/20" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-success-400" />} label="Best Match Score" value={`${topMatches[0]?.matchScore || 0}%`} color="bg-success-500/20" />
          <StatCard icon={<MapPin className="w-5 h-5 text-info-400" />} label="Nearby Partners" value={`${partners.length}`} color="bg-info-500/20" />
          <StatCard icon={<User className="w-5 h-5 text-accent-400" />} label="Profile Complete" value={`${completionPct}%`} color="bg-accent-500/20" />
        </div>

        {/* Profile completion bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-300 font-medium">Profile Completion</span>
              <span className="text-primary-400 font-bold">{completionPct}%</span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link href="/questionnaire" className="btn-primary text-sm py-2 px-4 whitespace-nowrap flex-1 sm:flex-none text-center">
              {completionPct >= 100 ? "Update Profile →" : "Complete Profile →"}
            </Link>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Reset profile to start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Profile
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Matches */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-surface-100">Top Scheme Matches</h2>
              <Link href="/recommendations" className="text-primary-400 hover:text-primary-300 text-sm transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {topMatches.length === 0 && (
              <div className="glass-card p-8 text-center border border-dashed border-slate-200/80 rounded-3xl">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Profile Not Yet Completed</h3>
                <p className="text-slate-500 text-xs mb-4 max-w-sm mx-auto">
                  Your profile has been reset. Complete the questionnaire to discover your eligible government schemes and partner bank channels.
                </p>
                <Link href="/questionnaire" className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Complete Profile Questionnaire →
                </Link>
              </div>
            )}
            {topMatches.map((match, i) => (
              <motion.div key={match.scheme.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${match.scheme.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-glow`}>
                    {match.scheme.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-surface-100">{match.scheme.name}</h3>
                      <div className="flex items-center gap-1">
                        <div className="text-success-400 font-bold text-sm">{match.matchScore}%</div>
                        <div className="text-surface-500 text-xs">match</div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-surface-400">
                      <span>₹{match.financialSummary.eligibleLoanLakh}L loan</span>
                      <span>{match.scheme.interestRatePercent}% p.a.</span>
                      <span>EMI ~₹{match.financialSummary.estimatedEMI.toLocaleString("en-IN")}/mo</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/schemes/${match.scheme.id}`} className="text-primary-400 hover:text-primary-300 text-xs transition-colors">Details →</Link>
                      <span className="text-surface-700">|</span>
                      <Link href={`/calculator?scheme=${match.scheme.id}`} className="text-info-400 hover:text-info-300 text-xs transition-colors">Calculator</Link>
                      <span className="text-surface-700">|</span>
                      <Link href={`/partners?scheme=${match.scheme.id}`} className="text-success-400 hover:text-success-300 text-xs transition-colors">Find Partner</Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Application Tracker */}
            <div className="glass-card p-6 mt-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-400" /> Application Progress
                </h2>
                <span className="badge-ai text-xs">Self-Managed</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {APP_STAGES.map((stage, i) => (
                  <div key={stage} className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setAppStage(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        i === appStage ? "bg-primary-600/30 text-primary-300 border border-primary-500/40" :
                        i < appStage ? "bg-success-500/20 text-success-400" :
                        "text-surface-500 hover:text-surface-300"
                      }`}>{stage}</button>
                    {i < APP_STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-surface-700" />}
                  </div>
                ))}
              </div>
              <p className="text-surface-500 text-xs mt-3">Self-managed tracker — not connected to any official system. <Link href="/tracker" className="text-primary-400 underline">Manage details →</Link></p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Recommended Partner */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-success-400" /> Recommended Partner</h3>
              {partners[0] ? (
                <div>
                  <div className="badge-demo text-xs mb-2">⚠️ Demo Data</div>
                  <p className="text-surface-200 text-sm font-medium mb-1">{partners[0].name}</p>
                  <p className="text-surface-400 text-xs mb-1">{partners[0].type} • {partners[0].district}, {partners[0].state}</p>
                  <div className={`text-xs font-medium mt-2 ${partners[0].routingStatus === "available" ? "text-success-400" : partners[0].routingStatus === "limited" ? "text-warning-500" : "text-danger-400"}`}>
                    ● {partners[0].routingStatus === "available" ? "Available for Routing" : partners[0].routingStatus === "limited" ? "Limited Capacity" : "Currently Restricted"}
                  </div>
                  <Link href={`/partners/${partners[0].id}`} className="btn-primary text-xs py-2 px-4 mt-4 w-full justify-center">View Partner Details</Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-surface-500 text-xs mb-3">Complete your profile to view partner bank branches matched to your district.</p>
                  <Link href="/questionnaire" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Complete Profile →</Link>
                </div>
              )}
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-4">Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { href: "/eligibility-check", icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, label: "Check Scheme Eligibility" },
                  { href: "/documents", icon: <Sparkles className="w-4 h-4 text-indigo-500" />, label: "OCR Document Checker" },
                  { href: "/project-cost", icon: <Calculator className="w-4 h-4 text-amber-500" />, label: "Project Cost Calculator" },
                  { href: "/tracker", icon: <Clock className="w-4 h-4 text-sky-500" />, label: "7-Stage Application Tracker" },
                  { href: "/literacy", icon: <BarChart3 className="w-4 h-4 text-purple-500" />, label: "Financial Literacy Hub" },
                  { href: "/assistant", icon: <Bell className="w-4 h-4 text-indigo-500" />, label: "Ask AI Assistant" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/60 transition-all text-slate-700 text-xs font-semibold">
                    <div>{action.icon}</div>{action.label} <ArrowRight className="w-3 h-3 ml-auto text-slate-400" />
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50/80 transition-all text-rose-600 text-xs font-semibold cursor-pointer text-left"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  Reset Profile / Clear Answers
                  <ArrowRight className="w-3 h-3 ml-auto text-rose-400" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {resetSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 backdrop-blur-md border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile successfully reset. You can start fresh now.</span>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Applicant Profile?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will clear your filled profile answers (identity details, category, business requirement, and loan parameters). Your account login will remain active so you can fill in fresh details anytime.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-3 text-[11px] text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <span>⚠️ Note:</span>
              </div>
              <p>
                Calculated eligibility scores and recommendations will revert to default baselines until you complete the questionnaire again.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Yes, Reset Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
