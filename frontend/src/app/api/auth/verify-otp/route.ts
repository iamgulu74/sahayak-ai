import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TWO_FACTOR_KEY =
  process.env.TWO_FACTOR_API_KEY || "774d63eb-ad2b-11f1-90d7-0200cd936042";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, otpCode } = await req.json();

    if (!sessionId || !otpCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID and OTP code are required",
        },
        { status: 400 }
      );
    }

    const cleanOtp = otpCode.trim();
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/VERIFY/${sessionId}/${cleanOtp}`;
    console.log(`[2Factor API] Verifying OTP for session: ${sessionId}`);

    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();

    if (data.Status === "Success" && data.Details === "OTP Matched") {
      return NextResponse.json({
        success: true,
        matched: true,
        message: "OTP successfully verified",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          matched: false,
          error:
            data.Details ||
            "Incorrect OTP code. Please check the SMS on your mobile phone and try again.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("2Factor verify OTP error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
