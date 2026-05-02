const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
import { HARDCODED_HOTELS, HARDCODED_BUSES } from "./hardcodedData";
import { 
  Hotel, Bus, UserProfile, Booking, BookingCreate, BusBooking, 
  Review, ReviewListResponse, Organization, OrgEmployee, OrgCreate, EmployeeAdd, WishlistItem, RoomType 
} from "./types";

export type { 
  Hotel, Bus, UserProfile, Booking, BookingCreate, BusBooking, 
  Review, ReviewListResponse, Organization, OrgEmployee, OrgCreate, EmployeeAdd, WishlistItem, RoomType 
};

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

export const login = async (email: string, password: string) => {
  try {
    const res = await request<{ message: string; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res;
  } catch (err) {
    console.warn("Backend login failed, checking hardcoded credentials.");
    if (email === "admin@acme.com" && password === "admin123") {
      if (typeof window !== "undefined") localStorage.setItem("mock_email", email);
      return { message: "Login successful (mock admin)", role: "admin" };
    }
    if (email === "user@yatrasqure.com" && password === "password123") {
      if (typeof window !== "undefined") localStorage.setItem("mock_email", email);
      return { message: "Login successful (mock user)", role: "user" };
    }
    throw err;
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mock_email");
    sessionStorage.removeItem("selectedEmployeeId");
  }
  return request<{ message: string }>("/auth/logout", { method: "POST" });
};
export const getProfile = async () => {
  try {
    return await request<UserProfile>("/auth/");
  } catch (err) {
    console.warn("Backend profile fetch failed, checking mock session.");
    // In a real app, we'd check a token. For this demo, we'll return a profile if the user was just "logged in" 
    // via our mock logic (simulated by checking if the email matches our hardcoded ones).
    // Note: Since we don't have a persistent mock session here, this is mainly for the initial transition.
    
    // Return admin or user depending on the identifier used (mock)
    const mockEmail = typeof window !== "undefined" ? localStorage.getItem("mock_email") : null;
    if (!mockEmail) throw err;
    
    if (mockEmail === "user@yatrasqure.com") {
      return {
        id: "dummy_user_123",
        email: "user@yatrasqure.com",
        name: "Normal User",
        role: "user",
        is_active: true
      } as any;
    }

    if (mockEmail === "admin@acme.com") {
      return {
        id: "dummy_admin_456",
        email: "admin@acme.com",
        name: "Acme Admin",
        role: "admin",
        corporate_role: "admin",
        is_active: true,
        organization: { id: "ORG123", name: "Acme Corp Ltd." }
      } as any;
    }
    
    throw err;
  }
};
export const refreshToken = () => request<{ message: string }>("/auth/refresh", { method: "POST" });
export const changePassword = (old_password: string, new_password: string) =>
  request<{ message: string }>("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({ old_password, new_password })
  });

// FIX #4: For corporate employees on first login — requires old temporary password
export const forceChangePassword = (old_password: string, new_password: string) =>
  request<{ message: string }>("/auth/force-change-password", {
    method: "POST",
    body: JSON.stringify({ old_password, new_password })
  });

export const searchHotels = async (params: {
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
  try {
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
    return await request<{ hotels: Hotel[]; total: number }>(`/hotels/search?${q.toString()}`);
  } catch (err) {
    console.warn("Backend failed, using hardcoded hotels:", err);
    let hotels = [...HARDCODED_HOTELS];
    if (params.city) {
      hotels = hotels.filter(h => h.city.toLowerCase().includes(params.city!.toLowerCase()));
    }
    if (params.min_price) {
      hotels = hotels.filter(h => h.price_per_night >= params.min_price!);
    }
    if (params.max_price) {
      hotels = hotels.filter(h => h.price_per_night <= params.max_price!);
    }
    return { hotels, total: hotels.length };
  }
};

export const getHotel = async (id: string) => {
  try {
    return await request<Hotel>(`/hotels/${id}`);
  } catch (err) {
    const hotel = HARDCODED_HOTELS.find(h => h.id === id);
    if (hotel) return hotel;
    throw err;
  }
};

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

export const searchBuses = async (params: {
  from_city?: string;
  to_city?: string;
  journey_date?: string;
  bus_type?: string;
  min_price?: number;
  max_price?: number;
}) => {
  try {
    const q = new URLSearchParams();
    if (params.from_city) q.set("from_city", params.from_city);
    if (params.to_city) q.set("to_city", params.to_city);
    if (params.journey_date) q.set("journey_date", params.journey_date);
    if (params.bus_type) q.set("bus_type", params.bus_type);
    if (params.min_price !== undefined) q.set("min_price", String(params.min_price));
    if (params.max_price !== undefined) q.set("max_price", String(params.max_price));
    return await request<{ buses: Bus[]; total: number }>(`/buses/search?${q.toString()}`);
  } catch (err) {
    console.warn("Backend failed, using hardcoded buses:", err);
    let buses = [...HARDCODED_BUSES];
    if (params.from_city) {
      buses = buses.filter(b => b.from_city.toLowerCase().includes(params.from_city!.toLowerCase()));
    }
    if (params.to_city) {
      buses = buses.filter(b => b.to_city.toLowerCase().includes(params.to_city!.toLowerCase()));
    }
    return { buses, total: buses.length };
  }
};

export const getBus = async (id: string) => {
  try {
    return await request<Bus>(`/buses/${id}`);
  } catch (err) {
    const bus = HARDCODED_BUSES.find(b => b.id === id);
    if (bus) return bus;
    throw err;
  }
};

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

// Wishlist
export const getWishlist = () => request<WishlistItem[]>("/wishlist/");

export const toggleWishlist = (item_id: string, item_type: "hotel" | "bus") =>
  request<{ message: string; is_wishlisted: boolean }>("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ item_id, item_type }),
  });

