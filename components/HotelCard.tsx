"use client";
import Link from "next/link";
import { Hotel } from "@/lib/api";
import { MapPin, Wifi, Car, Waves, PawPrint, Star } from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={14} />,
  Pool: <Waves size={14} />,
  Parking: <Car size={14} />,
};

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const id = hotel.id || (hotel as any)._id;
  const minPrice = hotel.room_types.length
    ? Math.min(...hotel.room_types.map((r) => r.price_per_night))
    : hotel.price_per_night;

  return (
    <Link href={`/hotels/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-[#FF6B35]/50 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row overflow-hidden relative">
        <div className="w-full md:w-64 h-56 md:h-auto flex-shrink-0 bg-gray-100 overflow-hidden relative">
          {hotel.images && hotel.images[0] ? (
            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏨</div>
          )}
          {hotel.is_pet_allowed && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
              <PawPrint size={14} className="text-[#FF6B35]" />
            </div>
          )}
        </div>

        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF6B35] transition-colors leading-tight mb-1">{hotel.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                  <MapPin size={14} className="text-[#FF6B35]" /> {hotel.city} — {hotel.address.split(",")[0]}
                </div>
              </div>
              <div className="bg-[#e8f5e9] text-[#2e7d32] text-sm font-bold px-2.5 py-1 rounded-md shadow-sm">
                {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {hotel.amenities.slice(0, 3).map((a) => (
                <span key={a} className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-md border border-gray-100 whitespace-nowrap">
                  {amenityIcons[a] || null} {a}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="text-xs font-medium text-gray-500 self-center ml-1">+{hotel.amenities.length - 3} more</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-[#FF6B35]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.round(hotel.rating) ? "currentColor" : "none"} strokeWidth={s <= Math.round(hotel.rating) ? 0 : 2} />
              ))}
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-xs text-gray-500 font-medium">from</span>
                <span className="text-xl font-bold text-gray-900">₹{minPrice.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">per night</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

