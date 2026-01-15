<script lang="ts" setup>
import { useUdc } from "~/composables/api";
import type { IUdc } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const { fetchUdc } = useUdc();

const step = ref(1);
const specialties = ref<IUdc[]>([]);
const isLoadingSpecialties = ref(false);

const formData = ref({
  specialty: "",
  cptCode: "",
  procedure: "",
  description: "",
  locations: [] as number[],
});

const loadSpecialties = async () => {
  try {
    isLoadingSpecialties.value = true;
    const api = fetchUdc("MEDICAL_SPECIALTY", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;
    if (response && response.data) {
      specialties.value = response.data;
    }
  } finally {
    isLoadingSpecialties.value = false;
  }
};

const handleSubmit = async () => {
  // TODO: Implementar guardar servicio
  console.log("Guardar servicio:", formData.value);
};

onMounted(async () => {
  await loadSpecialties();
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <UiHeaderBreadcrumb title="Agregar servicio" />

    <form @submit.prevent="handleSubmit" class="service-form">
      <div class="service-form__card">
        <div class="service-form__body">
          <!-- Paso 1: Información del servicio -->
          <div v-if="step === 1" class="service-form__step">
            <div class="service-form__group">
              <label class="service-form__label">Especialidad</label>
              <small class="service-form__hint">
                Selecciona una Especialidad Médica para este servicio
              </small>
              <UiDropdownBase
                v-model="formData.specialty"
                :loading="isLoadingSpecialties"
                :items="
                  specialties.map((s) => ({ value: s.code, label: s.name }))
                "
                placeholder="Seleccione especialidad"
                class="mt-2"
              />
            </div>

            <hr class="service-form__divider" />

            <div class="service-form__row">
              <div class="service-form__group">
                <label class="service-form__label">Código CPT</label>
                <small class="service-form__hint">Escribe el código CPT</small>
                <input
                  v-model="formData.cptCode"
                  type="text"
                  class="service-form__input"
                  placeholder="Ingrese código CPT"
                />
              </div>

              <div class="service-form__group service-form__group--large">
                <label class="service-form__label">Procedimiento</label>
                <small class="service-form__hint">
                  Nombre del procedimiento que ofrecerás como servicio
                </small>
                <input
                  v-model="formData.procedure"
                  type="text"
                  class="service-form__input"
                  placeholder="Ingrese nombre del procedimiento"
                />
              </div>
            </div>

            <hr class="service-form__divider" />

            <div class="service-form__group">
              <label class="service-form__label">Descripción</label>
              <small class="service-form__hint">
                Escribe una breve descripción sobre el servicio que brindarás
              </small>
              <textarea
                v-model="formData.description"
                class="service-form__textarea"
                placeholder="Ingrese descripción del servicio"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Paso 2: Lugar de atención -->
          <div v-if="step === 2" class="service-form__step">
            <h5 class="service-form__step-title">Lugar de atención</h5>
            <p class="service-form__step-description">
              Selecciona el lugar de atención disponible para atender a los
              pacientes en este servicio
            </p>

            <div class="locations-list">
              <!-- TODO: Cargar locations desde API -->
              <div class="location-card">
                <div class="location-card__info">
                  <p class="location-card__name">Clínica Principal</p>
                  <p class="location-card__address">123 Avenida Central</p>
                  <p class="location-card__city">San José, CR</p>
                </div>
                <div class="location-card__actions">
                  <input type="checkbox" class="location-card__checkbox" />
                </div>
              </div>
            </div>
          </div>

          <!-- Navegación -->
          <div class="service-form__navigation">
            <button
              v-if="step > 1"
              type="button"
              class="service-form__button--secondary"
              @click="step--"
            >
              <AtomsIconsArrowLeftIcon size="20" />
              Atrás
            </button>
            <button
              v-if="step < 2"
              type="button"
              class="service-form__button--primary"
              @click="step++"
            >
              Siguiente
              <AtomsIconsArrowRightIcon size="20" />
            </button>
            <button
              v-if="step === 2"
              type="submit"
              class="service-form__button--primary"
            >
              Guardar servicio
            </button>
          </div>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.service-form {
  &__card {
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &__body {
    padding: 2rem;
  }

  &__step {
    @include space-y(1.5rem);
  }

  &__step-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  &__step-description {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__group {
    @include space-y(0.5rem);

    &--large {
      grid-column: span 1;
    }
  }

  &__label {
    @include label-base;
    color: #1f2937;
    font-weight: 500;
  }

  &__hint {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
  }

  &__input,
  &__textarea {
    @include input-base;
    width: 100%;
    margin-top: 0.5rem;
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &__divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1.5rem 0;
  }

  &__navigation {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  &__button {
    &--secondary {
      @include outline-button;
      padding: 0.625rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    &--primary {
      @include primary-button;
      padding: 0.625rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

.locations-list {
  @include space-y(1rem);
}

.location-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  &__address,
  &__city {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  &__checkbox {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }
}
</style>
