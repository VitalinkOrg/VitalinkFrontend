<script lang="ts" setup>
import { useCountries } from "@/composables/useCountries";
import defaultAvatar from "@/src/assets/picture.svg";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
}

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

const props = defineProps<Props>();
const { getCountryName } = useCountries();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isCountryDropdownOpen = ref<boolean>(false);
const countrySearchTerm = ref<string>("");

const isPhoneDisabled = ref<boolean>(true);

const countries: Country[] = [
  {
    name: "Costa Rica",
    code: "CR",
    dialCode: "+506",
    flag: "🇨🇷",
    placeholder: "8888-8888",
  },
  {
    name: "Estados Unidos",
    code: "US",
    dialCode: "+1",
    flag: "🇺🇸",
    placeholder: "(555) 123-4567",
  },
  {
    name: "México",
    code: "MX",
    dialCode: "+52",
    flag: "🇲🇽",
    placeholder: "55 1234 5678",
  },
  {
    name: "España",
    code: "ES",
    dialCode: "+34",
    flag: "🇪🇸",
    placeholder: "612 34 56 78",
  },
  {
    name: "Argentina",
    code: "AR",
    dialCode: "+54",
    flag: "🇦🇷",
    placeholder: "11 1234-5678",
  },
  {
    name: "Colombia",
    code: "CO",
    dialCode: "+57",
    flag: "🇨🇴",
    placeholder: "300 123 4567",
  },
  {
    name: "Chile",
    code: "CL",
    dialCode: "+56",
    flag: "🇨🇱",
    placeholder: "9 1234 5678",
  },
  {
    name: "Perú",
    code: "PE",
    dialCode: "+51",
    flag: "🇵🇪",
    placeholder: "987 654 321",
  },
  {
    name: "Brasil",
    code: "BR",
    dialCode: "+55",
    flag: "🇧🇷",
    placeholder: "11 91234-5678",
  },
  {
    name: "Venezuela",
    code: "VE",
    dialCode: "+58",
    flag: "🇻🇪",
    placeholder: "412-123-4567",
  },
  {
    name: "Ecuador",
    code: "EC",
    dialCode: "+593",
    flag: "🇪🇨",
    placeholder: "99 123 4567",
  },
  {
    name: "Uruguay",
    code: "UY",
    dialCode: "+598",
    flag: "🇺🇾",
    placeholder: "99 123 456",
  },
  {
    name: "Paraguay",
    code: "PY",
    dialCode: "+595",
    flag: "🇵🇾",
    placeholder: "981 123456",
  },
  {
    name: "Bolivia",
    code: "BO",
    dialCode: "+591",
    flag: "🇧🇴",
    placeholder: "71234567",
  },
  {
    name: "Guatemala",
    code: "GT",
    dialCode: "+502",
    flag: "🇬🇹",
    placeholder: "5123 4567",
  },
  {
    name: "Honduras",
    code: "HN",
    dialCode: "+504",
    flag: "🇭🇳",
    placeholder: "9123-4567",
  },
  {
    name: "El Salvador",
    code: "SV",
    dialCode: "+503",
    flag: "🇸🇻",
    placeholder: "7123-4567",
  },
  {
    name: "Nicaragua",
    code: "NI",
    dialCode: "+505",
    flag: "🇳🇮",
    placeholder: "8123 4567",
  },
  {
    name: "Panamá",
    code: "PA",
    dialCode: "+507",
    flag: "🇵🇦",
    placeholder: "6123-4567",
  },
  {
    name: "República Dominicana",
    code: "DO",
    dialCode: "+1",
    flag: "🇩🇴",
    placeholder: "(809) 123-4567",
  },
  {
    name: "Puerto Rico",
    code: "PR",
    dialCode: "+1",
    flag: "🇵🇷",
    placeholder: "(787) 123-4567",
  },
];

const selectedCountry = ref<Country>(
  countries.find((c) => c.code === "CR") || countries[0]
);

