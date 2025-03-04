import { type IClinica } from "@/types"

export default function useClinica() {

  const clinicas = useState<IClinica[]>('clinicas', () => [{
    id: '1',
    nombre: 'Hospital Clínica Bíblica',
    rating: {
      ratingNumber: '5.0',
      reviews: 13
    },
    servicios: [
      { id: '125', nombre: 'oftalmología' },
      { id: '5733', nombre: 'cirugía' },
      { id: '845', nombre: 'pediatría' },
    ],
    otrasOfertas: [],
    experiencia: 10,
    pacientes: 1000,
    direccion: {
      texto: 'C. 24, San José, San Bosco, Costa Rica'
    }
  }])


  return {
    clinicas,
  }
}