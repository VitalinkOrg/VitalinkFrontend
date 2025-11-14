<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import type { Credit } from "@/types";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

definePageMeta({
  middleware: ["auth-insurances"],
});

const loading = ref<boolean>(false);
const isRefreshing = ref<boolean>(false);
const creditsData = ref<Credit[]>([]);
const activeStatus = ref<string>("Todos");

const statusMap: Record<string, string> = {
  Todos: "Todos",
  Pendiente: "PENDING",
  Aprobada: "APPROVED",
  Rechazada: "REJECTED",
  Requerida: "REQUIREDA",
  "Aprobada Parcial": "APPROVED_PERCENTAGE",
};

const { fetchAllAppointmentCredit } = useAppointmentCredit();

const filteredCredits = computed<Credit[]>(() => {
  if (!creditsData.value || creditsData.value.length === 0) {
    return [];
  }

  if (activeStatus.value === "Todos") {
    return creditsData.value;
  }

  const filtered = creditsData.value.filter((credit) => {
    const statusCode = credit?.credit_status?.code;
    return statusCode === activeStatus.value;
  });

  return filtered;
});

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

const setStatusFilter = (status: string) => {
  activeStatus.value = status;
};

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
    { align: "center" }
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
      { text: credit.credit_status?.code || "N/A", width: columnWidths[3] },
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
          yPosition + (maxLines - lines.length) * 5
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
            placeholder="Buscar"
            aria-label="Buscar"
            max-width="320px"
          />
        </div>
        <div class="credits-page__actions">
          <button
            class="credits-page__button credits-page__button--download"
            @click="downloadAllCredits"
            :disabled="filteredCredits.length === 0"
          >
            <AtomsIconsDownloadIcon />
            <span class="credits-page__button-text">Descargar</span>
          </button>
          <button
            class="credits-page__button credits-page__button--dropdown"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span class="credits-page__button-text">Ordenar por</span>
            <span class="credits-page__button-text--short">Ordenar</span>
          </button>
          <ul class="credits-page__dropdown-menu">
            <li>
              <a class="credits-page__dropdown-item" href="#">Action</a>
            </li>
            <li>
              <a class="credits-page__dropdown-item" href="#">Another action</a>
            </li>
            <li>
              <a class="credits-page__dropdown-item" href="#"
                >Something else here</a
              >
            </li>
          </ul>
          <button
            class="credits-page__button credits-page__button--dropdown"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span class="credits-page__button-text">Estado de solicitud:</span>
            <span class="credits-page__button-text--short">Estado:</span>
            <span class="credits-page__badge">{{ activeStatus }}</span>
          </button>
          <ul class="credits-page__dropdown-menu">
            <li>
              <a
                class="credits-page__dropdown-item"
                href="#"
                @click.prevent="setStatusFilter('Todos')"
                >Todos</a
              >
            </li>
            <li>
              <a
                class="credits-page__dropdown-item"
                href="#"
                @click.prevent="setStatusFilter('Pendiente')"
                >Pendiente</a
              >
            </li>
            <li>
              <a
                class="credits-page__dropdown-item"
                href="#"
                @click.prevent="setStatusFilter('Aprobada')"
                >Aprobada</a
              >
            </li>
            <li>
              <a
                class="credits-page__dropdown-item"
                href="#"
                @click.prevent="setStatusFilter('Completada')"
                >Confirmado</a
              >
            </li>
            <li>
              <a
                class="credits-page__dropdown-item"
                href="#"
                @click.prevent="setStatusFilter('Cancelada')"
                >Cancelada</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div v-if="loading" class="credits-page__loading">
        Cargando créditos...
      </div>

      <div v-else-if="creditsData.length === 0" class="credits-page__empty">
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

    @media (min-width: 576px) {
      flex: 0 1 auto;
      font-size: 1rem;
      padding: 0.625rem 1rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--download {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      justify-content: center;

      svg {
        flex-shrink: 0;
      }
    }

    &--dropdown {
      &::after {
        content: "";
        display: inline-block;
        margin-left: 0.5rem;
        vertical-align: middle;
        border-top: 0.3em solid;
        border-right: 0.3em solid transparent;
        border-left: 0.3em solid transparent;
        flex-shrink: 0;
      }
    }

    &-text {
      display: none;

      @media (min-width: 576px) {
        display: inline;
      }

      &--short {
        display: inline;

        @media (min-width: 576px) {
          display: none;
        }
      }
    }
  }

  &__badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    margin-left: 0.25rem;
    font-size: 0.75rem;
    color: #6c757d;
    background-color: #f8f9fa;
    border-radius: 0.25rem;

    @media (min-width: 576px) {
      margin-left: 0.5rem;
      font-size: 0.875rem;
    }
  }

  &__dropdown {
    position: relative;

    &-menu {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 1000;
      display: none;
      min-width: 10rem;
      max-width: 90vw;
      padding: 0.5rem 0;
      margin: 0.125rem 0 0;
      font-size: 0.875rem;
      color: #212529;
      text-align: left;
      list-style: none;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 0.25rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);

      @media (min-width: 576px) {
        font-size: 1rem;
        left: 0;
        right: auto;
      }

      &.show {
        display: block;
      }
    }

    &-item {
      display: block;
      width: 100%;
      padding: 0.375rem 1rem;
      clear: both;
      font-weight: 400;
      color: #212529;
      text-align: inherit;
      text-decoration: none;
      white-space: nowrap;
      background-color: transparent;
      border: 0;
      cursor: pointer;

      @media (min-width: 576px) {
        padding: 0.25rem 1rem;
      }

      &:hover {
        color: #1e2125;
        background-color: #f8f9fa;
      }
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
</style>
