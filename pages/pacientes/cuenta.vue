<script lang="ts" setup>
useSeoMeta({
  title: "Mi Cuenta — Vitalink",
  description: "Edita tu información personal y datos de contacto en Vitalink.",
  ogTitle: "Mi Cuenta — Vitalink",
  ogDescription:
    "Edita tu información personal y datos de contacto en Vitalink.",
});

import { jwtDecode } from "jwt-decode";
import { useDocuments } from "~/composables/api/useDocuments";
import { useAuth } from "~/composables/api/useAuth";
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { onClickOutside } from "@vueuse/core";

interface DecodedToken {
  id: string;
}

interface PatientUpdatePayload {
  name?: string;
  phone_number?: string;
  country_iso_code?: string;
  city_name?: string;
  address?: string;
  postal_code?: string;
  profile_picture_url?: string;
  birth_date?: string;
}

definePageMeta({
  middleware: ["auth-pacientes"],
});

const { show: showToast } = useToast();
const { getUserById, updateUser: updateUserApi } = useAuth();
const { addDocument, getDocumentByCode } = useDocuments();
const { getToken } = useAuthToken();
const { setUserInfo } = useUserInfo();

const { id: userId } = jwtDecode<DecodedToken>(getToken()!);

// ─── Form state ───────────────────────────────────────────────────────────────
const userData = ref<IUser | null>(null);
const firstName = ref("");
const lastName = ref("");
const phoneNumber = ref("");
const phoneCountryCode = ref("CRC");
const selectedProfileImage = ref<File | null>(null);
const profileImagePreview = ref<string | null>(null);

const isSubmitting = ref(false);
const isLoadingProfile = ref(true);
const isUploadingImage = ref(false);
const numericId = ref<number | null>(null);

// ─── Country dropdown ─────────────────────────────────────────────────────────
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

// ─── Computed ─────────────────────────────────────────────────────────────────
const isValidImageUrl = (url: string | null | undefined): boolean =>
  !!url && (url.startsWith("http://") || url.startsWith("https://"));

const storedProfileImageUrl = computed(() =>
  isValidImageUrl(userData.value?.profile_picture_url)
    ? userData.value!.profile_picture_url
    : null,
);

const hasProfileImage = computed(
  () => !!profileImagePreview.value || !!storedProfileImageUrl.value,
);

const displayedImageSrc = computed(
  () =>
    profileImagePreview.value ||
    storedProfileImageUrl.value ||
    "/_nuxt/src/assets/picture.svg",
);

const phoneCountryDropdownItems = computed<DropdownItem[]>(() =>
  countries.map((c) => ({ value: c.code, label: c.code, disabled: false })),
);

const selectedCountry = computed(() =>
  countries.find((c) => c.code === userData.value?.country_iso_code),
);

const filteredCountries = computed(() => {
  if (!countrySearchText.value.trim()) return countries;
  return countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearchText.value.toLowerCase()),
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const notify = (message: string, type: "success" | "error") =>
  showToast(message, type);

// ─── Country dropdown ─────────────────────────────────────────────────────────
onClickOutside(countryDropdownRef, () => closeCountryDropdown());

const toggleCountryDropdown = () => {
  isCountryDropdownOpen.value = !isCountryDropdownOpen.value;
  if (isCountryDropdownOpen.value) {
    nextTick(() => countrySearchRef.value?.focus());
  }
};

const selectCountry = (code: string) => {
  if (userData.value) userData.value.country_iso_code = code;
  closeCountryDropdown();
};

const closeCountryDropdown = () => {
  isCountryDropdownOpen.value = false;
  countrySearchText.value = selectedCountry.value?.name || "";
};

const handleCountrySearchInput = () => {
  if (!isCountryDropdownOpen.value) isCountryDropdownOpen.value = true;
};

// ─── Image handling ───────────────────────────────────────────────────────────
const handleImageSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    notify("Formato no válido. Use JPG, PNG o WebP", "error");
    input.value = "";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    notify("La imagen no debe superar los 5 MB", "error");
    input.value = "";
    return;
  }

  selectedProfileImage.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImagePreview.value = e.target?.result as string;
  };
  reader.onerror = () => notify("Error al previsualizar la imagen", "error");
  reader.readAsDataURL(file);
};

