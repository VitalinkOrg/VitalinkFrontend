interface IApiResponse<T = any> {
  status: IStatus;
  info: string;
  data?: T;
}

interface IApiErrorData {
  errno?: string;
  code?: string;
  message?: string;
}

interface IApiErrorResponse {
  status: IStatus;
  info: string;
  data: string | IApiErrorData | null;
}

interface IUsableAPI<T> {
  response: Ref<T | undefined>;
  request: () => Promise<void>;
  error: Ref<IApiErrorResponse | null>;
  loading: Ref<boolean>;
}

interface IStatus {
  id: number;
  message: string;
  http_code: number;
}

interface ISupplierParams {
  specialty_code?: string;
  procedure_code?: string;
  min_stars?: number;
  province?: string;
  min_price?: number;
  max_price?: number;
  size?: number;
  page?: number;
}

interface IUdcParams {
  id: number;
  size: number;
  type: UdcType;
  father_code: string;
  code: string;
  supplier_id: number;
}

type UdcType =
  | "MEDICAL_SPECIALTY"
  | "MEDICAL_PRODUCT"
  | "MEDICAL_PROCEDURE"
  | "ID_TYPE"
  | "MEDICAL_TYPE"
  | "REVIEW"
  | "ASSESSMENT_DETAIL"
  | "ODONTOLOGHY_MEDICAL"
  | "ASSESSMENT";

interface IPackage {
  id: number;
  specialty: ISpecialty;
  product: IUdc;
  procedure: IUdc;
  discount: number;
  reference_price: string;
  services_offer: IServicesOffer;
  observations: string;
  postoperative_assessments: string;
  is_king: number;
  is_deleted: number;
  created_date: Date;
  updated_date: Date;
}

interface IPackageCreationRequest {
  specialty_id: number;
  procedure_code: string;
  product_code: string;
  discount: number;
  reference_price: number;
  services_offer: IServicesOffer;
  is_king: number;
  observations: string;
  postoperative_assessments: number;
}

interface IPackageUpdateRequest extends Partial<IPackageCreationRequest> {}

interface ISpecialty {
  id: number;
  created_date: Date;
  supplier: ISupplierSystem;
  medical_specialty: IUdc;
}

interface ILegalRepresentative {
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
  last_login_at: Date;
  login_ip_address: string;
  created_at: Date;
  updated_at: Date;
  verified_at: string | null;
}

interface ISupplierSystem {
  id: number;
  id_type: IUdc;
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
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
  latitude: string;
  longitude: string;
  experience_years: number | null;
  patients_number: number | null;
  is_hospital: boolean;
  our_history: string | null;
  mission: string | null;
  vision: string | null;
  code_card_id_file: string | null;
  code_medical_license_file: string | null;
  gender: string | null;
  medical_type: IUdc | null;
  legal_representative: ILegalRepresentative;
  created_date: string;
  updated_date: string;
  services: ISupplierService[];
}

interface ISupplierMain {
  id: number;
  id_type: IUdc;
  card_id: string;
  num_medical_enrollment: string | null;
  name: string;
  phone_number: string;
  email: string;
  province: string;
  city_name: string;
  postal_code: string;
  profile_picture_url: string | null;
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
  latitude: string;
  longitude: string;
  experience_years: number | null;
  patients_number: number | null;
  is_hospital: boolean;
  our_history: string | null;
  mission: string | null;
  vision: string | null;
  code_card_id_file: string | null;
  code_medical_license_file: string | null;
  gender: string | null;
  legal_representative: ILegalRepresentative;
  date_availability: string | null;
  hour_availability: string | null;
  location_number: number;
  search_procedure_name: string;
  search_reference_price: string;
  stars_by_supplier: number;
  review_quantity_by_supplier: number;
  services_names: string[];
}

interface ISupplierDetail {
  id: number;
  id_type: IUdc;
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
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
  latitude: string;
  longitude: string;
  experience_years: number | null;
  patients_number: number | null;
  is_hospital: boolean;
  our_history: string | null;
  mission: string | null;
  vision: string | null;
  code_card_id_file: string | null;
  code_medical_license_file: string | null;
  gender: string | null;
  medical_type: MedicalType | null;
  legal_representative: ILegalRepresentative;
  created_date: string;
  updated_date: string;
  date_availability: string | null;
  hour_availability: string | null;
  location_number: number;
  reviews: any[];
  review_details_summary: any[];
  services: ISupplierService[];
  availabilities: IAvailability[];
  locations: ILocation[];
}

interface ISupplierService {
  id: number;
  medical_specialty: IUdc;
  procedures: IProcedures[];
}

