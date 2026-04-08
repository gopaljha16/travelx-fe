"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, LogOut, Menu, Moon, Sun, Globe } from "lucide-react";
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-2xl text-[#FF6B35] tracking-tight">
          <Globe size={28} className="text-[#FF6B35]" />
          TravelX
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link href="/buses" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Buses
          </Link>
          <Link href="/hotels" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Hotels
          </Link>
          <Link href="/about" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </Link>
          {user && (
            <Link href="/bookings" className="text-[15px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
              My Bookings
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="hidden sm:flex text-gray-500 hover:text-gray-900 font-medium text-[15px] p-2.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-2 hover:shadow-md transition-shadow bg-white cursor-pointer">
                <Menu size={18} className="text-gray-600 ml-1.5" />
                <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center overflow-hidden">
                  <User size={18} />
                </div>
              </button>
              
              <div className="absolute right-0 top-[110%] w-56 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.12)] border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                <Link href="/profile" className="block px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-semibold">Profile</Link>
                <Link href="/bookings" className="block px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-normal">My trips</Link>
                <hr className="my-2 border-gray-200" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-normal">
                   Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 px-2 hover:shadow-md transition-shadow bg-white cursor-pointer">
                <Menu size={18} className="text-gray-600 ml-1.5" />
                <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center overflow-hidden">
                  <User size={18} />
                </div>
              </button>
              
              <div className="absolute right-0 top-[110%] w-56 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.12)] border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                <Link href="/login" className="block px-4 py-2.5 text-[14px] font-semibold text-gray-900 hover:bg-gray-50">Log in</Link>
                <Link href="/login" className="block px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-normal">Sign up</Link>
                <hr className="my-2 border-gray-200" />
                <Link href="/about" className="block px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 font-normal">Help Center</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
