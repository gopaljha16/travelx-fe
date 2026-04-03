"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HotelCard from "@/components/HotelCard";
import { searchHotels, Hotel } from "@/lib/api";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, PawPrint, Check, Loader2, Hotel as HotelIcon } from "lucide-react";

const AMENITY_OPTIONS = ["Wifi", "Pool", "Spa", "Parking", "Gym", "Restaurant", "Bar", "Beach Access"];

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isPetAllowed, setIsPetAllowed] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ price: true, rating: true, amenities: true });

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await searchHotels({
        city: city || undefined,
        q: q || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        amenities: selectedAmenities.length ? selectedAmenities : undefined,
        is_pet_allowed: isPetAllowed || undefined,
      });
      setHotels(res.hotels);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [city, q, minPrice, maxPrice, minRating, selectedAmenities, isPetAllowed]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const toggleSection = (s: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [s]: !prev[s] }));

  const clearFilters = () => {
    setCity(""); setQ(""); setMinPrice(""); setMaxPrice(""); setMinRating(""); setSelectedAmenities([]); setIsPetAllowed(false);
  };

  const ratingOptions = [
    { label: "9+ Wonderful", value: "4.5" },
    { label: "8+ Very Good", value: "4" },
    { label: "7+ Good", value: "3.5" },
    { label: "6+ Pleasant", value: "3" },
    { label: "All", value: "" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Navbar />

      {/* Editorial Search Experience */}
      <div className="bg-[var(--card)] border-b border-[var(--card-border)] sticky top-20 z-30 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-20 group-focus-within:opacity-100 transition-opacity">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Where to stay?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-[var(--background)] border-2 border-transparent focus:border-[#ec6a2a]/20 rounded-3xl text-sm font-black uppercase tracking-widest focus:outline-none transition-all placeholder:text-[var(--foreground)] placeholder:opacity-20 text-[var(--foreground)]"
              />
            </div>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--foreground)] opacity-20 group-focus-within:opacity-100 transition-opacity">
                <HotelIcon size={18} />
              </span>
              <input
                type="text"
                placeholder="Property name..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-[var(--background)] border-2 border-transparent focus:border-[#ec6a2a]/20 rounded-3xl text-sm font-black uppercase tracking-widest focus:outline-none transition-all placeholder:text-[var(--foreground)] placeholder:opacity-20 text-[var(--foreground)]"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-8 py-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all border-2 ${showFilters ? "bg-[#ec6a2a] border-[#ec6a2a] text-white shadow-xl shadow-[#ec6a2a]/20" : "bg-transparent border-[var(--card-border)] text-[var(--foreground)] hover:border-[#ec6a2a] hover:text-[#ec6a2a]"}`}
          >
            <SlidersHorizontal size={16} /> {showFilters ? "Close Filters" : "Filter Search"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">
        {/* Editorial Sidebar */}
        {showFilters && (
          <aside className="w-full lg:w-80 flex-shrink-0 animate-fade-in">
            <div className="sticky top-64">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase">Refine.</h3>
                <button onClick={clearFilters} className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-widest hover:opacity-70 flex items-center gap-2 transition-all">
                  <X size={14} /> Reset all
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-12">
                <p className="text-[10px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest mb-6">Price Range</p>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[8px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest">Min (₹)</label>
                    <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-[var(--card)] border-2 border-[var(--card-border)] focus:border-[#ec6a2a] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none transition-all" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[8px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest">Max (₹)</label>
                    <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-[var(--card)] border-2 border-[var(--card-border)] focus:border-[#ec6a2a] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-12">
                <p className="text-[10px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest mb-6">Guest Rating</p>
                <div className="space-y-4">
                  {ratingOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="radio" name="rating" checked={minRating === opt.value} onChange={() => setMinRating(opt.value)}
                          className="peer appearance-none w-5 h-5 border-2 border-[var(--card-border)] rounded-full checked:border-[#ec6a2a] transition-all" />
                        <div className="absolute w-2.5 h-2.5 bg-[#ec6a2a] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm font-bold text-[var(--foreground)] opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tight">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities Filter */}
              <div className="mb-12">
                <p className="text-[10px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest mb-6">Amenities</p>
                <div className="grid grid-cols-1 gap-4">
                  {AMENITY_OPTIONS.map((a) => (
                    <label key={a} className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)}
                          className="peer appearance-none w-5 h-5 border-2 border-[var(--card-border)] rounded-lg checked:bg-[#ec6a2a] checked:border-[#ec6a2a] transition-all" />
                        <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm font-bold text-[var(--foreground)] opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tight">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pet Friendly Toggle */}
              <label className="flex items-center justify-between cursor-pointer group bg-[var(--card)] p-5 rounded-[32px] border-2 border-[var(--card-border)] hover:border-[#ec6a2a] transition-all">
                <span className="text-[10px] font-black text-[#ec6a2a] flex items-center gap-3 uppercase tracking-widest"><PawPrint size={16} /> Pet Friendly Stays</span>
                <div className="relative">
                  <input type="checkbox" checked={isPetAllowed} onChange={(e) => setIsPetAllowed(e.target.checked)} className="peer sr-only" />
                  <div className="w-12 h-7 bg-[var(--background)] rounded-full peer peer-checked:bg-[#ec6a2a] transition-all after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                </div>
              </label>
            </div>
          </aside>
        )}

        {/* Results Deck */}
        <div className="flex-1">
          <div className="flex flex-col mb-16">
             <span className="text-[#ec6a2a] font-bold text-xs uppercase tracking-widest mb-4">Curated Stays</span>
             <h2 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">
              {loading ? "Searching..." : city ? `Discover ${city}.` : "The Collection."}
            </h2>
          </div>

          <div className="space-y-20">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--card)] rounded-[48px] border-2 border-[var(--card-border)] h-64 animate-pulse" />
              ))
            ) : hotels.length === 0 ? (
              <div className="text-center py-32 bg-[var(--card)] rounded-[56px] border-2 border-dashed border-[var(--card-border)]">
                <HotelIcon size={64} className="text-[var(--foreground)] opacity-10 mx-auto mb-8" />
                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 uppercase italic">Zero matches.</h3>
                <p className="text-[var(--foreground)] opacity-40 max-w-xs mx-auto font-medium text-sm">Please refine your search or explore our popular Indian destinations.</p>
              </div>
            ) : (
              hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
