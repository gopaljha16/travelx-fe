"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-slate-200">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-700 font-headline">TravelX</Link>
          <div className="hidden md:flex items-center gap-8 font-headline text-sm font-medium">
            <Link className="text-blue-700 border-b-2 border-blue-600 pb-1" href="/hotels">Hotels</Link>
            <Link className="text-slate-600 hover:text-blue-500 transition-colors" href="/?tab=buses">Bus</Link>
            <Link className="text-slate-600 hover:text-blue-500 transition-colors" href="#">Flights</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100/50 transition-colors text-slate-600">
            <span className="material-symbols-outlined leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>notifications</span>
          </button>

          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-primary leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>account_circle</span>
              <span className="text-sm font-medium text-slate-800">Logout</span>
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-primary leading-none" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>account_circle</span>
              <span className="text-sm font-medium text-slate-800">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
