'use client';
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/matching-engine";

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  isOtpUser?: boolean;
}

interface AuthContextType {
  user: User | AuthUser | null;
  userProfile: Partial<UserProfile> | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithOtpSession: (data: { name: string; phone: string; email?: string }) => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  language: "en" | "hi" | "or";
  setLanguage: (lang: "en" | "hi" | "or") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<"en" | "hi" | "or">("en");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const data = snap.data() as Partial<UserProfile>;
            setUserProfile(data);
            if (data.languagePreference) setLanguageState(data.languagePreference);
          } else {
            setUserProfile({
              name: u.displayName || u.email?.split("@")[0] || "User",
              languagePreference: "en",
            });
          }
        } catch (error) {
          console.warn("Firestore access restricted by security rules. Using fallback profile:", error);
          setUserProfile({
            name: u.displayName || u.email?.split("@")[0] || "User",
            languagePreference: "en",
          });
        }
      } else {
        // If not logged in via Firebase, check for active verified session
        try {
          const stored = typeof window !== "undefined"
            ? (localStorage.getItem("sahayak_otp_session") || sessionStorage.getItem("sahayak_otp_session") || sessionStorage.getItem("sahayak_profile"))
            : null;
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.phone || parsed.verified)) {
              const otpUser: AuthUser = {
                uid: `otp-${(parsed.phone || "user").replace(/\D/g, "")}`,
                displayName: parsed.name || "Beneficiary",
                phoneNumber: parsed.phone,
                email: parsed.email || null,
                isOtpUser: true,
              };
              setUser(otpUser);
              setUserProfile({
                name: parsed.name || "Beneficiary",
                phone: parsed.phone,
                languagePreference: "en",
                verified: true,
              });
              setLoading(false);
              return;
            }
          }
        } catch {}
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile = { name, languagePreference: "en" as const };
    setUserProfile(newProfile);
    try {
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
    } catch (error) {
      console.warn("Could not persist user profile to Firestore (check Firestore rules):", error);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const fallbackProfile = {
      name: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
      languagePreference: "en" as const,
    };
    try {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", cred.user.uid), fallbackProfile);
        setUserProfile(fallbackProfile);
      } else {
        setUserProfile(snap.data() as Partial<UserProfile>);
      }
    } catch (error) {
      console.warn("Could not access Firestore for Google user profile (check Firestore rules):", error);
      setUserProfile(fallbackProfile);
    }
  };

  const loginWithOtpSession = (data: { name: string; phone: string; email?: string }) => {
    const cleanPhone = (data.phone || "").replace(/\D/g, "");
    const otpUser: AuthUser = {
      uid: `otp-${cleanPhone || "user"}`,
      displayName: data.name || "Beneficiary",
      phoneNumber: data.phone,
      email: data.email || null,
      isOtpUser: true,
    };
    setUser(otpUser);
    const profile = {
      name: data.name || "Beneficiary",
      phone: data.phone,
      languagePreference: "en" as const,
      verified: true,
    };
    setUserProfile(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("sahayak_otp_session", JSON.stringify(data));
      sessionStorage.setItem("sahayak_otp_session", JSON.stringify(data));
      sessionStorage.setItem("sahayak_profile", JSON.stringify(profile));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("sahayak_otp_session");
      sessionStorage.removeItem("sahayak_otp_session");
      sessionStorage.removeItem("sahayak_profile");
    }
    setUser(null);
    setUserProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...userProfile, ...data };
    setUserProfile(updated);
    try {
      await setDoc(doc(db, "users", user.uid), updated, { merge: true });
    } catch (error) {
      console.warn("Could not save updated profile to Firestore (check Firestore rules):", error);
    }
  };

  const setLanguage = (lang: "en" | "hi" | "or") => {
    setLanguageState(lang);
    if (user) updateProfile({ languagePreference: lang });
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAuthenticated: !!user, login, register, loginWithGoogle, loginWithOtpSession, logout, updateProfile, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
