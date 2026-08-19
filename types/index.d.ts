// Global ambient types for VitalinkFrontend.
// Backend-entity shapes (IUser, ISupplierSystem, IPackage, IUdc, …) are kept in
// sync with the VitalinkBackendV2 TypeORM entities; frontend-only types
// (ModalName, IUsableAPI, etc.) live here too. Hand-maintained — there is no
// regeneration step, so edit freely.
//
// Payment- and auth-related types have a single source of truth in
// types/payment.ts and types/auth.ts respectively — import from there rather
// than adding new global duplicates here.

// ─── API Response wrappers ───────────────────────────────────────────────────

interface IStatus {
  id: number;
  message: string;
  http_code: number;
}

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

// ─── Pagination ──────────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

// ─── Enum / union types ──────────────────────────────────────────────────────

type UserGender = "M" | "F" | "O";

type UserAccountStatus = "active" | "pending" | "suspended" | "closed";

type DocumentActionType =
  | "PROFILE_PICTURE"
  | "GENERAL_GALLERY"
  | "PERSONAL_DOCUMENT"
  | "PRIVATE_CONTRACT"
  | "MEDICAL_PROCEDURE_ATTACHMENT"
  | "OTHER"
  | "PROFORMA_INVOICE";

type DocumentFileType = "DOC" | "IMG" | "OTHER";

type NotificationType = "APPOINTMENT" | "APPOINTMENT_CREDIT" | "GENERAL" | "SYSTEM";

type UdcType =
  | "RESERVATION_TYPE"
  | "APPOINTMENT_STATUS"
  | "REVIEW"
  | "PAYMENT_STATUS"
  | "PAYMENT_METHOD"
  | "ASKING_CREDIT_STATUS"
  | "EXPERIENCE_TYPE"
  | "ID_TYPE"
  | "MEDICAL_TYPE"
  | "MEDICAL_SPECIALTY"
  | "ODONTOLOGY_SPECIALTY"
  | "MEDICAL_PROCEDURE"
  | "MEDICAL_PRODUCT"
  | "ASSESSMENT"
  | "ASSESSMENT_DETAIL"
  | "APPOINTMENT_RESULT"
  | "LANGUAGE_PROFICIENCY"
  | "APPOINTMENT_TYPE"
  | "ODONTOLOGHY_MEDICAL";

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

type ExperienceTypeCode =
  | "EXPERIENCE"
  | "EDUCATION"
  | "CERTIFICATION"
  | "AWARD_RECOGNITION"
  | "ACCREDITATION"
  | "SCIENTIFIC_PUBLICATION"
  | "CONFERENCE_PARTICIPATION"
  | "MEDICAL_RESEARCH";

type LanguageProficiencyCode = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "NATIVE";

type PaymentAttemptStatus = "created" | "pending" | "accepted" | "declined" | "error";

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

/** String alias kept for backwards-compatibility with ILocation */
type CountryisoCode = string;
/** String alias kept for backwards-compatibility with ILocation */
type Province = string;
/** Alias — medical_type fields resolve to the same UDC shape */
type MedicalType = IUdc;

// ─── UDC (UnitDynamicCentral) ─────────────────────────────────────────────────

