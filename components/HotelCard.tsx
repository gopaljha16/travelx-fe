"use client";
import Link from "next/link";
import { Hotel } from "@/lib/api";
import { MapPin, Wifi, Car, Waves, PawPrint, Star } from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={12} />,
  Pool: <Waves size={12} />,
  Parking: <Car size={12} />,
};

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const id = hotel.id || (hotel as any)._id;
  const minPrice = hotel.room_types.length
    ? Math.min(...hotel.room_types.map((r) => r.price_per_night))
    : hotel.price_per_night;

  return (
    <Link href={`/hotels/${id}`} className="block group">
      <div className="bg-[var(--card)] rounded-[48px] border-2 border-[var(--card-border)] hover:border-[#ec6a2a]/30 hover:shadow-2xl hover:shadow-[#ec6a2a]/10 transition-all duration-500 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-80 h-64 md:h-auto flex-shrink-0 bg-[var(--muted)] overflow-hidden relative">
          {hotel.images[0] ? (
            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--foreground)] opacity-10 text-6xl font-black">🏨</div>
          )}
          {hotel.is_pet_allowed && (
            <div className="absolute top-6 left-6 bg-[#ec6a2a] p-2.5 rounded-2xl shadow-xl shadow-[#ec6a2a]/20">
              <PawPrint size={16} className="text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-black text-[var(--foreground)] group-hover:text-[#ec6a2a] transition-colors leading-none mb-4 uppercase tracking-tighter">{hotel.name}</h3>
                <div className="flex items-center gap-2 text-[var(--foreground)] opacity-40 text-[10px] font-black uppercase tracking-widest">
                  <MapPin size={14} className="text-[#ec6a2a]" /> {hotel.city} — {hotel.address.split(",")[0]}
                </div>
              </div>
              <div className="bg-[#ec6a2a] text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg shadow-[#ec6a2a]/20">
                {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-8">
              {hotel.amenities.slice(0, 3).map((a) => (
                <span key={a} className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest bg-[var(--muted)] text-[var(--foreground)] px-4 py-2 rounded-xl border border-[var(--card-border)] whitespace-nowrap">
                  {amenityIcons[a] || null} {a}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-[10px] font-black text-[var(--foreground)] opacity-20 self-center ml-2">+{hotel.amenities.length - 3} more</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-[var(--card-border)]/50">
            <div className="flex items-center gap-1.5 text-[#ec6a2a]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.round(hotel.rating) ? "currentColor" : "none"} strokeWidth={2} />
              ))}
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-[9px] text-[var(--foreground)] opacity-30 font-black uppercase tracking-widest">from</span>
                <span className="text-4xl font-black text-[var(--foreground)] tracking-tighter">₹{minPrice.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-[var(--foreground)] opacity-20 font-black uppercase tracking-widest mt-1">per night</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
