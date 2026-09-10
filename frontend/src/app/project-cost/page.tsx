'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  DollarSign,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CostItem {
  id: string;
  category: string;
  name: string;
  amount: number;
}

const DEFAULT_ITEMS: CostItem[] = [
  { id: "1", category: "Machinery & Equipment", name: "Industrial Sewing Machines (x2) & Interlock", amount: 120000 },
  { id: "2", category: "Machinery & Equipment", name: "Fabric Cutting Table & Accessories", amount: 25000 },
  { id: "3", category: "Raw Materials & Stock", name: "Initial Fabric Inventory & Threads", amount: 65000 },
  { id: "4", category: "Infrastructure / Shop", name: "Shop Security Deposit / Setup", amount: 40000 },
  { id: "5", category: "Working Capital", name: "3 Months Working Capital Buffer", amount: 35000 },
  { id: "6", category: "Permits & Other", name: "Trade License & Udyam Registration", amount: 15000 },
];

export default function ProjectCostPage() {
  const router = useRouter();
  const { userProfile, updateProfile } = useAuth();
  const [items, setItems] = useState<CostItem[]>(DEFAULT_ITEMS);
  const [newCat, setNewCat] = useState("Machinery & Equipment");
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState<number>(10000);

  const totalCost = items.reduce((sum, item) => sum + item.amount, 0);
  const totalCostLakh = Math.round((totalCost / 100000) * 100) / 100;
  const estimatedLoanLakh = Math.round(totalCostLakh * 0.9 * 100) / 100;
  const promoterMarginLakh = Math.round((totalCostLakh - estimatedLoanLakh) * 100) / 100;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) return;
    const newItem: CostItem = {
      id: Date.now().toString(),
      category: newCat,
      name: newName.trim(),
      amount: newAmount,
    };
    setItems((prev) => [...prev, newItem]);
    setNewName("");
    setNewAmount(10000);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyToMatching = async () => {
    try {
      const updated = {
        ...userProfile,
        projectCostLakh: totalCostLakh,
        loanRequiredLakh: estimatedLoanLakh,
      };
      await updateProfile(updated);
      sessionStorage.setItem("sahayak_profile", JSON.stringify(updated));
    } catch {
      // session fallback
    }
    router.push(`/recommendations`);
  };

  const handleResetRaviPreset = () => {
    setItems(DEFAULT_ITEMS);
  };

  return (
    <div className="page-container py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> First-Time Entrepreneur Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Business Project Cost Calculator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Don't know your exact total project cost? Build it from individual line items (machinery, raw materials, shop rent). We automatically sum it and feed it into scheme matching and EMI calculation.
          </p>
        </div>

        {/* Demo Quick Bar */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧵</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Pre-Filled Demo Scenario (Ravi’s Tailoring Business)
              </p>
              <p className="text-xs text-slate-600">
                Standard ₹3.0 Lakh tailoring unit estimate (Machines, Fabric, Shop deposit, Working capital)
              </p>
            </div>
          </div>
          <button
            onClick={handleResetRaviPreset}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            Reset to ₹3L Tailoring Preset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Line Items List & Add Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Add New Line Item */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Add Cost Item
              </h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Machinery & Equipment">Machinery & Equipment</option>
                      <option value="Raw Materials & Stock">Raw Materials & Stock</option>
                      <option value="Infrastructure / Shop">Infrastructure / Shop</option>
                      <option value="Working Capital">Working Capital</option>
                      <option value="Permits & Other">Permits & Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cost in ₹
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Item Description
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Overlock machine or commercial iron..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 text-xs rounded-xl border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Line Items List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Expenses ({items.length})
                </h3>
                <span className="text-xs font-bold text-slate-600">
                  Total: ₹{totalCost.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary Card & Action (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-600" /> Total Project Summary
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  90% Scheme Fit
                </span>
              </div>

              {/* Big Number */}
              <div className="text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-extrabold text-slate-900">
                  ₹{totalCostLakh} Lakh
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  (₹{totalCost.toLocaleString("en-IN")})
                </div>
                <span className="inline-block mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Fits NSFDC Suvidha & MUDRA
                </span>
              </div>

              {/* Financing Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Total Project Cost</span>
                  <span className="font-bold text-slate-900">₹{totalCostLakh} Lakh</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Eligible Loan Portion (90%)</span>
                  <span className="font-bold text-emerald-600">₹{estimatedLoanLakh} Lakh</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Promoter Contribution (10%)</span>
                  <span className="font-bold text-slate-800">₹{promoterMarginLakh} Lakh</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Target Scheme</span>
                  <span className="font-semibold text-indigo-600">NSFDC Suvidha / MCF</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  Clicking below will save this total (<strong>₹{totalCostLakh} Lakh</strong>) to your profile and immediately take you to your matched government schemes.
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleApplyToMatching}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Apply Total & Find Matched Schemes
                </button>
                <Link
                  href={`/calculator?loan=${estimatedLoanLakh}`}
                  className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  Open in EMI Calculator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
