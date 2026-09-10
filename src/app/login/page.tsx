'use client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Eye, EyeOff, AlertCircle, Phone, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { login, loginWithGoogle, loginWithOtpSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const initialMode = searchParams.get("mode") === "otp" ? "otp" : "password";

  const [authMode, setAuthMode] = useState<"password" | "otp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Login State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    }
    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(-10);
    }

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send SMS OTP.");
      }

      setSessionId(data.sessionId);
      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "Failed to send SMS OTP. Please check mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError("Please enter the OTP received on your mobile phone.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Incorrect OTP code. Please check your SMS.");
      }

      loginWithOtpSession({
        name: "Beneficiary",
        phone: phone.trim(),
      });

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const isRedirectingForApply = redirectUrl.includes("apply");

  return (
    <div className="page-container flex items-center justify-center min-h-screen py-16 px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-surface-100">Welcome Back</h1>
          <p className="text-surface-400 mt-2">
            {isRedirectingForApply
              ? "Sign in to complete your official scheme application"
              : "Sign in to access your scheme recommendations"}
          </p>
        </div>

        <div className="glass-card p-8">
          {/* Auth Method Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-900/60 rounded-xl mb-5 border border-surface-800">
            <button
              type="button"
              onClick={() => { setAuthMode("password"); setError(""); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "password"
                  ? "bg-primary-600 text-white shadow-xs"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email / Google
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("otp"); setError(""); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === "otp"
                  ? "bg-primary-600 text-white shadow-xs"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl mb-5 text-danger-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {authMode === "password" ? (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-700/50 text-surface-200 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all mb-5 font-medium disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-surface-800" />
                <span className="text-surface-500 text-xs">or sign in with email</span>
                <div className="flex-1 h-px bg-surface-800" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      className="input-field pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 cursor-pointer"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 justify-center cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Mobile OTP Mode */
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-surface-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-surface-500 mt-1 block">
                      A secure OTP will be dispatched via SMS to your carrier.
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 justify-center cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Send SMS OTP"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Enter OTP Code sent to +91 {phone}
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 4–6 digit OTP"
                      maxLength={6}
                      className="input-field text-center font-mono text-lg tracking-widest"
                      required
                    />
                    <div className="flex justify-between items-center text-xs text-surface-400 mt-2">
                      <span>{countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive code?"}</span>
                      {countdown === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-primary-400 hover:text-primary-300 font-semibold cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 justify-center cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Verify OTP & Sign In"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(""); }}
                    className="w-full text-center text-xs text-surface-400 hover:text-surface-200 cursor-pointer"
                  >
                    ← Change Mobile Number
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-surface-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href={`/register${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/questionnaire" className="text-surface-500 hover:text-surface-300 text-xs transition-colors">
              Continue without account →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
