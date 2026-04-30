"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Ticket, Download, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pnr = searchParams.get("pnr") || "UNKNOWN";
  const type = searchParams.get("type") || "booking";

  const [irctcAuthStatus, setIrctcAuthStatus] = useState<"pending" | "success">("pending");

  useEffect(() => {
    if (type === "train") {
      const timer = setTimeout(() => {
        setIrctcAuthStatus("success");
      }, 2500); // Simulate IRCTC password entry process
      return () => clearTimeout(timer);
    }
  }, [type]);

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-body text-slate-800">
      <Navbar />
      
      <div className="max-w-[700px] mx-auto px-4 py-8 mt-16 md:mt-24 text-center">
        
        {type === "train" && irctcAuthStatus === "pending" ? (
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 size={48} className="text-primary animate-spin mb-6" />
             <h2 className="text-2xl font-bold mb-2">IRCTC Authentication</h2>
             <p className="text-slate-500">Please wait while we securely connect with IRCTC...</p>
             <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 text-sm text-left">
               <span className="material-symbols-outlined text-slate-400">lock</span>
               <span className="text-slate-600">Simulating IRCTC password and captcha verification. This happens automatically in this mock environment.</span>
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in duration-300">
             {/* Decorative background shape */}
             <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-50 rounded-full blur-3xl"></div>

             <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <CheckCircle2 size={40} className="animate-in zoom-in duration-500" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-headline font-black mb-2">Booking Confirmed!</h1>
                <p className="text-slate-500 font-medium mb-8">Your {type} ticket has been successfully booked.</p>

                {type === "train" && (
                   <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mb-6">
                     <CheckCircle2 size={16} /> IRCTC Authentication Successful
                   </div>
                )}

                <div className="w-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                   <div className="text-left flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                        <Ticket size={24} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                         {type === "train" ? "IRCTC PNR NUMBER" : "AIRLINE PNR NUMBER"}
                       </p>
                       <p className="text-2xl font-black tracking-widest">{pnr}</p>
                     </div>
                   </div>
                   
                   <button className="text-sm font-bold text-primary flex items-center gap-2 hover:underline">
                     <Download size={16} /> Download E-Ticket
                   </button>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-4">
                   <button onClick={() => router.push("/")} className="flex-1 py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                     Back to Home
                   </button>
                   <button onClick={() => router.push("/bookings")} className="flex-1 py-4 rounded-xl font-bold text-white bg-primary shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
                     View My Bookings <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
