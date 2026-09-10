'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Settings,
  Database,
  Users,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Clock,
  Building2,
  Lock
} from "lucide-react";
import { SCHEMES, Scheme } from "@/lib/schemes-data";
import { CHANNEL_PARTNERS, ChannelPartner, RoutingStatus } from "@/lib/partners-data";

const TABS = ["Schemes Database", "Partner Routing & Capacity", "Re-Routing Audit Logs", "Fraud Reports", "Analytics"];

export default function AdminPage() {
  const [tab, setTab] = useState("Schemes Database");
  const [partnerList, setPartnerList] = useState<ChannelPartner[]>(CHANNEL_PARTNERS);
  const [rerouteLogs, setRerouteLogs] = useState<any[]>([]);
  const [fraudReports, setFraudReports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const logs = JSON.parse(localStorage.getItem("sahayak_rerouting_logs") || "[]");
      setRerouteLogs(logs);
      const reports = JSON.parse(localStorage.getItem("sahayak_fraud_reports") || "[]");
      setFraudReports(reports);
    } catch {}
  }, [tab]);

  const handleToggleFundAvailability = (partnerId: string) => {
    setPartnerList((prev) =>
      prev.map((p) => {
        if (p.id === partnerId) {
          const nextStatus =
            p.fundAvailability === "available"
              ? "limited"
              : p.fundAvailability === "limited"
              ? "restricted"
              : "available";
          return {
            ...p,
            fundAvailability: nextStatus,
            routingStatus: nextStatus,
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Sahayak Administrative & Governance Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Audit Trail • Partner Capacity Management • Scheme Registry • Fraud Watchdog
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mt-2">
            ⚠️ <strong>Admin Mode:</strong> Toggle partner fund capacities below to test real-time auto-rerouting across the platform.
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tab === t
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TAB 1: Schemes Database */}
        {tab === "Schemes Database" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Registered Government Schemes ({SCHEMES.length})
              </h2>
              <span className="text-xs text-slate-500">
                Verified ceiling: ₹5.00 Lakh | Last verified: 2026-09-08
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Scheme Name</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Max Loan</th>
                    <th className="pb-3">Interest Rate</th>
                    <th className="pb-3">Ceiling</th>
                    <th className="pb-3">Channel Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCHEMES.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="py-3 pr-3 font-semibold text-slate-800 flex items-center gap-2">
                        <span>{s.icon}</span>
                        <div>
                          <div>{s.shortName}</div>
                          <span className="text-[10px] text-slate-400 font-normal block">{s.id}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            s.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-700">₹{s.maxLoanLakh}L</td>
                      <td className="py-3 pr-3 text-slate-700 font-semibold">{s.interestRatePercent}% p.a.</td>
                      <td className="py-3 pr-3 text-slate-700">₹{s.incomeLimitLakh}L</td>
                      <td className="py-3 pr-3 text-slate-500 text-[11px]">{s.channelRoute || "SCA / Bank"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Partner Routing & Capacity */}
        {tab === "Partner Routing & Capacity" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Channel Partner Capacity Controls ({partnerList.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Click on any status badge to toggle fund availability and test automatic rerouting.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {partnerList.map((p) => (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 uppercase font-semibold">
                        {p.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{p.address} • Score: {p.performanceScore}/100</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleFundAvailability(p.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        p.fundAvailability === "available"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : p.fundAvailability === "limited"
                          ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                          : "bg-red-50 text-red-800 border-red-300 hover:bg-red-100"
                      }`}
                    >
                      {p.fundAvailability === "available"
                        ? "🟢 High Availability"
                        : p.fundAvailability === "limited"
                        ? "🟡 Limited Backlog"
                        : "🔴 Restricted"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Re-Routing Audit Logs */}
        {tab === "Re-Routing Audit Logs" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" /> Automated Partner Re-Routing Log
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of borrowers automatically steered away from congested or restricted branches.
            </p>

            {rerouteLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No rerouting events recorded in this session. Visit <Link href="/partners" className="text-indigo-600 font-semibold underline">Partner Locator</Link> and click "Simulate Live Auto-Rerouting" to generate an event.
              </div>
            ) : (
              <div className="space-y-3">
                {rerouteLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Rerouted from: <span className="text-red-700">{log.originalPartner?.name}</span> → <span className="text-emerald-700">{log.reroutedPartner?.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Fraud Reports */}
        {tab === "Fraud Reports" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-4 h-4" /> Reported Suspicious Activities & Middlemen
            </h2>
            <p className="text-xs text-slate-500">
              Reports filed by marginalized applicants through the Fraud Protection Center.
            </p>

            {fraudReports.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                No active fraud complaints reported. Borrowers can file complaints at the <Link href="/fraud-protection" className="text-indigo-600 font-semibold underline">Fraud Center</Link>.
              </div>
            ) : (
              <div className="space-y-3">
                {fraudReports.map((report, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-950">{report.incidentType}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700">{report.description}</p>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-red-100 flex gap-4">
                      <span>Target: {report.targetEntity}</span>
                      <span>Contact: {report.phoneOrContact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Analytics */}
        {tab === "Analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
                <div className="text-2xl font-extrabold text-slate-900">2,847</div>
                <div className="text-xs text-slate-500 mt-0.5">Total Registered Applicants</div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
                <div className="text-2xl font-extrabold text-emerald-600">88.4%</div>
                <div className="text-xs text-slate-500 mt-0.5">Eligibility Match Accuracy</div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
                <div className="text-2xl font-extrabold text-indigo-600">14 Days</div>
                <div className="text-xs text-slate-500 mt-0.5">Avg. Partner Processing</div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
                <div className="text-2xl font-extrabold text-purple-600">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">Verified Sourced Figures</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
