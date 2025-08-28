export interface Room {
  id: string;
  number: string;
  type: "single" | "double" | "double_with_balcony" | "luxury";
  status:
    | "available"
    | "occupied"
    | "booked"
    | "reserved"
    | "maintenance"
    | "cleaning"
    | "checking_in"
    | "checking_out"
    | "blocked"
    | "maintenance"
    | "cleaning";
  floor: number;
  building?: string;
  position: { row: number; col: number };
  capacity?: number;
  currentOccupancy?: number;
  amenities?: string[];
  pricePerNight?: number;
  blockReason?: string;
  blockedAt?: Date;
}

export interface Booking {
  id: string;
  roomId: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestAge: number;
  guestAddress: string;
  guestGender: "male" | "female";
  checkInDate: Date;
  checkOutDate: Date;
  checkInTime?: string; // "09:00", "14:00", "18:00"
  checkOutTime?: string; // "09:00", "14:00", "18:00"
  duration: number; // days
  isHalfDay?: boolean;
  halfDayType?: "morning" | "afternoon";
  status:
    | "active"
    | "completed"
    | "cancelled"
    | "confirmed"
    | "checked_in"
    | "checking_out";
  services?: Service[];
  totalAmount?: number;
  voucherNumber?: string;
  secondGuestId?: string;
  secondGuestName?: string;
  secondGuestGender?: "male" | "female";
  createdAt: Date;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  dateOfBirth: Date;
  address: string;
  passportNumber: string;
  gender: "male" | "female";
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  checkInDate?: Date;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category:
    | "medical"
    | "spa"
    | "dining"
    | "entertainment"
    | "transport"
    | "other";
  duration?: number; // minutes
}

export interface Folio {
  id: string;
  bookingId: string;
  guestId: string;
  roomNumber: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  services: FolioService[];
  roomCharges: number;
  serviceCharges: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "open" | "closed" | "paid";
  createdAt: Date;
}

export interface FolioService {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: Date;
}

export interface BookingOperation {
  id: string;
  type: "early_checkout" | "extend_stay" | "room_transfer";
  roomId: string;
  guestId: string;
  scheduledDate: Date;
  status: "pending" | "completed";
}

export interface DatabaseConnection {
  id: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "manager" | "reception" | "viewer";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Organization {
  id: string;
  officialName: string;
  unofficialName?: string;
  contactPersonName: string;
  contactPhone: string;
  contractNumber: string;
  issuedVouchers: string[];
  createdAt: Date;
}
