'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Bookmark, Calculator, MapPin, Bell, ChevronRight, CheckCircle, Clock, User, BarChart3, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { matchSchemes, UserProfile, SchemeMatch, DEFAULT_DEMO_PROFILE } from "@/lib/matching-engine";
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
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<SchemeMatch[]>([]);
  const [appStage, setAppStage] = useState(0);
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    let profile: UserProfile;
    try {
      const stored = sessionStorage.getItem("sahayak_profile");
      profile = stored ? JSON.parse(stored) : DEFAULT_DEMO_PROFILE;
    } catch { profile = DEFAULT_DEMO_PROFILE; }
    if (userProfile?.name) profile = { ...DEFAULT_DEMO_PROFILE, ...userProfile } as UserProfile;
    const m = matchSchemes(profile);
    setMatches(m);
    const p = rankPartners({ state: profile.state || "Odisha", schemeId: m[0]?.scheme.id, category: "SC", limit: 3 });
    setPartners(p);
  }, [userProfile]);

  const topMatches = matches.filter(m => m.isEligible).slice(0, 3);
  const displayName = userProfile?.name || user?.displayName || "Entrepreneur";
  const profile = (userProfile || DEFAULT_DEMO_PROFILE) as UserProfile;
  const completionFields = ["name", "age", "state", "district", "category", "annualIncomeLakh", "projectCostLakh", "purpose", "businessType"];
  const completionPct = Math.round((completionFields.filter(f => (profile as any)[f]).length / completionFields.length) * 100);

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
        {completionPct < 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass-card p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-surface-300 font-medium">Profile Completion</span>
                <span className="text-primary-400">{completionPct}%</span>
              </div>
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full progress-fill" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <Link href="/questionnaire" className="btn-primary text-sm py-2 px-4 whitespace-nowrap">Complete Profile →</Link>
          </motion.div>
        )}

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
              <div className="glass-card p-8 text-center">
                <p className="text-surface-400 mb-4">No matches yet. Complete your profile to get recommendations.</p>
                <Link href="/questionnaire" className="btn-primary text-sm py-2 px-5">Find My Schemes</Link>
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
              ) : <p className="text-surface-500 text-sm">Complete your profile to see partner recommendations.</p>}
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