interface IProcedures {
  procedure: IUdc;
  packages: IPackage[];
}

interface ICreateSupplierRequest {
  id_type: string;
  card_id: string;
  email: string;
  medical_type_code: string;
  legal_representative: string;
  num_medical_enrollment: string;
  name: string;
  phone_number: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  profile_picture_url: string;
  description: string;
  is_hospital: boolean;
  code_card_id_file: string;
  code_medical_license_file: string;
  postal_code?: string;
  gender?: string;
  address?: string;
  street_number?: string;
  floor?: string;
  door_number?: string;
  latitude?: string;
  longitude?: string;
  experience_years?: string;
  patients_number?: string;
  our_history?: string;
  mission?: string;
  vision?: string;
}

interface ISupplierUpdateRequest extends Partial<ICreateSupplierRequest> {}

interface IServicesOffer {
  ASSESSMENT_DETAILS: string[];
}

interface ILocation {
  id: number;
  name: string;
  country_iso_code: CountryisoCode;
  province: Province;
  address: string;
  city_name: string;
  postal_code: string | null | string;
  latitude: string;
  longitude: string;
  legal_representative: string | null;
  created_date: Date;
  updated_date: Date;
}

interface ILocationCreationRequest {
  name: string;
  country_iso_code: string;
  province: string;
  address: string;
  city_name: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  finance_entity: string;
  supplier_id: number;
}

interface ILocationUpdateRequest extends Partial<ILocationCreationRequest> {}

interface IAvailability {
  id: number;
  supplier: ISupplierSystem;
  location: ILocation;
  weekday: string;
  from_hour: string;
  to_hour: string;
  created_date: Date;
  updated_date: Date;
}

interface IAvailabilityCreationRequest {
  supplier_id: number;
  location_id: number;
  weekday: string;
  from_hour: string;
  to_hour: string;
}

interface IAvailabilityUpdateRequest
  extends Partial<IAvailabilityCreationRequest> {}

interface IUdc<T = string> {
  id: number;
  supplier_id?: number | null;
  code: T;
  father_code: string | null;
  name: string;
  type: string;
  value1: string | null; // Precio Producto
  value2: string | null; // Precio cita valoracion producto
  is_deleted?: number;
  created_date?: string | null;
  updated_date: string | null;
}

interface ICreateUdcRequest {
  supplier_id: number;
  father_code: string;
  name: string;
  type: string;
  description: string;
  value1: string;
  value2: string;
  code?: string;
}

interface IUdcUpdateRequest extends Partial<ICreateUdcRequest> {}

interface ISpecialtyBySupplier {
  id: number;
  supplier: ISupplierSystem;
  medical_specialty: IUdc;
  created_date: Date;
}

interface ICreateSpecialtyBySupplierRequest {
  supplier_id: number;
  medical_specialty_code: string;
}

interface ISpecialtyBySupplierUpdateRequest
  extends Partial<ICreateSpecialtyBySupplierRequest> {}

type ExperienceTypeCode =
  | "EXPERIENCE"
  | "EDUCATION"
  | "CERTIFICATION"
  | "AWARD_RECOGNITION"
  | "ACCREDITATION"
  | "SCIENTIFIC_PUBLICATION"
  | "CONFERENCE_PARTICIPATION"
  | "MEDICAL_RESEARCH";

interface ICertificationExperience {
  id: number;
  supplier_id: number;
  start_date: string;
  end_date?: string;
  name: string;
  company_name: string;
  province?: string;
  address?: string;
  city_name?: string;
  country_iso_code?: string;
  is_currently?: boolean;
  url_document?: string;
  experience_type_code: ExperienceTypeCode;
}

interface ICreateCertificationExperienceRequest {
  supplier_id: number;
  start_date: string;
  end_date?: string;
  name: string;
  company_name: string;
  province?: string;
  address?: string;
  city_name?: string;
  country_iso_code?: string;
  is_currently?: boolean;
  url_document?: string;
  experience_type_code: ExperienceTypeCode;
}

interface IUpdateCertificationExperienceRequest
  extends Partial<Omit<ICreateCertificationExperienceRequest, "supplier_id">> {}

interface IGetAllCertificationExperienceParams {
  supplier_id?: number;
  experience_type_code?: ExperienceTypeCode;
}

