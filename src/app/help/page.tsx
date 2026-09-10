'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, Search, Sparkles, ArrowRight, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  q: string;
  a: string;
  category: "platform" | "schemes" | "finance" | "security";
}

const FAQS: FAQItem[] = [
  { 
    q: "Is Sahayak AI an official government platform?", 
    a: "No. Sahayak AI is an AI-assisted guidance and routing layer — not an official government portal, approval authority, or loan-processing system. Final eligibility, approval, and disbursement are handled by the competent authority and authorized Channel Partners under official scheme guidelines.",
    category: "platform"
  },
  { 
    q: "How are schemes matched to me?", 
    a: "We use a two-layer system: First, a deterministic rule engine checks hard eligibility gates (income ceiling, social category, age, purpose, project cost). Only schemes you pass all hard gates for are ranked. Then, a semantic AI layer scores how well your stated need aligns with each eligible scheme's purpose. Every factor in the score is shown to you — no unexplained percentages.",
    category: "schemes"
  },
  { 
    q: "Are the interest rates and loan limits shown accurate?", 
    a: "We display rates and limits sourced from official scheme documentation and labeled with a 'Last Verified' date. However, scheme parameters can change. Always verify current rates and limits with the official Channel Partner before making any financial decision. EMI figures shown are estimates.",
    category: "finance"
  },
  { 
    q: "What does 'Demo / Prototype Data' mean?", 
    a: "Some data — particularly Channel Partner routing status (Available / Limited / Restricted) — cannot currently be sourced from a live official feed. Any such data is explicitly labeled 'Demo / Prototype Data' throughout the platform. In a production deployment connected to official partner feeds, these labels would be replaced with verified live data.",
    category: "platform"
  },
  { 
    q: "Can I use the platform without creating an account?", 
    a: "Yes. You can run the questionnaire, view scheme recommendations, use the EMI calculator, and browse partners without an account. Creating an account lets you save your profile, track applications, and access your recommendations across sessions.",
    category: "platform"
  },
  { 
    q: "What is a moratorium period?", 
    a: "A moratorium is a grace period after your loan is disbursed during which you are not required to start making EMI payments. For example, a 6-month moratorium means your first EMI is due 6 months after disbursement. Interest may still accrue during this period depending on the scheme. It gives you time to set up your business before repayment begins.",
    category: "finance"
  },
  { 
    q: "What is a Channel Partner?", 
    a: "Channel Partners are the authorized financial institutions through which government scheme loans are actually disbursed. They include State Channelising Agencies (SCAs), Public Sector Banks (PSBs), Regional Rural Banks (RRBs), and NBFC-MFIs. Sahayak AI routes you to the right type of partner for your specific scheme.",
    category: "schemes"
  },
  { 
    q: "What is NSFDC?", 
    a: "The National Scheduled Castes Finance and Development Corporation (NSFDC) is the nodal agency under the Ministry of Social Justice and Empowerment that administers concessional financial schemes for SC beneficiaries through a network of State Channelising Agencies and other partners.",
    category: "schemes"
  },
  { 
    q: "My state is not listed. What should I do?", 
    a: "Most NSFDC schemes are available across all Indian states through the respective State Channelising Agencies. For state-specific partner details, contact NSFDC directly at nsfdc.nic.in or your state's SC welfare department.",
    category: "schemes"
  },
  { 
    q: "Is my personal data safe?", 
    a: "We collect only the minimum data required for scheme matching (age, income, category, purpose). Profile data is stored securely in Firebase (Google Cloud) with authentication. We do not sell or share your personal data with third parties. See our About & Disclaimer page for full details.",
    category: "security"
  },
];

const GLOSSARY = [
  { term: "Moratorium", def: "Grace period before EMI repayments begin after loan disbursement." },
  { term: "Concessional Loan", def: "A loan with below-market interest rate, offered as a government benefit." },
  { term: "SCA (State Channelising Agency)", def: "State-level government body that channels NSFDC loans to SC beneficiaries." },
  { term: "PSB (Public Sector Bank)", def: "Government-owned bank (e.g. SBI, PNB, UCO) that processes scheme loans." },
  { term: "RRB (Regional Rural Bank)", def: "Rural bank serving semi-urban and rural areas, often covering SC-specific schemes." },
  { term: "NBFC-MFI", def: "Non-Banking Financial Company — Micro Finance Institution. Provides micro-loans, often to women." },
  { term: "EMI", def: "Equated Monthly Instalment — the fixed amount paid monthly to repay a loan." },
  { term: "Routing Eligibility", def: "A partner's current capacity to accept and process new applications for a scheme." },
  { term: "NPA", def: "Non-Performing Asset — a loan where repayment is overdue, affecting the lender's capacity." },
  { term: "Financing %", def: "The portion of total project cost that a scheme will fund (e.g. 90% means you contribute 10%)." },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "schemes", label: "Schemes & Matching" },
  { id: "finance", label: "Loans & EMI" },
  { id: "platform", label: "Platform Info" },
  { id: "security", label: "Data & Privacy" },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = !searchQuery || 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Badge & Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Support & Knowledge Base
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight font-headline">
            Help & Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Sahayak AI, scheme eligibility rules, and authorized channel partners.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search help topics, terms, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600">
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105"
                    : "bg-white/70 backdrop-blur-sm text-slate-600 border border-slate-200/80 hover:bg-white hover:text-slate-900"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQs List */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-headline">
              Questions & Answers
            </h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-800 font-semibold text-base">No matching questions found</p>
              <p className="text-slate-500 text-sm mt-1">Try searching for different keywords or select "All Questions".</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass-card overflow-hidden transition-all duration-300 ${
                      isOpen 
                        ? "border-indigo-400/50 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20 bg-white/90" 
                        : "hover:border-slate-300 hover:bg-white/85"
                    }`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-start justify-between gap-4 p-5 text-left group">
                      <span className={`font-semibold text-sm md:text-base leading-snug transition-colors ${
                        isOpen ? "text-indigo-950" : "text-slate-900 group-hover:text-indigo-600"
                      }`}>
                        {faq.q}
                      </span>
                      <div className={`p-1.5 rounded-xl transition-colors flex-shrink-0 mt-0.5 ${
                        isOpen ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 pt-0">
                          <div className="pt-3 border-t border-slate-100 text-slate-700 text-sm leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Terms Glossary */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-headline">Financial Terms Glossary</h2>
              <p className="text-slate-500 text-xs md:text-sm">Key government loan terms explained in simple language</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {GLOSSARY.map((item, i) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover p-4 border border-white/80">
                <div className="inline-block font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-1.5">
                  {item.term}
                </div>
                <div className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
                  {item.def}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Support & AI Assistance Glass Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/20">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Always Free & Impartial
              </div>
              <h3 className="text-2xl font-bold text-white font-headline mb-2">
                Still have questions or need guidance?
              </h3>
              <p className="text-indigo-100 text-sm max-w-lg leading-relaxed">
                Try our AI Assistant or run our 3-minute scheme questionnaire to discover schemes and partners made for your profile.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href="/assistant"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white text-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <MessageSquare className="w-4 h-4" />
                Ask AI Assistant
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all">
                <Sparkles className="w-4 h-4" />
                Find Schemes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
