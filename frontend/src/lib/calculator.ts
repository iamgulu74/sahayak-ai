export interface CalculatorInputs {
  projectCostRs: number;
  loanAmountRs: number;
  interestRatePercent: number;
  tenureYears: number;
  moratoriumMonths: number;
}

export interface CalculatorOutputs {
  eligibleLoanRs: number;
  ownContributionRs: number;
  monthlyEMI: number;
  totalInterestRs: number;
  totalRepaymentRs: number;
  effectiveTenureMonths: number;
  repaymentSchedule: RepaymentRow[];
}

export interface RepaymentRow {
  year: number;
  principal: number;
  interest: number;
  balance: number;
  emi: number;
}

export function calculateEMI(
  principalRs: number,
  annualRatePercent: number,
  tenureMonths: number
): number {
  if (tenureMonths <= 0 || principalRs <= 0) return 0;
  const r = annualRatePercent / 12 / 100;
  if (r === 0) return Math.round(principalRs / tenureMonths);
  const emi = (principalRs * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

export function calculate(inputs: CalculatorInputs): CalculatorOutputs {
  const { projectCostRs, loanAmountRs, interestRatePercent, tenureYears, moratoriumMonths } = inputs;

  const eligibleLoanRs = Math.min(loanAmountRs, projectCostRs * 0.9);
  const ownContributionRs = Math.max(0, projectCostRs - eligibleLoanRs);
  const totalTenureMonths = tenureYears * 12;
  const effectiveTenureMonths = Math.max(1, totalTenureMonths - moratoriumMonths);
  const monthlyEMI = calculateEMI(eligibleLoanRs, interestRatePercent, effectiveTenureMonths);
  const totalRepaymentRs = monthlyEMI * effectiveTenureMonths;
  const totalInterestRs = Math.max(0, totalRepaymentRs - eligibleLoanRs);

  // Generate yearly repayment schedule
  const repaymentSchedule: RepaymentRow[] = [];
  let balance = eligibleLoanRs;
  const r = interestRatePercent / 12 / 100;

  for (let year = 1; year <= tenureYears; year++) {
    const monthsInYear = 12;
    let yearPrincipal = 0;
    let yearInterest = 0;
    const yearEMI = year * 12 <= moratoriumMonths ? 0 : monthlyEMI;

    for (let m = 0; m < monthsInYear; m++) {
      const globalMonth = (year - 1) * 12 + m + 1;
      if (globalMonth <= moratoriumMonths) {
        // During moratorium, interest may accrue (simplified: no payment)
        yearInterest += balance * r;
        continue;
      }
      if (balance <= 0) break;
      const interestForMonth = balance * r;
      const principalForMonth = Math.min(yearEMI - interestForMonth, balance);
      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }

    repaymentSchedule.push({
      year,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.round(balance),
      emi: yearEMI,
    });

    if (balance <= 0) break;
  }

  return {
    eligibleLoanRs: Math.round(eligibleLoanRs),
    ownContributionRs: Math.round(ownContributionRs),
    monthlyEMI,
    totalInterestRs: Math.round(totalInterestRs),
    totalRepaymentRs: Math.round(totalRepaymentRs),
    effectiveTenureMonths,
    repaymentSchedule,
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatCurrencyExact(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
