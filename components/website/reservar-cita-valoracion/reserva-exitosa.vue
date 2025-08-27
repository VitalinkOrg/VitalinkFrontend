<template>
  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    size="small"
    header-class="header-border-bottom"
    footerClass="footer-border-top"
  >
    <template #title>
      <h2 class="successful-reservation__title">Reservar una Cita</h2>
    </template>

    <div class="successful-reservation__content">
      <div class="successful-reservation__message">
        <h3 class="successful-reservation__message--title">Felicitaciones!</h3>
        <p class="successful-reservation__message--text">
          Te avisaremos cuando tu solicitud de cita sea aceptada
        </p>
      </div>

      <table class="successful-reservation__table">
        <tbody>
          <tr>
            <td class="successful-reservation__table--label">
              Tipo de servicio:
            </td>
            <td class="successful-reservation__table--value">
              Cita de valoración
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">
              Fecha de la cita:
            </td>
            <td class="successful-reservation__table--value">
              {{ formatDate(selectedDay as string) }}
            </td>
          </tr>
          <tr class="successful-reservation__table--row">
            <td class="successful-reservation__table--label">
              Hora de la cita:
            </td>
            <td class="successful-reservation__table--value">
              {{ formatTime(selectedHour as string) }}
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">
              Paciente titular:
            </td>
            <td class="successful-reservation__table--value">
              {{ customerName }}
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">
              Telefono de contacto:
            </td>
            <td class="successful-reservation__table--value">
              {{ customerPhone }}
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">
              Profesional médico:
            </td>
            <td class="successful-reservation__table--value">
              {{ supplierName }}
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">Procedimiento:</td>
            <td class="successful-reservation__table--value">
              {{ getSelectedProcedureName }}
            </td>
          </tr>
          <tr>
            <td class="successful-reservation__table--label">
              Costo del servicio:
            </td>
            <td class="successful-reservation__table--value">
              {{ formatCurrency(18000, 0) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="successful-reservation__footer">
        <NuxtLink
          :to="`/perfiles/doctor/${supplierId}`"
          class="successful-reservation__button--outline"
          @click.prevent="handleNavigation"
        >
          Ver perfil del médico
        </NuxtLink>
        <NuxtLink
          to="/pacientes/citas"
          class="successful-reservation__button--primary"
        >
          Ver en Citas
        </NuxtLink>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useCurrency } from "~/composables/useCurrency";
import type { Service } from "~/types/appointment";

const route = useRoute();
const router = useRouter();

const { formatCurrency } = useCurrency();

interface Props {
  isOpen: boolean;
  selectedDay: string | null;
  selectedHour: string | null;
  supplierId: number;
  supplierName: string;
  customerName: string;
  customerPhone?: string;
  selectedProcedureId?: number;
  services?: Service[];
}

interface Emits {
  (e: "open-modal"): void;
  (e: "close-modal"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCloseModal = () => {
  emit("close-modal");
};

const handleNavigation = () => {
  if (route.path === "/pacientes/inicio") {
    router.push(`/perfiles/doctor/${props.supplierId}`);
  } else {
    emit("close-modal");
  }
};

const getSelectedProcedureName = computed(() => {
  try {
    if (!props.services || !props.selectedProcedureId) {
      return "N/A";
    }
    const allProcedures = props.services.flatMap(
      (service) => service.procedures || []
    );
    const procedure = allProcedures.find(
      (procedure) => procedure.procedure?.id === props.selectedProcedureId
    );
    return procedure?.procedure?.name || "N/A";
  } catch (error) {
    console.error("Error getting procedure name:", error);
    return "N/A";
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  const dayOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
  const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };

  const dayName = new Intl.DateTimeFormat("es-ES", dayOptions).format(date);
  const dayNumber = date.getDate();
  const monthName = new Intl.DateTimeFormat("es-ES", monthOptions).format(date);

  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return `${capitalizedDayName}, ${dayNumber} de ${monthName}`;
}

const formatTime = (time: string): string => {
  if (!time) return "";

  const parts = time.split(":");
  if (parts.length < 2) return time;

  const hours = parts[0];
  const minutes = parts[1];

  return `${hours}:${minutes} hs`;
};
</script>

<style lang="scss" scoped>
.successful-reservation {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 24px;
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    padding: 20px;
    background-color: #f8faff;
    border-radius: 20px;

    &--row {
      td {
        border-bottom: 1px solid #e1e4ed;
      }
    }

    &--label {
      font-family: $font-family-main;
      font-weight: 300;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0;
      color: #6d758f;
      padding: 6px 0px;
    }

    &--value {
      font-family: $font-family-main;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0;
      color: $color-foreground;
      padding: 6px 0px;
    }
  }

  &__message {
    @include label-base;

    &--title {
      font-family: $font-family-montserrat-alt;
      font-weight: 700;
      font-size: 28px;
      line-height: 29.5px;
      text-align: center;
      color: #3541b4;
    }

    &--text {
      font-weight: 500;
      font-size: 18px;
      line-height: 24px;
      text-align: center;
      color: #353e5c;
    }
  }

  &__footer {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
    }

    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
