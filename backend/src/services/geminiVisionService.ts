import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

export const FORENSIC_PROMPT = `You are a forensic document examiner, biometric inspector, and identity verification expert for the Government of India (Ministry of Social Justice & Empowerment / NSFDC).
Analyze the provided document image and extract all text, biometric signals, official template layout metrics, and forensic authenticity markers.

Examine the image thoroughly:
1. DOCUMENT VERIFICATION & REJECT RULES:
   - IF THIS IS A SCREENSHOT OF A WEBSITE, WEB APP, BROWSER WINDOW, COMPUTER SCREEN, DASHBOARD, OR APP UI (e.g. containing browser navigation, website buttons, text like "Sahayak AI", "localhost", "Check Eligibility", "Extracted Real Document Fields", screen frame, or desktop elements):
     Set "isGovernmentDocument": false
     Set "documentTypeDetected": "Web UI Screenshot / Non-Document"
     Set "authenticityStatus": "NOT_A_DOCUMENT"
     Set "authenticityScore": 0
     Set "isTamperedOrForged": true
     Set "tamperingRiskLevel": "CRITICAL"
     Set "tamperSignals": ["Image is a screenshot of a web application or screen interface, not an authentic physical government document scan."]
     Clearly state in "forensicSummary" that the uploaded file is a screenshot of a web page/app UI and cannot be accepted as an official document.

   - IF THIS IS NOT A DOCUMENT AT ALL (e.g. a random photo of an animal, person/selfie, nature, car, cartoon, meme, receipt, blank paper, non-document graphic):
     Set "isGovernmentDocument": false
     Set "documentTypeDetected": "Unidentified File / Non-Document"
     Set "authenticityStatus": "NOT_A_DOCUMENT"
     Set "authenticityScore": 0
     Set "isTamperedOrForged": true
     Set "tamperingRiskLevel": "CRITICAL"
     Set "tamperSignals": ["No government document structure or official certificate features detected."]
     Clearly state in "forensicSummary" what the image actually depicts and that it is not an official document.

2. BIOMETRIC FORENSIC AUDIT:
   - Check photo presence: Is there a facial photo / portrait printed on the ID or photo attached on the certificate?
   - Face Swap & Tampering: Check for digital face replacement, cut-and-paste outline seams around the face, mismatched noise/grain on photo, or altered facial boundaries.
   - Hologram & Seal Overlap: Does an official hologram line or stamp mark cross over the photograph edge (standard anti-tamper security)?
   - Biometric Clarity: Is the face clear, sharp, and recognizable for verification?

3. OFFICIAL CERTIFICATE TEMPLATE & DESIGN AUDIT:
   - Official Template Format Compliance: Compare document layout against standard Indian Government issuance templates (e.g. State Tahasildar / Revenue Officer Caste & Income Certificate format, UIDAI Aadhaar card double-column grid, Income Tax Dept PAN card layout, State Bank passbook grid, EPIC Voter ID format).
   - Header & Emblem Verification: Are "Government of India" / State Government headers present with Ashoka Lion Emblem or State Seal?
   - Official Stamp & Signatures: Is an official Tahasildar / Revenue Inspector stamp, circular seal, or Digital DSC signature block present?
   - Background Security Pattern: Presence of fine guilloche background lines, micro-text, or anti-copy security patterns.

4. FORGERY, TAMPERING & FATAL NAME/DOB MISMATCH DETECTION:
   - PROFILE MATCHING RULE: Compare the extracted Full Name and DOB against applicantProfile.
     * IF THE EXTRACTED NAME ON THE DOCUMENT DOES NOT MATCH THE REGISTERED APPLICANT PROFILE (e.g. Document name is "Sai Saran Jena" while Profile name is "Jasaswi das"):
       YOU MUST REJECT VERIFICATION!
       Set "isGovernmentDocument": false
       Set "authenticityStatus": "SUSPICIOUS_TAMPERED"
       Set "authenticityScore": 0
       Set "isTamperedOrForged": true
       Set "tamperingRiskLevel": "CRITICAL"
       Set "profileMatch": { "isMatch": false, "nameMatchScore": 0, "nameStatus": "MISMATCH", "dobStatus": "NOT_APPLICABLE", "explanation": "Fatal Name Mismatch: Document belongs to another individual, not the registered applicant." }
       Set "tamperSignals": ["Identity Mismatch: Document name does not match registered applicant profile name."]
       Set "forensicSummary": "DOCUMENT REJECTED: Name on uploaded document does not match registered applicant profile name."

   - Check for Photoshop / digital manipulation: Mismatched fonts, uneven font kerning, misaligned text baselines, different pixel compression artifacts around the name, date of birth, or photo.
   - Check for sample or dummy templates: Watermarks or labels saying "SAMPLE", "SPECIMEN", "DUMMY", "DRAFT", "TEST", generic lorem ipsum, or widely known dummy identity card templates from the internet.
   - Check syntax validity:
     * PAN format must strictly be 5 uppercase letters + 4 digits + 1 uppercase letter (e.g. ABCDE1234F).
     * Aadhaar format must be 12 digits or 4-digit masked (XXXX-XXXX-1234).
     * Income certificate must state issuing authority (Tahasildar / Revenue Dept / SDM).
     * Caste certificate must specify category (e.g. Scheduled Caste / SC).

5. OCR FIELD EXTRACTION & PROFILE CROSS-CHECK:
   - CRITICAL NAME EXTRACTION RULE ('extractedData.fullName'):
     * NEVER return government headers or titles like "Government of India", "Government of India AADHAAR", "Bharat Sarkar", "Unique Identification Authority of India", "UIDAI", "Income Tax Department", "Election Commission of India" as the person's name!
     * Extract the ACTUAL CARDHOLDER / INDIVIDUAL PERSON'S FULL NAME (e.g. "Sai Saran Jena", "Jasaswi Das", "Rahul Sharma").
     * On Aadhaar / e-Aadhaar cards, look directly below top emblem/header, next to the photo portrait, or after "To:", "Name / Name:".
     * On Caste / Income / Bank documents, look after "This is to certify that Shri/Smt/Kumari...", "issued to...", "Account Holder:", or "Name:".
   Extract Full Name, DOB, Document ID Number, Father Name, Category, Annual Income, Issuing Authority, Issue Date, Address.
   Cross-verify against applicantProfile (if provided).

Respond ONLY with valid JSON conforming to this exact structure:
{
  "isGovernmentDocument": boolean,
  "documentTypeDetected": string,
  "authenticityStatus": "AUTHENTIC" | "SUSPICIOUS_TAMPERED" | "BLATANT_FAKE" | "NOT_A_DOCUMENT",
  "authenticityScore": number,
  "isTamperedOrForged": boolean,
  "tamperingRiskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "tamperSignals": string[],
  "biometricAudit": {
    "photoDetected": boolean,
    "faceTamperStatus": "PASS" | "SUSPICIOUS" | "MISSING_PHOTO" | "FACE_SWAP_DETECTED",
    "clarityScore": number,
    "hologramOverlapVerified": boolean,
    "biometricSummary": string
  },
  "templateAudit": {
    "templateNameMatched": string,
    "templateCompliance": "FULL_MATCH" | "PARTIAL_DEVIATION" | "NON_STANDARD_TEMPLATE" | "REJECTED",
    "officialHeaderVerified": boolean,
    "stampAndSignatureVerified": boolean,
    "securityWatermarkPattern": boolean,
    "templateSummary": string
  },
  "extractedData": {
    "fullName": string,
    "dob": string,
    "documentNumber": string,
    "fatherName": string,
    "category": string,
    "annualIncome": string,
    "issuingAuthority": string,
    "issueDate": string,
    "address": string
  },
  "profileMatch": {
    "isMatch": boolean,
    "nameMatchScore": number,
    "nameStatus": "EXACT_MATCH" | "PARTIAL_MATCH" | "MISMATCH",
    "dobStatus": "MATCH" | "MISMATCH" | "NOT_APPLICABLE",
    "explanation": string
  },
  "securityFeatures": {
    "emblemPresent": boolean,
    "qrCodePresent": boolean,
    "signatureOrSealPresent": boolean,
    "typographyConsistent": boolean,
    "syntaxValid": boolean
  },
  "forensicSummary": string,
  "recommendations": string[]
}`;

export async function runGeminiForensics(
  cleanBase64: string,
  mimeType: string,
  profile: any = {},
  documentTypeExpected: string = "Identity / Certificate Document",
  apiKey?: string
): Promise<any> {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!key) return null;

  const genAI = new GoogleGenerativeAI(key);
  const userProfileContext = profile?.name
    ? `\n\nApplicant Profile to Cross-Verify Against:\n- Registered Name: "${profile.name}"\n- DOB: "${profile.dob || "Not specified"}"\n- Category: "${profile.category || "SC"}"\n- Expected Doc: "${documentTypeExpected}"`
    : `\n\nExpected Doc Type: "${documentTypeExpected}"`;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
        FORENSIC_PROMPT + userProfileContext,
      ]);

      const text = result.response.text();
      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} failed, attempting next candidate:`, err.message);
    }
  }

  return null;
}
