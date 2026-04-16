"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getWishlist, WishlistItem } from "@/lib/api";
import HotelCard from "@/components/HotelCard";
import BusCard from "@/components/BusCard";
import { Heart, Loader2, PackageOpen } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWishlist();
    }
  }, [user]);

  if (authLoading || (loading && !items.length)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const hotels = items.filter(i => i.item_type === "hotel");
  const buses = items.filter(i => i.item_type === "bus");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
              <Heart size={16} className="fill-primary" />
              <span>Saved for later</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Wishlist</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your saved hotels and bus journeys in one place.</p>
          </div>
          
          <div className="flex bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
            <div className="px-4 py-2 text-sm font-bold text-slate-900 bg-slate-100 rounded-xl">
              {items.length} Items selected
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 font-headline">
              <PackageOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="text-slate-500 mt-2 max-w-sm">Explore our hotels and buses and heart the ones you love to see them here.</p>
            <div className="flex gap-4 mt-8">
              <Link href="/hotels" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Browse Hotels</Link>
              <Link href="/buses" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors">Find Buses</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {hotels.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   Saved Hotels
                  <span className="h-px flex-1 bg-slate-200"></span>
                </h2>
                <div className="grid gap-6">
                  {hotels.map(item => (
                    <HotelCard key={item.id} hotel={item.item_details as any} />
                  ))}
                </div>
              </div>
            )}

            {buses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   Saved Bus Journeys
                  <span className="h-px flex-1 bg-slate-200"></span>
                </h2>
                <div className="grid gap-6">
                  {buses.map(item => (
                    <BusCard key={item.id} bus={item.item_details as any} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
