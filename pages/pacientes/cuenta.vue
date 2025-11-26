<script lang="ts" setup>
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { onClickOutside } from "@vueuse/core";
import type { UserInformation } from "~/types";

interface ValidationError {
  field: string;
  message: string;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

definePageMeta({
  middleware: ["auth-pacientes"],
});

const config = useRuntimeConfig();
const token = useCookie<string>("token");
const { getUserInfo } = useUserInfo();
const { formatPhone } = useFormat();

const user_info = ref<UserInformation>({
  id: "",
  card_id: "",
  id_type: "CC" as any,
  name: "",
  user_name: "",
  email: "",
  phone_number: "",
  country_iso_code: "",
  city_name: "",
  postal_code: "",
  latitude: null,
  longitude: null,
  gender: null,
  birth_date: null,
  role: "",
  finance_entity: {} as any,
  code_contract: null,
  language: "es",
  profile_picture_url: null,
  account_status: "active",
});

const firstName = ref<string>("");
const lastName = ref<string>("");
const phoneNumber = ref<string>("");
const phoneCountryCode = ref<string>("CRC");
const address = ref<string>("");
const profilePicture = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isLoading = ref<boolean>(false);
const validationErrors = ref<ValidationError[]>([]);

const countryDropdownRef = ref<HTMLElement>();
const countrySearchRef = ref<HTMLInputElement>();
const isCountryDropdownOpen = ref(false);
const countrySearchText = ref("");

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

const countryPhoneCodes: Record<string, string> = {
  CRC: "506",
  USA: "1",
  MEX: "52",
  GTM: "502",
  SLV: "503",
  HND: "504",
  NIC: "505",
  PAN: "507",
  BLZ: "501",
  ESP: "34",
  COL: "57",
  VEN: "58",
  PER: "51",
  CHL: "56",
  ARG: "54",
  BRA: "55",
  ECU: "593",
  BOL: "591",
  PRY: "595",
  URY: "598",
  DOM: "1",
  CUB: "53",
  PRI: "1",
};

const phoneCountryDropdownItems = computed<DropdownItem[]>(() => {
  return countries.map((country) => ({
    value: country.code,
    label: country.code,
    disabled: false,
  }));
});

const currentPhoneCode = computed(() => {
  return countryPhoneCodes[phoneCountryCode.value] || "506";
});

const formattedPhone = computed(() => {
  if (!phoneNumber.value) return "";
  return formatPhone(phoneNumber.value, {
    countryCode: currentPhoneCode.value,
    addPrefix: true,
  });
});

const selectedCountry = computed(() => {
  return countries.find(
    (country) => country.code === user_info.value.country_iso_code
  );
});

const displayCountryText = computed(() => {
  if (isCountryDropdownOpen.value) {
    return countrySearchText.value;
  }
  return selectedCountry.value?.name || "Seleccionar país";
});

const filteredCountries = computed(() => {
  if (!countrySearchText.value.trim()) {
    return countries;
  }
  return countries.filter((country) =>
    country.name.toLowerCase().includes(countrySearchText.value.toLowerCase())
  );
});

onMounted(async () => {
  await loadUserInfo();
});

onBeforeUnmount(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});

onClickOutside(countryDropdownRef, () => {
  closeCountryDropdown();
});

