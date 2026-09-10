export interface SubmittedApplication {
  applicationId: string;
  userId?: string;
  applicantEmail?: string;
  schemeId: string;
  schemeName: string;
  schemeShortName: string;
  applicantName: string;
  applicantPhone: string;
  applicantCategory: string;
  applicantState: string;
  applicantDistrict?: string;
  loanAmountLakh: number;
  purpose: string;
  channelPartner: string;
  appliedDate: string;
  currentStageId: number; // 1 to 7
  stageDates: Record<number, string>;
  notes: string;
}

const STORAGE_KEY = "sahayak_submitted_applications";

export const DEFAULT_APPLICATIONS: SubmittedApplication[] = [
  {
    applicationId: "SHK-2026-SUVIDHA-84920",
    schemeId: "nsfdc-suvidha",
    schemeName: "NSFDC Term Loan (Suvidha)",
    schemeShortName: "Suvidha",
    applicantName: "Jasaswi das",
    applicantPhone: "+91 98765 43210",
    applicantCategory: "SC",
    applicantState: "Odisha",
    applicantDistrict: "Khurda",
    loanAmountLakh: 2.7,
    purpose: "Fabrication & Small Workshop Equipment",
    channelPartner: "OSFDC (Odisha SC & ST Dev Finance Corp)",
    appliedDate: "08 Sep 2026, 11:30 AM",
    currentStageId: 2,
    stageDates: {
      1: "08 Sep 2026",
      2: "10 Sep 2026",
    },
    notes: "Application dossier accepted by OSFDC Khurda branch. Verification of caste and income certificates underway.",
  },
  {
    applicationId: "SHK-2026-MAHILA-41295",
    schemeId: "nsfdc-mahila-samriddhi",
    schemeName: "Mahila Samriddhi Yojana (Microfinance for Women)",
    schemeShortName: "Mahila Samriddhi",
    applicantName: "Priyanka Jena",
    applicantPhone: "+91 94370 12345",
    applicantCategory: "SC",
    applicantState: "Odisha",
    applicantDistrict: "Cuttack",
    loanAmountLakh: 1.4,
    purpose: "Handicrafts & Tailoring Micro-Unit",
    channelPartner: "State Bank of India (Designated Channel Branch)",
    appliedDate: "05 Sep 2026, 03:15 PM",
    currentStageId: 1,
    stageDates: {
      1: "05 Sep 2026",
    },
    notes: "Self-help group endorsement attached. Awaiting initial document scrutiny.",
  },
];

export function getStoredApplications(): SubmittedApplication[] {
  if (typeof window === "undefined") return DEFAULT_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPLICATIONS));
      return DEFAULT_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_APPLICATIONS;
  } catch {
    return DEFAULT_APPLICATIONS;
  }
}

export function getApplicationById(appId: string): SubmittedApplication | null {
  if (!appId) return null;
  const cleanId = appId.trim().toUpperCase();
  const all = getStoredApplications();
  return all.find((app) => app.applicationId.toUpperCase() === cleanId) || null;
}

export function saveApplication(app: SubmittedApplication): void {
  if (typeof window === "undefined") return;
  try {
    const all = getStoredApplications();
    const index = all.findIndex((a) => a.applicationId.toUpperCase() === app.applicationId.toUpperCase());
    if (index >= 0) {
      all[index] = app;
    } else {
      all.unshift(app);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Failed to save application:", e);
  }
}

export function updateApplicationStage(appId: string, stageId: number, notes?: string): void {
  const app = getApplicationById(appId);
  if (!app) return;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const updatedDates = { ...app.stageDates, [stageId]: app.stageDates[stageId] || today };
  const updatedApp: SubmittedApplication = {
    ...app,
    currentStageId: stageId,
    stageDates: updatedDates,
    notes: notes !== undefined ? notes : app.notes,
  };

  saveApplication(updatedApp);
}

export function generateApplicationId(schemeShortName: string = "SCHEME"): string {
  const year = new Date().getFullYear();
  const code = schemeShortName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 7) || "GOV";
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `SHK-${year}-${code}-${randomDigits}`;
}
