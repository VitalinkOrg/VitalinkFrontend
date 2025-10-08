<template>
  <div class="availability-selector">
    <div class="availability-selector__card">
      <div class="availability-selector__card-content">
        <div class="availability-selector__date-selection">
          <div class="availability-selector__date-header">
            <h4 class="availability-selector__section-title">
              Seleccione una fecha
            </h4>
            <div class="availability-selector__calendar-container">
              <div class="dropdown availability-selector__dropdown">
                <button
                  class="dropdown-toggle availability-selector__dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  @click="toggleDropdown"
                >
                  {{ selectedMonthLabel || "Seleccione un mes" }}
                </button>
                <ul
                  class="dropdown-menu availability-selector__dropdown-menu"
                  :class="{ show: isDropdownOpen }"
                  ref="dropdownRef"
                >
                  <li>
                    <button
                      v-for="month in months"
                      :key="month.value"
                      class="dropdown-item availability-selector__dropdown-item"
                      :class="{
                        'availability-selector__dropdown-item--active':
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

          <div class="availability-selector__days-container">
            <div class="availability-selector__days-wrapper">
              <button
                v-for="day in availableDays"
                :key="day.date"
                @click="handleDaySelect(day.date)"
                :disabled="isDayFullyBooked(day.date)"
                class="availability-selector__day-button"
                :class="{
                  'availability-selector__day-button--active':
                    selectedDay === day.date,
                }"
              >
                <span class="availability-selector__day-number">
                  {{ day.number }}
                </span>
                <span class="availability-selector__day-label">
                  {{ day.day }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedDay" class="availability-selector__time-selection">
          <h4
            class="availability-selector__section-title availability-selector__section-title--small"
          >
            Seleccione la hora
          </h4>
          <div class="availability-selector__hours-container">
            <button
              v-for="(time, index) in availableHours"
              :key="index"
              @click="handleHourSelect(time)"
              :disabled="isHourBooked(time)"
              class="availability-selector__hour-button"
              :class="{
                'availability-selector__hour-button--active':
                  selectedHour === time,
              }"
            >
              {{ formatTime(time) }}
            </button>
          </div>
        </div>

        <div v-else class="availability-selector__empty-state">
          Por favor seleccione una fecha para ver los horarios disponibles
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppointment, useAvailability } from "@/composables/api";
import type { Availability } from "@/types";
import { onClickOutside } from "@vueuse/core";

interface Props {
  supplierId: number;
  modelValue?: {
    day: string | null;
    hour: string | null;
  };
}

interface Emits {
  (
    e: "update:modelValue",
    value: { day: string | null; hour: string | null }
  ): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime, capitalize } = useFormat();
const { fetchAvailabilityBySupplierId } = useAvailability();
const { fetchAllAppointments } = useAppointment();

const apiAvailability = ref<Availability[]>([]);
const bookedAppointments = ref<any[]>([]);
const selectedDay = ref<string | null>(props.modelValue?.day || null);
const selectedHour = ref<string | null>(props.modelValue?.hour || null);
const selectedMonth = ref<number | null>(null);
const selectedMonthLabel = ref<string>("");
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const weekdayMap: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

const months = computed(() => {
  const today = new Date();
  const monthsList = [];

  for (let i = 0; i < 3; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthName = date.toLocaleDateString("es-ES", { month: "long" });

    monthsList.push({
      value: date.getMonth(),
      label: capitalize(monthName),
      year: date.getFullYear(),
    });
  }

  return monthsList;
});

const availableDays = computed(() => {
  if (!apiAvailability.value.length || selectedMonth.value === null) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedMonthData = months.value.find(
    (m) => m.value === selectedMonth.value
  );
  if (!selectedMonthData) return [];

  const year = selectedMonthData.year;
  const month = selectedMonth.value;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();

    if (date < today) continue;

    const hasAvailability = apiAvailability.value.some((avail) => {
      if (!avail.weekday) return true;

      const availWeekday = weekdayMap[avail.weekday];
      return availWeekday === dayOfWeek;
    });

    if (hasAvailability) {
      days.push({
        date: date.toISOString().split("T")[0],
        number: day,
        day: date.toLocaleDateString("es-ES", { weekday: "short" }),
        fullDate: date,
      });
    }
  }

  return days;
});

const availableHours = computed(() => {
  if (!selectedDay.value || !apiAvailability.value.length) return [];

  const selectedDate = new Date(selectedDay.value + "T00:00:00");
  const dayOfWeek = selectedDate.getDay();
  const hours: string[] = [];

  const dayAvailability = apiAvailability.value.filter((avail) => {
    if (!avail.weekday) return true;
    const availWeekday = weekdayMap[avail.weekday];
    return availWeekday === dayOfWeek;
  });

  dayAvailability.forEach((avail) => {
    const [fromHour, fromMinute] = avail.from_hour.split(":").map(Number);
    const [toHour, toMinute] = avail.to_hour.split(":").map(Number);

    const start = fromHour * 60 + fromMinute;
    const end = toHour * 60 + toMinute;

    for (let time = start; time < end; time += 30) {
      const hour = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
      const minute = (time % 60).toString().padStart(2, "0");
      const timeString = `${hour}:${minute}:00`;

      if (!hours.includes(timeString)) {
        hours.push(timeString);
      }
    }
  });

  return hours.sort();
});

