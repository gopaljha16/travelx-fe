"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import HotelCard from "@/components/HotelCard";
import { Hotel, searchHotels } from "@/lib/api";
import { Loader2, MapPin, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

const AMENITIES = [
  "Swimming Pool",
  "Free WiFi",
  "Breakfast Included",
  "Spa",
  "Parking",
  "Gym",
  "Restaurant",
  "Bar",
  "Room Service",
  "Air Conditioning",
  "Laundry",
  "Airport Shuttle",
];

const PRICE_RANGES = [
  { label: "₹ 0 – ₹ 2,500", min: 0, max: 2500 },
  { label: "₹ 2,500 – ₹ 5,500", min: 2500, max: 5500 },
  { label: "₹ 5,500 – ₹ 10,000", min: 5500, max: 10000 },
  { label: "₹ 10,000+", min: 10000, max: undefined as number | undefined },
];

const STAR_OPTIONS = [3, 3.5, 4, 4.5, 5];

const GUEST_RATING_OPTIONS = [
  { label: "4.2+ Very Good", value: 4.2 },
  { label: "4.5+ Excellent", value: 4.5 },
  { label: "4.7+ Exceptional", value: 4.7 },
];

export default function HotelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [lat, setLat] = useState(searchParams.get("lat") || "");
  const [lng, setLng] = useState(searchParams.get("lng") || "");
  const [radiusKm, setRadiusKm] = useState(searchParams.get("radius") || "10");
  const [isLocating, setIsLocating] = useState(false);

  // Date & Guests
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2 Adults, 1 Room");

  // Filters State
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("Hotels");

  // New MakeMyTrip-style filters
  const [isPetAllowed, setIsPetAllowed] = useState(false);
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState(false);
  const [isLateCheckOut, setIsLateCheckOut] = useState(false);
  const [isPayAtHotel, setIsPayAtHotel] = useState(false);
  const [guestRating, setGuestRating] = useState<number | undefined>();

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchHotels({
        city: city || undefined,
        q: query || undefined,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radius_km: radiusKm ? Number(radiusKm) : undefined,
        min_price: minPrice,
        max_price: maxPrice,
        min_rating: minRating,
        amenities: selectedAmenities.length ? selectedAmenities : undefined,
        is_pet_allowed: isPetAllowed ? true : undefined,
        is_early_check_in_available: isEarlyCheckIn ? true : undefined,
        is_late_check_out_available: isLateCheckOut ? true : undefined,
        is_pay_at_hotel_available: isPayAtHotel ? true : undefined,
      });
      setHotels(response.hotels);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [city, query, lat, lng, radiusKm, minPrice, maxPrice, minRating, selectedAmenities, isPetAllowed, isEarlyCheckIn, isLateCheckOut, isPayAtHotel]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const requestLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          setCity(""); // Clear city so lat/lng takes precedence
          setIsLocating(false);
        },
        (err) => {
          console.error("Location error:", err);
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const sortedHotels = useMemo(() => {
    let next = [...hotels];

    // Client-side guest rating filter (based on hotel.rating since we treat it as guest review rating)
    if (guestRating) {
      next = next.filter((h) => h.rating >= guestRating);
    }

    if (sortBy === "price_low") {
      next.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if (sortBy === "price_high") {
      next.sort((a, b) => b.price_per_night - a.price_per_night);
    } else if (sortBy === "rating") {
      next.sort((a, b) => b.rating - a.rating);
    }
    return next;
  }, [hotels, sortBy, guestRating]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]
    );
  };

  const setPriceFilter = (min: number, max: number | undefined) => {
    if (minPrice === min && maxPrice === max) {
      setMinPrice(undefined);
      setMaxPrice(undefined);
    } else {
      setMinPrice(min);
      setMaxPrice(max);
    }
  };

  const clearFilters = () => {
    setCity("");
    setLat("");
    setLng("");
    setSelectedAmenities([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setSelectedPropertyType("Hotels");
    setIsPetAllowed(false);
    setIsEarlyCheckIn(false);
    setIsLateCheckOut(false);
    setIsPayAtHotel(false);
    setGuestRating(undefined);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (!city && lat && lng) {
      params.set("lat", lat);
      params.set("lng", lng);
      if (radiusKm) params.set("radius", radiusKm);
    }
    router.push(`/hotels?${params.toString()}`);
  };

  const displayLocation = city || (lat && lng ? "Current Location" : "");

  const activeFilterCount = [
    minPrice !== undefined,
    minRating !== undefined,
    selectedAmenities.length > 0,
    isPetAllowed,
    isEarlyCheckIn,
    isLateCheckOut,
    isPayAtHotel,
    guestRating !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-24 pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Search Bar Row */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mb-8 w-full">
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isLocating ? 'my_location' : 'location_on'}
            </span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Location</label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => { 
                    setCity(e.target.value); 
                    if (lat || lng) { setLat(""); setLng(""); }
                  }} 
                  placeholder={isLocating ? "Detecting location..." : (lat && lng ? "Current Location" : "Where to?")} 
                  className={`bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full ${isLocating ? 'text-primary animate-pulse' : 'text-slate-900'}`}
                />
                { lat && !city ? (
                  <button type="button" onClick={() => { setLat(""); setLng(""); setCity(""); }} className="ml-2 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Clear Location">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                ) : (
                  <button type="button" onClick={requestLocation} className="ml-2 text-primary hover:text-blue-700 transition-colors shrink-0" title="Use My Location">
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-2 group transition-colors w-full shadow-inner relative">
            <span className="material-symbols-outlined text-primary mr-3 font-bold">calendar_month</span>
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Check-in Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer p-0 w-full"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-2 group transition-colors w-full shadow-inner relative">
            <span className="material-symbols-outlined text-primary mr-3 font-bold">group</span>
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Guests</label>
              <select 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer p-0 w-full appearance-none"
              >
                <option value="1 Adult, 1 Room">1 Adult, 1 Room</option>
                <option value="2 Adults, 1 Room">2 Adults, 1 Room</option>
                <option value="2 Adults, 2 Rooms">2 Adults, 2 Rooms</option>
                <option value="4 Adults, 2 Rooms">4 Adults, 2 Rooms</option>
              </select>
            </div>
          </div>

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
            Search
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[320px] shrink-0">
            {/* Map Block */}
            <div className="bg-slate-100 rounded-2xl h-[160px] relative overflow-hidden mb-6 shadow-sm border border-slate-200">
               <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at center, #0ea5e9 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <button className="bg-primary hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:scale-105">
                    <MapPin size={14} className="fill-white" />
                    EXPLORE ON MAP
                 </button>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
                  )}
                </h3>
                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">RESET ALL</button>
              </div>

              {/* Radius Filter (Visible only when 'Near Me' is active) */}
              {lat && lng && (
                <div className="mb-6 border-b border-slate-100 pb-6">
                  <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Distance from me <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                  <div className="space-y-3">
                    {["5", "10", "20", "50"].map((r) => (
                      <label key={r} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setRadiusKm(r)}>
                        <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${radiusKm === r ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                        <span className="text-sm font-medium text-slate-600 flex-1">Within {r} km</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Per Night */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Price Per Night <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                
                <div className="space-y-3 mt-4">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(range.min, range.max)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === range.min && maxPrice === range.max ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                        {minPrice === range.min && maxPrice === range.max && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                      </div>
                      <span className="text-sm font-medium text-slate-600 flex-1">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Star Rating <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="flex flex-wrap gap-2">
                  {STAR_OPTIONS.map((star) => (
                    <button
                      key={star}
                      onClick={() => setMinRating(minRating === star ? undefined : star)}
                      className={`py-2 px-4 border rounded-lg text-sm font-bold shadow-sm transition-colors ${minRating === star ? 'bg-primary border-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Rating */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Guest Rating <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {GUEST_RATING_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setGuestRating(guestRating === opt.value ? undefined : opt.value)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${guestRating === opt.value ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                        {guestRating === opt.value && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                      </div>
                      <span className="text-sm font-medium text-slate-600 flex-1">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pet Friendly */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Pet Friendly <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setIsPetAllowed(!isPetAllowed)}>
                  <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 ${isPetAllowed ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'}`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 flex-1">
                    {isPetAllowed ? "Only pet-friendly hotels" : "Show all hotels"}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">pets</span>
                </label>
              </div>

              {/* Check-in / Check-out Flexibility */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Flexibility <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setIsEarlyCheckIn(!isEarlyCheckIn)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isEarlyCheckIn ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {isEarlyCheckIn && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">Early Check-in Available</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setIsLateCheckOut(!isLateCheckOut)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isLateCheckOut ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {isLateCheckOut && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">Late Check-out Available</span>
                  </label>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Payment <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setIsPayAtHotel(!isPayAtHotel)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isPayAtHotel ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                    {isPayAtHotel && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                  </div>
                  <span className="text-sm font-medium text-slate-600 flex-1">Pay at Hotel</span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">payments</span>
                </label>
              </div>

              {/* Amenities */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Amenities <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {AMENITIES.map(amenity => (
                    <label key={amenity} className="flex flex-row items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAmenities.includes(amenity) ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                        {selectedAmenities.includes(amenity) && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                      </div>
                      <span className="text-sm font-medium text-slate-600 flex-1">{amenity}</span>
                      <input type="checkbox" className="hidden" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Property Type <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {["Hotels", "Resorts", "Apartments"].map((type) => (
                    <label key={type} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedPropertyType(type)}>
                      <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedPropertyType === type ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                      <span className="text-sm font-medium text-slate-600 flex-1">{type}</span>
                      {type === "Hotels" && <span className="text-xs text-slate-400">({hotels.length})</span>}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h1 className="text-[22px] font-headline font-bold text-slate-900">
                {loading ? "Discovering stays..." : `Showing ${sortedHotels.length} Properties${displayLocation ? ` near ${displayLocation}` : ''}`}
              </h1>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select className="bg-transparent font-bold text-primary outline-none cursor-pointer border-none p-0 pr-1 text-sm tracking-wide" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">{error}</div>
            ) : sortedHotels.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">No properties found</h3>
                <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or search destination.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
