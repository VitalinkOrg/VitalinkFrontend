import type { IServicioClinica } from "@/types"

export default function useServicios(clinicaId: string) {
  console.log(clinicaId)

  const servicios = useState<IServicioClinica[]>('servicios', () => [{
    id: '66821',
    nombre: 'Operación de Cataratas',
    clinica: 'Hospital Clínica Bíblica',
    descripcion: 'La cirugía de cataratas es un procedimiento oftalmológico comúnmente realizado para restaurar la visión nublada debido a la opacificación del cristalino del ojo. ',
    amenidades: [
      { id: '125622', nombre: 'Habitación Privada' },
      { id: '23536467', nombre: 'Baño privado' },
      { id: '346374323', nombre: 'Aire Acondicionado' },
      { id: '346568734646', nombre: 'Calefacción' },
      { id: '326785745745', nombre: 'Aparcamiento gratuito' }],
    precio: 2000,
    horario: [
      { dia: 'Viernes', horas: '8 - 12 AM' },
      { dia: 'Miércoles', horas: '2 - 6 PM' },
      { dia: 'Lunes', horas: '8 - 12 AM' },
    ]
  }])

  // onMounted(() => {
  //   getClinicaServicios('1244')
  // })


  // const getClinicaServicios = (clinicaId: string) => {
  //   console.log('fetch', clinicaId)
  //   // fetch the api passing the clinic id 
  //   const servicios = () => {
  //     return {
  //       id: 66821,
  //       nombre: 'Operación de Cataratas',
  //       descripcion: 'La cirugía de cataratas es un',
  //       amenidades: [{
  //         id: '125622',
  //         nombre: 'Habitación Privada'
  //       }],
  //       precio: 2000
  //     }
  //   }
  // }

  return {
    servicios
  }
}