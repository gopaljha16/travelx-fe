"use client";
import Link from "next/link";
import { Bus } from "@/lib/api";
import { Clock, MapPin, Users } from "lucide-react";

export default function BusCard({ bus }: { bus: Bus }) {
  const id = bus.id || (bus as any)._id;
  const available = bus.total_seats - bus.booked_seats.length;

  return (
    <Link href={`/buses/${id}`} className="block group">
      <div className="bg-[var(--card)] rounded-[48px] border-2 border-[var(--card-border)] hover:border-[#ec6a2a]/30 hover:shadow-2xl hover:shadow-[#ec6a2a]/10 transition-all duration-500 p-8 overflow-hidden relative">
        {/* Editorial Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ec6a2a]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-[#ec6a2a]/10 transition-colors" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-12">
              <div className="text-center min-w-[80px]">
                <div className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">{bus.departure_time}</div>
                <div className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-widest mt-2">{bus.from_city}</div>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-[0.2em] mb-4">
                  {bus.bus_type}
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--card)] px-4">
                    <span className="text-xl group-hover:scale-125 transition-transform duration-500 inline-block grayscale group-hover:grayscale-0">🚌</span>
                  </div>
                </div>
                <div className="text-[9px] text-[var(--foreground)] opacity-20 mt-4 font-black uppercase tracking-widest">Direct Trip</div>
              </div>
              
              <div className="text-center min-w-[80px]">
                <div className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">{bus.arrival_time}</div>
                <div className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-widest mt-2">{bus.to_city}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-[var(--card-border)]/50 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">
              <span className="flex items-center gap-3">
                <Clock size={14} className="text-[#ec6a2a]" />
                {new Date(bus.journey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
              <span className="flex items-center gap-3">
                <Users size={14} className="text-[#ec6a2a]" />
                {available} seats left
              </span>
              <span className="ml-auto text-xs opacity-100">{bus.name}</span>
            </div>
          </div>
          
          <div className="w-full md:w-px h-px md:h-24 bg-[var(--card-border)]/50" />
          
          <div className="text-right min-w-[160px]">
            <div className="text-[9px] text-[var(--foreground)] opacity-30 font-black uppercase tracking-widest mb-2">Starting From</div>
            <div className="text-4xl font-black text-[var(--foreground)] tracking-tighter">₹{bus.price_per_seat.toLocaleString()}</div>
            <div className="text-[10px] text-[var(--foreground)] opacity-20 font-black uppercase tracking-widest mt-1">per traveler</div>
            
            <div className={`inline-flex mt-6 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all duration-500 ${
              available > 10 ? "bg-green-500/10 border-green-500/20 text-green-500" : 
              available > 0 ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : 
              "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              {available > 0 ? `${available} Available` : "Sold Out"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
