"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import HotelCard from "@/components/HotelCard";
import { Hotel, searchHotels } from "@/lib/api";
import { Loader2, MapPin, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

const AMENITIES = ["Swimming Pool", "Free WiFi", "Breakfast Included", "Spa", "Parking"];

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
      });
      setHotels(response.hotels);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [city, query, lat, lng, radiusKm, minPrice, maxPrice, minRating, selectedAmenities]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    // Automatically trigger location reading if no location params are present
    if (!searchParams.get("city") && !searchParams.get("lat") && !searchParams.get("lng")) {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude.toString());
            setLng(position.coords.longitude.toString());
            setIsLocating(false);
          },
          (err) => {
            console.error("Location error:", err);
            setIsLocating(false);
          }
        );
      }
    }
  }, [searchParams]);

  const sortedHotels = useMemo(() => {
    const next = [...hotels];
    if (sortBy === "price_low") {
      next.sort((a, b) => a.price_per_night - b.price_per_night);
    } else if (sortBy === "price_high") {
      next.sort((a, b) => b.price_per_night - a.price_per_night);
    } else if (sortBy === "rating") {
      next.sort((a, b) => b.rating - a.rating);
    }
    return next;
  }, [hotels, sortBy]);

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
              { lat && !city && (
                <button type="button" onClick={() => { setLat(""); setLng(""); setCity(""); }} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
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
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">RESET ALL</button>
              </div>

              {/* Price Per Night */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Price Per Night <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                
                <div className="space-y-3 mt-4">
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(0, 2500)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 0 && maxPrice === 2500 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 0 && maxPrice === 2500 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 0 - ₹ 2500</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(2500, 5500)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 2500 && maxPrice === 5500 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 2500 && maxPrice === 5500 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 2500 - ₹ 5500</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(5500, undefined)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 5500 && maxPrice === undefined ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 5500 && maxPrice === undefined && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 5500+</span>
                  </label>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Star Rating <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="flex gap-2">
                  <button onClick={() => setMinRating(minRating === 3 ? undefined : 3)} className={`flex-1 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors ${minRating === 3 ? 'bg-primary border-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>3★</button>
                  <button onClick={() => setMinRating(minRating === 4 ? undefined : 4)} className={`flex-1 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors ${minRating === 4 ? 'bg-primary border-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>4★</button>
                  <button onClick={() => setMinRating(minRating === 5 ? undefined : 5)} className={`flex-1 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors ${minRating === 5 ? 'bg-primary border-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>5★</button>
                </div>
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
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedPropertyType("Hotels")}>
                    <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedPropertyType === "Hotels" ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                    <span className="text-sm font-medium text-slate-600 flex-1">Hotels</span>
                    <span className="text-xs text-slate-400">({hotels.length})</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedPropertyType("Resorts")}>
                    <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedPropertyType === "Resorts" ? 'border-primary' : 'border-slate-200 group-hover:border-primary'}`}></div>
                    <span className="text-sm font-medium text-slate-600 flex-1">Resorts</span>
                     {/* Just keeping aesthetic count for visual demo on non-hotel properties */}
                    <span className="text-xs text-slate-400">(0)</span>
                  </label>
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
