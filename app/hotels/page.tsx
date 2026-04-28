"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import HotelCard from "@/components/HotelCard";
import { Hotel, searchHotels } from "@/lib/api";
import { Loader2, MapPin, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

// Dynamic import for the map component to avoid SSR issues
const HotelMap = dynamic(() => import("@/components/HotelMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

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

function HotelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [lat, setLat] = useState(searchParams.get("lat") || "");
  const [lng, setLng] = useState(searchParams.get("lng") || "");
  const [radiusKm, setRadiusKm] = useState(searchParams.get("radius") || "10");
  const [isLocating, setIsLocating] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  const Filters = () => (
    <div className="space-y-8">
      {/* Property Type */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {["Hotels", "Resorts", "Villis", "Apartments"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPropertyType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPropertyType === type ? "bg-primary border-primary text-white shadow-md shadow-blue-600/10" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested For You */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suggested For You</p>
        <div className="space-y-3">
          {[
            { label: "Pet Allowed", checked: isPetAllowed, setter: setIsPetAllowed },
            { label: "Early Check-in Available", checked: isEarlyCheckIn, setter: setIsEarlyCheckIn },
            { label: "Late Check-out Available", checked: isLateCheckOut, setter: setIsLateCheckOut },
            { label: "Pay @ Hotel Available", checked: isPayAtHotel, setter: setIsPayAtHotel },
          ].map((filter) => (
            <label key={filter.label} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filter.checked} 
                onChange={(e) => filter.setter(e.target.checked)}
                className="w-5 h-5 rounded-md border-2 border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer" 
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Range (per night)</p>
        <div className="space-y-3">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceFilter(range.min, range.max)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-between group ${
                minPrice === range.min && maxPrice === range.max ? "bg-blue-50 border-primary text-primary" : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span>{range.label}</span>
              <div className={`w-2 h-2 rounded-full ${minPrice === range.min && maxPrice === range.max ? "bg-primary" : "bg-slate-300 group-hover:bg-slate-400"}`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* User Rating */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">User Rating</p>
        <div className="grid grid-cols-2 gap-2">
          {GUEST_RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setGuestRating(guestRating === opt.value ? undefined : opt.value)}
              className={`px-3 py-2.5 rounded-xl text-[11px] font-black border transition-all text-center ${
                guestRating === opt.value ? "bg-primary border-primary text-white shadow-lg shadow-blue-600/20 scale-[1.02]" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Star Category */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Star Category</p>
        <div className="flex flex-wrap gap-2">
          {STAR_OPTIONS.map((star) => (
            <button
              key={star}
              onClick={() => setMinRating(minRating === star ? undefined : star)}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                minRating === star ? "bg-primary border-primary text-white shadow-lg" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white"
              }`}
            >
              <div className="flex flex-col items-center leading-none">
                <span className="text-sm font-black">{star}</span>
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Amenities</p>
        <div className="grid grid-cols-1 gap-2.5">
          {AMENITIES.slice(0, 10).map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={selectedAmenities.includes(amenity)} 
                onChange={() => toggleAmenity(amenity)}
                className="w-5 h-5 rounded-md border-2 border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer" 
              />
              <span className="text-[11px] font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-[50px] pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Search Bar Row */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3 md:gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mb-6 md:mb-8 w-full">
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
                  placeholder={isLocating ? "Detecting..." : (lat && lng ? "Current Location" : "Where to?")} 
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
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dates</label>
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

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold px-10 py-4 md:py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
            Update
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-[320px] shrink-0">
            {/* Map Block */}
             <div className="bg-slate-100 rounded-2xl h-[160px] relative overflow-hidden mb-6 shadow-sm border border-slate-200 group cursor-pointer" onClick={() => setShowMap(true)}>
               <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
                  <HotelMap hotels={hotels.slice(0, 5)} mini />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10"></div>
               <div className="absolute inset-0 flex items-center justify-center z-20">
                 <button 
                  type="button"
                  className="bg-primary hover:bg-blue-700 text-white text-xs font-bold px-5 py-3 rounded-full flex items-center gap-2 shadow-xl border-2 border-white/20 transition-transform group-hover:scale-105"
                 >
                    <MapPin size={16} className="fill-white" />
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
              <Filters />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter & Map Toggle */}
            <div className="lg:hidden flex gap-3 mb-6">
               <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 shadow-sm active:scale-95 transition-all text-sm"
               >
                 <span className="material-symbols-outlined text-primary">filter_list</span>
                 Filters
                 {activeFilterCount > 0 && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
               </button>
               <button 
                onClick={() => setShowMap(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-sm"
               >
                 <span className="material-symbols-outlined">map</span>
                 Map View
               </button>
            </div>

            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
              <h1 className="text-lg md:text-[22px] font-headline font-bold text-slate-900">
                {loading ? "Discovering stays..." : `Showing ${sortedHotels.length} Properties${displayLocation ? ` near ${displayLocation}` : ''}`}
              </h1>
              
              <div className="flex items-center gap-3 text-sm ml-auto md:ml-0 bg-white md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border md:border-none border-slate-100">
                <span className="text-slate-500 font-medium hidden md:inline">Sort by:</span>
                <div className="relative flex items-center">
                  <select className="bg-transparent font-bold text-primary outline-none cursor-pointer border-none p-0 pr-6 text-sm tracking-wide appearance-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] absolute right-0 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-[280px] bg-white rounded-2xl border border-slate-100 animate-pulse flex flex-col md:flex-row gap-4 p-4">
                      <div className="w-full md:w-72 h-48 md:h-full bg-slate-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-4 py-2">
                        <div className="h-6 bg-slate-100 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="mt-auto h-10 bg-slate-100 rounded w-full" />
                      </div>
                   </div>
                 ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-red-100">
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                 </div>
                 <h3 className="text-lg font-bold text-red-900">{error}</h3>
                 <button onClick={() => fetchHotels()} className="mt-4 text-primary font-bold underline">Try again</button>
              </div>
            ) : sortedHotels.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300">hotel_class</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">No rooms available</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium">We couldn't find any properties matching your criteria. Try expanding your search area or removing filters.</p>
                <button onClick={clearFilters} className="mt-6 bg-slate-100 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-all">Clear Filters</button>
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

        {/* Mobile Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[1001] lg:hidden animate-in fade-in transition-all">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Filters</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your search</p>
                </div>
                <button onClick={() => setIsFilterModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <Filters />
              
              <div className="sticky bottom-0 bg-white pt-4 mt-8">
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Show {sortedHotels.length} Properties
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full h-full max-w-7xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-headline font-bold text-slate-900">Explore Stays on Map</h2>
                <p className="text-sm text-slate-500 font-medium">Showing {sortedHotels.length} properties in this area</p>
              </div>
              <button 
                onClick={() => setShowMap(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 relative p-4">
              <HotelMap 
                hotels={sortedHotels} 
                onLocationSelect={(lt, ln) => {
                  setLat(lt.toString());
                  setLng(ln.toString());
                  setCity("");
                }}
                selectedLocation={lat && lng ? [Number(lat), Number(lng)] : null}
              />
              
              {lat && lng && !city && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                  <button 
                    onClick={() => {
                      fetchHotels();
                      setShowMap(false);
                    }}
                    className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-2 animate-in slide-in-from-bottom-4"
                  >
                    <Search size={18} />
                    SEARCH THIS AREA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-primary" />
       </div>
    }>
      <HotelsContent />
    </Suspense>
  );
}
