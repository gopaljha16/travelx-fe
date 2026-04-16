"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Loader2, LogOut, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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
          </div>
        </div>
      </section>
    </div>
  );
}
