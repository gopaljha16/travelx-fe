"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Heart, LogOut, ChevronRight, Briefcase } from "lucide-react";

const NAV_LINKS = [
  { name: "Flights", href: "/flights", icon: "flight" },
  { name: "Hotels", href: "/hotels", icon: "hotel" },
  { name: "Trains", href: "/trains", icon: "train" },
  { name: "Bus", href: "/buses", icon: "directions_bus" },
  { name: "Forex", href: "/forex", icon: "currency_exchange" },
];

export default function Navbar() {
  const { user, logout, openLogin } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200">
      <nav className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-tight text-blue-700 font-headline">TravelX</Link>
          
          {!user?.must_change_password && (
            <div className="hidden md:flex items-center gap-8 font-headline text-sm font-medium">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.href}
                  className={`${pathname === link.href ? 'text-blue-700 border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-blue-500 transition-colors'}`} 
                  href={link.href}
                >
                  {link.name}
                </Link>
              ))}
              {user?.corporate_role === 'admin' && (
                <Link 
                  className={`${pathname?.startsWith('/mybiz') ? 'text-blue-700 border-b-2 border-blue-600 pb-1' : 'text-slate-600 hover:text-blue-500 transition-colors'}`} 
                  href="/mybiz"
                >
                  MyBiz
                </Link>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {!user?.must_change_password ? (
            <>
              <Link 
                href={user ? "/profile/wishlist" : "#"} 
                onClick={(e) => { if(!user) { e.preventDefault(); openLogin(); } }} 
                className={`flex flex-col items-center justify-center p-1 px-3 md:px-4 transition-all rounded-lg group relative ${wishlistCount > 0 ? "text-blue-600 font-bold" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 right-1.5 md:right-2 bg-blue-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in-50">
                    {wishlistCount}
                  </span>
                )}
                <span className={`material-symbols-outlined leading-none transition-colors ${wishlistCount > 0 ? "text-blue-600" : "group-hover:text-pink-500 font-variation-light"}`} style={{ fontVariationSettings: wishlistCount > 0 ? "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  favorite
                </span>
                <span className="hidden md:inline text-[10px] uppercase font-bold mt-1 tracking-tight">Wishlist</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer group">
                    <div className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center shadow-inner shrink-0 text-white">
                      <span className="font-bold text-[10px] tracking-tighter">
                        {user?.name?.substring(0, 2).toUpperCase() || "TX"}
                      </span>
                    </div>
                    <span className="hidden md:inline text-[11px] font-bold text-slate-700 tracking-tight uppercase">Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all group">
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>logout</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => openLogin()} className="flex items-center gap-2 pl-1 pr-2.5 md:pr-3 py-1.5 rounded-lg bg-gradient-to-r from-[#008cff] to-[#005cab] hover:shadow-lg transition-all cursor-pointer group group-active:scale-95 shadow-md">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0 text-[#005cab]">
                    <span className="font-bold text-[10px] tracking-tighter">TX</span>
                  </div>
                  <span className="text-[10px] md:text-[11px] font-bold text-white tracking-tight uppercase whitespace-nowrap">Login</span>
                  <span className="hidden md:inline material-symbols-outlined text-white text-[16px] leading-none group-hover:translate-y-0.5 transition-transform" style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}>expand_more</span>
                </button>
              )}
            </>
          ) : (
             <div className="flex items-center gap-3 bg-slate-100 px-3 md:px-4 py-2 rounded-2xl">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                <span className="hidden md:inline text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Required</span>
             </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {/* Mobile Drawer Wrapper */}
      <div className={`fixed inset-0 z-[1000] lg:hidden ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div 
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Sidebar Content */}
        <aside 
          className={`absolute top-0 left-0 h-screen w-[85%] max-w-[350px] bg-white shadow-[20px_0_50px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-out flex flex-col z-[1001] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* User Header */}
          <div className="p-8 bg-gradient-to-br from-[#005cab] via-[#008cff] to-[#005cab] text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-12 -translate-x-12 blur-2xl" />
            
            <div className="flex justify-between items-center mb-10 relative z-10">
              <Link href="/" className="text-2xl font-extrabold tracking-tighter font-headline">Travel<span className="text-blue-200">X</span></Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90 border border-white/10"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative z-10">
              {user ? (
                <Link href="/profile" className="flex items-center gap-4 group bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 transition-all hover:bg-white/15">
                  <div className="w-14 h-14 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black text-xl shadow-xl">
                    {user?.name?.substring(0, 1).toUpperCase() || "T"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate text-base">{user?.name || "Premium Traveler"}</p>
                    <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest truncate opacity-80 mt-0.5">{user?.corporate_role || 'Personal Account'}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-black text-xl leading-tight">Travel Smarter.</h3>
                    <p className="text-xs text-blue-100 font-medium mt-2 leading-relaxed opacity-90">Sign in to sync your bookings across devices and unlock exclusive deals.</p>
                  </div>
                  <button onClick={() => { setIsMobileMenuOpen(false); openLogin(); }} className="w-full py-4 bg-white text-blue-700 font-black rounded-2xl shadow-xl shadow-blue-900/40 active:scale-95 transition-all text-xs uppercase tracking-[0.15em]">
                    Login / Create Account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links - Scrollable */}
          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-9 custom-scrollbar bg-white">
            <section>
              <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[.25em] mb-5">Main Services</p>
              <div className="grid gap-2.5">
                {NAV_LINKS.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all group ${
                      pathname === link.href ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${pathname === link.href ? 'bg-white shadow-md text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-blue-500 shadow-inner group-hover:shadow-sm'}`}>
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: pathname === link.href ? "'FILL' 1" : "'FILL' 0" }}>
                        {link.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="block text-[15px] tracking-tight">{link.name}</span>
                      <span className="block text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Book your {link.name.toLowerCase()}</span>
                    </div>
                    {pathname === link.href && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[.25em] mb-5">Personalization</p>
              <div className="grid gap-2.5">
                <Link href="/bookings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-amber-500 shadow-inner group-hover:shadow-sm transition-all text-xl">
                    <span className="material-symbols-outlined text-[24px]">luggage</span>
                  </div>
                  <span className="text-[15px] tracking-tight">Trip History</span>
                </Link>
                
                <Link href="/profile/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-pink-500 shadow-inner group-hover:shadow-sm transition-all text-xl">
                    <span className="material-symbols-outlined text-[24px]">favorite</span>
                  </div>
                  <span className="text-[15px] tracking-tight">Saved Favorites</span>
                  {wishlistCount > 0 && <span className="ml-auto bg-pink-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg shadow-pink-500/20">{wishlistCount}</span>}
                </Link>
                
                {user?.corporate_role === 'admin' && (
                  <Link href="/mybiz" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-blue-700 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100 transition-all shadow-sm group">
                     <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Briefcase size={22} />
                     </div>
                     <div className="flex-1">
                       <p className="text-[15px] tracking-tight">MyBiz Admin</p>
                       <p className="text-[9px] text-blue-500 font-black uppercase tracking-[.1em] leading-none mt-1">Corporate Portal</p>
                     </div>
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* Logout Footer - Solid */}
          {user && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 text-[11px] uppercase tracking-widest shadow-sm"
              >
                <LogOut size={18} />
                Terminate Session
              </button>
            </div>
          )}
        </aside>
      </div>
    </header>
  );
}
