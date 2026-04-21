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
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="rounded-[36px] bg-[linear-gradient(135deg,#10213d_0%,#17325f_100%)] p-8 text-white sm:p-10">
          <p className="tx-kicker text-orange-200">My profile</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Your TravelX account.</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            A cleaner account page with the essentials: identity, contact info, trip access, and account status.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="tx-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-orange-50 text-[#ff6b35]">
                <UserRound size={40} />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">{user.name || "TravelX User"}</h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
              <span className={`tx-badge mt-4 ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                <ShieldCheck size={14} />
                {user.is_active ? "Active account" : "Inactive account"}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <Link href="/bookings" className="tx-button-primary w-full">
                <BookOpen size={18} />
                View my trips
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="tx-button-secondary w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="tx-card p-6">
              <p className="tx-kicker">Account details</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Verified information</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Mail size={16} className="text-[#2563eb]" />
                    Email
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-600">{user.email || "Not added yet"}</p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Phone size={16} className="text-[#ff6b35]" />
                    Phone
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-600">{user.phone || "Not added yet"}</p>
                </div>
              </div>
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">TravelX status</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Session and support</h3>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>Your account is connected to the same auth session used by search, booking, and payment verification flows.</p>
                <p>If you need profile changes beyond this screen, the current support contact is `support@travelx.com`.</p>
              </div>
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">Security</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Change Password</h3>
              <p className="mt-2 text-sm text-slate-600 mb-6">If you received an auto-generated password or just want to update your security, you can change it here.</p>
              
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
              }} className="space-y-4">
                {pwMsg && (
                   <div className={`p-4 rounded-xl text-sm font-bold ${pwError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                     {pwMsg}
                   </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Current Password</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                      type="password" 
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">New Password (Min 8 chars)</label>
                  <div className="relative">
                    <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                    <input 
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={pwLoading || !oldPassword || newPassword.length < 8}
                  className="w-full py-3 mt-2 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {pwLoading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
