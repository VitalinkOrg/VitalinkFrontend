import type { IdType, Package } from "~/types";
import type { Supplier } from "./supplier";

export interface Customer {
  id: string;
  card_id: string;
  name: string;
  email: string;
  user_name: string;
  phone_number: string;
  gender: string | null;
  birth_date: string | null;
  country_iso_code: string;
  province: string;
  address: string;
  city_name: string;
  postal_code: string;
  role_code: string;
  is_deleted: number;
  is_active_from_email: number;
  account_status: string;
  fail_login_number: number;
  forgot_password_token: string | null;
  active_register_token: string | null;
  latitude: string | null;
  longitude: string | null;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  last_login_at: string;
  login_ip_address: string;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  id_type: IdType;
}

export interface ServicesOffer {
  ASSESSMENT_DETAILS: string[];
}

interface ReservationType {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export type AppointmentStatusCode =
  | "CANCEL_APPOINTMENT"
  | "PENDING_VALORATION_APPOINTMENT"
  | "PENDING_PROCEDURE"
  | "CONFIRM_PROCEDURE"
  | "CONCRETED_APPOINTMENT"
  | "VALUED_VALORATION_APPOINTMENT"
  | "CONFIRM_VALIDATION_APPOINTMENT"
  | "VALUATION_PENDING_VALORATION_APPOINTMENT"
  | "WAITING_PROCEDURE";

export interface AppointmentStatus {
  id: number;
  code: AppointmentStatusCode;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface PaymentStatus {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface AppointmentType {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface Appointment {
  id: number;
  customer: Customer;
  proforma_file_code: string | null;
  appointment_date: string;
  appointment_hour: string;
  appointment_qr_code: string;
  application_date: string;
  user_description: string | null;
  recommendation_post_appointment: string | null;
  diagnostic: string | null;
  is_for_external_user: number;
  phone_number_external_user: string | null;
  supplier: Supplier;
  package: Package;
  reservation_type: ReservationType;
  appointment_status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  appointment_result: AppointmentResult | null;
  appointment_type: AppointmentType;
  price_procedure: string;
  price_valoration_appointment: string;
  appointment_credit: any | null;
  created_date: string;
  updated_date: string;
}

export interface AppointmentResult {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}
