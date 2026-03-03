<script setup lang="ts">
import { useAppointment } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import { jsPDF } from "jspdf";
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue";

definePageMeta({
  middleware: "auth-pacientes",
});

type SortOption = "date-desc" | "date-asc" | "status" | "supplier";

const SORT_OPTIONS: readonly { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Fecha (más reciente)" },
  { value: "date-asc", label: "Fecha (más antigua)" },
  { value: "status", label: "Estado" },
  { value: "supplier", label: "Clínica/Hospital" },
] as const;

const logger = useLogger("PacientesCitas");
const toast = useToast();

const sortDropdownOpen = ref(false);
const searchQuery = ref("");
const sortOption = ref<SortOption>("date-desc");
const isRefreshing = ref(false);
const hasInitialLoadError = ref(false);
const appointments = ref<IAppointment[]>([]);

const isLoading = ref<boolean>(true);

const { getAllAppointments } = useAppointment();

function getSearchableText(appointment: IAppointment): string {
  const fields: (string | null | undefined)[] = [
    appointment.appointment_type?.value1,
    appointment.appointment_status?.value1,
    appointment.supplier?.name,
    appointment.supplier?.city_name,
    appointment.supplier?.province,
    appointment.package?.procedure?.name,
    appointment.package?.product?.name,
    appointment.customer?.name,
    appointment.customer?.card_id,
    appointment.customer?.email,
    appointment.customer?.phone_number,
    appointment.reservation_type?.name,
    appointment.payment_status?.value1,
    appointment.user_description,
    appointment.appointment_qr_code,
    appointment.appointment_date
      ? new Date(appointment.appointment_date).toLocaleDateString("es-ES")
      : null,
    appointment.appointment_hour,
    appointment.appointment_credit?.credit_status?.name,
    appointment.appointment_credit?.credit_observations,
  ];

  return fields.filter(Boolean).join(" ").toLowerCase();
}

function matchesSearch(appointment: IAppointment, query: string): boolean {
  if (!query) return true;
  return getSearchableText(appointment).includes(query.toLowerCase().trim());
}

function buildAppointmentDate(appt: IAppointment): number {
  const dateStr = `${appt.appointment_date} ${appt.appointment_hour}`;
  const parsed = new Date(dateStr).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortAppointments(
  list: IAppointment[],
  option: SortOption,
): IAppointment[] {
  const sorted = [...list];

  switch (option) {
    case "date-desc":
      return sorted.sort(
        (a, b) => buildAppointmentDate(b) - buildAppointmentDate(a),
      );
    case "date-asc":
      return sorted.sort(
        (a, b) => buildAppointmentDate(a) - buildAppointmentDate(b),
      );
    case "status":
      return sorted.sort((a, b) =>
        (a.appointment_status?.value1 ?? "").localeCompare(
          b.appointment_status?.value1 ?? "",
        ),
      );
    case "supplier":
      return sorted.sort((a, b) =>
        (a.supplier?.name ?? "").localeCompare(b.supplier?.name ?? ""),
      );
    default:
      return sorted;
  }
}

const displayAppointments = computed<IAppointment[]>(() => {
  const query = searchQuery.value.trim();
  const filtered = appointments.value.filter((appt) =>
    matchesSearch(appt, query),
  );
  return sortAppointments(filtered, sortOption.value);
});

const hasAppointments = computed(() => displayAppointments.value.length > 0);

async function loadAppointments(): Promise<void> {
  try {
    const { data, error } = await getAllAppointments();

    if (error) {
      const message = error.info || error.status?.message;
      logger.error("Error de API al cargar citas", { error: message });
      toast.error(message || "No se pudieron cargar las citas");
      hasInitialLoadError.value = appointments.value.length === 0;
      return;
    }

    if (Array.isArray(data)) {
      appointments.value = data;
      hasInitialLoadError.value = false;
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    logger.error("Excepción al cargar citas", { error: errorMessage });
    toast.error("No se pudieron cargar las citas. Intenta de nuevo.");
    hasInitialLoadError.value = appointments.value.length === 0;
  } finally {
    isLoading.value = false;
  }
}

async function refreshAppointments(): Promise<void> {
  isRefreshing.value = true;
  try {
    await loadAppointments();
  } finally {
    isRefreshing.value = false;
  }
}

function applySortOption(option: SortOption): void {
  sortOption.value = option;
  sortDropdownOpen.value = false;
}

function toggleSortDropdown(): void {
  sortDropdownOpen.value = !sortDropdownOpen.value;
}

function closeSortDropdown(): void {
  sortDropdownOpen.value = false;
}

function clearSearch(): void {
  searchQuery.value = "";
}

function handleSortKeydown(event: KeyboardEvent, option: SortOption): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    applySortOption(option);
  }
}

function handleSortToggleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    closeSortDropdown();
  }
}

function handleClickOutsideSort(event: MouseEvent): void {
  if (!sortDropdownOpen.value) return;
  const target = event.target as HTMLElement;
  if (!target.closest(".citas-sort")) {
    closeSortDropdown();
  }
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "N/A";
  return num.toLocaleString("es-CR", { style: "currency", currency: "CRC" });
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("es-ES");
  } catch {
    return "N/A";
  }
}

function downloadAppointmentsSummary(): void {
  const data = displayAppointments.value;

  if (data.length === 0) {
    toast.warning("No hay citas disponibles para descargar.");
    return;
  }

  try {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 20;

    const ensureSpace = (needed: number): void => {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addField = (
      label: string,
      value: string,
      xLabel = 25,
      xValue = 70,
      fontSize = 10,
    ): void => {
      ensureSpace(8);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, xLabel, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/A", xValue, y);
      y += 6;
    };

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Mis Citas Médicas", 105, y, { align: "center" });
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 12;

    const patient = data[0]?.customer;
    if (patient) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Información del Paciente", 20, y);
      y += 10;

      addField("Nombre", patient.name, 20, 60, 12);
      addField("Cédula", patient.card_id, 20, 60, 12);
      addField("Email", patient.email, 20, 60, 12);
      addField("Teléfono", patient.phone_number, 20, 60, 12);
      addField(
        "Dirección",
        `${patient.city_name ?? ""}, ${patient.province ?? ""}`,
        20,
        60,
        12,
      );
      y += 5;
    }

    addField("Total de citas", data.length.toString(), 20, 65, 12);
    y += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detalle de Citas", 20, y);
    y += 10;

    data.forEach((appt, index) => {
      ensureSpace(80);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y - 5, 170, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Cita ${index + 1} — ${appt.appointment_type?.value1 ?? "N/A"}`,
        22,
        y,
      );
      y += 12;

      addField("Fecha", formatDate(appt.appointment_date));
      addField("Hora", appt.appointment_hour ?? "N/A");

      if (appt.supplier) {
        addField("Clínica/Hospital", appt.supplier.name);
        addField(
          "Ubicación",
          `${appt.supplier.city_name ?? ""}, ${appt.supplier.province ?? ""}`,
        );
        addField("Teléfono", appt.supplier.phone_number);
      }

      if (appt.package) {
        addField("Procedimiento", appt.package.procedure?.name ?? "");
        addField("Producto", appt.package.product?.name ?? "");
      }

      addField("Estado", appt.appointment_status?.value1 ?? "");
      addField("Tipo de reserva", appt.reservation_type?.name ?? "");

      if (appt.payment_status) {
        addField("Estado de pago", appt.payment_status.value1 ?? "");
      }

      if (appt.price_procedure) {
        addField("Precio procedimiento", formatCurrency(appt.price_procedure));
      }

      if (appt.price_valoration_appointment) {
        addField(
          "Precio valoración",
          formatCurrency(appt.price_valoration_appointment),
        );
      }

      if (appt.appointment_credit) {
        y += 3;
        ensureSpace(30);
        doc.setFont("helvetica", "bold");
        doc.text("Información de Crédito:", 25, y);
        y += 6;

        addField(
          "Estado crédito",
          appt.appointment_credit.credit_status?.name ?? "",
        );
        addField(
          "Monto solicitado",
          formatCurrency(appt.appointment_credit.requested_amount),
        );
        addField(
          "Monto aprobado",
          formatCurrency(appt.appointment_credit.approved_amount),
        );

        if (appt.appointment_credit.credit_observations) {
          addField(
            "Observaciones",
            appt.appointment_credit.credit_observations,
          );
        }
      }

      if (appt.user_description) {
        y += 3;
        ensureSpace(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Descripción:", 25, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(appt.user_description, 140);
        doc.text(lines, 25, y);
        y += lines.length * 6;
      }

      if (appt.appointment_qr_code) {
        addField("Código QR", appt.appointment_qr_code);
      }

      y += 8;
    });

    const footerY = pageHeight - 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Documento generado el: ${new Date().toLocaleDateString("es-ES")}`,
      20,
      footerY,
    );
    doc.text("Vitalink — Sistema de Gestión Médica", 105, footerY, {
      align: "center",
    });

    const safeName = (patient?.name ?? "Usuario").replace(/\s+/g, "_");
    const dateSlug = new Date().toISOString().split("T")[0];
    doc.save(`${safeName}_Citas_${dateSlug}.pdf`);

    toast.success("Resumen descargado correctamente.");
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    logger.error("Error al generar PDF", { error: errorMessage });
    toast.error("No se pudo generar el PDF. Intenta de nuevo.");
  }
}

onMounted(async () => {
  document.addEventListener("click", handleClickOutsideSort);
  await loadAppointments();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutsideSort);
});

