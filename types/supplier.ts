import type { IdType, IUdc, Procedures } from "~/types";

export interface Supplier {
  id: number;
  id_type: IdType;
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
  latitude: string | null;
  longitude: string | null;
  experience_years: number | null;
  patients_number: number | null;
  is_hospital: boolean;
  our_history: string | null;
  mission: string | null;
  vision: string | null;
  code_card_id_file: string | null;
  code_medical_license_file: string | null;
  gender: string | null;
  medical_type: MedicalType;
  legal_representative: LegalRepresentative;
  created_date: string;
  updated_date: string | null;
  date_availability: string | null;
  hour_availability: string | null;
  location_number: number | null;
  reviews: Review[];
  review_details_summary: ReviewDetailSummary[];
  services: Service[];
  services_names: string[];
  availabilities: Availability[];
  locations: Location[];
  is_deleted: 0 | 1;
}

export interface LegalRepresentative {
  id: number;
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
  is_deleted: 0 | 1;
  is_active_from_email: 0 | 1;
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

export interface Service {
  id: number;
  medical_specialty: IUdc;
  procedures: Procedures[];
}

export interface MedicalSpecialty {
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

export interface Availability {
  id: number;
  weekday: string;
  from_hour: string;
  to_hour: string;
  location: Location;
}

export interface DoctorReview {
  customer: string;
  comment: string;
  stars_average: number;
  is_annonymous: boolean;
}

export interface AssessmentDetail {
  id: number;
  code: string;
  name: string;
  type: string;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface Location {
  id: number;
  name: string;
  country_iso_code: string;
  province: string;
  address: string;
  city_name: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  is_deleted: number;
  created_date: string;
  updated_date: string;
}

export interface ReviewDetail {
  id: number;
  code: string;
  name: string;
  type: string;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface MedicalType {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string | null;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: 0 | 1;
}

export interface ReviewDetail {
  id: number;
  code: string;
  name: string;
  type: string;
  father_code: string | null;
  value1: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: number;
}

export interface Review {
  customer: string;
  comment: string;
  stars_average: number;
  is_annonymous: boolean;
}

export interface ReviewDetailSummary {
  [key: string]: any;
}
