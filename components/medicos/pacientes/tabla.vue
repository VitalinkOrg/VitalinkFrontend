<script lang="ts" setup>
import type { Customer } from "@/types";
import { computed, ref } from "vue";

interface Props {
  patients?: Customer[];
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  patients: () => [],
  itemsPerPage: 10,
});

const openUserModal = ref(false);
const openDateModal = ref(false);
const openDateCancelModal = ref(false);
const modalData = ref<any>(null);
const currentPage = ref(1);
const selectedPatients = ref<Set<number>>(new Set());
const allSelected = ref<boolean>(false);
const sortColumn = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");

const totalItems = computed(() => props.patients?.length || 0);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / props.itemsPerPage)
);

const hasPatients = computed<boolean>(
  () =>
    props.patients && Array.isArray(props.patients) && props.patients.length > 0
);

const paginatedPatients = computed(() => {
  if (!props.patients) return [];

  let sortedPatients = [...props.patients];

  if (sortColumn.value) {
    sortedPatients.sort((a: Customer, b: Customer) => {
      let aValue: any = a[sortColumn.value as keyof Customer];
      let bValue: any = b[sortColumn.value as keyof Customer];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection.value === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return sortedPatients.slice(start, end);
});

const showUserDetails = (patient: Customer) => {
  modalData.value = patient;
  openUserModal.value = true;
};

const showDateDetails = (patient: Customer) => {
  modalData.value = patient;
  openDateModal.value = true;
};

const showDateCancel = (patient: Customer) => {
  modalData.value = patient;
  openDateCancelModal.value = true;
};

const closeModal = () => {
  modalData.value = null;
  openUserModal.value = false;
  openDateModal.value = false;
  openDateCancelModal.value = false;
};

const togglePatientSelection = (patientId: number): void => {
  if (selectedPatients.value.has(patientId)) {
    selectedPatients.value.delete(patientId);
  } else {
    selectedPatients.value.add(patientId);
  }
  updateAllSelectedState();
};

const toggleAllPatients = (): void => {
  if (allSelected.value) {
    selectedPatients.value.clear();
  } else {
    paginatedPatients.value.forEach((patient: Customer) => {
      selectedPatients.value.add(Number(patient.id));
    });
  }
  allSelected.value = !allSelected.value;
};

const updateAllSelectedState = (): void => {
  const currentPageIds = paginatedPatients.value.map((patient: Customer) =>
    Number(patient.id)
  );
  allSelected.value =
    currentPageIds.length > 0 &&
    currentPageIds.every((id: number) => selectedPatients.value.has(id));
};

const sortBy = (column: string): void => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
  currentPage.value = 1;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedPatients.value.clear();
  allSelected.value = false;
};
</script>

<template>
  <section
    class="patients-table"
    role="region"
    aria-labelledby="patients-heading"
  >
    <h2 id="patients-heading" class="sr-only">Tabla de Pacientes</h2>

    <div class="patients-table__container" v-if="hasPatients">
      <div class="patients-table__wrapper">
        <table
          class="patients-table__table"
          role="table"
          aria-label="Lista de pacientes"
        >
          <thead class="patients-table__header">
            <tr class="patients-table__header-row" role="row">
              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--checkbox"
              >
                <label class="patients-table__checkbox-label">
                  <input
                    type="checkbox"
                    class="patients-table__checkbox"
                    :checked="allSelected"
                    @change="toggleAllPatients"
                    :aria-label="
                      allSelected
                        ? 'Deseleccionar todos los pacientes'
                        : 'Seleccionar todos los pacientes'
                    "
                  />
                  <span class="patients-table__checkbox-custom"></span>
                </label>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--id"
              >
                <button
                  class="patients-table__sort-button"
                  @click="sortBy('card_id')"
                  :aria-label="
                    'Ordenar por ID ' +
                    (sortColumn === 'card_id' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="patients-table__header-text">ID</span>
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="patients-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--name"
              >
                <button
                  class="patients-table__sort-button"
                  @click="sortBy('name')"
                  :aria-label="
                    'Ordenar por nombre ' +
                    (sortColumn === 'name' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="patients-table__header-text">Nombre</span>
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="patients-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--address"
              >
                <button
                  class="patients-table__sort-button"
                  @click="sortBy('address')"
                  :aria-label="
                    'Ordenar por dirección ' +
                    (sortColumn === 'address' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="patients-table__header-text">Dirección</span>
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="patients-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--phone"
              >
                <button
                  class="patients-table__sort-button"
                  @click="sortBy('phone_number')"
                  :aria-label="
                    'Ordenar por teléfono ' +
                    (sortColumn === 'phone_number' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="patients-table__header-text"
                    >Teléfono de contacto</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="patients-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--email"
              >
                <button
                  class="patients-table__sort-button"
                  @click="sortBy('email')"
                  :aria-label="
                    'Ordenar por email ' +
                    (sortColumn === 'email' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="patients-table__header-text"
                    >Correo electrónico</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="patients-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="patients-table__header-cell patients-table__header-cell--actions"
              >
                <span class="patients-table__header-text"></span>
              </th>
            </tr>
          </thead>

          <tbody class="patients-table__body">
            <tr
              v-for="patient in paginatedPatients"
              :key="patient.id"
              class="patients-table__row"
              role="row"
              :class="{
                'patients-table__row--selected': selectedPatients.has(
                  Number(patient.id)
                ),
              }"
            >
              <td class="patients-table__cell patients-table__cell--checkbox">
                <label class="patients-table__checkbox-label">
                  <input
                    type="checkbox"
                    class="patients-table__checkbox"
                    :checked="selectedPatients.has(Number(patient.id))"
                    @change="togglePatientSelection(Number(patient.id))"
                    :aria-label="`${selectedPatients.has(Number(patient.id)) ? 'Deseleccionar' : 'Seleccionar'} paciente ${patient.name}`"
                  />
                  <span class="patients-table__checkbox-custom"></span>
                </label>
              </td>

              <td class="patients-table__cell patients-table__cell--id">
                <span class="patients-table__card-id">{{
                  patient.card_id
                }}</span>
              </td>

              <td class="patients-table__cell patients-table__cell--name">
                <div class="patients-table__patient-info">
                  <span class="patients-table__patient-avatar">
                    <img src="@/src/assets/img-avatar-sm.png" alt="avatar" />
                  </span>
                  <span class="patients-table__patient-name">{{
                    patient.name
                  }}</span>
                </div>
              </td>

              <td class="patients-table__cell patients-table__cell--address">
                <span class="patients-table__address">{{
                  patient.address
                }}</span>
              </td>

              <td class="patients-table__cell patients-table__cell--phone">
                <span class="patients-table__phone">{{
                  patient.phone_number
                }}</span>
              </td>

              <td class="patients-table__cell patients-table__cell--email">
                <span class="patients-table__email">{{ patient.email }}</span>
              </td>

              <td class="patients-table__cell patients-table__cell--actions">
                <div class="patients-table__dropdown">
                  <button
                    class="patients-table__dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    :aria-label="`Más acciones para ${patient.name}`"
                  >
                    <AtomsIconsThreeDotsHorizontalIcon />
                  </button>

                  <ul class="dropdown-menu" role="menu">
                    <li role="none">
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showUserDetails(patient)"
                      >
                        Ver Usuario
                      </button>
                    </li>
                    <li role="none">
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateDetails(patient)"
                      >
                        Ver Cita
                      </button>
                    </li>
                    <li role="none">
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateCancel(patient)"
                      >
                        Cancelar Cita
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Componente de Paginación -->
      <div class="patients-table__pagination" v-if="totalPages > 1">
        <MedicosPaginacion
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          :max-visible-pages="5"
          :show-info="true"
          @page-changed="handlePageChange"
        />
      </div>
    </div>

    <!-- Estado vacío cuando no hay pacientes -->
    <div
      v-else
      class="patients-table__empty-state"
      role="status"
      aria-live="polite"
    >
      <div class="patients-table__empty-content">
        <div class="patients-table__empty-icon">
          <AtomsIconsChartVacio />
        </div>
        <div class="patients-table__empty-text">
          <h3 class="patients-table__empty-title">
            Aún no tienes actividad en tu tablero
          </h3>
          <p class="patients-table__empty-description">
            Muy pronto podrás administrar y verificar tu actividad.
          </p>
          <button class="patients-table__empty-cta">Empezar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.patients-table {
  --col-checkbox-width: 60px;
  --col-id-width: 100px;
  --col-name-width: 200px;
  --col-address-width: 180px;
  --col-phone-width: 160px;
  --col-email-width: 200px;
  --col-actions-width: 80px;

  &__container {
    background: $white;
    border-radius: 10px;
    overflow: hidden;
  }

  &__wrapper {
    overflow-x: auto;
    min-height: 400px;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    table-layout: fixed;
  }

  &__header {
    background-color: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
  }

  &__header-row {
    border: none;
  }

  &__header-cell {
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 12px;
    letter-spacing: 0;
    font-weight: 500;
    color: #6d758f;
    border: none;
    background-color: $white;

    &--checkbox {
      width: var(--col-checkbox-width);
      text-align: center;
    }

    &--id {
      width: var(--col-id-width);
    }

    &--name {
      width: var(--col-name-width);
    }

    &--address {
      width: var(--col-address-width);
    }

    &--phone {
      width: var(--col-phone-width);
    }

    &--email {
      width: var(--col-email-width);
    }

    &--actions {
      width: var(--col-actions-width);
      min-width: var(--col-actions-width);
      text-align: center;
    }
  }

  &__header-text {
    font-family: $font-family-main;
    font-weight: 500;
    font-style: Medium;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0px;
    vertical-align: middle;
    text-align: start;
  }

  &__body {
    background: $white;
  }

  &__row {
    border-bottom: 1px solid #dee2e6;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba($color-primary, 0.02);
    }

    &--selected {
      background-color: rgba($color-primary, 0.05);
    }
  }

  &__cell {
    padding: 1rem 0.75rem;
    vertical-align: middle;
    border: none;

    &--checkbox {
      text-align: center;
    }

    &--actions {
      text-align: center;
    }
  }

  &__patient-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__patient-avatar {
    flex-shrink: 0;
  }

  &__card-id,
  &__patient-name,
  &__address,
  &__phone,
  &__email {
    font-family: $font-family-main;
    font-weight: 300;
    font-style: Light;
    font-size: 12px;
    color: #19213d;
    line-height: 20px;
    letter-spacing: 0px;
    vertical-align: middle;
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

  &__sort-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font: inherit;
    padding: 0;

    &:hover {
      svg {
        transform: scale(110%);
      }
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__sort-icon {
    color: #121212;
    transition: transform 0.2s ease;
    position: relative;
  }

  &__dropdown-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
      color: $color-primary;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__pagination {
    background: transparent;
    padding: 1rem;
    display: flex;
    justify-content: center;
  }

  &__empty-state {
    background: $white;
    border-radius: 0.5rem;
    padding: 3rem 2rem;
  }

  &__empty-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  &__empty-icon {
    flex-shrink: 0;
    width: 50%;
    text-align: center;
  }

  &__empty-text {
    flex: 1;
  }

  &__empty-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }

  &__empty-description {
    color: #6c757d;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  &__empty-cta {
    background: $color-primary;
    color: $white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: darken($color-primary, 10%);
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  .dropdown-menu {
    padding: 0;
    margin: 0;
    overflow: hidden;
  }

  .dropdown-item {
    @include label-base;
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    padding: 10px 14px;
    color: #353e5c;
    border: none;
    background: none;
    width: 100%;
    text-align: left;

    &:hover {
      background-color: #f1f3f7;
    }

    svg {
      color: #3541b4;
      width: 16px;
      height: 16px;
    }
  }
}

@media (max-width: 1200px) {
  .patients-table {
    --col-name-width: 160px;
    --col-address-width: 140px;
    --col-phone-width: 130px;
    --col-email-width: 160px;
  }
}

@media (max-width: 768px) {
  .patients-table {
    --col-id-width: 80px;
    --col-name-width: 140px;
    --col-address-width: 120px;
    --col-phone-width: 110px;
    --col-email-width: 140px;
    --col-actions-width: 60px;

    &__container {
      border-radius: 0;
      box-shadow: none;
      border: 1px solid #dee2e6;
    }

    &__table {
      font-size: 0.75rem;
      table-layout: auto;
    }

    &__header-cell,
    &__cell {
      padding: 0.5rem;
    }

    &__empty-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    &__empty-icon {
      width: auto;
    }

    &__pagination {
      padding: 0.75rem;
    }
  }
}

@media (max-width: 576px) {
  .patients-table {
    &__header-text {
      font-size: 0.625rem;
    }

    &__card-id,
    &__patient-name,
    &__address,
    &__phone,
    &__email {
      font-size: 0.625rem;
    }

    &__header-cell {
      &--address,
      &--phone {
        display: none;
      }
    }

    &__cell {
      &--address,
      &--phone {
        display: none;
      }
    }
  }
}

@media (prefers-contrast: high) {
  .patients-table {
    &__container {
      border: 2px solid #dee2e6;
    }

    &__checkbox-custom {
      border-width: 2px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .patients-table {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}

.patients-table {
  button:focus:not(:focus-visible) {
    outline: none;
  }

  button:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
