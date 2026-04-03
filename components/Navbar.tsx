"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, LogOut, Hotel, Bus, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--card-border)] sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-2xl text-[var(--foreground)] tracking-tighter uppercase">
          TravelX.
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
            Home
          </Link>
          <Link href="/buses" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
            Bus
          </Link>
          <Link href="/hotels" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
            Hotel
          </Link>
          <Link href="/about" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
            About
          </Link>
          <Link href="/contact" className="flex items-center gap-2 text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
            Contact
          </Link>
          {user && (
            <Link href="/bookings" className="text-[var(--foreground)] hover:text-[#ec6a2a] transition-all text-xs font-bold uppercase tracking-widest">
              My Bookings
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--card)] transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="w-px h-6 bg-[var(--card-border)] hidden md:block" />
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 text-sm text-[var(--foreground)] hover:text-[#ec6a2a]">
                <div className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--card-border)] shadow-sm flex items-center justify-center overflow-hidden">
                  <User size={18} className="text-[var(--foreground)]" />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="text-[var(--foreground)] hover:text-red-500 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#ec6a2a] hover:text-white transition-all shadow-xl shadow-black/5"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
