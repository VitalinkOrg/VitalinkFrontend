import { type IVaucher, EVaucherEstado } from '@/types'

export default function useAseguradora() {

  const vaucherChart = useState('vaucherChart', () => true) //to test if returns data to populate chart

  const historialVauchers = useState<IVaucher[]>('vauchers', () => [{
    id: 'A52DWMM',
    servicio: 'Operación de Cataratas', // Procedimiento 
    estado: EVaucherEstado.UTILIZADA,
    aseguradora: { id: '23567', nombre: 'ASIS' },
    lugar: { texto: 'Hospital CIMA' },
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

  return {
    vaucherChart,
    historialVauchers
  }
}