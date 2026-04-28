"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/lib/api";
import { BookOpen, Loader2, LogOut, Mail, Phone, ShieldCheck, UserRound, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="pt-[100px] pb-24 px-6 max-w-6xl mx-auto">
        <div className="text-left mb-10">
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
            Account <span className="text-primary italic">Settings</span>
          </h1>
          <p className="text-on-surface-variant text-base font-medium max-w-2xl">
            Manage your personal identity, contact information, and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center text-primary mx-auto overflow-hidden">
                  <UserRound size={48} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-sm border border-outline-variant/10 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-primary" />
                </div>
              </div>
              <h2 className="mt-6 font-headline text-2xl font-bold text-on-surface">{user.name || "Traveler"}</h2>
              <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mt-1">{user.role}</p>
              
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/bookings" className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  <BookOpen size={18} />
                  My Bookings
                </Link>
                <button 
                  onClick={async () => {
                    await logout();
                    router.push("/");
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-surface-container-high text-on-surface rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                  <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
              <h3 className="font-headline font-bold text-base mb-4">Account Health</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`}></div>
                  <span className="text-sm font-semibold">{user.is_active ? "Verified and Active" : "Action Required"}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your identity is secured and synchronized across all TravelX services.
                </p>
              </div>
            </div>
          </div>

          {/* Main Profile Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Identity Info */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl">badge</span>
                <h3 className="font-headline text-xl font-bold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Full Name</label>
                  <div className="bg-surface-container-low rounded-2xl py-4 px-6 font-semibold text-on-surface">
                    {user.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Email Address</label>
                  <div className="bg-surface-container-low rounded-2xl py-4 px-6 font-semibold text-on-surface flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    {user.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Phone Number</label>
                  <div className="bg-surface-container-low rounded-2xl py-4 px-6 font-semibold text-on-surface flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    {user.phone || "Not provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Account Role</label>
                  <div className="bg-surface-container-low rounded-2xl py-4 px-6 font-semibold text-on-surface capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Secion */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl">security</span>
                <h3 className="font-headline text-xl font-bold">Security & Password</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-8 font-medium">Protect your account by regularly updating your password.</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setPwLoading(true);
                setPwError(false);
                setPwMsg("");
                try {
                  const res = await changePassword(oldPassword, newPassword);
                  setPwMsg(res.message);
                  setOldPassword("");
                  setNewPassword("");
                } catch (err: any) {
                  setPwError(true);
                  setPwMsg(err.message || "Failed to update password");
                } finally {
                  setPwLoading(false);
                }
              }} className="space-y-6">
                {pwMsg && (
                   <div className={`p-4 rounded-xl text-sm font-bold animate-in fade-in duration-300 ${pwError ? 'bg-error-container text-on-error-container border border-error/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                     {pwMsg}
                   </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Current Password</label>
                    <div className="relative">
                      <input 
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">key</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">New Password (Min 8 chars)</label>
                    <div className="relative">
                      <input 
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">lock</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={pwLoading || !oldPassword || newPassword.length < 8}
                    className="voyage-button px-10 py-4 rounded-2xl text-on-primary font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {pwLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