const isHourBooked = (hour: string): boolean => {
  if (!selectedDay.value || !bookedAppointments.value.length) return false;

  return bookedAppointments.value.some((appointment) => {
    const appointmentDate = appointment.appointment_date;
    const appointmentTime = appointment.appointment_hour;

    return appointmentDate === selectedDay.value && appointmentTime === hour;
  });
};

const isDayFullyBooked = (date: string): boolean => {
  if (!bookedAppointments.value.length) return false;

  const selectedDate = new Date(date + "T00:00:00");
  const dayOfWeek = selectedDate.getDay();

  const dayAvailability = apiAvailability.value.filter((avail) => {
    if (!avail.weekday) return true;
    const availWeekday = weekdayMap[avail.weekday];
    return availWeekday === dayOfWeek;
  });

  const allDayHours: string[] = [];
  dayAvailability.forEach((avail) => {
    const [fromHour, fromMinute] = avail.from_hour.split(":").map(Number);
    const [toHour, toMinute] = avail.to_hour.split(":").map(Number);

    const start = fromHour * 60 + fromMinute;
    const end = toHour * 60 + toMinute;

    for (let time = start; time < end; time += 30) {
      const hour = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
      const minute = (time % 60).toString().padStart(2, "0");
      const timeString = `${hour}:${minute}:00`;

      if (!allDayHours.includes(timeString)) {
        allDayHours.push(timeString);
      }
    }
  });

  const bookedHoursCount = allDayHours.filter((hour) => {
    return bookedAppointments.value.some((appointment) => {
      const appointmentDate = appointment.appointment_date;
      const appointmentTime = appointment.appointment_hour;
      return appointmentDate === date && appointmentTime === hour;
    });
  }).length;

  return bookedHoursCount === allDayHours.length && allDayHours.length > 0;
};

const getAvailability = async () => {
  if (!props.supplierId) return;

  const api = fetchAvailabilityBySupplierId(props.supplierId);
  await api.request();

  const response = api.response.value;

  if (response?.data) {
    apiAvailability.value = response.data;
  }
};

const getAppointments = async () => {
  if (!props.supplierId) return;

  const api = fetchAllAppointments();
  await api.request();

  const response = api.response.value;

  if (response?.data) {
    const allAppointments = Array.isArray(response.data) ? response.data : [];
    bookedAppointments.value = allAppointments.filter(
      (appointment) => appointment.supplier?.id === props.supplierId
    );
  }
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleMonthSelect = (month: any) => {
  selectedMonth.value = month.value;
  selectedMonthLabel.value = month.label;
  isDropdownOpen.value = false;
  selectedDay.value = null;
  selectedHour.value = null;
  emitUpdate();
};

const handleDaySelect = (date: string) => {
  selectedDay.value = date;
  selectedHour.value = null;
  emitUpdate();
};

const handleHourSelect = (time: string) => {
  selectedHour.value = time;
  emitUpdate();
};

const emitUpdate = () => {
  emit("update:modelValue", {
    day: selectedDay.value,
    hour: selectedHour.value,
  });
};

const closeDropdown = (): void => {
  isDropdownOpen.value = false;
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedDay.value = newValue.day;
      selectedHour.value = newValue.hour;
    }
  },
  { deep: true }
);

watch(
  () => props.supplierId,
  async (newId) => {
    if (newId) {
      await getAvailability();
      await getAppointments();
    }
  },
  { immediate: false }
);

onMounted(async () => {
  await getAvailability();
  await getAppointments();
});

onClickOutside(dropdownRef, () => {
  if (isDropdownOpen.value) closeDropdown();
});
</script>

<style lang="scss" scoped>
.availability-selector {
  &__card {
    gap: 17px;
    border-radius: 15px;
    padding: 15px;
    background-color: #f8faff;
    box-shadow: 0px 1px 4px 0px rgba(25, 33, 61, 0.08);
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
    width: 63px;
    padding: 16px;
    gap: 8px;
    border-radius: 15px;
    background: transparent;
    color: $primary-aqua;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;
    border: 1px solid #e1e4ed;

    &:not(&--active):not(:disabled):hover {
      background-color: rgba($primary-aqua, 0.05);
    }

    &:disabled {
      background-color: #f8faff;
      opacity: 0.6;
      cursor: not-allowed;
      border: 1px solid #e1e4ed;

      .availability-selector__day-label {
        color: #6d758f;
      }
      .availability-selector__day-number {
        color: #263257;
      }
    }

    &--active {
      background-color: $primary-aqua;
      color: $white;
      border-color: $primary-aqua;

      .availability-selector__day-label,
      .availability-selector__day-number {
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
    font-weight: 700;
    font-size: 16px;
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

    &:disabled {
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
}
</style>
