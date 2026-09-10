import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TWO_FACTOR_KEY =
  process.env.TWO_FACTOR_API_KEY || "774d63eb-ad2b-11f1-90d7-0200cd936042";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Clean phone number to 10 digits for Indian carrier SMS
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(-10);
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    const url = `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/${cleanPhone}/AUTOGEN`;
    console.log(`[2Factor API] Dispatching real SMS OTP to +91 ${cleanPhone}`);

    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    if (data.Status === "Success") {
      return NextResponse.json({
        success: true,
        sessionId: data.Details,
        message: "SMS OTP successfully sent to your mobile phone",
      });
    } else {
      console.warn("[2Factor API] Error response:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.Details || "Failed to send SMS OTP via carrier",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("2Factor send OTP error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send SMS OTP" },
      { status: 500 }
    );
  }
}
