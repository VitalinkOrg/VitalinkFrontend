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

export interface DoctorReview {
  customer: string;
  comment: string;
  stars_average: number;
  is_annonymous: boolean;
}

export interface DoctorReviewSummary {
  [key: string]: any;
}

export interface Procedure {
  procedure: {
    id: number;
    code: string;
    name: string;
    type: string;
    father_code: string;
    value1: string | null;
    created_date: string;
    updated_date: string | null;
    is_deleted: number;
  };
  packages: Array<{
    id: number;
    product: {
      id: number;
      code: string;
      name: string;
      type: string;
      description: string;
      father_code: string | null;
      value1: string;
      created_date: string;
      updated_date: string | null;
      is_deleted: number;
    };
    reference_price: number;
    discount: number;
    discounted_price: number;
    services_offer: {
      ASSESSMENT_DETAILS: string[];
    };
    is_king: number;
    observations: string;
    postoperative_assessments: string | null;
  }>;
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

export interface Service {
  id: number;
  medical_specialty: MedicalSpecialty;
  procedures: Procedure[];
}

export interface DoctorLocation {
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

export interface Availability {
  id: number;
  weekday: string;
  from_hour: string;
  to_hour: string;
  location: DoctorLocation;
}

export interface Doctor {
  id: number;
  card_id: string;
  num_medical_enrollment: string;
  name: string;
  phone_number: string;
  email: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  postal_code: string;
  profile_picture_url: string;
  description: string;
  address: string;
  experience_years: number;
  patients_number: number;
  is_hospital: boolean;
  services: Service[];
  availabilities: Availability[];
  locations: DoctorLocation[];
  reviews: DoctorReview[];
  review_details_summary: DoctorReviewSummary[];
}

export interface DoctorReview {
  customer: string;
  comment: string;
  stars_average: number;
  is_annonymous: boolean;
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

export interface Doctor {
  id: number;
  card_id: string;
  num_medical_enrollment: string;
  name: string;
  phone_number: string;
  email: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  postal_code: string;
  profile_picture_url: string;
  description: string;
  address: string;
  experience_years: number;
  patients_number: number;
  is_hospital: boolean;
  services: Service[];
  availabilities: Availability[];
  locations: Location[];
  reviews: DoctorReview[];
  review_details_summary: Record<string, any>[];
}

export interface Service {
  id: number;
  medical_specialty: MedicalSpecialty;
  procedures: Procedure[];
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

export interface Procedure {
  procedure: {
    id: number;
    code: string;
    name: string;
    type: string;
    father_code: string;
    value1: string | null;
    created_date: string;
    updated_date: string | null;
    is_deleted: number;
  };
  packages: Package[];
}

export interface Package {
  id: number;
  product: Product;
  reference_price: number;
  discount: number;
  discounted_price: number;
  services_offer: {
    ASSESSMENT_DETAILS: string[];
  };
  is_king: number;
  observations: string;
  postoperative_assessments: string | null;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  father_code: string | null;
  value1: string;
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
