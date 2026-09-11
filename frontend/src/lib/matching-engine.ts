import { SCHEMES, Scheme } from "./schemes-data";

export interface UserProfile {
  name: string;
  age: number;
  state: string;
  district: string;
  category: "SC" | "ST" | "OBC" | "General" | "Minority";
  gender: "male" | "female" | "other";
  annualIncomeLakh: number;
  educationLevel: "primary" | "secondary" | "graduate" | "postgraduate" | "vocational";
  businessStatus: "none" | "starting" | "existing" | "student" | "trainee";
  businessType: string;
  businessDescription: string;
  projectCostLakh: number;
  loanRequiredLakh: number;
  purpose: string;
  isStreetVendor: boolean;
  isWoman: boolean;
  isFarmer: boolean;
  languagePreference: "en" | "hi" | "or";
  aadhaarMasked?: string;
  panMasked?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  aadhaarVerified?: boolean;
  panVerified?: boolean;
  phone?: string;
  verified?: boolean;
  photoUrl?: string;
}

export interface EligibilityCriterion {
  key: string;
  label: string;
  status: "eligible" | "partial" | "not_eligible";
  userValue: string;
  schemeValue: string;
  reason: string;
}

export interface SchemeMatch {
  scheme: Scheme;
  matchScore: number;
  isEligible: boolean;
  criteria: EligibilityCriterion[];
  failedCriteria: EligibilityCriterion[];
  financialSummary: {
    eligibleLoanLakh: number;
    ownContributionLakh: number;
    interestRate: number;
    estimatedEMI: number;
    moratoriumMonths: number;
    repaymentYears: number;
  };
}

