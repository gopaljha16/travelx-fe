"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { saveApprovalRequest } from "@/lib/mock-requests";
import { getEmployees, OrgEmployee } from "@/lib/api";
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
  const { user } = useAuth();
  const router = useRouter();
  const [isOutOfPolicy, setIsOutOfPolicy] = useState(false);
  const [justification, setJustification] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [myEmployeeRecord, setMyEmployeeRecord] = useState<OrgEmployee | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load this employee's org record to get their manager_id
    getEmployees().then(emps => {
      const me = emps.find(e => e.user_id === user?.id);
      if (me) setMyEmployeeRecord(me);
    }).catch(() => {});
  }, [user?.id]);

  const walletBalance = 250000;
  const fareCost = 8500;
  const companyPolicy = 8000; // Simulated policy limit for demo

  const handleBooking = () => {
    setIsSubmitting(true);
    setError("");

    setTimeout(() => {
      // Use the real manager_id from the employee's org record.
      const managerId = myEmployeeRecord?.manager_id || 'MGR-001';
      const seniorManagerId = myEmployeeRecord?.senior_manager_id || 'SMGR-001';
      const spendingLimit = myEmployeeRecord?.spending_limit ?? companyPolicy;
      
      // Hard limit check: If amount is > 3x limit, prevent booking
      if (fareCost > spendingLimit * 3) {
        setError(`This booking (₹${fareCost.toLocaleString()}) severely exceeds your corporate spending limit (₹${spendingLimit.toLocaleString()}). You cannot book this fare.`);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const outOfPolicy = fareCost > spendingLimit;

      const newRequest: any = {
        id: `REQ-${Date.now()}`,
        employee_id: user?.id ?? 'EMP-001',
        employee_name: user?.name ?? 'Unknown Employee',
        type: 'flight',
        details: 'IndiGo 6E-212 · DEL → BOM · Economy · 15 Oct',
        travel_date: '2026-10-15',
        amount: fareCost,
        spending_limit: spendingLimit,
        requires_dual_approval: outOfPolicy,
        manager_id: managerId,
        senior_manager_id: seniorManagerId,
        manager_approved: false,
        senior_manager_approved: false,
        status: 'pending_manager',
        submitted_at: new Date().toISOString(),
      };

      saveApprovalRequest(newRequest);

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body pb-24">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-32 sm:pt-40">
        <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant mb-6">
          <Link href="/mybiz/portal" className="hover:text-primary transition-colors">Portal</Link>
          <ChevronRight size={14} />
          <span className="text-primary">Corporate Checkout</span>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-lg">Booking Restricted</h3>
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={() => router.push('/mybiz/portal')}
                className="mt-4 text-sm font-black uppercase tracking-widest text-red-800 hover:underline flex items-center gap-2"
              >
                Go back to portal <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

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

      {isSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface rounded-[3rem] shadow-2xl border border-outline-variant/10 p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            
            <h2 className="font-headline text-2xl font-black text-on-surface mb-2">
              {isOutOfPolicy ? "Request Sent for Approval!" : "Booking Confirmed!"}
            </h2>
            
            <p className="text-on-surface-variant font-medium mb-8">
              {isOutOfPolicy
                ? "Your travel request has been submitted. Your manager will review and approve it shortly."
                : "Your corporate booking is confirmed. ₹8,500 has been deducted from the corporate wallet."
              }
            </p>
            
            {isOutOfPolicy && (
              <div className="flex items-center justify-center gap-2 mb-8 px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold w-fit mx-auto">
                <Clock size={16} />
                Pending Manager Approval
              </div>
            )}
            
            <div className="flex gap-3">
              <Link 
                href="/mybiz/portal"
                className="flex-1 py-3 rounded-2xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-colors text-sm"
              >
                Back to Portal
              </Link>
              <Link 
                href="/mybiz/my-requests"
                className="flex-1 voyage-button py-3 rounded-2xl text-white font-bold text-sm inline-flex items-center justify-center gap-2"
              >
                View Status <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
