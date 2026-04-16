"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getWishlist, toggleWishlist as apiToggleWishlist, WishlistItem } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistCount: number;
  toggleWishlistItem: (itemId: string, itemType: "hotel" | "bus") => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const items = await getWishlist();
      setWishlistIds(new Set(items.map((i) => i.item_id)));
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlistItem = async (itemId: string, itemType: "hotel" | "bus") => {
    if (!user) return;
    
    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });

    try {
      const res = await apiToggleWishlist(itemId, itemType);
      // Sync with final server state
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.is_wishlisted) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
      // Revert optimization on error
      fetchWishlist();
    }
  };

  const isInWishlist = (itemId: string) => wishlistIds.has(itemId);

  return (
    <WishlistContext.Provider value={{ 
      wishlistIds, 
      wishlistCount: wishlistIds.size, 
      toggleWishlistItem, 
      isInWishlist,
      refreshWishlist: fetchWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
