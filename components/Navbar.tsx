"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout, openLogin } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-slate-200">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-700 font-headline">TravelX</Link>
          <div className="hidden md:flex items-center gap-8 font-headline text-sm font-medium">
            <Link 
              className={`${pathname === '/hotels' ? 'text-blue-700 border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-blue-500 transition-colors'}`} 
              href="/hotels"
            >
              Hotels
            </Link>
            <Link 
              className={`${pathname === '/buses' ? 'text-blue-700 border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-blue-500 transition-colors'}`} 
              href="/buses"
            >
              Bus
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href={user ? "/profile/wishlist" : "#"} 
            onClick={(e) => { if(!user) { e.preventDefault(); openLogin(); } }} 
            className={`flex flex-col items-center justify-center p-1 px-4 transition-all rounded-lg group relative ${wishlistCount > 0 ? "text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {wishlistCount > 0 && (
              <span className="absolute -top-1 right-2 bg-blue-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50">
                {wishlistCount}
              </span>
            )}
            <span className={`material-symbols-outlined leading-none transition-colors ${wishlistCount > 0 ? "text-blue-600" : "group-hover:text-pink-500 font-variation-light"}`} style={{ fontVariationSettings: wishlistCount > 0 ? "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              favorite
            </span>
            <span className="text-[10px] uppercase font-bold mt-1 tracking-tight">Wishlist</span>
          </Link>

          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg bg-gradient-to-r from-[#008cff] to-[#005cab] hover:shadow-lg transition-all cursor-pointer group group-active:scale-95">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 text-[#005cab]">
                <span className="font-bold text-[10px] tracking-tighter">TX</span>
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight uppercase">Logout</span>
              <span className="material-symbols-outlined text-white text-[16px] leading-none group-hover:-translate-y-0.5 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>logout</span>
            </button>
          ) : (
            <button onClick={() => openLogin()} className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg bg-gradient-to-r from-[#008cff] to-[#005cab] hover:shadow-lg transition-all cursor-pointer group group-active:scale-95 shadow-md">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 text-[#005cab]">
                <span className="font-bold text-[10px] tracking-tighter">TX</span>
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight uppercase">Login or Create Account</span>
              <span className="material-symbols-outlined text-white text-[16px] leading-none group-hover:translate-y-0.5 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
