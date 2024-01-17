
import { type IPaciente, type ICita, ECitaEstado, type IVaucher, type IHistorial, EVaucherEstado } from '@/types'

export default function usePacientes() {
  const pacientes = useState<IPaciente[]>('pacientes', () => [{
    nombre: 'Eugenia',
    apellidos: 'Barrantes'
  }])

  const citas = useState<ICita[]>('citas', () => [{
    id: '2356374',
    medico: { id: '32637', nombre: 'Dra. Andrea Morales Solis' },
    fecha: '10/11/2023',
    hora: '18:00 - 18:45',
    procedimiento: 'Operación de Cataratas',
    lugar: {
      texto: '2118 Thornridge Cir. Syracuse, Connecticut 35624'
    },
    estado: ECitaEstado.PENDIENTE
  }])

  const vauchers = useState<IVaucher[]>('vauchers', () => [{
    id: 'A52DWMM',
    servicio: 'Operación de Cataratas',
    estado: EVaucherEstado.ACEPTADA
  }])

  const historial = useState<IHistorial[]>('historial', () => [])



  return {
    pacientes,
    citas,
    vauchers,
    historial
  }
}