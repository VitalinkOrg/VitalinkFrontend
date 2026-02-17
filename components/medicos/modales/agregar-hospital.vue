<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-large"
    class="add-hospital"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h2 class="add-hospital__title">
        {{
          isEditMode
            ? "Editar Hospital o Clínica"
            : "Añade un Hospital o Clínica"
        }}
      </h2>
    </template>

    <form class="add-hospital__content" @submit.prevent="handleSubmit">
      <div v-if="!isEditMode" class="add-hospital__form-group">
        <label class="add-hospital__label">Buscar por nombre</label>
        <UiDropdownBase
          v-model="selectedHospitalId"
          :items="hospitalDropdownItems"
          :loading="isSearching"
          :searchable="true"
          :clearable="true"
          placeholder="Buscar hospital..."
          no-results-text="No se encontraron hospitales"
          @select="handleHospitalSelect"
          @clear="handleClearSearch"
        />
      </div>

      <div class="add-hospital__form-group">
        <label class="add-hospital__label">
          O escribe el nombre del Hospital
          <span v-if="!isEditMode" class="required">*</span>
        </label>
        <input
          v-model="formData.name"
          type="text"
          class="add-hospital__input"
          :class="{ 'input-error': errors.name }"
          placeholder="Clínica Santa Lucía"
          required
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">
            Dirección física
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.address"
            type="text"
            class="add-hospital__input"
            :class="{ 'input-error': errors.address }"
            placeholder="San José, Costa Rica, Paseo colon, de la to..."
            required
          />
          <span v-if="errors.address" class="error-message">{{
            errors.address
          }}</span>
        </div>
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">Nº de calle</label>
          <input
            v-model="formData.street_number"
            type="text"
            class="add-hospital__input"
            placeholder="Escriba aquí la dirección física"
          />
        </div>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">Código Postal</label>
          <input
            v-model="formData.postal_code"
            type="text"
            class="add-hospital__input"
            placeholder="0000000"
          />
        </div>
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">
            Ciudad
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.city_name"
            type="text"
            class="add-hospital__input"
            :class="{ 'input-error': errors.city_name }"
            placeholder="Ciudad"
            required
          />
          <span v-if="errors.city_name" class="error-message">{{
            errors.city_name
          }}</span>
        </div>
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">
            País
            <span class="required">*</span>
          </label>
          <UiDropdownBase
            v-model="formData.country_iso_code"
            :items="countryDropdownItems"
            :searchable="true"
            :clearable="false"
            placeholder="Seleccionar país"
            no-results-text="No se encontraron países"
            :class="{ 'input-error': errors.country_iso_code }"
          />
          <span v-if="errors.country_iso_code" class="error-message">{{
            errors.country_iso_code
          }}</span>
        </div>
      </div>

      <div class="add-hospital__group">
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">Piso</label>
          <input
            v-model="formData.floor"
            type="text"
            class="add-hospital__input"
            placeholder="1"
          />
        </div>
        <div class="add-hospital__form-group">
          <label class="add-hospital__label">Nº de puerta</label>
          <input
            v-model="formData.door_number"
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
          :disabled="isLoading || !isFormValid"
          class="add-hospital__button--primary"
          @click="handleSubmit"
        >
          {{
            isLoading
              ? "Procesando..."
              : isEditMode
                ? "Guardar cambios"
                : "Agregar"
          }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { useSupplier } from "@/composables/api";
import type {
  CreateHospital,
  UpdateHospital,
} from "@/composables/api/useSupplier";
import type { Supplier } from "@/types";

const emit = defineEmits<{
  "hospital-created": [data: any];
  "hospital-updated": [data: any];
}>();

const { getUserInfo } = useUserInfo();

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const { createHospital, updateHospital, fetchAllSuppliers } = useSupplier();

interface SharedData {
  hospitalId?: string;
  hospitalData?: Partial<CreateHospital>;
  mode?: "create" | "edit";
}

const modalData = computed(() => getSharedData<SharedData>("agregarHospital"));
const isModalOpen = computed(() => isOpen.agregarHospital);
const isEditMode = computed(
  () => modalData.value?.mode === "edit" && !!modalData.value?.hospitalId,
);

const isLoading = ref<boolean>(false);
const isSearching = ref<boolean>(false);
const selectedHospitalId = ref<string | number | undefined>(undefined);
const allHospitals = ref<Supplier[]>([]);

const currentUserId = computed(() => getUserInfo().id);

const countries = [
  { code: "CRC", name: "Costa Rica" },
  { code: "USA", name: "Estados Unidos" },
  { code: "MEX", name: "México" },
  { code: "GTM", name: "Guatemala" },
  { code: "SLV", name: "El Salvador" },
  { code: "HND", name: "Honduras" },
  { code: "NIC", name: "Nicaragua" },
  { code: "PAN", name: "Panamá" },
  { code: "BLZ", name: "Belice" },
  { code: "ESP", name: "España" },
  { code: "COL", name: "Colombia" },
  { code: "VEN", name: "Venezuela" },
  { code: "PER", name: "Perú" },
  { code: "CHL", name: "Chile" },
  { code: "ARG", name: "Argentina" },
  { code: "BRA", name: "Brasil" },
  { code: "ECU", name: "Ecuador" },
  { code: "BOL", name: "Bolivia" },
  { code: "PRY", name: "Paraguay" },
  { code: "URY", name: "Uruguay" },
  { code: "DOM", name: "República Dominicana" },
  { code: "CUB", name: "Cuba" },
  { code: "PRI", name: "Puerto Rico" },
];

const countryDropdownItems = computed<DropdownItem[]>(() => {
  return countries.map((country) => ({
    value: country.code,
    label: country.name,
    disabled: false,
  }));
});

const formData = ref<CreateHospital>({
  name: "",
  email: "",
  phone_number: "",
  country_iso_code: "CRC",
  province: "",
  city_name: "",
  address: "",
  street_number: "",
  postal_code: "",
  floor: "",
  door_number: "",
  id_type: "JURIDICAL_DNI",
  card_id: "",
  legal_representative: "",
  is_hospital: true,
  medical_type_code: "SPECIALTY_MEDICAL",
  num_medical_enrollment: "N/A",
  profile_picture_url: "",
  code_card_id_file: "",
  code_medical_license_file: "",
  description: "",
});

const errors = ref<Record<string, string>>({});

const hospitalDropdownItems = computed<DropdownItem[]>(() => {
  return allHospitals.value.map((hospital) => ({
    value: hospital.id || hospital.name,
    label: `${hospital.name} - ${hospital.city_name}`,
    disabled: false,
  }));
});

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.address &&
    formData.value.city_name &&
    formData.value.country_iso_code &&
    Object.keys(errors.value).length === 0
  );
});