const uploadProfileImage = async (): Promise<string | null> => {
  if (!selectedProfileImage.value || !userData.value) return null;
  isUploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append("file", selectedProfileImage.value);
    formData.append("title", `profile_picture_${userData.value.id}`);
    formData.append("type", "IMG");
    formData.append("description", "Foto de perfil de paciente");
    formData.append("id_for_table", "6");
    formData.append("table", "USER");
    formData.append("action_type", "GENERAL_GALLERY");
    formData.append("user_id", userId);
    formData.append("is_public", "1");

    console.log("--- UPLOAD PAYLOAD LOG ---");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("--------------------------");

    const { data, error } = await addDocument({
      file: selectedProfileImage.value,
      fields: {
        title: `profile_picture_${userData.value.id}`,
        type: "IMG",
        description: "Foto de perfil de paciente",
        "id_for_table": "6",
        table: "USER",
        action_type: "GENERAL_GALLERY",
        user_id: userId,
        is_public: 1,
      },
    });
    if (error) {
      const is500 = error.status === 500 || error.info?.includes("500");
      notify(
        is500
          ? "Error del servidor (500): Posible conflicto de formato en el ID. Contacte al administrador del sistema."
          : error.info || "Error al subir la imagen",
        "error",
      );
      return null;
    }
    return data?.url || null;
  } catch {
    notify("Error inesperado al subir la imagen", "error");
    return null;
  } finally {
    isUploadingImage.value = false;
  }
};

// ─── Fetch profile ────────────────────────────────────────────────────────────
const migrateProfilePictureCodeToUrl = async () => {
  if (!userData.value) return;

  const stored = userData.value.profile_picture_url;
  if (isValidImageUrl(stored)) return;
  if (!stored) return;

  const { data: doc, error } = await getDocumentByCode(stored);
  if (error || !doc?.url) return;

  await updateUserApi(userId, { profile_picture_url: doc.url });
  userData.value = { ...userData.value, profile_picture_url: doc.url };
};

const fetchUserProfile = async () => {
  isLoadingProfile.value = true;
  try {
    const { data, error } = await getUserById(userId);
    if (error) {
      notify(error.info || "Error al cargar el perfil", "error");
      return;
    }
    if (data) {
      console.log("Full User Data Response:", data);

      if (typeof (data as any).internal_id === "number") {
        numericId.value = (data as any).internal_id;
      } else if (typeof (data as any).id === "number") {
        numericId.value = (data as any).id;
      } else {
        console.warn(
          "[uploadProfileImage] No se encontró un ID numérico en la respuesta del usuario. " +
          "Se enviará el UUID como id_for_table, lo cual probablemente causará un error 500 " +
          "porque el backend espera un INT UNSIGNED en esa columna.",
        );
      }

      userData.value = data;
      const nameParts = data.name?.split(" ") || [];
      firstName.value = nameParts[0] || "";
      lastName.value = nameParts.slice(1).join(" ");
      phoneNumber.value = data.phone_number || "";
      phoneCountryCode.value = data.country_iso_code || "CRC";
      countrySearchText.value =
        countries.find((c) => c.code === data.country_iso_code)?.name || "";

      await migrateProfilePictureCodeToUrl();
    }
  } catch {
    notify("Error inesperado al cargar el perfil", "error");
  } finally {
    isLoadingProfile.value = false;
  }
};

