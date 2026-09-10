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
  Sparkles,
  TrendingUp,
  FileText,
  Award,
  CheckCircle2,
  Percent,
  Briefcase,
  ShieldAlert,
  CreditCard,
  Users,
  Landmark,
  Compass,
  PieChart,
  Lock,
  Zap,
  Scale,
  BadgeAlert
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
    title: "1. What is an EMI (Equated Monthly Installment)?",
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
    title: "2. What is a Moratorium Period (Grace Period)?",
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
    title: "3. Loan vs. Capital Subsidy — What's the Difference?",
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
    title: "4. What is an SCA (State Channelising Agency) vs Bank vs NBFC-MFI?",
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
    title: "5. What is an NPA and Why Does Credit Discipline Matter?",
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
    title: "6. What Does 'Collateral-Free' Mean? (CGTMSE & MUDRA)",
    category: "Basics",
    badge: "Accessibility",
    icon: <ShieldCheck className="w-5 h-5 text-violet-600" />,
    summary: "You do not need to pledge your home, land, or gold as security; the government guarantees your loan up to eligible limits.",
    fullExplanation:
      "Traditional bank loans demand collateral—like land title deeds or house documents—which many marginalized or first-time entrepreneurs do not own. In schemes like PM SVANidhi, MUDRA Shishu/Kishore, and NSFDC micro-credit, loans are 100% collateral-free. The government’s Credit Guarantee Trust (CGTMSE / MUDRA) acts as the guarantor for the bank in case of unforeseen business closure.",
    practicalTip: "Never allow an unauthorized middleman to charge you fees claiming they will 'arrange collateral'. Collateral is officially waived by government mandate.",
  },
  {
    id: "what-is-cibil-score",
    title: "7. What is a CIBIL Score and how does it affect your loan application?",
    category: "Safeguards",
    badge: "Credit Health",
    icon: <TrendingUp className="w-5 h-5 text-teal-600" />,
    summary: "A 3-digit score (300 to 900) representing your repayment history. A score above 680–700 ensures fast government loan sanctioning.",
    fullExplanation:
      "CIBIL (Credit Information Bureau India Limited) tracks your credit history. Whenever you pay electricity bills, credit card bills, or past loan EMIs on time, your score increases. Most public sector banks require a minimum CIBIL score of 650 to 700 to approve scheme loans. First-time borrowers without past credit history receive a score of '-1' or 'NH' (No History), which government schemes explicitly accommodate.",
    practicalTip: "Pay small utility bills and micro-loans on time to build a strong CIBIL score early before applying for major expansion capital.",
  },
  {
    id: "what-is-dpr",
    title: "8. What is a Detailed Project Report (DPR) or Business Plan?",
    category: "Basics",
    badge: "Application Key",
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    summary: "A written document detailing your business idea, machinery cost, monthly raw material expenses, revenue target, and repayment plan.",
    fullExplanation:
      "Before sanctioning a loan, bank officials need to know how you will earn money. A Detailed Project Report (DPR) outlines: (1) Capital expenditure (cost of machines, tools, shop lease); (2) Operational expenditure (electricity, wages, raw materials); and (3) Projected monthly sales. Under Sahayak AI, automated DPR templates generate scheme-compliant business plans for tailoring, dairy farming, poultry, e-rickshaw, and grocery units.",
    practicalTip: "Always keep your projected monthly income at least 2.5 times higher than your expected monthly EMI.",
  },
  {
    id: "term-loan-vs-working-capital",
    title: "9. Term Loan vs. Working Capital Loan — Which one do you need?",
    category: "Basics",
    badge: "Loan Types",
    icon: <Scale className="w-5 h-5 text-purple-600" />,
    summary: "Term loans buy long-term assets like machines and vehicles; working capital buys daily raw materials and pays monthly wages.",
    fullExplanation:
      "A Term Loan is a lump sum disbursed to purchase fixed assets (e.g. buying a CNC machine or e-rickshaw) and is repaid over 3 to 7 years. A Working Capital Loan (or Cash Credit / Overdraft) is a revolving line of credit used to manage day-to-day operations like buying fabric, animal feed, or paying shop rent. NSFDC composite loans provide both term loan and working capital in a single package.",
    practicalTip: "Never use a short-term working capital loan to buy heavy permanent machinery, as working capital must be settled rapidly.",
  },
  {
    id: "promoter-contribution-margin-money",
    title: "10. What is Margin Money / Promoter's Contribution?",
    category: "Basics",
    badge: "Co-Funding",
    icon: <PieChart className="w-5 h-5 text-emerald-600" />,
    summary: "The small percentage (typically 5% to 10%) of the total business cost that the entrepreneur must invest from their own savings.",
    fullExplanation:
      "Government schemes fund 90% to 95% of your business cost. The remaining 5% to 10% is called the Promoter's Contribution or Margin Money. For example, in a ₹1,00,000 project, NSFDC provides ₹95,000 as low-interest loan, while you contribute ₹5,000. This ensures the entrepreneur has personal commitment in running the unit successfully.",
    practicalTip: "For SC/ST and BPL beneficiaries, state channelising agencies often provide state top-up grants to cover even the promoter contribution.",
  },
  {
    id: "fixed-vs-floating-interest",
    title: "11. Fixed Interest Rate vs. Floating Interest Rate — What's the difference?",
    category: "Basics",
    badge: "Interest Rules",
    icon: <Percent className="w-5 h-5 text-amber-600" />,
    summary: "Fixed rates stay constant throughout your tenure; floating rates fluctuate with Reserve Bank of India (RBI) repo rate policy.",
    fullExplanation:
      "A Fixed Interest Rate means your interest rate (e.g. 6% p.a. under NSFDC Suvidha) never changes during the entire 5-year tenure, keeping your EMI completely predictable. A Floating Rate changes whenever RBI adjusts interest rates. Most concessional social welfare schemes mandate fixed low interest rates to protect vulnerable entrepreneurs from market spikes.",
    practicalTip: "Verify on your loan sanction letter that your interest rate is explicitly fixed under government concessional caps.",
  },
  {
    id: "prepayment-foreclosure-penalty",
    title: "12. What is Prepayment or Early Foreclosure Penalty?",
    category: "Repayment",
    badge: "Repayment Rights",
    icon: <Lock className="w-5 h-5 text-indigo-600" />,
    summary: "A fee charged by commercial banks if you close your loan early; government priority schemes waive this penalty completely.",
    fullExplanation:
      "If your business earns good profits and you wish to repay your remaining loan balance early (before the 5-year tenure ends), commercial banks sometimes charge a 2% to 4% foreclosure penalty. However, under Reserve Bank of India (RBI) guidelines and government micro-credit rules, floating rate and concessional micro-loans carry ZERO prepayment penalty.",
    practicalTip: "Whenever you have surplus seasonal profit, pay extra principal towards your loan to reduce total interest liability without penalty.",
  },
  {
    id: "cgtmse-guarantee-scheme",
    title: "13. What is the Credit Guarantee Scheme (CGTMSE & NCGTC)?",
    category: "Safeguards",
    badge: "Risk Coverage",
    icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
    summary: "A national trust fund that guarantees up to 85% of your loan to the bank, removing the need for private guarantors.",
    fullExplanation:
      "Under the Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE), the Ministry of MSME acts as an institutional guarantor for first-time entrepreneurs. If a small business fails due to natural calamity or market breakdown, CGTMSE covers up to 85% of the default risk for the bank. This encourages public sector banks to lend freely to SC/ST, women, and rural youth.",
    practicalTip: "If a bank official asks for a third-party guarantor for a loan under ₹10 Lakh, remind them of CGTMSE government coverage.",
  },
  {
    id: "what-is-dic",
    title: "14. What is District Industries Centre (DIC) and how can it help you?",
    category: "Institutions",
    badge: "District Hub",
    icon: <Landmark className="w-5 h-5 text-slate-700" />,
    summary: "The district-level nodal government office that assists entrepreneurs with project approval, subsidies, and Udyam registration.",
    fullExplanation:
      "Every district in India has a District Industries Centre (DIC) headed by a General Manager (GM-DIC). DICs provide free entrepreneurship assistance, sanction PMEGP subsidies, assist with MSME registration, conduct EDP training programs, and resolve disputes between small units and banks.",
    practicalTip: "Visit your local DIC office or District Social Welfare Department for face-to-face assistance with scheme physical verification.",
  },
  {
    id: "what-is-sidbi",
    title: "15. What is SIDBI (Small Industries Development Bank of India)?",
    category: "Institutions",
    badge: "Apex Financial Body",
    icon: <Award className="w-5 h-5 text-indigo-700" />,
    summary: "The principal financial institution set up by the Government of India to promote, finance, and develop MSME enterprises.",
    fullExplanation:
      "SIDBI oversees micro-finance institutions, manages credit guarantee funds, operates the Stand-Up India portal, and offers direct refinance facilities for machinery purchase. SIDBI collaborates with corporations like NSFDC to ensure low-cost credit reaches grassroot beneficiaries.",
    practicalTip: "You can apply for Stand-Up India loans directly on the SIDBI portal or through Sahayak AI's streamlined guidance.",
  },
  {
    id: "what-is-nabard",
    title: "16. What is NABARD and how does it support rural enterprises?",
    category: "Institutions",
    badge: "Rural Development",
    icon: <Compass className="w-5 h-5 text-emerald-700" />,
    summary: "National Bank for Agriculture and Rural Development — providing credit and skill development for rural & agri-based enterprises.",
    fullExplanation:
      "If your proposed business is related to dairy farming, poultry, food processing, goat rearing, handloom weaving, or rural artisans, NABARD provides specialized refinance support, promotional grants, Self-Help Group (SHG) bank linkage, and rural producer organization support.",
    practicalTip: "Rural entrepreneurs can pair NSFDC livestock schemes with NABARD skill development grants for maximum financial support.",
  },
  {
    id: "what-is-pmsuraj",
    title: "17. What is PM-SURAJ and how does direct loan disbursement work?",
    category: "Institutions",
    badge: "Direct Benefit Portal",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    summary: "Pradhan Mantri Samajik Utthan evam Rozgar Adharit Jankalyan portal for direct credit access to SC, OBC, and Safai Karamchari entrepreneurs.",
    fullExplanation:
      "PM-SURAJ is the nationwide portal launched by MoSJ&E to streamline credit assistance from apex corporations (NSFDC, NBCFDC, NSKFDC). It enables digital document verification, eliminates middleman delays, and directly tracks loan sanctions across SCAs and participating banks.",
    practicalTip: "Use Sahayak AI's application dossier builder to prepare clean verified documents before uploading to PM-SURAJ.",
  },
  {
    id: "middlemen-fraud-safeguard",
    title: "18. How to protect yourself from fake middlemen and fraud loan agents?",
    category: "Safeguards",
    badge: "Anti-Fraud Rule",
    icon: <BadgeAlert className="w-5 h-5 text-red-600" />,
    summary: "Government loan applications and subsidy approvals are 100% FREE. Never pay cash to anyone promising guaranteed loan approval.",
    fullExplanation:
      "Fraudulent touts often target first-time applicants by demanding 5% to 10% commission in advance, claiming they have 'connections' in the bank or SCA office. Government loan approvals are strictly processed through official committees based on eligibility and genuine business feasibility. Charging fees for government loan processing is illegal under IPC Section 420.",
    practicalTip: "Report any person asking for money or commission to your District Magistrate (DM) or state anti-corruption helpline immediately.",
  },
  {
    id: "udyam-msme-registration",
    title: "19. What is MSME / Udyam Registration and why is it mandatory?",
    category: "Basics",
    badge: "Government Identity",
    icon: <Briefcase className="w-5 h-5 text-sky-700" />,
    summary: "A free, Aadhaar-linked digital identity certificate issued by the Ministry of MSME that unlocks government subsidies and priority lending.",
    fullExplanation:
      "Udyam Registration is the official birth certificate of your business. It is a 100% free online process requiring only your Aadhaar and PAN. Obtaining a Udyam Certificate entitles your unit to: (1) Concessional interest rates; (2) Priority Sector Lending (PSL) status; (3) Waiver of tender fee; and (4) Protection against delayed customer payments under the MSME Samadhaan Act.",
    practicalTip: "Register your enterprise on udyamregistration.gov.in as soon as you choose your business name—it takes less than 10 minutes.",
  },
  {
    id: "guarantor-requirement",
    title: "20. What is a Guarantor and do government schemes require one?",
    category: "Safeguards",
    badge: "Legal Protection",
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    summary: "A third party who promises to pay your loan if you default. Priority government schemes DO NOT require personal guarantors.",
    fullExplanation:
      "In commercial loans, banks ask a government employee or wealthy property owner to sign as a guarantor. Under NSFDC micro-credit, PM SVANidhi, and CGTMSE-backed loans, the requirement for personal guarantors is officially waived. The government's credit guarantee trust acts as the sole guarantor.",
    practicalTip: "If a local branch insists on bringing a government servant guarantor for a scheme loan up to ₹5 Lakh, file a query on CPGRAMS.",
  },
  {
    id: "loan-restructuring-crisis",
    title: "21. What happens if your business suffers a loss? Can you restructure your EMI?",
    category: "Repayment",
    badge: "Crisis Relief",
    icon: <HelpCircle className="w-5 h-5 text-amber-600" />,
    summary: "If natural calamity or sickness affects your business, banks can extend your loan tenure or grant additional grace periods.",
    fullExplanation:
      "If an unforeseen event (floods, medical emergency, shop fire) halts your income, do NOT disappear or ignore bank notices. RBI guidelines empower public sector banks to restructure loans by: (1) Extending the repayment tenure from 5 years to 7 years (which lowers your monthly EMI); (2) Granting a temporary 3 to 6 month EMI holiday; or (3) Converting accrued interest into a separate easy installment.",
    practicalTip: "Submit a written application with proof of disruption (e.g. medical report or calamity certificate) to your branch manager before EMI due date.",
  },
  {
    id: "interest-subvention-explained",
    title: "22. What is an Interest Subvention Scheme?",
    category: "Repayment",
    badge: "Rate Subsidy",
    icon: <Percent className="w-5 h-5 text-emerald-600" />,
    summary: "A discount offered by the government where a portion of your loan interest (e.g. 2% or 3%) is paid by the state on your behalf.",
    fullExplanation:
      "Interest subvention is a financial incentive for prompt repayment. If the market loan interest rate is 10% and the government offers a 3% interest subvention for timely payments, your effective interest rate drops to only 7%. The government deposits the 3% difference directly into your bank account every quarter.",
    practicalTip: "Never delay your EMI by even a single day, as missing due dates disqualifies you from claiming quarterly interest subvention benefits.",
  },
  {
    id: "psb-vs-private-banks",
    title: "23. What is the difference between Public Sector Banks (PSBs) and Private Banks?",
    category: "Institutions",
    badge: "Banking Channels",
    icon: <Building2 className="w-5 h-5 text-blue-700" />,
    summary: "Public Sector Banks (e.g. SBI, PNB) are government-owned and mandate social welfare lending; Private Banks focus on commercial returns.",
    fullExplanation:
      "Public Sector Banks (PSBs) like State Bank of India, Punjab National Bank, and Bank of Baroda are majority-owned by the Government of India and have statutory targets for SC/ST, women, and micro-loan lending under Priority Sector Lending (PSL) quotas. SCAs and apex corporations like NSFDC channel maximum concessional credit through PSBs and RRBs.",
    practicalTip: "For government scheme applications, always prefer PSBs or your District Central Cooperative Bank / Regional Rural Bank over private commercial banks.",
  },
  {
    id: "business-bank-account-accounting",
    title: "24. Why is separate business bank account accounting essential for loan approval?",
    category: "Safeguards",
    badge: "Financial Health",
    icon: <CreditCard className="w-5 h-5 text-teal-700" />,
    summary: "Separating your shop transactions from personal household expenses builds transparent bank statements for higher loan approvals.",
    fullExplanation:
      "Many small shopkeepers mix household grocery expenses with daily business earnings. When a bank officer inspects your bank statement, unrecorded cash transactions make your business look unprofitable. Opening a dedicated Current Account or Savings Account exclusively for business income/expenses creates digital proof of cash flow, making future loan expansion effortless.",
    practicalTip: "Route all QR code UPI payments (PhonePe, Paytm, Google Pay) into a dedicated business account to build strong loan eligibility.",
  },
  {
    id: "business-insurance-protection",
    title: "25. What is Business Insurance (Machinery & Shop Protection) and is it required?",
    category: "Safeguards",
    badge: "Asset Safety",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    summary: "Low-cost government insurance protecting your machines, livestock, or shop inventory against fire, theft, or natural disasters.",
    fullExplanation:
      "When you purchase machinery or livestock with a scheme loan, banks bundle low-cost property/livestock insurance (e.g. under Pradhan Mantri Suraksha Bima Yojana). If a fire damages your shop or livestock dies, insurance pays off the remaining bank loan, saving your family from debt traps.",
    practicalTip: "Ensure your livestock tag (ear tag) or machinery serial number is correctly updated on the insurance policy document.",
  },
  {
    id: "gst-registration-rules",
    title: "26. What is GST Registration and do small micro-enterprises need it?",
    category: "Safeguards",
    badge: "Tax Norms",
    icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
    summary: "Goods and Services Tax registration. Micro-enterprises with annual turnover below ₹20 Lakh (services) or ₹40 Lakh (goods) are EXEMPT.",
    fullExplanation:
      "First-time micro-entrepreneurs often fear that taking a government loan requires immediate GST registration and complex monthly tax filing. Under GST rules, small businesses with an annual turnover under ₹40 Lakh (for goods) or ₹20 Lakh (for services) are completely exempt from GST registration.",
    practicalTip: "You do NOT need a GST number to apply for micro-credit loans up to ₹5 Lakh under NSFDC Suvidha or MUDRA Kishore.",
  },
  {
    id: "standup-india-scheme",
    title: "27. What is Stand-Up India Scheme for SC/ST & Women Entrepreneurs?",
    category: "Institutions",
    badge: "High-Value Capital",
    icon: <Sparkles className="w-5 h-5 text-amber-600" />,
    summary: "A flagship central scheme offering loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST and one Woman borrower per bank branch.",
    fullExplanation:
      "Stand-Up India facilitates bank loans from ₹10 Lakh to ₹1 Crore for setting up greenfield (new) enterprises in manufacturing, services, or trading sector. Every bank branch in India is mandated to sanction at least two Stand-Up India loans per year—one to an SC/ST borrower and one to a Woman borrower.",
    practicalTip: "After successfully repaying your initial micro-loan, use Stand-Up India to scale your enterprise to a commercial factory or regional service unit.",
  },
  {
    id: "pmsvanidhi-street-vendors",
    title: "28. What is PM SVANidhi for Urban & Semi-Urban Street Vendors?",
    category: "Basics",
    badge: "Micro-Credit",
    icon: <Coins className="w-5 h-5 text-sky-600" />,
    summary: "Collateral-free working capital loan starting at ₹10,000 with 7% interest subvention and cash-back rewards for digital UPI transactions.",
    fullExplanation:
      "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi) provides affordable working capital loans to street vendors, cobblers, vegetable sellers, and food stall operators. It starts with a 1st tranche of ₹10,000. Upon timely repayment, you become eligible for a 2nd tranche of ₹20,000 and a 3rd tranche of ₹50,000 with additional digital cashback.",
    practicalTip: "Accept digital payments using your UPI QR code to earn up to ₹1,200 annual cashback directly deposited into your bank account.",
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
            <BookOpen className="w-3.5 h-3.5" /> Financial Literacy Hub • 28 Master Lessons
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Plain-Language Financial Guide
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            No bureaucratic jargon. 28 clear, honest explanations of loan terms, grace periods, subsidies, credit health, CIBIL scores, and anti-fraud rules designed for first-time entrepreneurs.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search 28 topics (EMI, subsidy, CIBIL, DPR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => {
              const count = cat === "All" ? TOPICS.length : TOPICS.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCat === cat
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCat === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
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

