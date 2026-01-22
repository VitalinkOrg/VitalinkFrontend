// pages\socio-financiero\creditos.vue

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import type { Credit } from "@/types";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

definePageMeta({
  middleware: ["auth-insurances"],
});

type SortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc"
  | "status"
  | "patient";

const loading = ref<boolean>(false);
const isRefreshing = ref<boolean>(false);
const creditsData = ref<Credit[]>([]);
const selectedStatuses = ref<Set<string>>(new Set(["Todos"]));
const sortOption = ref<SortOption>("date-desc");
const searchQuery = ref<string>("");

const statusMap: Record<string, string> = {
  Todos: "Todos",
  Pendiente: "PENDING",
  Aprobada: "APPROVED",
  Rechazada: "REJECTED",
  Requerida: "REQUIREDA",
  "Aprobada Parcial": "APPROVED_PERCENTAGE",
};

const { fetchAllAppointmentCredit } = useAppointmentCredit();

const isStatusSelected = (status: string): boolean => {
  return selectedStatuses.value.has(status);
};

const toggleStatus = (status: string): void => {
  const newSelectedStatuses = new Set(selectedStatuses.value);

  if (status === "Todos") {
    newSelectedStatuses.clear();
    newSelectedStatuses.add("Todos");
  } else {
    newSelectedStatuses.delete("Todos");

    if (newSelectedStatuses.has(status)) {
      newSelectedStatuses.delete(status);
    } else {
      newSelectedStatuses.add(status);
    }

    if (newSelectedStatuses.size === 0) {
      newSelectedStatuses.add("Todos");
    }
  }

  selectedStatuses.value = newSelectedStatuses;
};

const removeStatusBadge = (status: string): void => {
  const newSelectedStatuses = new Set(selectedStatuses.value);
  newSelectedStatuses.delete(status);

  if (newSelectedStatuses.size === 0) {
    newSelectedStatuses.add("Todos");
  }

  selectedStatuses.value = newSelectedStatuses;
};

const selectedStatusBadges = computed((): string[] => {
  if (selectedStatuses.value.has("Todos")) {
    return ["Todos"];
  }
  return Array.from(selectedStatuses.value);
});

const filteredCredits = computed<Credit[]>(() => {
  if (!creditsData.value || creditsData.value.length === 0) {
    return [];
  }

  let filtered = [...creditsData.value];

  // Búsqueda
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((credit) => {
      const patientName =
        credit.appointment?.customer?.name?.toLowerCase() || "";
      const observations = credit.credit_observations?.toLowerCase() || "";
      const statusName = credit.credit_status?.name?.toLowerCase() || "";
      const amount = credit.requested_amount?.toString() || "";

      return (
        patientName.includes(query) ||
        observations.includes(query) ||
        statusName.includes(query) ||
        amount.includes(query)
      );
    });
  }

  // Filtrar por estado
  if (!selectedStatuses.value.has("Todos")) {
    filtered = filtered.filter((credit) => {
      const statusCode = credit?.credit_status?.code;
      return Array.from(selectedStatuses.value).some((selectedStatus) => {
        const mappedCode = statusMap[selectedStatus];
        return statusCode === mappedCode;
      });
    });
  }

  // Ordenar
  return sortCredits(filtered);
});

const sortCredits = (credits: Credit[]) => {
  const sorted = [...credits];

  switch (sortOption.value) {
    case "date-desc":
      return sorted.sort((a, b) => {
        const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
        const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
        return dateB - dateA;
      });
    case "date-asc":
      return sorted.sort((a, b) => {
        const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
        const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
        return dateA - dateB;
      });
    case "amount-desc":
      return sorted.sort((a, b) => {
        const amountA = parseFloat(a.requested_amount || "0");
        const amountB = parseFloat(b.requested_amount || "0");
        return amountB - amountA;
      });
    case "amount-asc":
      return sorted.sort((a, b) => {
        const amountA = parseFloat(a.requested_amount || "0");
        const amountB = parseFloat(b.requested_amount || "0");
        return amountA - amountB;
      });
    case "status":
      return sorted.sort((a, b) => {
        const statusA = a.credit_status?.code || "";
        const statusB = b.credit_status?.code || "";
        return statusA.localeCompare(statusB);
      });
    case "patient":
      return sorted.sort((a, b) => {
        const patientA = a.appointment?.customer?.name || "";
        const patientB = b.appointment?.customer?.name || "";
        return patientA.localeCompare(patientB);
      });
    default:
      return sorted;
  }
};

const applySortOption = (option: SortOption) => {
  sortOption.value = option;
};

interface SortOptionType {
  label: string;
  value: SortOption;
}