// ─── Submit ───────────────────────────────────────────────────────────────────
const submitProfileUpdate = async () => {
  if (!userData.value) {
    notify("No se encontró la información del usuario", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    let profilePictureUrl = storedProfileImageUrl.value ?? undefined;

    if (selectedProfileImage.value) {
      const uploadedUrl = await uploadProfileImage();
      if (uploadedUrl) {
        profilePictureUrl = uploadedUrl;
      } else {
        return; // upload failed — error already shown
      }
    }

    const fullName =
      `${firstName.value.trim()} ${lastName.value.trim()}`.trim();

    const rawBirthDate = (userData.value as any).birth_date as string | undefined;
    const safeBirthDate = rawBirthDate
      ? rawBirthDate.includes("T")
        ? rawBirthDate
        : `${rawBirthDate}T12:00:00Z`
      : undefined;

    const payload: PatientUpdatePayload = {
      name: fullName || undefined,
      phone_number: phoneNumber.value || undefined,
      country_iso_code: userData.value.country_iso_code || undefined,
      city_name: userData.value.city_name || undefined,
      address: userData.value.address || undefined,
      postal_code: userData.value.postal_code || undefined,
      profile_picture_url: profilePictureUrl,
      birth_date: safeBirthDate,
    };

    const { data, error } = await updateUserApi(
      userId,
      payload as IUserUpdateRequest,
    );

    if (error) {
      notify(error.info || "Error al actualizar el perfil", "error");
      return;
    }

    if (data) {
      userData.value = data;
      const nameParts = data.name?.split(" ") || [];
      firstName.value = nameParts[0] || "";
      lastName.value = nameParts.slice(1).join(" ");
      phoneNumber.value = data.phone_number || "";
      selectedProfileImage.value = null;
      setUserInfo(data);
      notify("Perfil actualizado exitosamente", "success");
    }
  } catch {
    notify("Error inesperado al actualizar el perfil", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
});

onBeforeUnmount(() => {
  if (profileImagePreview.value) {
    URL.revokeObjectURL(profileImagePreview.value);
  }
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <div
      v-if="isLoadingProfile"
      class="account-profile__loading"
      role="status"
      aria-live="polite"
    >
      Cargando perfil...
    </div>

    <form
      v-else
      class="account-profile"
      novalidate
      @submit.prevent="submitProfileUpdate"
      aria-label="Formulario de perfil de cuenta"
    >
      <!-- ─── Profile Photo ─────────────────────────────────────────────── -->
      <fieldset class="account-profile__fieldset">
        <legend class="account-profile__visually-hidden">Foto de perfil</legend>

        <div class="account-profile__field">
          <span class="account-profile__label" id="photo-label">
            Foto de Perfil
          </span>
          <p class="account-profile__hint" id="photo-hint">
            Esta será la foto que verán tus médicos y el equipo de Vitalink.
          </p>

          <div
            class="account-profile__avatar-group"
            role="group"
            aria-labelledby="photo-label"
            aria-describedby="photo-hint"
          >
            <figure class="account-profile__avatar">
              <img
                :src="displayedImageSrc"
                :class="[
                  'account-profile__avatar-image',
                  hasProfileImage
                    ? 'account-profile__avatar-image--filled'
                    : 'account-profile__avatar-image--placeholder',
                ]"
                alt="Foto de perfil actual"
              />
            </figure>

            <label
              for="profile-image-upload"
              class="account-profile__avatar-trigger"
              role="button"
              tabindex="0"
              aria-label="Cambiar foto de perfil"
              @keydown.enter.prevent="
                ($refs.imageInput as HTMLInputElement)?.click()
              "
              @keydown.space.prevent="
                ($refs.imageInput as HTMLInputElement)?.click()
              "
            >
              <img src="@/src/assets/camera.svg" alt="" aria-hidden="true" />
            </label>

            <input
              id="profile-image-upload"
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="account-profile__visually-hidden"
              @change="handleImageSelection"
            />
          </div>
        </div>
      </fieldset>

      <!-- ─── Detalles Personales ────────────────────────────────────── -->
      <fieldset
        class="account-profile__fieldset account-profile__fieldset--section"
      >
        <legend class="account-profile__section-title">
          Detalles Personales
        </legend>

        <div class="account-profile__grid">
          <!-- Row 1: Nombre | Apellido -->
          <div class="account-profile__field account-profile__field--half">
            <label for="first-name" class="account-profile__label">
              Nombre(s) <span class="account-profile__required">*</span>
            </label>
            <input
              id="first-name"
              v-model="firstName"
              type="text"
              class="account-profile__input"
              placeholder="Escribe tu nombre"
              required
            />
          </div>

          <div class="account-profile__field account-profile__field--half">
            <label for="last-name" class="account-profile__label">
              Apellido(s) <span class="account-profile__required">*</span>
            </label>
            <input
              id="last-name"
              v-model="lastName"
              type="text"
              class="account-profile__input"
              placeholder="Escribe tu apellido"
              required
            />
          </div>

          <!-- Row 2: Teléfono | Dirección -->
          <div class="account-profile__field account-profile__field--half">
            <label for="telefono" class="account-profile__label">
              Número de teléfono
            </label>
            <div class="account-profile__phone-group">
              <UiDropdownBase
                v-model="phoneCountryCode"
                :items="phoneCountryDropdownItems"
                :searchable="true"
                :clearable="false"
                placeholder="País"
                no-results-text="No se encontraron países"
                class="account-profile__phone-dropdown"
              />
              <input
                id="telefono"
                v-model="phoneNumber"
                type="tel"
                placeholder="+506 8000-0000"
                class="account-profile__input account-profile__phone-input"
              />
            </div>
          </div>

          <div class="account-profile__field account-profile__field--half">
            <label for="direccion" class="account-profile__label">
              Dirección
            </label>
            <input
              id="direccion"
              v-model="userData!.address"
              type="text"
              class="account-profile__input"
              placeholder="Calle, número, colonia..."
            />
          </div>

          <!-- Row 3: Código Postal | Ciudad | País -->
          <div class="account-profile__field account-profile__field--third">
            <label for="postal" class="account-profile__label">
              Código Postal
            </label>
            <input
              id="postal"
              v-model="userData!.postal_code"
              type="text"
              class="account-profile__input"
              placeholder="00000"
              maxlength="10"
            />
          </div>

          <div class="account-profile__field account-profile__field--third">
            <label for="ciudad" class="account-profile__label">
              Ciudad <span class="account-profile__required">*</span>
            </label>
            <input
              id="ciudad"
              v-model="userData!.city_name"
              type="text"
              class="account-profile__input"
              placeholder="Escribe tu ciudad"
              required
            />
          </div>

          <div class="account-profile__field account-profile__field--third">
            <label for="pais" class="account-profile__label">
              País <span class="account-profile__required">*</span>
            </label>

            <div
              ref="countryDropdownRef"
              class="account-profile__country-dropdown"
            >
              <div
                class="account-profile__country-toggle"
                :class="{
                  'account-profile__country-toggle--active':
                    isCountryDropdownOpen,
                }"
                @click="toggleCountryDropdown"
              >
                <input
                  ref="countrySearchRef"
                  v-model="countrySearchText"
                  type="text"
                  class="account-profile__country-input"
                  :placeholder="
                    !userData?.country_iso_code ? 'Seleccionar país' : ''
                  "
                  @input="handleCountrySearchInput"
                  @click.stop="isCountryDropdownOpen = true"
                />
                <svg
                  class="account-profile__country-arrow"
                  :class="{
                    'account-profile__country-arrow--rotated':
                      isCountryDropdownOpen,
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
                class="account-profile__country-menu"
                :class="{
                  'account-profile__country-menu--open': isCountryDropdownOpen,
                }"
              >
                <div
                  v-if="filteredCountries.length === 0"
                  class="account-profile__country-no-results"
                >
                  No se encontraron países
                </div>
                <button
                  v-for="country in filteredCountries"
                  :key="country.code"
                  type="button"
                  class="account-profile__country-item"
                  :class="{
                    'account-profile__country-item--active':
                      userData?.country_iso_code === country.code,
                  }"
                  @click="selectCountry(country.code)"
                >
                  <span class="account-profile__country-item-text">
                    {{ country.name }}
                  </span>
                  <svg
                    v-if="userData?.country_iso_code === country.code"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
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
      </fieldset>

      <!-- ─── Actions ──────────────────────────────────────────────────── -->
      <div class="account-profile__actions">
        <button
          type="submit"
          class="account-profile__submit"
          :disabled="isSubmitting || isUploadingImage"
          :aria-busy="isSubmitting || isUploadingImage"
        >
          <template v-if="isSubmitting || isUploadingImage">
            <span class="account-profile__spinner" aria-hidden="true" />
            {{ isUploadingImage ? "Subiendo imagen..." : "Actualizando..." }}
          </template>
          <template v-else>Actualizar Perfil</template>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.account-profile {
  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__fieldset {
    border: none;
    margin: 0;
    padding: 0;

    &--section {
      margin-top: 2.5rem;

      @include respond-to-max(md) {
        margin-top: 2rem;
      }

      @include respond-to-max(sm) {
        margin-top: 1.5rem;
      }
    }
  }

  &__section-title {
    display: block;
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1;
    color: #353e5c;
    margin-bottom: 1.25rem;

    @include respond-to-max(sm) {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;

    @include respond-to-max(md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-to-max(sm) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    &--full {
      grid-column: 1 / -1;
    }

    &--half {
      grid-column: span 3;

      @include respond-to-max(md) {
        grid-column: span 1;
      }

      @include respond-to-max(sm) {
        grid-column: 1 / -1;
      }
    }

    &--third {
      grid-column: span 2;

      @include respond-to-max(md) {
        grid-column: span 1;
      }

      @include respond-to-max(sm) {
        grid-column: 1 / -1;
      }
    }
  }

  &__label {
    @include form-label;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;

    @include respond-to-max(sm) {
      margin-bottom: 0.375rem;
    }
  }

  &__required {
    color: #dc3545;
    margin-left: 2px;
  }

  &__hint {
    @include text-base;
    color: $color-text-muted;
    font-weight: 300;
    margin-top: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 14px;
    line-height: 1.4;

    @include respond-to-max(sm) {
      font-size: 0.75rem;
    }
  }

  // ─── Avatar ───────────────────────────────────────────────────────────
  &__avatar-group {
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;

    @include respond-to-max(sm) {
      gap: 0.5rem;
    }
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
      border-radius: 1rem;
      border-width: 0.15rem;
    }

    @include respond-to-max(sm) {
      width: 6rem;
      height: 6.125rem;
      border-radius: 0.875rem;
      border-width: 0.125rem;
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

    @include respond-to-max(md) {
      width: 2.25rem;
      height: 2.25rem;
      margin-left: -1.375rem;
    }

    @include respond-to-max(sm) {
      width: 2rem;
      height: 2rem;
      margin-left: -1.125rem;
    }

    &:hover {
      background-color: $color-primary-darkened-5;
      transform: scale(1.05);
    }

    &:active {
      background-color: $color-primary-darkened-10;
      transform: scale(0.98);
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

  // ─── Inputs ───────────────────────────────────────────────────────────
  &__input {
    @include input-base;
    width: 100%;
  }

  // ─── Phone group ──────────────────────────────────────────────────────
  &__phone-group {
    display: flex;
    align-items: stretch;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    :deep(.dropdown__toggle) {
      border-right: none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      height: 100%;
    }

    .account-profile__phone-input {
      border-left: none !important;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }

    &:hover {
      :deep(.dropdown__toggle) {
        border-color: #98a2b3;
        border-right: none;
      }

      .account-profile__phone-input {
        border-color: #98a2b3;
      }
    }

    &:has(:deep(.dropdown__toggle:focus-within)),
    &:has(.account-profile__phone-input:focus) {
      box-shadow:
        0 0 0 4px rgba(13, 110, 253, 0.25),
        0 0 1.05px rgba(13, 110, 253, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);

      :deep(.dropdown__toggle) {
        border-color: #80bdff;
        border-right: none;
        box-shadow: none;
      }

      .account-profile__phone-input {
        border-color: #80bdff;
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

  // ─── Country dropdown ─────────────────────────────────────────────────
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
    cursor: pointer;

    &::placeholder {
      color: #9ca3af;
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

      svg {
        color: $color-primary;
      }
    }
  }

  &__country-item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // ─── Actions ──────────────────────────────────────────────────────────
  &__actions {
    margin-top: 2.5rem;
    display: flex;
    justify-content: flex-start;

    @include respond-to-max(md) {
      margin-top: 2rem;
    }

    @include respond-to-max(sm) {
      margin-top: 1.5rem;
    }
  }

  &__submit {
    @include primary-button;

    @include respond-to-max(md) {
      width: 100%;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: account-spin 0.6s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  &__visually-hidden {
    @include visually-hidden;
  }
}

@keyframes account-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
