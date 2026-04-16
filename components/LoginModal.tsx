"use client";

import { useState } from "react";
import { Loader2, Mail, X } from "lucide-react";
import { login, onboard, sendOtp, verifyOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

type Step = "identifier" | "otp" | "onboard";
type AuthMode = "LOGIN" | "SIGNUP";
type LoginMethod = "OTP" | "PASSWORD";

export default function LoginModal() {
  const { isLoginModalOpen, closeLogin, refetch } = useAuth();

  const [step, setStep] = useState<Step>("identifier");
  const [authMode, setAuthMode] = useState<AuthMode>("LOGIN");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("OTP");
  
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(identifier, password);
      await refetch();
      closeAndReset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
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
      await onboard(name, email || undefined, password || undefined);
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
      setAuthMode("LOGIN");
      setLoginMethod("OTP");
      setIdentifier("");
      setOtp("");
      setName("");
      setEmail("");
      setPassword("");
      setError("");
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[850px] bg-white rounded-xl overflow-hidden shadow-2xl relative transform transition-all animate-in zoom-in-95 duration-200 flex flex-col md:flex-row h-auto md:h-[600px]">
        
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
        <div className="w-full md:w-[55%] bg-white relative flex flex-col pt-8 pb-6 px-10 overflow-y-auto">
          
          {/* Close Button */}
          <button 
            onClick={closeAndReset}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={20} className="w-5 h-5" />
          </button>

          {/* Login/Signup Tabs */}
          {step === "identifier" && (
            <div className="flex border-b border-slate-100 mb-10">
              <button 
                onClick={() => { setAuthMode("LOGIN"); setLoginMethod("OTP"); }}
                className={`pb-3 text-sm font-bold transition-all px-4 relative ${authMode === "LOGIN" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
              >
                LOGIN
                {authMode === "LOGIN" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => { setAuthMode("SIGNUP"); setLoginMethod("OTP"); }}
                className={`pb-3 text-sm font-bold transition-all px-4 relative ${authMode === "SIGNUP" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
              >
                CREATE ACCOUNT
                {authMode === "SIGNUP" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>}
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center py-4">
            {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">{error}</div>}

            {step === "identifier" && (
              <div className="w-full max-w-sm mx-auto">
                <form onSubmit={loginMethod === "OTP" ? handleSendOtp : handlePasswordLogin}>
                  <label className="block mb-4">
                    <span className="block text-sm font-semibold text-slate-700 mb-2">
                      {loginMethod === "OTP" ? "Mobile Number or Email" : "Email Address"}
                    </span>
                    <div className="flex overflow-hidden rounded-md border border-slate-300 focus-within:border-primary transition-colors hover:border-primary">
                      {loginMethod === "OTP" && (
                        <div className={`bg-slate-50 border-r border-slate-300 flex items-center px-3 gap-2 transition-all duration-300 ${identifier.includes("@") ? "w-12 justify-center" : "w-auto"}`}>
                          {identifier.includes("@") ? (
                            <Mail size={18} className="text-primary" />
                          ) : (
                            <>
                              <span className="text-lg">🇮🇳</span> 
                              <span className="text-sm font-semibold text-slate-700">+91</span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        type={loginMethod === "OTP" ? "text" : "email"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full py-3 px-4 text-slate-900 font-semibold outline-none placeholder:text-slate-400 placeholder:font-normal text-sm"
                        placeholder={loginMethod === "OTP" ? "Enter Mobile Number or Email" : "Enter your email"}
                        autoFocus
                        required
                      />
                    </div>
                  </label>

                  {loginMethod === "PASSWORD" && (
                    <label className="block mb-6">
                      <span className="block text-sm font-semibold text-slate-700 mb-2">Password</span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3 px-4 rounded-md border border-slate-300 focus:border-primary outline-none transition-colors text-slate-900 font-semibold text-sm"
                        placeholder="Enter your password"
                        required
                      />
                    </label>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading || !identifier || (loginMethod === "PASSWORD" && !password)} 
                    className="w-full bg-primary text-white font-black tracking-wide py-3.5 rounded-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (authMode === "SIGNUP" ? "CONTINUE SIGNUP" : "LOGIN")}
                  </button>
                </form>

                {authMode === "LOGIN" && (
                  <div className="mt-4 text-center">
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod(loginMethod === "OTP" ? "PASSWORD" : "OTP")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {loginMethod === "OTP" ? "Login with Password instead" : "Login with OTP instead"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="w-full max-w-sm mx-auto">
                <div className="mb-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900">Verify OTP</h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Enter the code sent to <br/>
                    <span className="font-bold text-slate-900">{identifier}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                    via {identifier.includes("@") ? "Email" : "SMS"}
                  </p>
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
                  className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] text-white font-black tracking-wide py-4 mt-2 rounded-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "VERIFY & CONTINUE"}
                </button>

                <div className="mt-4 text-center">
                  <button type="button" onClick={() => { setStep("identifier"); setOtp(""); }} className="text-[11px] font-bold text-primary hover:underline">
                    Edit {identifier.includes("@") ? "Email" : "Phone"}
                  </button>
                </div>
              </form>
            )}

            {step === "onboard" && (
              <form onSubmit={handleOnboard} className="w-full max-w-sm mx-auto">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold text-slate-900">Complete Your Profile</h3>
                  <p className="text-xs text-slate-500 mt-1">Few more details to create your account.</p>
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

                <label className="block mb-4">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(@ is optional if phone used)</span></span>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full border border-slate-300 focus:border-primary rounded-md py-3 px-3 text-slate-900 font-medium transition-colors outline-none text-sm" 
                    placeholder="Where should we send receipts?" 
                  />
                </label>

                <label className="block mb-6">
                  <span className="block text-xs font-semibold text-slate-700 mb-1">Create Password <span className="text-slate-400 font-normal">(Optional)</span></span>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full border border-slate-300 focus:border-primary rounded-md py-3 px-3 text-slate-900 font-medium transition-colors outline-none text-sm" 
                    placeholder="For faster login next time" 
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={loading || !name} 
                  className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] text-white font-black tracking-wide py-4 mt-2 rounded-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
