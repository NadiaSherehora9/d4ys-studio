export type TrainingType = "CHOREO" | "JAZZ-FUNK";

export type SessionMode = "group" | "personal";

export type Role = "user" | "admin";

export type BookingStatus = "pending" | "confirmed" | "canceled" | "attended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar_url?: string;
}

export interface Trainer {
  id: string;
  name: string;
  styles: TrainingType[];
  bio?: string;
  avatarUrl?: string;
}

export interface Session {
  id: string;
  date: string;
  time: string;
  type: TrainingType;
  trainerId: string;
  durationMinutes: number;
  mode: SessionMode;
  capacity: number;
  active: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  active: boolean;
}

export interface Booking {
  id: string;
  sessionId: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  status: BookingStatus;
  createdAt: string;
}

// DB Row Interfaces (snake_case)
export interface BookingRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  session_id?: string | null;
  user_id?: string | null;
}

export interface SessionRow {
  id: string;
  date: string | null;
  time: string;
  type: string;
  trainer_id: string | null;
  duration_minutes: number;
  mode: SessionMode;
  capacity: number;
  active: boolean;
}

export interface PricingPlanRow {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string | null;
  features: string[] | null;
  active: boolean;
}

export interface CalendarSettings {
  minDaysAhead: number;
  maxDaysAhead: number;
}

export interface SessionFormState {
  id?: string;
  date: string;
  time: string;
  type: string;
  trainerId: string;
  durationMinutes: number;
  mode: "group" | "personal";
  capacity: number;
  active: boolean;
}
