<template>
  <section class="vouchers-table">
    <UiAppointmentTableBase
      :items="credits"
      :columns="tableColumns"
      title="Tabla de Vouchers de Crédito"
      aria-label="Lista de vouchers de crédito médico"
      :items-per-page="itemsPerPage"
      default-sort-column="created_at"
      default-sort-direction="desc"
      empty-state-title="No hay vouchers disponibles"
      empty-state-description="Cuando los pacientes soliciten vouchers de crédito, aparecerán aquí."
      :show-pagination-info="false"
      :row-class="getRowClass"
      @sort-changed="handleSortChange"
      @page-changed="handlePageChange"
    >
      <template #header-checkbox>
        <label class="vouchers-table__checkbox-label">
          <input
            type="checkbox"
            class="vouchers-table__checkbox"
            :checked="allSelected"
            @change="toggleAllVouchers"
            :aria-label="
              allSelected
                ? 'Deseleccionar todos los vouchers'
                : 'Seleccionar todos los vouchers'
            "
          />
          <span class="vouchers-table__checkbox-custom"></span>
        </label>
      </template>

      <template #cell-checkbox="{ item }">
        <label class="vouchers-table__checkbox-label">
          <input
            type="checkbox"
            class="vouchers-table__checkbox"
            :checked="selectedVouchers.has(item.id)"
            @change="toggleVoucherSelection(item.id)"
            :aria-label="`${selectedVouchers.has(item.id) ? 'Deseleccionar' : 'Seleccionar'} voucher de ${item.appointment.customer.name}`"
          />
          <span class="vouchers-table__checkbox-custom"></span>
        </label>
      </template>

      <template #cell-patient_name="{ item }">
        <span class="vouchers-table__patient-name">
          {{ item.appointment.customer.name }}
        </span>
      </template>

      <template #cell-specialty="{ item }">
        <span class="vouchers-table__specialty">
          {{ item.appointment.package?.procedure?.name }}
        </span>
      </template>

      <template #cell-requested_amount="{ value }">
        <span class="vouchers-table__amount">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span
          class="vouchers-table__status"
          :class="
            getStatusClass(
              item?.credit_status?.code as
                | 'REQUIRED'
                | 'APPROVED'
                | 'CANCELLED'
                | 'REJECTED'
                | 'APPROVED_PERCENTAGE'
            )
          "
        >
          {{ item.credit_status.name }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="vouchers-table__actions">
          <button
            class="vouchers-table__action-btn vouchers-table__action-btn--details"
            @click="openCreditDetails(item)"
            :disabled="item.credit_status.code !== 'REQUIRED'"
          >
            Ver Detalles
          </button>
        </div>
      </template>
    </UiAppointmentTableBase>

    <transition-group name="vouchers-table__expand">
      <div
        v-for="item in expandedVouchers"
        :key="`expanded-${item.id}`"
        class="vouchers-table__expanded-row"
      >
        <div class="vouchers-table__expanded-content">
          <div class="vouchers-table__expanded-section">
            <div class="vouchers-table__info-group">
              <h4 class="vouchers-table__info-title">
                Información del Paciente
              </h4>
              <dl class="vouchers-table__info-list">
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">Dirección:</dt>
                  <dd class="vouchers-table__info-value">
                    {{ item.appointment.customer.address }}
                  </dd>
                </div>
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">
                    Número de Teléfono:
                  </dt>
                  <dd class="vouchers-table__info-value">
                    {{
                      item.appointment.phone_number_external_user ??
                      item.appointment.customer.phone_number
                    }}
                  </dd>
                </div>
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">Dirección Física:</dt>
                  <dd class="vouchers-table__info-value">
                    {{ formatFullAddress(item) }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="vouchers-table__info-group">
              <h4 class="vouchers-table__info-title">Proveedor del Servicio</h4>
              <dl class="vouchers-table__info-list">
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">Proveedor:</dt>
                  <dd class="vouchers-table__info-value">
                    {{ item.appointment.supplier?.name || "Hospital CIMA" }}
                  </dd>
                </div>
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">
                    Costos y Facturación:
                  </dt>
                  <dd class="vouchers-table__info-value">
                    {{
                      formatCurrency(
                        Number(
                          item.appointment.appointment_credit?.requested_amount
                        ) ?? 0
                      )
                    }}
                  </dd>
                </div>
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">
                    Número de teléfono:
                  </dt>
                  <dd class="vouchers-table__info-value">+506 7123-4567</dd>
                </div>
                <div class="vouchers-table__info-item">
                  <dt class="vouchers-table__info-label">Dirección Física:</dt>
                  <dd class="vouchers-table__info-value">
                    San José, Autop. Próspero Fernández, San José, San Rafael,
                    Costa Rica, CR-1000
                  </dd>
                </div>
              </dl>
            </div>

            <div class="vouchers-table__info-group">
              <h4 class="vouchers-table__info-title">Mensaje del Asegurado</h4>
              <div class="vouchers-table__message">
                {{ item.appointment.user_description }}
              </div>
            </div>
          </div>

          <div
            v-if="item.credit_observations"
            class="vouchers-table__comments-section"
          >
            <div class="vouchers-table__comments-box">
              <div class="vouchers-table__comments-header">
                <AtomsIconsChatIcon class="vouchers-table__comments-icon" />
                <span class="vouchers-table__comments-title">Comentarios</span>
              </div>
              <div class="vouchers-table__comments-content">
                {{ item.credit_observations }}
              </div>
              <div class="vouchers-table__comments-footer">
                <span class="vouchers-table__comments-author">
                  Tomás Clark
                </span>
                <span class="vouchers-table__comments-date">
                  {{ formatDate(item.updated_date) }}
                </span>
              </div>
            </div>
          </div>

          <div class="vouchers-table__expanded-actions">
            <button
              class="vouchers-table__expanded-btn vouchers-table__expanded-btn--secondary"
            >
              Ver Seguimiento de Reclamaciones
            </button>
            <button
              class="vouchers-table__expanded-btn vouchers-table__expanded-btn--primary"
              @click="addCommentsModal(item)"
            >
              Agregar Comentarios o Notas
            </button>
            <button
              class="vouchers-table__expanded-btn vouchers-table__expanded-btn--icon"
              @click="downloadVoucher(item)"
              aria-label="Descargar voucher"
            >
              <AtomsIconsDownloadIcon />
            </button>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- MODALES GLOBALES - UNA SOLA INSTANCIA -->
    <AseguradorasModalesCreditDetails />
    <AseguradorasModalesCreditApproval />
    <AseguradorasModalesCreditRejection />
    <AseguradorasModalesCreditSuccess />
  </section>
</template>

<script setup lang="ts">
import { useModalManager } from "@/composables/useModalManager";
import type { Credit } from "@/types";
import type { TableColumn } from "../ui/appointment-table-base.vue";

interface CreditStatus {
  code:
    | "REQUIRED"
    | "APPROVED"
    | "CANCELLED"
    | "REJECTED"
    | "APPROVED_PERCENTAGE";
  name: string;
}

interface Props {
  credits: Credit[];
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  credits: () => [],
  itemsPerPage: 10,
});

const emit = defineEmits(["refreshed"]);

const modalManager = useModalManager();

const refreshAppointments = inject<(() => void) | undefined>(
  "refreshAppointments"
);

const selectedVouchers = ref<Set<number>>(new Set());
const allSelected = ref(false);
const expandedRow = ref<number | null>(null);

const tableColumns: TableColumn[] = [
  {
    key: "checkbox",
    label: "",
    width: "60px",
    sortable: false,
    cellClass: "vouchers-table__cell--checkbox",
    headerClass: "vouchers-table__header-cell--checkbox",
  },
  {
    key: "patient_name",
    label: "Nombre del paciente",
    width: "200px",
    sortField: "appointment.customer.name",
  },
  {
    key: "specialty",
    label: "Especialidad",
    width: "200px",
    sortField: "appointment.package.procedure.name",
  },
  {
    key: "requested_amount",
    label: "Monto Solicitado",
    width: "200px",
  },
  {
    key: "status",
    label: "Estado de cita",
    width: "110px",
    sortField: "credit_status.code",
  },
  {
    key: "actions",
    label: "",
    width: "100px",
    sortable: false,
    cellClass: "vouchers-table__cell--actions",
  },
];

const expandedVouchers = computed(() => {
  if (!expandedRow.value) return [];
  return props.credits.filter((v) => v.id === expandedRow.value);
});

const openCreditDetails = (credit: Credit): void => {
  modalManager.setCredit(credit);

  modalManager.setSharedData(
    "approvedAmount",
    credit.requested_amount?.toString() || ""
  );
  modalManager.setSharedData("description", "");
  modalManager.setSharedData("uploadedFile", null);

  modalManager.openModal("details");
};

const refreshCredits = async (): Promise<void> => {
  emit("refreshed");
  if (refreshAppointments) {
    refreshAppointments();
  }
};

onMounted(() => {
  modalManager.setRefreshCredits(refreshCredits);
});

onUnmounted(() => {
  modalManager.clearSharedData();
  modalManager.setRefreshCredits(null);
});

const toggleVoucherSelection = (voucherId: number): void => {
  if (selectedVouchers.value.has(voucherId)) {
    selectedVouchers.value.delete(voucherId);
  } else {
    selectedVouchers.value.add(voucherId);
  }
};

const toggleAllVouchers = (): void => {
  if (allSelected.value) {
    selectedVouchers.value.clear();
  } else {
    props.credits.forEach((voucher) => {
      selectedVouchers.value.add(voucher.id);
    });
  }
  allSelected.value = !allSelected.value;
};

const getStatusClass = (code: CreditStatus["code"]): string => {
  const statusMap: Record<CreditStatus["code"], string> = {
    REQUIRED: "vouchers-table__status--required",
    APPROVED: "vouchers-table__status--approved",
    CANCELLED: "vouchers-table__status--cancelled",
    REJECTED: "vouchers-table__status--rejected",
    APPROVED_PERCENTAGE: "vouchers-table__status--approved",
  };
  return statusMap[code] || "";
};

const getRowClass = (item: Credit): string => {
  return expandedRow.value === item.id ? "vouchers-table__row--expanded" : "";
};

const addCommentsModal = (voucher: Credit): void => {
  console.log("Agregar comentarios para:", voucher);
};

const downloadVoucher = (voucher: Credit): void => {
  console.log("Descargar voucher:", voucher);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatFullAddress = (voucher: Credit): string => {
  return `${voucher.appointment.customer.address}, ${voucher.appointment.customer.city_name}, ${voucher.appointment.customer.postal_code}`;
};

const handleSortChange = ({
  column,
  direction,
}: {
  column: string;
  direction: "asc" | "desc";
}): void => {
  console.log(`Ordenando por ${column} en dirección ${direction}`);
};

const handlePageChange = (page: number): void => {
  console.log(`Cambio a página ${page}`);
  selectedVouchers.value.clear();
  allSelected.value = false;
};
</script>

<style lang="scss" scoped>
.vouchers-table {
  &__patient-name,
  &__specialty,
  &__amount {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 0.875rem;
    color: $color-foreground;
    line-height: 1.25rem;
  }

  &__status {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    border-radius: 1.875rem;
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 0.75rem;
    color: $color-foreground;
    text-align: center;

    &--required {
      background-color: #faedbf;
    }

    &--approved {
      background-color: #d3f2dd;
    }

    &--cancelled,
    &--rejected {
      background-color: #fac6d0;
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

    &:focus + &-custom {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
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
    border: 0.125rem solid #dee2e6;
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
      border-width: 0 0.125rem 0.125rem 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
  }

  &__action-btn {
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--details {
      @include outline-button;
      border-radius: 8px;
      border-width: 1px;
      padding: 8px 14px;
      gap: 8px;
      opacity: 1;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0;
      text-wrap: nowrap;
    }

    &--expand {
      padding: 0.5rem;
      width: 2.25rem;
      height: 2.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__expand-icon {
    transition: transform 0.3s ease;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__expanded-row {
    background: $white;
    border-radius: 0.625rem;
    margin: 0.5rem 0;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  }

  &__expanded-content {
    padding: 1.5rem;
  }

  &__expanded-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  &__info-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__info-title {
    font-family: $font-family-main;
    font-size: 1rem;
    font-weight: 600;
    color: $color-foreground;
    margin: 0 0 0.5rem 0;
  }

  &__info-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
  }

  &__info-item {
    display: flex;
    gap: 0.5rem;
    margin: 0;
  }

  &__info-label {
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 400;
    color: #6d758f;
    white-space: nowrap;
    margin: 0;
  }

  &__info-value {
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 300;
    color: $color-foreground;
    margin: 0;
  }

  &__message {
    padding: 1rem;
    background-color: rgba($color-primary, 0.05);
    border: 0.0625rem solid rgba($color-primary, 0.1);
    border-radius: 0.625rem;
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.5;
    color: $color-foreground;
  }

  &__comments-section {
    margin-bottom: 1.5rem;
  }

  &__comments-box {
    padding: 1rem;
    background-color: rgba($color-primary, 0.05);
    border: 0.0625rem solid rgba($color-primary, 0.1);
    border-radius: 0.625rem;
  }

  &__comments-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  &__comments-icon {
    width: 1rem;
    height: 1rem;
    color: $color-primary;
  }

  &__comments-title {
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 500;
    color: $color-foreground;
  }

  &__comments-content {
    padding: 0.75rem;
    background-color: #f8f9fa;
    border-radius: 0.375rem;
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 300;
    line-height: 1.5;
    color: $color-foreground;
    margin-bottom: 0.75rem;
  }

  &__comments-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  &__comments-author {
    font-weight: 500;
    color: $color-foreground;
  }

  &__comments-date {
    color: #6d758f;
  }

  &__expanded-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 0.0625rem solid #dee2e6;
  }

  &__expanded-btn {
    padding: 0.5rem 1rem;
    border: 0.0625rem solid transparent;
    border-radius: 0.375rem;
    font-family: $font-family-main;
    font-size: 0.875rem;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;

    &--secondary {
      background: $white;
      border-color: #19213d;
      color: #19213d;

      &:hover {
        background-color: #19213d;
        color: $white;
      }
    }

    &--primary {
      background: #17a2b8;
      color: $white;

      &:hover {
        background: darken(#17a2b8, 10%);
      }
    }

    &--icon {
      padding: 0.5rem;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #17a2b8;
      color: $white;

      &:hover {
        background: darken(#17a2b8, 10%);
      }
    }
  }

  &__expand-enter-active,
  &__expand-leave-active {
    transition: all 0.3s ease;
  }

  &__expand-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  &__expand-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@media (max-width: $breakpoint-lg) {
  .vouchers-table {
    &__expanded-section {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .vouchers-table {
    &__expanded-actions {
      flex-direction: column;

      button {
        width: 100%;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .vouchers-table {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>
