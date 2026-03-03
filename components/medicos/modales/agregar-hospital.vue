<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-large"
    class="add-hospital"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    role="dialog"
    :aria-label="modalAriaLabel"
    @close="handleCloseModal"
  >
    <template #title>
      <h2 id="hospital-modal-title" class="add-hospital__title">
        {{
          isEditMode
            ? "Editar Hospital o Clínica"
            : "Añade un Hospital o Clínica"
        }}
      </h2>
    </template>

    <form
      class="add-hospital__content"
      novalidate
      aria-labelledby="hospital-modal-title"
      @submit.prevent="handleSubmit"
    >
      <div
        v-if="formError"
        class="add-hospital__form-error"
        role="alert"
        aria-live="assertive"
      >
        <span class="add-hospital__form-error-icon" aria-hidden="true">✕</span>
        <p class="add-hospital__form-error-message">{{ formError }}</p>
      </div>

      <div v-if="!isEditMode" class="add-hospital__form-group">
        <label id="search-hospital-label" class="add-hospital__label">
          Buscar por nombre
        </label>
        <UiDropdownBase
          v-model="selectedHospitalId"
          :items="hospitalDropdownItems"
          :loading="isSearching"
          :searchable="true"
          :clearable="true"
          placeholder="Buscar hospital..."
          no-results-text="No se encontraron hospitales"
          aria-labelledby="search-hospital-label"
          @select="handleHospitalSelect"
          @clear="handleClearSearch"
        />
      </div>

      <div class="add-hospital__form-group">
        <label :for="FIELD_IDS.name" class="add-hospital__label">
          {{
            isEditMode
              ? "Nombre del Hospital"
              : "O escribe el nombre del Hospital"
          }}
          <span class="add-hospital__required" aria-hidden="true">*</span>
        </label>
        <input
          :id="FIELD_IDS.name"
          v-model.trim="formData.name"
          type="text"
          class="add-hospital__input"
          :class="{ 'add-hospital__input--error': errors.name }"
          placeholder="Clínica Santa Lucía"
          required
          autocomplete="organization"
          :aria-invalid="!!errors.name"
          :aria-describedby="
            errors.name ? `${FIELD_IDS.name}-error` : undefined
          "
          @blur="validateField('name')"
        />
        <span
          v-if="errors.name"
          :id="`${FIELD_IDS.name}-error`"
          class="add-hospital__error-message"
          role="alert"
        >
          {{ errors.name }}
        </span>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.address" class="add-hospital__label">
            Dirección física
            <span class="add-hospital__required" aria-hidden="true">*</span>
          </label>
          <input
            :id="FIELD_IDS.address"
            v-model.trim="formData.address"
            type="text"
            class="add-hospital__input"
            :class="{ 'add-hospital__input--error': errors.address }"
            placeholder="San José, Costa Rica, Paseo colón..."
            required
            autocomplete="street-address"
            :aria-invalid="!!errors.address"
            :aria-describedby="
              errors.address ? `${FIELD_IDS.address}-error` : undefined
            "
            @blur="validateField('address')"
          />
          <span
            v-if="errors.address"
            :id="`${FIELD_IDS.address}-error`"
            class="add-hospital__error-message"
            role="alert"
          >
            {{ errors.address }}
          </span>
        </div>

        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.street_number" class="add-hospital__label">
            Nº de calle
          </label>
          <input
            :id="FIELD_IDS.street_number"
            v-model.trim="formData.street_number"
            type="text"
            class="add-hospital__input"
            placeholder="123"
          />
        </div>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.postal_code" class="add-hospital__label">
            Código Postal
          </label>
          <input
            :id="FIELD_IDS.postal_code"
            v-model.trim="formData.postal_code"
            type="text"
            class="add-hospital__input"
            placeholder="0000000"
            autocomplete="postal-code"
          />
        </div>

        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.city_name" class="add-hospital__label">
            Ciudad
            <span class="add-hospital__required" aria-hidden="true">*</span>
          </label>
          <input
            :id="FIELD_IDS.city_name"
            v-model.trim="formData.city_name"
            type="text"
            class="add-hospital__input"
            :class="{ 'add-hospital__input--error': errors.city_name }"
            placeholder="Ciudad"
            required
            autocomplete="address-level2"
            :aria-invalid="!!errors.city_name"
            :aria-describedby="
              errors.city_name ? `${FIELD_IDS.city_name}-error` : undefined
            "
            @blur="validateField('city_name')"
          />
          <span
            v-if="errors.city_name"
            :id="`${FIELD_IDS.city_name}-error`"
            class="add-hospital__error-message"
            role="alert"
          >
            {{ errors.city_name }}
          </span>
        </div>

        <div class="add-hospital__form-group">
          <label id="country-label" class="add-hospital__label">
            País
            <span class="add-hospital__required" aria-hidden="true">*</span>
          </label>
          <UiDropdownBase
            v-model="formData.country_iso_code"
            :items="countryDropdownItems"
            :searchable="true"
            :clearable="false"
            placeholder="Seleccionar país"
            no-results-text="No se encontraron países"
            :error="!!errors.country_iso_code"
            aria-labelledby="country-label"
            @update:model-value="validateField('country_iso_code')"
          />
          <span
            v-if="errors.country_iso_code"
            class="add-hospital__error-message"
            role="alert"
          >
            {{ errors.country_iso_code }}
          </span>
        </div>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.floor" class="add-hospital__label">Piso</label>
          <input
            :id="FIELD_IDS.floor"
            v-model.trim="formData.floor"
            type="text"
            class="add-hospital__input"
            placeholder="1"
          />
        </div>

        <div class="add-hospital__form-group">
          <label :for="FIELD_IDS.door_number" class="add-hospital__label">
            Nº de puerta
          </label>
          <input
            :id="FIELD_IDS.door_number"
            v-model.trim="formData.door_number"
            type="text"
            class="add-hospital__input"
            placeholder="Nº de puerta"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="add-hospital__actions">
        <button
          type="button"
          class="add-hospital__button--cancel"
          :disabled="isSubmitting"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="add-hospital__button--primary"
          :disabled="isSubmitting || !isFormValid"
          :aria-busy="isSubmitting"
          @click="handleSubmit"
        >
          <template v-if="isSubmitting">
            <span class="add-hospital__spinner" aria-hidden="true" />
            Procesando...
          </template>
          <template v-else>
            {{ isEditMode ? "Guardar cambios" : "Agregar" }}
          </template>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useLocation } from "@/composables/api/useLocation";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import type { DropdownItem } from "~/components/ui/dropdown-base.vue";

