<template>
  <section class="select-date-time__step-content">
    <header class="select-date-time__step-description">
      <h2 class="select-date-time__step-text">
        Selecciona las fechas de preferencia
      </h2>
      <p class="select-date-time__step-subtext">
        Los días y horas que tengas disponibles para que lo tengamos de
        referencia para poder concretar una cita con tu médico.
      </p>
    </header>

    <div class="select-date-time__date-selection">
      <div class="select-date-time__date-header">
        <h3 class="select-date-time__date-title">Seleccione una fecha</h3>
        <div class="select-date-time__calendar-container">
          <div class="dropdown" ref="dropdownRef">
            <button
              class="dropdown-toggle select-date-time__dropdown-button"
              type="button"
              @click="toggleDropdown"
              :aria-expanded="isDropdownOpen"
              :aria-label="
                selectedMonth
                  ? `Mes seleccionado: ${selectedMonth.label}`
                  : 'Seleccionar mes'
              "
              :disabled="isLoadingAvailability"
            >
              {{
                isLoadingAvailability
                  ? "Cargando..."
                  : selectedMonth?.label || "Seleccione un mes"
              }}
            </button>
            <ul class="dropdown-menu" :class="{ show: isDropdownOpen }">
              <li v-for="month in months" :key="month.value">
                <button
                  class="dropdown-item"
                  type="button"
                  @click="selectMonth(month)"
                  :class="{ active: selectedMonth?.value === month.value }"
                >
                  {{ month.label }}
                </button>
              </li>
            </ul>
          </div>

          <AtomsIconsCalendarIcon class="select-date-time__calendar-icon" />
        </div>
      </div>

      <div v-if="availabilityError" class="select-date-time__error">
        <p>Error al cargar disponibilidad: {{ availabilityError }}</p>
        <button
          @click="retryFetchAvailability"
          class="select-date-time__retry-button"
        >
          Reintentar
        </button>
      </div>

      <div v-if="isLoadingAvailability" class="select-date-time__loading">
        <p>Cargando disponibilidad...</p>
      </div>
    </div>

    <div class="select-date-time__days-container">
      <button
        v-for="day in availableDays"
        :key="day.date"
        @click="handleSetSelectedDate(day.date)"
        class="select-date-time__day-button"
        :class="{
          'select-date-time__day-button--active': localSelectedDay === day.date,
        }"
      >
        <span class="select-date-time__day-number">
          {{ day.number }}
        </span>
        <span class="select-date-time__day-text">
          {{ day.day }}
        </span>
      </button>
    </div>

    <div v-if="localSelectedDay" class="select-date-time__time-section">
      <h4 class="select-date-time__time-title">Seleccione la hora</h4>
      <div class="select-date-time__time-container">
        <button
          v-for="(time, index) in availableHours"
          :key="index"
          @click="handleSetSelectedHour(time)"
          class="select-date-time__time-button"
          :class="{
            'select-date-time__time-button--active': localSelectedHour === time,
          }"
        >
          {{ formatTime(time) }}
        </button>
      </div>
    </div>

    <div v-else class="select-date-time__time-placeholder">
      Por favor seleccione una fecha para ver los horarios disponibles
    </div>
  </section>
</template>

<script lang="ts" setup>
interface Props {
  selectedDay: string | null;
  selectedHour: string | null;
  supplierId: number;
}

interface Emit {
  (event: "set-selected-day", date: string): void;
  (event: "set-selected-hour", time: string): void;
}

interface Month {
  value: string;
  label: string;
}

interface AvailabilitySlot {
  id: number;
  supplier_id: number;
  location_id: number;
  weekday: string;
  from_hour: string;
  to_hour: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();

const selectedMonth = ref<Month | null>(null);
const isDropdownOpen = ref<boolean>(false);
const dropdownRef = ref<HTMLElement | null>(null);

const localSelectedDay = ref<string | null>(props.selectedDay || null);
const localSelectedHour = ref<string | null>(props.selectedHour || null);
const availableHours = ref<string[]>([]);

const supplierAvailability = ref<AvailabilitySlot[]>([]);
const processedAvailability = ref<Record<string, string[]>>({});
const isLoadingAvailability = ref<boolean>(false);
const availabilityError = ref<string | null>(null);

const toggleDropdown = (): void => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (): void => {
  isDropdownOpen.value = false;
};

const selectMonth = (month: Month): void => {
  selectedMonth.value = month;
  closeDropdown();
  localSelectedDay.value = null;
  localSelectedHour.value = null;
  availableHours.value = [];
};

const handleClickOutside = (event: Event): void => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    if (isDropdownOpen.value) {
      closeDropdown();
    }
  }
};

