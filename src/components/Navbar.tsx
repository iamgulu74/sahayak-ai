'use client';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Calculator,
  MapPin,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  HelpCircle,
  LogOut,
  User,
  ShieldCheck,
  FileCheck,
  Zap,
  ShieldAlert,
  Play,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import TutorialDemoModal from "@/components/TutorialDemoModal";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "or", label: "ଓଡ଼ିଆ" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/schemes", label: t.schemes, icon: <BookOpen className="w-4 h-4" /> },
    { href: "/eligibility-check", label: t.checkEligibility, icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
    { href: "/tracker", label: "Track Application", icon: <Clock className="w-4 h-4 text-amber-600" /> },
    { href: "/documents", label: t.ocrDocs, icon: <FileCheck className="w-4 h-4 text-indigo-600" /> },
    { href: "/calculator", label: t.emiCalculator, icon: <Calculator className="w-4 h-4" /> },
    { href: "/partners", label: t.findPartner, icon: <MapPin className="w-4 h-4" /> },
    { href: "/assistant", label: t.aiAssistant, icon: <Sparkles className="w-4 h-4 text-purple-600" /> },
    { href: "/literacy", label: t.literacyHub, icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-200/60"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xs group-hover:shadow-sm transition-all duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-headline bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sahayak AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all duration-200"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* How It Works Guide */}
            <button
              onClick={() => setTutorialOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-xs hover:shadow-sm flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer"
              title="Interactive step-by-step process guide"
            >
              <Play className="w-3 h-3 fill-current" /> {t.watchTutorialDemo || "▶ How It Works Guide"}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 border border-slate-200 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                {LANGUAGES.find((l) => l.code === language)?.label || "English"}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[120px] z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                          language === lang.code
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "R"}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 min-w-[180px] z-50"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" /> Dashboard
                      </Link>
                      <Link
                        href="/tracker"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Application Tracker
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      >
                        <User className="w-4 h-4 text-purple-500" /> Admin Console
                      </Link>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Register (OTP)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setTutorialOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" /> Guide
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-200"
          >
            <div className="section-container py-4 space-y-1">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTutorialOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xs mb-2 text-left cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {t.watchTutorialDemo || "▶ How It Works Guide (Step-by-Step)"}
              </button>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 font-semibold text-xs"
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-100 pt-3 mt-2" />
              <div className="flex gap-2 px-4 py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      language === lang.code
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <div className="px-4 pt-3 flex flex-col gap-2">
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Register with OTP
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Comprehensive 0% to 100% Video/Interactive Tutorial Demo Modal */}
    <TutorialDemoModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  );
}
