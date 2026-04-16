"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HotelCard from "@/components/HotelCard";
import { searchHotels, Hotel } from "@/lib/api";
import {
  Search,
  SlidersHorizontal,
  X,
  PawPrint,
  Check,
  MapPin,
  Star,
  Wifi,
  Waves,
  Sparkles,
  Car,
  Dumbbell,
  UtensilsCrossed,
  Wine,
  Umbrella,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowUpDown,
  Building2,
  Clock,
  CreditCard,
} from "lucide-react";

const AMENITY_OPTIONS = [
  { label: "Wifi", icon: Wifi },
  { label: "Pool", icon: Waves },
  { label: "Spa", icon: Sparkles },
  { label: "Parking", icon: Car },
  { label: "Gym", icon: Dumbbell },
  { label: "Restaurant", icon: UtensilsCrossed },
  { label: "Bar", icon: Wine },
  { label: "Beach Access", icon: Umbrella },
];

const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Top Rated"];

const POPULAR_CITIES = ["Mumbai", "Delhi", "Goa", "Jaipur", "Bangalore", "Kerala"];

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isPetAllowed, setIsPetAllowed] = useState(false);
  const [isEarlyCheckIn, setIsEarlyCheckIn] = useState(false);
  const [isLateCheckIn, setIsLateCheckIn] = useState(false);
  const [isLateCheckOut, setIsLateCheckOut] = useState(false);
  const [isPayAtHotel, setIsPayAtHotel] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("Recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const [ratingCollapsed, setRatingCollapsed] = useState(false);
  const [amenitiesCollapsed, setAmenitiesCollapsed] = useState(false);

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
        is_early_check_in_available: isEarlyCheckIn || undefined,
        is_late_check_in_available: isLateCheckIn || undefined,
        is_late_check_out_available: isLateCheckOut || undefined,
        is_pay_at_hotel_available: isPayAtHotel || undefined,
      });
      setHotels(res.hotels);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }, [city, q, minPrice, maxPrice, minRating, selectedAmenities, isPetAllowed, isEarlyCheckIn, isLateCheckIn, isLateCheckOut, isPayAtHotel]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );

  const clearFilters = () => {
    setCity("");
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSelectedAmenities([]);
    setIsPetAllowed(false);
    setIsEarlyCheckIn(false);
    setIsLateCheckIn(false);
    setIsLateCheckOut(false);
    setIsPayAtHotel(false);
  };

  const activeFilterCount = [
    minPrice,
    maxPrice,
    minRating,
    ...selectedAmenities,
    isPetAllowed ? "pet" : "",
    isEarlyCheckIn ? "ec_in" : "",
    isLateCheckIn ? "lc_in" : "",
    isLateCheckOut ? "lc_out" : "",
    isPayAtHotel ? "pay" : "",
  ].filter(Boolean).length;

  const ratingOptions = [
    { label: "Wonderful", sub: "9+", value: "4.5" },
    { label: "Very Good", sub: "8+", value: "4" },
    { label: "Good", sub: "7+", value: "3.5" },
    { label: "Pleasant", sub: "6+", value: "3" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        backgroundColor: "#f7f7f8",
        color: "#1a1a2e",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        .tx-orange { color: #FF6B35; }
        .tx-bg-orange { background-color: #FF6B35; }
        .tx-border-orange { border-color: #FF6B35; }

        .hero-search {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
        }

        .search-bar {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        }

        .filter-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .hotel-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 16px;
          height: 220px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          border: 1.5px solid #e0e0e0;
          background: white;
          color: #555;
        }

        .pill-tag:hover, .pill-tag.active {
          border-color: #FF6B35;
          color: #FF6B35;
          background: #fff5f0;
        }

        .city-chip {
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .city-chip:hover {
          background: rgba(255,107,53,0.8);
          border-color: transparent;
        }

        .sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          background: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
          position: relative;
        }

        .sort-btn:hover { border-color: #FF6B35; color: #FF6B35; }

        .sort-dropdown {
          position: absolute;
          top: 110%;
          right: 0;
          background: white;
          border-radius: 12px;
          border: 1px solid #ebebeb;
          box-shadow: 0 12px 40px rgba(0,0,0,0.14);
          min-width: 200px;
          z-index: 100;
          overflow: hidden;
        }

        .sort-item {
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
          color: #333;
        }

        .sort-item:hover { background: #fff5f0; color: #FF6B35; }
        .sort-item.active { color: #FF6B35; background: #fff5f0; font-weight: 700; }

        .filter-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 4px 0;
          user-select: none;
        }

        .filter-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a2e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .price-input {
          width: 100%;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
          outline: none;
          transition: border-color 0.2s;
          background: #fafafa;
        }

        .price-input:focus { border-color: #FF6B35; background: white; }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          cursor: pointer;
        }

        .rating-badge {
          min-width: 38px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          background: #e8f5e9;
          color: #2e7d32;
        }

        .amenity-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 0;
          cursor: pointer;
        }

        .amenity-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .amenity-check.checked {
          background: #FF6B35;
          border-color: #FF6B35;
        }

        .pet-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: #fff5f0;
          border-radius: 12px;
          border: 1.5px solid #ffe0d0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pet-toggle:hover { border-color: #FF6B35; }

        .toggle-track {
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: #ddd;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .toggle-track.on { background: #FF6B35; }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-thumb.on { transform: translateX(20px); }

        .results-header {
          font-family: 'Playfair Display', serif;
        }

        .no-results-card {
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 20px;
          border: 2px dashed #ebebeb;
        }

        .orange-btn {
          background: #FF6B35;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(255,107,53,0.35);
        }

        .orange-btn:hover {
          background: #e55a25;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255,107,53,0.45);
        }

        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1.5px solid;
        }

        .filter-toggle-btn.active {
          background: #FF6B35;
          border-color: #FF6B35;
          color: white;
          box-shadow: 0 4px 14px rgba(255,107,53,0.3);
        }

        .filter-toggle-btn.inactive {
          background: white;
          border-color: #ddd;
          color: #444;
        }

        .filter-toggle-btn.inactive:hover {
          border-color: #FF6B35;
          color: #FF6B35;
        }

        .search-input {
          border: none;
          outline: none;
          font-size: 15px;
          font-weight: 500;
          background: transparent;
          width: 100%;
          color: #1a1a2e;
        }

        .search-input::placeholder { color: #aaa; }

        .search-divider {
          width: 1px;
          height: 36px;
          background: #ebebeb;
        }

        .travelx-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .travelx-logo span { color: #FF6B35; }

        .active-filter-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          background: white;
          color: #FF6B35;
          font-size: 11px;
          font-weight: 800;
          padding: 0 6px;
        }
      `}</style>

      <Navbar />

      {/* Hero Search Strip */}
      <div className="hero-search">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 32px" }}>
          {/* Brand */}
          <div className="travelx-logo" style={{ color: "white", marginBottom: 24 }}>
            Travel<span>X</span>
            <span style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, opacity: 0.6, marginLeft: 12 }}>
              Hotels & Stays
            </span>
          </div>

          {/* Main Search Bar */}
          <div className="search-bar" style={{ display: "flex", alignItems: "center", padding: "8px 8px 8px 20px", gap: 0 }}>
            <MapPin size={18} color="#FF6B35" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="City, destination or hotel name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="search-input"
              style={{ paddingLeft: 12, paddingRight: 12 }}
            />
            <div className="search-divider" />
            <Building2 size={18} color="#aaa" style={{ flexShrink: 0, marginLeft: 16 }} />
            <input
              type="text"
              placeholder="Property name"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="search-input"
              style={{ paddingLeft: 12, paddingRight: 12 }}
            />
            <button className="orange-btn" style={{ borderRadius: 10, padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, fontSize: 14 }}>
              <Search size={16} /> Search Hotels
            </button>
          </div>

          {/* Popular Cities */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}>Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                className="city-chip"
                onClick={() => setCity(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Zone */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={`filter-toggle-btn ${showFilters ? "active" : "inactive"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={15} />
              {showFilters ? "Hide Filters" : "Filters"}
              {activeFilterCount > 0 && !showFilters && (
                <span style={{ background: "#FF6B35", color: "white", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter pills */}
            {selectedAmenities.map((a) => (
              <button key={a} className="pill-tag active" onClick={() => toggleAmenity(a)}>
                {a} <X size={12} />
              </button>
            ))}
            {isPetAllowed && (
              <button className="pill-tag active" onClick={() => setIsPetAllowed(false)}>
                <PawPrint size={13} /> Pet Friendly <X size={12} />
              </button>
            )}
            {isEarlyCheckIn && (
              <button className="pill-tag active" onClick={() => setIsEarlyCheckIn(false)}>
                Early Check-in <X size={12} />
              </button>
            )}
            {isLateCheckIn && (
              <button className="pill-tag active" onClick={() => setIsLateCheckIn(false)}>
                Late Check-in <X size={12} />
              </button>
            )}
            {isLateCheckOut && (
              <button className="pill-tag active" onClick={() => setIsLateCheckOut(false)}>
                Late Check-out <X size={12} />
              </button>
            )}
            {isPayAtHotel && (
              <button className="pill-tag active" onClick={() => setIsPayAtHotel(false)}>
                Pay at Hotel <X size={12} />
              </button>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ fontSize: 13, color: "#FF6B35", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>
                Clear all
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 14, color: "#888", fontWeight: 500 }}>
              {loading ? "Searching..." : `${hotels.length} properties found`}
            </span>
            <div style={{ position: "relative" }}>
              <button className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                <ArrowUpDown size={14} /> {sortBy} <ChevronDown size={14} />
              </button>
              {showSortMenu && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map((s) => (
                    <div
                      key={s}
                      className={`sort-item ${sortBy === s ? "active" : ""}`}
                      onClick={() => { setSortBy(s); setShowSortMenu(false); }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Sidebar Filters */}
          {showFilters && (
            <aside style={{ width: 280, flexShrink: 0 }}>
              <div className="filter-card" style={{ padding: 24 }}>

                {/* Price Range */}
                <div style={{ marginBottom: 28 }}>
                  <div className="filter-section-header" onClick={() => setPriceCollapsed(!priceCollapsed)}>
                    <span className="filter-section-title">Price per night</span>
                    {priceCollapsed ? <ChevronDown size={16} color="#888" /> : <ChevronUp size={16} color="#888" />}
                  </div>
                  {!priceCollapsed && (
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Min ₹</label>
                        <input
                          type="number"
                          className="price-input"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Max ₹</label>
                        <input
                          type="number"
                          className="price-input"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Any"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "#f0f0f0", marginBottom: 24 }} />

                {/* Guest Rating */}
                <div style={{ marginBottom: 28 }}>
                  <div className="filter-section-header" onClick={() => setRatingCollapsed(!ratingCollapsed)}>
                    <span className="filter-section-title">Guest Rating</span>
                    {ratingCollapsed ? <ChevronDown size={16} color="#888" /> : <ChevronUp size={16} color="#888" />}
                  </div>
                  {!ratingCollapsed && (
                    <div style={{ marginTop: 14 }}>
                      <div
                        className="rating-row"
                        onClick={() => setMinRating("")}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${minRating === "" ? "#FF6B35" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {minRating === "" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF6B35" }} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#444" }}>Any rating</span>
                      </div>
                      {ratingOptions.map((opt) => (
                        <div key={opt.value} className="rating-row" onClick={() => setMinRating(opt.value)}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${minRating === opt.value ? "#FF6B35" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {minRating === opt.value && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF6B35" }} />}
                          </div>
                          <div className="rating-badge">{opt.sub}</div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#444" }}>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "#f0f0f0", marginBottom: 24 }} />

                {/* Amenities */}
                <div style={{ marginBottom: 28 }}>
                  <div className="filter-section-header" onClick={() => setAmenitiesCollapsed(!amenitiesCollapsed)}>
                    <span className="filter-section-title">Amenities</span>
                    {amenitiesCollapsed ? <ChevronDown size={16} color="#888" /> : <ChevronUp size={16} color="#888" />}
                  </div>
                  {!amenitiesCollapsed && (
                    <div style={{ marginTop: 14 }}>
                      {AMENITY_OPTIONS.map(({ label, icon: Icon }) => (
                        <div key={label} className="amenity-row" onClick={() => toggleAmenity(label)}>
                          <div className={`amenity-check ${selectedAmenities.includes(label) ? "checked" : ""}`}>
                            {selectedAmenities.includes(label) && <Check size={12} color="white" />}
                          </div>
                          <Icon size={15} color={selectedAmenities.includes(label) ? "#FF6B35" : "#888"} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: selectedAmenities.includes(label) ? "#FF6B35" : "#444" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "#f0f0f0", marginBottom: 20 }} />

                {/* Pet Friendly */}
                <div style={{ marginBottom: 12 }}>
                  <div className="pet-toggle" onClick={() => setIsPetAllowed(!isPetAllowed)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PawPrint size={18} color="#FF6B35" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Pet Friendly</div>
                      </div>
                    </div>
                    <div className={`toggle-track ${isPetAllowed ? "on" : ""}`}>
                      <div className={`toggle-thumb ${isPetAllowed ? "on" : ""}`} />
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div style={{ marginBottom: 12 }}>
                  <div className="pet-toggle" onClick={() => setIsEarlyCheckIn(!isEarlyCheckIn)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={18} color="#FF6B35" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Early Check-in</div>
                      </div>
                    </div>
                    <div className={`toggle-track ${isEarlyCheckIn ? "on" : ""}`}>
                      <div className={`toggle-thumb ${isEarlyCheckIn ? "on" : ""}`} />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <div className="pet-toggle" onClick={() => setIsLateCheckIn(!isLateCheckIn)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={18} color="#FF6B35" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Late Check-in</div>
                      </div>
                    </div>
                    <div className={`toggle-track ${isLateCheckIn ? "on" : ""}`}>
                      <div className={`toggle-thumb ${isLateCheckIn ? "on" : ""}`} />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <div className="pet-toggle" onClick={() => setIsLateCheckOut(!isLateCheckOut)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Clock size={18} color="#FF6B35" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Late Check-out</div>
                      </div>
                    </div>
                    <div className={`toggle-track ${isLateCheckOut ? "on" : ""}`}>
                      <div className={`toggle-thumb ${isLateCheckOut ? "on" : ""}`} />
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#f0f0f0", marginBottom: 20 }} />

                {/* Payments */}
                <div style={{ marginBottom: 12 }}>
                  <div className="pet-toggle" onClick={() => setIsPayAtHotel(!isPayAtHotel)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CreditCard size={18} color="#FF6B35" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>Pay at Hotel</div>
                      </div>
                    </div>
                    <div className={`toggle-track ${isPayAtHotel ? "on" : ""}`}>
                      <div className={`toggle-thumb ${isPayAtHotel ? "on" : ""}`} />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Hotel Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Results heading */}
            <div style={{ marginBottom: 20 }}>
              <h1 className="results-header" style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
                {loading ? "Finding the best stays..." : city ? `Hotels in ${city}` : "All Properties"}
              </h1>
              {!loading && hotels.length > 0 && (
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#888" }}>
                  Showing <strong style={{ color: "#1a1a2e" }}>{hotels.length}</strong> properties {city ? `in ${city}` : ""}
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="hotel-skeleton" />
                ))
              ) : error ? (
                <div className="no-results-card">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
                    Something went wrong
                  </h3>
                  <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>{error}</p>
                  <button className="orange-btn" onClick={fetchHotels}>Try Again</button>
                </div>
              ) : hotels.length === 0 ? (
                <div className="no-results-card">
                  <Building2 size={56} color="#e0e0e0" style={{ margin: "0 auto 20px" }} />
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, fontFamily: "'Playfair Display', serif", color: "#1a1a2e" }}>
                    No properties found
                  </h3>
                  <p style={{ color: "#aaa", marginBottom: 28, fontSize: 14, maxWidth: 320, margin: "0 auto 28px" }}>
                    We couldn't find any hotels matching your criteria. Try adjusting your filters or search a different city.
                  </p>
                  <button className="orange-btn" onClick={clearFilters}>Clear All Filters</button>
                </div>
              ) : (
                hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}