export function calculateEMI(principal: number, ratePercent: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  const r = ratePercent / 12 / 100;
  if (r === 0) return Math.round(principal / tenureMonths);
  return Math.round((principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
}

export function matchSchemes(profile: UserProfile): SchemeMatch[] {
  if (!profile || !profile.projectCostLakh || profile.projectCostLakh <= 0) {
    return [];
  }
  const results: SchemeMatch[] = [];
  const activeSchemes = SCHEMES.filter((s) => s.status === "active");

  for (const scheme of activeSchemes) {
    const criteria: EligibilityCriterion[] = [];
    const failedCriteria: EligibilityCriterion[] = [];
    let totalScore = 0;
    let maxScore = 0;
    let isEligible = true;

    // 1. Social Category check (HARD GATE)
    const categoryPass = scheme.eligibleCategories.includes(profile.category);
    const critCategory: EligibilityCriterion = {
      key: "category",
      label: "Social Category",
      status: categoryPass ? "eligible" : "not_eligible",
      userValue: profile.category,
      schemeValue: scheme.eligibleCategories.join(", "),
      reason: categoryPass
        ? `Your category (${profile.category}) is fully eligible.`
        : `Requires: ${scheme.eligibleCategories.join(", ")}. Your profile indicates ${profile.category}.`,
    };
    if (!categoryPass) {
      isEligible = false;
      failedCriteria.push(critCategory);
    } else {
      criteria.push(critCategory);
      totalScore += 25;
    }
    maxScore += 25;

    // 2. Income Ceiling check (HARD GATE)
    const incomeLimit = scheme.incomeLimitLakh;
    const incomePass = profile.annualIncomeLakh <= incomeLimit;
    const critIncome: EligibilityCriterion = {
      key: "income",
      label: "Annual Family Income",
      status: incomePass ? "eligible" : "not_eligible",
      userValue: `₹${profile.annualIncomeLakh} Lakh/year`,
      schemeValue: `Up to ₹${incomeLimit} Lakh/year${scheme.incomeCeilingEffectiveDate ? ` (verified ceiling)` : ""}`,
      reason: incomePass
        ? `Your income of ₹${profile.annualIncomeLakh}L is within the official limit of ₹${incomeLimit}L/year.`
        : `Your income (₹${profile.annualIncomeLakh}L) exceeds the maximum ceiling of ₹${incomeLimit}L/year.`,
    };
    if (!incomePass) {
      isEligible = false;
      failedCriteria.push(critIncome);
    } else {
      criteria.push(critIncome);
      totalScore += 25;
    }
    maxScore += 25;

    // 3. Gender check (HARD GATE for women-only schemes)
    if (scheme.genderCriteria === "women_only") {
      const isWomanUser = profile.gender === "female" || profile.isWoman;
      const critGender: EligibilityCriterion = {
        key: "gender",
        label: "Gender Criteria",
        status: isWomanUser ? "eligible" : "not_eligible",
        userValue: profile.gender === "female" ? "Female" : "Male / Other",
        schemeValue: "Women Only",
        reason: isWomanUser
          ? "You qualify for this exclusive women-focused entrepreneurship scheme."
          : "Mahila Samriddhi Yojana (MSY) is exclusively reserved for women entrepreneurs.",
      };
      if (!isWomanUser) {
        isEligible = false;
        failedCriteria.push(critGender);
      } else {
        criteria.push(critGender);
        totalScore += 15;
      }
      maxScore += 15;
    } else {
      criteria.push({
        key: "gender",
        label: "Gender Criteria",
        status: "eligible",
        userValue: profile.gender,
        schemeValue: "All genders eligible",
        reason: "This scheme is open to all eligible applicants.",
      });
      totalScore += 10;
      maxScore += 10;
    }

    // 4. Age bounds check (HARD GATE)
    const agePass = profile.age >= scheme.minAge && profile.age <= scheme.maxAge;
    const critAge: EligibilityCriterion = {
      key: "age",
      label: "Age Requirement",
      status: agePass ? "eligible" : "not_eligible",
      userValue: `${profile.age} years`,
      schemeValue: `${scheme.minAge}–${scheme.maxAge} years`,
      reason: agePass
        ? `Applicant age (${profile.age} years) is within the eligible bracket.`
        : `Age must be between ${scheme.minAge} and ${scheme.maxAge} years.`,
    };
    if (!agePass) {
      isEligible = false;
      failedCriteria.push(critAge);
    } else {
      criteria.push(critAge);
      totalScore += 10;
    }
    maxScore += 10;

    // 5. Project Cost / Loan Requirement fit
    const userLoan = profile.loanRequiredLakh || profile.projectCostLakh * 0.9;
    const maxAllowedLoan = scheme.maxLoanLakh;
    const minAllowedLoan = scheme.minLoanLakh;
    const loanFits = userLoan >= minAllowedLoan && userLoan <= maxAllowedLoan;
    const loanPartial = !loanFits && userLoan <= maxAllowedLoan * 1.25;

    const critLoan: EligibilityCriterion = {
      key: "loan_fit",
      label: "Loan Fit & Amount",
      status: loanFits ? "eligible" : loanPartial ? "partial" : "not_eligible",
      userValue: `₹${userLoan.toFixed(2)} Lakh`,
      schemeValue: `₹${minAllowedLoan}–₹${maxAllowedLoan} Lakh`,
      reason: loanFits
        ? `Your required loan amount fits comfortably within the scheme's limit (up to ₹${maxAllowedLoan}L).`
        : loanPartial
        ? `Your requirement (₹${userLoan.toFixed(2)}L) slightly exceeds the limit; partial funding up to ₹${maxAllowedLoan}L may be granted.`
        : `Loan requirement is outside standard limits for this scheme.`,
    };

    if (userLoan > maxAllowedLoan * 1.5) {
      isEligible = false;
      failedCriteria.push(critLoan);
    } else {
      criteria.push(critLoan);
      totalScore += loanFits ? 15 : loanPartial ? 8 : 4;
    }
    maxScore += 15;

    // 6. Purpose & Activity Alignment
    const combinedText = `${profile.purpose} ${profile.businessType} ${profile.businessDescription}`.toLowerCase();
    const purposeKeywords: Record<string, string[]> = {
      business_start: ["start", "new", "setup", "launch", "begin", "nascent"],
      business_expansion: ["expand", "expansion", "grow", "scale", "upgrade", "second unit"],
      machinery: ["machine", "machinery", "equipment", "tool", "sewing", "lathe", "cutter", "tailor"],
      working_capital: ["working capital", "stock", "raw material", "inventory", "daily", "cloth", "fabric"],
      skill_development: ["skill", "training", "vocational", "learn", "tailoring training"],
      agriculture: ["agri", "farming", "dairy", "poultry", "goat", "goatery", "cattle"],
    };

    let alignmentScore = 5;
    for (const p of scheme.purpose) {
      const kwList = purposeKeywords[p] || [];
      if (kwList.some((kw) => combinedText.includes(kw))) {
        alignmentScore = 15;
        break;
      }
    }

    criteria.push({
      key: "purpose",
      label: "Business Activity & Purpose",
      status: alignmentScore >= 12 ? "eligible" : "partial",
      userValue: profile.businessType || profile.purpose || "General",
      schemeValue: scheme.purpose.join(", ").replace(/_/g, " "),
      reason:
        alignmentScore >= 12
          ? "Your business activity and machinery requirement align directly with scheme objectives."
          : "Partial alignment with scheme focus areas.",
    });
    totalScore += alignmentScore;
    maxScore += 15;

    // Calculate effective interest rate (check women concession)
    let effectiveRate = scheme.interestRatePercent;
    if (scheme.genderBasedRate && (profile.gender === "female" || profile.isWoman)) {
      effectiveRate = scheme.interestRateWomen || scheme.interestRatePercent - 0.5;
    }

    // Financial breakdown
    const eligibleLoan = Math.min(
      userLoan,
      profile.projectCostLakh * (scheme.financingPercent / 100),
      scheme.maxLoanLakh
    );
    const ownContribution = Math.max(0, profile.projectCostLakh - eligibleLoan);
    const tenureMonths = scheme.repaymentYears * 12 - scheme.moratoriumMonthsMin;
    const principalRs = eligibleLoan * 100000;
    const estimatedEMI = calculateEMI(principalRs, effectiveRate, tenureMonths);

    const matchScore = isEligible ? Math.min(100, Math.round((totalScore / maxScore) * 100)) : 0;

    results.push({
      scheme,
      matchScore,
      isEligible,
      criteria: isEligible ? criteria : [],
      failedCriteria,
      financialSummary: {
        eligibleLoanLakh: Math.round(eligibleLoan * 100) / 100,
        ownContributionLakh: Math.round(ownContribution * 100) / 100,
        interestRate: effectiveRate,
        estimatedEMI,
        moratoriumMonths: scheme.moratoriumMonthsMin,
        repaymentYears: scheme.repaymentYears,
      },
    });
  }

  // Sort: eligible first by match score descending, then ineligible
  return results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });
}

// Default baseline profile template without hardcoded demo data
export const EMPTY_USER_PROFILE: UserProfile = {
  name: "",
  age: 0,
  state: "Odisha",
  district: "",
  category: "SC",
  gender: "male",
  annualIncomeLakh: 0,
  educationLevel: "secondary",
  businessStatus: "none",
  businessType: "",
  businessDescription: "",
  projectCostLakh: 0,
  loanRequiredLakh: 0,
  purpose: "",
  isStreetVendor: false,
  isWoman: false,
  isFarmer: false,
  languagePreference: "en",
  aadhaarMasked: "",
  panMasked: "",
  phone: "",
};

export const DEFAULT_DEMO_PROFILE: UserProfile = EMPTY_USER_PROFILE;