/* ──────────────────────────── Types ──────────────────────────── */

interface HospitalFormData {
  name: string;
  address: string;
  street_number: string;
  postal_code: string;
  city_name: string;
  country_iso_code: string;
  floor: string;
  door_number: string;
}

type ValidatableField = "name" | "address" | "city_name" | "country_iso_code";

type FormErrors = Partial<Record<ValidatableField, string>>;

interface Props {
  isOpen: boolean;
  editMode?: "create" | "edit";
  hospital?: ILocation | null;
}

interface Emits {
  (e: "update:isOpen", value: boolean): void;
  (e: "hospital-created", hospital: ILocation): void;
  (e: "hospital-updated", hospital: ILocation): void;
}

/* ──────────────────────────── Props & Emits ──────────────────── */

const props = withDefaults(defineProps<Props>(), {
  editMode: "create",
  hospital: null,
});

const emit = defineEmits<Emits>();

/* ──────────────────────────── Dependencies ───────────────────── */

const { createLocation, updateLocation, getAllLocations } = useLocation();
const toast = useToast();
const logger = useLogger("AddHospitalModal");

/* ──────────────────────────── Constants ──────────────────────── */

const FIELD_IDS = {
  name: "hospital-name",
  address: "hospital-address",
  street_number: "hospital-street-number",
  postal_code: "hospital-postal-code",
  city_name: "hospital-city",
  floor: "hospital-floor",
  door_number: "hospital-door-number",
} as const;

const VALIDATION_RULES: Record<
  ValidatableField,
  { required: boolean; label: string }
