"use client";

import Image from "next/image";
import Link from "next/link";
import { Hotel } from "@/lib/api";
import { BedDouble, MapPin, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const { user } = useAuth();

  const minPrice = hotel.room_types?.length
    ? Math.min(...hotel.room_types.map((room) => room.price_per_night))
    : hotel.price_per_night;

  // Use real data only, deleted mocked originalPrice and taxes here
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Superb";
    if (rating >= 3.0) return "Very Good";
    if (rating > 0) return "Good";
    return "New Property";
  };

  return (
    <div className="flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all p-3 gap-5">
      {/* Image Section */}
      <div className="relative w-[320px] shrink-0 h-[220px] rounded-xl overflow-hidden bg-slate-100">
        {hotel.images && hotel.images[0] ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            unoptimized
            className="object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <BedDouble size={44} />
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="flex flex-col flex-grow py-2">
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.floor(hotel.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
            />
          ))}
          <span className="text-slate-500 text-xs ml-1">
            {hotel.rating > 0 ? `(${hotel.rating.toFixed(1)} / 5)` : "(No Ratings)"}
          </span>
        </div>
        
        <h3 className="text-2xl font-headline font-bold text-slate-900 leading-tight mt-1 mb-2">
          {hotel.name}
        </h3>
        
        <p className="flex items-start gap-1.5 text-sm text-slate-500 font-medium line-clamp-2">
          <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
          <span>{hotel.city}, {hotel.address}</span>
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {hotel.is_pet_allowed && (
            <span className="border border-slate-200 text-slate-600 bg-slate-50 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              Pet Friendly
            </span>
          )}
          {hotel.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="border border-slate-200 text-slate-600 bg-slate-50 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Right Pricing Section */}
      <div className="w-[220px] shrink-0 border-l border-slate-100 flex flex-col items-end py-2 pl-4 justify-between">
        <div className="flex items-start gap-3 w-full justify-end">
          <div className="text-right">
            <p className="font-bold text-slate-900 text-base">{getRatingLabel(hotel.rating)}</p>
            {hotel.rating > 0 && <p className="text-xs text-slate-500 font-medium">Verified Property</p>}
          </div>
          <div className={`h-11 w-11 text-white rounded-xl flex items-center justify-center font-bold text-lg font-headline ${hotel.rating > 0 ? 'bg-primary' : 'bg-slate-400 text-sm'}`}>
            {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
          </div>
        </div>

        <div className="text-right flex flex-col items-end w-full mt-auto">
          <p className="text-2xl font-black text-slate-900 font-headline leading-none mb-4">₹ {minPrice.toLocaleString()}</p>

          <Link href={`/hotels/${hotel.id}`} className="w-full">
            <button className="w-full bg-primary hover:bg-blue-700 text-white transition-colors py-2.5 rounded-xl font-bold text-sm shadow-md">
              Select Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
