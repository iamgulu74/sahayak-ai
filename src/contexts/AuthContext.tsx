'use client';
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/matching-engine";

interface AuthContextType {
  user: User | null;
  userProfile: Partial<UserProfile> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  language: "en" | "hi" | "or";
  setLanguage: (lang: "en" | "hi" | "or") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<"en" | "hi" | "or">("en");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
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

  const logout = async () => {
    await signOut(auth);
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
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, logout, updateProfile, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
