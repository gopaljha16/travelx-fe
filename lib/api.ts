const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    // FastAPI 422 returns detail as array of objects
    const detail = Array.isArray(err.detail)
      ? err.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ")
      : err.detail || "Request failed";
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  
  // Recursively map _id to id for all objects in the response
  const mapId = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(mapId);
    if (obj && typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = mapId(obj[key]);
      }
      if (obj._id && !obj.id) newObj.id = obj._id;
      return newObj;
    }
    return obj;
  };

  return mapId(data);
}

// Backend OTP schema expects { phone } or { email } — not a single "identifier" field
function buildOtpPayload(identifier: string) {
  return identifier.includes("@") ? { email: identifier } : { phone: identifier };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const sendOtp = (identifier: string) =>
  request<{ message: string }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(buildOtpPayload(identifier)),
  });

export const verifyOtp = (identifier: string, otp: string) =>
  request<{ message: string; is_new_user: boolean; role: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ ...buildOtpPayload(identifier), otp }),
  });

// PUT /auth/onboard  — body: { name, email?, password? }
export const onboard = (name: string, email?: string, password?: string) =>
  request<{ message: string }>("/auth/onboard", {
    method: "PUT",
    body: JSON.stringify({ name, email: email || undefined, password: password || undefined }),
  });

// POST /auth/login  — body: { email, password }
export const login = (email: string, password: string) =>
  request<{ message: string; role: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request<{ message: string }>("/auth/logout", { method: "POST" });

// GET /auth/  — returns User schema (id, role, phone, email, name, is_onboarded, is_active)
export const getProfile = () => request<UserProfile>("/auth/");

export const refreshToken = () => request<{ message: string }>("/auth/refresh", { method: "POST" });

// ── Hotels ────────────────────────────────────────────────────────────────────

// GET /hotels/search  — query params: q, city, lat, lng, radius_km, min_price, max_price, min_rating, amenities (repeated), is_pet_allowed
export const searchHotels = (params: {
  q?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  amenities?: string[];
  is_pet_allowed?: boolean;
}) => {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.city) q.set("city", params.city);
  if (params.lat !== undefined) q.set("lat", String(params.lat));
  if (params.lng !== undefined) q.set("lng", String(params.lng));
  if (params.radius_km !== undefined) q.set("radius_km", String(params.radius_km));
  if (params.min_price !== undefined) q.set("min_price", String(params.min_price));
  if (params.max_price !== undefined) q.set("max_price", String(params.max_price));
  if (params.min_rating !== undefined) q.set("min_rating", String(params.min_rating));
  // amenities must be repeated: ?amenities=Wifi&amenities=Pool
  if (params.amenities?.length) params.amenities.forEach((a) => q.append("amenities", a));
  if (params.is_pet_allowed !== undefined) q.set("is_pet_allowed", String(params.is_pet_allowed));
  return request<{ hotels: Hotel[]; total: number }>(`/hotels/search?${q}`);
};

// GET /hotels/{hotel_id}
export const getHotel = (id: string) => request<Hotel>(`/hotels/${id}`);

// ── Hotel Bookings ────────────────────────────────────────────────────────────

// POST /bookings/  — body: BookingCreate
export const createBooking = (data: BookingCreate) =>
  request<Booking>("/bookings/", { method: "POST", body: JSON.stringify(data) });

// GET /bookings/
export const getMyBookings = () => request<Booking[]>("/bookings/");

// GET /bookings/{booking_id}
export const getBooking = (id: string) => request<Booking>(`/bookings/${id}`);

// POST /bookings/{booking_id}/cancel
export const cancelBooking = (id: string) =>
  request<Booking>(`/bookings/${id}/cancel`, { method: "POST" });

// ── Buses ─────────────────────────────────────────────────────────────────────

