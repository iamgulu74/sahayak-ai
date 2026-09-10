'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle } from "lucide-react";

const STAGES = [
  "Understanding your profile...",
  "Checking eligibility criteria...",
  "Matching financial schemes...",
  "Finding suitable Channel Partners...",
  "Your recommendations are ready!",
];

export default function MatchingPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < STAGES.length) {
        setCurrentStage(i);
      } else {
        clearInterval(interval);
        setComplete(true);
        setTimeout(() => router.push("/recommendations"), 800);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated orb */}
        <div className="relative w-40 h-40 mx-auto mb-12">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 animate-pulse-slow shadow-glow-lg" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Sparkles className="w-14 h-14 text-white" />
          </div>
          {/* Rings */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute inset-0 rounded-full border-2 border-primary-400/20 animate-ping"
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: "1.5s" }} />
          ))}
        </div>

        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-surface-100 mb-8">
          Sahayak AI is working...
        </motion.h2>

        <div className="space-y-4">
          {STAGES.map((stage, i) => (
            <motion.div key={stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= currentStage ? 1 : 0.2, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                i < currentStage ? "bg-success-500/10 border border-success-500/20" :
                i === currentStage ? "bg-primary-500/10 border border-primary-500/30" :
                "border border-transparent"
              }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                i < currentStage ? "bg-success-500/20 text-success-500" :
                i === currentStage ? "bg-primary-500/20" : "bg-surface-800"
              }`}>
                {i < currentStage ? (
                  <CheckCircle className="w-4 h-4 text-success-500" />
                ) : i === currentStage ? (
                  <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-surface-600" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                i <= currentStage ? "text-surface-100" : "text-surface-600"
              }`}>{stage}</span>
            </motion.div>
          ))}
        </div>

        {complete && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-success-400 font-semibold mt-6">
            ✓ Redirecting to your results...
          </motion.p>
        )}

        <p className="text-surface-500 text-xs mt-8">
          This usually takes 2–3 seconds. You may skip at any time.
        </p>
        <button onClick={() => router.push("/recommendations")} className="text-primary-400 hover:text-primary-300 text-sm mt-2 underline transition-colors">
          Skip →
        </button>
      </div>
    </div>
  );
}