> = {
  name: { required: true, label: "nombre del hospital" },
  address: { required: true, label: "dirección" },
  city_name: { required: true, label: "ciudad" },
  country_iso_code: { required: true, label: "país" },
};

const countryDropdownItems: DropdownItem[] = [
  { value: "CR", label: "Costa Rica" },
  { value: "PA", label: "Panamá" },
  { value: "CO", label: "Colombia" },
  { value: "MX", label: "México" },
  { value: "ES", label: "España" },
  { value: "US", label: "Estados Unidos" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "PE", label: "Perú" },
  { value: "EC", label: "Ecuador" },
];

/* ──────────────────────────── Reactive State ─────────────────── */

const formData = ref<HospitalFormData>(createEmptyForm());
const errors = ref<FormErrors>({});
const formError = ref<string | null>(null);
const isSubmitting = ref(false);

const selectedHospitalId = ref<string | number | undefined>(undefined);
const hospitalDropdownItems = ref<DropdownItem[]>([]);
const isSearching = ref(false);

/* ──────────────────────────── Computed ────────────────────────── */

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit("update:isOpen", value),
});

const isEditMode = computed(() => props.editMode === "edit");

const modalAriaLabel = computed(() =>
  isEditMode.value
    ? "Formulario para editar hospital"
    : "Formulario para añadir hospital",
);

const isFormValid = computed<boolean>(() => {
  const { name, address, city_name, country_iso_code } = formData.value;

  const hasRequiredFields =
    name.length > 0 &&
    address.length > 0 &&
    city_name.length > 0 &&
    country_iso_code.length > 0;

  const hasNoErrors = Object.keys(errors.value).length === 0;

  return hasRequiredFields && hasNoErrors;
});

/* ──────────────────────────── Helpers ─────────────────────────── */

function createEmptyForm(): HospitalFormData {
  return {
    name: "",
    address: "",
    street_number: "",
    postal_code: "",
    city_name: "",
    country_iso_code: "",
    floor: "",
    door_number: "",
  };
}

function mapHospitalToForm(hospital: ILocation): HospitalFormData {
  return {
    name: hospital.name ?? "",
    address: hospital.address ?? "",
    street_number: "",
    postal_code: hospital.postal_code ?? "",
    city_name: hospital.city_name ?? "",
    country_iso_code: hospital.country_iso_code ?? "",
    floor: "",
    door_number: "",
  };
}

function buildCreationPayload(
  form: HospitalFormData,
): ILocationCreationRequest {
  const { getUserInfo } = useUserInfo();
  const currentUser = getUserInfo();

  return {
    name: form.name,
    address: form.address,
    city_name: form.city_name,
    country_iso_code: form.country_iso_code,
    province: form.city_name,
    postal_code: form.postal_code || "00000",
    latitude: "0",
    longitude: "0",
    finance_entity: currentUser.id,
  };
}

function buildUpdatePayload(form: HospitalFormData): ILocationUpdateRequest {
  return {
    name: form.name,
    address: form.address,
    city_name: form.city_name,
    country_iso_code: form.country_iso_code,
    province: form.city_name,
    postal_code: form.postal_code || undefined,
  };
}

/* ──────────────────────────── Validation ──────────────────────── */

function validateField(field: ValidatableField): boolean {
  const rule = VALIDATION_RULES[field];
  const value = formData.value[field];

  if (rule.required && !value.trim()) {
    errors.value = {
      ...errors.value,
      [field]: `El campo ${rule.label} es obligatorio`,
    };
    return false;
  }

  const { [field]: _removed, ...rest } = errors.value;
  errors.value = rest as FormErrors;
  return true;
}

function validateAllFields(): boolean {
  const fields = Object.keys(VALIDATION_RULES) as ValidatableField[];
  let allValid = true;

  for (const field of fields) {
    if (!validateField(field)) {
      allValid = false;
    }
  }

  return allValid;
}

/* ──────────────────────────── Search Hospitals ────────────────── */

