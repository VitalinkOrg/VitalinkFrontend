interface IdType {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

interface Customer {
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

interface LegalRepresentative {
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

interface Supplier {
  id: number;
  card_id: string;
  num_medical_enrollment: string | null;
  name: string;
  phone_number: string;
  email: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  postal_code: string;
  profile_picture_url: string | null;
  description: string;
  address: string;
  street_number: string | null;
  floor: string | null;
  door_number: string | null;
  latitude: string;
  longitude: string;
  experience_years: number | null;
  patients_number: number | null;
  is_hospital: boolean;
  our_history: string;
  mission: string;
  vision: string;
  code_card_id_file: string | null;
  code_medical_license_file: string | null;
  gender: string | null;
  is_deleted: number;
  created_date: string;
  updated_date: string;
  legal_representative: LegalRepresentative;
  id_type: IdType;
}

interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  father_code: string;
  value1: string;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

interface Procedure {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

interface ServicesOffer {
  ASSESSMENT_DETAILS: string[];
}

interface Package {
  id: number;
  discount: string;
  postoperative_assessments: string | null;
  services_offer: ServicesOffer;
  is_king: number;
  observations: string;
  is_deleted: number;
  created_date: string;
  updated_date: string;
  product: Product;
  procedure: Procedure;
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

interface AppointmentStatus {
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

interface PaymentStatus {
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

interface AppointmentType {
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
  appointment_result: string | null;
  appointment_type: AppointmentType;
  price_procedure: string;
  price_valoration_appointment: string;
  appointment_credit: any | null;
  created_date: string;
  updated_date: string;
}
