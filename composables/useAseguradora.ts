import { type IVaucher, EVaucherEstado, type IClinica } from '@/types'

export default function useAseguradora() {

  const vaucherChart = useState('vaucherChart', () => true) //to test if returns data to populate chart

  const historialVauchers = useState<IVaucher[]>('vauchers', () => [{
    id: 'A52DWMM',
    servicio: 'Operación de Cataratas', // Procedimiento 
    estado: EVaucherEstado.UTILIZADA,
    aseguradora: { id: '23567', nombre: 'ASIS' },
    // lugar: {
    //   id: '253467474587',
    //   direccion: 'Calle Ficticia 123',
    //   telefono: '+506 6123-3466',
    //   nombre: 'Hospital CIMA',
    // },
    fecha: '26/09/2023',
    hora: '18:00 - 18:45',
    costoUSD: 100,
    vencimiento: '05/10/2023',
    asegurado: {
      id: 2456762374362,
      nombre: 'Andrea',
      apellidos: 'Morales Solis'
    }
  }])

  const proveedores = useState<IClinica[]>('clinicas', () => [{
    id: '1',
    name: 'Hospital Clínica Bíblica',
    review_score: 5.0,
    review_count: 15,
    // rating: {
    //   ratingNumber: '5.0',
    //   reviews: 13
    // },
    service_name: [
      { id: '125', name: 'oftalmología' },
      { id: '5733', name: 'cirugía' },
      { id: '845', name: 'pediatría' },
    ],
    otrasOfertas: [],
    experiencia: 10,
    pacientes: 1000,
    direccion: {
      texto: 'C. 24, San José, San Bosco, Costa Rica'
    }
  }])

  return {
    vaucherChart,
    historialVauchers,
    proveedores
  }
}