const handleEscapeKey = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && isDropdownOpen.value) {
    closeDropdown();
  }
};

const fetchSupplierAvailability = async (supplierId: number): Promise<void> => {
  if (!supplierId) return;

  try {
    isLoadingAvailability.value = true;
    availabilityError.value = null;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: AvailabilitySlot[] = [
      {
        id: 1,
        supplier_id: supplierId,
        location_id: 1,
        weekday: "MONDAY",
        from_hour: "08:00:00",
        to_hour: "12:00:00",
      },
      {
        id: 2,
        supplier_id: supplierId,
        location_id: 1,
        weekday: "TUESDAY",
        from_hour: "09:00:00",
        to_hour: "17:00:00",
      },
      {
        id: 3,
        supplier_id: supplierId,
        location_id: 1,
        weekday: "WEDNESDAY",
        from_hour: "08:00:00",
        to_hour: "15:00:00",
      },
      {
        id: 4,
        supplier_id: supplierId,
        location_id: 1,
        weekday: "THURSDAY",
        from_hour: "10:00:00",
        to_hour: "16:00:00",
      },
      {
        id: 5,
        supplier_id: supplierId,
        location_id: 1,
        weekday: "FRIDAY",
        from_hour: "08:00:00",
        to_hour: "14:00:00",
      },
    ];

    supplierAvailability.value = mockData;
    processAvailability(mockData);
  } catch (error) {
    console.error("Error fetching supplier availability:", error);
    availabilityError.value =
      error instanceof Error ? error.message : "Error desconocido";
  } finally {
    isLoadingAvailability.value = false;
  }
};

const processAvailability = (availability: AvailabilitySlot[]): void => {
  const processed: Record<string, string[]> = {};
  const today = new Date();

  const weekdayMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1
    );
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateString = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      if (date >= today) {
        const dayAvailability = availability.find(
          (slot) => weekdayMap[slot.weekday] === dayOfWeek
        );

        if (dayAvailability) {
          const timeSlots = generateTimeSlots(
            dayAvailability.from_hour,
            dayAvailability.to_hour
          );
          processed[dateString] = timeSlots;
        }
      }
    }
  }

  processedAvailability.value = processed;
};

const generateTimeSlots = (fromHour: string, toHour: string): string[] => {
  const slots: string[] = [];
  const [fromH, fromM] = fromHour.split(":").map(Number);
  const [toH, toM] = toHour.split(":").map(Number);

  const startMinutes = fromH * 60 + fromM;
  const endMinutes = toH * 60 + toM;
  const slotDuration = 30;

  for (
    let minutes = startMinutes;
    minutes < endMinutes;
    minutes += slotDuration
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    slots.push(timeString);
  }

  return slots;
};

const retryFetchAvailability = (): void => {
  if (props.supplierId) {
    fetchSupplierAvailability(props.supplierId);
  }
};

const selectDay = (date: string): void => {
  localSelectedDay.value = date;
  localSelectedHour.value = null;
  availableHours.value = processedAvailability.value[date] || [];
};

const getAvailableDaysForMonth = (monthValue: string, year: number) => {
  const month = parseInt(monthValue, 10) - 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDays = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];

    if (date >= today && processedAvailability.value[dateString]) {
      availableDays.push({
        date: dateString,
        day: date.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 3),
        number: date.getDate(),
      });
    }
  }

  return availableDays;
};

const availableDays = computed(() => {
  if (!selectedMonth.value) return [];

  const currentYear = new Date().getFullYear();
  return getAvailableDaysForMonth(selectedMonth.value.value, currentYear);
});

const formatTime = (time: string): string => {
  if (!time || typeof time !== "string") {
    return "N/A";
  }
  try {
    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) {
      return "N/A";
    }
    const numHours = parseInt(hours, 10);
    const period = numHours >= 12 ? "PM" : "AM";
    const displayHours = numHours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return "N/A";
  }
};

const months: Month[] = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const handleSetSelectedDate = (date: string): void => {
  localSelectedDay.value = date;
  emit("set-selected-day", date);
  selectDay(date);
};

const handleSetSelectedHour = (time: string): void => {
  localSelectedHour.value = time;
  emit("set-selected-hour", time);
};

