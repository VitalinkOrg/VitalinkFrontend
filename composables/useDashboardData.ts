import { useAppointment } from "@/composables/api";

interface DashboardStats {
  pendingAppointments: number;
  completedAppointments: number;
  reviewsCount: number;
  uniqueProceduresCount: number;
}

interface DashboardState {
  stats: DashboardStats;
  allAppointments: IAppointment[];
  historyAppointments: IAppointment[];
}

type TimeFilterValue = "7" | "30" | "60" | "90";

interface TimeFilterOption {
  value: TimeFilterValue;
  label: string;
}

const TIME_FILTER_OPTIONS: readonly TimeFilterOption[] = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "60", label: "Últimos 60 días" },
  { value: "90", label: "Últimos 90 días" },
] as const;

const PENDING_STATUSES: ReadonlySet<string> = new Set([
  "PENDING_VALORATION_APPOINTMENT",
  "PENDING_PROCEDURE",
  "CONFIRM_VALIDATION_APPOINTMENT",
  "CONFIRM_PROCEDURE",
  "WAITING_PROCEDURE",
]);

const COMPLETED_STATUSES: ReadonlySet<string> = new Set([
  "CONCRETED_APPOINTMENT",
  "VALUED_VALORATION_APPOINTMENT",
]);

const HISTORY_STATUSES: ReadonlySet<string> = new Set([
  "CONCRETED_APPOINTMENT",
  "VALUED_VALORATION_APPOINTMENT",
  "CANCEL_APPOINTMENT",
]);

function buildEmptyStats(): DashboardStats {
  return {
    pendingAppointments: 0,
    completedAppointments: 0,
    reviewsCount: 0,
    uniqueProceduresCount: 0,
  };
}

function computeStats(appointments: IAppointment[]): DashboardStats {
  let pending = 0;
  let completed = 0;
  let reviewed = 0;
  const uniqueProcedures = new Set<string>();

  for (const appointment of appointments) {
    const statusCode = appointment.appointment_status?.code;

    if (statusCode === "CANCEL_APPOINTMENT") continue;

    if (PENDING_STATUSES.has(statusCode)) pending++;
    if (COMPLETED_STATUSES.has(statusCode)) completed++;
    if (appointment.appointment_result) reviewed++;

    const procedureCode = appointment.package?.procedure?.code;
    if (procedureCode) uniqueProcedures.add(procedureCode);
  }

  return {
    pendingAppointments: pending,
    completedAppointments: completed,
    reviewsCount: reviewed,
    uniqueProceduresCount: uniqueProcedures.size,
  };
}

function filterHistoryAppointments(
  appointments: IAppointment[],
): IAppointment[] {
  return appointments.filter((apt) =>
    HISTORY_STATUSES.has(apt.appointment_status?.code),
  );
}

export function useDashboardData() {
  const { getAllAppointments } = useAppointment();
  const logger = useLogger("DashboardData");
  const toast = useToast();

  const isLoading = ref(true);
  const hasError = ref(false);
  const selectedFilter = ref<TimeFilterValue>("30");

  const state = ref<DashboardState>({
    stats: buildEmptyStats(),
    allAppointments: [],
    historyAppointments: [],
  });

  const selectedFilterLabel = computed<string>(() => {
    return (
      TIME_FILTER_OPTIONS.find((opt) => opt.value === selectedFilter.value)
        ?.label ?? "Últimos 30 días"
    );
  });

  const hasAppointments = computed(
    () => state.value.allAppointments.length > 0,
  );

  async function loadData(): Promise<void> {
    isLoading.value = true;
    hasError.value = false;

    try {
      const { data, error } = await getAllAppointments();

      if (error && !data) {
        logger.error("Failed to fetch appointments", { info: error.info });
        toast.error(error.info);
        throw new Error(error.info || "Error al cargar las citas");
      }

      const appointments: IAppointment[] = Array.isArray(data) ? data : [];

      state.value = {
        stats: computeStats(appointments),
        allAppointments: appointments,
        historyAppointments: filterHistoryAppointments(appointments),
      };

      useRefreshToken();
    } catch (err: unknown) {
      hasError.value = true;
      const message =
        err instanceof Error
          ? err.message
          : "Error al cargar los datos del dashboard";
      logger.error(message, { filter: selectedFilter.value });
      toast.error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function changeFilter(value: TimeFilterValue): void {
    selectedFilter.value = value;
    loadData();
  }

  return {
    isLoading: readonly(isLoading),
    hasError: readonly(hasError),
    state: readonly(state),
    selectedFilter: readonly(selectedFilter),
    selectedFilterLabel,
    hasAppointments,
    timeFilterOptions: TIME_FILTER_OPTIONS,
    loadData,
    changeFilter,
  };
}
