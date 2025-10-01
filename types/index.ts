//
// Clinicas

import type { MedicalSpecialty } from "./supplier";

//
export interface IServicioClinica {
  id: string;
  name: string; //66821 - Operación de Cataratas
  descripcion?: string; //La cirugía de cataratas es un procedimiento oftalmológico comúnmente realizado para restaurar la visión nublada debido a la opacificación del cristalino del ojo.
  amenidades?: IAmenidadClinica[];
  precio?: number; // en USD ,
}

export interface IAmenidadClinica {
  id: string;
  nombre: string; //Habitación Privada
}

export interface IDireccion {
  lat?: 12526787623;
  lon?: 234674898734;
  texto?: string;
}

export interface IClinica {
  id: string;
  name?: string;
  // servicios?: IServicioClinica[];
  specialties: IServicioClinica[];
  // rating?: IRating, //Old
  review_score?: number;
  review_count?: number;
  otrasOfertas?: IClinica[];
  imagen?: string;
  direccion?: IDireccion;
  experiencia?: number; //en años
  pacientes?: number;
  horario?: IHorarioDiario[];
  telefono?: string;
  // clinica: string
}

export interface IRating {
  ratingNumber?: string;
  reviews?: number;
}

export interface IHorarioDiario {
  dia: EWeekDays;
  horas: string;
}

export enum EWeekDays {
  LUNES = "Lunes",
  MARTES = "Martes",
  MIERCOLES = "Miércoles",
  JUEVES = "Jueves",
  VIERNES = "Viernes",
  SABADO = "Sábado",
  DOMINGO = "Domingo",
}

//
// Pacientes
//
export interface IPaciente {
  nombre: string;
  apellidos: string;
  id: number;
}

export interface ICita {
  id: string;
  medico: IMedico;
  fecha: string;
  hora: string;
  procedimiento: string; //servicio
  lugar: IDireccion;
  estado: ECitaEstado;
  paciente?: string;
  vaucher?: IVaucher[id];
}

export interface IMedico {
  id: string;
  nombre: string;
  rating?: IRating;
  imagen?: string;
  servicios?: IServicioClinica[];
}

export interface IVaucher {
  id: string;
  servicio: string; // Procedimiento
  estado: EVaucherEstado;
  fecha: string;
  hora: string;
  lugar?: IClinica;
  aseguradora: IAseguradora;
  costoUSD?: number;
  vencimiento?: string;
  asegurado?: IPaciente;
}

export enum ECitaEstado {
  PENDIENTE = "Pendiente",
  CANCELADA = "Cancelada",
  CONCRETADA = "Concretada",
}

export enum EVaucherEstado {
  ACEPTADA = "Aceptado",
  PENDIENTE_APROBACION = "Pendiente de Aprobación",
  DENEGADO = "Denegado",
  UTILIZADA = "Utilizado",
}

interface FinanceEntity {
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
  latitude: number | null;
  longitude: number | null;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  last_login_at: string | null;
  login_ip_address: string | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  id_type: IUdc;
}

export interface UserInformation {
  id: string;
  card_id: string;
  id_type: IdType;
  name: string;
  user_name: string;
  email: string;
  phone_number: string;
  country_iso_code: string;
  city_name: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  gender: string | null;
  birth_date: string | null;
  role: string;
  finance_entity: FinanceEntity;
  code_contract: string | null;
  language: string;
  profile_picture_url: string | null;
  account_status: string;
}

//
// Aseguradora
//
export interface IAseguradora {
  id: string;
  nombre: string;
}

export interface InsuranceRegisterData {
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

export type ModalName =
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

export interface IUdc {
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
export interface ISupplierFormData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  codeContract: string;
  contratcFile: File | null;
  contratcId: number;
  email: string;
  phone: string;
  password: string;
}

export interface IRelatedMedicalFormData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  identityDocumentFile: File | null;
  medicalCode: string;
  validLicenseFile: File | null;
  medicalType: string;
  specialties: MedicalSpecialty[];
  useSameDataAsSupplier?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface IdType extends IUdc {}

export interface Procedures {
  procedure: Procedure;
  packages: Package[];
}

export interface Procedure extends IUdc {}

export interface Package {
  id: number;
  product: Product;
  reference_price: number;
  discount: number;
  discounted_price: number;
  services_offer: {
    ASSESSMENT_DETAILS: string[];
  };
  is_king: 0 | 1;
  observations: string;
  postoperative_assessments: number | null;
  is_deleted: 0 | 1;
  created_date: string;
  updated_date: string | null;
  procedure?: Procedure;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  father_code: string | null;
  value1: string;
  value2: string | null;
  created_date: string;
  updated_date: string | null;
  is_deleted: 0 | 1;
}

export * from "./appointment";
export * from "./supplier";
