<template>
  <section class="registration">
    <form @submit.prevent="handleRegister" class="registration__form">
      <div class="registration__container">
        <h1 class="registration__title">Crear cuenta</h1>

        <fieldset class="registration__fieldset">
          <legend class="registration__legend">Datos del usuario</legend>
          <div class="registration__separator"></div>

          <div class="registration__row registration__row--two-columns">
            <div class="registration__field">
              <label for="nombre" class="registration__label">Nombre</label>
              <input
                v-model="registerData.name"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.name }"
                placeholder="Escribe tu nombre"
                id="nombre"
                required
              />
              <span v-if="errors.name" class="registration__error">{{
                errors.name
              }}</span>
            </div>

            <div class="registration__field">
              <label for="telefono" class="registration__label"
                >Número de teléfono</label
              >
              <input
                v-model="registerData.phone_number"
                type="tel"
                class="registration__input"
                :class="{ 'registration__input--error': errors.phone_number }"
                placeholder="+1 (555) 000-0000"
                id="telefono"
                required
              />
              <span v-if="errors.phone_number" class="registration__error">{{
                errors.phone_number
              }}</span>
            </div>

            <div class="registration__field">
              <label class="registration__label">Fecha de nacimiento</label>
              <UiDatePicker
                v-model="birthdateValue"
                :min-date="minBirthdate"
                :class="{ 'registration__input--error': errors.birthdate }"
                placeholder="15/06/1996"
                @update:model-value="handleBirthdateChange"
                @confirm="handleBirthdateConfirm"
              />
              <span v-if="errors.birthdate" class="registration__error">{{
                errors.birthdate
              }}</span>
            </div>

            <div class="registration__field">
              <label for="direccion" class="registration__label"
                >Dirección</label
              >
              <input
                v-model="registerData.address"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.address }"
                placeholder="Dirección"
                id="direccion"
                required
              />
              <span v-if="errors.address" class="registration__error">{{
                errors.address
              }}</span>
            </div>
          </div>

          <div class="registration__row registration__row--three-columns">
            <div class="registration__field">
              <label for="codigo-postal" class="registration__label"
                >Código Postal</label
              >
              <input
                v-model="registerData.postal_code"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.postal_code }"
                placeholder="000000"
                id="codigo-postal"
                required
              />
              <span v-if="errors.postal_code" class="registration__error">{{
                errors.postal_code
              }}</span>
            </div>

            <div class="registration__field">
              <label for="ciudad" class="registration__label">Ciudad*</label>
              <input
                v-model="registerData.city"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.city }"
                placeholder="Ciudad"
                id="ciudad"
                required
              />
              <span v-if="errors.city" class="registration__error">{{
                errors.city
              }}</span>
            </div>

            <div class="registration__field">
              <label for="pais" class="registration__label">País*</label>
              <input
                v-model="registerData.country"
                type="text"
                class="registration__input"
                :class="{ 'registration__input--error': errors.country }"
                placeholder="País"
                id="pais"
                required
              />
              <span v-if="errors.country" class="registration__error">{{
                errors.country
              }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="registration__fieldset">
          <legend class="registration__legend">Datos de la cuenta</legend>
          <div class="registration__separator"></div>

          <div class="registration__field">
            <label for="email" class="registration__label"
              >Correo Electrónico</label
            >
            <input
              v-model="registerData.email"
              type="email"
              class="registration__input"
              :class="{ 'registration__input--error': errors.email }"
              placeholder="Escribe tu correo electrónico"
              id="email"
              required
            />
            <span v-if="errors.email" class="registration__error">{{
              errors.email
            }}</span>
          </div>

          <div class="registration__row registration__row--two-columns">
            <div class="registration__field">
              <label for="password" class="registration__label"
                >Contraseña</label
              >
              <input
                v-model="registerData.password"
                type="password"
                class="registration__input"
                :class="{ 'registration__input--error': errors.password }"
                id="password"
                placeholder="Escribe tu contraseña"
                required
              />
              <span v-if="errors.password" class="registration__error">{{
                errors.password
              }}</span>
            </div>

            <div class="registration__field">
              <label for="confirmar-password" class="registration__label"
                >Confirmar Contraseña</label
              >
              <input
                v-model="registerData.passwordConfirmation"
                type="password"
                class="registration__input"
                :class="{
                  'registration__input--error': errors.passwordConfirmation,
                }"
                id="confirmar-password"
                placeholder="Escribe tu contraseña"
                name="passwordConfirmation"
                required
              />
              <span
                v-if="errors.passwordConfirmation"
                class="registration__error"
                >{{ errors.passwordConfirmation }}</span
              >
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          class="registration__button registration__button--primary"
          :disabled="isLoading"
        >
          Siguiente
        </button>

        <div class="registration__separator"></div>

        <p class="registration__login-prompt">
          <span class="registration__login-text">Ya tienes Cuenta? </span>
          <NuxtLink href="/pacientes/login" class="registration__login-link">
            Iniciar Sesión
          </NuxtLink>
        </p>
      </div>
    </form>
  </section>
