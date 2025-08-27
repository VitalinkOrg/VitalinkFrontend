//
// Clinicas
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

//
// Aseguradora
//
export interface IAseguradora {
  id: string;
  nombre: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
