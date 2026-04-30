"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CreditCard, Wallet, Landmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ShieldCheck } from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const amount = searchParams.get("amount") || "0";
  const type = searchParams.get("type") || "booking";
  
  const [method, setMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment delay
    setTimeout(() => {
      const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
      router.push(`/bookings/confirmation?pnr=${pnr}&type=${type}`);
    }, 2500);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-body text-slate-800">
      <Navbar />
      
      <div className="max-w-[800px] mx-auto px-4 py-8 mt-16 md:mt-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-headline font-black flex items-center justify-center gap-2">
             Complete Payment
          </h1>
          <div className="flex justify-center items-center gap-1.5 text-slate-500 mt-2 font-bold text-sm">
             <ShieldCheck size={16} className="text-green-600" />
             Secured by <span className="text-[#338ef7] font-black tracking-wide">RAZORPAY</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between p-6 bg-blue-50 text-primary rounded-2xl mb-8">
             <span className="font-bold">Total Amount to Pay</span>
             <span className="text-3xl font-black">₹{amount}</span>
          </div>

          <form onSubmit={handlePayment}>
            <div className="space-y-4 mb-8">
               <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${method === 'card' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                 <input type="radio" name="method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="w-5 h-5 accent-primary" />
                 <CreditCard className={method === 'card' ? 'text-primary' : 'text-slate-400'} />
                 <span className="font-bold">Credit / Debit Card</span>
               </label>
               
               {method === 'card' && (
                 <div className="pl-14 pr-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <input required type="text" placeholder="Card Number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
                      <input required type="password" placeholder="CVV" maxLength={4} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
                    </div>
                    <input required type="text" placeholder="Name on Card" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" />
                 </div>
               )}

               <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${method === 'upi' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                 <input type="radio" name="method" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="w-5 h-5 accent-primary" />
                 <Wallet className={method === 'upi' ? 'text-primary' : 'text-slate-400'} />
                 <span className="font-bold">UPI / QR</span>
               </label>

               <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${method === 'net' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                 <input type="radio" name="method" value="net" checked={method === 'net'} onChange={() => setMethod('net')} className="w-5 h-5 accent-primary" />
                 <Landmark className={method === 'net' ? 'text-primary' : 'text-slate-400'} />
                 <span className="font-bold">Net Banking</span>
               </label>
            </div>

            <button disabled={isProcessing} type="submit" className="w-full bg-[#338ef7] text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed">
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing via Razorpay...
                </>
              ) : (
                `Pay ₹${amount} Securely via Razorpay`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
