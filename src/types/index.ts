export type UserRole = 'business' | 'customer';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'online' | 'onsite';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type Plan = 'free' | 'basic' | 'pro';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: Date;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  openingHours: OpeningHours;
  plan: Plan;
  stripeCustomerId?: string;
  monthlyBookingCount: number;
  createdAt: Date;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  color: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  email: string;
  avatar?: string;
  services: string[];
  workingHours: OpeningHours;
  isActive: boolean;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  start: string;
  end: string;
}

export interface Booking {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  employeeId?: string;
  employeeName?: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
}

export interface BlockedTime {
  id: string;
  businessId: string;
  employeeId?: string;
  startTime: Date;
  endTime: Date;
  reason: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export const PLAN_LIMITS: Record<Plan, { employees: number; bookingsPerMonth: number; price: number }> = {
  free:  { employees: 1,         bookingsPerMonth: 50,       price: 0  },
  basic: { employees: 3,         bookingsPerMonth: Infinity, price: 29 },
  pro:   { employees: Infinity,  bookingsPerMonth: Infinity, price: 59 },
};

export const BUSINESS_CATEGORIES = [
  'Friseur', 'Kosmetik & Beauty', 'Massagepraxis', 'Nagelstudio',
  'Tattoo & Piercing', 'Physiopraxis', 'Zahnarzt', 'Allgemeinarzt',
  'Psychologe', 'Yoga & Fitness', 'Fotografie', 'Beratung', 'Sonstiges',
];

export const DAY_NAMES: Record<keyof OpeningHours, string> = {
  monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch',
  thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag', sunday: 'Sonntag',
};

