<template>
  <div class="form-container">
    <form @submit.prevent="handleNext" novalidate class="registro-form">
      <div class="registro-form__main">
        <label class="registro-form__title"
          >Completa los datos de registro</label
        >

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="documentType" class="registro-form__label">
              Tipo de documento de identidad
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />

                <div class="tooltip-content">
                  Selecciona el tipo de documento de identidad que utilizarás
                  para el registro
                </div>
              </div>
            </label>
            <UiDropdownBase
              :model-value="supplierFormData.documentType"
              :items="
                documentTypeOptions.map((s) => ({
                  value: s.code,
                  label: s.name,
                }))
              "
              :loading="isLoadingDocumentTypes"
              placeholder="Seleccione tipo de documento"
              @update:model-value="
                updateSupplierFormData({
                  ...supplierFormData,
                  documentType: ($event as string) ?? '',
                })
              "
            />
          </div>
          <div class="registro-form__group">
            <label for="documentNumber" class="registro-form__label"
              >Número de documento:</label
            >
            <input
              :value="supplierFormData.documentNumber"
              @input="
                updateSupplierFormData({
                  ...supplierFormData,
                  documentNumber: ($event.target as HTMLSelectElement).value,
                })
              "
              type="text"
              class="registro-form__input-text"
              placeholder="Ingrese su número de documento"
              id="documentNumber"
              required
            />
          </div>
        </div>

        <div class="registro-form__group">
          <label for="fullName" class="registro-form__label">
            Nombre y Apellidos / Razón Social (En caso de personas jurídicas)
          </label>
          <input
            :value="supplierFormData.fullName"
            @input="
              updateSupplierFormData({
                ...supplierFormData,
                fullName: ($event.target as HTMLSelectElement).value,
              })
            "
            type="text"
            class="registro-form__input-text"
            placeholder="Ingrese nombre completo o razón social"
            id="fullName"
            required
          />
        </div>

        <MedicosRegistroCargarArchivos
          label="Contrato"
          inputId="contact"
          :uploadedFile="supplierFormData.contratcFile"
          @update:file="
            updateSupplierFormData({
              ...supplierFormData,
              contratcFile: $event,
            })
          "
        />

        <hr class="registro-form__divider" />

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="email" class="registro-form__label">
              Correo Electrónico
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />

                <div class="tooltip-content">
                  Utiliza un correo electrónico válido. Recibirás notificaciones
                  importantes en esta dirección.
                </div>
              </div>
            </label>
            <input
              :value="supplierFormData.email"
              @input="
                updateSupplierFormData({
                  ...supplierFormData,
                  email: ($event.target as HTMLSelectElement).value,
                })
              "
              type="email"
              class="registro-form__input-text"
              placeholder="Escribe tu correo electrónico"
              id="email"
              required
            />
          </div>
          <div class="registro-form__group">
            <label for="confirmEmail" class="registro-form__label"
              >Confirmar Correo Electrónico</label
            >
            <input
              :value="confirmEmail"
              @input="confirmEmail = ($event.target as HTMLSelectElement).value"
              type="email"
              class="registro-form__input-text"
              placeholder="Confirma tu correo electrónico"
              id="confirmEmail"
              required
            />
            <div v-if="emailMismatch" class="registro-form__error-message">
              Los correos electrónicos no coinciden
            </div>
          </div>
        </div>

        <div class="registro-form__group">
          <label for="phone" class="registro-form__label"
            >Teléfono de contacto</label
          >
          <input
            :value="supplierFormData.phone"
            @input="
              updateSupplierFormData({
                ...supplierFormData,
                phone: ($event.target as HTMLSelectElement).value,
              })
            "
            type="tel"
            class="registro-form__input-text"
            placeholder="(506) 0000-0000"
            id="phone"
            required
          />
        </div>

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="password" class="registro-form__label">
              Contraseña Nueva
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />

                <div class="tooltip-content">
                  La contraseña debe tener al menos 8 caracteres
                </div>
              </div>
            </label>
            <input
              :value="supplierFormData.password"
              @input="
                updateSupplierFormData({
                  ...supplierFormData,
                  password: ($event.target as HTMLSelectElement).value,
                })
              "
              type="password"
              class="registro-form__input-text"
              placeholder="Ingrese su contraseña"
              id="password"
              required
            />
          </div>
          <div class="registro-form__group">
            <label for="confirmPassword" class="registro-form__label"
              >Confirmar Contraseña</label
            >
            <input
              :value="confirmPassword"
              @input="
                confirmPassword = ($event.target as HTMLSelectElement).value
              "
              type="password"
              class="registro-form__input-text"
              placeholder="Confirma tu contraseña"
              id="confirmPassword"
              required
            />
            <div v-if="passwordMismatch" class="registro-form__error-message">
              Las contraseñas no coinciden
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="registro-form__button-next"
          :disabled="!isStep1Valid"
        >
          Paso 2: Agregar médicos relacionados
        </button>
      </div>
    </form>

    <div class="auth-footer-actions">
      <p class="auth-already-account" id="register-link-label">
        <span>Ya tienes cuenta?</span>
        <NuxtLink
          to="/medicos/login"
          class="auth-login-link"
          aria-describedby="register-link-label"
        >
          Iniciar sesión
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import type { IdType, ISupplierFormData } from "@/types";