async function loadHospitalsForSearch(): Promise<void> {
  isSearching.value = true;

  try {
    const { data, error } = await getAllLocations();

    if (error) {
      logger.warn("Could not load hospitals for search", { info: error.info });
      return;
    }

    hospitalDropdownItems.value = (data ?? []).map((location) => ({
      value: location.id,
      label: location.name,
    }));
  } catch (err) {
    logger.error("Unexpected error loading hospital search", {
      error: err instanceof Error ? err.message : "Unknown",
    });
  } finally {
    isSearching.value = false;
  }
}

function handleHospitalSelect(item: DropdownItem): void {
  formData.value.name = item.label;
  errors.value = {};
  formError.value = null;
}

function handleClearSearch(): void {
  selectedHospitalId.value = undefined;
  formData.value = createEmptyForm();
  errors.value = {};
  formError.value = null;
}

/* ──────────────────────────── Submit ──────────────────────────── */

async function handleSubmit(): Promise<void> {
  formError.value = null;

  if (!validateAllFields()) {
    formError.value = "Por favor, corrige los campos marcados en rojo.";
    return;
  }

  isSubmitting.value = true;

  try {
    if (isEditMode.value) {
      await submitUpdate();
    } else {
      await submitCreate();
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error inesperado al procesar la solicitud";
    logger.error("Hospital form submission failed", { error: message });
    formError.value = message;
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
}

async function submitCreate(): Promise<void> {
  const payload = buildCreationPayload(formData.value);
  const { data, error } = await createLocation(payload);

  if (error) {
    logger.error("Failed to create hospital", { info: error.info });
    formError.value = error.info;
    toast.error(error.info);
    return;
  }

  if (data) {
    toast.success("Hospital agregado correctamente");
    emit("hospital-created", data);
    handleCloseModal();
  }
}

async function submitUpdate(): Promise<void> {
  if (!props.hospital?.id) {
    formError.value = "No se encontró el hospital a editar";
    return;
  }

  const payload = buildUpdatePayload(formData.value);
  const { data, error } = await updateLocation(props.hospital.id, payload);

  if (error) {
    logger.error("Failed to update hospital", { info: error.info });
    formError.value = error.info;
    toast.error(error.info);
    return;
  }

  if (data) {
    toast.success("Hospital actualizado correctamente");
    emit("hospital-updated", data);
    handleCloseModal();
  }
}

/* ──────────────────────────── Modal Lifecycle ─────────────────── */

function resetForm(): void {
  formData.value = createEmptyForm();
  errors.value = {};
  formError.value = null;
  selectedHospitalId.value = undefined;
  isSubmitting.value = false;
}

function handleCloseModal(): void {
  if (isSubmitting.value) return;
  resetForm();
  isModalOpen.value = false;
}

/* ──────────────────────────── Watchers ────────────────────────── */

watch(
  () => props.isOpen,
  (opened) => {
    if (!opened) return;

    if (isEditMode.value && props.hospital) {
      formData.value = mapHospitalToForm(props.hospital);
    } else {
      resetForm();
      loadHospitalsForSearch();
    }
  },
);
</script>

<style lang="scss" scoped>
.add-hospital {
  &__title {
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0;
    color: #19213d;
    margin: 0;
  }

  &__content {
    padding: 1.25rem 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  &__form-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: $border-radius-md;
    margin-bottom: 1rem;
  }

  &__form-error-icon {
    color: $color-error;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__form-error-message {
    margin: 0;
    font-size: 14px;
    color: $color-error;
    font-weight: 500;
    line-height: 1.4;
  }

  &__group {
    display: flex;
    gap: 1rem;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
    }
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 0.75rem;
    width: 100%;
    position: relative;
  }

  &__label {
    @include form-label;
  }

  &__required {
    color: #dc2626;
    margin-left: 2px;
  }

  &__input {
    @include input-base;
    width: 100%;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &--error {
      border-color: #dc2626;

      &:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
      }
    }
  }

  &__error-message {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: -4px;
    line-height: 1.4;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  &__button {
    &--cancel {
      @include secondary-button;
    }

    &--primary {
      @include primary-button;
      min-width: 140px;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: hospital-spin 0.6s linear infinite;
  }
}

@keyframes hospital-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
