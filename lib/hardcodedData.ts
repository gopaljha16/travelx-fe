import { Hotel, Bus } from "./types";

// Helper to map MongoDB _id to string id for frontend
const mapMongoData = (data: any[]) => {
  return data.map(item => ({
    ...item,
    id: item._id?.$oid || item.id || Math.random().toString(36).substr(2, 9)
  }));
};

export const HARDCODED_HOTELS: Hotel[] = mapMongoData([
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a39" },
    "name": "Snow Valley Resorts",
    "city": "Manali",
    "address": "Log Huts Area, Manali, Himachal Pradesh 175131",
    "rating": 4.3,
    "price_per_night": 4500,
    "amenities": ["Free WiFi", "Restaurant", "Parking", "Room Service", "Air Conditioning", "Laundry", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80"
    ],
    "description": "Nestled in the heart of Manali's picturesque Log Huts area, Snow Valley Resorts offers a cozy mountain escape with stunning views of the Himalayas.",
    "room_types": [
      { "name": "Mountain View Cottage", "total_rooms": 12, "price_per_night": 4500, "capacity": 2, "images": ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"] },
      { "name": "Premium Valley Suite", "total_rooms": 6, "price_per_night": 7500, "capacity": 3, "images": ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80"] }
    ],
    "is_active": true,
    "is_verified": true,
    "vendor_id": "000000000000000000000001",
    "latitude": 32.2396,
    "longitude": 77.1887,
    "is_pet_allowed": true,
    "is_early_check_in_available": false,
    "is_late_check_in_available": true,
    "is_late_check_out_available": false,
    "is_pay_at_hotel_available": true,
    "review_count": 156,
    "property_type": "Hotel",
    "check_in_time": "1:00 PM",
    "check_out_time": "11:00 AM"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a37" },
    "name": "ITC Rajputana",
    "city": "Jaipur",
    "address": "Palace Road, near Hawa Mahal, Jaipur 302006",
    "rating": 4.6,
    "price_per_night": 8500,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Air Conditioning", "Room Service", "Laundry", "Airport Shuttle", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"
    ],
    "description": "Inspired by the grandeur of Rajputana royalty, ITC Rajputana brings together Rajasthani heritage and modern luxury on Palace Road.",
    "room_types": [
      { "name": "ITC One Room", "total_rooms": 20, "price_per_night": 8500, "capacity": 2 },
      { "name": "Executive Suite", "total_rooms": 10, "price_per_night": 15000, "capacity": 3 },
      { "name": "Rajputana Suite", "total_rooms": 3, "price_per_night": 32000, "capacity": 4 }
    ],
    "is_active": true,
    "is_verified": true,
    "vendor_id": "000000000000000000000001",
    "latitude": 26.9124,
    "longitude": 75.7873,
    "is_pet_allowed": false,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": false,
    "is_pay_at_hotel_available": true,
    "review_count": 189,
    "property_type": "Hotel",
    "check_in_time": "2:00 PM",
    "check_out_time": "12:00 PM"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a3d" },
    "name": "Treebo Trend Lavender",
    "city": "Bangalore",
    "address": "100 Feet Road, Indiranagar, Bangalore 560038",
    "rating": 3.9,
    "price_per_night": 2200,
    "amenities": ["Free WiFi", "Parking", "Air Conditioning", "Room Service", "Laundry"],
    "images": [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
    ],
    "description": "A smart-budget stay in the heart of Bangalore's trendiest neighbourhood. Treebo Trend Lavender offers spotless rooms, reliable WiFi, and a prime location.",
    "room_types": [
      { "name": "Standard Room", "total_rooms": 15, "price_per_night": 2200, "capacity": 2 },
      { "name": "Deluxe Room", "total_rooms": 8, "price_per_night": 3200, "capacity": 2 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 12.9784,
    "longitude": 77.6408,
    "is_pet_allowed": false,
    "is_early_check_in_available": false,
    "is_late_check_in_available": true,
    "is_late_check_out_available": false,
    "is_pay_at_hotel_available": true,
    "review_count": 67,
    "property_type": "Hotel",
    "check_in_time": "12:00 PM",
    "check_out_time": "11:00 AM"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a36" },
    "name": "Goa Marriott Resort & Spa",
    "city": "Goa",
    "address": "Miramar Beach, Panaji, Goa 403001",
    "rating": 4.5,
    "price_per_night": 7800,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Air Conditioning", "Room Service", "Breakfast Included", "Laundry"],
    "images": [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
    ],
    "description": "Nestled along the golden sands of Miramar Beach, the Goa Marriott Resort & Spa offers the perfect blend of coastal relaxation and vibrant nightlife.",
    "room_types": [
      { "name": "Deluxe Garden View", "total_rooms": 25, "price_per_night": 7800, "capacity": 2 },
      { "name": "Premium Sea View", "total_rooms": 15, "price_per_night": 11500, "capacity": 2 },
      { "name": "Executive Suite", "total_rooms": 6, "price_per_night": 18000, "capacity": 3 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 15.4772,
    "longitude": 73.8127,
    "is_pet_allowed": true,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": true,
    "review_count": 215,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a3b" },
    "name": "Novotel Hyderabad",
    "city": "Hyderabad",
    "address": "HITEC City, Madhapur, Hyderabad 500081",
    "rating": 4.2,
    "price_per_night": 5500,
    "amenities": ["Free WiFi", "Swimming Pool", "Gym", "Restaurant", "Parking", "Air Conditioning", "Room Service", "Laundry", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"
    ],
    "description": "Strategically located in Hyderabad's bustling HITEC City tech hub, Novotel offers a modern stay.",
    "room_types": [
      { "name": "Superior Room", "total_rooms": 30, "price_per_night": 5500, "capacity": 2 },
      { "name": "Executive Room", "total_rooms": 12, "price_per_night": 8500, "capacity": 2 },
      { "name": "Suite", "total_rooms": 4, "price_per_night": 14000, "capacity": 3 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 17.4435,
    "longitude": 78.3772,
    "is_pet_allowed": false,
    "is_early_check_in_available": true,
    "is_late_check_in_available": false,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": true,
    "review_count": 134,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a3a" },
    "name": "The Imperial New Delhi",
    "city": "Delhi",
    "address": "Janpath, Connaught Place, New Delhi 110001",
    "rating": 4.7,
    "price_per_night": 18000,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Room Service", "Parking", "Air Conditioning", "Laundry", "Airport Shuttle", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
    ],
    "description": "A living museum of colonial grandeur in the heart of Lutyens' Delhi, The Imperial is where history meets luxury.",
    "room_types": [
      { "name": "Heritage Room", "total_rooms": 22, "price_per_night": 18000, "capacity": 2 },
      { "name": "Imperial Suite", "total_rooms": 8, "price_per_night": 35000, "capacity": 3 },
      { "name": "Maharaja Suite", "total_rooms": 2, "price_per_night": 75000, "capacity": 4 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 28.6252,
    "longitude": 77.2195,
    "is_pet_allowed": false,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": true,
    "review_count": 412,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a3c" },
    "name": "Radisson Blu Resort & Spa",
    "city": "Alibaug",
    "address": "Varsoli Beach Road, Alibaug, Maharashtra 402201",
    "rating": 4.4,
    "price_per_night": 9200,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Air Conditioning", "Room Service", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80"
    ],
    "description": "A beachside sanctuary just a ferry ride from Mumbai, Radisson Blu Alibaug combines resort luxury with coastal charm.",
    "room_types": [
      { "name": "Superior Garden Room", "total_rooms": 20, "price_per_night": 9200, "capacity": 2 },
      { "name": "Premium Pool Villa", "total_rooms": 8, "price_per_night": 16000, "capacity": 3 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 18.6414,
    "longitude": 72.8722,
    "is_pet_allowed": true,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": false,
    "review_count": 98,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a34" },
    "name": "The Oberoi Grand",
    "city": "Mumbai",
    "address": "Marine Drive, Nariman Point, Mumbai 400021",
    "rating": 4.8,
    "price_per_night": 12500,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Room Service", "Parking", "Air Conditioning", "Laundry", "Airport Shuttle", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80"
    ],
    "description": "Experience unparalleled luxury at The Oberoi Grand, perched along Mumbai's iconic Marine Drive.",
    "room_types": [
      { "name": "Deluxe Sea View", "total_rooms": 15, "price_per_night": 12500, "capacity": 2 },
      { "name": "Premium Suite", "total_rooms": 8, "price_per_night": 22000, "capacity": 3 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 18.944,
    "longitude": 72.8237,
    "is_pet_allowed": true,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": true,
    "review_count": 342,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a35" },
    "name": "Taj Lake Palace",
    "city": "Udaipur",
    "address": "Pichola Lake, Udaipur, Rajasthan 313001",
    "rating": 4.9,
    "price_per_night": 28000,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Restaurant", "Bar", "Room Service", "Parking", "Air Conditioning", "Laundry", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
    ],
    "description": "Floating serenely on Lake Pichola, the Taj Lake Palace is a vision of white marble and timeless romance.",
    "room_types": [
      { "name": "Luxury Room", "total_rooms": 20, "price_per_night": 28000, "capacity": 2 },
      { "name": "Royal Suite", "total_rooms": 5, "price_per_night": 55000, "capacity": 3 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 24.5726,
    "longitude": 73.6811,
    "is_pet_allowed": false,
    "is_early_check_in_available": true,
    "is_late_check_in_available": false,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": false,
    "review_count": 528,
    "property_type": "Hotel"
  },
  {
    "_id": { "$oid": "69dfe1c4e8d0a7497fef5a38" },
    "name": "The Leela Palace",
    "city": "Bangalore",
    "address": "23, HAL Airport Road, Kodihalli, Bangalore 560008",
    "rating": 4.7,
    "price_per_night": 15000,
    "amenities": ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Bar", "Room Service", "Parking", "Air Conditioning", "Laundry", "Airport Shuttle", "Breakfast Included"],
    "images": [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80"
    ],
    "description": "The Leela Palace Bangalore is a royal retreat styled after the Mysore Palace.",
    "room_types": [
      { "name": "Royal Premier", "total_rooms": 18, "price_per_night": 15000, "capacity": 2 },
      { "name": "Royal Club", "total_rooms": 10, "price_per_night": 22000, "capacity": 2 }
    ],
    "is_active": true,
    "is_verified": true,
    "latitude": 12.9611,
    "longitude": 77.6488,
    "is_pet_allowed": true,
    "is_early_check_in_available": true,
    "is_late_check_in_available": true,
    "is_late_check_out_available": true,
    "is_pay_at_hotel_available": false,
    "review_count": 276,
    "property_type": "Hotel"
  }
]);

export const HARDCODED_BUSES: Bus[] = mapMongoData([
  {
    "_id": { "$oid": "69e0ae57e5fb38f5f2cae34d" },
    "name": "SRS Travels Super Deluxe",
    "from_city": "Bangalore",
    "to_city": "Goa",
    "departure_time": "20:30",
    "arrival_time": "08:30",
    "journey_date": "2026-04-17",
    "total_seats": 40,
    "price_per_seat": 1100,
    "bus_type": "Non-AC Sleeper",
    "amenities": ["Blanket", "Charging Point", "Spacious Berths"],
    "images": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"],
    "is_active": true,
    "is_verified": true,
    "booked_seats": []
  },
  {
    "_id": { "$oid": "69e0ae57e5fb38f5f2cae348" },
    "name": "Zingbus Premium Volvo",
    "from_city": "Delhi",
    "to_city": "Jaipur",
    "departure_time": "22:30",
    "arrival_time": "04:30",
    "journey_date": "2026-04-18",
    "total_seats": 40,
    "price_per_seat": 850,
    "bus_type": "AC Sleeper",
    "amenities": ["Free WiFi", "Charging Point", "Water Bottle", "Blanket", "Emergency Exit", "CCTV"],
    "images": ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80"],
    "is_active": true,
    "is_verified": true,
    "booked_seats": []
  },
  {
    "_id": { "$oid": "69e0ae57e5fb38f5f2cae350" },
    "name": "Greenline Sleeper",
    "from_city": "Kolkata",
    "to_city": "Darjeeling",
    "departure_time": "19:00",
    "arrival_time": "08:00",
    "journey_date": "2026-04-18",
    "total_seats": 30,
    "price_per_seat": 1450,
    "bus_type": "AC Sleeper",
    "amenities": ["WiFi", "Blanket", "Water", "CCTV"],
    "images": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"],
    "is_active": true,
    "is_verified": true,
    "booked_seats": []
  },
  {
    "_id": { "$oid": "69e0ae57e5fb38f5f2cae349" },
    "name": "IntrCity SmartBus",
    "from_city": "Delhi",
    "to_city": "Jaipur",
    "departure_time": "08:00",
    "arrival_time": "14:00",
    "journey_date": "2026-04-17",
    "total_seats": 36,
    "price_per_seat": 650,
    "bus_type": "AC Seater",
    "amenities": ["Live Tracking", "WiFi", "Charging Point", "CCTV", "Snacks"],
    "images": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"],
    "is_active": true,
    "is_verified": true,
    "booked_seats": []
  },
  {
    "_id": { "$oid": "69e0ae57e5fb38f5f2cae34c" },
    "name": "KSRTC Ambari Dream Class",
    "from_city": "Bangalore",
    "to_city": "Goa",
    "departure_time": "21:00",
    "arrival_time": "09:00",
    "journey_date": "2026-04-18",
    "total_seats": 30,
    "price_per_seat": 1550,
    "bus_type": "AC Sleeper",
    "amenities": ["WiFi", "High Speed USB Port", "Emergency Exit", "Water Bottle"],
    "images": ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80"],
    "is_active": true,
    "is_verified": true,
    "booked_seats": []
  }
]);