const validateForm = (): boolean => {
  errors.value = {};

  if (!formData.value.name?.trim()) {
    errors.value.name = "El nombre es requerido";
  }

  if (!formData.value.address?.trim()) {
    errors.value.address = "La dirección es requerida";
  }

  if (!formData.value.city_name?.trim()) {
    errors.value.city_name = "La ciudad es requerida";
  }

  if (!formData.value.country_iso_code?.trim()) {
    errors.value.country_iso_code = "El país es requerido";
  }

  return Object.keys(errors.value).length === 0;
};

const loadHospitals = async () => {
  isSearching.value = true;

  try {
    const { response, error, request } = fetchAllSuppliers();
    await request();

    if (error.value) {
      throw new Error("Error al cargar hospitales");
    }

    if (response.value?.data && Array.isArray(response.value.data)) {
      allHospitals.value = response.value.data.filter(
        (supplier: Supplier) => supplier.is_hospital,
      );
    } else {
      allHospitals.value = [];
    }
  } catch (error) {
    console.error("Error al cargar hospitales:", error);
    allHospitals.value = [];
  } finally {
    isSearching.value = false;
  }
};

const handleHospitalSelect = (item: DropdownItem) => {
  const hospital = allHospitals.value.find(
    (h) => (h.id || h.name) === item.value,
  );

  if (hospital) {
    selectHospital(hospital);
  }
};

const handleClearSearch = () => {
  selectedHospitalId.value = undefined;
};

