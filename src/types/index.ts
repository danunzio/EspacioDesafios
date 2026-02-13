// User roles
export type UserRole = "admin" | "professional";

// Profile type
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  phone?: string;
  specialization?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

// Child type
export interface Child {
  id: string;
  full_name: string;
  birth_date: string;
  cedula?: string;
  address?: string;
  phone?: string;
  email?: string;
  mother_name?: string;
  mother_phone?: string;
  mother_email?: string;
  father_name?: string;
  father_phone?: string;
  father_email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  school?: string;
  grade?: string;
  diagnosis?: string;
  referral_source?: string;
  referral_doctor?: string;
  therapy_start_date?: string;
  observation_date?: string;
  assigned_professional_id?: string;
  fee_value: number;
  is_active: boolean;
  discharge_date?: string;
  discharge_reason?: string;
  created_at: string;
  updated_at: string;
}

// Module values type
export interface ModuleValue {
  id: string;
  module_name: string;
  fee_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Monthly session type
export interface MonthlySession {
  id: string;
  child_id: string;
  professional_id: string;
  month: number;
  year: number;
  session_count: number;
  fee_value: number;
  total_amount: number;
  is_paid: boolean;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

// Liquidation type
export interface Liquidation {
  id: string;
  professional_id: string;
  month: number;
  year: number;
  total_sessions: number;
  total_amount: number;
  professional_percentage: number;
  professional_amount: number;
  clinic_amount: number;
  is_paid: boolean;
  payment_date?: string;
  payment_receipt_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

// Commission payment type
export interface CommissionPayment {
  id: string;
  liquidation_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  receipt_url?: string;
  observations?: string;
  created_at: string;
}

// Session statistics type
export interface SessionStatistics {
  professional_id: string;
  professional_name: string;
  month: number;
  year: number;
  total_sessions: number;
  total_amount: number;
  professional_amount: number;
  clinic_amount: number;
  percentage: number;
}

// Month names in Spanish
export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

// Module names
export const MODULE_NAMES = [
  "Estimulación Temprana",
  "Integración Sensorial",
  "Psicomotricidad",
  "Lenguaje",
  "Aprendizaje",
  "Conducta",
  "Desarrollo Social",
  "Terapia Ocupacional",
  "Fisioterapia",
  "Psicología",
  "Musicoterapia",
] as const;

export type ModuleName = (typeof MODULE_NAMES)[number];