// Interfaces have been moved to types.ts to avoid circular dependencies

export const registerOrganization = async (data: OrgCreate) => {
  try {
    return await request<Organization>("/corporate/organization", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn("Backend failed, using mock register organization.");
    return {
      id: "ORG123",
      name: data.name,
      email: data.email,
      gst_number: data.gst_number,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      wallet_balance: 500000,
      adminIds: ["dummy_admin_456"],
      managerIds: [],
      created_at: new Date().toISOString()
    } as Organization;
  }
};

export const getMyOrganization = async () => {
  try {
    return await request<Organization>("/corporate/organization/");
  } catch (err) {
    console.warn("Backend failed, using mock organization.");
    return {
      id: "ORG123",
      name: "YatraSqure India Solutions",
      email: "corporate@yatrasqure.in",
      gst_number: "27AAAAA0000A1Z5",
      address: "DLF Cyber City, Tower B",
      city: "Gurugram",
      state: "Haryana",
      country: "India",
      wallet_balance: 750000,
      adminIds: ["dummy_admin_456"],
      managerIds: [],
      created_at: "2026-05-02T10:00:00Z"
    } as Organization;
  }
};

let MOCK_EMPLOYEES: (OrgEmployee & { phone?: string; gender?: string })[] = [
  { user_id: "EMP001", email: "aarav.sharma@yatrasqure.in", role: "admin", orgId: "ORG123", name: "Aarav Sharma", employee_id: "TX-IND-101", department: "Executive", cost_center: "HQ-DEL", phone: "9876543210", gender: "Male" },
  { user_id: "EMP002", email: "ishaan.verma@yatrasqure.in", role: "employee", orgId: "ORG123", name: "Ishaan Verma", employee_id: "TX-IND-205", department: "Sales", cost_center: "SALES-MUM", phone: "9123456789", gender: "Male" },
  { user_id: "EMP003", email: "ananya.iyer@yatrasqure.in", role: "employee", orgId: "ORG123", name: "Ananya Iyer", employee_id: "TX-IND-302", department: "Engineering", cost_center: "ENG-BLR", phone: "8877665544", gender: "Female" },
];

export const addEmployee = async (data: EmployeeAdd) => {
  try {
    return await request<{ message: string; user_id: string; password?: string }>(
      "/corporate/organization/employees",
      { method: "POST", body: JSON.stringify(data) }
    );
  } catch (err) {
    console.warn("Backend failed, using mock add employee.");
    const newUser: OrgEmployee = {
      user_id: "EMP" + Math.floor(Math.random() * 1000).toString(),
      email: data.email,
      role: data.role as any,
      orgId: "ORG123",
      name: data.name,
      employee_id: data.employee_id,
      department: data.department,
      cost_center: data.cost_center
    };
    MOCK_EMPLOYEES.push(newUser);
    return { message: "Employee added successfully (mock)", user_id: newUser.user_id, password: "temp_password_123" };
  }
};

export const getEmployees = async () => {
  try {
    return await request<OrgEmployee[]>("/corporate/organization/employees");
  } catch (err) {
    console.warn("Backend failed, using mock employees.");
    return [...MOCK_EMPLOYEES];
  }
};

export const updateEmployeeRole = async (user_id: string, role: string) => {
  try {
    return await request<{ message: string }>(
      `/corporate/organization/employees/${user_id}/role`,
      { method: "PUT", body: JSON.stringify({ role }) }
    );
  } catch (err) {
    console.warn("Backend failed, using mock update role.");
    const emp = MOCK_EMPLOYEES.find(e => e.user_id === user_id);
    if (emp) emp.role = role as any;
    return { message: "Employee role updated successfully (mock)" };
  }
};

export const removeEmployee = async (user_id: string) => {
  try {
    return await request<{ message: string }>(
      `/corporate/organization/employees/${user_id}`,
      { method: "DELETE" }
    );
  } catch (err) {
    console.warn("Backend failed, using mock remove employee.");
    MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e.user_id !== user_id);
    return { message: "Employee removed successfully (mock)" };
  }
};
