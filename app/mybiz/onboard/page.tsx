"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { registerOrganization, OrgCreate } from "@/lib/api";
import { Building2, Loader2, CheckCircle2, ArrowRight, FileText, MapPin, Mail, Hash } from "lucide-react";

export default function MyBizOnboardPage() {
  const { user, openLogin } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<OrgCreate>({
    name: "",
    email: "",
    gst_number: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { openLogin(); return; }

    setLoading(true);
    setError("");
    try {
      await registerOrganization(form);
      setSuccess(true);
      setTimeout(() => router.push("/mybiz"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-background min-h-screen text-on-surface font-body">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-6 pt-20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h1 className="font-headline text-3xl font-black text-on-surface">Organisation Registered!</h1>
            <p className="mt-3 text-on-surface-variant">Redirecting you to your MyBiz dashboard...</p>
            <Loader2 className="animate-spin text-primary mx-auto mt-6" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f1c2c_0%,#1a3a5f_100%)] px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl" />
          <div className="max-w-5xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-fixed">
              <Building2 size={14} />
              MyBiz by TravelX
            </span>
            <h1 className="mt-6 font-headline text-4xl sm:text-6xl font-black tracking-tight text-white">
              Register your <span className="text-primary-fixed-dim italic">organisation.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-white/70">
              Set up your corporate travel account in minutes. Manage employees, control travel budgets, and streamline every business trip.
            </p>
          </div>
        </section>

        {/* Form Card */}
        <section className="max-w-3xl mx-auto px-6 -mt-10">
          <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl overflow-hidden">

            {/* Card Header */}
            <div className="bg-surface-container-low px-8 py-6 border-b border-outline-variant/10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Step 1 of 1</p>
              <h2 className="mt-1 font-headline text-2xl font-black text-on-surface">Organisation Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">

              {/* Error Banner */}
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
                  <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {/* Company Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Company Name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Acme Corp"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Business Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="hr@acmecorp.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">GST Number *</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="text"
                    name="gst_number"
                    required
                    placeholder="22AAAAA0000A1Z5"
                    value={form.gst_number}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Registered Address</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input
                    type="text"
                    name="address"
                    placeholder="123, Business Park, MG Road"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                  />
                </div>
              </div>

              {/* City, State, Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { name: "city", label: "City", placeholder: "Bengaluru" },
                  { name: "state", label: "State", placeholder: "Karnataka" },
                  { name: "country", label: "Country", placeholder: "India" },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">{field.label}</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                      <input
                        type="text"
                        name={field.name}
                        placeholder={field.placeholder}
                        value={form[field.name as keyof OrgCreate] ?? ""}
                        onChange={handleChange}
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="voyage-button w-full h-14 rounded-2xl text-white font-bold text-base shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    Register Organisation
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-on-surface-variant mt-2">
                By registering, you agree to TravelX&apos;s Corporate Terms of Service.
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
