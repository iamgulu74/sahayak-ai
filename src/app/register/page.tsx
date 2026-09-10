'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Zap,
  RotateCcw,
  Check
} from "lucide-react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [phone, setPhone] = useState("+91 ");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const initRecaptcha = () => {
    if (typeof window === "undefined") return null;
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          setError("reCAPTCHA verification expired. Please click Send OTP again.");
        },
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (e: any) {
      console.warn("Recaptcha initialization warning:", e.message);
      return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+91" + cleanPhone;
    }

    if (cleanPhone.length < 12) {
      setError("Please enter a valid 10-digit mobile number with country code (e.g. +91 9876543210).");
      return;
    }

    setLoading(true);

    try {
      const verifier = initRecaptcha();
      if (!verifier) {
        throw new Error("reCAPTCHA could not be initialized in this browser session.");
      }

      console.log("Sending real Firebase SMS OTP to:", cleanPhone);
      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      console.error("Firebase Phone Auth error:", err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please ensure country code is included (e.g. +91 98765 43210).");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many SMS attempts sent to this device. Please wait a few minutes before trying again.");
      } else if (err.code === "auth/captcha-check-failed") {
        setError("reCAPTCHA check failed. Please refresh the page and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not yet authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Failed to send real SMS OTP. Please check your mobile number.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError("Please enter the 6-digit OTP code received on your phone.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let verifiedUid = "";
      if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(otpCode.trim());
        verifiedUid = userCredential.user?.uid || "";
      }

      // Store authenticated session profile
      sessionStorage.setItem(
        "sahayak_profile",
        JSON.stringify({
          name: name.trim() || "Beneficiary",
          phone: phone.trim(),
          uid: verifiedUid,
        })
      );

      router.push("/questionnaire");
    } catch (err: any) {
      console.error("Firebase OTP confirmation error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP code. Please check the SMS message on your phone and enter the exact 6 digits.");
      } else if (err.code === "auth/code-expired") {
        setError("The OTP code has expired. Please click Resend OTP to receive a fresh code.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Failed to verify OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(email, password, name);
      router.push("/questionnaire");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="page-container flex items-center justify-center min-h-screen py-16 px-4">
      {/* Invisible reCAPTCHA container required for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Beneficiary Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official government scheme discovery, forensic audit & channel partner routing
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => {
                setAuthMode("otp");
                setError("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === "otp"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile SMS OTP
            </button>
            <button
              onClick={() => {
                setAuthMode("password");
                setError("");
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                authMode === "password"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email Account
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Mode */}
          {authMode === "otp" ? (
            <div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 mb-4 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Official Aadhaar Verification:</strong> Enter your mobile number. A real 6-digit verification code will be sent via SMS directly to your phone.
                </span>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jasaswi Das"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (With Country Code) *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Include +91 for India. Real SMS will be delivered to this number.
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending Real SMS via Carrier...
                      </span>
                    ) : (
                      "Send Real SMS Verification OTP →"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      SMS Dispatched to {phone}
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Please check your mobile messages app for the 6-digit Google/Firebase verification code.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit SMS OTP Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-widest text-xl font-mono rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Verifying OTP...
                      </span>
                    ) : (
                      "Verify OTP & Launch Portal ✓"
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Change Number
                    </button>

                    {countdown > 0 ? (
                      <span className="text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Resend SMS
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handlePasswordRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jasaswi Das"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {loading ? "Creating Account..." : "Create Account & Start"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
