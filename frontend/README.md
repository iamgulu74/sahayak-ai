# Sahayak AI — Frontend Web Application

The frontend of **Sahayak AI** is built using **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**. It provides an intuitive, accessible portal for Scheduled Caste (SC) micro-entrepreneurs.

## Key Features & Portals
- **Eligibility Checker (`/eligibility-check`)**: Deterministic rules engine + AI Semantic Matcher.
- **Forensic Document Verifier (`/documents`)**: Dual-engine multimodal forensic inspection with client-side canvas resolution downscaling, biometric photo audit, and anti-screenshot detection.
- **Interactive Assistant (`/assistant`)**: Voice-guided tutorial, wizard, and conversational guidance.
- **Financial Literacy Hub (`/literacy`)**: 28 interactive plain-language lessons and loan management guidance.
- **Channel Partner Locator (`/partners`)**: Interactive Leaflet maps with live auto-failover steering to high-capacity SCAs.
- **Application Parcel Tracker (`/tracker`)**: Real-time 7-stage milestone timeline with application dossier generation.
- **Project Cost & EMI Calculator (`/calculator`, `/project-cost`)**: Precise subsidy and amortization calculators.

## Directory Structure
```
frontend/
├── public/                 # Static assets, logos, and icons
├── src/
│   ├── app/               # Next.js App Router pages and layouts
│   │   ├── api/           # Direct Next.js route bridges
│   │   ├── assistant/     # Interactive Assistant page
│   │   ├── documents/     # Document upload & verification
│   │   ├── matching/      # Scheme matching view
│   │   ├── tracker/       # 7-Stage Application Tracker
│   │   └── ...            # Additional routes
│   ├── components/        # Reusable UI components (Navbar, Footer, Modals, Maps)
│   ├── contexts/          # State providers (AuthContext, LanguageContext)
│   ├── data/              # Static dataset catalogues (schemes.json, partners.json)
│   └── lib/               # Client utilities, calculators, and state management
├── package.json           # Frontend dependencies
├── tsconfig.json          # TypeScript config
└── tailwind.config.ts     # Tailwind styling configuration
```

## Running the Frontend
```bash
npm run dev
```
The frontend starts on `http://localhost:3000`.
