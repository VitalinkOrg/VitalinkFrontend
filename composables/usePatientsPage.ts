import { useAppointment } from "@/composables/api";

type PatientSortCriterion = "name-asc" | "name-desc";

interface PatientSortOption {
  value: PatientSortCriterion;
  label: string;
}

const SORT_OPTIONS: readonly PatientSortOption[] = [
  { value: "name-asc", label: "Nombre (A-Z)" },
  { value: "name-desc", label: "Nombre (Z-A)" },
] as const;

function deduplicatePatients(appointments: IAppointment[]): ICustomer[] {
  const patientMap = new Map<string, ICustomer>();
  for (const appointment of appointments) {
    if (appointment.is_for_external_user) continue;
    const customer = appointment.customer;
    if (customer && !patientMap.has(customer.id)) {
      patientMap.set(customer.id, customer);
    }
  }
  return Array.from(patientMap.values());
}

function matchesSearchQuery(patient: ICustomer, query: string): boolean {
  const q = query.toLowerCase();
  return [patient.name, patient.email, patient.phone_number, patient.card_id, patient.address].some(
    (field) => field?.toLowerCase().includes(q),
  );
}

function comparePatients(
  a: ICustomer,
  b: ICustomer,
  criterion: PatientSortCriterion,
): number {
  switch (criterion) {
    case "name-asc":
      return a.name.localeCompare(b.name, "es");
    case "name-desc":
      return b.name.localeCompare(a.name, "es");
    default:
      return 0;
  }
}

export function usePatientsPage() {
  const { getAllAppointments } = useAppointment();
  const logger = useLogger("PatientsPage");
  const toast = useToast();

  const isLoading = ref(false);
  const hasError = ref(false);
  const patients = ref<ICustomer[]>([]);
  const searchQuery = ref("");
  const activeSortCriterion = ref<PatientSortCriterion>("name-asc");

  async function fetchPatients(): Promise<void> {
    isLoading.value = true;
    hasError.value = false;

    try {
      const { data, error } = await getAllAppointments();

      if (error && !data) {
        logger.error("Failed to fetch appointments for patients", {
          info: error.info,
        });
        toast.error(error.info);
        throw new Error(error.info || "Error al cargar los pacientes");
      }

      patients.value = deduplicatePatients(data || []);
    } catch (err: unknown) {
      hasError.value = true;
      const message =
        err instanceof Error ? err.message : "Error al cargar los pacientes";
      logger.error(message);
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function applySortCriterion(criterion: PatientSortCriterion): void {
    activeSortCriterion.value = criterion;
  }

  const filteredPatients = computed<ICustomer[]>(() => {
    let result = [...patients.value];

    if (searchQuery.value.trim()) {
      result = result.filter((p) => matchesSearchQuery(p, searchQuery.value));
    }

    return result.sort((a, b) =>
      comparePatients(a, b, activeSortCriterion.value),
    );
  });

  const patientCount = computed(() => filteredPatients.value.length);
  const hasPatients = computed(() => patientCount.value > 0);

  return {
    isLoading: readonly(isLoading),
    hasError: readonly(hasError),
    searchQuery,
    activeSortCriterion: readonly(activeSortCriterion),
    filteredPatients,
    patientCount,
    hasPatients,
    sortOptions: SORT_OPTIONS,
    fetchPatients,
    applySortCriterion,
  };
}
