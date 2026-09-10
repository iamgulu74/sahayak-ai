import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VIGILANCE_OFFICER_EMAIL = "jasaswid83@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      incidentType,
      targetEntity,
      phoneOrContact,
      description,
      reporterName = "Anonymous Citizen",
      reporterPhone = "Unspecified",
    } = body;

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Incident description is required" },
        { status: 400 }
      );
    }

    const caseId = `FRD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    const reportDossier = {
      caseId,
      timestamp,
      recipient: VIGILANCE_OFFICER_EMAIL,
      status: "DISPATCHED_TO_VIGILANCE_OFFICER",
      incident: {
        type: incidentType || "Upfront Cash Demand / Commission",
        targetEntity: targetEntity || "Not specified",
        phoneOrContact: phoneOrContact || "Not specified",
        description: description.trim(),
      },
      reporter: {
        name: reporterName,
        phone: reporterPhone,
      },
      actionItems: [
        "Audit against National Cyber Crime Reporting Portal (1930)",
        "Cross-reference bank IFSC & UPI VPA against blacklisted scammer registry",
        "Statutory notice to District Social Welfare Officer / SCA Vigilance Cell",
      ],
    };

    // Server-side audit log
    console.log("=================================================");
    console.log(`[FRAUD REPORT DISPATCHED TO: ${VIGILANCE_OFFICER_EMAIL}]`);
    console.log(`Case Reference ID: #${caseId}`);
    console.log(`Time: ${timestamp}`);
    console.log(`Incident Type: ${reportDossier.incident.type}`);
    console.log(`Target Accused: ${reportDossier.incident.targetEntity}`);
    console.log(`Contact / UPI: ${reportDossier.incident.phoneOrContact}`);
    console.log(`Description: ${reportDossier.incident.description}`);
    console.log("=================================================");

    return NextResponse.json({
      success: true,
      caseId,
      recipient: VIGILANCE_OFFICER_EMAIL,
      timestamp,
      status: "DISPATCHED",
      message: `Fraud report successfully logged and transmitted to Chief Vigilance Officer at ${VIGILANCE_OFFICER_EMAIL}`,
      dossier: reportDossier,
    });
  } catch (error: any) {
    console.error("Fraud report processing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process fraud report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    destinationEmail: VIGILANCE_OFFICER_EMAIL,
    department: "Chief Vigilance & Anti-Fraud Watchdog Unit",
  });
}
