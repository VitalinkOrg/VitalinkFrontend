<script lang="ts" setup>
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { useSupplier } from "@/composables/api";
import { onClickOutside } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const { getUserInfo } = useUserInfo();
const { updateHospital } = useSupplier();
const { formatPhone } = useFormat();

const firstName = ref("");
const lastName = ref("");
const phoneNumber = ref("");
const phoneCountryCode = ref("CRC");
const address = ref("");
const postalCode = ref("");
const cityName = ref("");
const countryIsoCode = ref("");
const isJuridical = ref(false);

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
  return phoneNumber.value;
});

const selectedCountry = computed(() => {
  return countries.find((country) => country.code === countryIsoCode.value);
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
    country.name.toLowerCase().includes(countrySearchText.value.toLowerCase()),
  );
});

const toggleCountryDropdown = () => {
  isCountryDropdownOpen.value = !isCountryDropdownOpen.value;

  if (isCountryDropdownOpen.value) {
    nextTick(() => {
      countrySearchRef.value?.focus();
    });
  }
};

const selectCountry = (countryCode: string) => {
  countryIsoCode.value = countryCode;
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

const initializeForm = () => {
  const userInfo = getUserInfo();

  isJuridical.value = userInfo.id_type?.code === "JURIDICAL_DNI";

  if (isJuridical.value) {
    firstName.value = userInfo.name || "";
    lastName.value = "";
  } else {
    const nameParts = userInfo.name?.split(" ") || [];
    firstName.value = nameParts[0] || "";
    lastName.value = nameParts.slice(1).join(" ") || "";
  }

  phoneNumber.value = userInfo.phone_number || "";
  phoneCountryCode.value = userInfo.country_iso_code || "CRC";
  address.value = "";
  postalCode.value = userInfo.postal_code || "";
  cityName.value = userInfo.city_name || "";
  countryIsoCode.value = userInfo.country_iso_code || "";

  countrySearchText.value = selectedCountry.value?.name || "";
};

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const countryCode = currentPhoneCode.value;

  const rawValue = target.value;

  const prefixPattern = `(${countryCode}) `;
  let localPart = rawValue;

  if (rawValue.startsWith(prefixPattern)) {
    localPart = rawValue.slice(prefixPattern.length);
  }

  const localDigits = localPart.replace(/\D/g, "").slice(0, 8);

  phoneNumber.value = localDigits;

  const formatted = formattedPhone.value;
  target.value = formatted;
  target.setSelectionRange(formatted.length, formatted.length);
};

onMounted(() => {
  initializeForm();
});

onClickOutside(countryDropdownRef, () => {
  closeCountryDropdown();
});

