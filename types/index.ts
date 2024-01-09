export interface IServicioClinica {
  id: string,
  nombre: string, //66821 - Operación de Cataratas
  descripcion: string //La cirugía de cataratas es un procedimiento oftalmológico comúnmente realizado para restaurar la visión nublada debido a la opacificación del cristalino del ojo. 
  amenidades?: IAmenidadClinica[],
  precio: number // en USD 
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
  rating?: string,
  // variants?: Variant[];
  reviews?: number,
  otrasOfertas?: IClinica[],
  imagen?: string,
  direccion?: IDireccion,
  experiencia?: number, //en años
  pacientes?: number,
  horario: IHorarioDiario[],
  clinica: string
}

export interface IHorarioDiario {
  dia: EWeekDays, horas: string
}

export enum EWeekDays {
  Lunes = "Lunes", Martes = "Martes", Miercoles = "Miércoles", Jueves = "Jueves", Viernes = "Viernes", Sabado = "Sábado", Domingo = "Domingo"
}