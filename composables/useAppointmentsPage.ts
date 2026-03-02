import { useAppointment } from "@/composables/api";

type SortCriterion = "newest" | "oldest" | "type" | "status";
type StatusCategory = "Pendiente" | "Completada" | "Cancelada";
type StatusFilter = StatusCategory | "Todos";

interface SortOption {
  value: SortCriterion;
  label: string;
}

const SORT_OPTIONS: readonly SortOption[] = [
  { value: "newest", label: "Fecha (más reciente)" },
  { value: "oldest", label: "Fecha (más antigua)" },
  { value: "type", label: "Tipo de reserva" },
  { value: "status", label: "Estado" },
] as const;

const STATUS_FILTERS: readonly StatusFilter[] = [
  "Todos",
  "Pendiente",
  "Completada",
  "Cancelada",
] as const;

const COMPLETED_CODES: ReadonlySet<string> = new Set([
  "CONCRETED_APPOINTMENT",
  "VALUED_VALORATION_APPOINTMENT",
]);

const PENDING_CODES: ReadonlySet<string> = new Set([
  "PENDING_VALORATION_APPOINTMENT",
  "PENDING_PROCEDURE",
  "CONFIRM_PROCEDURE",
  "CONFIRM_VALIDATION_APPOINTMENT",
  "VALUATION_PENDING_VALORATION_APPOINTMENT",
  "WAITING_PROCEDURE",
]);

const CANCELLED_CODES: ReadonlySet<string> = new Set(["CANCEL_APPOINTMENT"]);

function resolveStatusCategory(code: string): StatusCategory {
  if (COMPLETED_CODES.has(code)) return "Completada";
  if (CANCELLED_CODES.has(code)) return "Cancelada";
  return "Pendiente";
}

function buildAppointmentTimestamp(appointment: IAppointment): number {
  return new Date(
    `${appointment.appointment_date}T${appointment.appointment_hour}`,
  ).getTime();
}

function matchesSearchQuery(appointment: IAppointment, query: string): boolean {
  const normalizedQuery = query.toLowerCase();
  const searchableFields = [
    appointment.customer?.name,
    appointment.package?.product?.name,
    appointment.appointment_type?.name,
    appointment.appointment_status?.value1,
  ];

  return searchableFields.some((field) =>
    field?.toLowerCase().includes(normalizedQuery),
  );
}

function compareAppointments(
  a: IAppointment,
  b: IAppointment,
  criterion: SortCriterion,
): number {
  switch (criterion) {
    case "newest":
      return buildAppointmentTimestamp(b) - buildAppointmentTimestamp(a);
    case "oldest":
      return buildAppointmentTimestamp(a) - buildAppointmentTimestamp(b);
    case "type":
      return (a.appointment_type?.name ?? "").localeCompare(
        b.appointment_type?.name ?? "",
        "es",
      );
    case "status":
      return (a.appointment_status?.value1 ?? "").localeCompare(
        b.appointment_status?.value1 ?? "",
        "es",
      );
    default:
      return 0;
  }
}

export function useAppointmentsPage() {
  const { getAllAppointments } = useAppointment();
  const logger = useLogger("AppointmentsPage");
  const toast = useToast();

  const isLoading = ref(false);
  const hasError = ref(false);
  const appointments = ref<IAppointment[]>([]);
  const searchQuery = ref("");
  const activeSortCriterion = ref<SortCriterion>("newest");
  const activeStatusFilters = ref<Set<StatusFilter>>(new Set(["Todos"]));

  async function fetchAppointments(): Promise<void> {
    isLoading.value = true;
    hasError.value = false;

    try {
      const { data, error } = await getAllAppointments();

      if (error && !data) {
        logger.error("Failed to fetch appointments", { info: error.info });
        toast.error(error.info);
        throw new Error(error.info || "Error al cargar las citas");
      }

      appointments.value = data || [];
    } catch (err: unknown) {
      hasError.value = true;
      const message =
        err instanceof Error ? err.message : "Error al cargar las citas";
      logger.error(message);
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  }

  const isStatusActive = (status: StatusFilter): boolean => {
    return activeStatusFilters.value.has(status);
  };

  function toggleStatusFilter(status: StatusFilter): void {
    const next = new Set(activeStatusFilters.value);

    if (status === "Todos") {
      next.clear();
      next.add("Todos");
    } else {
      next.delete("Todos");

      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }

      if (next.size === 0) {
        next.add("Todos");
      }
    }

    activeStatusFilters.value = next;
  }

  function removeStatusFilter(status: StatusFilter): void {
    const next = new Set(activeStatusFilters.value);
    next.delete(status);

    if (next.size === 0) {
      next.add("Todos");
    }

    activeStatusFilters.value = next;
  }

  function applySortCriterion(criterion: SortCriterion): void {
    activeSortCriterion.value = criterion;
  }

  const visibleStatusBadges = computed<StatusFilter[]>(() => {
    if (activeStatusFilters.value.has("Todos")) return ["Todos"];
    return Array.from(activeStatusFilters.value) as StatusFilter[];
  });

  const filteredAppointments = computed<IAppointment[]>(() => {
    let result = [...appointments.value];

    if (searchQuery.value.trim()) {
      result = result.filter((apt) =>
        matchesSearchQuery(apt, searchQuery.value),
      );
    }

    if (!activeStatusFilters.value.has("Todos")) {
      result = result.filter((apt) => {
        const category = resolveStatusCategory(apt.appointment_status.code);
        return activeStatusFilters.value.has(category);
      });
    }

    return result.sort((a, b) =>
      compareAppointments(a, b, activeSortCriterion.value),
    );
  });

  const appointmentCount = computed(() => filteredAppointments.value.length);
  const hasAppointments = computed(() => appointmentCount.value > 0);

  return {
    isLoading: readonly(isLoading),
    hasError: readonly(hasError),
    searchQuery,
    activeSortCriterion: readonly(activeSortCriterion),
    activeStatusFilters: readonly(activeStatusFilters),
    visibleStatusBadges,
    filteredAppointments,
    appointmentCount,
    hasAppointments,
    sortOptions: SORT_OPTIONS,
    statusFilters: STATUS_FILTERS,
    fetchAppointments,
    isStatusActive,
    toggleStatusFilter,
    removeStatusFilter,
    applySortCriterion,
  };
}
