"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Hotel, Review, getHotel, getHotelReviews } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Loader2, ShieldCheck, Star } from "lucide-react";

const AMENITY_ICONS: Record<string, string> = {
  pool: "pool", wifi: "wifi", spa: "spa", restaurant: "restaurant", parking: "local_parking",
  gym: "fitness_center", bar: "local_bar", beach: "beach_access", breakfast: "free_breakfast",
  pets: "pets", "air conditioning": "ac_unit", "room service": "room_service",
  laundry: "local_laundry_service", lift: "elevator",
};
function getIcon(amenity: string) {
  const key = Object.keys(AMENITY_ICONS).find(k => amenity.toLowerCase().includes(k));
  return key ? AMENITY_ICONS[key] : "check_circle";
}

function ratingLabel(r: number) {
  if (r >= 4.5) return "Exceptional"; if (r >= 4) return "Excellent";
  if (r >= 3.5) return "Very Good"; if (r > 0) return "Good"; return "New";
}

export default function HotelDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(2);

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (user) {
      Promise.all([
        getHotel(params.id),
        getHotelReviews(params.id).catch(() => ({ reviews: [], total: 0, page: 1, limit: 10, average_rating: 0 })),
      ]).then(([h, rev]) => {
        setHotel(h);
        setReviews(rev.reviews);
        if (h.room_types[0]) setSelectedRoom(h.room_types[0].name);
      }).catch(e => setError(e instanceof Error ? e.message : "Hotel not found"))
        .finally(() => setLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const roomData = useMemo(
    () => hotel?.room_types.find(r => r.name === selectedRoom) ?? hotel?.room_types[0],
    [hotel, selectedRoom]
  );

  const totalNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const totalPrice = (roomData?.price_per_night ?? 0) * totalNights * numRooms;

  // Navigate to the dedicated checkout page with all booking params
  const goToBooking = () => {
    if (!hotel || !roomData || totalNights <= 0) return;
    const p = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      room: roomData.name,
      rooms: String(numRooms),
      guests: String(numGuests),
      price: String(roomData.price_per_night),
    });
    router.push(`/hotels/${hotel.id}/book?${p.toString()}`);
  };

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    </div>
  );

  if (error || !hotel) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Hotel not found</h1>
        <p className="mt-3 text-slate-500">{error ?? "This property is unavailable."}</p>
        <Link href="/hotels" className="mt-6 inline-block bg-[#005cab] text-white px-6 py-3 rounded-xl font-bold">Back to Hotels</Link>
      </div>
    </div>
  );

  const minPrice = hotel.room_types.length
    ? Math.min(...hotel.room_types.map(r => r.price_per_night))
    : hotel.price_per_night;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : hotel.rating;

  return (
    <div className="bg-[#f8f9ff] text-[#0f1c2c] font-body scroll-smooth">
      <Navbar />

      <main className="pt-20 pb-40">
        {/* ── GALLERY BENTO ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 pt-6 mb-10">
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[480px] rounded-2xl overflow-hidden">
            {/* Large primary image */}
            <div className="col-span-2 row-span-2 relative group overflow-hidden bg-slate-200">
              {hotel.images?.[0]
                ? <Image src={hotel.images[0]} alt={hotel.name} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                : <div className="flex h-full items-center justify-center text-slate-300"><BedDouble size={72} /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {[1, 2, 3].map(i => (
              <div key={i} className="relative group overflow-hidden bg-slate-200">
                {hotel.images?.[i]
                  ? <Image src={hotel.images[i]} alt={`${hotel.name} ${i + 1}`} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  : <div className="flex h-full items-center justify-center text-slate-300"><BedDouble size={36} /></div>}
              </div>
            ))}

            {/* Last tile — image + overlay button */}
            <div className="relative group overflow-hidden bg-slate-200">
              {hotel.images?.[4]
                ? <Image src={hotel.images[4]} alt={`${hotel.name} 5`} fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                : <div className="flex h-full items-center justify-center text-slate-300"><BedDouble size={36} /></div>}
              <div className="absolute inset-0 bg-black/20" />
              <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg hover:bg-white transition-all">
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                View all photos
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* ── TITLE ROW ──────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-14">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(hotel.rating) ? "fill-[#005cab] text-[#005cab]" : "fill-slate-200 text-slate-200"} />
                  ))}
                </div>
                {hotel.rating > 0 && (
                  <span className="text-sm font-medium text-slate-600 px-3 py-1 bg-[#eef4ff] rounded-full border border-[#c0c7d6]">
                    {hotel.rating.toFixed(1)} Star Hotel
                  </span>
                )}
                {hotel.is_verified && (
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-[#0f1c2c] mb-4 tracking-tight">{hotel.name}</h1>
              <div className="flex items-center gap-2 text-[#404754]">
                <span className="material-symbols-outlined text-[#005cab] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <p className="text-lg">{hotel.city}, {hotel.address}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-4 shrink-0">
              <div className="text-right">
                <span className="text-slate-500 text-sm block">Starting from</span>
                <span className="text-4xl font-headline font-bold text-[#005cab]">₹{minPrice.toLocaleString()}</span>
                <span className="text-slate-500 font-medium">/night</span>
              </div>
              <a href="#booking" className="bg-[#005cab] hover:bg-[#004786] text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-[#005cab]/20 transition-all hover:-translate-y-0.5 active:scale-95">
                Check Availability
              </a>
            </div>
          </div>

          {/* ── MAIN GRID ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left — main content */}
            <div className="lg:col-span-2 space-y-14">

              {/* Description */}
              <section>
                <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-[#005cab] rounded-full inline-block shrink-0" />
                  Experience Your Stay
                </h2>
                <p className="text-[#404754] leading-relaxed text-base">
                  {hotel.description ?? "A premium property offering comfort and style for every traveller. Enjoy top-tier amenities, beautiful surroundings, and exceptional hospitality during your stay."}
                </p>
              </section>

              {/* Amenities */}
              <section className="bg-[#eef4ff] p-8 rounded-2xl">
                <h2 className="text-2xl font-headline font-bold mb-8 text-[#0f1c2c]">Premium Amenities</h2>
                {hotel.amenities.length === 0 && !hotel.is_pet_allowed && !hotel.is_early_check_in_available ? (
                  <p className="text-sm text-slate-500">No amenities listed for this property.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    {hotel.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-3 text-sm text-[#404754]">
                        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {amenity}
                      </div>
                    ))}
                    {hotel.is_pet_allowed && (
                      <div className="flex items-center gap-3 text-sm text-[#404754]">
                        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Pet Friendly
                      </div>
                    )}
                    {hotel.is_early_check_in_available && (
                      <div className="flex items-center gap-3 text-sm text-[#404754]">
                        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Early Check-in Available
                      </div>
                    )}
                    {hotel.is_late_check_out_available && (
                      <div className="flex items-center gap-3 text-sm text-[#404754]">
                        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Late Check-out Available
                      </div>
                    )}
                    {hotel.is_pay_at_hotel_available && (
                      <div className="flex items-center gap-3 text-sm text-[#404754]">
                        <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Pay at Hotel
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Room Cards */}
              <section>
                <h2 className="text-2xl font-headline font-bold mb-6 text-[#0f1c2c]">Select Your Suite</h2>
                {hotel.room_types.length === 0 ? (
                  <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-6">No room types available for this property.</p>
                ) : (
                  <div className="space-y-5">
                    {hotel.room_types.map((room, idx) => (
                      <div
                        key={room.name}
                        onClick={() => setSelectedRoom(room.name)}
                        className={`bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row border cursor-pointer transition-all ${selectedRoom === room.name ? 'border-[#005cab] ring-2 ring-[#005cab]/15' : 'border-[#c0c7d6]/20 hover:border-[#005cab]/30'}`}
                      >
                        {/* Room Image */}
                        <div className="md:w-64 h-48 md:h-auto relative bg-slate-100 shrink-0">
                          {room.images?.[0]
                            ? <Image src={room.images[0]} alt={room.name} fill unoptimized className="object-cover" />
                            : <div className="flex h-full items-center justify-center text-slate-300"><BedDouble size={36} /></div>}
                        </div>

                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-[#0f1c2c]">{room.name}</h3>
                              <div className="flex gap-2 ml-4 flex-wrap justify-end">
                                {idx === 0 && hotel.room_types.length > 1 && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Most Popular</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-5 text-[#404754] text-sm mb-5">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">group</span>
                                {room.capacity} Adults
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">king_bed</span>
                                {room.total_rooms} Room{room.total_rooms > 1 ? 's' : ''} Available
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-end border-t border-[#c0c7d6]/20 pt-4">
                            <div>
                              <span className="text-2xl font-headline font-bold text-[#005cab]">₹{room.price_per_night.toLocaleString()}</span>
                              <span className="text-xs text-slate-500 block mt-0.5">per night, per room</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedRoom(room.name); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}
                              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${selectedRoom === room.name ? 'bg-[#005cab] text-white shadow-md shadow-[#005cab]/20' : 'bg-[#d6e4f9] text-[#0f1c2c] hover:bg-[#005cab] hover:text-white'}`}
                            >
                              {selectedRoom === room.name ? "Selected ✓" : "Select Room"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Reviews */}
              {reviews.length > 0 && (
                <section>
                  <h2 className="text-2xl font-headline font-bold mb-6 text-[#0f1c2c]">Guest Reviews</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {reviews.slice(0, 6).map(review => (
                      <article key={review.id} className="bg-white rounded-2xl p-5 border border-[#c0c7d6]/20 shadow-sm">
                        <div className="flex items-center gap-1 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={13} className={i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                          ))}
                          <span className="text-xs font-bold text-slate-600 ml-1">{review.rating}/5</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#404754] italic">
                          &ldquo;{review.review_text ?? "Guest left a rating without additional notes."}&rdquo;
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right — sidebar */}
            <div className="space-y-6 lg:sticky lg:top-28 self-start">

              {/* Rating Card */}
              {(hotel.rating > 0 || reviews.length > 0) && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#c0c7d6]/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-4xl font-headline font-bold text-[#005cab]">{avgRating > 0 ? avgRating.toFixed(1) : "New"}</h3>
                      <p className="text-[#404754] font-medium">{ratingLabel(avgRating)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0f1c2c]">{reviews.length} Reviews</p>
                      <p className="text-xs text-slate-500">Verified Guests</p>
                    </div>
                  </div>

                  {reviews.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {["Cleanliness", "Service", "Location"].map((cat, i) => {
                        const score = Math.max(3, avgRating - i * 0.15);
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs font-semibold mb-1.5 text-[#0f1c2c]">
                              <span>{cat}</span><span>{score.toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#d6e4f9] rounded-full">
                              <div className="h-full bg-[#005cab] rounded-full transition-all" style={{ width: `${(score / 5) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {reviews[0]?.review_text && (
                    <div className="border-t border-[#c0c7d6]/20 pt-4">
                      <p className="text-sm italic text-[#404754]">"{reviews[0].review_text}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* House Rules */}
              <div className="bg-[#eef4ff] p-6 rounded-2xl">
                <h3 className="font-bold mb-5 flex items-center gap-2 text-[#0f1c2c]">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  House Rules
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">schedule</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#0f1c2c]">Check-in</p>
                      <p className="text-sm text-[#404754]">{hotel.is_early_check_in_available ? "From 12:00 PM (Early check-in available)" : "After 2:00 PM"}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">logout</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#0f1c2c]">Check-out</p>
                      <p className="text-sm text-[#404754]">{hotel.is_late_check_out_available ? "Until 12:00 PM (Late check-out available)" : "Before 11:00 AM"}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">pets</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#0f1c2c]">Pets</p>
                      <p className="text-sm text-[#404754]">{hotel.is_pet_allowed ? "Pets welcome (prior notice required)" : "No pets allowed"}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">payments</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#0f1c2c]">Payment</p>
                      <p className="text-sm text-[#404754]">{hotel.is_pay_at_hotel_available ? "Online & Pay at hotel available" : "Online payment required"}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Booking Form */}
              <div id="booking" className="bg-white p-6 rounded-2xl shadow-sm border border-[#c0c7d6]/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Reserve Now</p>
                <h2 className="text-2xl font-headline font-black text-[#0f1c2c] mb-1">
                  ₹{(roomData?.price_per_night ?? minPrice).toLocaleString()}
                  <span className="ml-2 text-sm font-semibold text-slate-500">/night</span>
                </h2>
                {roomData && <p className="text-xs text-slate-500 mb-5">{roomData.name}</p>}

                <form onSubmit={e => { e.preventDefault(); goToBooking(); }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f8f9ff] border border-[#c0c7d6] rounded-xl px-3 py-2.5 focus-within:border-[#005cab] focus-within:ring-1 focus-within:ring-[#005cab]">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check-in</label>
                      <input type="date" required value={checkIn} min={new Date().toISOString().split("T")[0]} onChange={e => setCheckIn(e.target.value)}
                        className="block w-full bg-transparent border-none outline-none text-sm font-bold text-[#0f1c2c] mt-0.5 p-0" />
                    </div>
                    <div className="bg-[#f8f9ff] border border-[#c0c7d6] rounded-xl px-3 py-2.5 focus-within:border-[#005cab] focus-within:ring-1 focus-within:ring-[#005cab]">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Check-out</label>
                      <input type="date" required value={checkOut} min={checkIn || new Date().toISOString().split("T")[0]} onChange={e => setCheckOut(e.target.value)}
                        className="block w-full bg-transparent border-none outline-none text-sm font-bold text-[#0f1c2c] mt-0.5 p-0" />
                    </div>
                  </div>

                  <div className="bg-[#f8f9ff] border border-[#c0c7d6] rounded-xl px-3 py-2.5 focus-within:border-[#005cab]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Room Type</label>
                    <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                      className="block w-full bg-transparent border-none outline-none text-sm font-bold text-[#0f1c2c] mt-0.5 p-0 cursor-pointer">
                      {hotel.room_types.map(r => (
                        <option key={r.name} value={r.name}>{r.name} — ₹{r.price_per_night.toLocaleString()}/night</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#f8f9ff] border border-[#c0c7d6] rounded-xl px-3 py-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rooms</label>
                      <input type="number" min={1} max={roomData?.total_rooms ?? 10} value={numRooms} onChange={e => setNumRooms(Number(e.target.value))}
                        className="block w-full bg-transparent border-none outline-none text-sm font-bold text-[#0f1c2c] mt-0.5 p-0" />
                    </div>
                    <div className="bg-[#f8f9ff] border border-[#c0c7d6] rounded-xl px-3 py-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Guests</label>
                      <input type="number" min={1} value={numGuests} onChange={e => setNumGuests(Number(e.target.value))}
                        className="block w-full bg-transparent border-none outline-none text-sm font-bold text-[#0f1c2c] mt-0.5 p-0" />
                    </div>
                  </div>

                  {totalNights > 0 && (
                    <div className="bg-[#eef4ff] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm font-medium text-[#404754]">
                        <span>₹{(roomData?.price_per_night ?? 0).toLocaleString()} × {totalNights} night{totalNights > 1 ? 's' : ''} × {numRooms} room{numRooms > 1 ? 's' : ''}</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#c0c7d6]/30 pt-2 font-black text-[#0f1c2c] text-base">
                        <span>Total</span>
                        <span className="text-[#005cab]">₹{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <button type="button" onClick={goToBooking} disabled={totalNights <= 0}
                    className="w-full bg-[#005cab] hover:bg-[#004786] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#005cab]/20">
                    {totalNights <= 0
                      ? "Select dates to continue"
                      : <>Continue to Booking <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ── STICKY BOOKING BAR ────────────────────────────────── */}
      <footer className="fixed bottom-0 w-full z-40 bg-white/85 backdrop-blur-xl border-t border-[#c0c7d6]/30 px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dates</span>
              <span className="text-sm font-semibold text-[#0f1c2c]">
                {checkIn && checkOut
                  ? `${new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : "Select dates"}
              </span>
            </div>
            <div className="w-px h-8 bg-[#c0c7d6]/40" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guests</span>
              <span className="text-sm font-semibold text-[#0f1c2c]">{numGuests} Guest{numGuests > 1 ? "s" : ""}</span>
            </div>
            <div className="w-px h-8 bg-[#c0c7d6]/40" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Price</span>
              <span className="text-xl font-headline font-bold text-[#005cab]">
                {totalPrice > 0 ? `₹${totalPrice.toLocaleString()}` : `₹${minPrice.toLocaleString()}/night`}
              </span>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col">
            <span className="text-base font-bold text-[#005cab]">₹{minPrice.toLocaleString()} <span className="text-slate-500 font-medium text-xs">/night</span></span>
            <span className="text-xs text-slate-500">{hotel.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <a href="#booking" className="hidden sm:block text-sm font-bold px-5 py-2.5 text-slate-600 hover:text-[#005cab] transition-colors border border-[#c0c7d6]/40 rounded-xl hover:border-[#005cab]/30">
              Edit Details
            </a>
            <button
              onClick={goToBooking}
              disabled={totalNights <= 0}
              className="bg-[#005cab] hover:bg-[#004786] disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-[#005cab]/20 active:scale-95 transition-all"
            >
              {totalNights <= 0 ? "Select Dates First" : "Book This Stay"}
            </button>
          </div>
        </div>
      </footer>

{/* ── FOOTER ────────────────────────────────────────────── */}
      <div className="w-full py-12 bg-slate-50 text-sm border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="text-lg font-bold text-slate-900">TravelX</div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Help Center", "Partner with us"].map(l => (
              <a key={l} href="#" className="text-slate-500 hover:text-slate-900 transition-colors underline decoration-blue-500/30 underline-offset-4">{l}</a>
            ))}
          </div>
          <div className="text-slate-500">© 2026 TravelX. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}
