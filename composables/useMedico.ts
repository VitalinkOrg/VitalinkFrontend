
import { type IPaciente, type ICita, ECitaEstado, type IVaucher, EVaucherEstado, type IMedico } from '@/types'

export default function useMedico() {

  const citas = useState<ICita[]>('citas', () => [{
    id: '2356374',
    medico: { id: '32637', nombre: 'Dra. Andrea Morales Solis' },
    paciente: 'Andrea Morales Solis',
    fecha: '10/11/2023',
    hora: '18:00 - 18:45',
    procedimiento: 'Operación de Cataratas',
    vaucher: 'AG528GE6',
    lugar: {
      texto: 'Hospital CIMA'
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
    vaucher: 'SDF89552',

    lugar: {
      texto: 'Hospital CIMA'
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
    vaucher: '-',

    lugar: {
      texto: 'Hospital CIMA'
    },
    estado: ECitaEstado.PENDIENTE
  }
  ])

  // Update this open depending on API 
  const onboarding = useState('onboarding', () => [{
    open: true,
    step: 1
  }])


  return {
    citas,
    onboarding
  }
}