onMounted(() => {
  nextTick(() => {
    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("keydown", handleEscapeKey);
  });

  if (props.supplierId) {
    fetchSupplierAvailability(props.supplierId);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscapeKey);
});

watch(
  () => props.supplierId,
  (newSupplierId) => {
    if (newSupplierId) {
      fetchSupplierAvailability(newSupplierId);
    }
  }
);
</script>

<style lang="scss" scoped>
.select-date-time {
  &__step-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__step-description {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step-text {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #19213d;
    margin: 0;
  }

  &__step-subtext {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #6d758f;
    margin: 0;
  }

  &__date-selection {
    width: 100%;
    background: #f8faff;
    border-radius: 15px;
    gap: 20px;
    padding: 15px 10px;
    box-shadow: 0px 1px 4px 0px #19213d14;
  }

  &__date-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__date-title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
    color: #19213d;
    margin: 0;
  }

  &__calendar-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #e2e4fa;
    border-radius: 20px;
  }

  &__calendar-icon {
    width: 20px;
    height: 20px;
    color: #3541b4;
  }

  &__dropdown-button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #3541b4 !important;
    padding: 0 !important;
    font-size: 14px;
    font-weight: 600;

    &:hover,
    &:focus,
    &:active {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #3541b4 !important;
    }

    &::after {
      display: none;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    color: #dc2626;

    p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
  }

  &__retry-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #b91c1c;
    }
  }

  &__loading {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    color: #0369a1;
    text-align: center;

    p {
      margin: 0;
      font-size: 14px;
      font-style: italic;
    }
  }

  &__days-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-top: 8px;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
  }

  &__day-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    padding: 8px 12px;
    border: 1px solid #17a2b8;
    border-radius: 8px;
    background: transparent;
    color: #17a2b8;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;

    &:not(&--active):not(:disabled):hover {
      background-color: rgba(23, 162, 184, 0.1);
    }

    &:disabled {
      background-color: #f8faff;
      opacity: 0.6;
      cursor: not-allowed;
      border: 1px solid #e1e4ed;

      .select-date-time__day-text {
        color: #6d758f;
      }
      .select-date-time__day-number {
        color: #263257;
      }
    }

    &--active {
      background-color: #17a2b8;
      color: white;
      border-color: #17a2b8;

      .select-date-time__day-text,
      .select-date-time__day-number {
        color: white;
      }
    }
  }

  &__day-text {
    font-size: 12px;
    color: #17a2b8;
    margin-bottom: 2px;
  }

  &__day-number {
    font-weight: 600;
    font-size: 14px;
    color: #17a2b8;
  }

  &__time-section {
    margin-top: 24px;
  }

  &__time-title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #19213d;
    margin: 0 0 16px 0;
  }

  &__time-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__time-button {
    padding: 8px 16px;
    border: 1px solid #17a2b8;
    border-radius: 6px;
    background: transparent;
    color: #17a2b8;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    position: relative;

    &:not(&--active):not(:disabled):hover {
      background-color: rgba(23, 162, 184, 0.1);
      transform: translateY(-1px);
    }

    &:disabled {
      background-color: #f8faff;
      opacity: 0.6;
      cursor: not-allowed;
      border: 1px solid #e1e4ed;

      color: #6d758f;
    }

    &--active {
      background-color: #17a2b8;
      color: white;
      border-color: #17a2b8;
    }
  }

  &__time-placeholder {
    color: #6c757d;
    margin-top: 24px;
    padding: 16px;
    text-align: center;
    background: #f8f9fa;
    border-radius: 8px;
    font-style: italic;
  }
}

.dropdown {
  position: relative;
}

:deep(.dropdown-menu) {
  position: absolute !important;
  top: calc(100% + 16px) !important;
  left: auto !important;
  right: -40px !important;
  z-index: 1050 !important;
  display: none;
  min-width: 12rem;
  padding: 0.5rem 0;
  margin: 0;
  font-size: 0.875rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
  max-height: 200px;
  overflow-y: auto;

  &.show {
    display: block !important;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: 0.25rem 1rem;
    clear: both;
    font-weight: 400;
    color: #212529;
    text-align: inherit;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    outline: none;
    border: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out;

    &:hover,
    &:focus {
      color: #1e2125;
      background-color: #e9ecef;
    }

    &.active,
    &:active {
      color: #fff !important;
      text-decoration: none;
      background-color: #3541b4 !important;
    }

    &:disabled,
    &.disabled {
      color: #6c757d;
      pointer-events: none;
      background-color: transparent;
    }
  }
}
</style>