const displayPhoneNumber = computed(() => {
  const rawNumber = props.appointment.customer.phone_number || "";
  if (rawNumber.startsWith(selectedCountry.value.dialCode)) {
    return rawNumber;
  }
  return rawNumber
    ? `${selectedCountry.value.dialCode} ${rawNumber}`
    : selectedCountry.value.dialCode;
});

const phoneNumberWithoutPrefix = computed(() => {
  const fullNumber = props.appointment.customer.phone_number || "";
  if (fullNumber.startsWith(selectedCountry.value.dialCode)) {
    return fullNumber.substring(selectedCountry.value.dialCode.length).trim();
  }
  return fullNumber;
});

const filteredCountries = computed(() => {
  if (!countrySearchTerm.value) return countries;

  const searchTerm = countrySearchTerm.value.toLowerCase();
  return countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm) ||
      country.dialCode.includes(searchTerm)
  );
});

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  isCountryDropdownOpen.value = false;
};

const toggleCountryDropdown = () => {
  if (isPhoneDisabled.value) return;

  isCountryDropdownOpen.value = !isCountryDropdownOpen.value;
  if (isCountryDropdownOpen.value) {
    countrySearchTerm.value = "";
  }
};

const selectCountry = (country: Country) => {
  selectedCountry.value = country;
  isCountryDropdownOpen.value = false;
  countrySearchTerm.value = "";
};

const updatePhoneNumber = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputValue = target.value;

  const numberPart = inputValue
    .replace(selectedCountry.value.dialCode, "")
    .trim();
  console.log("Número completo:", inputValue);
  console.log("Parte numérica:", numberPart);
};

const handleInputFocus = () => {};

