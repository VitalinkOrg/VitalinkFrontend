<script setup>
import { useRefreshToken } from "#imports";
import { jsPDF } from "jspdf";
import { computed, ref, watch } from "vue";

definePageMeta({
  middleware: "auth-pacientes",
});

const VALORATION_STATUS_CODES = [
  "PENDING_VALORATION_APPOINTMENT",
  "CONFIRM_VALIDATION_APPOINTMENT",
  "VALUATION_PENDING_VALORATION_APPOINTMENT",
  "VALUED_VALORATION_APPOINTMENT",
];

const PROCEDURE_STATUS_CODES = [
  "PENDING_PROCEDURE",
  "CONFIRM_PROCEDURE",
  "WAITING_PROCEDURE",
  "CONCRETED_APPOINTMENT",
  "CANCEL_APPOINTMENT",
];

const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const loading = ref(false);
const isRefreshing = ref(false);
const previousAppointments = ref([]);

const appointmentsResponse = ref(null);

const appointmentsData = computed(() => {
  return appointmentsResponse.value || previousAppointments.value;
});

const { data: fetchedData } = await useFetch(
  config.public.API_BASE_URL + "/appointment/get_all",
  {
    headers: { Authorization: token.value },
    params: {
      customer_id: user_info.id,
    },
    transform: (_appointments) => _appointments.data,
  }
);

if (fetchedData.value) {
  appointmentsResponse.value = fetchedData.value;
  previousAppointments.value = fetchedData.value;
  useRefreshToken();
}

const fetchAppointments = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await useFetch(
      config.public.API_BASE_URL + "/appointment/get_all",
      {
        headers: { Authorization: token.value },
        params: { customer_id: user_info.id },
        transform: (_appointments) => _appointments.data,
        server: false,
        key: isRefresh ? `appointments-${Date.now()}` : "appointments",
      }
    );

    if (data.value) {
      if (appointmentsResponse.value) {
        previousAppointments.value = appointmentsResponse.value;
      }

      appointmentsResponse.value = data.value;
      useRefreshToken();
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

watch(
  appointmentsResponse,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      previousAppointments.value = oldVal;
    }
  },
  { deep: true }
);

fetchAppointments();

const refreshAppointments = async () => {
  await fetchAppointments(true);
};

provide("refreshAppointments", refreshAppointments);

const tab = ref(1);
const sort = ref(false);
const filteredAppointments = ref([]);
const searchQuery = ref("");

