'use client';
import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink, AlertTriangle, Clock, ChevronRight, Navigation, Building2, CheckCircle, ArrowRight } from "lucide-react";
import { getPartnerById } from "@/lib/partners-data";
import { SCHEMES } from "@/lib/schemes-data";

const STATUS_CONFIG = {
  available: { label: "Available for Routing", color: "text-success-400", bg: "bg-success-500/10 border-success-500/30", dot: "bg-success-500" },
  limited: { label: "Limited Capacity", color: "text-warning-500", bg: "bg-warning-500/10 border-warning-500/30", dot: "bg-warning-500" },
  restricted: { label: "Currently Restricted", color: "text-danger-400", bg: "bg-danger-500/10 border-danger-500/30", dot: "bg-danger-500" },
};

export default function PartnerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const partner = getPartnerById(id);
  if (!partner) notFound();

  const status = STATUS_CONFIG[partner.routingStatus];
  const supportedSchemes = partner.supportedSchemes.map(sid => SCHEMES.find(s => s.id === sid)).filter(Boolean);
  const mapsUrl = `https://www.openstreetmap.org/directions?from=&to=${partner.lat},${partner.lng}`;

  return (
    <div className="page-container py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-surface-500 mb-8">
          <Link href="/partners" className="hover:text-surface-300 transition-colors">Find a Partner</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-surface-300">{partner.name}</span>
        </div>

        {/* Routing status caution */}
        <div className="flex items-start gap-3 p-4 bg-warning-500/10 border border-warning-500/20 rounded-xl mb-6">
          <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-warning-400 font-medium text-sm mb-1">Important Notice</p>
            <p className="text-warning-300 text-sm">Partner availability and routing status shown here is <strong>Demo/Prototype Data</strong>. Confirm with the official authority before visiting. Status may change without notice.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium mb-3 ${status.bg} ${status.color}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                    <span className="badge-demo text-xs ml-1">Demo Data</span>
                  </div>
                  <h1 className="text-2xl font-bold text-surface-100 mb-2">{partner.name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-primary-500/20 text-primary-300 text-sm font-semibold">{partner.type}</span>
                    {partner.branchCode && <span className="text-surface-500 text-xs">Branch: {partner.branchCode}</span>}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-surface-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-surface-200 text-sm">{partner.address}</p>
                    <p className="text-surface-400 text-xs">{partner.district}, {partner.state} — PIN {partner.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-surface-500 flex-shrink-0" />
                  <a href={`tel:${partner.phone}`} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">{partner.phone}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-surface-500 flex-shrink-0" />
                  <a href={`mailto:${partner.email}`} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">{partner.email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-surface-500 flex-shrink-0" />
                  <span className="text-surface-400 text-xs">Status last verified: {partner.lastStatusUpdate || "2026-09-08"}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-surface-800">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 px-5">
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
                <a href={`tel:${partner.phone}`} className="btn-secondary text-sm py-2 px-5">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </motion.div>

            {/* Supported Schemes */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold text-surface-100 mb-5 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-500" /> Supported Schemes
              </h2>
              <div className="space-y-3">
                {supportedSchemes.map((scheme) => (
                  <div key={scheme!.id} className="flex items-center justify-between p-4 bg-surface-800/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{scheme!.icon}</span>
                      <div>
                        <p className="text-surface-200 text-sm font-medium">{scheme!.name}</p>
                        <p className="text-surface-500 text-xs">Up to ₹{scheme!.maxLoanLakh}L • {scheme!.interestRatePercent}% p.a.</p>
                      </div>
                    </div>
                    <Link href={`/schemes/${scheme!.id}`} className="btn-ghost text-xs py-1 px-3">Details <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Application Guidance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 bg-primary-500/5 border-primary-500/20">
              <h2 className="text-lg font-semibold text-surface-100 mb-4">Application Guidance</h2>
              <ol className="space-y-3 text-sm text-surface-300">
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>Check your eligibility using the <Link href="/questionnaire" className="text-primary-400 underline">questionnaire</Link>.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>Prepare required documents as per your scheme's checklist.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>Call ahead to confirm current availability before visiting.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</span>Visit the partner with your documents and project report.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-success-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>Track your application status using the <Link href="/tracker" className="text-primary-400 underline">Application Tracker</Link>.</li>
              </ol>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-4">Service Area</h3>
              {(partner.operatingArea || [partner.district, partner.state]).map(area => (
                <div key={area} className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3 h-3 text-surface-500" />
                  <span className="text-surface-300 text-sm">{area}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">Supported Categories</h3>
              <div className="flex flex-wrap gap-2">
                {partner.supportedCategories.map(c => (
                  <span key={c} className="px-2 py-1 rounded-lg bg-primary-500/15 text-primary-400 text-xs font-medium">{c}</span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">Location</h3>
              <p className="text-surface-400 text-xs mb-3">{partner.lat.toFixed(4)}, {partner.lng.toFixed(4)}</p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors">
                <ExternalLink className="w-4 h-4" /> Open in OpenStreetMap
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