interface Props {
  supplierFormData: ISupplierFormData;
}

interface Emits {
  (e: "update:supplierFormData", value: ISupplierFormData): void;
  (e: "next"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();

const confirmEmail = ref<string>("");
const confirmPassword = ref<string>("");
const documentTypeOptions = ref<IdType[]>([]);
const isLoadingDocumentTypes = ref<boolean>(false);

const emailMismatch = computed(() => {
  return (
    props.supplierFormData.email.trim() !== "" &&
    props.supplierFormData.email !== confirmEmail.value &&
    confirmEmail.value !== ""
  );
});

const passwordMismatch = computed(() => {
  return (
    props.supplierFormData.password.trim() !== "" &&
    props.supplierFormData.password !== confirmPassword.value &&
    confirmPassword.value !== ""
  );
});

const isStep1Valid = computed(() => {
  return (
    props.supplierFormData.documentType.trim() !== "" &&
    props.supplierFormData.documentNumber.trim() !== "" &&
    props.supplierFormData.fullName.trim() !== "" &&
    props.supplierFormData.contratcFile !== null &&
    props.supplierFormData.email.trim() !== "" &&
    props.supplierFormData.phone.trim() !== "" &&
    props.supplierFormData.password.trim() !== "" &&
    !emailMismatch.value &&
    !passwordMismatch.value
  );
});

const updateSupplierFormData = (newData: ISupplierFormData) => {
  emit("update:supplierFormData", { ...newData });
};

const loadIdType = async () => {
  try {
    isLoadingDocumentTypes.value = true;
    const api = fetchUdc("ID_TYPE", {}, { authRequired: false });
    await api.request();

    const response = api.response.value;
    if (response && response.data) {
      documentTypeOptions.value = response.data;
    }
  } catch (error) {
    console.error("Error loading document type options:", error);
    documentTypeOptions.value = [];
  } finally {
    isLoadingDocumentTypes.value = false;
  }
};

const handleNext = () => {
  if (isStep1Valid.value) {
    emit("next");
  }
};

onMounted(async () => {
  await loadIdType();
});
</script>

<style lang="scss" scoped>
.form-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.registro-form {
  flex: 1;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
    @include space-y(1.25rem);
  }

  &__title {
    @include label-base;
    font-size: 0.9375rem;
    color: #353e5c;
    font-weight: 600;
  }

  &__row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 48rem) {
      flex-direction: column;
    }
  }

  &__group {
    flex: 1;
    @include space-y(0.375rem);
  }

  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    max-height: 1.25rem;
  }

  &__input-text,
  &__input-select {
    @include input-base;
    width: 100%;
    margin-top: 0.375rem;
  }

  &__button-next {
    @include primary-button;
    margin-top: 1.25rem;
  }

  &__error-message {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
}

.tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;

  .tooltip-trigger {
    cursor: help;
    color: #6b7280;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }

  .tooltip-content {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: $white;
    padding: 0.625rem 0.875rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 400;
    max-width: 17.5rem;
    white-space: normal;
    line-height: 1.4;
    z-index: 1000;
    box-shadow:
      0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1),
      0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);

    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 0.375rem solid transparent;
      border-bottom-color: #1f2937;
    }

    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(-0.3125rem);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  .tooltip-content {
    &.tooltip-left {
      left: 0;
      transform: translateX(0);

      &::before {
        left: 1.25rem;
        transform: translateX(0);
      }

      &:hover {
        transform: translateX(0) translateY(0);
      }
    }

    &.tooltip-right {
      right: 0;
      left: auto;
      transform: translateX(0);

      &::before {
        right: 1.25rem;
        left: auto;
        transform: translateX(0);
      }

      &:hover {
        transform: translateX(0) translateY(0);
      }
    }
  }

  @media (max-width: 48rem) {
    .tooltip-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: calc(100vw - 2.5rem);

      &::before {
        display: none;
      }

      &:hover {
        transform: translate(-50%, -50%);
      }
    }
  }
}

.auth-footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding: 1.25rem 0;

  .auth-already-account {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  .auth-login-link {
    @include link-base;
    font-weight: 600;
    text-decoration: none;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: $color-primary-darkened-10;
    }
  }
}
</style>