// GET /buses/search  — query params: from_city, to_city, journey_date, bus_type, min_price, max_price
export const searchBuses = (params: {
  from_city?: string;
  to_city?: string;
  journey_date?: string;
  bus_type?: string;
  min_price?: number;
  max_price?: number;
}) => {
  const q = new URLSearchParams();
  if (params.from_city) q.set("from_city", params.from_city);
  if (params.to_city) q.set("to_city", params.to_city);
  if (params.journey_date) q.set("journey_date", params.journey_date);
  if (params.bus_type) q.set("bus_type", params.bus_type);
  if (params.min_price !== undefined) q.set("min_price", String(params.min_price));
  if (params.max_price !== undefined) q.set("max_price", String(params.max_price));
  return request<{ buses: Bus[]; total: number }>(`/buses/search?${q}`);
};

// GET /buses/{bus_id}
export const getBus = (id: string) => request<Bus>(`/buses/${id}`);

// POST /buses/book  — body: { bus_id, seat_numbers }
export const bookBus = (bus_id: string, seat_numbers: number[]) =>
  request<BusBooking>("/buses/book", {
    method: "POST",
    body: JSON.stringify({ bus_id, seat_numbers }),
  });

// GET /buses/bookings/
export const getMyBusBookings = (page = 1, limit = 10) =>
  request<{ bookings: BusBooking[]; total: number; page: number; limit: number }>(
    `/buses/bookings/?page=${page}&limit=${limit}`
  );

// GET /buses/bookings/{booking_id}
export const getBusBooking = (id: string) =>
  request<BusBooking>(`/buses/bookings/${id}`);

// POST /buses/bookings/{booking_id}/cancel
export const cancelBusBooking = (id: string) =>
  request<BusBooking>(`/buses/bookings/${id}/cancel`, { method: "POST" });

// ── Reviews ───────────────────────────────────────────────────────────────────

// POST /reviews/  — body: { booking_id, hotel_id, rating, review_text? }
export const submitReview = (data: {
  booking_id: string;
  hotel_id: string;
  rating: number;
  review_text?: string;
}) => request<Review>("/reviews/", { method: "POST", body: JSON.stringify(data) });

// GET /reviews/hotel/{hotel_id}
export const getHotelReviews = (hotel_id: string, page = 1, limit = 10) =>
  request<ReviewListResponse>(`/reviews/hotel/${hotel_id}?page=${page}&limit=${limit}`);

// GET /reviews/
export const getMyReviews = (page = 1, limit = 10) =>
  request<ReviewListResponse>(`/reviews/?page=${page}&limit=${limit}`);

// DELETE /reviews/{review_id}
export const deleteReview = (id: string) =>
  request<void>(`/reviews/${id}`, { method: "DELETE" });

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  role: string;
  phone?: string;
  email?: string;
  name?: string;
  is_onboarded?: boolean;
  is_active: boolean;
}

export interface RoomType {
  name: string;
  total_rooms: number;
  price_per_night: number;
  capacity: number;
}

// Backend serialises with alias _id → id via populate_by_name
export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  description?: string;
  room_types: RoomType[];
  is_active: boolean;
  is_verified: boolean;
  vendor_id?: string;
  latitude?: number;
  longitude?: number;
  is_pet_allowed: boolean;
}

export interface BookingCreate {
  hotel_id: string;
  room_type_name: string;
  check_in: string;   // YYYY-MM-DD
  check_out: string;  // YYYY-MM-DD
  num_rooms: number;
  num_guests: number;
}

export interface Booking {
  id: string;
  user_id: string;
  hotel_id: string;
  hotel_name?: string;
  hotel_image?: string;
  latitude?: number;
  longitude?: number;
  room_type_name: string;
  check_in: string;
  check_out: string;
  num_rooms: number;
  num_guests: number;
  total_price: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  created_at: string;
}

export interface Bus {
  id: string;
  vendor_id: string;
  name: string;
  from_city: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  journey_date: string;
  total_seats: number;
  price_per_seat: number;
  bus_type: string;
  amenities: string[];
  images: string[];
  is_active: boolean;
  is_verified: boolean;
  booked_seats: number[];
}

export interface BusBooking {
  id: string;
  bus_id: string;
  bus_name?: string;
  bus_type?: string;
  user_id: string;
  seat_numbers: number[];
  total_price: number;
  journey_date: string;
  from_city: string;
  to_city: string;
  status: "CONFIRMED" | "CANCELLED";
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  hotel_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  average_rating: number;
}
