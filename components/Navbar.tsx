"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Menu, Moon, Sun, Bus, Hotel, BriefcaseBusiness } from "lucide-react";
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
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-slate-900">
          <div className="text-4xl leading-none">
            <span className="text-[#FF6B35]">Travel</span>
            <span className="text-[#2563eb]">X</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/?tab=buses"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Bus size={18} />
            Buses
          </Link>
          <Link
            href="/?tab=hotels"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Hotel size={18} />
            Hotels
          </Link>
          {user && (
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[15px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <BriefcaseBusiness size={18} />
              My Trips
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="hidden rounded-full p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {user ? (
            <div className="relative group">
              <button className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1.5 transition-shadow hover:shadow-md">
                <Menu size={18} className="ml-1.5 text-slate-600" />
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-500 text-white">
                  <User size={18} />
                </div>
              </button>

              <div className="invisible absolute right-0 top-[110%] w-56 rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-[0_2px_16px_rgba(0,0,0,0.12)] transition-all duration-200 ease-in-out group-hover:visible group-hover:opacity-100">
                <Link href="/profile" className="block px-4 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50">Profile</Link>
                <Link href="/bookings" className="block px-4 py-2.5 text-[14px] font-normal text-slate-700 hover:bg-slate-50">My trips</Link>
                <hr className="my-2 border-slate-200" />
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-normal text-slate-700 hover:bg-slate-50">
                   Log out
                 </button>
               </div>
             </div>
           ) : (
            <div className="relative group">
              <button className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1.5 transition-shadow hover:shadow-md">
                <Menu size={18} className="ml-1.5 text-slate-600" />
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-500 text-white">
                  <User size={18} />
                </div>
              </button>

              <div className="invisible absolute right-0 top-[110%] w-56 rounded-xl border border-slate-200 bg-white py-2 opacity-0 shadow-[0_2px_16px_rgba(0,0,0,0.12)] transition-all duration-200 ease-in-out group-hover:visible group-hover:opacity-100">
                <Link href="/login" className="block px-4 py-2.5 text-[14px] font-semibold text-slate-900 hover:bg-slate-50">Log in</Link>
                <Link href="/login" className="block px-4 py-2.5 text-[14px] font-normal text-slate-700 hover:bg-slate-50">Sign up</Link>
                <hr className="my-2 border-slate-200" />
                <Link href="/contact" className="block px-4 py-2.5 text-[14px] font-normal text-slate-700 hover:bg-slate-50">Support</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