interface Pagination {
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

interface IUser {
  id: string;
  card_id: string;
  id_type: IUdc;
  name: string;
  user_name: string | null;
  email: string;
  phone_number: string;
  country_iso_code: string;
  city_name: string | null;
  postal_code: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  gender: string | null;
  birth_date: string | null;
  role: string;
  finance_entity: string | null;
  code_contract: string;
  language: string;
  profile_picture_url: string | null;
  account_status: string;
}

interface ICreateUserRequest {
  card_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  position: string;
  bio: string;
  phone_number: string;
  birth_date: string;
  gender: string;
  country_iso_code: string;
  city_name: string;
  postal_code: string;
  address: string;
  latitude: number;
  longitude: number;
  language: string;
  profile_picture_url: string | null;
  role_code: string;
  is_active_from_email: boolean;
  account_status: string;
}

interface IUserUpdateRequest extends Partial<ICreateUserRequest> {}

interface ILoginRequest {
  email: string;
  password: string;
}

interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  screens_access: any[];
}

interface IRegisterRequest {
  card_id: string;
  id_type: string;
  name: string;
  email: string;
  password: string;
  gender: string;
  role_code: string;
  finance_entity?: string;
  user_name?: string;
  phone_number?: string;
  birth_date?: string;
  country_iso_code?: string;
  province?: string;
  address?: string;
  city_name?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  profile_picture_url?: string;
}

interface IRecoverUserRequest {
  email: string;
}

interface IForgotPasswordRequest {
  email: string;
}

interface IResetPasswordRequest {
  password: string;
}

interface ICustomer {
  id: string;
  card_id: string;
  name: string;
  email: string;
  user_name: string | null;
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
  last_login_at: Date;
  login_ip_address: string;
  created_at: Date;
  updated_at: Date;
  verified_at: string | null;
  id_type: IUdc;
}

interface IAppointment {
  id: number;
  customer: ICustomer;
  proforma_file_code: string | null;
  appointment_date: Date | null;
  appointment_hour: string | null;
  appointment_qr_code: string;
  application_date: Date;
  user_description: string | null;
  recommendation_post_appointment: string | null;
  diagnostic: string | null;
  is_for_external_user: number;
  phone_number_external_user: string | null;
  supplier: ISupplierSystem;
  package: IPackage;
  reservation_type: IUdc;
  appointment_status: IUdc<AppointmentStatusCode>;
  payment_status: IUdc;
  payment_method: string | null;
  appointment_result: IUdc | null;
  appointment_type: IUdc;
  price_procedure: string;
  price_valoration_appointment: string;
  appointment_credit: IAppointmentCredit | null;
  created_date: Date;
  updated_date: Date;
}

type AppointmentStatusCode =
  | "CANCEL_APPOINTMENT"
  | "PENDING_VALORATION_APPOINTMENT"
  | "PENDING_PROCEDURE"
  | "CONFIRM_PROCEDURE"
  | "CONCRETED_APPOINTMENT"
  | "VALUED_VALORATION_APPOINTMENT"
  | "CONFIRM_VALIDATION_APPOINTMENT"
  | "VALUATION_PENDING_VALORATION_APPOINTMENT"
  | "WAITING_PROCEDURE";

interface ICreateAppointmentRequest {
  customer_id: string;
  appointment_date: string | null;
  appointment_hour: string | null;
  supplier_id: number;
  package_id: number;
  proforma_file_code?: string;
  reservation_type_code?: string;
  appointment_status_code?: string;
  application_date?: string;
  procedure_id: number;
  payment_status_code?: string;
  payment_method_code?: string;
  appointment_result_code?: string;
  user_description: string;
  recommendation_post_appointment?: string;
  diagnostic?: string;
  is_for_external_user: boolean;
  phone_number_external_user: string;
  price_procedure?: number;
  price_valoration_appointment?: number;
}

interface IAppointmentUpdateRequest
  extends Partial<ICreateAppointmentRequest> {}

interface ICreateAppointmentCreditRequest {
  appointment: number;
  credit_status_code: string;
  requested_amount: string;
  approved_amount: string;
  credit_observations: string;
  pagare_file_code: string;
  already_been_used: number;
}

interface IAppointmentCredit {
  id: number;
  appointment: IAppointment;
  credit_status: IUdc;
  credit_status_code: string;
  payment_status: IUdc;
  requested_amount: string;
  approved_amount: string;
  credit_observations: string;
  pagare_file_code: string;
  created_date: Date;
  updated_date: Date;
  already_been_used: number;
}

interface IAppointmentCreditUpdateRequest
  extends Partial<ICreateAppointmentCreditRequest> {}

interface IDocument {
  id: number;
  name: string;
  code: string;
  file_name: string;
  type: string;
  extension: string;
  description: string;
  url: string;
  id_for_table: number;
  table: string;
  user_id: string;
  is_public: number;
  created_date: Date;
}

interface IDocumentCreationRequest {
  file: File;
  fields: IDocumentCreationFields;
}

