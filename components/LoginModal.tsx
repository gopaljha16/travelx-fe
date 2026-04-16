"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Mail, Phone, ShieldCheck, X } from "lucide-react";
import { onboard, sendOtp, verifyOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

type Step = "identifier" | "otp" | "onboard";

export default function LoginModal() {
  const { isLoginModalOpen, closeLogin, refetch } = useAuth();

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("PERSONAL");

  if (!isLoginModalOpen) return null;

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await sendOtp(identifier);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await verifyOtp(identifier, otp);
      if (result.is_new_user) {
        setStep("onboard");
      } else {
        await refetch();
        closeAndReset();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onboard(name, email || undefined);
      await refetch();
      closeAndReset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete profile setup");
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    closeLogin();
    setTimeout(() => {
      setStep("identifier");
      setIdentifier("");
      setOtp("");
      setName("");
      setEmail("");
      setError("");
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[850px] bg-white rounded-xl overflow-hidden shadow-2xl relative transform transition-all animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-auto md:h-[550px]">
        
        {/* Left Pane: Promotional Image Banner */}
        <div className="hidden md:block w-[45%] relative bg-[#f7f2ea]">
          <div className="absolute inset-0">
            <Image 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600" 
              alt="Summer Trips Promo" 
              fill 
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
          
          <div className="absolute bottom-6 left-0 right-0 px-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-lg mx-auto w-[90%]">
              <p className="text-[10px] font-bold tracking-widest text-[#008cff] uppercase mb-1">TravelX Summer Sale:</p>
              <h3 className="font-extrabold text-slate-900 leading-tight">
                Up to 40% OFF* on Packages, Flights, Stays & More.
              </h3>
              <p className="text-[9px] text-slate-400 font-bold mt-2 text-right">*T&C Apply</p>
            </div>
          </div>
        </div>

        {/* Right Pane: Login Form */}
        <div className="w-full md:w-[55%] bg-white relative flex flex-col pt-8 pb-6 px-10">
          
          {/* Close Button */}
          <button 
            onClick={closeAndReset}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={20} className="w-5 h-5" />
          </button>

          {/* Account Type Tabs (Visual Only for matching MakeMyTrip layout) */}
          {step === "identifier" && (
            <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-sm mb-10 w-full max-w-sm mx-auto">
              <button 
                onClick={() => setActiveTab("PERSONAL")}
                className={`flex-1 text-xs font-bold py-2.5 rounded-full transition-colors ${activeTab === "PERSONAL" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                PERSONAL ACCOUNT
              </button>
              <button 
                onClick={() => setActiveTab("MYBIZ")}
                className={`flex-1 text-xs font-bold py-2.5 rounded-full transition-colors ${activeTab === "MYBIZ" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"}`}
              >
                MYBIZ ACCOUNT
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</div>}

            {step === "identifier" && (
              <form onSubmit={handleSendOtp} className="w-full max-w-sm mx-auto">
                <label className="block mb-6">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number or Email</span>
                  <div className="flex overflow-hidden rounded-md border border-slate-300 focus-within:border-primary transition-colors hover:border-primary">
                    <div className="bg-slate-50 border-r border-slate-300 flex items-center px-3 gap-2">
                      <span className="text-lg">🇮🇳</span> 
                      <span className="text-sm font-semibold text-slate-700">+91</span>
                      <span className="material-symbols-outlined text-[16px] text-primary">expand_more</span>
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full py-3 px-4 text-slate-900 font-semibold outline-none placeholder:text-slate-400 placeholder:font-normal text-sm"
                      placeholder="Enter Mobile Number or Email"
                      autoFocus
                      required
                    />
                  </div>
                </label>

                <button 
                  type="submit" 
                  disabled={loading || !identifier} 
                  className="w-full bg-slate-200 text-slate-500 font-black tracking-wide py-3.5 rounded-md transition-all hover:bg-primary hover:text-white hover:shadow-lg disabled:opacity-70 disabled:hover:bg-slate-200 disabled:hover:text-slate-500 disabled:hover:shadow-none flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "CONTINUE"}
                </button>

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex-1 border-t border-slate-200"></div>
                  <span className="text-xs font-medium text-slate-400">Or Login/Signup With</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <button type="button" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-[#ea4335]">
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                  </button>
                  <button type="button" className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                    <Mail size={18} />
                  </button>
                </div>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="w-full max-w-sm mx-auto">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900">Verify OTP</h3>
                  <p className="text-xs text-slate-500 mt-2">Enter the verification code sent to {identifier}</p>
                </div>
                
                <label className="block mb-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    autoFocus
                    className="w-full rounded-md border border-slate-300 focus:border-primary px-4 py-4 text-center text-3xl tracking-[1em] font-black text-slate-900 outline-none placeholder:text-slate-200 placeholder:text-xl placeholder:tracking-normal"
                    placeholder="000000"
                    required
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6} 
                  className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] text-white font-black tracking-wide py-4 mt-2 rounded-md transition-all hover:shadow-lg disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "VERIFY & LOGIN"}
                </button>

                <div className="mt-4 text-center">
                  <button type="button" onClick={() => { setStep("identifier"); setOtp(""); }} className="text-[11px] font-bold text-primary hover:underline">
                    Edit Phone/Email
                  </button>
                </div>
              </form>
            )}

            {step === "onboard" && (
              <form onSubmit={handleOnboard} className="w-full max-w-sm mx-auto">
                <div className="mb-8 text-center">
                  <div className="w-12 h-12 bg-[#eef4ff] text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Complete Your Profile</h3>
                  <p className="text-xs text-slate-500 mt-1">Just a few details to personalize your experience.</p>
                </div>

                <label className="block mb-4">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Full Name</span>
                  <input 
                    type="text" 
                    value={name} 
                    autoFocus
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full border border-slate-300 focus:border-primary rounded-md py-3 px-3 text-slate-900 font-medium transition-colors outline-none text-sm" 
                    placeholder="Enter your full name" 
                    required 
                  />
                </label>

                <label className="block mb-6">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Email Address <span className="text-slate-400 font-normal">(Optional)</span></span>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full border border-slate-300 focus:border-primary rounded-md py-3 px-3 text-slate-900 font-medium transition-colors outline-none text-sm" 
                    placeholder="Where should we send receipts?" 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={loading || !name} 
                  className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] text-white font-black tracking-wide py-4 mt-2 rounded-md transition-all hover:shadow-lg disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "COMPLETE SETUP"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 text-center">
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
              By proceeding, you agree to TravelX's <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>, <span className="text-primary cursor-pointer hover:underline">User Agreement</span> and <span className="text-primary cursor-pointer hover:underline">T&Cs</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
