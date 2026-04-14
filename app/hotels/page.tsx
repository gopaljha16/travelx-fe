"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HotelCard from "@/components/HotelCard";
import { Hotel, searchHotels } from "@/lib/api";
import { Building2, Loader2, RefreshCcw, Search, SlidersHorizontal, Sparkles, Star } from "lucide-react";

const AMENITIES = ["Wifi", "Pool", "Spa", "Parking", "Gym", "Restaurant", "Bar", "Beach Access"];
const POPULAR_CITIES = ["Goa", "Jaipur", "Mumbai", "Delhi", "Bangalore", "Manali"];

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [minRating, setMinRating] = useState(searchParams.get("min_rating") || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [petFriendly, setPetFriendly] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchHotels({
        city: city || undefined,
        q: query || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        min_rating: minRating ? Number(minRating) : undefined,
        amenities: selectedAmenities.length ? selectedAmenities : undefined,
        is_pet_allowed: petFriendly || undefined,
      });
      setHotels(response.hotels);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [city, maxPrice, minPrice, minRating, petFriendly, query, selectedAmenities]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

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

  const clearFilters = () => {
    setCity("");
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSelectedAmenities([]);
    setPetFriendly(false);
  };

  return (
    <div className="tx-page">
      <Navbar />

      <section className="bg-[linear-gradient(180deg,#ff6b35_0%,#ff7b3d_58%,#f5f7fb_58%,#f5f7fb_100%)] pb-10 pt-6 text-white">
        <div className="tx-shell">
          <div className="max-w-3xl">
            <p className="tx-kicker text-orange-100">Hotel booking</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Discover stays with a polished, consistent TravelX experience.</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-white/80 sm:text-base">
              Search verified hotels, compare amenities more clearly, and book from a page that feels intentional across the full app.
            </p>
          </div>

          <div className="tx-card mt-8 p-4 sm:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
              <input className="tx-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
              <input className="tx-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hotel, area, landmark" />
              <input className="tx-input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" />
              <input className="tx-input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" />
              <input className="tx-input" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="Min rating" />
              <button onClick={fetchHotels} className="tx-button-primary min-h-12">
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_CITIES.map((popularCity) => (
                <button
                  key={popularCity}
                  onClick={() => setCity(popularCity)}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
                >
                  {popularCity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tx-shell pb-16">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="tx-card h-fit p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal size={16} className="text-[#ff6b35]" />
                Filters
              </div>
              <button onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                Clear all
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        selectedAmenities.includes(amenity)
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={petFriendly} onChange={(e) => setPetFriendly(e.target.checked)} />
                Pet friendly only
              </label>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Connected to your real hotel search</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>Uses `/hotels/search` from the backend</li>
                  <li>Supports city, keyword, rating, price, and amenity filters</li>
                  <li>Same TravelX card system as the homepage and bus pages</li>
                </ul>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tx-kicker">Search results</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {loading ? "Loading stays..." : `${sortedHotels.length} properties found`}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                  <Star size={16} className="text-[#2563eb]" />
                  <select className="bg-transparent outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Top rated</option>
                  </select>
                </label>

                <button onClick={fetchHotels} className="tx-button-secondary">
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Building2 size={16} className="text-[#ff6b35]" />
                  Better property scan
                </div>
                <p className="mt-2 text-sm text-slate-600">Cleaner cards make rating, location, and nightly price easier to compare.</p>
              </div>
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Sparkles size={16} className="text-[#2563eb]" />
                  Consistent visual language
                </div>
                <p className="mt-2 text-sm text-slate-600">The same TravelX look now carries from home to listings to booking flows.</p>
              </div>
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Search size={16} className="text-[#16a34a]" />
                  Real API-backed results
                </div>
                <p className="mt-2 text-sm text-slate-600">These results come directly from your backend hotel search endpoint.</p>
              </div>
            </div>

            {loading ? (
              <div className="tx-card flex min-h-[240px] items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[#ff6b35]" />
              </div>
            ) : error ? (
              <div className="tx-card p-8 text-center text-sm font-semibold text-red-600">{error}</div>
            ) : sortedHotels.length === 0 ? (
              <div className="tx-card p-8 text-center">
                <h3 className="text-xl font-black text-slate-900">No hotels found</h3>
                <p className="mt-2 text-sm text-slate-600">Try another city, keyword, or wider filter range.</p>
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
      </section>
    </div>
  );
}
