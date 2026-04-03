"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp, onboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Phone, Mail, ArrowRight, Loader2 } from "lucide-react";

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOtp(identifier);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(identifier, otp);
      if (res.is_new_user) {
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

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onboard(name, email || undefined);
      await refetch();
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const isEmail = identifier.includes("@");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✈</div>
          <h1 className="text-2xl font-bold text-gray-900">GoTravel</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === "identifier" && "Sign in with your phone or email"}
            {step === "otp" && `Enter the OTP sent to ${identifier}`}
            {step === "onboard" && "Complete your profile"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {step === "identifier" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isEmail ? <Mail size={18} /> : <Phone size={18} />}
              </div>
              <input
                type="text"
                placeholder="Phone number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <p className="text-xs text-gray-400">Enter 10-digit phone (e.g. 9876543210) or email address</p>
            <button
              type="submit"
              disabled={loading || !identifier}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Send OTP</>}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-center text-xl tracking-widest"
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify OTP"}
            </button>
            <button type="button" onClick={() => setStep("identifier")} className="w-full text-sm text-gray-500 hover:text-blue-600">
              ← Change number/email
            </button>
          </form>
        )}

        {step === "onboard" && (
          <form onSubmit={handleOnboard} className="space-y-4">
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            {!isEmail && (
              <input
                type="email"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            )}
            <button
              type="submit"
              disabled={loading || !name}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Complete Setup"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