const handleUpdateHospital = async () => {
  try {
    const payload = {
      name: isJuridical.value
        ? firstName.value.trim()
        : `${firstName.value} ${lastName.value}`.trim(),
      phone_number: phoneNumber.value,
      postal_code: postalCode.value,
      city_name: cityName.value,
      country_iso_code: countryIsoCode.value,
    };

    const id = getUserInfo().id;

    const api = updateHospital(id, payload);
    await api.request();

    console.log("Hospital actualizado exitosamente");
  } catch (error) {
    console.log("Error updating hospital:", error);
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <h4 class="profile-form__title">Datos Personales</h4>
    <form class="profile-form" @submit.prevent="handleUpdateHospital">
      <div class="profile-form__row profile-form__row--columns-2">
        <!-- Campo único para razón social -->
        <div
          v-if="isJuridical"
          class="profile-form__field profile-form__field--full-width"
        >
          <label for="razon-social" class="profile-form__label">
            Razón Social
          </label>
          <input
            type="text"
            class="profile-form__input"
            placeholder="Nombre de la razón social"
            v-model="firstName"
            name="razon-social"
            id="razon-social"
          />
        </div>

        <template v-else>
          <div class="profile-form__field">
            <label for="nombre" class="profile-form__label">Nombre (s)</label>
            <input
              type="text"
              class="profile-form__input"
              placeholder="Escribe tu nombre"
              v-model="firstName"
              name="nombre"
              id="nombre"
            />
          </div>
          <div class="profile-form__field">
            <label for="apellido" class="profile-form__label">
              Apellido (s)
            </label>
            <input
              type="text"
              class="profile-form__input"
              placeholder="Escribe tu apellido"
              v-model="lastName"
              id="apellido"
              name="apellido"
            />
          </div>
        </template>

        <div class="profile-form__field">
          <label class="profile-form__label" for="telefono">
            Número de teléfono
          </label>
          <div class="profile-form__phone-group">
            <UiDropdownBase
              v-model="phoneCountryCode"
              :items="phoneCountryDropdownItems"
              :searchable="true"
              :clearable="false"
              placeholder="País"
              no-results-text="No se encontraron países"
              class="profile-form__phone-dropdown"
            />
            <input
              type="tel"
              :value="formattedPhone"
              @input="handlePhoneInput"
              :placeholder="`+${currentPhoneCode} 0000-0000`"
              id="telefono"
              name="telefono"
              class="profile-form__input profile-form__phone-input"
            />
          </div>
        </div>
        <div class="profile-form__field">
          <label for="direccion" class="profile-form__label">Dirección</label>
          <input
            type="text"
            placeholder="Dirección"
            v-model="address"
            id="direccion"
            name="direccion"
            class="profile-form__input"
          />
        </div>
      </div>
      <div class="profile-form__row profile-form__row--columns-3">
        <div class="profile-form__field">
          <label class="profile-form__label" for="postal">Código Postal</label>
          <input
            type="text"
            placeholder="00000000"
            v-model="postalCode"
            id="postal"
            name="postal"
            class="profile-form__input"
          />
        </div>
        <div class="profile-form__field">
          <label class="profile-form__label" for="ciudad">Ciudad*</label>
          <input
            type="text"
            placeholder="Ciudad"
            v-model="cityName"
            id="ciudad"
            name="ciudad"
            class="profile-form__input"
            required
          />
        </div>
        <div class="profile-form__field">
          <label class="profile-form__label" for="pais">País*</label>

          <div ref="countryDropdownRef" class="custom-dropdown">
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
              />

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
        >
          Actualizar Perfil
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
      line-height: 1.625rem;
      margin-bottom: 0.875rem;
    }

    @include respond-to-max(sm) {
      font-size: 1.25rem;
      line-height: 1.5rem;
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

    &--full-width {
      grid-column: 1 / -1;
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

    .profile-form__phone-input {
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

      .profile-form__phone-input {
        border-color: #98a2b3;
        border-left: none !important;
      }
    }

    &:has(:deep(.dropdown__toggle:focus-within)) {
      box-shadow:
        0 0 0 4px rgba(53, 65, 180, 0.2),
        0 0 1.05px rgba(53, 65, 180, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);

      :deep(.dropdown__toggle) {
        border-color: #3541b4;
        border-right: none;
        box-shadow: none;
      }

      .profile-form__phone-input {
        border-color: #3541b4;
        border-left: none !important;
        box-shadow: none;
        outline: none;
      }
    }

    &:has(.profile-form__phone-input:focus) {
      box-shadow:
        0 0 0 4px rgba(53, 65, 180, 0.2),
        0 0 1.05px rgba(53, 65, 180, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);

      :deep(.dropdown__toggle) {
        border-color: #3541b4;
        border-right: none;
        box-shadow: none;
      }

      .profile-form__phone-input {
        border-color: #3541b4;
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

  &__label {
    @include form-label;
  }

  &__input {
    @include input-base;
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

    @include respond-to-max(sm) {
      margin-top: 1.25rem;
    }
  }

  &__button {
    &--primary {
      @include primary-button;

      @include respond-to-max(md) {
        width: 100%;
      }
    }
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
