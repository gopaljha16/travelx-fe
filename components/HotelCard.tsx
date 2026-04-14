"use client";

import Image from "next/image";
import Link from "next/link";
import { Hotel } from "@/lib/api";
import { BedDouble, MapPin, PawPrint, ShieldCheck, Star } from "lucide-react";

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const minPrice = hotel.room_types.length
    ? Math.min(...hotel.room_types.map((room) => room.price_per_night))
    : hotel.price_per_night;

  const previewAmenities = hotel.amenities.slice(0, 4);

  return (
    <Link href={`/hotels/${hotel.id}`} className="block">
      <article className="tx-card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="relative min-h-[220px] bg-slate-100">
            {hotel.images[0] ? (
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
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="tx-badge bg-white/95 text-slate-700 shadow-sm">
                <Star size={14} className="fill-[#ff6b35] text-[#ff6b35]" />
                {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
              </span>
              {hotel.is_verified && (
                <span className="tx-badge bg-emerald-50 text-emerald-700">
                  <ShieldCheck size={14} />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="tx-kicker">TravelX stay</div>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{hotel.name}</h3>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin size={16} className="text-[#ff6b35]" />
                  {hotel.city}, {hotel.address.split(",")[0]}
                </p>
              </div>
              {hotel.is_pet_allowed && (
                <span className="tx-badge bg-orange-50 text-orange-700">
                  <PawPrint size={14} />
                  Pet friendly
                </span>
              )}
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
              {hotel.description || "Comfortable stays, verified amenities, and a smoother booking experience for your next trip."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {previewAmenities.map((amenity) => (
                <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > previewAmenities.length && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  +{hotel.amenities.length - previewAmenities.length} more
                </span>
              )}
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Starting from</p>
                <p className="text-3xl font-black tracking-tight text-slate-900">INR {minPrice.toLocaleString()}</p>
                <p className="text-sm font-semibold text-slate-500">per night</p>
              </div>
              <span className="text-sm font-bold text-[#ff6b35] transition group-hover:translate-x-1">View property</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
