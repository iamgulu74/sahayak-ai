export type LanguageCode = "en" | "hi" | "or";

export interface Translations {
  // Navigation
  schemes: string;
  checkEligibility: string;
  ocrDocs: string;
  emiCalculator: string;
  findPartner: string;
  aiAssistant: string;
  literacyHub: string;
  watchTutorialDemo: string;
  login: string;
  logout: string;
  myDashboard: string;
  getStarted: string;

  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  findMySchemeBtn: string;
  exploreSchemesBtn: string;
  watchTutorialBtn: string;
  antiFraudBanner: string;

  // Stats
  verifiedSchemesLabel: string;
  maxFinancingLabel: string;
  concessionalRateLabel: string;
  activePartnersLabel: string;

  // Partners Page
  locatePartnersTitle: string;
  locatePartnersSubtitle: string;
  filterByState: string;
  allSchemes: string;
  simulateAutoRerouting: string;
  highFundAvailability: string;
  limitedQuota: string;
  restricted: string;
  currentBacklog: string;
  avgProcessingSpeed: string;
  trackApplicationBtn: string;
  preparePaperworkBtn: string;

  // Fraud Report
  reportFraudTitle: string;
  reportFraudSubtitle: string;
  reportSubmittedSuccess: string;
  reportSentToEmail: string;

  // Badges & Common
  verifiedBadge: string;
  aiAssistedBadge: string;
  demoDataBadge: string;

  // Additional Common UI Terms
  howItWorks: string;
  compareSchemes: string;
  projectCost: string;
  searchSchemes: string;
  allCategories: string;
  applyNow: string;
  viewDetails: string;
  eligible: string;
  notEligible: string;
  matchScore: string;
  annualIncome: string;
  interestRate: string;
  moratoriumPeriod: string;
  repaymentPeriod: string;
  documentsChecklist: string;
  verifyDocumentsNow: string;
  officialPortal: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    schemes: "Schemes",
    checkEligibility: "Check Eligibility",
    ocrDocs: "OCR & Docs",
    emiCalculator: "EMI Calculator",
    findPartner: "Find Partner",
    aiAssistant: "AI Assistant",
    literacyHub: "Literacy Hub",
    watchTutorialDemo: "▶ How It Works Guide",
    login: "Sign In",
    logout: "Sign Out",
    myDashboard: "Dashboard",
    getStarted: "Get Started",

    heroBadge: "AI-Powered Scheme Discovery & Partner Routing for SC Entrepreneurs",
    heroTitle: "The Right Scheme.",
    heroHighlight: "The Right Partner. The Right Path.",
    heroSubtitle: "Zero-hallucination scheme matching, deterministic eligibility checks, and live channel partner routing under Ministry of Social Justice & Empowerment (NSFDC) guidelines.",
    findMySchemeBtn: "Find My Scheme (Questionnaire)",
    exploreSchemesBtn: "Explore 9 Verified Schemes",
    watchTutorialBtn: "▶ How Sahayak Works (Step-by-Step)",
    antiFraudBanner: "Official Advisory: Government scheme registrations are 100% FREE. Never pay private middlemen or commission agents.",

    verifiedSchemesLabel: "Verified Schemes",
    maxFinancingLabel: "Max Financing (Up to ₹50L)",
    concessionalRateLabel: "Concessional Rates (From 6% p.a.)",
    activePartnersLabel: "Active Channel Partners",

    locatePartnersTitle: "Locate Authorized Channel Partners",
    locatePartnersSubtitle: "Connect with verified State Channelising Agencies (SCAs), Public Sector Banks, and RRBs authorized to disburse your scheme.",
    filterByState: "Filter by State:",
    allSchemes: "All Schemes Supported",
    simulateAutoRerouting: "Simulate Live Auto-Rerouting",
    highFundAvailability: "High Fund Availability",
    limitedQuota: "Limited Quota / Backlog",
    restricted: "Not Accepting",
    currentBacklog: "Current Backlog",
    avgProcessingSpeed: "Processing Speed",
    trackApplicationBtn: "Track Application",
    preparePaperworkBtn: "Prepare Paperwork",

    reportFraudTitle: "Fraud & Scam Prevention Center",
    reportFraudSubtitle: "Protecting marginalized entrepreneurs from predatory middlemen, unauthorized fee demands, and fake sanction letters.",
    reportSubmittedSuccess: "Incident Dossier Dispatched",
    reportSentToEmail: "Report transmitted to Chief Vigilance Officer at jasaswid83@gmail.com",