</template>

<script lang="ts" setup>
import { useInsuranceAuth } from "~/composables/api/useInsuranceAuth";
import type { InsuranceRegisterData } from "~/types";

const { registerInsurance } = useInsuranceAuth();
const router = useRouter();

const isLoading = ref<boolean>(false);
interface InsuranceData extends InsuranceRegisterData {
  passwordConfirmation: string;
}

const registerData = ref<InsuranceData>({
  name: "",
  phone_number: "",
  birthdate: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});

const errors = ref({
  name: "",
  phone_number: "",
  birthdate: "",
  address: "",
  postal_code: "",
  city: "",
  country: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});

const birthdateValue = ref<Date | null>(null);

const minBirthdate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 120);
  return date;
});

const handleBirthdateChange = (date: Date | null) => {
  birthdateValue.value = date;
  if (date) {
    registerData.value.birthdate = date.toISOString().split("T")[0];
    validateField("birthdate", registerData.value.birthdate);
  } else {
    registerData.value.birthdate = "";
    validateField("birthdate", "");
  }
};

const handleBirthdateConfirm = (date: Date | null) => {
  console.log("Fecha confirmada:", date);
};

watch(
  () => registerData.value.birthdate,
  (newBirthdate) => {
    if (newBirthdate && !birthdateValue.value) {
      birthdateValue.value = new Date(newBirthdate);
    }
  },
  { immediate: true }
);

const validateField = (field: string, value: string) => {
  switch (field) {
    case "name":
      if (!value.trim()) {
        errors.value.name = "El nombre es obligatorio";
      } else if (value.trim().length < 2) {
        errors.value.name = "El nombre debe tener al menos 2 caracteres";
      } else {
        errors.value.name = "";
      }
      break;

    case "phone_number":
      if (!value.trim()) {
        errors.value.phone_number = "El número de teléfono es obligatorio";
      } else if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
        errors.value.phone_number = "Formato de teléfono inválido";
      } else {
        errors.value.phone_number = "";
      }
      break;

    case "birthdate":
      if (!value) {
        errors.value.birthdate = "La fecha de nacimiento es obligatoria";
      } else {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        const finalAge =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1
            : age;

        if (finalAge < 18) {
          errors.value.birthdate = "Debes ser mayor de 18 años";
        } else if (finalAge > 120) {
          errors.value.birthdate = "Fecha de nacimiento inválida";
        } else {
          errors.value.birthdate = "";
        }
      }
      break;

    case "address":
      if (!value.trim()) {
        errors.value.address = "La dirección es obligatoria";
      } else if (value.trim().length < 10) {
        errors.value.address = "La dirección debe tener al menos 10 caracteres";
      } else {
        errors.value.address = "";
      }
      break;

    case "postal_code":
      if (!value.trim()) {
        errors.value.postal_code = "El código postal es obligatorio";
      } else if (!/^\d{5,6}$/.test(value)) {
        errors.value.postal_code = "El código postal debe tener 5 o 6 dígitos";
      } else {
        errors.value.postal_code = "";
      }
      break;

    case "city":
      if (!value.trim()) {
        errors.value.city = "La ciudad es obligatoria";
      } else if (value.trim().length < 2) {
        errors.value.city = "La ciudad debe tener al menos 2 caracteres";
      } else {
        errors.value.city = "";
      }
      break;

    case "country":
      if (!value.trim()) {
        errors.value.country = "El país es obligatorio";
      } else if (value.trim().length < 2) {
        errors.value.country = "El país debe tener al menos 2 caracteres";
      } else {
        errors.value.country = "";
      }
      break;

    case "email":
      if (!value.trim()) {
        errors.value.email = "El correo electrónico es obligatorio";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value.email = "Formato de correo electrónico inválido";
      } else {
        errors.value.email = "";
      }
      break;

    case "password":
      if (!value) {
        errors.value.password = "La contraseña es obligatoria";
      } else if (value.length < 8) {
        errors.value.password =
          "La contraseña debe tener al menos 8 caracteres";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        errors.value.password =
          "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
      } else {
        errors.value.password = "";
      }
      break;

    case "passwordConfirmation":
      if (!value) {
        errors.value.passwordConfirmation = "Confirma tu contraseña";
      } else if (value !== registerData.value.password) {
        errors.value.passwordConfirmation = "Las contraseñas no coinciden";
      } else {
        errors.value.passwordConfirmation = "";
      }
      break;
  }
};

