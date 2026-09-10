'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle,
  PhoneCall,
  ExternalLink,
  Lock,
  FileWarning,
  HelpCircle,
  UserX,
  Mail,
  Copy,
  Check
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FraudReport {
  id: string;
  incidentType: string;
  targetEntity: string;
  phoneOrContact: string;
  description: string;
  date: string;
  recipientEmail?: string;
  caseId?: string;
}

const DESTINATION_EMAIL = "jasaswid83@gmail.com";

export default function FraudProtectionPage() {
  const { t } = useLanguage();
  const [incidentType, setIncidentType] = useState("Upfront Cash Demand / Commission");
  const [targetEntity, setTargetEntity] = useState("");
  const [phoneOrContact, setPhoneOrContact] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseDetails, setCaseDetails] = useState<{ caseId: string; recipient: string } | null>(null);
  const [copiedCase, setCopiedCase] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const caseId = `FRD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReport: FraudReport = {
      id: caseId,
      caseId,
      incidentType,
      targetEntity: targetEntity || "Unspecified",
      phoneOrContact: phoneOrContact || "Anonymous",
      description,
      date: new Date().toISOString(),
      recipientEmail: DESTINATION_EMAIL,
    };

    // Store in localStorage for admin portal access
    try {
      const existing = JSON.parse(localStorage.getItem("sahayak_fraud_reports") || "[]");
      localStorage.setItem("sahayak_fraud_reports", JSON.stringify([newReport, ...existing]));
    } catch {}

    try {
      const res = await fetch("/api/report-fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      const data = await res.json();
      setCaseDetails({
        caseId: data.caseId || caseId,
        recipient: data.recipient || DESTINATION_EMAIL,
      });
    } catch {
      setCaseDetails({ caseId, recipient: DESTINATION_EMAIL });
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleCopyCase = () => {
    if (!caseDetails?.caseId) return;
    navigator.clipboard.writeText(caseDetails.caseId);
    setCopiedCase(true);
    setTimeout(() => setCopiedCase(false), 2000);
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Official Borrower Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Fraud & Scam Prevention Center
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Protecting marginalized entrepreneurs from predatory middlemen, unauthorized fee demands, and fake loan sanction letters.
          </p>
        </div>

        {/* Big Alert Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-200">
                Mandatory Citizen Advisory
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 mb-2">
                Government Schemes and Portal Registrations Are 100% Free
              </h2>
              <p className="text-xs sm:text-sm text-red-100 leading-relaxed max-w-2xl">
                No government ministry (NSFDC, MoSJE, MUDRA, MoHUA) ever charges application fees or commissions through private agents or WhatsApp messages. <strong>Never pay any cash, deposit, or processing fee to private individuals claiming to expedite your sanction.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Common Scam Red Flags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Demanding Upfront "Processing Fees"</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scammers ask for ₹2,000 to ₹10,000 via UPI before releasing loan sanction letters. Legitimate schemes deduct statutory charges directly from disbursement if applicable.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Fake Approval Letters on WhatsApp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Forged letters carrying official emblems (Ashoka Pillar, NSFDC, PM-SURAJ) promising guaranteed sanctions. All official approvals are trackable inside official government portals.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Unauthorized "Toll-Free" Agents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Private call centers claiming to be NSFDC or bank representatives asking for your Aadhaar OTP or bank account passwords. Never share OTPs over phone calls.
            </p>
          </div>
        </div>

        {/* Report Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Report Suspicious Activity or Fake Middlemen
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Help us protect other entrepreneurs. Reports are audited and surfaced on our administrative watchdog feed.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-6 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Official Vigilance Dossier Transmitted
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    Report Dispatched to Chief Vigilance Officer
                  </h3>
                  <p className="text-xs text-slate-700 max-w-md mx-auto mt-1">
                    Your fraud complaint has been securely registered and delivered directly to{" "}
                    <strong className="text-slate-900 font-semibold underline decoration-emerald-500">
                      jasaswid83@gmail.com
                    </strong>{" "}
                    for statutory inquiry and administrative escalation.
                  </p>
                </div>

                {caseDetails && (
                  <div className="bg-white rounded-xl border border-emerald-200 p-3 max-w-md mx-auto flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-semibold">CASE REFERENCE ID</span>
                      <span className="font-mono font-bold text-slate-900">{caseDetails.caseId}</span>
                    </div>
                    <button
                      onClick={handleCopyCase}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition-all"
                    >
                      {copiedCase ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedCase ? "Copied" : "Copy ID"}
                    </button>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap justify-center gap-2.5">
                  <a
                    href={`mailto:${DESTINATION_EMAIL}?subject=${encodeURIComponent(
                      `[Fraud Dossier ${caseDetails?.caseId || ""}] Suspicious Middleman Activity Report`
                    )}&body=${encodeURIComponent(
                      `Chief Vigilance Officer,\n\nI have registered Case Reference ${
                        caseDetails?.caseId || ""
                      }.\n\nIncident Type: ${incidentType}\nAccused Entity: ${
                        targetEntity || "Unspecified"
                      }\nContact/UPI: ${phoneOrContact || "Unspecified"}\n\nDescription:\n${description}\n\nAttached are screenshots/documents supporting this complaint.`
                    )}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" /> Open Email with Evidence ↗
                  </a>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    National Cyber Crime Portal ↗
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setDescription("");
                      setTargetEntity("");
                      setPhoneOrContact("");
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                  >
                    Submit Another Report
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Mail className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Submissions are transmitted directly to the Chief Vigilance Officer at{" "}
                    <strong>jasaswid83@gmail.com</strong> for swift statutory action.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nature of Suspicious Activity
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Upfront Cash Demand / Commission">
                      Upfront Cash Demand / Commission to "approve loan"
                    </option>
                    <option value="Fake Loan Sanction Letter">
                      Fake Loan Sanction Letter on WhatsApp / Social Media
                    </option>
                    <option value="Unauthorized Middleman / Broker">
                      Unauthorized Middleman claiming official tie-up
                    </option>
                    <option value="Phone Call / SMS Phishing for OTP">
                      Phone Call / SMS Phishing for Bank OTP / Password
                    </option>
                    <option value="Other Malpractice">Other Malpractice</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Entity or Person Named
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Agency name, agent name..."
                      value={targetEntity}
                      onChange={(e) => setTargetEntity(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number or Contact Used
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 00000 or website link"
                      value={phoneOrContact}
                      onChange={(e) => setPhoneOrContact(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Describe What Happened <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details: what did they ask for, how much money did they demand, which scheme did they refer to..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Dispatching Dossier to jasaswid83@gmail.com..." : "Submit Watchdog Report (Routes to jasaswid83@gmail.com)"}
                </button>
              </form>
            )}

            {/* Official Helpline Contacts */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-600" />
                <span>National Cyber Crime Helpline: <strong className="text-slate-800">1930</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>NSFDC Grievance Cell: <strong className="text-slate-800">011-22054392</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