interface IDocumentCreationFields {
  title: string;
  type: "IMG" | "DOC";
  description: string;
  id_for_table: string;
  table: string;
  action_type: "GENERAL_GALLERY" | "PRIVATE_CONTRACT" | "PERSONAL_DOCUMENT";
  user_id: string;
  is_public: 0 | 1;
}

interface IDocumentFilters {
  table?: string;
  user_id?: string | number;
  id_for_table?: string;
  name?: string;
  ext?: string;
  action_type?: "GENERAL_GALLERY" | "PRIVATE_CONTRACT" | "PERSONAL_DOCUMENT";
  type?: "IMG" | "DOC" | "";
}

interface IUploadProformaRequest {
  recommendation_post_appointment?: string;
  diagnostic?: string;
  price_procedure?: string;
  appointment_result_code: string;
  proforma_file_code?: string;
}

type ModalName =
  | "appointmentDetails"
  | "cancelAppointment"
  | "successfulPayment"
  | "payAppointment"
  | "scheduleProcedure"
  | "scheduleProcedureSuccess"
  | "leaveReview"
  | "leaveReviewSuccess"
  | "applyCredit"
  | "applyCreditSuccess";

const UserRole = {
  CUSTOMER: "CUSTOMER",
  LEGAL_REPRESENTATIVE: "LEGAL_REPRESENTATIVE",
  FINANCE_ENTITY: "FINANCE_ENTITY",
} as const;

type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

interface DecodedToken {
  readonly id: string;
  readonly role: UserRoleType;
  readonly exp?: number;
  readonly iat?: number;
}

interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

interface LoginResponse {
  readonly access_token: string;
  readonly refresh_token: string;
}

interface LoginFieldErrors {
  email: string;
  password: string;
}
interface IForgotPassword {
  email: string;
}

interface IResetPassword {
  password: string;
}

interface IForgotPasswordResponse {
  message: string;
  token?: string;
}

interface IVerifyTokenResponse {
  valid: boolean;
  message: string;
}

interface IResetPasswordResponse {
  message: string;
  success: boolean;
}

/** Map of home routes by role */
const ROLE_HOME_ROUTES: Readonly<Record<UserRoleType, string>> = {
  [UserRole.CUSTOMER]: "/pacientes/inicio",
  [UserRole.LEGAL_REPRESENTATIVE]: "/medicos/inicio",
  [UserRole.FINANCE_ENTITY]: "/socio-financiero/inicio",
};

/**
 * Roles that require fetching complete user profile after login.
 * FINANCE_ENTITY only needs data from the decoded token.
 */
const ROLES_REQUIRING_PROFILE: ReadonlySet<UserRoleType> = new Set([
  UserRole.CUSTOMER,
  UserRole.LEGAL_REPRESENTATIVE,
]);

interface IRepresentativeRegisterRequest {
  documentType: string;
  documentNumber: string;
  fullName: string;
  contractFile: File | null;
  email: string;
  phone: string;
  password: string;
}

interface IInsuranceRegisterRequest {
  password: string;
  email: string;
  name: string;
  phone_number: string;
  birthdate: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
}

type ExperienceTypeCode =
  | "EXPERIENCE"
  | "EDUCATION"
  | "CERTIFICATION"
  | "AWARD_RECOGNITION"
  | "ACCREDITATION"
  | "SCIENTIFIC_PUBLICATION"
  | "CONFERENCE_PARTICIPATION"
  | "MEDICAL_RESEARCH";

interface ICertificationExperienceBase {
  supplier_id?: number;
  start_date?: string;
  end_date?: string;
  name?: string;
  company_name?: string;
  province?: string;
  address?: string;
  city_name?: string;
  country_iso_code?: string;
  is_currently?: boolean;
  url_document?: string;
  experience_type_code?: ExperienceTypeCode;
  experience_type?: { code: ExperienceTypeCode; name: string };
}

interface ICreateCertificationExperienceRequest
  extends ICertificationExperienceBase {
  supplier_id: number;
  start_date: string;
  name: string;
  company_name: string;
  experience_type_code: ExperienceTypeCode;
}

interface IUpdateCertificationExperienceRequest
  extends ICertificationExperienceBase {}

interface ICertificationExperience extends ICertificationExperienceBase {
  id: number;
}

type LanguageProficiencyCode = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "NATIVE";

interface ILanguageSupplier {
  id: number;
  supplier_id: number;
  language_proficiency_code: LanguageProficiencyCode;
  language_code: string;
}

interface ILanguageSupplierRequest {
  supplier_id: number;
  language_proficiency_code: LanguageProficiencyCode;
  language_code: string;
}