    verifiedBadge: "✓ Verified Data",
    aiAssistedBadge: "🤖 AI-Assisted",
    demoDataBadge: "🛡️ Official & Verified",

    howItWorks: "How It Works",
    compareSchemes: "Compare Schemes",
    projectCost: "Project Cost Estimator",
    searchSchemes: "Search Schemes...",
    allCategories: "All Categories",
    applyNow: "Apply on PM-SURAJ",
    viewDetails: "View Full Guidelines",
    eligible: "Eligible",
    notEligible: "Not Eligible",
    matchScore: "Match Score",
    annualIncome: "Annual Income",
    interestRate: "Interest Rate",
    moratoriumPeriod: "Moratorium Grace Period",
    repaymentPeriod: "Repayment Period",
    documentsChecklist: "Required Documents Checklist",
    verifyDocumentsNow: "Verify via Real OCR →",
    officialPortal: "Official Portal",
  },

  hi: {
    schemes: "योजनाएं",
    checkEligibility: "पात्रता जांचें",
    ocrDocs: "दस्तावेज़ और ओसीआर",
    emiCalculator: "ईएमआई कैलकुलेटर",
    findPartner: "पार्टनर खोजें",
    aiAssistant: "एआई सहायक",
    literacyHub: "वित्तीय साक्षरता",
    watchTutorialDemo: "▶ प्रक्रिया मार्गदर्शिका",
    login: "साइन इन करें",
    logout: "साइन आउट",
    myDashboard: "डैशबोर्ड",
    getStarted: "शुरू करें",

    heroBadge: "अनुसूचित जाति (SC) उद्यमियों के लिए एआई योजना खोज और पार्टनर रूटिंग",
    heroTitle: "सही योजना।",
    heroHighlight: "सही पार्टनर। सही मार्ग।",
    heroSubtitle: "सामाजिक न्याय एवं अधिकारिता मंत्रालय (NSFDC) के दिशानिर्देशों के तहत सटीक योजना मिलान, निर्धारित पात्रता जांच और चैनल पार्टनर रूटिंग।",
    findMySchemeBtn: "मेरी योजना खोजें (प्रश्नावली)",
    exploreSchemesBtn: "9 सत्यापित योजनाएं देखें",
    watchTutorialBtn: "▶ सहायक कैसे काम करता है (चरण-दर-चरण)",
    antiFraudBanner: "आधिकारिक सलाह: सरकारी योजना पंजीकरण 100% निःशुल्क है। किसी भी बिचौलिए या दलाल को कमीशन न दें।",

    verifiedSchemesLabel: "सत्यापित योजनाएं",
    maxFinancingLabel: "अधिकतम ऋण (₹50 लाख तक)",
    concessionalRateLabel: "रियायती ब्याज दर (6% प्रति वर्ष से)",
    activePartnersLabel: "सक्रिय चैनल पार्टनर्स",

    locatePartnersTitle: "अधिकृत चैनल पार्टनर्स खोजें",
    locatePartnersSubtitle: "राज्य चैनलाइजिंग एजेंसियों (SCA), राष्ट्रीयकृत बैंकों और क्षेत्रीय ग्रामीण बैंकों से जुड़ें जो आपकी योजना का वितरण करते हैं।",
    filterByState: "राज्य द्वारा फ़िल्टर करें:",
    allSchemes: "सभी योजनाएं समर्थित",
    simulateAutoRerouting: "लाइव ऑटो-रूटिंग का परीक्षण करें",
    highFundAvailability: "उच्च निधि उपलब्धता",
    limitedQuota: "सीमित कोटा / बैकलॉग",
    restricted: "आवेदन बंद",
    currentBacklog: "वर्तमान बैकलॉग",
    avgProcessingSpeed: "प्रसंस्करण गति",
    trackApplicationBtn: "आवेदन ट्रैक करें",
    preparePaperworkBtn: "दस्तावेज़ तैयार करें",

    reportFraudTitle: "धोखाधड़ी और घोटाला रोकथाम केंद्र",
    reportFraudSubtitle: "उद्यमियों को अवैध कमीशन एजेंटों और फर्जी स्वीकृति पत्रों से सुरक्षित रखना।",
    reportSubmittedSuccess: "शिकायत दर्ज कर दी गई है",
    reportSentToEmail: "मुख्य सतर्कता अधिकारी jasaswid83@gmail.com को रिपोर्ट भेजी गई",

    verifiedBadge: "✓ सत्यापित डेटा",
    aiAssistedBadge: "🤖 एआई-सहायता प्राप्त",
    demoDataBadge: "🛡️ आधिकारिक और सत्यापित",

    howItWorks: "यह कैसे काम करता है",
    compareSchemes: "योजनाओं की तुलना करें",
    projectCost: "परियोजना लागत अनुमानक",
    searchSchemes: "योजनाएं खोजें...",
    allCategories: "सभी श्रेणियां",
    applyNow: "PM-SURAJ पर आवेदन करें",
    viewDetails: "पूर्ण विवरण देखें",
    eligible: "पात्र",
    notEligible: "अपात्र",
    matchScore: "मिलान स्कोर",
    annualIncome: "वार्षिक पारिवारिक आय",
    interestRate: "ब्याज दर",
    moratoriumPeriod: "मोराटोरियम छूट अवधि",
    repaymentPeriod: "पुनर्भुगतान अवधि",
    documentsChecklist: "आवश्यक दस्तावेज़ चेकलिस्ट",
    verifyDocumentsNow: "ओसीआर द्वारा सत्यापित करें →",
    officialPortal: "आधिकारिक पोर्टल",
  },

  or: {
    schemes: "ଯୋଜନା ସମୂହ",
    checkEligibility: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ",
    ocrDocs: "ଦସ୍ତାବିଜ ଓ OCR",
    emiCalculator: "EMI କାଲକୁଲେଟର",
    findPartner: "ପାର୍ଟନର ଖୋଜନ୍ତୁ",
    aiAssistant: "AI ସହାୟକ",
    literacyHub: "ଆର୍ଥିକ ସାକ୍ଷରତା",
    watchTutorialDemo: "▶ ପ୍ରକ୍ରିୟା ମାର୍ଗଦର୍ଶିକା",
    login: "ଲଗ୍-ଇନ୍",
    logout: "ଲଗ୍-ଆଉଟ୍",
    myDashboard: "ଡ୍ୟାସବୋର୍ଡ",
    getStarted: "ଆରମ୍ଭ କରନ୍ତୁ",

    heroBadge: "SC ଉଦ୍ୟୋଗୀମାନଙ୍କ ପାଇଁ AI-ଆଧାରିତ ଯୋଜନା ଓ ପାର୍ଟନର ଚୟନ",
    heroTitle: "ସଠିକ୍ ଯୋଜନା।",
    heroHighlight: "ସଠିକ୍ ପାର୍ଟନର। ସଠିକ୍ ପଥ।",
    heroSubtitle: "ସାମାଜିକ ନ୍ୟାୟ ଓ ସଶକ୍ତୀକରଣ ମନ୍ତ୍ରଣାଳୟ (NSFDC) ନିୟମ ଅନୁଯାୟୀ ସଠିକ୍ ଯୋଜନା ଚୟନ, ନିର୍ଦ୍ଧାରିତ ଯୋଗ୍ୟତା ଯାଞ୍ଚ ଏବଂ ଚ୍ୟାନେଲ ପାର୍ଟନର ରୂଟିଂ।",
    findMySchemeBtn: "ମୋ ପାଇଁ ଯୋଜନା ଖୋଜନ୍ତୁ",
    exploreSchemesBtn: "୯ଟି ପ୍ରମାଣିତ ଯୋଜନା ଦେଖନ୍ତୁ",
    watchTutorialBtn: "▶ ସହାୟକ କିପରି କାର୍ଯ୍ୟ କରେ (ପଦକ୍ଷେପ-ଅନୁସାରେ)",
    antiFraudBanner: "ସରକାରୀ ସୂଚନା: ସରକାରୀ ଯୋଜନା ପଞ୍ଜୀକରଣ ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା। କୌଣସି ଦଲାଲଙ୍କୁ ଟଙ୍କା ଦିଅନ୍ତୁ ନାହିଁ।",

    verifiedSchemesLabel: "ପ୍ରମାଣିତ ଯୋଜନା",
    maxFinancingLabel: "ସର୍ବାଧିକ ଋଣ (₹୫୦ ଲକ୍ଷ ପର୍ଯ୍ୟନ୍ତ)",
    concessionalRateLabel: "ରିହାତି ସୁଧ ହାର (୬% ରୁ ଆରମ୍ଭ)",
    activePartnersLabel: "ସକ୍ରିୟ ଚ୍ୟାନେଲ ପାର୍ଟନର",

    locatePartnersTitle: "ଅନୁମୋଦିତ ଚ୍ୟାନେଲ ପାର୍ଟନର ଖୋଜନ୍ତୁ",
    locatePartnersSubtitle: "ଓଡ଼ିଶା ରାଜ୍ୟ ଅନୁସୂଚିତ ଜାତି ଓ ଜନଜାତି ଉନ୍ନୟନ ନିଗମ (OSFDC), ବ୍ୟାଙ୍କ ଓ ଗ୍ରାମ୍ୟ ବ୍ୟାଙ୍କ ସହ ସିଧାସଳଖ ଯୋଡ଼ି ହୁଅନ୍ତୁ।",
    filterByState: "ରାଜ୍ୟ ଅନୁଯାୟୀ ବାଛନ୍ତୁ:",
    allSchemes: "ସମସ୍ତ ଯୋଜନା ଉପଲବ୍ଧ",
    simulateAutoRerouting: "ଲାଇଭ୍ ଅଟୋ-ରୁଟିଂ ପରୀକ୍ଷା",
    highFundAvailability: "ପର୍ଯ୍ୟାପ୍ତ ଅର୍ଥ ଉପଲବ୍ଧ",
    limitedQuota: "ସୀମିତ କୋଟା",
    restricted: "ଆବେଦନ ବନ୍ଦ",
    currentBacklog: "ବର୍ତ୍ତମାନର ବ୍ୟାକଲଗ୍",
    avgProcessingSpeed: "ପ୍ରକ୍ରିୟାକରଣ ଗତି",
    trackApplicationBtn: "ଆବେଦନ ଟ୍ରାକ୍ କରନ୍ତୁ",
    preparePaperworkBtn: "ଦସ୍ତାବିଜ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",

    reportFraudTitle: "ଠକାମି ଓ ଜାଲିଆତି ରୋକଥାମ କେନ୍ଦ୍ର",
    reportFraudSubtitle: "ଉଦ୍ୟୋଗୀମାନଙ୍କୁ ଦଲାଲ ଏବଂ ନକଲି ମଞ୍ଜୁରୀ ପତ୍ରରୁ ସୁରକ୍ଷିତ ରଖିବା।",
    reportSubmittedSuccess: "ଅଭିଯୋଗ ପଠାଯାଇଛି",
    reportSentToEmail: "ମୁଖ୍ୟ ଭିଜିଲାନ୍ସ ଅଧିକାରୀ jasaswid83@gmail.com ଙ୍କୁ ପଠାଗଲା",

    verifiedBadge: "✓ ପ୍ରମାଣିତ ତଥ୍ୟ",
    aiAssistedBadge: "🤖 AI-ସହାୟତା ପ୍ରାପ୍ତ",
    demoDataBadge: "🛡️ ଅଫିସିଆଲ୍ ଓ ସତ୍ୟାପିତ",

    howItWorks: "ଏହା କିପରି କାର୍ଯ୍ୟ କରେ",
    compareSchemes: "ଯୋଜନା ତୁଳନା କରନ୍ତୁ",
    projectCost: "ପ୍ରକଳ୍ପ ଖର୍ଚ୍ଚ ହିସାବ",
    searchSchemes: "ଯୋଜନା ଖୋଜନ୍ତୁ...",
    allCategories: "ସମସ୍ତ ବର୍ଗ",
    applyNow: "PM-SURAJ ରେ ଆବେଦନ କରନ୍ତୁ",
    viewDetails: "ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ ଦେଖନ୍ତୁ",
    eligible: "ଯୋଗ୍ୟ",
    notEligible: "ଅଯୋଗ୍ୟ",
    matchScore: "ମ୍ୟାଚ୍ ସ୍କୋର",
    annualIncome: "ବାର୍ଷିକ ପାରିବାରିକ ଆୟ",
    interestRate: "ସୁଧ ହାର",
    moratoriumPeriod: "ମୋରାଟୋରିୟମ ଛାଡ଼ ଅବଧି",
    repaymentPeriod: "ପରିଶୋଧ ଅବଧି",
    documentsChecklist: "ଆବଶ୍ୟକ ଦସ୍ତାବିଜ ତାଲିକା",
    verifyDocumentsNow: "OCR ଦ୍ୱାରା ଯାଞ୍ଚ କରନ୍ତୁ →",
    officialPortal: "ଅଫିସିଆଲ୍ ପୋର୍ଟାଲ୍",
  },
};
