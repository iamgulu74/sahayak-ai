'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  ShieldCheck,
  RotateCcw,
  Check,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Camera,
  Upload
} from "lucide-react";
import CameraCaptureModal from "@/components/CameraCaptureModal";
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
  const { user, updateProfile, resetProfile, userProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Reset Profile State
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetToast, setResetToast] = useState<string | null>(null);

  // Profile Photo State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<Partial<UserProfile>>({
    name: userProfile?.name || user?.displayName || "",
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
    photoUrl: userProfile?.photoUrl || (typeof window !== "undefined" ? localStorage.getItem("sahayak_profile_photo") || "" : ""),
    phone: userProfile?.phone || (user as any)?.phoneNumber || "",
    isStreetVendor: false,
    isWoman: false,
    isFarmer: false,
  });

  // Sync profile when auth or stored data arrives
  useEffect(() => {
    const storedPhoto = typeof window !== "undefined" ? localStorage.getItem("sahayak_profile_photo") : null;
    try {
      const stored = sessionStorage.getItem("sahayak_profile") || localStorage.getItem("sahayak_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (storedPhoto && !parsed.photoUrl) parsed.photoUrl = storedPhoto;
        if (parsed && (parsed.projectCostLakh || parsed.district || parsed.age || parsed.photoUrl)) {
          setForm((prev) => ({ ...prev, ...parsed }));
          return;
        }
      }
    } catch {}

    if (userProfile?.projectCostLakh || userProfile?.district || userProfile?.photoUrl) {
      setForm((prev) => ({
        ...prev,
        ...userProfile,
        photoUrl: userProfile.photoUrl || storedPhoto || prev.photoUrl,
        name: userProfile.name || prev.name,
      }));
    } else if (userProfile?.name && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: userProfile.name,
        photoUrl: userProfile.photoUrl || storedPhoto || prev.photoUrl,
      }));
    }
  }, [userProfile]);

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

  // Profile Photo Upload / Camera Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      update("photoUrl", dataUrl);
      if (typeof window !== "undefined") {
        localStorage.setItem("sahayak_profile_photo", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (file: File, dataUrl: string) => {
    update("photoUrl", dataUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("sahayak_profile_photo", dataUrl);
    }
    setIsCameraOpen(false);
  };

  const handleRemovePhoto = () => {
    update("photoUrl", "");
    if (typeof window !== "undefined") {
      localStorage.removeItem("sahayak_profile_photo");
    }
  };

  // Reset Profile Action
  const handleResetProfile = async () => {
    setIsResetting(true);
    try {
      await resetProfile();
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("sahayak_profile");
        localStorage.removeItem("sahayak_profile");
        localStorage.removeItem("sahayak_all_verified_docs");
        localStorage.removeItem("sahayak_profile_photo");
      }
      setForm({
        name: user?.displayName || (userProfile as any)?.name || "",
        age: undefined,
        state: "Odisha",
        district: "",
        category: "SC",
        gender: "male",
        annualIncomeLakh: undefined,
        educationLevel: "secondary",
        businessStatus: "starting",
        businessType: "",
        businessDescription: "",
        projectCostLakh: undefined,
        loanRequiredLakh: undefined,
        purpose: "business_start",
        photoUrl: "",
        phone: (user as any)?.phoneNumber || (userProfile as any)?.phone || "",
        isStreetVendor: false,
        isWoman: false,
        isFarmer: false,
      });
      setStep(1);
      setShowResetModal(false);
      setResetToast("Profile questionnaire answers have been reset to a clean state.");
      setTimeout(() => setResetToast(null), 3500);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsResetting(false);
    }
  };

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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sahayak_profile", JSON.stringify(full));
      localStorage.setItem("sahayak_profile", JSON.stringify(full));
    }
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

        {/* Toast Notification */}
        {resetToast && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{resetToast}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Step {step} of 3
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {STEPS[step - 1].title}
              </h2>
              <p className="text-xs text-slate-500">{STEPS[step - 1].desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer flex-shrink-0"
              title="Reset questionnaire answers to start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Profile
            </button>
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
                  value={form.name || ""}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Jasaswi Das"
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
                    value={form.age || ""}
                    onChange={(e) => update("age", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 28"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={form.gender || "male"}
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
                    value={form.state || "Odisha"}
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
                    value={form.district || ""}
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
                    value={form.category || "SC"}
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
                    value={form.educationLevel || "secondary"}
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

              {/* Applicant Profile Photo (for Biometric Face Match with Passport Photo) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Applicant Profile Photo (Biometric ID)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Add a clear frontal photograph of yourself. This is automatically matched with the passport-size photo submitted for scheme approval.
                    </p>
                  </div>
                  {form.photoUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 shrink-0">
                      <Check className="w-2.5 h-2.5" /> Photo Attached
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/40 border border-indigo-100/80 flex flex-col sm:flex-row items-center gap-4">
                  {form.photoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={form.photoUrl}
                        alt="Applicant Profile Photo"
                        className="w-24 h-28 object-cover rounded-xl border-2 border-indigo-500 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <User className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-medium text-center px-1">No Photo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-slate-700 font-medium">
                      {form.photoUrl
                        ? "Profile photo is ready! Our AI will use this to verify biometric face match against your passport-size photo."
                        : "Upload a recent portrait photo or take a live photo using your camera."}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {form.photoUrl ? "Change Photo" : "Upload Photo"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        Take Live Selfie
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Accepted: JPG, PNG, WEBP (Max 2MB). Make sure your face is clearly visible.
                    </p>
                  </div>
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
                      className={`p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        form.purpose === p.value
                          ? "bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-200"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Trade Category
                </label>
                <select
                  value={form.businessType || ""}
                  onChange={(e) => update("businessType", e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Industry / Trade --</option>
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Brief Business Description or Equipment Details
                  </label>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isListening
                        ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3 text-rose-600" /> : <Mic className="w-3 h-3 text-slate-500" />}
                    {isListening ? "Listening..." : "Speak Description"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={form.businessDescription || ""}
                  onChange={(e) => update("businessDescription", e.target.value)}
                  placeholder="e.g. Purchase of commercial sewing machine and electric cutting tool for local garment tailoring shop."
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Financial Scale */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Household Income (₹ Lakh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={form.annualIncomeLakh || ""}
                    onChange={(e) => update("annualIncomeLakh", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 2.4"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    NSFDC eligibility ceiling: Under ₹5.00 Lakh
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Project / Machinery Cost (₹ Lakh)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={form.projectCostLakh || ""}
                    onChange={(e) => update("projectCostLakh", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 2.0"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loan Amount Requested (₹ Lakh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={form.loanRequiredLakh || ""}
                  onChange={(e) => update("loanRequiredLakh", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 1.8"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Typically up to 90% of total project cost
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
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching Engine Running...</span>
                </>
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Reset Questionnaire Answers?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will clear all filled profile answers in this questionnaire (identity, demographics, business requirement, and loan parameters) and return you to Step 1. Your login session will remain active.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-3 text-[11px] text-amber-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <span>⚠️ Note:</span>
              </div>
              <p>
                All fields will be wiped to blank so you can enter fresh or updated information.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetProfile}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Yes, Reset Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal for Profile Photo */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Applicant Profile Photo Capture"
        subtitle="Take a clear frontal photo for your applicant profile and biometric matching."
        expectedDocType="Applicant Photograph"
      />
    </div>
  );
}