interface IUdc<T = string> {
  id: number;
  supplier_id?: number | null;
  code: T;
  father_code: string | null;
  name: string;
  type: string;
  /** value1 stores reference product price */
  value1: string | null;
  /** value2 stores valoration appointment price for the product */
  value2: string | null;
  description?: string | null;
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

interface IUdcParams {
  id: number;
  size: number;
  type: UdcType;
  father_code: string;
  code: string;
  supplier_id: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

interface IUser {
  id: string;
  card_id: string;
  id_type: IUdc;
  name: string;
  user_name: string | null;
  email: string;
  phone_number: string | null;
  country_iso_code: string;
  province?: string | null;
  city_name: string | null;
  postal_code: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  gender: UserGender | null;
  birth_date: string | null;
  role_code?: string;
  role?: string;
  finance_entity: string | null;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  account_status: UserAccountStatus;
  is_deleted?: number;
  is_active_from_email?: number;
  fail_login_number?: number;
  last_login_at?: string | null;
  login_ip_address?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  verified_at?: string | null;
}

interface ICustomer {
  id: string;
  card_id: string;
  id_type: IUdc;
  name: string;
  email: string;
  user_name: string | null;
  phone_number: string | null;
  gender: UserGender | null;
  birth_date: string | null;
  country_iso_code: string;
  province: string | null;
  address: string | null;
  city_name: string | null;
  postal_code: string | null;
  role_code: string;
  is_deleted: number;
  is_active_from_email: number;
  account_status: UserAccountStatus;
  fail_login_number: number;
  forgot_password_token: string | null;
  active_register_token: string | null;
  latitude: string | null;
  longitude: string | null;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  last_login_at: string | null;
  login_ip_address: string | null;
  created_at: string | null;
  updated_at: string | null;
  verified_at: string | null;
}

interface ILegalRepresentative {
  id: string;
  card_id: string;
  name: string;
  email: string;
  user_name: string | null;
  phone_number: string | null;
  gender: UserGender | null;
  birth_date: string | null;
  country_iso_code: string;
  province: string | null;
  address: string | null;
  city_name: string | null;
  postal_code: string | null;
  role_code: string;
  is_deleted: number;
  is_active_from_email: number;
  account_status: UserAccountStatus;
  fail_login_number: number;
  forgot_password_token: string | null;
  active_register_token: string | null;
  latitude: string | null;
  longitude: string | null;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  last_login_at: string | null;
  login_ip_address: string | null;
  created_at: string | null;
  updated_at: string | null;
  verified_at: string | null;
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
  gender: UserGender;
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
  account_status: UserAccountStatus;
}

interface IUserUpdateRequest extends Partial<ICreateUserRequest> {}

// ─── Supplier ─────────────────────────────────────────────────────────────────

interface ISupplierSystem {
  id: number;
  id_type: IUdc;
  card_id: string;
  num_medical_enrollment: string | null;
  name: string | null;
  phone_number: string | null;
  email: string;
  country_iso_code: string | null;
  province: string | null;
  city_name: string | null;
  postal_code: string | null;
  profile_picture_url: string | null;
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
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
  gender: UserGender | null;
  medical_type: IUdc | null;
  legal_representative: ILegalRepresentative;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
  services?: ISupplierService[];
}

interface ISupplierMain {
  id: number;
  id_type: IUdc;
  card_id: string;
  num_medical_enrollment: string | null;
  name: string | null;
  phone_number: string | null;
  email: string;
  province: string | null;
  city_name: string | null;
  postal_code: string | null;
  profile_picture_url: string | null;
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
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
  gender: UserGender | null;
  legal_representative: ILegalRepresentative;
  date_availability: string | null;
  hour_availability: string | null;
  location_number: number;
  locations: ILocation[];
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
  name: string | null;
  phone_number: string | null;
  email: string;
  country_iso_code: string | null;
  province: string | null;
  city_name: string | null;
  postal_code: string | null;
  profile_picture_url: string | null;
  description: string | null;
  address: string | null;
  street_number: string | null;
  floor: number | null;
  door_number: number | null;
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
  gender: UserGender | null;
  medical_type: IUdc | null;
  legal_representative: ILegalRepresentative;
  created_date: string | null;
  updated_date: string | null;
  date_availability: string | null;
  hour_availability: string | null;
  location_number: number;
  reviews: IReview[];
  review_details_summary: IReviewDetail[];
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
  gender?: UserGender;
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

// ─── Specialty by Supplier ────────────────────────────────────────────────────

interface ISpecialty {
  id: number;
  created_date: string | null;
  supplier: ISupplierSystem;
  medical_specialty: IUdc;
}

interface ISpecialtyBySupplier {
  id: number;
  supplier: ISupplierSystem;
  medical_specialty: IUdc;
  created_date: string | null;
}

interface ICreateSpecialtyBySupplierRequest {
  supplier_id: number;
  medical_specialty_code: string;
}

interface ISpecialtyBySupplierUpdateRequest
  extends Partial<ICreateSpecialtyBySupplierRequest> {}

// ─── Package ──────────────────────────────────────────────────────────────────

interface IServicesOffer {
  ASSESSMENT_DETAILS: string[];
}

interface IPackage {
  id: number;
  specialty: ISpecialty;
  product: IUdc;
  procedure: IUdc;
  discount: number | null;
  reference_price: string;
  services_offer: IServicesOffer | null;
  observations: string;
  postoperative_assessments: string | null;
  is_king: number;
  is_deleted: number;
  created_date: string | null;
  updated_date: string | null;
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

// ─── Location ─────────────────────────────────────────────────────────────────

interface ILocation {
  id: number;
  name: string;
  country_iso_code: string | null;
  province: string | null;
  address: string | null;
  city_name: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  legal_representative: string | null;
  supplier_id?: number | null;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
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

// ─── Availability ─────────────────────────────────────────────────────────────

interface IAvailability {
  id: number;
  supplier: ISupplierSystem;
  location: ILocation | null;
  weekday: string;
  from_hour: string;
  to_hour: string;
  created_date: string | null;
  updated_date: string | null;
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

// ─── Certifications & Experience ──────────────────────────────────────────────

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
  experience_type?: IUdc | { code: ExperienceTypeCode; name: string };
}

interface ICertificationExperience extends ICertificationExperienceBase {
  id: number;
  supplier?: ISupplierSystem;
  created_date?: string | null;
  updated_date?: string | null;
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

interface IGetAllCertificationExperienceParams {
  supplier_id?: number;
  experience_type_code?: ExperienceTypeCode;
}

// ─── Language Supplier ────────────────────────────────────────────────────────

interface ILanguageSupplier {
  id: number;
  supplier_id: number;
  language_proficiency: IUdc | null;
  language_proficiency_code: LanguageProficiencyCode;
  language_code: string;
  created_date?: string | null;
  updated_date?: string | null;
}

interface ILanguageSupplierRequest {
  supplier_id: number;
  language_proficiency_code: LanguageProficiencyCode;
  language_code: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

interface IAppointment {
  id: number;
  appointment_qr_code: string;
  customer: ICustomer;
  proforma_file_code: string | null;
  appointment_date: string | null;
  appointment_hour: string | null;
  supplier: ISupplierSystem;
  package: IPackage;
  application_date: string | null;
  user_description: string | null;
  recommendation_post_appointment: string | null;
  diagnostic: string | null;
  is_for_external_user: number;
  phone_number_external_user: string | null;
  appointment_type: IUdc;
  reservation_type: IUdc;
  appointment_status: IUdc<AppointmentStatusCode>;
  payment_status: IUdc;
  payment_method: IUdc | null;
  appointment_result: IUdc | null;
  price_procedure: string;
  price_valoration_appointment: string;
  appointment_credit: IAppointmentCredit | null;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

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

// ─── Appointment Credit ───────────────────────────────────────────────────────

interface IAppointmentCredit {
  id: number;
  appointment: IAppointment;
  credit_status: IUdc;
  credit_status_code: string;
  requested_amount: string | null;
  approved_amount: string | null;
  credit_observations: string | null;
  pagare_file_code: string | null;
  max_date_active: string | null;
  already_been_used: number;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

interface ICreateAppointmentCreditRequest {
  appointment: number;
  credit_status_code: string;
  requested_amount: string;
  approved_amount: string;
  credit_observations: string;
  pagare_file_code: string;
  already_been_used: number;
}

interface IAppointmentCreditUpdateRequest
  extends Partial<ICreateAppointmentCreditRequest> {}

// ─── Appointment Flow Log ─────────────────────────────────────────────────────

interface IAppointmentFlowLog {
  id: number;
  appointment: IAppointment;
  flow_event: IUdc | null;
  description: string | null;
  performed_by: IUser | null;
  created_at: string | null;
}

// ─── Review ───────────────────────────────────────────────────────────────────

interface IReview {
  id: number;
  customer: ICustomer;
  appointment: IAppointment;
  comment: string | null;
  is_annonymous: boolean;
  supplier_reply: string | null;
  details?: IReviewDetail[];
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

interface IReviewDetail {
  id: number;
  review: IReview;
  stars_point: number;
  review_code: IUdc;
  created_date: string | null;
}

// ─── Document ─────────────────────────────────────────────────────────────────

interface IDocument {
  id: number;
  /** Backend column is `title`; some API responses expose it as `name` */
  title: string;
  name: string;
  code: string;
  file_name: string;
  extension: string;
  action_type: DocumentActionType;
  type: DocumentFileType;
  description: string | null;
  url: string | null;
  id_for_table: number;
  table: string;
  user_id: string | null;
  is_public: number;
  is_deleted?: number;
  created_date: string | null;
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
  action_type: "PROFILE_PICTURE" | "GENERAL_GALLERY" | "PRIVATE_CONTRACT" | "PERSONAL_DOCUMENT";
  user_id: string;
  is_public: 0 | 1;
}

interface IDocumentFilters {
  table?: string;
  user_id?: string | number;
  id_for_table?: string;
  name?: string;
  ext?: string;
  action_type?: "PROFILE_PICTURE" | "GENERAL_GALLERY" | "PRIVATE_CONTRACT" | "PERSONAL_DOCUMENT";
  type?: "IMG" | "DOC" | "";
}

interface IUploadProformaRequest {
  recommendation_post_appointment?: string;
  diagnostic?: string;
  price_procedure?: string;
  appointment_result_code: string;
  proforma_file_code?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

interface INotification {
  id: number;
  code: string;
  type: NotificationType;
  subject: string;
  email_message: string | null;
  another_message: string | null;
  notification_message: string | null;
  required_send_email: boolean;
  text_from_email_message_json: boolean;
  email_template: string | null;
  action_url: string | null;
  action_text: string | null;
  language: string | null;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

interface IUserNotification {
  id: number;
  subject: string;
  email_message: string;
  another_message: string;
  notification_message: string;
  payload: Record<string, any> | null;
  is_read: boolean;
  notification: INotification;
  user_send: IUser | null;
  user_receive: IUser;
  is_deleted?: number;
  created_date: string | null;
}

// ─── Payment Attempt ──────────────────────────────────────────────────────────

interface IPaymentAttempt {
  id: number;
  user: IUser;
  appointment: IAppointment | null;
  reference: string;
  amount: number | null;
  currency: string;
  environment: string;
  mode: "redirect" | "embedded";
  status: PaymentAttemptStatus;
  decision: string | null;
  reason_code: string | null;
  transaction_id: string | null;
  request_token: string | null;
  card_scheme: string | null;
  card_type_code: string | null;
  card_last4: string | null;
  device_fingerprint_id: string | null;
  payer_auth_tx: string | null;
  mdd5_channel: string | null;
  mdd6_merchant_name: string | null;
  customer_ip_address: string | null;
  signed_ok_notify: boolean;
  signed_ok_receipt: boolean;
  raw_notify: Record<string, any> | null;
  raw_receipt: Record<string, any> | null;
  webhook_received_at: string | null;
  receipt_received_at: string | null;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

// ─── Pre-Register User ────────────────────────────────────────────────────────

interface IPreRegisterUser {
  id: number;
  card_id: string;
  id_type: IUdc;
  name: string;
  email: string;
  address: string | null;
  birth_date: string | null;
  finance_entity: IUser;
  is_deleted?: number;
  created_date: string | null;
  updated_date: string | null;
}

// ─── Log ──────────────────────────────────────────────────────────────────────

interface ILog {
  id: number;
  method: string;
  class: string | null;
  type: string | null;
  action: string | null;
  https: number | null;
  message: string;
  data: string | null;
  created_date: string | null;
  user_id: string | null;
  ip_address: string | null;
  environment: string | null;
  platform: string | null;
  device_information: string | null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
//
// DecodedToken, LoginCredentials, LoginResponse, LoginFieldErrors, UserRole,
// UserRoleType, ROLE_HOME_ROUTES and ROLES_REQUIRING_PROFILE live in
// types/auth.ts — import them from there.

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
  gender: UserGender;
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

// ─── Payment ──────────────────────────────────────────────────────────────────
//
// PaymentStatus, PaymentDecision, PaymentMethod, PaymentModalState,
// PaymentStatusResponse, PaymentReceiptParams, PaymentReceiptMessage,
// PaymentConfig, UpdateAppointmentPaymentRequest, PollingResult,
// PollingConfig, JWTPayload and PaymentError live in types/payment.ts —
// import them from there.
