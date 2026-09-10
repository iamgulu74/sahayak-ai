# Sahayak AI — Dedicated Backend REST API

The backend for **Sahayak AI** is a modular **Node.js / Express / TypeScript** service providing AI-powered multimodal forensic document verification, biometric facial inspection, anti-screenshot forgery detection, and vigilance fraud reporting for Scheduled Caste (SC) micro-entrepreneurs.

---

## 🏛️ Architecture & Services

```
backend/
├── src/
│   ├── controllers/
│   │   ├── verifyDocumentController.ts  # Verification request handler & validation
│   │   └── fraudReportController.ts     # Vigilance fraud submission & dispatch
│   ├── services/
│   │   ├── geminiVisionService.ts       # Google Gemini 2.0 Flash multimodal vision engine
│   │   ├── ocrSpaceService.ts           # OCR.space Engine 2 optical character parsing
│   │   ├── fakeShieldService.ts         # Anti-screenshot shield & name sanitization
│   │   └── verificationEngine.ts        # Dual-engine orchestration & report generator
│   ├── routes/
│   │   └── apiRoutes.ts                 # Express REST router (/api/*)
│   ├── data/
│   │   ├── schemes.json                 # Verified NSFDC / government scheme circulars
│   │   └── partners.json                # PSBs & SCAs channel partner registry
│   └── server.ts                        # Server entry point (Port 5000)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 📡 API Endpoints

### 1. Forensic Document Verification
- **Method**: `POST /api/verify-document`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg",
    "profile": {
      "name": "Applicant Name",
      "category": "SC",
      "dob": "1995-04-12"
    },
    "documentTypeExpected": "Aadhaar Card"
  }
  ```
- **Response**: Full forensic report containing:
  - `isGovernmentDocument`: boolean
  - `documentTypeDetected`: string
  - `authenticityStatus`: `AUTHENTIC` | `SUSPICIOUS_TAMPERED` | `BLATANT_FAKE` | `NOT_A_DOCUMENT`
  - `authenticityScore`: 0 to 100
  - `biometricAudit`: Photo presence, clarity score, hologram edge overlap
  - `templateAudit`: Official format compliance (UIDAI Aadhaar, Tahasildar Caste/Income, PAN, Bank)
  - `extractedData`: Full Name, ID number, Issuing Authority, Category, Income
  - `profileMatch`: Strict name cross-verification against registered applicant profile

### 2. Fraud & Vigilance Reporting
- **Method**: `POST /api/report-fraud`
- **Body**:
  ```json
  {
    "incidentType": "Upfront Commission Demand",
    "targetEntity": "Middleman / Agent Name",
    "phoneOrContact": "+91 98765 43210",
    "description": "Details of the illegal fee demand",
    "reporterName": "Citizen Name"
  }
  ```
- **Response**: Dispatches report dossier to Chief Vigilance Officer with unique tracking `#FRD-2026-XXXXXX`.

### 3. Catalogues & Datasets
- `GET /api/schemes`: Returns list of 10+ central and state credit schemes.
- `GET /api/partners`: Returns channel partner banks and SCAs with live capacities.
- `GET /api/health`: Healthcheck and active endpoint catalog.

---

## 🚀 Running the Backend

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `NEXT_PUBLIC_GEMINI_API_KEY` (or `GEMINI_API_KEY`) and `OCR_SPACE_API_KEY` are provided.

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.
