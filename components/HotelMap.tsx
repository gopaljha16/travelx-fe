"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotel } from "@/lib/api";
import Link from "next/link";
import { MapPin, Star, IndianRupee } from "lucide-react";

// Fix for default marker icons not showing in React/Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SelectedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HotelMapProps {
  hotels: Hotel[];
  center?: [number, number];
  zoom?: number;
  mini?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

// Sub-component to handle map bounds and centering
function ChangeView({ hotels, center, zoom, mini }: HotelMapProps) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13);
      return;
    }

    if (hotels.length > 0 && !mini) {
      const validHotels = hotels.filter(h => h.latitude !== undefined && h.longitude !== undefined);
      if (validHotels.length > 0) {
        const bounds = L.latLngBounds(validHotels.map(h => [h.latitude!, h.longitude!]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [hotels, center, zoom, map, mini]);

  return null;
}

// Sub-component to handle map events
function MapEvents({ onLocationSelect, mini }: { onLocationSelect?: (lat: number, lng: number) => void, mini?: boolean }) {
  useMapEvents({
    click(e) {
      if (!mini && onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function HotelMap({ 
  hotels, 
  center, 
  zoom = 13, 
  mini = false, 
  onLocationSelect,
  selectedLocation 
}: HotelMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Default center if no hotels and no center provided
  const mapCenter: [number, number] = center || (hotels.length > 0 && hotels[0].latitude !== undefined && hotels[0].longitude !== undefined
    ? [hotels[0].latitude, hotels[0].longitude] 
    : [20.5937, 78.9629]); // India center

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden border border-slate-200 ${mini ? 'pointer-events-none' : ''}`}>
      <MapContainer 
        center={mapCenter} 
        zoom={mini ? zoom - 2 : zoom} 
        className="w-full h-full z-0"
        scrollWheelZoom={!mini}
        zoomControl={!mini}
        attributionControl={!mini}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView hotels={hotels} center={center} zoom={zoom} mini={mini} />
        <MapEvents onLocationSelect={onLocationSelect} mini={mini} />

        {selectedLocation && !mini && (
          <Marker position={selectedLocation} icon={SelectedIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-slate-800 text-xs mb-1">SELECTED AREA</p>
                <button 
                  className="bg-primary hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded"
                >
                  SEARCHING HERE
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {hotels.filter(h => h.latitude !== undefined && h.longitude !== undefined).map((hotel) => (
          <Marker 
            key={hotel.id} 
            position={[hotel.latitude!, hotel.longitude!]}
          >
            {!mini && (
              <Popup className="hotel-popup">
                <div className="w-[200px] p-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                     <img 
                      src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400"} 
                      alt={hotel.name}
                      className="object-cover w-full h-full"
                     />
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{hotel.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="fill-orange-400 text-orange-400" />
                    <span className="text-xs font-bold text-slate-600">{hotel.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                     <div className="flex items-center text-primary font-bold">
                        <IndianRupee size={14} />
                        <span>{hotel.price_per_night}</span>
                     </div>
                     <Link 
                      href={`/hotels/${hotel.id}`} 
                      className="text-[10px] font-bold text-white bg-primary px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                     >
                       DETAILS
                     </Link>
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

