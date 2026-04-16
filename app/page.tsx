"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { searchHotels, searchBuses, Hotel, Bus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isNearby, setIsNearby] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);

  // Search Form State
  const [activeTab, setActiveTab] = useState<"hotels" | "buses">("hotels");
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("5");
  const [date, setDate] = useState("");

  const requestLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLat(latitude);
          setLng(longitude);
          
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            const res = await fetch(url);
            const data = await res.json();
            const cityInfo = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
            if (cityInfo) {
              setSearchQuery(cityInfo);
            } else {
              setSearchQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (e) {
            setSearchQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setIsLocating(false);
          setLocationResolved(true);
        },
        (error) => {
          console.error("Error getting location", error);
          setIsLocating(false);
          setLocationResolved(true);
        }
      );
    } else {
      setLocationResolved(true);
    }
  };

  useEffect(() => {
    // Ask for location on mount automatically
    requestLocation();
  }, []);

  useEffect(() => {
    if (!locationResolved) return; // Wait for geolocation to resolve first
    
    const fetchHotels = async () => {
      setHotelsLoading(true);
      try {
        // Try geo-filtered search first if we have location
        if (lat && lng) {
          const { hotels: nearbyHotels } = await searchHotels({ 
            lat, lng, 
            radius_km: parseInt(radius) || 50 
          });
          if (nearbyHotels.length > 0) {
            setHotels(nearbyHotels.slice(0, 3));
            setIsNearby(true);
            setHotelsLoading(false);
            return;
          }
        }
        // Fallback: fetch top-rated hotels nationally (no geo filter)
        const { hotels: allHotels } = await searchHotels({});
        const sorted = [...allHotels].sort((a, b) => b.rating - a.rating);
        setHotels(sorted.slice(0, 3));
        setIsNearby(false);
      } catch (err) {
        console.error("Failed to fetch hotels:", err);
      } finally {
        setHotelsLoading(false);
      }
    };
    fetchHotels();
  }, [lat, lng, radius, locationResolved]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const { buses } = await searchBuses({});
        setBuses(buses.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch buses:", err);
      }
    };
    fetchBuses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "hotels") {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        params.set("radius_km", radius);
      } else if (searchQuery) {
        params.set("city", searchQuery);
      }
      router.push(`/hotels?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      if (searchQuery) params.set("to_city", searchQuery);
      if (date) params.set("journey_date", date);
      router.push(`/buses?${params.toString()}`);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <Navbar />

      <main className="pt-20 pb-24 md:pb-0">
        {/* Hero Section */}
        <section className="relative min-h-[600px] flex items-center justify-center px-6 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img alt="Luxury Hotel" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNDZpn03xQ2TxuNi_4B8qSb1NTy03Xd0J7Z_q6MArN0Z_XwC0qi4ePCeBuHTGD4xCd_15bbvJbHGwrF2hQZsCDvLSXyDIvIarU68eST5ArXLrTGd99SNNNosG_1xzjEPPAUqO5yvOGra9BtviqeMdi_y82VR3EHI-027bdRGwHFE_CW8BlwP4CJ3XFjw-5iujwWx04AZ5Hrf1EMpOhwXKzZSeF3Gu2hUMcyVk61yunENyn712e7vrx4d-Ig1SXjw1OU9nlZ6pL4u4" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background"></div>
          </div>

          {/* Search Card Container */}
          <div className="relative z-10 w-full max-w-5xl mt-12">
            <div className="text-center mb-10">
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold text-on-surface tracking-tight mb-4 text-white drop-shadow-lg">
                Discover Your Next <span className="text-primary italic">Vibe</span>
              </h1>
              <p className="text-white drop-shadow-md text-lg font-medium max-w-2xl mx-auto">
                Curated stays and seamless journeys tailored to your rhythm.
              </p>
            </div>

            {/* Central Search Card */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-2xl p-2 md:p-4 border border-outline-variant/10">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-surface-container-low w-fit rounded-2xl mx-auto md:mx-0">
                <button 
                  onClick={() => setActiveTab("hotels")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
                    activeTab === "hotels" ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>hotel</span>
                  <span className="text-sm">Hotels</span>
                </button>
                <button 
                  onClick={() => setActiveTab("buses")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
                    activeTab === "buses" ? "bg-primary text-on-primary font-semibold shadow-lg shadow-primary/20" : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>directions_bus</span>
                  <span className="text-sm">Bus</span>
                </button>
              </div>

              {/* Search Inputs Grid */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-2">
                <div className="md:col-span-4 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">City or Hotel</label>
                  <div className="relative group">
                    <input 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (lat || lng) {
                          setLat(null);
                          setLng(null);
                        }
                      }}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800" 
                      placeholder="Where are you going?" 
                      type="text" 
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                    <button 
                      type="button" 
                      onClick={requestLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-fixed-dim/30 hover:bg-primary-fixed-dim/50 text-on-primary-fixed-variant transition-all font-bold"
                    >
                      <span className={`material-symbols-outlined text-sm ${isLocating ? "animate-spin" : ""}`}>my_location</span>
                      <span className="text-[10px] font-bold">{isLocating ? "LOCATING" : "NEAR ME"}</span>
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-3 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Radius</label>
                  <div className="relative">
                    <select 
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-10 appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800"
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

                <div className="md:col-span-3 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant ml-2">Check-in</label>
                  <div className="relative">
                    <input 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800" 
                      type="date" 
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button type="submit" className="voyage-button w-full h-[60px] rounded-2xl text-on-primary font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">search</span>
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Hotels Near You Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">
                {hotelsLoading ? "Discovering Hotels..." : (isNearby ? "Hotels Near You" : "Popular Hotels")}
              </h2>
              <p className="text-on-surface-variant mt-2">
                {hotelsLoading ? "Locating the best stays..." : (isNearby ? "Discover curated stays within your immediate radius." : "Discover the most popular stays across the country.")}
              </p>
            </div>
            <Link href="/hotels" className="flex items-center gap-2 text-primary font-bold group">
              View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {hotelsLoading || !locationResolved ? (
             <div className="flex justify-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             </div>
          ) : hotels.length === 0 ? (
             <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 text-on-surface-variant">
               No hotels found.
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Large Featured Card */}
               {hotels[0] && (
                 <Link href={`/hotels/${hotels[0].id}`} className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10 block cursor-pointer">
                   <div className="aspect-[16/10] overflow-hidden">
                     <img alt={hotels[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={hotels[0].images?.[0] || "https://images.unsplash.com/photo-1542314831-c6a4d14b?w=800&q=80"} />
                   </div>
                   <div className="p-8 flex justify-between items-start">
                     <div>
                       <div className="flex items-center gap-2 mb-3">
                         <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                           <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {hotels[0].rating}
                         </span>
                         <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold">{isNearby ? "Near You" : "Top Rated"}</span>
                       </div>
                       <h3 className="font-headline text-2xl font-bold text-on-surface">{hotels[0].name}</h3>
                       <p className="text-on-surface-variant flex items-center gap-1 mt-1">
                         <span className="material-symbols-outlined text-base">location_on</span> {hotels[0].city}
                       </p>
                     </div>
                     <div className="text-right flex flex-col justify-between items-end h-full">
                       <div>
                         <div className="text-primary font-headline text-3xl font-extrabold">₹{hotels[0].price_per_night}<span className="text-sm font-normal text-on-surface-variant">/night</span></div>
                       </div>
                       <span className="mt-4 px-6 py-2.5 bg-on-surface text-surface rounded-xl font-bold text-sm hover:bg-primary transition-colors">Book Now</span>
                     </div>
                   </div>
                 </Link>
               )}

               {/* Side Column Cards */}
               <div className="flex flex-col gap-8">
                 {hotels.slice(1, 3).map((hotel, index) => (
                   <Link href={`/hotels/${hotel.id}`} key={hotel.id} className="group overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-sm border border-outline-variant/10 h-full flex flex-col block cursor-pointer">
                     <div className="aspect-video overflow-hidden shrink-0">
                       <img alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={hotel.images?.[0] || "https://images.unsplash.com/photo-1542314831?w=400&q=80"} />
                     </div>
                     <div className="p-6 flex flex-col grow">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-tertiary text-xs font-bold uppercase tracking-widest">{hotel.city}</span>
                         <span className="flex items-center gap-1 text-sm font-bold"><span className="material-symbols-outlined text-orange-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {hotel.rating}</span>
                       </div>
                       <h3 className="font-headline text-lg font-bold text-on-surface">{hotel.name}</h3>
                       <div className="flex justify-between items-end mt-auto pt-4">
                         <div className="text-primary font-headline text-xl font-extrabold">₹{hotel.price_per_night}<span className="text-xs font-normal text-on-surface-variant">/night</span></div>
                         <span className="text-sm font-bold text-primary hover:underline">View →</span>
                       </div>
                     </div>
                   </Link>
                 ))}
               </div>
             </div>
          )}
        </section>

        {/* Exclusive Deals */}
        <section className="bg-surface-container-low py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">Members Only</span>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface mt-2">Exclusive Deals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary/10 rounded-2xl w-fit">percent</span>
                <h3 className="font-headline font-bold text-xl mb-2">Early Bird 25%</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Book 30 days in advance and save a massive quarter on your stay.</p>
                <a className="text-primary font-bold text-sm underline decoration-primary/20 hover:decoration-primary" href="#">Claim Code</a>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group">
                <span className="material-symbols-outlined text-tertiary mb-4 p-3 bg-tertiary/10 rounded-2xl w-fit">flight_takeoff</span>
                <h3 className="font-headline font-bold text-xl mb-2">Bundle &amp; Save</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Combine flight + hotel and get a complimentary spa voucher.</p>
                <a className="text-tertiary font-bold text-sm underline decoration-tertiary/20 hover:decoration-tertiary" href="#">Explore Bundle</a>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group">
                <span className="material-symbols-outlined text-orange-500 mb-4 p-3 bg-orange-100 rounded-2xl w-fit">workspace_premium</span>
                <h3 className="font-headline font-bold text-xl mb-2">First Ride Free</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Your first bus booking through TravelX is absolutely free up to $15.</p>
                <a className="text-orange-600 font-bold text-sm underline decoration-orange-500/20 hover:decoration-orange-500" href="#">Book Bus</a>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-white shadow-sm relative overflow-hidden group">
                <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary/10 rounded-2xl w-fit">loyalty</span>
                <h3 className="font-headline font-bold text-xl mb-2">Loyalty Multiplier</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Earn 3x points on all bookings made in the next 48 hours.</p>
                <a className="text-primary font-bold text-sm underline decoration-primary/20 hover:decoration-primary" href="#">Join Club</a>
              </div>
            </div>
          </div>
        </section>

        {/* Top Bus Routes */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex justify-between items-end mb-10">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">Popular Bus Routes</h2>
            <Link href="/buses" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="overflow-hidden rounded-[2rem] bg-surface-container-lowest border border-outline-variant/10">
            {buses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {buses.map((bus, index) => (
                  <Link href={`/buses/${bus.id}`} key={bus.id} className={`p-8 block border-b ${index !== 2 ? 'md:border-r lg:border-r border-outline-variant/10' : ''} hover:bg-surface-container-low transition-colors group`}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{bus.from_city.substring(0,3).toUpperCase()}</div>
                        <span className="material-symbols-outlined text-on-surface-variant">east</span>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{bus.to_city.substring(0,3).toUpperCase()}</div>
                      </div>
                      <span className="text-primary font-extrabold">₹{bus.price_per_seat}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{bus.from_city} to {bus.to_city}</h4>
                    <p className="text-on-surface-variant text-sm">{bus.bus_type} • {bus.total_seats - (bus.booked_seats?.length || 0)} seats left</p>
                    <button className="mt-6 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Book Seats <span className="material-symbols-outlined text-sm">chevron_right</span></button>
                  </Link>
                ))}
              </div>
            ) : (
                <div className="p-8 text-center text-on-surface-variant">No active bus routes at this moment.</div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">Why travel with <br/><span className="text-primary">The Digital Concierge?</span></h2>
                <div className="mt-12 space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="material-symbols-outlined text-on-primary text-3xl">verified_user</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-xl font-bold mb-2">Verified Stays Only</h4>
                      <p className="text-on-surface-variant">Every hotel on our platform undergoes a 50-point quality check to ensure your peace of mind.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-tertiary rounded-2xl flex items-center justify-center shadow-lg shadow-tertiary/20">
                      <span className="material-symbols-outlined text-on-tertiary text-3xl">support_agent</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-xl font-bold mb-2">24/7 Human Support</h4>
                      <p className="text-on-surface-variant">Real people, real help. No chat bots. We’re here for you at every mile of your journey.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface text-3xl">wallet</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-xl font-bold mb-2">Best Price Guarantee</h4>
                      <p className="text-on-surface-variant">Found a lower price elsewhere? We'll match it and give you an extra ₹500 travel credit.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden rotate-3 shadow-2xl">
                  <img alt="Happy Travelers" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGcjAsNDlb5r2Z5ZNEOC-ZBK9386myg-wx7qSR2BdT0M_Ytk-MikGACmxrTYZuPhNe56gzWQ_tFwQhoXkhcX4iFXv3MKKd0p2TNIAuQnk_0oyKPZLqo-nEEn81K-1sedZnZQn7Cw_vhc1AjU6SJiqpTj-H7Clt9R6Va8KS2JTj1GqtF3o_H89vkLDbaPLezf6V5zt-uGVy3Getpz9Z002FtmW5zVwuf8Yd5qY2Uk4PGKj4VtOrP44ZUw4CPaajG2-emcxEN1X6pz0" />
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl max-w-[250px] -rotate-3 border border-outline-variant/10">
                  <div className="flex items-center gap-1 text-orange-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                         <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-sm italic text-on-surface-variant font-medium">"TravelX changed how I book. The UI is so clean, and the location search is a lifesaver!"</p>
                  <p className="mt-4 text-xs font-bold">— Sarah J., Digital Nomad</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-1">
            <span className="font-headline font-bold text-lg text-slate-900 dark:text-slate-100">TravelX</span>
            <p className="text-xs font-body text-slate-500 mt-4 leading-relaxed">
              Crafting premium travel experiences through intelligent design and human-centric service.
            </p>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-sm mb-4">Explore</h5>
            <ul className="space-y-2">
              <li><Link className="text-xs font-body text-slate-500 hover:text-slate-800" href="/hotels">Hotels</Link></li>
              <li><Link className="text-xs font-body text-slate-500 hover:text-slate-800" href="/buses">Bus Routes</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-on-surface font-bold text-sm mb-4">Support</h5>
            <ul className="space-y-2">
              <li><a className="text-xs font-body text-slate-500 hover:text-slate-800" href="#">Help Center</a></li>
              <li><a className="text-xs font-body text-slate-500 hover:text-slate-800" href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-12 pt-8 border-t border-slate-200/10 text-center">
          <p className="text-[10px] font-body text-slate-500 uppercase tracking-widest">© 2024 TravelX. The Digital Concierge.</p>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/15 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-2xl">
        <Link href="/" className="flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl px-3 py-1">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[11px] font-semibold font-body">Home</span>
        </Link>
        <Link href="/bookings" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all">
          <span className="material-symbols-outlined">luggage</span>
          <span className="text-[11px] font-semibold font-body">Bookings</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[11px] font-semibold font-body">Profile</span>
        </Link>
      </div>
    </div>
  );
}
