<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="large"
    :close-on-backdrop="false"
    @close="handleCloseModal"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h2 v-if="internalCurrentStep !== 3" class="add-service__header-title">
        {{ isEditing ? "Editar Servicio" : "Nuevo Servicio" }}
      </h2>
    </template>

    <div class="add-service__content">
      <WebsiteStepper
        v-if="internalCurrentStep !== 0 && internalCurrentStep !== 3"
        :steps="steps"
        :currentStep="internalCurrentStep"
      />

      <div v-if="internalCurrentStep === 1" class="add-service__step">
        <div class="add-service__form">
          <div class="add-service__field">
            <label class="add-service__label">Nombre del Servicio</label>
            <input
              type="text"
              class="add-service__input"
              v-model="serviceName"
            />
          </div>

          <div class="add-service__field">
            <label class="add-service__label">Especialidad Medica</label>
            <select
              class="add-service__select"
              v-model="selectedSpecialty"
              aria-describedby="especialidad-help"
            >
              <option value="" disabled selected>
                Buscar por especialidad
              </option>
              <option
                v-for="specialty in specialties"
                :key="specialty.code"
                :value="specialty.code"
              >
                {{ specialty.name }}
              </option>
            </select>
          </div>

          <div class="add-service__field">
            <label class="add-service__label"
              >Escribe una breve descripcion</label
            >
            <textarea
              rows="5"
              class="add-service__textarea"
              v-model="serviceDescription"
            ></textarea>
          </div>

          <div class="add-service__field">
            <label class="add-service__label"
              >Selecciona un hospital de atencion</label
            >
            <p class="add-service__description">
              Indica el/los lugares donde tendrá disponibilidad este servicio
            </p>

            <div class="add-service__hospitals">
              <div
                v-for="(hospital, index) in hospitals"
                :key="index"
                class="add-service__hospital-item"
              >
                <input
                  type="text"
                  class="add-service__input"
                  v-model="hospital.name"
                  placeholder="Nombre del hospital"
                />
                <button
                  class="add-service__remove-button"
                  @click="removeHospital(index)"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </div>

            <button class="add-service__add-button" @click="addHospital">
              Añadir Hospital de Atencion
            </button>
          </div>
        </div>
      </div>

      <div v-if="internalCurrentStep === 2" class="add-service__step">
        <div class="add-service__form">
          <p class="add-service__subtitle">Configura tus packs:</p>
          <p class="add-service__description">
            Puedes agregar multiples packs a tu servicio
          </p>

          <div
            v-for="(pack, packIndex) in packs"
            :key="packIndex"
            class="add-service__pack"
          >
            <div class="add-service__pack-header">
              <h5 class="add-service__pack-title">Pack {{ packIndex + 1 }}</h5>
              <button
                class="add-service__pack-remove"
                @click="removePack(packIndex)"
              >
                Eliminar Pack
              </button>
            </div>

            <div class="add-service__field">
              <label class="add-service__label">Nombre</label>
              <input
                type="text"
                class="add-service__input"
                v-model="pack.name"
                placeholder="Escribe aquí un nombre"
              />
            </div>

            <div class="add-service__field">
              <label class="add-service__label">Incluye:</label>
              <input
                type="text"
                class="add-service__input"
                v-model="pack.services"
                placeholder="Escribe aquí un nombre"
              />
            </div>

            <div class="add-service__field">
              <label class="add-service__label"
                >Establece el precio del servicio:</label
              >
              <div class="add-service__price-group">
                <span class="add-service__price-label">Desde</span>
                <div class="add-service__price-inputs">
                  <input
                    type="number"
                    v-model="pack.price"
                    placeholder="0.00"
                    class="add-service__price-input"
                  />
                  <select
                    class="add-service__currency-select"
                    v-model="pack.currency"
                  >
                    <option
                      v-for="currency in currencies"
                      :key="currency.code"
                      :value="currency.code"
                    >
                      {{ currency.code }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="add-service__field">
              <label class="add-service__label">Disponibilidad</label>
              <p class="add-service__description">
                Selecciona los días y horarios disponibles para este pack
              </p>

              <div
                v-for="(day, dayIndex) in weekDays"
                :key="dayIndex"
                class="add-service__day"
              >
                <div class="add-service__day-header">
                  <div class="add-service__switch">
                    <input
                      class="add-service__switch-input"
                      type="checkbox"
                      :id="`day-${packIndex}-${dayIndex}`"
                      v-model="pack.availability[dayIndex].active"
                    />
                    <label
                      class="add-service__switch-label"
                      :for="`day-${packIndex}-${dayIndex}`"
                    >
                      {{ day }}
                    </label>
                  </div>
                </div>

                <div
                  v-if="pack.availability[dayIndex].active"
                  class="add-service__time-slots"
                >
                  <div
                    v-for="(timeSlot, timeIndex) in pack.availability[dayIndex]
                      .timeSlots"
                    :key="timeIndex"
                    class="add-service__time-slot"
                  >
                    <div class="add-service__time-input">
                      <label class="add-service__time-label">Desde</label>
                      <input
                        type="time"
                        class="add-service__time"
                        v-model="timeSlot.from"
                        placeholder="00:00"
                      />
                    </div>
                    <div class="add-service__time-input">
                      <label class="add-service__time-label">Hasta</label>
                      <input
                        type="time"
                        class="add-service__time"
                        v-model="timeSlot.to"
                        placeholder="00:00"
                      />
                    </div>
                    <button
                      class="add-service__time-remove"
                      @click="
                        removeTimeSlot(
                          pack.availability[dayIndex].timeSlots,
                          timeIndex
                        )
                      "
                      title="Eliminar horario"
                    >
                      ×
                    </button>
                  </div>

                  <button
                    class="add-service__time-add"
                    @click="addTimeSlot(pack.availability[dayIndex].timeSlots)"
                  >
                    <i class="bi bi-plus-circle"></i> Añadir horario
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button class="add-service__add-pack" @click="addPack">
            + Agregar un pack
          </button>
        </div>
      </div>

      <div v-if="internalCurrentStep === 3" class="add-service__confirmation">
        <div class="add-service__success-icon">
          <img src="@/src/assets/check.svg" width="48" alt="Success" />
        </div>
        <h5 class="add-service__success-title">
          {{
            isEditing
              ? "Servicio actualizado exitosamente"
              : "Servicio creado exitosamente"
          }}
        </h5>
        <p class="add-service__success-description">
          {{
            isEditing
              ? "Tu servicio se ha actualizado correctamente, ahora puedes verlo y administrarlo en el menú de servicios."
              : "Tu servicio se creado correctamente, ahora puedes verlo y administrarlo en el menú de servicios."
          }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="add-service__actions">
        <template v-if="internalCurrentStep === 1">
          <button
            class="add-service__button--outline"
            @click="closeConfirmationModal"
          >
            Cancelar
          </button>
          <button class="add-service__button--primary" @click="goToStep(2)">
            Continuar
          </button>
        </template>

        <template v-if="internalCurrentStep === 2">
          <button class="add-service__button--outline" @click="goToStep(1)">
            Volver
          </button>
          <button class="add-service__button--primary" @click="saveService">
            {{ isEditing ? "Actualizar" : "Guardar" }}
          </button>
        </template>

        <template v-if="internalCurrentStep === 3">
          <NuxtLink
            href="/medicos/inicio"
            class="add-service__button--outline add-service__button--full"
          >
            Ir al home
          </NuxtLink>
          <button
            class="add-service__button--primary add-service__button--full"
            @click="handleCloseModal"
          >
            Ver en servicios
          </button>
        </template>
      </div>
    </template>
  </AtomsModalBase>

  <WebsiteReservarCancelModal
    :isOpen="isConfirmationModalOpen"
    @close="closeConfirmationModal"
    @confirm-exit="handleCloseModal"
  />
</template>

<script lang="ts" setup>
import type { Package } from "~/types";

interface Specialty {
  code: string;
  name: string;
}

interface Currency {
  code: string;
  symbol: string;
}

interface Hospital {
  name: string;
}

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Pack {
  name: string;
  services: string;
  price: number;
  currency: string;
  availability: DayAvailability[];
}

interface Props {
  specialties?: Specialty[];
  currentStep?: number;
  package?: Package;
}

const props = withDefaults(defineProps<Props>(), {
  specialties: () => [],
  currentStep: 1,
  package: undefined,
});

const emit = defineEmits<{
  close: [];
  "update:currentStep": [step: number];
  "confirm-exit": [];
}>();

const isEditing = computed(() => !!props.package);

const isModalOpen = ref<boolean>(false);
const internalCurrentStep = ref<number>(props.currentStep);
const isConfirmationModalOpen = ref<boolean>(false);
const selectedSpecialty = ref<string>("");
const serviceName = ref<string>("");
const serviceDescription = ref<string>("");
const hospitals = ref<Hospital[]>([]);
const packs = ref<Pack[]>([]);

const steps = ["Detalles", "Packs y precio"];
const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const currencies: Currency[] = [
  { code: "CRC", symbol: "₡" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "MXN", symbol: "$" },
  { code: "COP", symbol: "$" },
  { code: "ARS", symbol: "$" },
];

const loadPackageData = (packageData: Package): void => {
  serviceName.value = packageData.product?.name || "";
  serviceDescription.value = packageData.product?.description || "";

  const packData: Pack = {
    name: packageData.product?.name || "",
    services: packageData.services_offer?.ASSESSMENT_DETAILS?.join(", ") || "",
    price: packageData.reference_price || 0,
    currency: "CRC",
    availability: weekDays.map(() => ({
      active: false,
      timeSlots: [{ from: "", to: "" }],
    })),
  };

  packs.value = [packData];

  hospitals.value = [];
};

const resetForm = (): void => {
  serviceName.value = "";
  serviceDescription.value = "";
  selectedSpecialty.value = "";
  hospitals.value = [];
  packs.value = [];
  internalCurrentStep.value = props.currentStep;
};

watch(
  () => props.currentStep,
  (newVal) => {
    internalCurrentStep.value = newVal;
  }
);

watch(
  () => props.package,
  (newPackage) => {
    if (newPackage) {
      loadPackageData(newPackage);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleOpenModal = (): void => {
  isModalOpen.value = true;
  if (!isEditing.value) {
    resetForm();
  }
};

const handleCloseModal = (): void => {
  isModalOpen.value = false;
  isConfirmationModalOpen.value = false;
  emit("close");
};

const openConfirmationModal = (): void => {
  emit("confirm-exit");
};

const closeConfirmationModal = (): void => {
  isConfirmationModalOpen.value = false;
};

const goToStep = (step: number): void => {
  internalCurrentStep.value = step;
  emit("update:currentStep", step);
};

const addHospital = (): void => {
  hospitals.value.push({ name: "" });
};

const removeHospital = (index: number): void => {
  hospitals.value.splice(index, 1);
};

const addPack = (): void => {
  const availability: DayAvailability[] = weekDays.map(() => ({
    active: false,
    timeSlots: [{ from: "", to: "" }],
  }));

  packs.value.push({
    name: "",
    services: "",
    price: 0,
    currency: "USD",
    availability,
  });
};

const removePack = (index: number): void => {
  packs.value.splice(index, 1);
};

const addTimeSlot = (timeSlots: TimeSlot[]): void => {
  timeSlots.push({ from: "", to: "" });
};

const removeTimeSlot = (timeSlots: TimeSlot[], index: number): void => {
  if (timeSlots.length > 1) {
    timeSlots.splice(index, 1);
  }
};

const saveService = (): void => {
  const serviceData = {
    id: isEditing.value ? props.package?.id : undefined,
    serviceName: serviceName.value,
    selectedSpecialty: selectedSpecialty.value,
    serviceDescription: serviceDescription.value,
    hospitals: hospitals.value,
    packs: packs.value,
  };

  console.log(
    isEditing.value ? "Updating service:" : "Creating service:",
    serviceData
  );

  // Here you would make the API call to save or update the service
  // if (isEditing.value) {
  //   await updateService(serviceData);
  // } else {
  //   await createService(serviceData);
  // }

  goToStep(3);
};
</script>

<style lang="scss" scoped>
.add-service {
  &__header-title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0;
    color: #353e5c;
    margin: 0;
  }

  &__content {
    padding: 24px;
  }

  &__step {
    padding: 20px 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    @include label-base;
    font-weight: 600;
    font-size: 14px;
    color: #344054;
  }

  &__description {
    @include text-base;
    font-size: 14px;
    color: #667085;
    margin: 0;
  }

  &__subtitle {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    color: #101828;
    margin: 0;
  }

  &__input {
    @include input-base;
  }

  &__select {
    @extend .add-service__input;
    cursor: pointer;
  }

  &__textarea {
    @extend .add-service__input;
    resize: vertical;
    min-height: 120px;
  }

  &__hospitals {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 50%;
  }

  &__hospital-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__remove-button {
    @include button-base;
    background: none;
    border: none;
    font-size: 20px;
    color: #f04438;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;

    &:hover {
      background-color: #fef3f2;
    }
  }

  &__add-button {
    @include button-base;
    background-color: #0ea5e9;
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    align-self: flex-start;

    &:hover {
      background-color: #0284c7;
    }
  }

  &__pack {
    background-color: #f9f9f9;
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }

  &__pack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__pack-title {
    @include label-base;
    font-weight: 500;
    font-size: 16px;
    color: #667085;
    margin: 0;
  }

  &__pack-remove {
    @include button-base;
    background: none;
    border: 1px solid #f04438;
    color: #f04438;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #fef3f2;
    }
  }

  &__price-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__price-label {
    @include text-base;
    font-size: 14px;
    color: #667085;
  }

  &__price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__price-input {
    @extend .add-service__input;
    width: 150px;
  }

  &__currency-select {
    @extend .add-service__input;
    width: 100px;
  }

  &__day {
    background-color: white;
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }

  &__day-header {
    margin-bottom: 12px;
  }

  &__switch {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__switch-input {
    width: 40px;
    height: 20px;
    border-radius: 10px;
    border: none;
    background-color: #e4e7ec;
    cursor: pointer;
    appearance: none;
    position: relative;
    transition: background-color 0.2s;

    &:checked {
      background-color: #7f56d9;
    }

    &::before {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: white;
      top: 2px;
      left: 2px;
      transition: transform 0.2s;
    }

    &:checked::before {
      transform: translateX(20px);
    }
  }

  &__switch-label {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    color: #344054;
    cursor: pointer;
  }

  &__time-slots {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__time-slot {
    display: flex;
    gap: 12px;
    align-items: end;
    width: 50%;
  }

  &__time-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__time-label {
    @include label-base;
    font-size: 12px;
    color: #667085;
  }

  &__time {
    @extend .add-service__input;
  }

  &__time-remove {
    @extend .add-service__remove-button;
    margin-bottom: 0;
  }

  &__time-add {
    @include button-base;
    background: none;
    border: 1px solid #d0d5dd;
    color: #344054;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    align-self: flex-start;

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__add-pack {
    @include button-base;
    background: none;
    border: 1px solid #d0d5dd;
    color: #344054;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    align-self: flex-start;

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__confirmation {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    text-align: center;
  }

  &__success-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background-color: #f0f9ff;
    border-radius: 50%;
    margin-bottom: 24px;
  }

  &__success-title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    color: #101828;
    margin: 0 0 12px 0;
  }

  &__success-description {
    @include text-base;
    font-size: 16px;
    color: #667085;
    margin: 0 0 32px 0;
    max-width: 400px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  &__button {
    &--outline {
      @include outline-button;
      padding: 12px 20px;
      border-radius: 8px;
    }

    &--primary {
      @include primary-button;
      padding: 12px 20px;
      border-radius: 8px;
    }

    &--full {
      flex: 1;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
