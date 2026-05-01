<template>
  <NuxtLayout name="medicos-autenticacion">
    <section class="registration" aria-labelledby="registration-heading">
      <template v-if="!registrationComplete">
        <HeaderRegistro />

        <form
          @submit.prevent="submitRegistration"
          class="registration__form"
          novalidate
        >
          <div class="registration__step">
            <MedicosRegistroFormularioProveedorMedico
              :form-data="representativeFormData"
              :is-submitting="isSubmitting"
              @update:form-data="representativeFormData = $event"
              @submit="submitRegistration"
            />
          </div>
        </form>
      </template>

      <div v-else class="registration__confirmation">
        <div class="confirmation-message">
          <div class="confirmation-message__icon" aria-hidden="true">
            <AtomsIconsCheckIcon size="32" />
          </div>
          <h1 class="confirmation-message__title">
            ¡Registro completado!
          </h1>
          <p class="confirmation-message__description">
            Tu cuenta ha sido creada exitosamente. Te hemos enviado un correo
            electrónico a <strong>{{ representativeFormData.email }}</strong> con
            un enlace para confirmar tu dirección.
          </p>
          <p class="confirmation-message__note">
            Por favor revisa tu bandeja de entrada (y carpeta de spam) y sigue
            las instrucciones del correo para activar tu cuenta.
          </p>
          <div class="confirmation-message__actions">
            <NuxtLink to="/medicos/login" class="confirmation-message__button">
              Ir a iniciar sesión
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Registro Médico — Vitalink",
  description: "Regístrate como proveedor de salud en la plataforma Vitalink.",
  ogTitle: "Registro Médico — Vitalink",
  ogDescription: "Regístrate como proveedor de salud en la plataforma Vitalink.",
});

import { useAuth } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";

const { register } = useAuth();
const { convertCedulaForBackend } = useFormat();
const toast = useToast();
const logger = useLogger("RegistroMedico");

const isSubmitting = ref(false);
const registrationComplete = ref(false);

const representativeFormData = ref<IRepresentativeRegisterRequest>({
  documentType: "",
  documentNumber: "",
  fullName: "",
  contractFile: null,
  email: "",
  phone: "",
  password: "",
});

const submitRegistration = async (): Promise<void> => {
  if (isSubmitting.value) return;

  const formData = representativeFormData.value;

  if (!formData.contractFile) {
    toast.error("El archivo de contrato es requerido.");
    return;
  }

  isSubmitting.value = true;

  try {
    const backendDocumentNumber = convertCedulaForBackend(
      formData.documentNumber,
      formData.documentType,
    );

    const { data, error } = await register({
      card_id: backendDocumentNumber,
      id_type: formData.documentType,
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      gender: "M",
      role_code: "LEGAL_REPRESENTATIVE",
      phone_number: formData.phone,
      country_iso_code: "",
      province: "",
      city_name: "",
      address: "",
      postal_code: "",
      birth_date: "",
      profile_picture_url: "",
    });

    if (error) {
      const isDuplicate =
        error.status?.http_code === 409 ||
        error.info?.toLowerCase().includes("duplicate entry") ||
        error.info?.toLowerCase().includes("ya existe");

      toast.error(
        isDuplicate
          ? "Este usuario ya está registrado. Por favor inicia sesión."
          : error.info || "Error al registrar el representante legal.",
      );
      return;
    }

    logger.debug("Representative registered", { id: (data as any)?.id });
    registrationComplete.value = true;
  } catch (error) {
    logger.error("Registration failed", { error });
    toast.error("Error en el registro. Intenta nuevamente.");
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style lang="scss" scoped>
.registration {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 0;

  &__form {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__step {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__confirmation {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.confirmation-message {
  text-align: center;
  padding: 1rem 0;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4.5rem;
    height: 4.5rem;
    background: linear-gradient(135deg, #d3f2dd 0%, #a7e9ba 100%);
    border-radius: 50%;
    margin: 0 auto 1.5rem;

    svg {
      color: #0e7d3a;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-foreground;
    margin-bottom: 1rem;
  }

  &__description {
    font-family: $font-family-main;
    font-size: 1rem;
    color: $color-text-muted;
    line-height: 1.7;
    margin: 0 0 1rem 0;
  }

  &__note {
    font-family: $font-family-main;
    font-size: 0.875rem;
    color: $color-text-secondary;
    line-height: 1.5;
    margin: 0 0 2rem 0;
    padding: 1rem;
    background-color: #fffbeb;
    border-radius: 0.5rem;
    border-left: 3px solid #f59e0b;
  }

  &__actions {
    margin-top: 2rem;
  }

  &__button {
    @include primary-button;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