provide("refreshAppointments", refreshAppointments);
provide("handleRefresh", refreshAppointments);
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div
      v-if="isLoading && appointments.length === 0"
      class="citas-page__loader"
      role="status"
      aria-live="polite"
      aria-label="Cargando citas"
    >
      <span class="visually-hidden">Cargando citas…</span>
    </div>

    <section
      v-else-if="hasInitialLoadError"
      class="citas-page__error"
      role="alert"
      aria-live="assertive"
    >
      <p class="citas-page__error-message">No se pudieron cargar las citas.</p>
      <button
        class="citas-page__retry-button"
        :disabled="isLoading"
        @click="loadAppointments"
      >
        {{ isLoading ? "Cargando…" : "Reintentar" }}
      </button>
    </section>

    <main v-else class="citas-page" aria-label="Gestión de citas médicas">
      <section class="citas-page__content">
        <header class="citas-page__header">
          <h1 class="citas-page__title">Mis Citas</h1>

          <NuxtLink
            href="/buscar"
            class="citas-page__new-appointment"
            aria-label="Crear nueva cita médica"
          >
            <AtomsIconsPlusIcon aria-hidden="true" />
            Nueva Cita
          </NuxtLink>
        </header>

        <div
          class="citas-page__toolbar"
          role="toolbar"
          aria-label="Herramientas de citas"
        >
          <UiSearchInput
            v-model="searchQuery"
            placeholder="Buscar citas…"
            aria-label="Buscar en mis citas"
            max-width="320px"
            @clear="clearSearch"
          />

          <div class="citas-toolbar">
            <button
              class="citas-toolbar__button citas-toolbar__button--download"
              :disabled="!hasAppointments"
              :aria-disabled="!hasAppointments"
              aria-label="Descargar resumen de citas en PDF"
              @click="downloadAppointmentsSummary"
            >
              <AtomsIconsDownloadIcon size="20" aria-hidden="true" />
              Descargar
            </button>

            <div class="citas-sort" @keydown="handleSortToggleKeydown">
              <button
                class="citas-sort__toggle"
                type="button"
                :aria-expanded="sortDropdownOpen"
                aria-haspopup="listbox"
                aria-label="Ordenar citas"
                @click="toggleSortDropdown"
              >
                Ordenar por
                <AtomsIconsChevronDown
                  size="20"
                  aria-hidden="true"
                  :class="{ 'citas-sort__chevron--open': sortDropdownOpen }"
                />
              </button>

              <ul
                v-show="sortDropdownOpen"
                class="citas-sort__menu"
                role="listbox"
                aria-label="Opciones de ordenamiento"
              >
                <li
                  v-for="opt in SORT_OPTIONS"
                  :key="opt.value"
                  role="option"
                  :aria-selected="sortOption === opt.value"
                  class="citas-sort__item"
                  :class="{
                    'citas-sort__item--active': sortOption === opt.value,
                  }"
                  tabindex="0"
                  @click="applySortOption(opt.value)"
                  @keydown="handleSortKeydown($event, opt.value)"
                >
                  {{ opt.label }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div aria-live="polite" class="citas-page__results">
          <div
            v-if="isRefreshing"
            class="citas-page__refreshing-banner"
            role="status"
            aria-live="polite"
          >
            <span class="visually-hidden">Actualizando citas…</span>
            Actualizando…
          </div>

          <div class="citas-page__table-container">
            <PacientesCitasTable :appointments="displayAppointments" />
          </div>
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.citas-page {
  background-color: #f8f9fa;
  min-height: 100vh;

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 40vh;
    padding: 2rem;
    text-align: center;
  }

  &__error-message {
    font-family: $font-family-main;
    font-size: 1rem;
    color: $color-error;
    margin: 0;
  }

  &__retry-button {
    @include primary-button;
    min-width: 10rem;
  }

  &__content {
    padding: 1.5rem;

    @include respond-to-max(md) {
      padding: 1rem;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-size: 1.25rem;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
  }

  &__new-appointment {
    @include primary-button;
    white-space: nowrap;
    min-width: fit-content;
    padding: 0.5rem 0.875rem;
    gap: 0.5rem;

    @include respond-to-max(md) {
      width: 100%;
      justify-content: center;
    }
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__results {
    position: relative;
  }

  &__refreshing-banner {
    background-color: rgba($color-primary, 0.08);
    color: $color-primary;
    text-align: center;
    padding: 0.5rem;
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem 0.375rem 0 0;
  }

  &__table-container {
    background: $white;
    border-radius: 0.5rem;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem 1.5rem;
    background: $white;
    border-radius: 0.5rem;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  &__empty-text {
    font-family: $font-family-main;
    font-size: 0.9375rem;
    color: $color-text-muted;
    margin: 0;
  }

  &__empty-action {
    @include gradient-button;
    text-decoration: none;
    font-size: 0.875rem;
    padding: 0.625rem 1.25rem;
  }
}

.citas-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;

  @include respond-to-max(md) {
    margin-left: 0;
    justify-content: space-between;
  }

  &__button {
    @include outline-button;
    white-space: nowrap;

    &--download {
      @include respond-to-max(sm) {
        flex: 1;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__icon--spinning {
    animation: spin-icon 0.8s linear infinite;
  }
}

.citas-sort {
  position: relative;

  &__toggle {
    @include outline-button;
    white-space: nowrap;
    position: relative;

    @include respond-to-max(sm) {
      flex: 1;
    }
  }

  &__chevron--open {
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }

  &__menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: $color-foreground;
    text-align: left;
    list-style: none;
    background-color: $white;
    border: 0.0625rem solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow: 0 0.375rem 0.75rem rgba(0, 0, 0, 0.175);

    @include respond-to-max(sm) {
      left: 0;
      right: auto;
      min-width: 100%;
    }
  }

  &__item {
    @include link-base;
    display: block;
    padding: 0.5rem 1rem;
    font-weight: 400;
    color: $color-foreground;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover,
    &:focus-visible {
      background-color: #f8f9fa;
      outline: none;
    }

    &--active {
      color: $color-primary;
      font-weight: 600;
      background-color: rgba($color-primary, 0.04);
    }
  }
}

.visually-hidden {
  @include visually-hidden;
}

@keyframes spin-icon {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