const sortOptions: SortOptionType[] = [
  { label: "Fecha (más reciente)", value: "date-desc" },
  { label: "Fecha (más antigua)", value: "date-asc" },
  { label: "Monto (mayor a menor)", value: "amount-desc" },
  { label: "Monto (menor a mayor)", value: "amount-asc" },
  { label: "Estado", value: "status" },
  { label: "Paciente (A-Z)", value: "patient" },
];

const loadCredits = async () => {
  loading.value = true;
  try {
    const api = fetchAllAppointmentCredit();
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (error) {
      console.error("Error al cargar créditos:", error);
      creditsData.value = [];
      return;
    }

    if (response?.data && Array.isArray(response.data)) {
      creditsData.value = response.data;
    } else {
      console.warn("No se recibieron datos de créditos");
      creditsData.value = [];
    }
  } catch (error) {
    console.error("Error al cargar créditos:", error);
    creditsData.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCredits = async (isRefresh: boolean = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const api = fetchAllAppointmentCredit();
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (error) {
      console.error("Error al actualizar créditos:", error);
      return;
    }

    if (response?.data && Array.isArray(response.data)) {
      creditsData.value = response.data;
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

const refreshCredits = async () => {
  await fetchCredits(true);
};

provide("refreshCredits", refreshCredits);

const handleRefresh = async () => {
  await refreshCredits();
};

provide("handleRefresh", handleRefresh);

const downloadAllCredits = () => {
  const currentCredits = filteredCredits.value;
  if (!currentCredits || currentCredits.length === 0) {
    console.warn("No hay créditos para descargar");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Solicitudes de Crédito", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const headers = [
    "Paciente",
    "Procedimiento",
    "Monto",
    "Estado",
    "Proveedor",
    "Fecha",
  ];
  const columnWidths = [30, 40, 20, 25, 45, 25];
  const columnPositions = [margin];
  for (let i = 1; i < columnWidths.length; i++) {
    columnPositions[i] = columnPositions[i - 1] + columnWidths[i - 1];
  }

  headers.forEach((header, i) => {
    doc.text(header, columnPositions[i], yPosition);
  });
  yPosition += 8;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  currentCredits.forEach((credit, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const originalY = yPosition;
    let maxLines = 1;

    const cells = [
      {
        text: credit.appointment?.customer?.name || "N/A",
        width: columnWidths[0],
      },
      { text: credit.credit_observations || "N/A", width: columnWidths[1] },
      { text: `$${credit.requested_amount || 0}`, width: columnWidths[2] },
      { text: credit.credit_status?.name || "N/A", width: columnWidths[3] },
      {
        text:
          credit.appointment?.supplier?.services?.[0]?.medical_specialty
            ?.name || "N/A",
        width: columnWidths[4],
      },
      {
        text: credit.created_date
          ? new Date(credit.created_date).toLocaleDateString("es-ES")
          : new Date().toLocaleDateString("es-ES"),
        width: columnWidths[5],
      },
    ];

    cells.forEach((cell, i) => {
      if (i !== 2 && i !== 3 && i !== 5) {
        const lines = doc.splitTextToSize(cell.text, cell.width - 2);
        maxLines = Math.max(maxLines, lines.length);
      }
    });

    cells.forEach((cell, i) => {
      doc.setFontSize(10);
      if (i === 2) doc.setTextColor(40, 100, 40);

      if (i !== 2 && i !== 3 && i !== 5) {
        const lines = doc.splitTextToSize(cell.text, cell.width - 2);
        doc.text(
          lines,
          columnPositions[i],
          yPosition + (maxLines - lines.length) * 5,
        );
      } else {
        doc.text(cell.text, columnPositions[i], yPosition);
      }

      if (i === 2) doc.setTextColor(0);
    });

    yPosition += maxLines * 6;

    if (index < currentCredits.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0);
      yPosition += 4;
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total solicitudes: ${currentCredits.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  doc.save(`Reporte_Creditos_${new Date().toISOString().slice(0, 10)}.pdf`);
};

provide("refreshAppointments", refreshCredits);

onMounted(async () => {
  await loadCredits();
});
</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <UiHeaderBreadcrumb title="Solicitudes de Crédito de Pacientes" />
    <div class="credits-page">
      <div class="credits-page__header">
        <div class="credits-page__search">
          <UiSearchInput
            v-model="searchQuery"
            placeholder="Buscar"
            aria-label="Buscar en solicitudes de crédito"
            max-width="320px"
          />
        </div>
        <div class="credits-page__actions">
          <button
            class="credits-page__button credits-page__button--download"
            @click="downloadAllCredits"
            :disabled="filteredCredits.length === 0"
            :aria-label="`Descargar reporte de ${filteredCredits.length} créditos`"
          >
            <AtomsIconsDownloadIcon size="20" aria-hidden="true" />
            <span class="credits-page__button-text">Descargar</span>
          </button>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="dropdown-button__text">Ordenar por</span>
              <span
                class="dropdown-button__icon icon-chevron-down"
                aria-hidden="true"
              />
            </template>
            <template #menu>
              <li
                v-for="option in sortOptions"
                :key="option.value"
                class="credits-page__dropdown-item"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="dropdown__item"
                  @click="applySortOption(option.value)"
                  :aria-pressed="sortOption === option.value"
                >
                  {{ option.label }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="dropdown-button__text">Estado de solicitud:</span>
              <div class="badges-container" aria-live="polite">
                <span
                  v-for="status in selectedStatusBadges"
                  :key="status"
                  class="badge"
                  :aria-label="`Filtro activo: ${status}`"
                >
                  {{ status }}
                  <button
                    v-if="status !== 'Todos'"
                    type="button"
                    class="badge__remove"
                    @click.stop="removeStatusBadge(status)"
                    :aria-label="`Remover filtro ${status}`"
                  >
                    <AtomsIconsXIcon size="14" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </template>
            <template #menu>
              <li
                v-for="status in Object.keys(statusMap)"
                :key="status"
                class="credits-page__dropdown-item"
                role="none"
              >
                <label class="credits-page__checkbox-label">
                  <input
                    type="checkbox"
                    class="credits-page__checkbox"
                    :checked="isStatusSelected(status)"
                    @change="toggleStatus(status)"
                    :aria-label="`${isStatusSelected(status) ? 'Deseleccionar' : 'Seleccionar'} filtro ${status}`"
                  />
                  <span
                    class="credits-page__checkbox-custom"
                    aria-hidden="true"
                  ></span>
                </label>
                <button
                  type="button"
                  role="menuitem"
                  class="dropdown__item"
                  @click="toggleStatus(status)"
                  :aria-pressed="isStatusSelected(status)"
                >
                  {{ status }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>
        </div>
      </div>

      <div v-if="loading" class="credits-page__loading">
        Cargando créditos...
      </div>

      <div
        v-else-if="creditsData.length === 0"
        class="credits-page__empty"
        role="status"
      >
        No hay solicitudes de crédito disponibles
      </div>

      <div v-else class="credits-page__card">
        <AseguradorasCreditoTable :credits="filteredCredits" />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.credits-page {
  padding: 0 1rem;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__search {
    width: 100%;

    @media (min-width: 768px) {
      width: auto;
      margin-right: auto;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;

    @media (min-width: 768px) {
      width: auto;
      margin-left: auto;
      flex-wrap: nowrap;
    }
  }

  &__button {
    @include outline-button;
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    gap: 0.375rem;

    @media (min-width: 576px) {
      flex: 0 1 auto;
      font-size: 1rem;
      padding: 0.625rem 1rem;
      gap: 0.5rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--download {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        flex-shrink: 0;
      }
    }

    &-text {
      @include respond-to-max(sm) {
        display: none;
      }
    }
  }

  &__dropdown-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    align-items: center;

    &:hover {
      background-color: #f1f3f7;
    }
  }

  &__checkbox-label {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  &__checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:focus-visible + &-custom {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:checked + &-custom {
      background-color: $color-primary;
      border-color: $color-primary;

      &::after {
        opacity: 1;
      }
    }
  }

  &__checkbox-custom {
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid #dee2e6;
    border-radius: 0.25rem;
    background: $white;
    position: relative;
    transition: all 0.2s ease;

    &::after {
      content: "";
      position: absolute;
      left: 0.25rem;
      top: 0.0625rem;
      width: 0.375rem;
      height: 0.625rem;
      border: solid $white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &__card {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    overflow-x: auto;
  }

  &__loading,
  &__empty {
    padding: 2rem 1rem;
    text-align: center;
    color: #6c757d;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;

    @media (min-width: 576px) {
      padding: 3rem;
    }
  }
}

.dropdown-button {
  &__text {
    @include respond-to-max(sm) {
      font-size: 0.875rem;
    }
  }

  &__icon {
    margin-left: 0.25rem;

    @include respond-to-max(sm) {
      margin-left: 0.125rem;
    }
  }
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-left: 0.5rem;

  @include respond-to-max(sm) {
    margin-left: 0.25rem;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 1rem;
  padding: 0.125rem 0.5rem;
  background-color: #f2f4f7;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: #344054;

  @include respond-to-max(sm) {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover,
    &:focus-visible {
      background-color: rgba(0, 0, 0, 0.05);
      color: #344054;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }
}

.dropdown__item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  @include respond-to-max(sm) {
    font-size: 0.8125rem;
    padding: 0.625rem 0;
  }

  &:hover,
  &:focus-visible {
    color: $color-primary;
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &[aria-pressed="true"] {
    font-weight: 600;
    color: $color-primary;
  }
}

.visually-hidden {
  @include visually-hidden;
}
</style>
