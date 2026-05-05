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
  check_in_time?: string;
  check_out_time?: string;
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

export interface UserProfile {
  id: string;
  role: string;
  phone?: string;
  email?: string;
  name?: string;
  is_onboarded?: boolean;
  is_active: boolean;
  must_change_password?: boolean;
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

export interface Organization {
  id: string;
  name: string;
  email: string;
  gst_number: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  wallet_balance: number;
  adminIds: string[];
  managerIds: string[];
  created_at?: string;
}

export interface OrgEmployee {
  user_id: string;
  email: string;
  role: "admin" | "manager" | "senior_manager" | "employee";
  corporate_role?: string;
  orgId: string;
  employee_id?: string;
  department?: string;
  cost_center?: string;
  name?: string;
  manager_id?: string;
  senior_manager_id?: string;
  spending_limit?: number;
}

export interface OrgCreate {
  name: string;
  email: string;
  gst_number: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface EmployeeAdd {
  email: string;
  name?: string;
  password?: string;
  role: "admin" | "manager" | "senior_manager" | "employee";
  employee_id?: string;
  department?: string;
  cost_center?: string;
  manager_id?: string;
  senior_manager_id?: string;
  spending_limit?: number;
}

export interface WishlistItem {
  id: string;
  item_id: string;
  item_type: "hotel" | "bus";
  created_at: string;
  item_details: Hotel | Bus;
}
