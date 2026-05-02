"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  BriefcaseBusiness,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Plane,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock
} from "lucide-react";

export default function MyBizCheckoutPage() {
  const [isOutOfPolicy, setIsOutOfPolicy] = useState(false);
  const [justification, setJustification] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const walletBalance = 250000;
  const fareCost = 8500;
  const companyPolicy = 8000; // Simulated policy limit for demo

  const handleBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle2 size={48} className="text-emerald-600" />
          </div>
          <h1 className="font-headline text-4xl font-black text-on-surface mb-2">
            {isOutOfPolicy ? "Sent for Approval!" : "Booking Confirmed!"}
          </h1>
          <p className="text-on-surface-variant max-w-md">
            {isOutOfPolicy
              ? "Your booking exceeds the corporate limit and has been routed to your manager for approval."
              : "Your corporate booking is successful. ₹8,500 has been deducted from the Corporate Wallet. GST invoice has been automatically generated."}
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/mybiz/portal" className="px-6 py-3 rounded-xl bg-surface-container-high font-bold hover:bg-surface-container-highest transition-colors">
              Back to Portal
            </Link>
            <Link href="/profile" className="voyage-button px-6 py-3 rounded-xl text-white font-bold inline-flex items-center gap-2">
              View Trips <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 sm:pt-40">
        <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant mb-6">
          <Link href="/mybiz/portal" className="hover:text-primary transition-colors">Portal</Link>
          <ChevronRight size={14} />
          <span className="text-primary">Corporate Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Left Column: Flight & Policy Details */}
          <div className="space-y-6">
            
            {/* Flight Summary */}
            <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-xl font-black text-on-surface">Review Itinerary</h2>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> MyBiz Fare
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Plane size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-on-surface">IndiGo 6E-212</p>
                    <p className="text-sm text-on-surface-variant">Economy • 15 Oct 2026</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="text-center">
                    <p className="font-bold text-xl text-on-surface">10:00</p>
                    <p className="text-xs text-on-surface-variant uppercase font-black tracking-widest">DEL</p>
                  </div>
                  <div className="flex-1 sm:w-24 flex flex-col items-center">
                    <p className="text-[10px] text-on-surface-variant font-bold mb-1">2h 15m</p>
                    <div className="w-full h-px bg-outline-variant relative">
                      <Plane size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary rotate-90" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-on-surface">12:15</p>
                    <p className="text-xs text-on-surface-variant uppercase font-black tracking-widest">BOM</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Free Meals included</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Zero Cancellation Fee</span>
              </div>
            </div>

            {/* Policy Check Section */}
            <div className={`rounded-[2rem] border shadow-sm p-6 sm:p-8 transition-colors ${isOutOfPolicy ? 'bg-red-50/50 border-red-200' : 'bg-surface-container-lowest border-outline-variant/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-xl font-black text-on-surface">Corporate Policy Check</h2>
                {/* Simulation Toggle for Demo */}
                <button 
                  onClick={() => setIsOutOfPolicy(!isOutOfPolicy)}
                  className="text-xs font-bold underline text-primary"
                >
                  Simulate {isOutOfPolicy ? "In-Policy" : "Out-of-Policy"}
                </button>
              </div>

              {isOutOfPolicy ? (
                <div className="bg-red-100/50 text-red-900 p-4 rounded-xl border border-red-200 flex gap-4">
                  <ShieldAlert size={24} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800">Out of Policy</h3>
                    <p className="text-sm mt-1">This fare (₹8,500) exceeds your company's limit for Economy flights (₹8,000).</p>
                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase tracking-widest text-red-800/70 mb-2">Justification Reason *</label>
                      <input 
                        type="text" 
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder="e.g., Last minute client meeting, only flight available"
                        className="w-full bg-white/80 border border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
                  <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-emerald-800">In Policy</h3>
                    <p className="text-sm mt-0.5">This booking complies with your company's travel policy.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Details */}
            <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm p-6 sm:p-8">
              <h2 className="font-headline text-xl font-black text-on-surface mb-6">Trip Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Trip Purpose</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:border-primary">
                    <option>Client Meeting</option>
                    <option>Internal Offsite</option>
                    <option>Conference / Event</option>
                    <option>Relocation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Cost Center</label>
                  <select 
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Cost Center...</option>
                    <option value="ENG-001">Engineering (ENG-001)</option>
                    <option value="SALES-002">Sales & Marketing (SALES-002)</option>
                    <option value="HR-003">Human Resources (HR-003)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fare Summary & Payment */}
          <div>
            <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm p-6 sticky top-24">
              <h2 className="font-headline text-xl font-black text-on-surface mb-6">Corporate Payment</h2>
              
              <div className="space-y-3 text-sm font-medium border-b border-outline-variant/10 pb-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Base Fare</span>
                  <span className="text-on-surface">₹7,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Taxes & Surcharges</span>
                  <span className="text-on-surface">₹1,300</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>MyBiz Discount</span>
                  <span>- ₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-on-surface">Total Amount</span>
                <span className="font-headline text-3xl font-black text-primary">₹8,500</span>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet size={20} className="text-primary" />
                  <span className="font-bold text-sm text-on-surface">Corporate Wallet</span>
                </div>
                <div className="flex justify-between text-sm mt-3 pt-3 border-t border-primary/10">
                  <span className="text-on-surface-variant">Available Balance</span>
                  <span className="font-bold text-on-surface">₹{walletBalance.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={isSubmitting || (isOutOfPolicy && !justification)}
                className="w-full voyage-button py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><Clock size={20} className="animate-spin" /> Processing...</span>
                ) : isOutOfPolicy ? (
                  <span className="flex items-center gap-2"><AlertTriangle size={20} /> Send for Approval</span>
                ) : (
                  <span className="flex items-center gap-2">Confirm & Pay</span>
                )}
              </button>

              <div className="mt-4 flex items-start gap-2 bg-surface-container-low p-3 rounded-xl">
                <BriefcaseBusiness size={16} className="text-on-surface-variant shrink-0 mt-0.5" />
                <p className="text-[11px] text-on-surface-variant">
                  A GST-compliant invoice will be automatically generated and shared with your finance team for input tax credit.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
