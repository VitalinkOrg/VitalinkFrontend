<script lang="ts" setup>
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/composables/api";
import { useDocuments } from "@/composables/api/useDocuments";
import { onClickOutside } from "@vueuse/core";

useSeoMeta({
  title: "Mi Perfil — Vitalink Seguros",
  description:
    "Edita tu información de perfil como socio financiero en Vitalink.",
  ogTitle: "Mi Perfil — Vitalink Seguros",
  ogDescription:
    "Edita tu información de perfil como socio financiero en Vitalink.",
});

definePageMeta({
  middleware: ["auth-insurances"],
});

const { getUserInfo, setUserInfo } = useUserInfo();
const { updateUser } = useAuth();
const { addDocument } = useDocuments();
const { getToken } = useAuthToken();
const { show: showToast } = useToast();
const logger = useLogger("SocioPerfilPersonal");

const { id: userId } = jwtDecode<DecodedToken>(getToken()!);

const name = ref("");
const phoneNumber = ref("");
const phoneCountryCode = ref("CRC");
const address = ref("");
const postalCode = ref("");
const cityName = ref("");
const countryIsoCode = ref("");

const selectedProfileImage = ref<File | null>(null);
const profileImagePreview = ref<string | null>(null);
const isSubmitting = ref(false);
const isUploadingImage = ref(false);

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

const selectedCountry = computed(() =>
  countries.find((c) => c.code === countryIsoCode.value),
);

const filteredCountries = computed(() => {
  if (!countrySearchText.value.trim()) return countries;
  return countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearchText.value.toLowerCase()),
  );
});

const isValidImageUrl = (url: string | null | undefined): boolean =>
  !!url && (url.startsWith("http://") || url.startsWith("https://"));

const storedProfileImageUrl = computed<string | null>(() => {
  const userInfo = getUserInfo() as IUser | null;
  return isValidImageUrl(userInfo?.profile_picture_url)
    ? (userInfo!.profile_picture_url ?? null)
    : null;
});

const displayedImageSrc = computed(
  () =>
    profileImagePreview.value ||
    storedProfileImageUrl.value ||
    "/_nuxt/src/assets/picture.svg",
);

const hasProfileImage = computed(
  () => !!profileImagePreview.value || !!storedProfileImageUrl.value,
);

const toggleCountryDropdown = () => {
  isCountryDropdownOpen.value = !isCountryDropdownOpen.value;
  if (isCountryDropdownOpen.value) {
    nextTick(() => countrySearchRef.value?.focus());
  }
};

const selectCountry = (code: string) => {
  countryIsoCode.value = code;
  closeCountryDropdown();
};

const closeCountryDropdown = () => {
  isCountryDropdownOpen.value = false;
  countrySearchText.value = selectedCountry.value?.name ?? "";
};

const handleCountrySearchInput = () => {
  if (!isCountryDropdownOpen.value) isCountryDropdownOpen.value = true;
};

const handleImageSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Formato no válido. Use JPG, PNG o WebP", "error");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("La imagen no debe superar los 5 MB", "error");
    input.value = "";
    return;
  }

  selectedProfileImage.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const uploadProfileImage = async (): Promise<string | null> => {
  if (!selectedProfileImage.value) return null;
  isUploadingImage.value = true;
  try {
    const { data, error } = await addDocument({
      file: selectedProfileImage.value,
      fields: {
        title: `profile_picture_${userId}`,
        type: "IMG",
        description: "Foto de perfil socio financiero",
        id_for_table: String(userId),
        table: "USER",
        action_type: "GENERAL_GALLERY",
        user_id: userId,
        is_public: 1,
      },
    });
    if (error) {
      showToast(error.info || "Error al subir la imagen", "error");
      return null;
    }
    return data?.url ?? null;
  } finally {
    isUploadingImage.value = false;
  }
};

