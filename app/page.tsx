"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { searchHotels, searchBuses, Hotel, Bus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search Form State
  const [activeTab, setActiveTab] = useState<"hotels" | "flights" | "trains" | "buses">("hotels");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState("");
  const [radius, setRadius] = useState("5");
  const [gridHeading, setGridHeading] = useState("Hotels Near You");
  const [gridSubHeading, setGridSubHeading] = useState("Discover curated stays within your immediate radius.");

  const fetchAllHotels = async () => {
    try {
      const { hotels: topHotels } = await searchHotels({ min_rating: 4 });
      setHotels(topHotels.slice(0, 3));
      setGridHeading("Top Rated Hotels");
      setGridSubHeading("Handpicked exceptional stays for your next journey.");
    } catch (err) {
      console.error("Failed to fetch all hotels:", err);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      fetchAllHotels();
      return;
    }
    
    // Set a visual indicator in the input
    setFromCity("Detecting location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse Geocode to get City Name
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Current Location";
          setFromCity(city);
        } catch (err) {
          setFromCity("Current Location");
        }

        try {
          const { hotels: localHotels } = await searchHotels({ 
            lat: latitude, 
            lng: longitude, 
            radius_km: 5 
          });
          
          if (localHotels.length > 0) {
            setHotels(localHotels.slice(0, 3));
            setGridHeading("Hotels Near You");
            setGridSubHeading("Discover curated stays within your immediate radius.");
          } else {
            // Fallback if no hotels in radius
            fetchAllHotels();
          }
        } catch (err) {
          fetchAllHotels();
        }
      },
      () => fetchAllHotels()
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { buses: busData } = await searchBuses({});
        setBuses(busData.slice(0, 3));
        // Trigger location detection for hotels
        detectLocation();
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (activeTab === "hotels") {
      if (fromCity) params.set("city", fromCity);
      if (radius) params.set("radius_km", radius);
      router.push(`/hotels?${params.toString()}`);
    } else {
      if (fromCity) params.set("from_city", fromCity);
      if (toCity) params.set("to_city", toCity);
      if (date) params.set("journey_date", date);
      router.push(`/${activeTab}?${params.toString()}`);
    }
  };

  const getDayLabel = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="pb-24 md:pb-0">
        {/* ── HERO SECTION ───────────────────────────────────── */}
        <section className="relative min-h-[600px] flex items-center justify-center pt-24 px-6 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNDZpn03xQ2TxuNi_4B8qSb1NTy03Xd0J7Z_q6MArN0Z_XwC0qi4ePCeBuHTGD4xCd_15bbvJbHGwrF2hQZsCDvLSXyDIvIarU68eST5ArXLrTGd99SNNNosG_1xzjEPPAUqO5yvOGra9BtviqeMdi_y82VR3EHI-027bdRGwHFE_CW8BlwP4CJ3XFjw-5iujwWx04AZ5Hrf1EMpOhwXKzZSeF3Gu2hUMcyVk61yunENyn712e7vrx4d-Ig1SXjw1OU9nlZ6pL4u4"
              alt="Luxury Pool"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background"></div>
          </div>

          {/* Search Card Container */}
          <div className="relative z-10 w-full max-w-5xl mt-4">
            <div className="text-center mb-10">
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight mb-4">
                Discover Your Next <span className="text-primary italic">Vibe</span>
              </h1>
              <p className="text-on-surface-variant text-lg font-medium max-w-2xl mx-auto">
                Curated stays and seamless journeys tailored to your rhythm.
              </p>
            </div>

            {/* Central Search Card */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-2 md:p-4 border border-outline-variant/10">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-surface-container-low w-fit rounded-2xl mx-auto md:mx-0 overflow-x-auto no-scrollbar max-w-full">
                <button 
                  onClick={() => setActiveTab("hotels")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shrink-0 ${
                    activeTab === "hotels" 
                      ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" 
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined">hotel</span>
                  <span className="text-sm">Hotels</span>
                </button>
                <button 
                  onClick={() => setActiveTab("flights")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shrink-0 ${
                    activeTab === "flights" 
                      ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" 
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined">flight</span>
                  <span className="text-sm">Flights</span>
                </button>
                <button 
                  onClick={() => setActiveTab("trains")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shrink-0 ${
                    activeTab === "trains" 
                      ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" 
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined">train</span>
                  <span className="text-sm">Trains</span>
                </button>
                <button 
                  onClick={() => setActiveTab("buses")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shrink-0 ${
                    activeTab === "buses" 
                      ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" 
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined">directions_bus</span>
                  <span className="text-sm">Bus</span>
                </button>
              </div>

              {/* Search Inputs Grid */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-2">
                <div className={`${activeTab === "hotels" ? "md:col-span-4" : "md:col-span-3"} space-y-2 text-left`}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">
                    {activeTab === "hotels" ? "Location" : "From"}
                  </label>
                  <div className="relative group">
                    <input 
                      type="text"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      placeholder={activeTab === "hotels" ? "Where to?" : "Leaving from"}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-32 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                      {activeTab === "flights" ? "flight_takeoff" : activeTab === "trains" ? "train" : "location_on"}
                    </span>
                    <button 
                      type="button"
                      onClick={detectLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed-dim/30 hover:bg-primary-fixed-dim/50 text-on-primary-fixed-variant transition-all z-10"
                    >
                      <span className="material-symbols-outlined text-sm">my_location</span>
                      <span className="text-[10px] font-bold">NEAR ME</span>
                    </button>
                  </div>
                </div>

                {activeTab !== "hotels" && (
                  <div className="md:col-span-3 space-y-2 text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">To</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        placeholder="Going to"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                        {activeTab === "flights" ? "flight_land" : "location_on"}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "hotels" ? (
                  <div className="md:col-span-3 space-y-2 text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Radius</label>
                    <div className="relative">
                      <div className="relative flex items-center">
                        <select 
                          value={radius}
                          onChange={(e) => setRadius(e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                        >
                          <option value="5">5 km radius</option>
                          <option value="10">10 km radius</option>
                          <option value="25">25 km radius</option>
                          <option value="50">50 km radius</option>
                        </select>
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">distance</span>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-3 space-y-2 text-left">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Date</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                    </div>
                  </div>
                )}

                <div className={`${activeTab === "hotels" ? "md:col-span-3" : "md:col-span-1"} space-y-2 text-left`}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">
                    {activeTab === "hotels" ? "Check-in" : ""}
                  </label>
                  {activeTab === "hotels" ? (
                    <div className="relative">
                      <input 
                        type="date"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface text-sm"
                      />
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                    </div>
                  ) : <div className="h-10 md:h-0"></div>}
                </div>

                <div className={`${activeTab === "hotels" ? "md:col-span-2" : "md:col-span-2"}`}>
                  <button 
                    type="submit"
                    className="voyage-button w-full h-[60px] rounded-2xl text-on-primary font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">search</span>
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ── HOTELS NEAR YOU (BENTO GRID) ───────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">{gridHeading}</h2>
              <p className="text-on-surface-variant mt-2">{gridSubHeading}</p>
            </div>
            <Link href="/hotels" className="flex items-center gap-2 text-primary font-bold group">
              View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Large Featured Card (First Hotel) */}
              {hotels[0] && (
                <Link href={`/hotels/${hotels[0].id}`} className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <Image 
                      src={hotels[0].images[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuDpApN_CBxKIuRhFa1C0f0UcafUThAXwXNXXdWXPAr_QNM3VLdtQx2tChpEWyinf18forsdgLjKDSeqhRwANdXmrv4iZCEf91kfVwngv0Wh3pmntPlV8_XH4ngwItxcd0_w42x9NWBguTa-k0IKfk3f3h-k9idUW45ZZU8PBPn_vEK6sytHsHgeAg4BR_TxB8q2RjBmiOKsCzCmlR9MOPsZsEcq8y1JDImCM71i62DBxOTdHji4RzWJvSM30sNnyHn8tIsP14QjTNg"}
                      alt={hotels[0].name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                  </div>
                  <div className="p-8 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {hotels[0].rating} (2.4k reviews)
                        </span>
                        <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold">1.2 km away</span>
                      </div>
                      <h3 className="font-headline text-2xl font-bold text-on-surface">{hotels[0].name}</h3>
                      <p className="text-on-surface-variant flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-base">location_on</span> {hotels[0].city}, {hotels[0].address}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-on-surface-variant text-xs font-medium line-through">₹{(hotels[0].price_per_night * 1.2).toFixed(0)}</span>
                      <div className="text-primary font-headline text-3xl font-extrabold">₹{hotels[0].price_per_night}<span className="text-sm font-normal text-on-surface-variant">/night</span></div>
                      <button className="mt-4 px-6 py-2.5 bg-on-surface text-surface rounded-xl font-bold text-sm hover:bg-primary transition-colors">Book Now</button>
                    </div>
                  </div>
                </Link>
              )}

              {/* Side Column Cards (Hotel 2 & 3) */}
              <div className="flex flex-col gap-8">
                {hotels.slice(1, 3).map((hotel, idx) => (
                  <Link href={`/hotels/${hotel.id}`} key={hotel.id} className="group overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10">
                    <div className="aspect-video overflow-hidden relative">
                      <Image 
                        src={hotel.images[0] || (idx === 0 
                          ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBhRy6roo7sN6Lj_gN24yQqA9GCx7an1AtcKMqUtrkrL4ebXbyMVTmj6XGLn_WlEYcC2zyYlkncLR27J2Qy9sFcd2MGmxKo0zn-cH9XBUasWQQ1MfqBJ0Go2Pe-Z7lkt2qJRxMZlM00wtiCheeKfaAaZzylr4iTqL_kA9FQFuj2l1q1GV0m0M731COnZEbAyOCbNMg0NV7eYZ3rgklrWQYDXow7kWboilbUA1o3Lj5sWzD8u0WzM0jbDiSufSX6wrUAXYQWNfZAGnI"
                          : "https://lh3.googleusercontent.com/aida-public/AB6AXuCXLHYQ9wT7ZD7OTJstSbxJ2wtEmzO3eZjoFdX6LNUY-CKQSoyoiy7tIP3NoZshvcxavwHrgKp8Or0LG4cwGfuarVj_8746_zawN-fH6YSo5ebAWBDL_rjY9xkNue8SF5Dh73JWK-oJfurtU_pYuMb2K97RG90KBjyFpROzoYYS04jPNC07W_dNjt0xfRnzr9O1QxGEjPO1hls0AdZrBYGFx1A6RzuVfrEQfA0bF1G8mhumbmodJV85y0UQFMHVeRbk6xmUlZhZhSY")}
                        alt={hotel.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        unoptimized
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-tertiary text-xs font-bold uppercase tracking-widest">{(idx + 0.8).toFixed(1)} km away</span>
                        <span className="flex items-center gap-1 text-sm font-bold">
                          <span className="material-symbols-outlined text-orange-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {hotel.rating}
                        </span>
                      </div>
                      <h3 className="font-headline text-lg font-bold text-on-surface line-clamp-1">{hotel.name}</h3>
                      <div className="flex justify-between items-end mt-4">
                        <div className="text-primary font-headline text-xl font-extrabold">₹{hotel.price_per_night}<span className="text-xs font-normal text-on-surface-variant">/night</span></div>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">favorite</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── EXCLUSIVE DEALS ────────────────────────────────── */}
        <section className="bg-surface-container-low py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase text-left block">Members Only</span>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface mt-2 text-left">Exclusive Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "percent", color: "text-primary", bg: "bg-primary/10", title: "Early Bird 25%", desc: "Book 30 days in advance and save a massive quarter on your stay.", linkText: "Claim Code" },
                { icon: "flight_takeoff", color: "text-tertiary", bg: "bg-tertiary/10", title: "Bundle & Save", desc: "Combine flight + hotel and get a complimentary spa voucher.", linkText: "Explore Bundle" },
                { icon: "workspace_premium", color: "text-orange-500", bg: "bg-orange-100", title: "First Ride Free", desc: "Your first bus booking through TravelX is absolutely free up to ₹500.", linkText: "Book Bus" },
                { icon: "loyalty", color: "text-primary", bg: "bg-primary/10", title: "Loyalty Multiplier", desc: "Earn 3x points on all bookings made in the next 48 hours.", linkText: "Join Club" },
              ].map((deal, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-6 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group text-left">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                  <span className={`material-symbols-outlined ${deal.color} mb-4 p-3 ${deal.bg} rounded-2xl w-fit block`}>{deal.icon}</span>
                  <h3 className="font-headline font-bold text-xl mb-2">{deal.title}</h3>
                  <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{deal.desc}</p>
                  <a className={`${deal.color} font-bold text-sm underline decoration-primary/20 hover:decoration-primary`} href="#">{deal.linkText}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POPULAR BUS ROUTES ─────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-10 text-left">Popular Bus Routes</h2>
          <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10 text-left">
            {isLoading ? (
               <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {buses.length > 0 ? buses.map((bus, idx) => (
                  <Link 
                    href={`/buses/${bus.id}`} 
                    key={bus.id} 
                    className={`p-8 border-outline-variant/10 hover:bg-surface-container-low transition-colors group ${
                      idx % 3 !== 2 ? 'lg:border-r' : ''
                    } ${
                      idx < buses.length - buses.length % 3 ? 'border-b' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] uppercase">{bus.from_city.slice(0, 3)}</div>
                        <span className="material-symbols-outlined text-on-surface-variant">east</span>
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] uppercase">{bus.to_city.slice(0, 3)}</div>
                      </div>
                      <span className="text-primary font-extrabold">₹{bus.price_per_seat}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{bus.from_city} to {bus.to_city}</h4>
                    <p className="text-on-surface-variant text-sm">{getDayLabel(bus.journey_date)} • {bus.departure_time}</p>
                    <button className="mt-6 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      Book Seats <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </Link>
                )) : (
                  <div className="p-12 text-center col-span-full italic text-on-surface-variant">No active routes found.</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── BENEFITS SECTION ───────────────────────────────── */}
        <section className="relative py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="text-left">
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
                  Why travel with <br/><span className="text-primary">The Digital Concierge?</span>
                </h2>
                <div className="mt-12 space-y-8">
                  {[
                    { icon: "verified_user", color: "bg-primary", textOn: "text-on-primary", title: "Verified Stays Only", desc: "Every hotel on our platform undergoes a 50-point quality check to ensure your peace of mind." },
                    { icon: "support_agent", color: "bg-tertiary", textOn: "text-on-tertiary", title: "24/7 Human Support", desc: "Real people, real help. No chat bots. We’re here for you at every mile of your journey." },
                    { icon: "wallet", color: "bg-surface-container-highest", textOn: "text-on-surface", title: "Best Price Guarantee", desc: "Found a lower price elsewhere? We'll match it and give you an extra travel credit." },
                  ].map((benefit, bidx) => (
                    <div key={bidx} className="flex gap-6">
                      <div className={`flex-shrink-0 w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <span className={`material-symbols-outlined ${benefit.textOn} text-3xl`}>{benefit.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline text-xl font-bold mb-2">{benefit.title}</h4>
                        <p className="text-on-surface-variant font-medium">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden rotate-3 shadow-2xl relative">
                  <Image 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGcjAsNDlb5r2Z5ZNEOC-ZBK9386myg-wx7qSR2BdT0M_Ytk-MikGACmxrTYZuPhNe56gzWQ_tFwQhoXkhcX4iFXv3MKKd0p2TNIAuQnk_0oyKPZLqo-nEEn81K-1sedZnZQn7Cw_vhc1AjU6SJiqpTj-H7Clt9R6Va8KS2JTj1GqtF3o_H89vkLDbaPLezf6V5zt-uGVy3Getpz9Z002FtmW5zVwuf8Yd5qY2Uk4PGKj4VtOrP44ZUw4CPaajG2-emcxEN1X6pz0"
                    alt="Happy Travelers"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl max-w-[250px] -rotate-3 border border-outline-variant/10 text-left">
                  <div className="flex items-center gap-1 text-orange-500 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-sm italic text-on-surface-variant font-medium">"TravelX changed how I book. The UI is so clean, and the location search is a lifesaver!"</p>
                  <p className="mt-4 text-xs font-bold text-on-surface">— Sarah J., Digital Nomad</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-slate-50 w-full py-16 border-t border-slate-200 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto text-left">
          <div className="col-span-2 md:col-span-1">
            <span className="font-headline font-extrabold text-2xl text-primary">TravelX</span>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed">
              Crafting premium travel experiences through intelligent design and human-centric service.
            </p>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-base mb-6">Explore</h5>
            <ul className="space-y-3">
              <li><Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/hotels">Hotels</Link></li>
              <li><Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/buses">Bus Routes</Link></li>
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Flights</a></li>
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Destinations</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-base mb-6">Support</h5>
            <ul className="space-y-3">
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Help Center</a></li>
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Safety Info</a></li>
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Terms of Service</a></li>
              <li><a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-base mb-6">Connect</h5>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-slate-500 hover:text-primary cursor-pointer">share</span>
              <span className="material-symbols-outlined text-slate-500 hover:text-primary cursor-pointer">alternate_email</span>
              <span className="material-symbols-outlined text-slate-500 hover:text-primary cursor-pointer">language</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 TravelX Digital Concierge. Established with Excellence.</p>
        </div>
      </footer>

      {/* ── BOTTOM NAV (Mobile Only) ────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-white/90 backdrop-blur-lg border-t border-slate-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-2xl">
        <div className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1.5 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-all">
          <span className="material-symbols-outlined" onClick={() => router.push('/bookings')}>luggage</span>
          <span className="text-[10px] font-bold">Bookings</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-all">
          <span className="material-symbols-outlined">local_offer</span>
          <span className="text-[10px] font-bold">Offers</span>
        </div>
        <div className="flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </div>
      </div>
    </div>
  );
}