const loadUserInfo = async (): Promise<void> => {
  try {
    const userInfo = await getUserInfo();
    if (userInfo) {
      user_info.value = { ...userInfo };

      const nameParts = userInfo.name?.split(" ") || [];
      if (nameParts.length > 0) {
        firstName.value = nameParts[0];
        lastName.value = nameParts.slice(1).join(" ");
      }

      phoneNumber.value = userInfo.phone_number || "";
      phoneCountryCode.value = userInfo.country_iso_code || "CRC";
      countrySearchText.value = selectedCountry.value?.name || "";
    }
  } catch (error) {
    console.error("Error loading user info:", error);
    handleError(error as Error);
  }
};

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  clearFileErrors();

  const fileValidation = validateFile(file);
  if (!fileValidation.isValid) {
    console.error("File validation failed:", fileValidation.error);
    validationErrors.value.push({
      field: "profile_picture_url",
      message: fileValidation.error || "Invalid file",
    });

    target.value = "";
    return;
  }

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  profilePicture.value = file;
  imagePreview.value = URL.createObjectURL(file);

  console.log("File selected successfully:", {
    name: file.name,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    type: file.type,
  });
};

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;
  const value = target.value;

  const digits = value.replace(/\D/g, "");

  const prefix = formatPhone("", {
    countryCode: currentPhoneCode.value,
    addPrefix: true,
  });

  const prefixLength = prefix.length;

  if (cursorPosition <= prefixLength) {
    const formattedValue = formatPhone(phoneNumber.value, {
      countryCode: currentPhoneCode.value,
      addPrefix: true,
    });
    target.value = formattedValue;
    target.setSelectionRange(prefixLength, prefixLength);
    return;
  }

  phoneNumber.value = digits;

  const formattedValue = formatPhone(digits, {
    countryCode: currentPhoneCode.value,
    addPrefix: true,
  });

  target.value = formattedValue;

  const digitsBeforeCursor = value
    .substring(0, cursorPosition)
    .replace(/\D/g, "").length;

  let newCursorPosition = 0;
  let digitCount = 0;

  for (let i = 0; i < formattedValue.length; i++) {
    if (/\d/.test(formattedValue[i])) {
      digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1;
        break;
      }
    }
  }

  newCursorPosition = Math.max(prefixLength, newCursorPosition);

  target.setSelectionRange(newCursorPosition, newCursorPosition);
};

const toggleCountryDropdown = () => {
  isCountryDropdownOpen.value = !isCountryDropdownOpen.value;

  if (isCountryDropdownOpen.value) {
    nextTick(() => {
      countrySearchRef.value?.focus();
    });
  }
};

const selectCountry = (countryCode: string) => {
  user_info.value.country_iso_code = countryCode;
  closeCountryDropdown();
};

const closeCountryDropdown = () => {
  isCountryDropdownOpen.value = false;
  countrySearchText.value = selectedCountry.value?.name || "";
};

const handleCountrySearchInput = () => {
  if (!isCountryDropdownOpen.value) {
    isCountryDropdownOpen.value = true;
  }
};

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido. Formatos aceptados: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { isValid: true };
};

const clearFileErrors = (): void => {
  validationErrors.value = validationErrors.value.filter(
    (error) => error.field !== "profile_picture_url"
  );
};

const validateForm = (): boolean => {
  validationErrors.value = [];

  if (!firstName.value?.trim()) {
    validationErrors.value.push({
      field: "first_name",
      message: "El nombre es requerido",
    });
  }

  if (!lastName.value?.trim()) {
    validationErrors.value.push({
      field: "last_name",
      message: "El apellido es requerido",
    });
  }

  if (!user_info.value.city_name?.trim()) {
    validationErrors.value.push({
      field: "city_name",
      message: "La ciudad es requerida",
    });
  }

  if (!user_info.value.country_iso_code?.trim()) {
    validationErrors.value.push({
      field: "country_iso_code",
      message: "El país es requerido",
    });
  }

  if (user_info.value.postal_code && user_info.value.postal_code.length < 4) {
    validationErrors.value.push({
      field: "postal_code",
      message: "Código postal inválido",
    });
  }

  if (validationErrors.value.length > 0) {
    console.error("Validation errors:", validationErrors.value);
    return false;
  }

  return true;
};

