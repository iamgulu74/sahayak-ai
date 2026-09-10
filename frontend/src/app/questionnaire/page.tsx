'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  DollarSign,
  CheckCircle,
  Info,
  Sparkles,
  Mic,
  MicOff,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/lib/matching-engine";
import { INDIAN_STATES } from "@/lib/partner-router";

const STEPS = [
  { id: 1, title: "Applicant Profile", desc: "Identity & Demographics", icon: <User className="w-5 h-5" /> },
  { id: 2, title: "Business Requirement", desc: "Purpose & Machinery", icon: <Briefcase className="w-5 h-5" /> },
  { id: 3, title: "Financial Scale", desc: "Cost & Loan Fit", icon: <DollarSign className="w-5 h-5" /> },
];

const PURPOSES = [
  { value: "machinery", label: "Machinery / Equipment Purchase" },
  { value: "business_start", label: "Starting a New Business" },
  { value: "business_expansion", label: "Expanding Existing Business" },
  { value: "working_capital", label: "Working Capital / Raw Materials" },
  { value: "agriculture", label: "Agriculture / Allied Activities" },
];

const BUSINESS_TYPES = [
  "Manufacturing / Tailoring Unit",
  "Petty Trade / Retail Shop",
  "Service & Repair",
  "Food Processing & Bakery",
  "Handicraft & Artisan",
  "Dairy / Livestock / Poultry",
  "Street Vending",
  "Transport & Logistics",
  "Other Enterprise"
];

export default function QuestionnairePage() {
  const { updateProfile, userProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [form, setForm] = useState<Partial<UserProfile>>({
    name: userProfile?.name || "",
    age: userProfile?.age || undefined,
    state: userProfile?.state || "Odisha",
    district: userProfile?.district || "",
    category: userProfile?.category || "SC",
    gender: userProfile?.gender || "male",
    annualIncomeLakh: userProfile?.annualIncomeLakh || undefined,
    educationLevel: userProfile?.educationLevel || "secondary",
    businessStatus: userProfile?.businessStatus || "starting",
    businessType: userProfile?.businessType || "",
    businessDescription: userProfile?.businessDescription || "",
    projectCostLakh: userProfile?.projectCostLakh || undefined,
    loanRequiredLakh: userProfile?.loanRequiredLakh || undefined,
    purpose: userProfile?.purpose || "business_start",
    aadhaarMasked: userProfile?.aadhaarMasked || "",
    panMasked: userProfile?.panMasked || "",
    phone: userProfile?.phone || "",
    isStreetVendor: false,
    isWoman: false,
    isFarmer: false,
  });

  // Speech Recognition setup for Business Description
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setForm((prev) => ({
            ...prev,
            businessDescription: prev.businessDescription
              ? `${prev.businessDescription} ${transcript}`
              : transcript,
          }));
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    const full: UserProfile = {
      ...(form as UserProfile),
      isWoman: form.gender === "female",
      isFarmer: form.businessType?.toLowerCase().includes("agri") || false,
      isStreetVendor: form.businessType?.toLowerCase().includes("street") || false,
      languagePreference: "en",
    };

    try {
      await updateProfile(full);
    } catch {}
    sessionStorage.setItem("sahayak_profile", JSON.stringify(full));
    router.push("/matching");
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => {
            const isDone = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? "text-indigo-600" : isDone ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      step > s.id ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Step {step} of 3
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {STEPS[step - 1].title}
            </h2>
            <p className="text-xs text-slate-500">{STEPS[step - 1].desc}</p>
          </div>

          {/* Step 1: Profile & Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (as on Aadhaar / Caste Certificate)
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min={17}
                    max={70}
                    value={form.age}
                    onChange={(e) => update("age", Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State of Residence
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    placeholder="e.g. Sundargarh"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Social Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General</option>
                    <option value="Minority">Minority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={form.educationLevel}
                    onChange={(e) => update("educationLevel", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="primary">Primary (Up to Class 8)</option>
                    <option value="secondary">Secondary (Class 10 / 12)</option>
                    <option value="vocational">Vocational / ITI</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Post-Graduate</option>
                  </select>
                </div>
              </div>

              {/* Masked IDs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Aadhaar Reference (Masked)
                  </label>
                  <input
                    type="text"
                    value={form.aadhaarMasked || "XXXX-XXXX-8921"}
                    onChange={(e) => update("aadhaarMasked", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-100 text-slate-600 cursor-not-allowed font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    PAN Reference (Masked)
                  </label>
                  <input
                    type="text"
                    value={form.panMasked || "ABCDE1234F"}
                    onChange={(e) => update("panMasked", e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-100 text-slate-600 cursor-not-allowed font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Requirement & Machinery */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  What is your primary funding purpose?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PURPOSES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => update("purpose", p.value)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        form.purpose === p.value
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Trade Type
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => update("businessType", e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Describe your business idea & machinery needs
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                      isListening
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? "Listening..." : "Speak Description"}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={form.businessDescription}
                  onChange={(e) => update("businessDescription", e.target.value)}
                  placeholder="e.g. I want to buy 2 high-speed industrial sewing machines and fabric to start a tailoring business..."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Business Status
                </label>
                <select
                  value={form.businessStatus}
                  onChange={(e) => update("businessStatus", e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="starting">Starting Soon (First-time entrepreneur)</option>
                  <option value="existing">Existing Micro Unit (Expanding)</option>
                  <option value="none">Idea Stage</option>
                  <option value="student">Skill Trainee / Vocational</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Financial Scale */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Annual Family Income (₹ in Lakh)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">
                    ₹{form.annualIncomeLakh} Lakh/year
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={8.0}
                  step={0.1}
                  value={form.annualIncomeLakh}
                  onChange={(e) => update("annualIncomeLakh", Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>₹0.5L</span>
                  <span className="font-semibold text-emerald-600">
                    Official NSFDC Ceiling: ₹5.00 Lakh
                  </span>
                  <span>₹8.0L</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Total Estimated Project Cost (₹ in Lakh)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">
                    ₹{form.projectCostLakh} Lakh
                  </span>
                </div>
                <input
                  type="number"
                  min={0.2}
                  max={50.0}
                  step={0.1}
                  value={form.projectCostLakh}
                  onChange={(e) => {
                    const cost = Number(e.target.value);
                    update("projectCostLakh", cost);
                    update("loanRequiredLakh", Math.round(cost * 0.9 * 10) / 10);
                  }}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Need an itemized breakdown?</span>
                  <Link href="/project-cost" className="text-indigo-600 font-semibold hover:underline">
                    Use Project Cost Calculator →
                  </Link>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Loan Amount Required (₹ in Lakh)
                  </label>
                  <span className="text-xs font-bold text-indigo-600">
                    ₹{form.loanRequiredLakh} Lakh (90% Financing)
                  </span>
                </div>
                <input
                  type="number"
                  min={0.1}
                  max={form.projectCostLakh || 10}
                  step={0.1}
                  value={form.loanRequiredLakh}
                  onChange={(e) => update("loanRequiredLakh", Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Promoter Contribution (Your share): ₹
                  {Math.max(0, (form.projectCostLakh || 3) - (form.loanRequiredLakh || 2.7)).toFixed(2)}{" "}
                  Lakh (10%)
                </p>
              </div>

              {/* Privacy consent */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>
                  By proceeding, you consent to checking your profile against verified government scheme rules. Your data is never sold or shared with commercial lead aggregators.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              {loading ? (
                <span>Matching Engine Running...</span>
              ) : step === 3 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Run AI Scheme Matching
                </>
              ) : (
                <>
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
