// import useApi from "./api";
// import { type Ref, ref } from "vue";
import { type IClinica } from "@/types";

// export type UsableClinicas = Promise<{ clinicas: Ref<Clinica[] | undefined> }>;

// export default async function useSearch(): UsableClinicas {
//   // const { response: products, request } = useApi<Product[]>(
//   //   "https://ecomm-products.modus.workers.dev/"
//   // );

//   // const loaded = ref(false);

//   // if (loaded.value === false) {
//   //   await request();
//   //   loaded.value = true;
//   // }

//   return { clinicas };
// }

// export default function useSearch(): UsableClinicas {

//   const clinicas = useState<Clinica[]>('clinicas', () => [
//     { id: 1, nombre: 'Hospital Clínica Bíblica', servicios: [] },
//     { id: 2, nombre: 'Clínica Santa Lucía, San José' }
//   ])

//   return { clinicas };


export default function useSearch() {

  const clinicas = useState<IClinica[]>('clinicas', () => [
    {
      id: '1',
      nombre: 'Hospital Clínica Bíblica',
      rating: '5.0',
      servicios: [
        { id: '125', nombre: 'oftalmología' },
        { id: '5733', nombre: 'cirugía' },
        { id: '845', nombre: 'pediatría' },
      ],
      reviews: 13,
      otrasOfertas: []
    },
    {
      id: '2',
      nombre: 'Hospital Clínica Bíblica',
      rating: '5.0',
      servicios: [
        { id: '125', nombre: 'oftalmología' },
        { id: '5733', nombre: 'cirugía' },
        { id: '845', nombre: 'pediatría' },
      ],
      reviews: 13,
      otrasOfertas: []
    },
    {
      id: '3',
      nombre: 'Hospital Clínica Bíblica',
      rating: '5.0',
      servicios: [
        { id: '125', nombre: 'oftalmología' },
        { id: '5733', nombre: 'cirugía' },
        { id: '845', nombre: 'pediatría' },
      ],
      reviews: 13,
      otrasOfertas: []
    },
    { id: '4', nombre: 'Clínica Santa Lucía, San José' }
  ])

  return { clinicas };
}