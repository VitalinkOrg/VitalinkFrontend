// 
// Clinicas 
// 
export interface IServicioClinica {
  id: string,
  nombre: string, //66821 - Operación de Cataratas
  descripcion?: string //La cirugía de cataratas es un procedimiento oftalmológico comúnmente realizado para restaurar la visión nublada debido a la opacificación del cristalino del ojo. 
  amenidades?: IAmenidadClinica[],
  precio?: number // en USD ,
}

export interface IAmenidadClinica {
  id: string,
  nombre: string //Habitación Privada
}

export interface IDireccion {
  lat?: 12526787623,
  lon?: 234674898734,
  texto?: string
}

export interface IClinica {
  id: string;
  nombre?: string;
  servicios?: IServicioClinica[];
  rating?: IRating,
  otrasOfertas?: IClinica[],
  imagen?: string,
  direccion?: IDireccion,
  experiencia?: number, //en años
  pacientes?: number,
  horario?: IHorarioDiario[],
  // clinica: string
}

export interface IRating {
  ratingNumber?: string,
  reviews?: number
}

export interface IHorarioDiario {
  dia: EWeekDays, horas: string
}

export enum EWeekDays {
  LUNES = "Lunes",
  MARTES = "Martes",
  MIERCOLES = "Miércoles",
  JUEVES = "Jueves",
  VIERNES = "Viernes",
  SABADO = "Sábado",
  DOMINGO = "Domingo"
}

// 
// Pacientes 
// 
export interface IPaciente {
  nombre: string,
  apellidos: string,
}

export interface ICita {
  id: string,
  medico: IMedico,
  fecha: string,
  hora: string,
  procedimiento: string, //servicio
  lugar: IDireccion,
  estado: ECitaEstado
}

export interface IMedico {
  id: string,
  nombre: string,
  rating?: IRating,
  imagen?: string,
  servicios?: IServicioClinica[]
}

export interface IVaucher {
  id: string,
  servicio: string,
  estado: EVaucherEstado
}

export enum ECitaEstado {
  PENDIENTE = "Pendiente",
  CANCELADA = "Cancelada",
}

export enum EVaucherEstado {
  ACEPTADA = "Aceptado",
  PENDIENTE_APROBACION = "Pendiente de Aprobación",
  DENEGADO = "Denegado"
}



// 
// 
// 