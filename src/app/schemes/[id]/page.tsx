'use client';
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calculator,
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  Shield,
  ChevronRight,
  Printer,
  ShieldAlert,
  Sparkles,
  Building2,
  FileCheck,
  Send
} from "lucide-react";
import { getSchemeById, formatLakh } from "@/lib/schemes-data";
import ApplySchemeModal from "@/components/ApplySchemeModal";

const APPLICATION_STEPS = [
  "Check Eligibility Criteria on Sahayak AI",
  "Prepare Mandatory Paperwork (Caste, Income, Quotation)",
  "Visit Local SCA Office (e.g. OSFDC) or Bank Branch",
  "Submit Application Dossier via PM-SURAJ Portal",
  "Field Due Diligence & Quotation Verification",
  "Loan Sanction & Tripartite Agreement Execution",
  "Direct Machinery Fund Disbursement to Supplier",
];

export default function SchemeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const scheme = getSchemeById(id);
  if (!scheme) notFound();

  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            nav, footer, .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .page-container {
              padding: 0 !important;
            }
          }
        `}</style>

        {/* Breadcrumb & Actions Bar */}
        <div className="no-print flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/schemes" className="hover:text-slate-800 transition-colors">
              Schemes
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-semibold">{scheme.shortName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Download / Print PDF Summary
            </button>
          </div>
        </div>

        {/* Persistent Anti-Fraud Warning Banner */}
        <div className="no-print bg-red-50 border border-red-200/80 rounded-2xl p-3.5 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-red-900 leading-relaxed">
            <strong>Borrower Advisory:</strong> Application forms and portal submissions for {scheme.name} are <strong>100% free</strong>. Never pay cash commissions or "approval fees" to private agents. Report suspicious middlemen at <Link href="/fraud-protection" className="font-bold underline text-red-950">Sahayak Fraud Center</Link> or National Helpline <strong>1930</strong>.
          </div>
        </div>

        {/* Scheme Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${scheme.color} flex items-center justify-center text-3xl shadow-sm flex-shrink-0`}
            >
              {scheme.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ Verified Government Scheme
                </span>
                <span className="text-slate-400 text-xs">
                  Last verified: {scheme.lastVerified}
                </span>
                {scheme.incomeCeilingEffectiveDate && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    ₹5.0L Income Ceiling (Effective {scheme.incomeCeilingEffectiveDate})
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {scheme.name}
              </h1>
              <p className="text-xs text-slate-500 mb-3">
                Implementing Body: <strong className="text-slate-800">{scheme.nodal}</strong> •{" "}
                {scheme.ministry || "Government of India"}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {scheme.description}
              </p>
            </div>
          </div>

          <div className="no-print flex flex-wrap gap-2.5 mt-6 pt-6 border-t border-slate-100 items-center">
            <button
              onClick={() => setApplyModalOpen(true)}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> Apply for Scheme (Get Tracking ID)
            </button>
            <Link
              href={`/eligibility-check?scheme=${scheme.id}`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle className="w-4 h-4" /> Check My Eligibility
            </Link>
            <Link
              href={`/calculator?scheme=${scheme.id}`}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Calculator className="w-4 h-4 text-indigo-600" /> Calculate EMI
            </Link>
            <Link
              href={`/partners?scheme=${scheme.id}`}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-4 h-4 text-indigo-600" /> Find Channel Partner
            </Link>
            <a
              href={scheme.applicationPortal || scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Official Portal (PM-SURAJ)
            </a>
          </div>
        </motion.div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Body (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Financial Parameters */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" /> Financial Parameters & Interest Structure
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-slate-900">₹{scheme.maxLoanLakh} Lakh</div>
                  <div className="text-[11px] text-slate-500">Maximum Loan Amount</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-indigo-600">{scheme.interestRatePercent}% p.a.</div>
                  <div className="text-[11px] text-slate-500">Beneficiary Interest Rate</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-emerald-600">{scheme.financingPercent}%</div>
                  <div className="text-[11px] text-slate-500">Scheme Financing Share</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-slate-900">{scheme.repaymentYears} Years</div>
                  <div className="text-[11px] text-slate-500">Repayment Period</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-amber-600">{scheme.moratoriumMonthsMin} Months</div>
                  <div className="text-[11px] text-slate-500">Moratorium Grace Period</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-slate-900">
                    {scheme.collateralRequired ? "Required" : "Collateral-Free"}
                  </div>
                  <div className="text-[11px] text-slate-500">Collateral Requirement</div>
                </div>
              </div>

              {scheme.genderBasedRate && (
                <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl text-xs text-pink-900">
                  👩 <strong>Women Beneficiary Concession:</strong> Women applicants receive a 0.5% interest rate rebate (effective {scheme.interestRateWomen || 5.5}% p.a.).
                </div>
              )}
            </div>

            {/* Who Can Apply */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" /> Mandatory Eligibility Criteria
              </h2>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Eligible Social Category</span>
                  <span className="text-slate-800">{scheme.eligibleCategories.join(", ")} Only</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Annual Family Income Ceiling</span>
                  <span className="font-bold text-indigo-700">Up to ₹{scheme.incomeLimitLakh} Lakh per annum</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Gender Criteria</span>
                  <span className="text-slate-800">
                    {scheme.genderCriteria === "women_only" ? "Women Entrepreneurs Only" : "All Genders"}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Eligible Age Range</span>
                  <span className="text-slate-800">{scheme.minAge} to {scheme.maxAge} years</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Geographic Coverage</span>
                  <span className="text-slate-800">{scheme.states === "all" ? "All India (All States & UTs)" : "Specific States"}</span>
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Mandatory Required Documents
                </h2>
                <Link
                  href="/documents"
                  className="no-print text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5" /> Test in OCR Scanner →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Steps */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Step-by-Step Application Process
              </h2>
              <div className="space-y-3">
                {APPLICATION_STEPS.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px]">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-slate-800">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="no-print bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Apply & Tracking Route
              </h3>
              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Apply Now & Get Tracking ID
              </button>
              <p className="text-xs text-slate-600">
                Channel Route: <strong className="text-slate-800">{scheme.channelRoute || "State Channelising Agencies (SCAs)"}</strong>
              </p>
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950">
                In Odisha, applications route through <strong>OSFDC (Odisha SC & ST Dev Finance Corp)</strong> or participating public sector banks.
              </div>
              <Link
                href={`/partners?scheme=${scheme.id}`}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" /> Find Channel Partner in Your State
              </Link>
            </div>

            {/* Compare Tool Card */}
            <div className="no-print bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Compare With Other Schemes
              </h3>
              <p className="text-xs text-slate-500">
                Compare interest rates, loan limits, and moratorium terms side-by-side with MUDRA or Utkarsh.
              </p>
              <Link
                href={`/compare?scheme=${scheme.id}`}
                className="w-full py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                Open Scheme Comparison →
              </Link>
            </div>
          </div>
        </div>

        {/* Apply Scheme Modal */}
        <ApplySchemeModal
          scheme={scheme}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
        />
      </div>
    </div>
  );
}