const handleInputBlur = () => {};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-information__phone-input")) {
    isCountryDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const profileImage = computed(() => {
  return props.appointment.customer.profile_picture_url || defaultAvatar;
});

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    class="user-information"
    @close="handleCloseModal"
  >
    <template #title>
      <h2 class="user-information__title">Información del Usuario</h2>
    </template>

    <div class="user-information__content">
      <div class="user-information__form-group">
        <label class="user-information__label">Foto de Perfil Publico</label>
        <div class="user-information__profile-image">
          <img :src="profileImage" alt="Profile" />
        </div>
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Nombre y Apellido</label>
        <input
          type="text"
          :value="appointment.customer.name"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Email</label>
        <input
          type="email"
          :value="appointment.customer.email"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Número de teléfono</label>
        <div class="user-information__phone-input">
          <div class="user-information__input-wrapper">
            <div
              class="user-information__prefix-section"
              :class="{
                'user-information__prefix-section--disabled': isPhoneDisabled,
              }"
              @click="!isPhoneDisabled && toggleCountryDropdown()"
            >
              <span class="user-information__prefix">{{
                selectedCountry.code
              }}</span>
              <svg
                class="user-information__dropdown-arrow"
                :class="{
                  'user-information__dropdown-arrow--open':
                    isCountryDropdownOpen && !isPhoneDisabled,
                  'user-information__dropdown-arrow--disabled': isPhoneDisabled,
                }"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="#7a828a"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <input
              type="tel"
              :value="displayPhoneNumber"
              @input="updatePhoneNumber"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
              class="user-information__input user-information__phone-number-input"
              :placeholder="selectedCountry.placeholder"
              :disabled="isPhoneDisabled"
            />
          </div>

          <div
            v-if="isCountryDropdownOpen && !isPhoneDisabled"
            class="user-information__country-dropdown"
            @click.stop
          >
            <div class="user-information__country-search">
              <input
                type="text"
                v-model="countrySearchTerm"
                placeholder="Buscar país..."
                class="user-information__search-input"
                @click.stop
              />
            </div>
            <div class="user-information__country-list">
              <div
                v-for="country in filteredCountries"
                :key="country.code"
                class="user-information__country-item"
                :class="{
                  'user-information__country-item--selected':
                    country.code === selectedCountry.code,
                }"
                @click="selectCountry(country)"
              >
                <span class="user-information__country-name">{{
                  country.name
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="user-information__form-group">
        <label class="user-information__label">Dirección</label>
        <input
          type="text"
          :value="appointment.customer.address"
          class="user-information__input"
          disabled
        />
      </div>

      <div class="user-information__address-row">
        <div class="user-information__form-group">
          <label class="user-information__label">Código Postal</label>
          <input
            type="text"
            :value="appointment.customer.postal_code"
            class="user-information__input user-information__input--postal-code"
            disabled
          />
        </div>
        <div class="user-information__form-group">
          <label class="user-information__label">Ciudad</label>
          <input
            type="text"
            :value="appointment.customer.city_name"
            class="user-information__input"
            disabled
          />
        </div>
        <div class="user-information__form-group">
          <label class="user-information__label">País</label>
          <input
            type="text"
            :value="getCountryName(appointment.customer.country_iso_code)"
            class="user-information__input"
            disabled
          />
        </div>
      </div>
    </div>
  </AtomsModalBase>
</template>

<style lang="scss" scoped>
.user-information {
  &__title {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1.25rem;
    line-height: 1.75rem;
    letter-spacing: 0;
    color: $color-foreground;
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.25rem;
  }

  &__profile-image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 8.125rem;
    height: 8.25rem;
    border-radius: 1.125rem;
    border: 0.1875rem solid #c2c6e9;
    background-color: #f8faff;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__address-row {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
  }

  &__label {
    @include form-label;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--postal-code {
      max-width: 8rem;
    }
  }

  &__phone-input {
    position: relative;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__prefix-section {
    position: absolute;
    left: 0.9375rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.375rem;
    cursor: pointer;
    z-index: 2;
    padding: 0.125rem 0.5rem 0.125rem 0;
    background-color: $white;
    border-right: 0.0625rem solid #e5e9ef;
    padding-right: 0.75rem;

    &:hover:not(.user-information__prefix-section--disabled) {
      .user-information__dropdown-arrow path {
        stroke: $primary-aqua;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.6;

      .user-information__prefix {
        color: #a0a3a8;
      }
    }
  }

  &__prefix {
    font-family: $font-family-main;
    font-size: 0.91875rem;
    color: #425466;
    font-weight: 500;
  }

  &__dropdown-arrow {
    transition: transform 0.3s ease;
    margin-left: 0.25rem;

    &--open {
      transform: rotate(180deg);
    }

    &--disabled path {
      stroke: #a0a3a8;
    }
  }

  &__phone-number-input {
    width: 100%;
    padding-left: 7.5rem !important;

    &:focus-visible:not(:disabled) {
      + .user-information__prefix-section:not(
          .user-information__prefix-section--disabled
        ) {
        border-right-color: $color-primary;
      }
    }
  }

  &__country-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: $white;
    border: 0.0625rem solid #d4dae0;
    border-top: none;
    border-radius: 0 0 $border-radius-md $border-radius-md;
    box-shadow:
      0 0.25rem 0.375rem rgba(50, 50, 71, 0.1),
      0 0.0625rem 0.1875rem rgba(50, 50, 71, 0.08);
    z-index: 1000;
    max-height: 18.75rem;
    overflow: hidden;
  }

  &__country-search {
    padding: 0.75rem;
    border-bottom: 0.0625rem solid #e5e9ef;
  }

  &__search-input {
    @include input-base;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  &__country-list {
    max-height: 15rem;
    overflow-y: auto;
  }

  &__country-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f8faff;
    }

    &--selected {
      background-color: #e6f3ff;

      .user-information__country-name {
        font-weight: 600;
      }
    }
  }

  &__country-name {
    flex: 1;
    font-family: $font-family-main;
    font-size: 0.875rem;
    color: #425466;
  }

  &__country-list::-webkit-scrollbar {
    width: 0.375rem;
  }

  &__country-list::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &__country-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 0.1875rem;
  }

  &__country-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
}
</style>
