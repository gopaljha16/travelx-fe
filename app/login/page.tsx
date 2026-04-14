"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { onboard, sendOtp, verifyOtp } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Step = "identifier" | "otp" | "onboard";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmail = identifier.includes("@");

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
        router.push("/");
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
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to complete profile setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#10213d_0%,#17325f_45%,#f5f7fb_45%,#f5f7fb_100%)]">
      <div className="tx-shell grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1fr_460px]">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <Sparkles size={16} />
            TravelX member access
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
            Sign in to manage buses, hotels, and bookings in one place.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            Your frontend already talks to the live TravelX auth endpoints. This screen is now cleaner, more trustworthy, and easier to complete.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <h2 className="text-lg font-bold">OTP-first login</h2>
              <p className="mt-2 text-sm text-white/75">Phone or email sign-in backed by your real `/auth/send-otp` and `/auth/verify-otp` APIs.</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <h2 className="text-lg font-bold">Trusted session flow</h2>
              <p className="mt-2 text-sm text-white/75">After verification we refresh the profile and send users straight into the booking experience.</p>
            </div>
          </div>
        </div>

        <div className="tx-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="tx-kicker">TravelX</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {step === "identifier" && "Sign in"}
                {step === "otp" && "Verify OTP"}
                {step === "onboard" && "Complete profile"}
              </h2>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-[#ff6b35]">
              <ShieldCheck size={22} />
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {step === "identifier" && "Use your email or mobile number to receive a one-time password."}
            {step === "otp" && `Enter the OTP sent to ${identifier}.`}
            {step === "onboard" && "Add your name so your TravelX bookings show correctly."}
          </p>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

          {step === "identifier" && (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Phone number or email</span>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {isEmail ? <Mail size={18} /> : <Phone size={18} />}
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="tx-input pl-11"
                    placeholder="9876543210 or you@example.com"
                    required
                  />
                </div>
              </label>

              <button type="submit" disabled={loading || !identifier} className="tx-button-primary w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Send OTP
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">One-time password</span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="tx-input text-center text-lg tracking-[0.4em]"
                  placeholder="000000"
                  required
                />
              </label>

              <button type="submit" disabled={loading || otp.length < 6} className="tx-button-primary w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Verify OTP
              </button>

              <button type="button" onClick={() => setStep("identifier")} className="w-full text-sm font-semibold text-slate-500 hover:text-slate-900">
                Change phone or email
              </button>
            </form>
          )}

          {step === "onboard" && (
            <form onSubmit={handleOnboard} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Full name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="tx-input" placeholder="Your name" required />
              </label>

              {!isEmail && (
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Email address</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="tx-input" placeholder="Optional email" />
                </label>
              )}

              <button type="submit" disabled={loading || !name} className="tx-button-primary w-full">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Complete setup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
