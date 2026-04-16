const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type JsonObject = Record<string, unknown>;

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapIdsDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => mapIdsDeep(item)) as T;
  }

  if (!isRecord(value)) {
    return value;
  }

  const mapped: JsonObject = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    mapped[key] = mapIdsDeep(nestedValue);
  }

  if ("_id" in value && !("id" in value)) {
    mapped.id = value._id;
  }

  return mapped as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    const detail =
      Array.isArray(err.detail)
        ? err.detail.map((entry: { msg?: string }) => entry.msg || JSON.stringify(entry)).join(", ")
        : err.detail || "Request failed";
    throw new Error(detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data: T = await res.json();
  return mapIdsDeep(data);
}

function buildOtpPayload(identifier: string) {
  return identifier.includes("@") ? { email: identifier } : { phone: identifier };
}

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

export const onboard = (name: string, email?: string, password?: string) =>
  request<{ message: string }>("/auth/onboard", {
    method: "PUT",
    body: JSON.stringify({ name, email: email || undefined, password: password || undefined }),
  });

export const login = (email: string, password: string) =>
  request<{ message: string; role: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request<{ message: string }>("/auth/logout", { method: "POST" });
export const getProfile = () => request<UserProfile>("/auth/");
export const refreshToken = () => request<{ message: string }>("/auth/refresh", { method: "POST" });

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
  is_early_check_in_available?: boolean;
  is_late_check_in_available?: boolean;
  is_late_check_out_available?: boolean;
  is_pay_at_hotel_available?: boolean;
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
  if (params.amenities?.length) params.amenities.forEach((amenity) => q.append("amenities", amenity));
  if (params.is_pet_allowed !== undefined) q.set("is_pet_allowed", String(params.is_pet_allowed));
  if (params.is_early_check_in_available !== undefined) q.set("is_early_check_in_available", String(params.is_early_check_in_available));
  if (params.is_late_check_in_available !== undefined) q.set("is_late_check_in_available", String(params.is_late_check_in_available));
  if (params.is_late_check_out_available !== undefined) q.set("is_late_check_out_available", String(params.is_late_check_out_available));
  if (params.is_pay_at_hotel_available !== undefined) q.set("is_pay_at_hotel_available", String(params.is_pay_at_hotel_available));
  return request<{ hotels: Hotel[]; total: number }>(`/hotels/search?${q.toString()}`);
};

export const getHotel = (id: string) => request<Hotel>(`/hotels/${id}`);

export const createBooking = (data: BookingCreate) =>
  request<Booking>("/bookings/", { method: "POST", body: JSON.stringify(data) });

export const verifyPayment = (data: {
  booking_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => request<Booking>("/bookings/verify-payment", { method: "POST", body: JSON.stringify(data) });

export const getMyBookings = () => request<Booking[]>("/bookings/");
export const getBooking = (id: string) => request<Booking>(`/bookings/${id}`);
export const cancelBooking = (id: string) => request<Booking>(`/bookings/${id}/cancel`, { method: "POST" });

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
  return request<{ buses: Bus[]; total: number }>(`/buses/search?${q.toString()}`);
};

export const getBus = (id: string) => request<Bus>(`/buses/${id}`);

export const bookBus = (bus_id: string, seat_numbers: number[]) =>
  request<BusBooking>("/buses/book", {
    method: "POST",
    body: JSON.stringify({ bus_id, seat_numbers }),
  });

export const verifyBusPayment = (data: {
  booking_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => request<BusBooking>("/buses/verify-payment", { method: "POST", body: JSON.stringify(data) });

export const getMyBusBookings = (page = 1, limit = 10) =>
  request<{ bookings: BusBooking[]; total: number; page: number; limit: number }>(
    `/buses/bookings/?page=${page}&limit=${limit}`
  );

export const getBusBooking = (id: string) => request<BusBooking>(`/buses/bookings/${id}`);
export const cancelBusBooking = (id: string) => request<BusBooking>(`/buses/bookings/${id}/cancel`, { method: "POST" });

export const submitReview = (data: {
  booking_id: string;
  hotel_id: string;
  rating: number;
  review_text?: string;
}) => request<Review>("/reviews/", { method: "POST", body: JSON.stringify(data) });

export const getHotelReviews = (hotel_id: string, page = 1, limit = 10) =>
  request<ReviewListResponse>(`/reviews/hotel/${hotel_id}?page=${page}&limit=${limit}`);

export const getMyReviews = (page = 1, limit = 10) =>
  request<ReviewListResponse>(`/reviews/?page=${page}&limit=${limit}`);

export const deleteReview = (id: string) => request<void>(`/reviews/${id}`, { method: "DELETE" });

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
  images?: string[];
}

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
  is_early_check_in_available: boolean;
  is_late_check_in_available: boolean;
  is_late_check_out_available: boolean;
  is_pay_at_hotel_available: boolean;
  review_count: number;
  property_type: string;
  check_in_time: string;
  check_out_time: string;
}

export interface BookingCreate {
  hotel_id: string;
  room_type_name: string;
  check_in: string;
  check_out: string;
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
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "PAYMENT_PENDING" | "FAILED";
  created_at: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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
  status: "CONFIRMED" | "CANCELLED" | "PAYMENT_PENDING" | "FAILED";
  created_at: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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