const selectHospital = (hospital: Supplier) => {
  formData.value.name = hospital.name;
  formData.value.address = hospital.address || "";
  formData.value.street_number = hospital.street_number || "";
  formData.value.postal_code = hospital.postal_code || "";
  formData.value.city_name = hospital.city_name;
  formData.value.country_iso_code = hospital.country_iso_code;
  formData.value.floor = hospital.floor || "";
  formData.value.door_number = hospital.door_number || "";

  formData.value.email = hospital.email;
  formData.value.phone_number = hospital.phone_number;
  formData.value.province = hospital.province;
  formData.value.card_id = hospital.card_id;

  formData.value.legal_representative = currentUserId.value;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  if (!currentUserId.value) {
    alert("Error: No se pudo obtener la información del usuario actual");
    return;
  }

  isLoading.value = true;

  try {
    const submitData: CreateHospital = {
      name: formData.value.name,
      email: formData.value.email || "noemail@hospital.com",
      phone_number: formData.value.phone_number || "0000-0000",
      country_iso_code: formData.value.country_iso_code,
      province: formData.value.province || formData.value.city_name,
      city_name: formData.value.city_name,
      address: formData.value.address,
      street_number: formData.value.street_number || "",
      postal_code: formData.value.postal_code || "",
      floor: formData.value.floor || "",
      door_number: formData.value.door_number || "",
      id_type: "JURIDICAL_DNI",
      card_id: formData.value.card_id || "0-000-000000",
      legal_representative: currentUserId.value,
      is_hospital: true,
      medical_type_code: "SPECIALTY_MEDICAL",
      num_medical_enrollment: "N/A",
      profile_picture_url: "",
      code_card_id_file: "",
      code_medical_license_file: "",
      description: formData.value.description || "",
    };

    if (isEditMode.value && modalData.value?.hospitalId) {
      const updateData: UpdateHospital = {
        name: submitData.name,
        email: submitData.email,
        phone_number: submitData.phone_number,
        country_iso_code: submitData.country_iso_code,
        province: submitData.province,
        city_name: submitData.city_name,
        address: submitData.address,
        street_number: submitData.street_number || undefined,
        postal_code: submitData.postal_code || undefined,
        floor: submitData.floor || undefined,
        door_number: submitData.door_number || undefined,
        id_type: submitData.id_type,
        card_id: submitData.card_id,
      };

      const { response, error, request } = updateHospital(
        modalData.value.hospitalId,
        updateData,
      );

      await request();

      if (error.value) {
        console.error("Error al actualizar:", error.value);
        throw new Error("Error al actualizar el hospital");
      }

      emit("hospital-updated", response.value);

      window.dispatchEvent(new CustomEvent("hospital-updated"));
    } else {
      const { response, error, request } = createHospital(submitData);

      await request();

      if (error.value) {
        console.error("Error al crear:", error.value);
        throw new Error("Error al crear el hospital");
      }

      emit("hospital-created", response.value);

      window.dispatchEvent(new CustomEvent("hospital-created"));
    }

    handleCloseModal();
  } catch (error: any) {
    console.error("Error en handleSubmit:", error);
    alert(error.message || "Ocurrió un error al procesar la solicitud");
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    name: "",
    email: "",
    phone_number: "",
    country_iso_code: "CRC", // Valor por defecto
    province: "",
    city_name: "",
    address: "",
    street_number: "",
    postal_code: "",
    floor: "",
    door_number: "",
    id_type: "JURIDICAL_DNI",
    card_id: "",
    legal_representative: currentUserId.value,
    is_hospital: true,
    medical_type_code: "SPECIALTY_MEDICAL",
    num_medical_enrollment: "N/A",
    profile_picture_url: "",
    code_card_id_file: "",
    code_medical_license_file: "",
    description: "",
  };
  errors.value = {};
  selectedHospitalId.value = undefined;
};

const handleCloseModal = () => {
  resetForm();
  closeModal("agregarHospital");
};

watch(isModalOpen, (newValue) => {
  if (newValue) {
    if (isEditMode.value && modalData.value?.hospitalData) {
      Object.assign(formData.value, modalData.value.hospitalData);
    } else {
      resetForm();
      loadHospitals();
    }
  }
});
</script>

<style lang="scss" scoped>
.add-hospital {
  &__title {
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0;
    color: #19213d;
  }

  &__content {
    padding: 1.25rem 1.5rem 1.25rem 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  &__group {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
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

    .required {
      color: #dc2626;
      margin-left: 2px;
    }
  }

  &__input {
    @include input-base;
    width: 100%;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }

    &.input-error {
      border-color: #dc2626;
    }
  }

  .error-message {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: -4px;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