const displayAppointments = computed(() => {
  const sourceData = appointmentsData.value || [];
  let filtered = [...sourceData];

  if (tab.value === 2) {
    filtered = filtered.filter((appointment) => {
      const statusCode = appointment.appointment_status?.code;
      return statusCode && PROCEDURE_STATUS_CODES.includes(statusCode);
    });
  } else if (tab.value === 3) {
    filtered = filtered.filter((appointment) => {
      const statusCode = appointment.appointment_status?.code;
      return statusCode && VALORATION_STATUS_CODES.includes(statusCode);
    });
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((appointment) => {
      const searchableFields = [
        appointment.appointment_type?.value1,
        appointment.appointment_status?.value1,
        appointment.supplier?.name,
        appointment.supplier?.city_name,
        appointment.supplier?.province,
        appointment.package?.procedure?.name,
        appointment.package?.product?.name,
        appointment.package?.product?.description,
        appointment.customer?.name,
        appointment.customer?.card_id,
        appointment.customer?.email,
        appointment.customer?.phone_number,
        appointment.reservation_type?.name,
        appointment.payment_method?.name,
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

      return searchableFields.some(
        (field) => field && field.toString().toLowerCase().includes(query)
      );
    });
  }

  return filtered;
});

const getAppointmentTypeByStatus = (statusCode) => {
  if (PROCEDURE_STATUS_CODES.includes(statusCode)) {
    return "Procedimiento";
  } else if (VALORATION_STATUS_CODES.includes(statusCode)) {
    return "Valoración";
  }
  return "Otro";
};

const getFilterText = () => {
  if (tab.value === 1) return "Todas las citas";
  if (tab.value === 2) return "Procedimientos";
  if (tab.value === 3) return "Valoraciones";
  return "Todas las citas";
};

const applyFilter = (typeFilter, tabNumber) => {
  tab.value = tabNumber;
};

const clearSearch = () => {
  searchQuery.value = "";
};

const handleRefresh = async () => {
  await refreshAppointments();
};

const downloadAppointmentsSummary = () => {
  if (!displayAppointments.value || displayAppointments.value.length === 0) {
    console.warn("No hay citas disponibles para descargar");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Mis Citas Médicas", 105, 20, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Información del Paciente", 20, 35);

  let yPosition = 45;
  doc.setFontSize(12);

  const addPatientField = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont("helvetica", "normal");
    const text = value || "N/A";
    doc.text(text, 60, yPosition);
    yPosition += 7;
  };

  const firstAppointment = displayAppointments.value[0];
  if (firstAppointment?.customer) {
    addPatientField("Nombre", firstAppointment.customer.name);
    addPatientField("Cédula", firstAppointment.customer.card_id);
    addPatientField("Email", firstAppointment.customer.email);
    addPatientField("Teléfono", firstAppointment.customer.phone_number);
    addPatientField(
      "Dirección",
      `${firstAppointment.customer.city_name || ""}, ${firstAppointment.customer.province || ""}`
    );
  } else {
    addPatientField("Nombre", user_info.value?.name);
  }

  yPosition += 5;

  const filterText = getFilterText();

  doc.setFont("helvetica", "bold");
  doc.text("Filtro aplicado:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(filterText, 65, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Total de citas:", 20, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(displayAppointments.value.length.toString(), 65, yPosition);
  yPosition += 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalle de Citas", 20, yPosition);
  yPosition += 10;

  const pageHeight = doc.internal.pageSize.height;

  displayAppointments.value.forEach((appointment, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 5, 170, 10, "F");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Cita ${index + 1} - ${appointment.appointment_type?.value1 || "N/A"}`,
      22,
      yPosition
    );
    yPosition += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const addAppointmentField = (label, value) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 25, yPosition);
      doc.setFont("helvetica", "normal");
      const text = value || "N/A";
      doc.text(text, 70, yPosition);
      yPosition += 6;
    };

    const appointmentDate = appointment.appointment_date
      ? new Date(appointment.appointment_date).toLocaleDateString("es-ES")
      : "N/A";
    addAppointmentField("Fecha", appointmentDate);
    addAppointmentField("Hora", appointment.appointment_hour || "N/A");

    if (appointment.supplier) {
      addAppointmentField("Clínica/Hospital", appointment.supplier.name);
      addAppointmentField(
        "Ubicación",
        `${appointment.supplier.city_name || ""}, ${appointment.supplier.province || ""}`
      );
      addAppointmentField("Teléfono", appointment.supplier.phone_number);
    }

    if (appointment.package) {
      addAppointmentField("Procedimiento", appointment.package.procedure?.name);
      addAppointmentField("Producto", appointment.package.product?.name);
      if (appointment.package.product?.description) {
        doc.setFont("helvetica", "bold");
        doc.text("Descripción:", 25, yPosition);
        doc.setFont("helvetica", "normal");
        const splitDescription = doc.splitTextToSize(
          appointment.package.product.description,
          120
        );
        doc.text(splitDescription, 70, yPosition);
        yPosition += splitDescription.length * 6;
      }
    }

    addAppointmentField("Estado", appointment.appointment_status?.value1);
    addAppointmentField("Tipo de reserva", appointment.reservation_type?.name);

    if (appointment.payment_status) {
      addAppointmentField("Estado de pago", appointment.payment_status.value1);
      addAppointmentField("Método de pago", appointment.payment_method?.name);
    }

    if (appointment.price_procedure) {
      const price = parseFloat(appointment.price_procedure).toLocaleString(
        "es-CR",
        {
          style: "currency",
          currency: "CRC",
        }
      );
      addAppointmentField("Precio procedimiento", price);
    }

    if (appointment.price_valoration_appointment) {
      const valuationPrice = parseFloat(
        appointment.price_valoration_appointment
      ).toLocaleString("es-CR", {
        style: "currency",
        currency: "CRC",
      });
      addAppointmentField("Precio valoración", valuationPrice);
    }

    if (appointment.appointment_credit) {
      yPosition += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Información de Crédito:", 25, yPosition);
      yPosition += 6;

      const requestedAmount = parseFloat(
        appointment.appointment_credit.requested_amount
      ).toLocaleString("es-CR", {
        style: "currency",
        currency: "CRC",
      });
      const approvedAmount = parseFloat(
        appointment.appointment_credit.approved_amount
      ).toLocaleString("es-CR", {
        style: "currency",
        currency: "CRC",
      });

      addAppointmentField(
        "  Estado crédito",
        appointment.appointment_credit.credit_status?.name
      );
      addAppointmentField("  Monto solicitado", requestedAmount);
      addAppointmentField("  Monto aprobado", approvedAmount);

      if (appointment.appointment_credit.credit_observations) {
        addAppointmentField(
          "  Observaciones",
          appointment.appointment_credit.credit_observations
        );
      }
    }

    if (appointment.user_description) {
      yPosition += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Descripción:", 25, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");
      const splitUserDescription = doc.splitTextToSize(
        appointment.user_description,
        140
      );
      doc.text(splitUserDescription, 25, yPosition);
      yPosition += splitUserDescription.length * 6;
    }

    if (appointment.appointment_qr_code) {
      addAppointmentField("Código QR", appointment.appointment_qr_code);
    }

    yPosition += 8;
  });

  if (yPosition > pageHeight - 30) {
    doc.addPage();
    yPosition = pageHeight - 20;
  } else {
    yPosition = pageHeight - 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Documento generado el: " + new Date().toLocaleDateString("es-ES"),
    20,
    yPosition
  );
  doc.text("Vitalink - Sistema de Gestión Médica", 105, yPosition, {
    align: "center",
  });

  const patientName =
    firstAppointment?.customer?.name || user_info.value?.name || "Usuario";
  const fileName = `${patientName.replace(/\s+/g, "_")}_Citas_${getFilterText().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

provide("handleRefresh", handleRefresh);
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="loading" class="appointments-page__loader"></div>
    <main v-else class="appointments-page">
      <section class="appointments-page__content">
        <div class="appointments-page__header">
          <h1 class="appointments-page__title">Mis Citas</h1>
        </div>

        <div class="appointments-page__controls">
          <nav class="appointments-tabs">
            <ul class="appointments-tabs__list">
              <li class="appointments-tabs__item">
                <button
                  class="appointments-tabs__button"
                  :class="{ 'appointments-tabs__button--active': tab === 1 }"
                  @click="applyFilter('ALL', 1)"
                >
                  Todas las citas
                </button>
              </li>
              <li class="appointments-tabs__item">
                <button
                  class="appointments-tabs__button"
                  :class="{ 'appointments-tabs__button--active': tab === 2 }"
                  @click="applyFilter('Procedimiento', 2)"
                >
                  Procedimientos
                </button>
              </li>
              <li class="appointments-tabs__item">
                <button
                  class="appointments-tabs__button"
                  :class="{ 'appointments-tabs__button--active': tab === 3 }"
                  @click="applyFilter('Valoración', 3)"
                >
                  Valoraciones
                </button>
              </li>
            </ul>
          </nav>

          <NuxtLink href="/buscar" class="new-appointment-button">
            <AtomsIconsPlusIcon />
            Nueva Cita
          </NuxtLink>
        </div>

        <div class="appointments-page__toolbar">
          <div class="search-input">
            <div class="search-input__wrapper">
              <label
                for="search-field"
                class="search-input__icon"
                id="search-icon"
              >
                <AtomsIconsSearchIcon
                  size="20"
                  aria-hidden="true"
                  focusable="false"
                />
                <span class="visually-hidden">Buscar</span>
              </label>
              <input
                type="text"
                id="search-field"
                class="search-input__field"
                placeholder="Buscar"
                aria-label="Buscar"
                aria-describedby="search-icon"
                v-model="searchQuery"
              />
              <button
                v-if="searchQuery"
                class="search-input__clear"
                @click="clearSearch"
                type="button"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            </div>
          </div>

          <div class="toolbar-actions">
            <button
              class="toolbar-actions__button toolbar-actions__button--download"
              @click="downloadAppointmentsSummary"
            >
              <AtomsIconsDownloadIcon size="20" />
              Descargar
            </button>

            <div class="sort-dropdown">
              <button
                class="sort-dropdown__toggle"
                @click="sort = !sort"
                type="button"
                aria-expanded="false"
              >
                Ordenar por
                <AtomsIconsChevronDown size="20" />
              </button>
              <ul
                class="sort-dropdown__menu"
                :class="{ 'sort-dropdown__menu--show': sort }"
              >
                <li><a class="sort-dropdown__item" href="#">Action</a></li>
                <li>
                  <a class="sort-dropdown__item" href="#">Another action</a>
                </li>
                <li>
                  <a class="sort-dropdown__item" href="#"
                    >Something else here</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="appointments-table-container">
          <PacientesCitasTable :appointments="displayAppointments" />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.appointments-page {
  background-color: #f8f9fa;
  min-height: 100vh;

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
  }

  &__content {
    padding: $spacing-lg;

    @include respond-to-max(md) {
      padding: $spacing-md;
    }
  }

  &__header {
    margin-bottom: $spacing-lg;
  }

  &__title {
    font-family: $font-family-main;
    font-size: 20px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
  }

  &__controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: $spacing-lg;
    gap: $spacing-md;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
      gap: $spacing-md;
    }
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    gap: $spacing-md;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
      gap: $spacing-md;
    }
  }
}

