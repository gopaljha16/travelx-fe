"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BusCard from "@/components/BusCard";
import { searchBuses, Bus } from "@/lib/api";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeftRight,
  Calendar,
  MapPin,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Bus as BusIcon,
  Moon,
  Sun,
  Wind,
  Armchair,
} from "lucide-react";

const BUS_TYPES = [
  { label: "AC Sleeper", icon: Moon },
  { label: "Non-AC Sleeper", icon: Moon },
  { label: "AC Seater", icon: Armchair },
  { label: "Non-AC Seater", icon: Armchair },
];

const SORT_OPTIONS = ["Recommended", "Price: Low to High", "Price: High to Low", "Earliest Departure", "Latest Departure"];

const POPULAR_ROUTES = [
  { from: "Delhi", to: "Jaipur" },
  { from: "Mumbai", to: "Pune" },
  { from: "Bangalore", to: "Chennai" },
  { from: "Delhi", to: "Agra" },
];

export default function BusesPage() {
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");
  const [busType, setBusType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("Recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [priceCollapsed, setPriceCollapsed] = useState(false);
  const [typeCollapsed, setTypeCollapsed] = useState(false);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await searchBuses({
        from_city: fromCity || undefined,
        to_city: toCity || undefined,
        journey_date: journeyDate || undefined,
        bus_type: busType || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setBuses(res.buses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buses");
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, journeyDate, busType, minPrice, maxPrice]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const clearFilters = () => {
    setBusType("");
    setMinPrice("");
    setMaxPrice("");
  };

  const swapCities = () => {
    const tmp = fromCity;
    setFromCity(toCity);
    setToCity(tmp);
  };

  const activeFilterCount = [busType, minPrice, maxPrice].filter(Boolean).length;

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

        .hero-search-bus {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }

        .search-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.18);
          overflow: hidden;
        }

        .search-field {
          display: flex;
          flex-direction: column;
          padding: 16px 20px;
          flex: 1;
          cursor: text;
          min-width: 0;
        }

        .search-field-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #FF6B35;
          margin-bottom: 4px;
        }

        .search-field input {
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          background: transparent;
          width: 100%;
        }

        .search-field input::placeholder { color: #bbb; font-weight: 500; }

        .search-field input[type="date"] {
          cursor: pointer;
          color-scheme: light;
        }

        .search-divider-v {
          width: 1px;
          background: #f0f0f0;
          align-self: stretch;
          margin: 12px 0;
        }

        .swap-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff5f0;
          border: 2px solid #ffe0d0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          color: #FF6B35;
          position: absolute;
          right: -18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }

        .swap-btn:hover {
          background: #FF6B35;
          border-color: #FF6B35;
          color: white;
          transform: translateY(-50%) rotate(180deg);
        }

        .route-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .route-chip:hover {
          background: rgba(255,107,53,0.75);
          border-color: transparent;
        }

        .filter-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #ebebeb;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          padding: 24px;
        }

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

        .bus-type-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 0;
          cursor: pointer;
        }

        .bus-type-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.15s;
        }

        .bus-type-radio.checked {
          border-color: #FF6B35;
        }

        .bus-type-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FF6B35;
          transition: transform 0.15s;
        }

        .bus-type-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .badge-ac {
          background: #e3f2fd;
          color: #1565c0;
        }

        .badge-nonac {
          background: #fce4ec;
          color: #c62828;
        }

        .badge-sleeper {
          background: #f3e5f5;
          color: #6a1b9a;
        }

        .badge-seater {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .bus-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 16px;
          height: 120px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .orange-btn {
          background: #FF6B35;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px 32px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(255,107,53,0.35);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
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
          min-width: 210px;
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

        .results-header {
          font-family: 'Playfair Display', serif;
        }

        .travelx-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .travelx-logo span { color: #FF6B35; }

        .no-results-card {
          text-align: center;
          padding: 80px 40px;
          background: white;
          border-radius: 20px;
          border: 2px dashed #ebebeb;
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
          border: 1.5px solid #FF6B35;
          background: #fff5f0;
          color: #FF6B35;
        }

        .pill-tag:hover { opacity: 0.75; }
      `}</style>

      <Navbar />

      {/* Hero Search */}
      <div className="hero-search-bus">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 36px" }}>
          {/* Brand */}
          <div className="travelx-logo" style={{ color: "white", marginBottom: 28 }}>
            Travel<span>X</span>
            <span style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, opacity: 0.6, marginLeft: 12 }}>
              Bus Tickets
            </span>
          </div>

          {/* Search Card */}
          <div className="search-card">
            <div style={{ display: "flex", alignItems: "stretch" }}>
              {/* From */}
              <div className="search-field" style={{ position: "relative" }}>
                <div className="search-field-label">
                  <MapPin size={10} style={{ display: "inline", marginRight: 4 }} />From
                </div>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                />
                {fromCity && <span style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>City</span>}
                {/* Swap Button */}
                <button className="swap-btn" onClick={swapCities} title="Swap cities">
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              <div className="search-divider-v" style={{ marginLeft: 28 }} />

              {/* To */}
              <div className="search-field" style={{ paddingLeft: 32 }}>
                <div className="search-field-label">
                  <MapPin size={10} style={{ display: "inline", marginRight: 4 }} />To
                </div>
                <input
                  type="text"
                  placeholder="Destination city"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                />
              </div>

              <div className="search-divider-v" />

              {/* Date */}
              <div className="search-field">
                <div className="search-field-label">
                  <Calendar size={10} style={{ display: "inline", marginRight: 4 }} />Journey Date
                </div>
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                />
              </div>

              {/* Search Button */}
              <div style={{ display: "flex", alignItems: "center", padding: "10px 10px 10px 0" }}>
                <button className="orange-btn" onClick={fetchBuses} style={{ borderRadius: 14, padding: "16px 32px", fontSize: 15 }}>
                  <Search size={17} /> Search Buses
                </button>
              </div>
            </div>
          </div>

          {/* Popular Routes */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }}>Popular routes:</span>
            {POPULAR_ROUTES.map((r) => (
              <button
                key={`${r.from}-${r.to}`}
                className="route-chip"
                onClick={() => { setFromCity(r.from); setToCity(r.to); }}
              >
                {r.from} <ArrowRight size={12} /> {r.to}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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

            {busType && (
              <button className="pill-tag" onClick={() => setBusType("")}>
                {busType} <X size={12} />
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
              {loading ? "Searching..." : `${buses.length} buses found`}
            </span>
            <div style={{ position: "relative" }}>
              <button className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
                <ArrowUpDown size={14} /> {sortBy} <ChevronDown size={14} />
              </button>
              {showSortMenu && (
                <div className="sort-dropdown">
                  {SORT_OPTIONS.map((s) => (
                    <div key={s} className={`sort-item ${sortBy === s ? "active" : ""}`} onClick={() => { setSortBy(s); setShowSortMenu(false); }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Sidebar */}
          {showFilters && (
            <aside style={{ width: 268, flexShrink: 0 }}>
              <div className="filter-card">

                {/* Price Range */}
                <div style={{ marginBottom: 24 }}>
                  <div className="filter-section-header" onClick={() => setPriceCollapsed(!priceCollapsed)}>
                    <span className="filter-section-title">Price per seat</span>
                    <ChevronDown size={16} color="#888" style={{ transform: priceCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
                  </div>
                  {!priceCollapsed && (
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Min ₹</label>
                        <input type="number" className="price-input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Max ₹</label>
                        <input type="number" className="price-input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ height: 1, background: "#f0f0f0", marginBottom: 20 }} />

                {/* Bus Type */}
                <div>
                  <div className="filter-section-header" onClick={() => setTypeCollapsed(!typeCollapsed)}>
                    <span className="filter-section-title">Bus Type</span>
                    <ChevronDown size={16} color="#888" style={{ transform: typeCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
                  </div>
                  {!typeCollapsed && (
                    <div style={{ marginTop: 14 }}>
                      {/* Any option */}
                      <div className="bus-type-row" onClick={() => setBusType("")}>
                        <div className={`bus-type-radio ${busType === "" ? "checked" : ""}`}>
                          {busType === "" && <div className="bus-type-dot" />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#444" }}>Any Type</span>
                      </div>

                      {BUS_TYPES.map(({ label }) => {
                        const isAC = label.startsWith("AC");
                        const isSleeper = label.includes("Sleeper");
                        return (
                          <div key={label} className="bus-type-row" onClick={() => setBusType(label)}>
                            <div className={`bus-type-radio ${busType === label ? "checked" : ""}`}>
                              {busType === label && <div className="bus-type-dot" />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: busType === label ? "#FF6B35" : "#444", flex: 1 }}>{label}</span>
                            <span className={`bus-type-badge ${isAC ? "badge-ac" : "badge-nonac"}`}>
                              {isAC ? "AC" : "Non-AC"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 className="results-header" style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
                {loading
                  ? "Finding buses..."
                  : fromCity && toCity
                    ? `${fromCity} → ${toCity}`
                    : "All Routes"}
              </h1>
              {journeyDate && !loading && (
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#888" }}>
                  <Calendar size={13} style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                  {new Date(journeyDate).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  {buses.length > 0 && <> &middot; <strong style={{ color: "#1a1a2e" }}>{buses.length}</strong> buses available</>}
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bus-skeleton" />
                ))
              ) : error ? (
                <div className="no-results-card">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Something went wrong</h3>
                  <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>{error}</p>
                  <button className="orange-btn" onClick={fetchBuses} style={{ margin: "0 auto" }}>Try Again</button>
                </div>
              ) : buses.length === 0 ? (
                <div className="no-results-card">
                  <BusIcon size={56} color="#e0e0e0" style={{ margin: "0 auto 20px" }} />
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, fontFamily: "'Playfair Display', serif", color: "#1a1a2e" }}>
                    No buses found
                  </h3>
                  <p style={{ color: "#aaa", marginBottom: 28, fontSize: 14, maxWidth: 320, margin: "0 auto 28px" }}>
                    No routes match your search. Try a different date or explore our popular routes above.
                  </p>
                  <button className="orange-btn" onClick={clearFilters} style={{ margin: "0 auto" }}>Clear Filters</button>
                </div>
              ) : (
                buses.map((bus) => <BusCard key={bus.id} bus={bus} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}