import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleTranslateEngine from "@/components/GoogleTranslateEngine";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sahayak AI — The Right Scheme. The Right Partner. The Right Path.",
  description:
    "AI-powered scheme matching and channel partner routing for Scheduled Caste entrepreneurs. Find eligible government financial schemes and nearest authorized partners.",
  keywords: "SC schemes, NSFDC, MUDRA loan, Stand-Up India, SC entrepreneur, financial scheme, channel partner",
  openGraph: {
    title: "Sahayak AI",
    description: "Find the right financial scheme and channel partner for SC entrepreneurs",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${plusJakarta.variable} relative min-h-screen overflow-x-hidden text-slate-900`}>
        {/* Ambient Glassmorphic Background Orbs */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-indigo-500/15 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] rounded-full bg-violet-500/15 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-2/3 -left-20 w-[26rem] h-[26rem] rounded-full bg-sky-400/12 blur-[100px]" />
          <div className="absolute -bottom-32 right-1/4 w-[34rem] h-[34rem] rounded-full bg-fuchsia-400/12 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>
        <AuthProvider>
          <LanguageProvider>
            <GoogleTranslateEngine />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