.appointments-tabs {
  &__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: $spacing-sm;
    overflow-x: auto;

    @include respond-to-max(sm) {
      gap: 0;
    }
  }

  &__item {
    flex-shrink: 0;
  }

  &__button {
    @include button-base;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    padding: 12px 16px;
    font-weight: 500;
    color: $color-text-muted;
    white-space: nowrap;

    &:hover {
      color: $color-primary;
    }

    &--active {
      color: $color-primary;
      border-bottom-color: $color-primary;
      font-weight: 600;
    }

    @include respond-to-max(sm) {
      padding: 8px 12px;
      font-size: 14px;
    }
  }
}

.new-appointment-button {
  @include primary-button;
  white-space: nowrap;
  min-width: fit-content;
  padding: 8px 14px;
  gap: 8px;

  @include respond-to-max(md) {
    width: 100%;
    justify-content: center;
  }
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;

  &__wrapper {
    display: flex;
    align-items: center;
    background: $white;
    border-radius: $border-radius-md;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 300px;
    width: 100%;
    position: relative;

    @include respond-to-max(md) {
      max-width: none;
    }
  }

  &__icon {
    position: absolute;
    left: 12px;
    display: flex;
    align-items: center;
    color: #6c757d;
    pointer-events: none;
  }

  &__field {
    @include input-base;
    padding: 10px 14px 10px 40px;
    font-weight: 300;
    font-size: 16px;
    color: #6d758f;
    border-radius: 8px;
    border: 1px solid #f1f3f7;
    box-shadow: 0 1px 2px #1018280d;
    background-color: #fff;
    width: 100%;

    &:focus-visible {
      border: none;
      box-shadow: none;
    }
  }

  &__clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-muted;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;

    &:hover {
      background-color: #f1f1f1;
      color: $color-foreground;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
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
  }
}

.sort-dropdown {
  position: relative;

  &__toggle {
    @include outline-button;
    white-space: nowrap;
    position: relative;

    @include respond-to-max(sm) {
      flex: 1;
    }
  }

  &__menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    display: none;
    min-width: 160px;
    padding: $spacing-sm 0;
    margin: 2px 0 0;
    font-size: 14px;
    color: $color-foreground;
    text-align: left;
    list-style: none;
    background-color: $white;
    background-clip: padding-box;
    border: 1px solid #d0d5dd;
    border-radius: $border-radius-md;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);

    &--show {
      display: block;
    }

    @include respond-to-max(sm) {
      left: 0;
      right: auto;
      min-width: 100%;
    }
  }

  &__item {
    @include link-base;
    display: block;
    padding: 6px $spacing-md;
    clear: both;
    font-weight: 400;
    color: $color-foreground;
    text-decoration: none;
    white-space: nowrap;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &:focus {
      outline: none;
      background-color: #f8f9fa;
    }
  }
}

.appointments-table-container {
  background: $white;
  border-radius: $border-radius-md;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.visually-hidden {
  @include visually-hidden;
}
</style>
