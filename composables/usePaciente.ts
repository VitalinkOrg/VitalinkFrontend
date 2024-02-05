
import { type IPaciente, type ICita, ECitaEstado, type IVaucher, EVaucherEstado, type IMedico } from '@/types'

export default function usePacientes() {
  const pacientes = useState<IPaciente[]>('pacientes', () => [{
    nombre: 'Eugenia',
    apellidos: 'Barrantes'
  }])

  const citas = useState<ICita[]>('citas', () => [{
    id: '2356374',
    medico: { id: '32637', nombre: 'Dra. Andrea Morales Solis' },
    paciente: 'Andrea Morales Solis',
    fecha: '10/11/2023',
    hora: '18:00 - 18:45',
    procedimiento: 'Operación de Cataratas',
    lugar: {
      texto: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
    },
    estado: ECitaEstado.CONCRETADA
  },
  {
    id: '2356374',
    medico: { id: '32637', nombre: 'Dra. Andrea Morales Solis' },
    paciente: 'Carlos Rodriguez',

    fecha: '10/11/2023',
    hora: '18:00 - 18:45',
    procedimiento: 'Operación de Cataratas',
    lugar: {
      texto: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
    },
    estado: ECitaEstado.CANCELADA
  },
  {
    id: '2356374',
    medico: { id: '32637', nombre: 'Dra. Andrea Morales Solis' },
    paciente: 'Maria Fernandez',

    fecha: '10/11/2023',
    hora: '18:00 - 18:45',
    procedimiento: 'Operación de Cataratas',
    lugar: {
      texto: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
    },
    estado: ECitaEstado.PENDIENTE
  }
  ])

  const getCitas = (page: number) => { console.log(page) }

  const vauchers = useState<IVaucher[]>('vauchers', () => [{
    id: 'A52DWMM',
    servicio: 'Operación de Cataratas', // Procedimiento
    estado: EVaucherEstado.UTILIZADA,
    aseguradora: { id: '23567', nombre: 'ASIS'},
    lugar: { texto: 'Hospital CIMA'},
    fecha: '26/09/2023',
    hora: '18:00 - 18:45',
    costoUSD: 100
  }])

  const getVauchers = (page: number) => { console.log(page) }

  const historial = useState<IMedico[]>('historial', () => [{
    id: '34567486',
    nombre: 'Dra.Stephanie Powell',
    rating: {
      ratingNumber: '5.0',
      reviews: 13
    },
    servicios: [
      { id: '125', nombre: 'oftalmología' },
      { id: '5733', nombre: 'cirugía' },
      { id: '845', nombre: 'pediatría' },
    ],
  }])

  return {
    pacientes,
    citas,
    getCitas,
    vauchers,
    getVauchers,
    historial
  }
}