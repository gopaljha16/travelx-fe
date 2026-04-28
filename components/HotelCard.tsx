"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Hotel } from "@/lib/api";
import { BedDouble, Heart, MapPin, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const isWishlisted = isInWishlist(hotel.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLogin();
      return;
    }
    
    try {
      await toggleWishlistItem(hotel.id, "hotel");
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    }
  };

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
    <div 
      onClick={() => router.push(`/hotels/${hotel.id}`)} 
      className="flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all p-3 gap-5 cursor-pointer group"
    >
      {/* Image Section */}
      <div className="relative w-full md:w-[320px] shrink-0 h-[220px] rounded-xl overflow-hidden bg-slate-100">
        {hotel.images && hotel.images[0] ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <BedDouble size={44} />
          </div>
        )}
        
        {/* Wishlist Toggle */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${isWishlisted ? 'bg-primary text-white shadow-lg' : 'bg-white/80 text-slate-400 hover:text-primary hover:bg-white'}`}
        >
          <Heart size={18} className={isWishlisted ? "fill-white" : ""} />
        </button>
      </div>

      {/* Middle Content */}
      <div className="flex flex-col flex-grow py-1 md:py-2">
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
        
        <h3 className="text-xl md:text-2xl font-headline font-bold text-slate-900 leading-tight mt-1 mb-2">
          {hotel.name}
        </h3>
        
        <p className="flex items-start gap-1.5 text-sm text-slate-500 font-medium line-clamp-2">
          <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
          <span>{hotel.city}, {hotel.address}</span>
        </p>

        <div className="mt-4 md:mt-auto flex flex-wrap gap-2.5 pt-2">
          {hotel.is_pet_allowed && (
            <span className="border border-slate-200 text-slate-600 bg-slate-50 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
              Pet Friendly
            </span>
          )}
          {hotel.amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="border border-slate-200 text-slate-600 bg-slate-50 text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Right Pricing Section */}
      <div className="w-full md:w-[240px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col p-4 md:py-2 md:pl-6 justify-between gap-4 md:gap-0">
        <div className="flex items-center md:items-start justify-between md:flex-col md:gap-1 w-full text-left">
          <div className="flex flex-col md:items-end md:w-full">
            <p className="font-bold text-slate-900 text-base md:text-lg leading-tight">{getRatingLabel(hotel.rating)}</p>
            {hotel.rating > 0 && <p className="text-[10px] md:text-xs text-slate-500 font-medium">Verified Property</p>}
          </div>
        </div>

        <div className="flex items-end justify-between md:flex-col md:items-end w-full md:mt-auto">
          <div className="flex flex-col items-start md:items-end">
            <p className="text-2xl md:text-3xl font-black text-slate-900 font-headline leading-none">₹ {minPrice.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">per night</p>
          </div>

          <div className="md:w-full md:mt-6">
            <span className="hidden md:flex items-center justify-center w-full bg-primary group-hover:bg-blue-700 text-white transition-all py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20">
              Select Room
            </span>
            <div className="md:hidden flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-widest bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100/50">
              Details <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
