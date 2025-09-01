<template>
  <div class="availability-tab">
    <div class="availability-tab__header">
      <h3 class="availability-tab__title">Agenda de disponibilidad</h3>
      <div class="availability-tab__badges">
        <span class="availability-tab__badge">
          {{ selectedSpecialty }}
          <AtomsIconsXIcon size="16" />
        </span>
        <span class="availability-tab__badge">
          {{ selectedProcedureName }}
          <AtomsIconsXIcon size="16" />
        </span>
      </div>
    </div>
    <div class="availability-tab__card">
      <div class="availability-tab__card-content">
        <div class="availability-tab__date-selection">
          <div class="availability-tab__date-header">
            <h4 class="availability-tab__section-title">
              Seleccione una fecha
            </h4>
            <div class="availability-tab__calendar-container">
              <div class="dropdown availability-tab__dropdown">
                <button
                  class="dropdown-toggle availability-tab__dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  @click="toggleDropdown"
                >
                  {{ selectedMonthLabel || "Seleccione un mes" }}
                </button>
                <ul
                  class="dropdown-menu availability-tab__dropdown-menu"
                  :class="{ show: isDropdownOpen }"
                >
                  <li>
                    <button
                      v-for="month in months"
                      :key="month.value"
                      class="dropdown-item availability-tab__dropdown-item"
                      :class="{
                        'availability-tab__dropdown-item--active':
                          selectedMonth === month.value,
                      }"
                      type="button"
                      @click="handleMonthSelect(month)"
                    >
                      {{ month.label }}
                    </button>
                  </li>
                </ul>
              </div>

              <AtomsIconsCalendarIcon size="20" />
            </div>
          </div>

          <div class="availability-tab__days-container">
            <div class="availability-tab__days-wrapper">
              <button
                v-for="day in availableDays"
                :key="day.date"
                @click="setSelectedDay(day.date)"
                class="availability-tab__day-button"
                :class="{
                  'availability-tab__day-button--active':
                    selectedDay === day.date,
                }"
              >
                <span class="availability-tab__day-number">
                  {{ day.number }}
                </span>
                <span class="availability-tab__day-label">
                  {{ day.day }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedDay" class="availability-tab__time-selection">
          <h4
            class="availability-tab__section-title availability-tab__section-title--small"
          >
            Seleccione la hora
          </h4>
          <div class="availability-tab__hours-container">
            <button
              v-for="(time, index) in availableHours"
              :key="index"
              @click="setSelectedHour(time)"
              class="availability-tab__hour-button"
              :class="{
                'availability-tab__hour-button--active': selectedHour === time,
              }"
            >
              {{ formatTime(time) }}
            </button>
          </div>
        </div>

        <div v-else class="availability-tab__empty-state">
          Por favor seleccione una fecha para ver los horarios disponibles
        </div>
      </div>
    </div>
    <div class="availability-tab__reservation-wrapper">
      <WebsiteReservarCitaValoracion
        :selected-day="selectedDay"
        :selected-hour="selectedHour"
        :current-step="2"
        :supplier-id="supplier?.id ?? 0"
        :supplier-name="supplier?.name ?? ''"
        :customer-id="customer?.id ?? ''"
        :customer-name="customer?.name || ''"
        :customer-phone="customer?.phone_number || ''"
        :selected-package="selectedPackage"
        :selected-procedure-id="selectedProcedureId ?? 0"
        :services="supplier?.services"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useFormat } from "~/composables/useFormat";
import type { Customer, Supplier } from "~/types";

interface Month {
  value: number;
  label: string;
}

interface AvailableDay {
  date: string;
  day: string;
  number: number;
}

interface Props {
  selectedSpecialty: string | null;
  selectedProcedureName: string | null;
  selectedProcedureId: number | null;
  reserveAppointment: () => void;
  supplier: Supplier | Partial<Supplier> | null;
  customer: Customer | null;
  selectedPackage?: any;
}

const props = defineProps<Props>();

const { formatTime } = useFormat();

