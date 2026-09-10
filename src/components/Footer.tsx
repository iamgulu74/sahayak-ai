import Link from "next/link";
import { Sparkles, ExternalLink, AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-xl">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20">
        <div className="section-container py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-800">
              <strong>Disclaimer:</strong> This platform provides AI-assisted information and preliminary eligibility guidance. Final eligibility, loan sanction, interest rate, repayment terms, and application approval are determined by the competent authority and authorized Channel Partner under applicable scheme guidelines.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-headline" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Sahayak AI
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-sm">
              The Right Scheme. The Right Partner. The Right Path. — AI-powered scheme matching and channel partner routing for Scheduled Caste entrepreneurs across India.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-verified text-xs">✓ Verified NSFDC Data</span>
              <span className="badge-ai text-xs">🤖 AI-Assisted</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">🛡️ Secure & Official</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700">Verified Datasets:</span>
              <a href="/data/schemes.json" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline">Schemes.json</a>
              <span>•</span>
              <a href="/data/schemes.csv" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline">Schemes.csv</a>
              <span>•</span>
              <a href="/data/partners.json" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline">Partners.json</a>
              <span>•</span>
              <a href="/data/partners.csv" target="_blank" className="text-indigo-600 hover:text-indigo-800 underline">Partners.csv</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4 text-sm uppercase tracking-wide font-headline">Platform</h3>
            <ul className="space-y-2">
              {[
                { href: "/questionnaire", label: "Find My Scheme" },
                { href: "/schemes", label: "Explore Schemes" },
                { href: "/calculator", label: "EMI Calculator" },
                { href: "/partners", label: "Find a Partner" },
                { href: "/compare", label: "Compare Schemes" },
                { href: "/assistant", label: "AI Assistant" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 hover:text-indigo-600 text-sm transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4 text-sm uppercase tracking-wide font-headline">Resources</h3>
            <ul className="space-y-2">
              {[
                { href: "/how-it-works", label: "How It Works" },
                { href: "/help", label: "Help & FAQ" },
                { href: "/about", label: "About & Disclaimer" },
                { href: "https://nsfdc.nic.in", label: "NSFDC Official", external: true },
                { href: "https://mudra.org.in", label: "MUDRA Official", external: true },
                { href: "https://www.standupmitra.in", label: "Stand-Up India", external: true },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 text-sm transition-colors duration-200">
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2026 Sahayak AI. Official guidelines aligned with Ministry of Social Justice & Empowerment (NSFDC).
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-slate-500 hover:text-indigo-600 text-xs transition-colors">Privacy Policy</Link>
            <Link href="/about" className="text-slate-500 hover:text-indigo-600 text-xs transition-colors">Terms</Link>
            <Link href="/admin" className="text-slate-500 hover:text-indigo-600 text-xs transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
