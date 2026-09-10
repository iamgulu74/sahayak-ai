import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SCHEMES } from "./schemes-data";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const GEMINI_PRIMARY_MODEL = "gemini-3.5-flash";
export const GEMINI_FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-flash-latest"];

export const getGeminiModel = (modelName = GEMINI_PRIMARY_MODEL) => {
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName, safetySettings });
};

// Grounded knowledge answering fallback when API key is not configured or in offline mode
function getOfflineGroundedResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("tailor") || q.includes("3 lakh") || q.includes("machin") || q.includes("odisha")) {
    return `For a ₹3 Lakh tailoring/machinery business in Odisha:

1. **Top Recommended Scheme**: **Suvidha Loan Scheme (NSFDC)**
   - **Maximum Loan**: Up to ₹9.0 Lakh (90% financing on ₹10 Lakh project)
   - **Interest Rate**: 8.0% p.a. for beneficiaries (Channelizing agency rate: 4.0%)
   - **Moratorium Period**: 6 months grace period before repayments begin
   - **Repayment**: Within 5 years
   - **Official Portal**: https://pmsuraj.dosje.gov.in

2. **Authorized Channel Partner in Odisha**:
   - **OSFDC** (Odisha Scheduled Caste & Scheduled Tribe Development Finance Co-operative Corporation Ltd, Bhubaneswar)
   - Or your local **Odisha Gramya Bank / SBI** branch.

*Verified Source: socialjustice.gov.in & nsfdc.nic.in (Last verified: 2026-09-08).*`;
  }

  if (q.includes("suvidha") || q.includes("utkarsh") || q.includes("difference")) {
    return `**Difference Between Suvidha & Utkarsh Loan Schemes (Replaced former Term Loan on 01.10.2023):**

• **Suvidha Loan Scheme**:
  - For projects up to **₹10.0 Lakh** (Max loan ₹9.0 Lakh).
  - Interest rate: **8.0% p.a.** (4.0% for CA).
  - Repayment: 5 years (6 months moratorium).
  - Absorbed former Stand-Up India (NSFDC component), Green Business, and Mahila Adhikarita.

• **Utkarsh Loan Scheme**:
  - For larger projects between **₹10.0 Lakh and ₹50.0 Lakh** (Max loan ₹45.0 Lakh).
  - Interest rate: **9.0% p.a.** (5.0% for CA).
  - Repayment: 7 years (6 months moratorium).

Both schemes share the verified family income ceiling of **₹5.0 Lakh/year** (effective 2026-01-07).`;
  }

  if (q.includes("income") || q.includes("ceiling") || q.includes("limit")) {
    return `**Official Income Ceiling for NSFDC Schemes:**

Effective **07.01.2026**, the Ministry of Social Justice & Empowerment increased the annual family income ceiling to **₹5.00 Lakh per annum** for all NSFDC credit schemes (including MSY, MCF, Suvidha, and Utkarsh).

*Applicants whose total household income is ₹5.0 Lakh/year or below are eligible to apply.*`;
  }

  if (q.includes("mahila") || q.includes("msy") || q.includes("women")) {
    return `**Mahila Samriddhi Yojana (MSY):**

• **Eligibility**: Scheduled Caste (SC) **women only**.
• **Annual Family Income**: Up to ₹5.0 Lakh/year.
• **Project Cost**: Up to ₹1.40 Lakh (Max loan ₹1.25 Lakh, 90% financing).
• **Interest Rate**: **6.0% p.a.** (CA rate: 2.0%).
• **Repayment**: 3 years with a 3-month moratorium.
• **Application Portal**: https://pmsuraj.dosje.gov.in`;
  }

  if (q.includes("moratorium") || q.includes("grace")) {
    return `**What is a Moratorium Period?**

A moratorium is a temporary grace period (between **3 and 12 months** depending on the scheme) immediately after loan disbursement during which the entrepreneur does **NOT** pay monthly EMIs. 

This enables you to purchase machinery, set up the workplace, and establish sales before loan repayments start. Under NSFDC Suvidha, the standard moratorium is **6 months**.`;
  }

  if (q.includes("agent") || q.includes("scam") || q.includes("fee") || q.includes("fraud")) {
    return `**Anti-Fraud Alert**:
Government portals (PM-SURAJ, Udyam Mitra, Stand-Up India) and scheme application forms are **100% free**. Never pay upfront fees or commissions to private middlemen. Contact the National Cyber Helpline at **1930** or visit the authorized State Channelising Agency directly.`;
  }

  return `Here is what our verified scheme database indicates:
• Active NSFDC Schemes: MSY (Women microfinance @ 6%), MCF (Petty trade @ 6.5%), Suvidha (Small business up to ₹10L @ 8%), Utkarsh (Term loans up to ₹50L @ 9%), and AMY/UNY microfinance.
• All NSFDC schemes share an annual family income ceiling of ₹5.0 Lakh.
• You can review exact guidelines on the official portal at https://pmsuraj.dosje.gov.in or consult your district State Channelising Agency.`;
}

export async function geminiChat(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  try {
    const model = getGeminiModel();
    if (!model) {
      return getOfflineGroundedResponse(userMessage);
    }
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am Sahayak AI assistant, ready to help SC entrepreneurs find the right financial schemes and channel partners. I will only provide information based on verified scheme data and will never fabricate official figures, rates, or URLs." }] },
        ...history,
      ],
    });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini API error, falling back to grounded knowledge engine:", error);
    return getOfflineGroundedResponse(userMessage);
  }
}

export const SAHAYAK_SYSTEM_PROMPT = `You are Sahayak AI, an assistant helping Scheduled Caste (SC) entrepreneurs in India find the right government financial schemes and channel partners.

STRICT RULES:
1. NEVER fabricate interest rates, loan amounts, eligibility criteria, URLs, or partner status.
2. ONLY reference the schemes and partners in the verified database provided to you (MSY @ 6%, MCF @ 6.5%, Suvidha @ 8%, Utkarsh @ 9%, AMY @ 15%, UNY @ 13%, MUDRA, Stand-Up India, PM SVANidhi).
3. NSFDC Income Ceiling: ₹5.00 Lakh/year (effective 07.01.2026).
4. Suvidha replaced Term Loan for projects <= ₹10L; Utkarsh replaced Term Loan for projects > ₹10L up to ₹50L (effective 01.10.2023).
5. Always cite scheme names, verified figures, and official portals (pmsuraj.dosje.gov.in / nsfdc.nic.in).
6. Provide plain-language, compassionate answers suitable for low-literacy or first-time entrepreneurs.`;