const handleRegister = async () => {
  Object.keys(errors.value).forEach((key) => {
    errors.value[key as keyof typeof errors.value] = "";
  });

  Object.keys(registerData.value).forEach((field) => {
    validateField(
      field,
      registerData.value[field as keyof typeof registerData.value]
    );
  });

  const hasErrors = Object.values(errors.value).some((error) => error !== "");
  if (hasErrors) {
    return;
  }

  isLoading.value = true;

  await registerInsurance(registerData.value)
    .request()
    .then(() => {
      localStorage.setItem("onboarding", "true");
      router.push("/");
    })
    .catch((error) => {
      console.error("Error en el registro:", error);

      if (error?.response?.data?.message) {
        alert("Error: " + error.response.data.message);
      } else if (error?.response?.status === 409) {
        errors.value.email = "Este correo electrónico ya está registrado";
      } else if (error?.response?.status === 422) {
        alert("Por favor, verifica los datos ingresados");
      } else {
        alert(
          "Ocurrió un error al crear la cuenta. Por favor, inténtalo de nuevo."
        );
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<style lang="scss" scoped>
.registration {
  &__form {
    width: 100%;
    max-width: 38.75rem;
  }

  &__title {
    @include text-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.4;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  &__legend {
    @include text-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.4;
    letter-spacing: -0.02em;
    color: #333333;
    margin-bottom: 0.5rem;
    padding: 0;
  }

  &__separator {
    background-color: #e1e4ed;
    height: 0.0625rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  &__row {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;

    &--two-columns {
      grid-template-columns: repeat(2, 1fr);

      @media (max-width: 48rem) {
        grid-template-columns: 1fr;
      }
    }

    &--three-columns {
      grid-template-columns: repeat(3, 1fr);

      @media (max-width: 48rem) {
        grid-template-columns: 1fr;
      }

      @media (min-width: 48.0625rem) and (max-width: 64rem) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.375rem;
    margin-bottom: 1rem;
  }

  &__label {
    @include form-label;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #344054;
  }

  &__input {
    @include input-base;
    padding: 0.625rem 0.875rem;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;
    width: 100%;

    &:hover {
      border: 1px solid $color-primary;
    }

    &--error {
      border-color: #dc2626;
      box-shadow: 0 0 0 0.1875rem rgba(220, 38, 38, 0.1);
    }
  }

  &__error {
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.25rem;
    font-weight: 400;
    line-height: 1rem;
  }

  &__button {
    width: 100%;
    margin-bottom: 1.5rem;

    &--primary {
      @include primary-button;
      padding: 1rem 1.75rem;
      border-radius: 1.25rem;
    }
  }

  &__login-prompt {
    text-align: center;
    margin: 0;
    padding: 1rem 0 0 0;
  }

  &__login-text {
    color: #6b7280;
    font-size: 0.875rem;
  }

  &__login-link {
    color: #1f2937;
    font-weight: 500;
    text-decoration: none;
    font-size: 0.875rem;

    &:hover {
      text-decoration: underline;
      color: #111827;
    }
  }
}

:deep(.date-picker__input-wrapper) {
  &.registration__input--error {
    .date-picker__input {
      border-color: #dc2626;
      box-shadow: 0 0 0 0.1875rem rgba(220, 38, 38, 0.1);
    }
  }
}

:deep(.date-picker__input-chevron) {
  display: none;
}

:deep(.date-picker__input-icon) {
  left: auto;
  right: 1.125rem;
}

:deep(.date-picker__input) {
  padding: 0.9375rem 2.25rem 0.9375rem 1.0625rem;
}
</style>