const initializeForm = () => {
  const userInfo = getUserInfo() as IUser | null;
  if (!userInfo) return;

  name.value = userInfo.name ?? "";
  phoneNumber.value = userInfo.phone_number ?? "";
  phoneCountryCode.value = userInfo.country_iso_code ?? "CRC";
  address.value = userInfo.address ?? "";
  postalCode.value = userInfo.postal_code ?? "";
  cityName.value = userInfo.city_name ?? "";
  countryIsoCode.value = userInfo.country_iso_code ?? "";
  countrySearchText.value = selectedCountry.value?.name ?? "";
};

const handleSubmit = async () => {
  if (!userId) {
    showToast("No se encontró la información del usuario", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    let profilePictureUrl = storedProfileImageUrl.value ?? undefined;

    if (selectedProfileImage.value) {
      const uploaded = await uploadProfileImage();
      if (!uploaded) return;
      profilePictureUrl = uploaded;
    }

    const payload: IUserUpdateRequest = {
      first_name: name.value.trim(),
      phone_number: phoneNumber.value,
      address: address.value,
      postal_code: postalCode.value,
      city_name: cityName.value,
      country_iso_code: countryIsoCode.value,
      ...(profilePictureUrl !== undefined && {
        profile_picture_url: profilePictureUrl,
      }),
    };

    logger.debug("updateUser payload", { userId, payload });

    const { data, error } = await updateUser(userId, payload);

    if (error) {
      showToast(error.info || "Error al actualizar el perfil", "error");
      return;
    }

    if (data) {
      setUserInfo({ ...getUserInfo(), ...data });
      selectedProfileImage.value = null;
    }

    showToast("Perfil actualizado exitosamente", "success");
  } catch {
    showToast("Error inesperado al actualizar el perfil", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  initializeForm();
});

onClickOutside(countryDropdownRef, () => {
  closeCountryDropdown();
});
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <h4 class="profile-form__title">Datos Personales</h4>

    <form
      class="profile-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <!-- Profile picture -->
      <div class="profile-form__field profile-form__field--avatar">
        <span class="profile-form__label" id="photo-label">Foto de Perfil</span>
        <div
          class="profile-form__avatar-group"
          role="group"
          aria-labelledby="photo-label"
        >
          <figure class="profile-form__avatar">
            <img
              :src="displayedImageSrc"
              :class="[
                'profile-form__avatar-image',
                hasProfileImage
                  ? 'profile-form__avatar-image--filled'
                  : 'profile-form__avatar-image--placeholder',
              ]"
              alt="Foto de perfil actual"
            >
          </figure>
          <label
            for="upload-picture"
            class="profile-form__avatar-trigger"
            role="button"
            tabindex="0"
            aria-label="Cambiar foto de perfil"
          >
            <img
              src="@/src/assets/camera.svg"
              alt=""
              aria-hidden="true"
            >
          </label>
          <input
            id="upload-picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="profile-form__visually-hidden"
            @change="handleImageSelection"
          >
        </div>
      </div>

      <!-- Name -->
      <div class="profile-form__row profile-form__row--columns-1">
        <div class="profile-form__field">
          <label
            for="nombre"
            class="profile-form__label"
          >
            Nombre
          </label>
          <input
            id="nombre"
            v-model="name"
            type="text"
            class="profile-form__input"
            placeholder="Nombre de la entidad o persona"
            name="nombre"
          >
        </div>
      </div>

      <!-- Phone + Address -->
      <div class="profile-form__row profile-form__row--columns-2">
        <div class="profile-form__field">
          <label
            for="telefono"
            class="profile-form__label"
          >
            Número de teléfono
          </label>
          <div class="profile-form__phone-group">
            <select
              v-model="phoneCountryCode"
              class="profile-form__phone-select"
              aria-label="Código de país"
            >
              <option
                v-for="country in countries"
                :key="country.code"
                :value="country.code"
              >
                {{ country.code }} (+{{ countryPhoneCodes[country.code] }})
              </option>
            </select>
            <input
              id="telefono"
              v-model="phoneNumber"
              type="tel"
              class="profile-form__input profile-form__phone-input"
              placeholder="00000000"
              name="telefono"
            >
          </div>
        </div>

        <div class="profile-form__field">
          <label
            for="direccion"
            class="profile-form__label"
          >
            Dirección
          </label>
          <input
            id="direccion"
            v-model="address"
            type="text"
            class="profile-form__input"
            placeholder="Dirección"
            name="direccion"
          >
        </div>
      </div>

      <!-- Postal + City + Country -->
      <div class="profile-form__row profile-form__row--columns-3">
        <div class="profile-form__field">
          <label
            for="postal"
            class="profile-form__label"
          >
            Código Postal
          </label>
          <input
            id="postal"
            v-model="postalCode"
            type="text"
            class="profile-form__input"
            placeholder="00000000"
            name="postal"
          >
        </div>

        <div class="profile-form__field">
          <label
            for="ciudad"
            class="profile-form__label"
          >
            Ciudad*
          </label>
          <input
            id="ciudad"
            v-model="cityName"
            type="text"
            class="profile-form__input"
            placeholder="Ciudad"
            name="ciudad"
            required
          >
        </div>

        <div class="profile-form__field">
          <label
            for="pais"
            class="profile-form__label"
          >
            País*
          </label>
          <div
            ref="countryDropdownRef"
            class="custom-dropdown"
          >
            <div
              class="custom-dropdown__toggle"
              :class="{
                'custom-dropdown__toggle--active': isCountryDropdownOpen,
              }"
              @click="toggleCountryDropdown"
            >
              <input
                ref="countrySearchRef"
                v-model="countrySearchText"
                type="text"
                class="custom-dropdown__input"
                :placeholder="!countryIsoCode ? 'Seleccionar país' : ''"
                @input="handleCountrySearchInput"
                @click.stop="isCountryDropdownOpen = true"
              >
              <svg
                class="custom-dropdown__arrow"
                :class="{
                  'custom-dropdown__arrow--rotated': isCountryDropdownOpen,
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
              class="custom-dropdown__menu"
              :class="{ 'custom-dropdown__menu--open': isCountryDropdownOpen }"
            >
              <div
                v-if="filteredCountries.length === 0"
                class="custom-dropdown__no-results"
              >
                No se encontraron países
              </div>
              <button
                v-for="country in filteredCountries"
                :key="country.code"
                type="button"
                class="custom-dropdown__item"
                :class="{
                  'custom-dropdown__item--active':
                    countryIsoCode === country.code,
                }"
                @click="selectCountry(country.code)"
              >
                <span class="custom-dropdown__item-text">{{
                  country.name
                }}</span>
                <svg
                  v-if="countryIsoCode === country.code"
                  class="custom-dropdown__item-check"
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
        </div>
      </div>

      <div class="profile-form__actions">
        <button
          type="submit"
          class="profile-form__button profile-form__button--primary"
          :disabled="isSubmitting || isUploadingImage"
          :aria-busy="isSubmitting || isUploadingImage"
        >
          <template v-if="isSubmitting || isUploadingImage">
            <span
              class="profile-form__spinner"
              aria-hidden="true"
            />
            {{ isUploadingImage ? "Subiendo imagen..." : "Actualizando..." }}
          </template>
          <template v-else>
            Actualizar Perfil
          </template>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.profile-form {
  margin-top: 1.5rem;

  @include respond-to-max(md) {
    margin-top: 1.25rem;
  }

  @include respond-to-max(sm) {
    margin-top: 1rem;
  }

  &__title {
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1.75rem;
    margin-bottom: 1rem;
    color: #212529;
    font-family: $font-family-main;

    @include respond-to-max(md) {
      font-size: 1.375rem;
      margin-bottom: 0.875rem;
    }

    @include respond-to-max(sm) {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
  }

  &__row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;

    @include respond-to-max(md) {
      gap: 0.875rem;
      margin-bottom: 0.875rem;
    }

    @include respond-to-max(sm) {
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    &--columns-1 {
      grid-template-columns: 1fr;
    }

    &--columns-2 {
      grid-template-columns: repeat(2, 1fr);

      @include respond-to-max(md) {
        grid-template-columns: 1fr;
      }
    }

    &--columns-3 {
      grid-template-columns: repeat(3, 1fr);

      @include respond-to-max(lg) {
        grid-template-columns: repeat(2, 1fr);
      }

      @include respond-to-max(md) {
        grid-template-columns: 1fr;
      }
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    gap: 0.5rem;

    @include respond-to-max(md) {
      margin-bottom: 0.75rem;
      gap: 0.375rem;
    }

    @include respond-to-max(sm) {
      margin-bottom: 0.5rem;
    }

    &--avatar {
      margin-bottom: 1.5rem;
    }
  }

  &__avatar-group {
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;
  }

  &__avatar {
    margin: 0;
    border-radius: 1.125rem;
    border: 0.1875rem solid #c2c6e9;
    background: #f8faff;
    width: 8.125rem;
    height: 8.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    overflow: hidden;

    @include respond-to-max(md) {
      width: 7rem;
      height: 7.125rem;
    }

    @include respond-to-max(sm) {
      width: 6rem;
      height: 6.125rem;
    }
  }

  &__avatar-image {
    &--placeholder {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;

      @include respond-to-max(sm) {
        width: 2rem;
        height: 2rem;
      }
    }

    &--filled {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-trigger {
    z-index: 10;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    margin-left: -1.5625rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $color-primary;
    flex-shrink: 0;
    transition: all 0.2s ease;

    @include respond-to-max(sm) {
      width: 2rem;
      height: 2rem;
      margin-left: -1.125rem;
    }

    &:hover {
      background-color: $color-primary-darkened-5;
      transform: scale(1.05);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    img {
      width: 1.25rem;
      height: 1.25rem;

      @include respond-to-max(sm) {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  &__visually-hidden {
    @include visually-hidden;
  }

  &__label {
    @include form-label;
  }

  &__input {
    @include input-base;
  }

  &__phone-group {
    display: flex;
    align-items: stretch;

    &:has(.profile-form__phone-select:focus),
    &:has(.profile-form__phone-input:focus) {
      .profile-form__phone-select,
      .profile-form__phone-input {
        border-color: #3541b4;
        box-shadow: none;
        outline: none;
      }
    }
  }

  &__phone-select {
    @include input-base;
    flex-shrink: 0;
    width: 130px;
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    cursor: pointer;
    padding-right: 0.5rem;
  }

  &__phone-input {
    flex: 1;
    min-width: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &__actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-start;
    gap: 1rem;

    @include respond-to-max(md) {
      margin-top: 1.5rem;
      flex-direction: column;
    }
  }

  &__button {
    &--primary {
      @include primary-button;

      @include respond-to-max(md) {
        width: 100%;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: rotate-spinner 0.6s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
}

@keyframes rotate-spinner {
  to {
    transform: rotate(360deg);
  }
}

.custom-dropdown {
  position: relative;
  width: 100%;

  &__toggle {
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
      border-color: $color-primary;
      box-shadow:
        0 0 0 4px rgba(53, 65, 180, 0.2),
        0 0 1.05px rgba(53, 65, 180, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);
    }
  }

  &__input {
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
  }

  &__arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__menu {
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
  }

  &__no-results {
    padding: 1rem;
    font-size: 0.875rem;
    color: #9ca3af;
    font-style: italic;
    text-align: center;
  }

  &__item {
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

  &__item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  &__item-check {
    color: $color-primary;
    flex-shrink: 0;
  }
}
</style>
