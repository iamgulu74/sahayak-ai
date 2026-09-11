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

   - PASSPORT-SIZE PHOTOGRAPH & FRONT CAMERA LIVE CAPTURE RULE:
     * If the expected document is "Passport-size photographs", "Passport-size photograph", "Passport Photo", "Applicant Photograph", or "Live Camera Photo" (or documentTypeExpected mentions "photo" or "photograph" or "passport"):
       A frontal human portrait photo or live front-camera selfie IS EXPECTED and FULLY VALID.
       DO NOT classify it as "NOT_A_DOCUMENT" or "Unidentified File / Non-Document".
       Verify that:
       1. A real human face is clearly visible, frontal, with eyes open and unoccluded (no sunglasses or full face covering).
       2. Image is clear, well-lit, and suitable as an official identity photograph.
       3. It is not an animal, cartoon, meme, random scenery, or non-human graphic.
       
       4. BIOMETRIC FACE MATCHING AGAINST REGISTERED APPLICANT PROFILE PHOTO:
          * If an applicant profile photo (Image 2) is provided in this prompt:
            Compare facial biometrics between the uploaded passport photo (Image 1) and applicant profile photo (Image 2):
            - Check facial bone structure, eyes, nose, lips, jawline, and individual biometric identity.
            - IF FACES MATCH (SAME INDIVIDUAL):
              Set "faceMatch": { "isFaceMatch": true, "faceMatchScore": 92, "faceMatchStatus": "MATCH", "explanation": "Biometric face verification confirmed: Passport photograph facial structure matches applicant profile photo." }
              Set "isGovernmentDocument": true
              Set "authenticityStatus": "AUTHENTIC"
              Set "authenticityScore": 95
              Set "isTamperedOrForged": false
              Set "tamperingRiskLevel": "NONE"
              Set "photoDetected": true
              Set "faceTamperStatus": "PASS"
            - IF FACES DO NOT MATCH (DIFFERENT PERSON):
              YOU MUST REJECT VERIFICATION!
              Set "faceMatch": { "isFaceMatch": false, "faceMatchScore": 10, "faceMatchStatus": "MISMATCH", "explanation": "Fatal Biometric Mismatch: Uploaded passport-size photo is of a different individual than the registered applicant profile photo." }
              Set "isGovernmentDocument": false
              Set "authenticityStatus": "SUSPICIOUS_TAMPERED"
              Set "authenticityScore": 0
              Set "isTamperedOrForged": true
              Set "tamperingRiskLevel": "CRITICAL"
              Set "tamperSignals": ["Biometric Face Mismatch: The person depicted in the passport photo does not match the registered applicant profile photo."]
              Set "forensicSummary": "DOCUMENT REJECTED: Biometric face mismatch detected. Passport photo does not match the registered applicant profile photo."
          * If NO profile photo is provided (only 1 image provided):
            Set "faceMatch": { "isFaceMatch": true, "faceMatchScore": 85, "faceMatchStatus": "NO_PROFILE_PHOTO", "explanation": "No applicant profile photo on record for facial cross-match. Frontal portrait verified." }
            Set "isGovernmentDocument": true
            Set "authenticityStatus": "AUTHENTIC"
            Set "authenticityScore": 95
            Set "isTamperedOrForged": false
            Set "tamperingRiskLevel": "NONE"
            Set "photoDetected": true
            Set "faceTamperStatus": "PASS"
       Set "profileMatch": { "isMatch": true, "nameMatchScore": 90, "nameStatus": "EXACT_MATCH", "dobStatus": "NOT_APPLICABLE", "explanation": "Live front camera selfie / passport photo verified for applicant identity record." }
       if ("faceMatch" not set) Set "faceMatch": { "isFaceMatch": true, "faceMatchScore": 90, "faceMatchStatus": "MATCH", "explanation": "Biometric face match verified." }

   - IF THIS IS NOT A DOCUMENT AT ALL (and NOT an expected passport photo / portrait) (e.g. a random photo of an animal, nature, car, cartoon, meme, receipt, blank paper, non-document graphic):
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
  "faceMatch": {
    "isFaceMatch": boolean,
    "faceMatchScore": number,
    "faceMatchStatus": "MATCH" | "MISMATCH" | "NO_PROFILE_PHOTO" | "UNCLEAR",
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

  const profilePhotoClean = profile?.photoUrl
    ? profile.photoUrl.includes("base64,")
      ? profile.photoUrl.split("base64,")[1]
      : profile.photoUrl
    : null;
  const profilePhotoMime =
    profile?.photoUrl && profile.photoUrl.includes("data:")
      ? profile.photoUrl.split(";")[0].replace("data:", "")
      : "image/jpeg";

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

      const contents: any[] = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
      ];

      let dualImageInstruction = "";
      if (profilePhotoClean && profilePhotoClean.length > 50) {
        contents.push({
          inlineData: {
            data: profilePhotoClean,
            mimeType: profilePhotoMime || "image/jpeg",
          },
        });
        dualImageInstruction = `\n\n[BIOMETRIC FACE MATCH INSTRUCTION]:\nImage 1 is the submitted document / passport-size photograph.\nImage 2 is the registered applicant's official profile photograph.\nYou MUST compare the face in Image 1 against Image 2. If the face in Image 1 does NOT match the face in Image 2, set "faceMatchStatus": "MISMATCH" and reject the document.`;
      }

      contents.push(FORENSIC_PROMPT + userProfileContext + dualImageInstruction);

      const result = await model.generateContent(contents);

      const text = result.response.text();
      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} failed, attempting next candidate:`, err.message);
    }
  }

  return null;
}
