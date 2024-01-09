export interface IServicioClinica {
  id: string,
  nombre: string
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
  pacientes?: number
}