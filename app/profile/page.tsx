"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { User, Phone, Mail, Shield, Loader2, LogOut, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-[#ec6a2a]" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-40 transition-colors duration-500">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24">
        {/* Editorial Header */}
        <header className="mb-24 animate-fade-in">
          <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">User Identity</p>
          <h1 className="text-6xl md:text-8xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">The Profile.</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 animate-slide-up">
          {/* Avatar & Basic Info Card */}
          <div className="md:col-span-5">
            <div className="bg-[var(--card)] rounded-[64px] border-4 border-[var(--card-border)] p-12 text-center relative overflow-hidden shadow-2xl shadow-[#ec6a2a]/5 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#ec6a2a]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#ec6a2a]/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-32 h-32 rounded-[48px] bg-[var(--muted)] border-4 border-[var(--card-border)] mx-auto flex items-center justify-center text-[#ec6a2a] mb-8 group-hover:scale-105 transition-transform duration-500">
                  <User size={56} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none mb-4">{user.name || "Access User"}</h2>
                <div className="inline-block px-6 py-2 rounded-full bg-[#ec6a2a] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#ec6a2a]/20">
                  {user.role} Authorization
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link href="/bookings" className="flex items-center justify-between w-full bg-[var(--card)] hover:bg-[#ec6a2a] hover:text-white p-8 rounded-[40px] border-2 border-[var(--card-border)] transition-all group">
                <div className="flex items-center gap-6">
                  <BookOpen size={24} className="text-[#ec6a2a] group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">My Archives</span>
                </div>
                <ArrowRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </Link>
              
              <button 
                onClick={async () => { await logout(); router.push("/login"); }}
                className="flex items-center justify-between w-full bg-red-500/5 hover:bg-red-500 p-8 rounded-[40px] border-2 border-red-500/10 hover:border-red-500 transition-all group"
              >
                <div className="flex items-center gap-6 text-red-500 group-hover:text-white">
                  <LogOut size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </div>
                <ArrowRight size={20} className="opacity-20 group-hover:opacity-100 text-red-500 group-hover:text-white transition-all" />
              </button>
            </div>
          </div>

          {/* Details Deck */}
          <div className="md:col-span-7">
            <div className="bg-[var(--card)] rounded-[64px] border-4 border-[var(--card-border)] p-12 md:p-16 h-full relative overflow-hidden shadow-2xl shadow-[#ec6a2a]/5">
              <h3 className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-12">Verified Protocols.</h3>
              
              <div className="space-y-10">
                {user.email && (
                  <div className="group">
                    <p className="text-[9px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest mb-4">Transmission Address</p>
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] opacity-40 group-hover:text-[#ec6a2a] group-hover:opacity-100 transition-all border-2 border-[var(--card-border)]">
                          <Mail size={24} />
                       </div>
                       <p className="text-xl font-black text-[var(--foreground)] tracking-tight">{user.email}</p>
                    </div>
                  </div>
                )}

                {user.phone && (
                  <div className="group">
                    <p className="text-[9px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest mb-4">Secure Line</p>
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] opacity-40 group-hover:text-[#ec6a2a] group-hover:opacity-100 transition-all border-2 border-[var(--card-border)]">
                          <Phone size={24} />
                       </div>
                       <p className="text-xl font-black text-[var(--foreground)] tracking-tight">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="group">
                  <p className="text-[9px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest mb-4">Access Status</p>
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] opacity-40 group-hover:text-green-500 group-hover:opacity-100 transition-all border-2 border-[var(--card-border)]">
                        <Shield size={24} />
                     </div>
                     <div>
                       <p className="text-xl font-black text-green-500 tracking-tight uppercase">{user.is_active ? "Verified & Active" : "Suspended"}</p>
                       <p className="text-[10px] font-bold text-[var(--foreground)] opacity-20 uppercase tracking-widest mt-1">Operational across all TravelX nodes</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="mt-20 pt-12 border-t border-[var(--card-border)]/50">
                <p className="text-[10px] font-bold text-[var(--foreground)] opacity-20 uppercase tracking-widest leading-relaxed">
                  To modify your TravelX verified identity or update legacy protocols, please contact the global concierge helpdesk at support@travelx.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
