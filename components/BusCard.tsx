"use client";

import Link from "next/link";
import { Bus } from "@/lib/api";
import { ArrowRight, ShieldCheck, Wifi, Battery, MapPin, Info, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function BusCard({ bus }: { bus: Bus }) {
  const { user, openLogin } = useAuth();
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const isWishlisted = isInWishlist(bus.id);
  const availableSeats = bus.total_seats - bus.booked_seats.length;
  const soldOut = availableSeats <= 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }
    
    try {
      await toggleWishlistItem(bus.id, "bus");
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  };

  // Calculate duration string e.g. "06h 30m"
  const getDuration = () => {
    const [dh, dm] = bus.departure_time.split(":").map(Number);
    const [ah, am] = bus.arrival_time.split(":").map(Number);
    let totalMins = (ah * 60 + am) - (dh * 60 + dm);
    if (totalMins < 0) totalMins += 1440; // overnight
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex flex-col md:flex-row p-5 md:items-center gap-6">
        
        {/* Left: Operator & Bus Info */}
        <div className="md:w-1/4">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">
              {bus.name}
            </h3>
            <button 
              onClick={handleWishlist}
              className={`p-1.5 rounded-full transition-all md:hidden xl:flex ${isWishlisted ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
            >
              <Heart size={18} className={isWishlisted ? "fill-primary" : ""} />
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
            {bus.bus_type}
          </p>
          
          <div className="flex items-center gap-3 mt-4">
            {bus.is_verified && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                <ShieldCheck size={12} /> VERIFIED
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400">
               <Wifi size={14} className="opacity-60" />
               <Battery size={14} className="opacity-60" />
            </div>
          </div>
        </div>

        {/* Center: Timeline/Schedule */}
        <div className="md:w-5/12 flex-1">
          <div className="flex items-center justify-between relative px-2">
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-slate-900 font-headline">{bus.departure_time}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{bus.from_city}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-6">
               <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">{getDuration()}</span>
               <div className="w-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <div className="flex-1 h-px bg-slate-200 border-t border-dashed border-slate-300"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
               </div>
               <span className="text-[9px] font-bold text-slate-300 mt-1">Direct Service</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-2xl font-black text-slate-900 font-headline">{bus.arrival_time}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{bus.to_city}</p>
            </div>
          </div>
        </div>

        {/* Right: Pricing & CTA */}
        <div className="md:w-3/12 flex flex-col items-center md:items-end md:border-l border-slate-100 md:pl-8">
           <div className="mb-4 text-center md:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price Starting at</p>
              <div className="flex items-baseline gap-1 md:justify-end">
                 <span className="text-sm font-bold text-slate-500">₹</span>
                 <span className="text-3xl font-black text-slate-900 font-headline leading-none">{bus.price_per_seat.toLocaleString()}</span>
              </div>
           </div>

           <div className="flex flex-col gap-2 w-full">
              <Link href={`/buses/${bus.id}`} className="w-full">
                <button 
                  disabled={soldOut} 
                  className="w-full bg-primary hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3 rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5"
                >
                  {soldOut ? "Sold Out" : "Select Seats"}
                </button>
              </Link>
              
              <div className="flex items-center justify-center md:justify-end gap-1.5">
                 <div className={`w-1.5 h-1.5 rounded-full ${availableSeats < 10 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                 <p className={`text-[11px] font-bold ${availableSeats < 10 ? 'text-orange-600' : 'text-slate-500'}`}>
                    {soldOut ? "No Seats" : `${availableSeats} Seats available`}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer stripe for Amenities or Badges */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-2 flex items-center justify-between">
         <div className="flex items-center gap-4">
            {bus.amenities?.slice(0, 5).map(a => (
               <span key={a} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  {a}
               </span>
            ))}
         </div>
         <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-tight">
            <Info size={12} /> Policies
         </button>
      </div>
    </div>
  );
}