const updateUser = async (): Promise<void> => {
  if (isLoading.value) {
    console.warn("Update already in progress");
    return;
  }

  if (!validateForm()) {
    console.error("Form validation failed");
    return;
  }

  isLoading.value = true;

  try {
    let body: FormData | Record<string, any>;
    let headers: Record<string, string> = {
      Authorization: token.value || "",
    };

    // Si hay imagen, usar FormData; si no, usar JSON
    if (profilePicture.value) {
      body = buildFormData();
    } else {
      body = buildJsonBody();
      headers["Content-Type"] = "application/json";
    }

    console.log("Updating user profile...", {
      userId: user_info.value.id,
      hasProfilePicture: !!profilePicture.value,
      body: profilePicture.value ? "FormData" : body,
    });

    const { data, error } = await useFetch<UserInformation>(
      `${config.public.API_BASE_URL}/user/edit?id=${user_info.value.id}`,
      {
        method: "PUT",
        headers,
        body,
      }
    );

    if (error.value) {
      handleApiError(error.value);
      return;
    }

    if (data.value) {
      handleUpdateSuccess(data.value);
    }
  } catch (error) {
    console.error("Unexpected error during update:", error);
    handleError(error as Error);
  } finally {
    isLoading.value = false;
  }
};

const buildFormData = (): FormData => {
  const formData = new FormData();

  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim();
  if (fullName) {
    formData.append("first_name", fullName);
  }

  if (phoneNumber.value) {
    formData.append("phone_number", phoneNumber.value);
  }

  if (user_info.value.country_iso_code) {
    formData.append("country_iso_code", user_info.value.country_iso_code);
  }

  if (user_info.value.city_name) {
    formData.append("city_name", user_info.value.city_name);
  }

  if (user_info.value.postal_code) {
    formData.append("postal_code", user_info.value.postal_code);
  }

  if (profilePicture.value) {
    formData.append("profile_picture", profilePicture.value);
  }

  return formData;
};

const buildJsonBody = (): Record<string, any> => {
  const body: Record<string, any> = {};

  const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim();
  if (fullName) {
    body.first_name = fullName;
  }

  if (phoneNumber.value) {
    body.phone_number = phoneNumber.value;
  }

  if (user_info.value.country_iso_code) {
    body.country_iso_code = user_info.value.country_iso_code;
  }

  if (user_info.value.city_name) {
    body.city_name = user_info.value.city_name;
  }

  if (user_info.value.postal_code) {
    body.postal_code = user_info.value.postal_code;
  }

  return body;
};

const handleApiError = (error: any): void => {
  console.error("API Error:", {
    message: error.message || "Unknown error",
    statusCode: error.statusCode,
    data: error.data,
  });

  if (error.data?.errors) {
    const apiErrors = error.data.errors as Record<string, string[]>;
    Object.entries(apiErrors).forEach(([field, messages]) => {
      messages.forEach((message) => {
        validationErrors.value.push({ field, message });
      });
    });
  }
};