const selectedMonth = ref<number | null>(null);
const selectedDay = ref<string | null>(null);
const selectedHour = ref<string | null>(null);
const availableHours = ref<string[]>([]);
const availableDays = ref<AvailableDay[]>([]);
const isDropdownOpen = ref<boolean>(false);

const months = ref<Month[]>([
  { value: 0, label: "Enero" },
  { value: 1, label: "Febrero" },
  { value: 2, label: "Marzo" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Mayo" },
  { value: 5, label: "Junio" },
  { value: 6, label: "Julio" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Septiembre" },
  { value: 9, label: "Octubre" },
  { value: 10, label: "Noviembre" },
  { value: 11, label: "Diciembre" },
]);

const weekdayMap: Record<string, string> = {
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mié",
  Thursday: "Jue",
  Friday: "Vie",
  Saturday: "Sáb",
  Sunday: "Dom",
} as const;

const selectedMonthLabel = computed<string | null>(() => {
  if (selectedMonth.value === null) return null;
  const month = months.value.find((m) => m.value === selectedMonth.value);
  return month ? month.label : null;
});

const availability = computed<Record<string, string[]>>(() => {
  const availabilityMap: Record<string, string[]> = {};

  if (!props.supplier?.availabilities) return availabilityMap;

  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  props.supplier.availabilities.forEach((avail) => {
    const currentDate = new Date(today);
    while (currentDate <= endDate) {
      const weekdayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (weekdayName === avail.weekday) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const fromHour = avail.from_hour.substring(0, 5);

        if (!availabilityMap[dateStr]) {
          availabilityMap[dateStr] = [];
        }

        availabilityMap[dateStr].push(fromHour);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return availabilityMap;
});

const toggleDropdown = (): void => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (): void => {
  isDropdownOpen.value = false;
};

const handleMonthSelect = (month: Month): void => {
  selectedMonth.value = month.value;
  handleMonthChange();
  closeDropdown();
};

const handleMonthChange = (): void => {
  selectedDay.value = null;
  selectedHour.value = null;
  availableDays.value = getAvailableDaysForMonth(selectedMonth.value);
  availableHours.value = [];
};

const getAvailableDaysForMonth = (month: number | null): AvailableDay[] => {
  if (month === null) return [];

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDaysArray: AvailableDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    if (availability.value[dateStr] && availability.value[dateStr].length > 0) {
      const weekdayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      availableDaysArray.push({
        date: dateStr,
        day: weekdayMap[weekdayName] || weekdayName.slice(0, 3),
        number: date.getDate(),
      });
    }
  }

  return availableDaysArray;
};

const setSelectedDay = (date: string): void => {
  if (!date) return;

  selectedDay.value = date;
  availableHours.value = availability.value[date] || [];
  selectedHour.value = null;
};

const setSelectedHour = (hour: string): void => {
  selectedHour.value = hour;
};

onMounted(() => {
  document.addEventListener("click", (event: Event) => {
    const dropdown = document.querySelector(".availability-tab__dropdown");
    if (dropdown && !dropdown.contains(event.target as Node)) {
      closeDropdown();
    }
  });
});
</script>

<style lang="scss" scoped>
.availability-tab {
  padding: 20px 0;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    color: $color-foreground;
    margin: 0;
  }

  &__badges {
    display: flex;
    gap: 8.4px;
  }

  &__badge {
    @include label-base;
    display: flex;
    align-items: center;
    gap: 10.5px;
    border-radius: 105.02px;
    border: 1px solid #e1e4ed;
    padding: 8.4px 12.6px;
    background-color: transparent;
    color: #6d758f;
    font-size: 12px;
    font-weight: 500;
    opacity: 1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(#6d758f, 0.05);
      border-color: rgba(#6d758f, 0.3);
    }

    svg {
      color: #6d758f;
      flex-shrink: 0;
    }
  }

  &__card {
    gap: 17px;
    border-radius: 15px;
    padding: 15px;
    background-color: #f8faff;
    box-shadow: 0px 1px 4px 0px rgba(25, 33, 61, 0.08);
    margin-top: 22px;
  }

  &__date-selection {
    margin: 0;
  }

  &__date-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__section-title {
    @include label-base;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    color: $color-foreground;
    margin: 0;

    &--small {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
  }

  &__calendar-container {
    display: flex;
    align-items: center;
    background-color: rgba($color-primary, 0.07);
    border-radius: 20px;
    padding: 8px 12px;
    gap: 8px;
    svg {
      color: $color-primary;
    }
  }

  &__select-wrapper {
    position: relative;
  }

  &__select {
    background: transparent;
    border: none;
    outline: none;
    color: $color-primary;
    font-size: 14px;
    cursor: pointer;
    appearance: none;
    padding-right: 20px;

    &:focus {
      outline: none;
    }

    option {
      background-color: $white;
      color: $color-foreground;
    }
  }

  &__dropdown {
    position: relative;
  }

  &__dropdown-toggle {
    @include label-base;
    background: transparent !important;
    border: none !important;
    color: $color-primary !important;
    box-shadow: none !important;
    padding: 4px 8px;
    font-weight: 600;
    font-size: 12.6px;

    &:focus,
    &:active,
    &:hover {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: $color-primary !important;
    }

    &::after {
      display: none;
    }
  }

  &__dropdown-menu {
    border: 1px solid rgba($color-primary, 0.15);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-width: 160px;
    margin-top: 10px !important;
    max-height: 300px;
    overflow-y: auto;

    &.show {
      display: block;
    }
  }

  &__dropdown-item {
    padding: 8px 16px;
    font-size: 14px;
    color: $color-foreground;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba($color-primary, 0.1) !important;
      color: $color-primary !important;
    }

    &:focus {
      background-color: rgba($color-primary, 0.1) !important;
      color: $color-primary !important;
      outline: none;
    }

    &--active {
      background-color: rgba($color-primary, 0.1) !important;
      color: $color-primary !important;
    }
  }

  &__calendar-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &__days-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba($color-primary, 0.1);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba($color-primary, 0.3);
      border-radius: 2px;
    }
  }

  &__days-wrapper {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    width: max-content;
  }

  &__day-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    flex-shrink: 0;
    padding: 16px;
    border-radius: 15px;
    border: 1px solid #e1e4ed;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 8px;

    &:hover {
      background-color: rgba($primary-aqua, 0.1);
    }

    &--disabled {
      background-color: #f8faff;
      cursor: not-allowed;

      &:hover {
        background-color: #f8faff;
      }

      .availability-tab__day-label,
      .availability-tab__day-number {
        color: #a4aabc;
      }
    }

    &--active {
      background-color: $primary-aqua;

      &:hover {
        background-color: $primary-aqua;
      }

      .availability-tab__day-label,
      .availability-tab__day-number {
        color: $white;
      }
    }
  }

  &__day-label {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 12px;
    letter-spacing: 2;
    color: $primary-aqua;
  }

  &__day-number {
    @include label-base;
    font-weight: 800;
    font-size: 14px;
    line-height: 12px;
    letter-spacing: 2;
    color: $primary-aqua;
  }

  &__time-selection {
    margin-top: 24px;
  }

  &__hours-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__hour-button {
    @include label-base;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 95.25px;
    border: 1px solid #e1e4ed;
    background-color: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    border-radius: 10px;
    padding: 12px 8px;
    gap: 10px;

    font-size: 14px;
    line-height: 12px;
    letter-spacing: 2;
    color: $primary-aqua;

    &:hover {
      background-color: rgba($primary-aqua, 0.1);
    }

    &--active {
      background-color: $primary-aqua;
      color: $white;
      border-color: $primary-aqua;
      font-weight: 700;

      &:hover {
        background-color: $primary-aqua;
      }
    }

    &--disabled {
      background-color: #f8faff;
      cursor: not-allowed;
      color: #a4aabc;

      &:hover {
        background-color: #f8faff;
      }
    }
  }

  &__empty-state {
    color: #6c757d;
    margin-top: 24px;
    text-align: center;
    font-style: italic;
  }

  &__reservation-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__reservation-button {
    @include primary-button;
    margin-top: 20px;
  }
}
</style>
