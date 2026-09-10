'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  Clock,
  Coins,
  Building2,
  AlertOctagon,
  ShieldCheck,
  Search,
  ArrowRight,
  Calculator,
  Sparkles
} from "lucide-react";

interface LiteracyTopic {
  id: string;
  title: string;
  category: "Basics" | "Repayment" | "Institutions" | "Safeguards";
  summary: string;
  fullExplanation: string;
  icon: React.ReactNode;
  badge: string;
  practicalTip: string;
}

const TOPICS: LiteracyTopic[] = [
  {
    id: "what-is-emi",
    title: "What is an EMI (Equated Monthly Installment)?",
    category: "Basics",
    badge: "Repayment Core",
    icon: <Coins className="w-5 h-5 text-indigo-600" />,
    summary: "A fixed amount you pay to the bank every month until your loan is fully repaid. It covers both principal and interest.",
    fullExplanation:
      "When you take a loan to buy machinery or start a shop, you repay it in monthly slices called EMIs. Each EMI contains two parts: (1) Principal (a portion of the money you originally borrowed) and (2) Interest (the fee charged by the government or bank for lending the money). In government schemes like NSFDC Suvidha or MCF, interest rates are kept concessional (typically 6% to 8% p.a.), making your monthly EMI substantially lower than commercial bank loans.",
    practicalTip: "Always choose a loan tenure where your monthly EMI does not exceed 30%–40% of your net monthly business profit.",
  },
  {
    id: "what-is-moratorium",
    title: "What is a Moratorium Period (Grace Period)?",
    category: "Repayment",
    badge: "Essential Advantage",
    icon: <Clock className="w-5 h-5 text-emerald-600" />,
    summary: "A relief window (3 to 12 months) before your monthly loan repayments begin, allowing your business to start generating revenue first.",
    fullExplanation:
      "Setting up a tailoring unit, buying machines, and getting your first customer takes time. A Moratorium Period is a government-mandated grace period during which you do NOT have to pay regular EMIs. For example, under NSFDC Suvidha and Utkarsh schemes, you receive a 6-month moratorium (up to 12 months for construction/plantation activities). Once your machinery is installed and earning money, regular monthly repayments begin.",
    practicalTip: "Use the moratorium period to build emergency inventory and customer orders—do not treat it as free money.",
  },
  {
    id: "loan-vs-subsidy",
    title: "Loan vs. Capital Subsidy — What's the Difference?",
    category: "Basics",
    badge: "Funding Structure",
    icon: <Sparkles className="w-5 h-5 text-amber-600" />,
    summary: "A loan must be repaid with interest; a subsidy is non-repayable government grant money that directly lowers your debt.",
    fullExplanation:
      "A Loan is borrowed money that you must return in monthly installments. A Subsidy is a direct financial grant provided by the Central or State Government that you NEVER have to pay back. In many entrepreneurship schemes (such as PMEGP or state top-ups), 15% to 35% of your project cost is provided as a capital subsidy. The bank reduces your loan balance by that subsidy amount once your unit begins production.",
    practicalTip: "Always confirm whether a scheme offers an 'interest subsidy' (cheaper monthly rate) or a 'capital subsidy' (direct waiver of loan amount).",
  },
  {
    id: "sca-vs-bank",
    title: "What is an SCA (State Channelising Agency) vs Bank vs NBFC-MFI?",
    category: "Institutions",
    badge: "Partner Routing",
    icon: <Building2 className="w-5 h-5 text-sky-600" />,
    summary: "SCAs are state social welfare corporations dedicated to SC/ST entrepreneurs; banks and NBFC-MFIs provide financial disbursement.",
    fullExplanation:
      "Apex corporations like NSFDC do not disburse loans directly to citizens. Instead, they route funds through: (1) State Channelising Agencies (SCAs) such as OSFDC in Odisha or APSCCFC in Andhra Pradesh, specifically mandated for SC welfare; (2) Public Sector Banks (PSBs) like SBI or PNB; and (3) Regional Rural Banks (RRBs) or NBFC-MFIs (for doorstep micro-finance like Annapurna Finance). Understanding this stops you from getting rejected at the wrong office.",
    practicalTip: "For NSFDC schemes, visit your district SCA officer or participating PSB branch listed on Sahayak AI's Partner Locator.",
  },
  {
    id: "what-is-npa",
    title: "What is an NPA and Why Does Credit Discipline Matter?",
    category: "Safeguards",
    badge: "Credit Protection",
    icon: <AlertOctagon className="w-5 h-5 text-red-600" />,
    summary: "If a loan is not repaid for over 90 days, it becomes a Non-Performing Asset (NPA), blocking all future government benefits.",
    fullExplanation:
      "When an entrepreneur fails to pay EMIs for 90 continuous days, the loan account is categorized as an NPA (Non-Performing Asset). The bank reports this default to credit bureaus (like CIBIL). Once marked as a defaulter, you and your family members become ineligible for any future government loans, interest subsidies, or government contracts. Maintaining clean repayments ensures you can graduate from a ₹1 Lakh micro-loan to a ₹10 Lakh expansion loan later.",
    practicalTip: "If you face an unexpected business crisis, visit your bank branch BEFORE missing 3 installments to request an official restructuring.",
  },
  {
    id: "collateral-free-loans",
    title: "What Does 'Collateral-Free' Mean? (CGTMSE & MUDRA)",
    category: "Basics",
    badge: "Accessibility",
    icon: <ShieldCheck className="w-5 h-5 text-violet-600" />,
    summary: "You do not need to pledge your home, land, or gold as security; the government guarantees your loan up to eligible limits.",
    fullExplanation:
      "Traditional bank loans demand collateral—like land title deeds or house documents—which many marginalized or first-time entrepreneurs do not own. In schemes like PM SVANidhi, MUDRA Shishu/Kishore, and NSFDC micro-credit, loans are 100% collateral-free. The government’s Credit Guarantee Trust (CGTMSE / MUDRA) acts as the guarantor for the bank in case of unforeseen business closure.",
    practicalTip: "Never allow an unauthorized middleman to charge you fees claiming they will 'arrange collateral'. Collateral is officially waived by government mandate.",
  },
];

export default function FinancialLiteracyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = ["All", "Basics", "Repayment", "Institutions", "Safeguards"];

  const filteredTopics = TOPICS.filter((t) => {
    const matchesCat = selectedCat === "All" || t.category === selectedCat;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fullExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Financial Literacy Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Plain-Language Financial Guide
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            No bureaucratic jargon. Clear, honest explanations of loan terms, grace periods, subsidies, and credit health designed for first-time entrepreneurs.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search terms (EMI, subsidy, NPA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCat === cat
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {topic.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {topic.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {topic.title}
                </h3>
                <p className="text-xs font-medium text-indigo-700 bg-indigo-50/70 p-2.5 rounded-xl mb-3 leading-relaxed">
                  💡 {topic.summary}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {topic.fullExplanation}
                </p>
              </div>

              {/* Practical Tip Footer */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/60 p-3 rounded-xl">
                <strong className="font-semibold text-slate-700">Entrepreneur Rule:</strong>{" "}
                {topic.practicalTip}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Interactive Tools
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-2">
              Ready to Calculate Your Scheme Repayments?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Use our live EMI calculator with concessional government interest rates and customized moratorium buffers.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/calculator"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <Calculator className="w-4 h-4" /> Open EMI Calculator
            </Link>
            <Link
              href="/assistant"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              Ask AI Assistant →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