const handleError = (error: Error): void => {
  console.error("Error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
};

const handleUpdateSuccess = (data: UserInformation): void => {
  console.log("✅ Profile updated successfully", data);

  user_info.value = { ...data };

  const nameParts = data.name?.split(" ") || [];
  if (nameParts.length > 0) {
    firstName.value = nameParts[0];
    lastName.value = nameParts.slice(1).join(" ");
  }

  phoneNumber.value = data.phone_number || "";
  phoneCountryCode.value = data.country_iso_code || "CRC";
  countrySearchText.value = selectedCountry.value?.name || "";

  profilePicture.value = null;
  validationErrors.value = [];

  getUserInfo();
};

const hasValidationErrors = computed(() => validationErrors.value.length > 0);

const getFieldError = (fieldName: string): string | null => {
  const error = validationErrors.value.find((err) => err.field === fieldName);
  return error ? error.message : null;
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <div class="profile">
      <h4 class="profile__title">Foto de Perfil</h4>

      <div class="profile__picture-section">
        <div
          class="profile__picture-container"
          :class="{
            'profile__picture-container--error': getFieldError(
              'profile_picture_url'
            ),
          }"
        >
          <img
            :src="
              imagePreview ||
              user_info.profile_picture_url ||
              '/_nuxt/src/assets/picture.svg'
            "
            alt="Profile Picture"
            class="profile__picture-image"
          />
        </div>

        <label
          for="upload-picture"
          class="profile__upload-button"
          :class="{ 'profile__upload-button--disabled': isLoading }"
        >
          <img src="@/src/assets/camera.svg" alt="Upload Picture" />
        </label>

        <input
          type="file"
          id="upload-picture"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          class="profile__upload-input"
          :disabled="isLoading"
          @change="handleFileChange"
        />
      </div>

      <div
        v-if="getFieldError('profile_picture_url')"
        class="profile__error-message"
      >
        {{ getFieldError("profile_picture_url") }}
      </div>

      <h4 class="profile__title profile__title--spacing">Datos Personales</h4>

      <form class="profile__form" @submit.prevent="updateUser">
        <div class="profile__row profile__row--two-cols">
          <div class="profile__field">
            <label for="nombre" class="profile__label">
              Nombre (s) <span class="profile__label-required">*</span>
            </label>
            <input
              type="text"
              class="profile__input"
              :class="{ 'profile__input--error': getFieldError('first_name') }"
              placeholder="Escribe tu nombre"
              v-model="firstName"
              name="nombre"
              id="nombre"
              :disabled="isLoading"
              required
            />
            <span
              v-if="getFieldError('first_name')"
              class="profile__field-error"
            >
              {{ getFieldError("first_name") }}
            </span>
          </div>

          <div class="profile__field">
            <label for="apellido" class="profile__label">
              Apellido (s) <span class="profile__label-required">*</span>
            </label>
            <input
              type="text"
              class="profile__input"
              :class="{ 'profile__input--error': getFieldError('last_name') }"
              placeholder="Escribe tu apellido"
              v-model="lastName"
              id="apellido"
              name="apellido"
              :disabled="isLoading"
              required
            />
            <span
              v-if="getFieldError('last_name')"
              class="profile__field-error"
            >
              {{ getFieldError("last_name") }}
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="telefono">
              Número de teléfono
            </label>
            <div class="profile__phone-group">
              <UiDropdownBase
                v-model="phoneCountryCode"
                :items="phoneCountryDropdownItems"
                :searchable="true"
                :clearable="false"
                placeholder="País"
                no-results-text="No se encontraron países"
                class="profile__phone-dropdown"
              />
              <input
                type="tel"
                :value="formattedPhone"
                @input="handlePhoneInput"
                placeholder="+1(555) 000-0000"
                id="telefono"
                name="telefono"
                class="profile__input profile__phone-input"
                :class="{
                  'profile__input--error': getFieldError('phone_number'),
                }"
                :disabled="isLoading"
              />
            </div>
            <span
              v-if="getFieldError('phone_number')"
              class="profile__field-error"
            >
              {{ getFieldError("phone_number") }}
            </span>
          </div>

          <div class="profile__field">
            <label for="direccion" class="profile__label"> Dirección </label>
            <input
              type="text"
              placeholder="Dirección"
              id="direccion"
              v-model="address"
              name="direccion"
              class="profile__input"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="profile__row profile__row--three-cols">
          <div class="profile__field">
            <label class="profile__label" for="postal"> Código Postal </label>
            <input
              type="text"
              placeholder="00000000"
              id="postal"
              name="postal"
              v-model="user_info.postal_code"
              class="profile__input"
              :class="{ 'profile__input--error': getFieldError('postal_code') }"
              :disabled="isLoading"
              maxlength="10"
            />
            <span
              v-if="getFieldError('postal_code')"
              class="profile__field-error"
            >
              {{ getFieldError("postal_code") }}
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="ciudad">
              Ciudad <span class="profile__label-required">*</span>
            </label>
            <input
              type="text"
              placeholder="Ciudad"
              id="ciudad"
              name="ciudad"
              v-model="user_info.city_name"
              class="profile__input"
              :class="{ 'profile__input--error': getFieldError('city_name') }"
              :disabled="isLoading"
              required
            />
            <span
              v-if="getFieldError('city_name')"
              class="profile__field-error"
            >
              {{ getFieldError("city_name") }}
            </span>
          </div>

          <div class="profile__field">
            <label class="profile__label" for="pais">
              País <span class="profile__label-required">*</span>
            </label>

            <div ref="countryDropdownRef" class="profile__country-dropdown">
              <div
                class="profile__country-toggle"
                :class="{
                  'profile__country-toggle--active': isCountryDropdownOpen,
                  'profile__country-toggle--error':
                    getFieldError('country_iso_code'),
                }"
                @click="toggleCountryDropdown"
              >
                <input
                  ref="countrySearchRef"
                  v-model="countrySearchText"
                  type="text"
                  class="profile__country-input"
                  :placeholder="
                    !user_info.country_iso_code ? 'Seleccionar país' : ''
                  "
                  @input="handleCountrySearchInput"
                  @click.stop="isCountryDropdownOpen = true"
                  :disabled="isLoading"
                />

                <svg
                  class="profile__country-arrow"
                  :class="{
                    'profile__country-arrow--rotated': isCountryDropdownOpen,
                  }"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    stroke-width="1.67"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <div
                class="profile__country-menu"
                :class="{
                  'profile__country-menu--open': isCountryDropdownOpen,
                }"
              >
                <div
                  v-if="filteredCountries.length === 0"
                  class="profile__country-no-results"
                >
                  No se encontraron países
                </div>

                <button
                  v-for="country in filteredCountries"
                  :key="country.code"
                  type="button"
                  class="profile__country-item"
                  :class="{
                    'profile__country-item--active':
                      user_info.country_iso_code === country.code,
                  }"
                  @click="selectCountry(country.code)"
                >
                  <span class="profile__country-item-text">{{
                    country.name
                  }}</span>

                  <svg
                    v-if="user_info.country_iso_code === country.code"
                    class="profile__country-item-check"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <span
              v-if="getFieldError('country_iso_code')"
              class="profile__field-error"
            >
              {{ getFieldError("country_iso_code") }}
            </span>
          </div>
        </div>

        <div v-if="hasValidationErrors" class="profile__general-errors">
          <p class="profile__general-errors-title">
            Por favor corrija los siguientes errores:
          </p>
          <ul class="profile__general-errors-list">
            <li
              v-for="error in validationErrors"
              :key="error.field"
              class="profile__general-errors-item"
            >
              {{ error.message }}
            </li>
          </ul>
        </div>

        <div class="profile__actions">
          <button
            type="submit"
            class="profile__submit"
            :class="{ 'profile__submit--loading': isLoading }"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Actualizar Perfil</span>
            <span v-else class="profile__submit-loading">
              <span class="profile__spinner"></span>
              Actualizando...
            </span>
          </button>
        </div>
      </form>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.profile {
  &__title {
    font-weight: 400;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 100%;
    letter-spacing: 0;
    color: #353e5c;

    &--spacing {
      margin-top: 3rem;
    }
  }

  &__picture-section {
    display: flex;
    align-items: flex-end;
    margin-bottom: 0.5rem;
  }

  &__picture-container {
    border-radius: 18px;
    border: 3px solid var(--Primary-Gradients-Violet-02, #c2c6e9);
    background: #f8faff;
    width: 130px;
    height: 132px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    transition: border-color 0.3s ease;

    &--error {
      border-color: #dc3545;
    }
  }

  &__picture-image {
    width: 130px;
    height: 132px;
    object-fit: cover;
  }

  &__upload-button {
    background: var(--bs-primary, #0d6efd);
    border-radius: 39px;
    width: 40px;
    height: 40px;
    margin-left: -25px;
    margin-bottom: 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;

    &:hover:not(&--disabled) {
      transform: scale(1.05);
      opacity: 0.9;
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__upload-input {
    display: none;
  }

  &__error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #f8d7da;
    border: 1px solid #f5c2c7;
    border-radius: 0.375rem;
  }

  &__form {
    margin-top: 1.5rem;
  }

  &__row {
    display: grid;
    gap: 1rem;

    &--two-cols {
      grid-template-columns: repeat(2, 1fr);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    &--three-cols {
      grid-template-columns: repeat(3, 1fr);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      @media (min-width: 769px) and (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__field {
    margin-bottom: 1rem;
  }

  &__label {
    @include form-label;

    &-required {
      color: #dc3545;
      margin-left: 2px;
    }
  }

  &__phone-group {
    display: flex;
    align-items: stretch;
    position: relative;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    :deep(.dropdown__toggle) {
      border-right: none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      height: 100%;
      transition: all 0.2s ease;
    }

    .profile__phone-input {
      border-left: none !important;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
      transition: all 0.2s ease;
    }

    &:hover {
      :deep(.dropdown__toggle) {
        border-color: #98a2b3;
        border-right: none;
      }

      .profile__phone-input {
        border-color: #98a2b3;
        border-left: none !important;
      }
    }

    &:has(:deep(.dropdown__toggle:focus-within)) {
      box-shadow:
        0 0 0 4px rgba(13, 110, 253, 0.25),
        0 0 1.05px rgba(13, 110, 253, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);

      :deep(.dropdown__toggle) {
        border-color: #80bdff;
        border-right: none;
        box-shadow: none;
      }

      .profile__phone-input {
        border-color: #80bdff;
        border-left: none !important;
        box-shadow: none;
        outline: none;
      }
    }

    &:has(.profile__phone-input:focus) {
      box-shadow:
        0 0 0 4px rgba(13, 110, 253, 0.25),
        0 0 1.05px rgba(13, 110, 253, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);

      :deep(.dropdown__toggle) {
        border-color: #80bdff;
        border-right: none;
        box-shadow: none;
      }

      .profile__phone-input {
        border-color: #80bdff;
        border-left: none !important;
        box-shadow: none;
        outline: none;
      }
    }
  }

  &__phone-dropdown {
    flex-shrink: 0;
    width: 110px;
  }

  &__phone-input {
    flex: 1;
    min-width: 0;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--error {
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
      }
    }
  }

  &__field-error {
    display: block;
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  &__country-dropdown {
    position: relative;
    width: 100%;
  }

  &__country-toggle {
    width: 100%;
    min-height: 3rem;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #98a2b3;
    }

    &--active {
      border-color: #80bdff;
      box-shadow:
        0 0 0 4px rgba(13, 110, 253, 0.25),
        0 0 1.05px rgba(13, 110, 253, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);
    }

    &--error {
      border-color: #dc3545;
    }
  }

  &__country-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #374151;
    font-size: 1rem;
    line-height: 1.5rem;
    font-family: inherit;
    padding: 0;
    margin: 0;

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__country-arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__country-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    max-height: 16rem;
    overflow-y: auto;
    margin-top: 0.25rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.625rem);
    transition: all 0.2s ease;

    &--open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &::-webkit-scrollbar {
      width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 0.5rem;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 0.25rem;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__country-no-results {
    padding: 1rem;
    font-size: 0.875rem;
    color: #9ca3af;
    font-style: italic;
    text-align: center;
  }

  &__country-item {
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #374151;
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-family: inherit;

    &:hover {
      background-color: #f9fafb;
    }

    &:focus {
      outline: none;
      background-color: #f3f4f6;
    }

    &--active {
      background-color: #f9fafb;
      font-weight: 500;
    }
  }

  &__country-item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  &__country-item-check {
    color: var(--bs-primary, #0d6efd);
    flex-shrink: 0;
  }

  &__general-errors {
    background-color: #f8d7da;
    border: 1px solid #f5c2c7;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-top: 1rem;

    &-title {
      color: #842029;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    &-list {
      margin: 0;
      padding-left: 1.5rem;
      color: #842029;
    }

    &-item {
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }
  }

  &__actions {
    margin-top: 3rem;
  }

  &__submit {
    @include primary-button;

    &--loading {
      padding-left: 2.5rem;
    }

    &-loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  &__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
