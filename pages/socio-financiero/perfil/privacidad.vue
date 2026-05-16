<script lang="ts" setup>
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/composables/api";

useSeoMeta({
  title: "Privacidad y Seguridad — Vitalink Seguros",
  description:
    "Actualiza tu correo y contraseña de acceso a tu cuenta de socio financiero.",
  ogTitle: "Privacidad y Seguridad — Vitalink Seguros",
  ogDescription:
    "Actualiza tu correo y contraseña de acceso a tu cuenta de socio financiero.",
});

definePageMeta({
  middleware: ["auth-insurances"],
});

const { updateUser } = useAuth();
const { getToken } = useAuthToken();
const { getUserInfo, setUserInfo } = useUserInfo();
const { show: showToast } = useToast();
const logger = useLogger("SocioPerfilPrivacidad");

const { id: userId } = jwtDecode<DecodedToken>(getToken()!);

const email = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const initializeForm = () => {
  const userInfo = getUserInfo() as IUser | null;
  email.value = userInfo?.email ?? "";
};

const handleSubmit = async () => {
  if (!userId) {
    showToast("No se encontró la información del usuario", "error");
    return;
  }

  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    showToast("Las contraseñas no coinciden", "error");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: IUserUpdateRequest = {
      email: email.value.trim(),
      ...(newPassword.value && { password: newPassword.value }),
    };

    logger.debug("updateUser payload", { userId, payload });

    const { data, error } = await updateUser(userId, payload);

    if (error) {
      showToast(error.info || "Error al actualizar", "error");
      return;
    }

    if (data) {
      setUserInfo({ ...getUserInfo(), ...data });
    }

    newPassword.value = "";
    confirmPassword.value = "";
    showToast("Información actualizada exitosamente", "success");
  } catch {
    showToast("Error inesperado al actualizar", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  initializeForm();
});
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <h4 class="privacy-form__title">
      Privacidad y Seguridad
    </h4>

    <form
      class="privacy-form"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <p class="privacy-form__description">
        Administra tu correo electrónico, contraseña y preferencias de inicio de
        sesión.
      </p>

      <!-- Email -->
      <div class="privacy-form__section">
        <p class="privacy-form__section-title">
          Email y contraseña
        </p>

        <div class="privacy-form__row privacy-form__row--columns-1">
          <div class="privacy-form__field">
            <label
              for="email"
              class="privacy-form__label"
            >
              Correo electrónico*
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="privacy-form__input"
              placeholder="correo@ejemplo.com"
              name="email"
              autocomplete="email"
              required
            >
          </div>
        </div>

        <div class="privacy-form__row privacy-form__row--columns-2">
          <div class="privacy-form__field">
            <label
              for="new-password"
              class="privacy-form__label"
            >
              Nueva contraseña
            </label>
            <div class="privacy-form__password-group">
              <input
                id="new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="privacy-form__input privacy-form__password-input"
                placeholder="Dejar en blanco para no cambiar"
                name="new-password"
                autocomplete="new-password"
              >
              <button
                type="button"
                class="privacy-form__password-toggle"
                :aria-label="showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showNewPassword = !showNewPassword"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <template v-if="showNewPassword">
                    <path
                      d="M2 2L18 18M8.68 8.69A3 3 0 0011.32 11.31M6.09 6.1A7.96 7.96 0 002 10c1.73 3.3 5.14 5.5 8 5.5a7.93 7.93 0 003.4-.76M9.88 4.54C9.58 4.52 9.29 4.5 9 4.5c-3.53 0-6.69 2.14-8 5.5a8.37 8.37 0 001.63 2.47M13.91 13.91A7.96 7.96 0 0018 10c-1.31-3.36-4.47-5.5-8-5.5-.67 0-1.32.08-1.94.22"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </template>
                  <template v-else>
                    <path
                      d="M10 4.5C6.47 4.5 3.31 6.64 2 10c1.31 3.36 4.47 5.5 8 5.5s6.69-2.14 8-5.5c-1.31-3.36-4.47-5.5-8-5.5zM10 13a3 3 0 110-6 3 3 0 010 6z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </template>
                </svg>
              </button>
            </div>
          </div>

          <div class="privacy-form__field">
            <label
              for="confirm-password"
              class="privacy-form__label"
            >
              Confirmar contraseña
            </label>
            <div class="privacy-form__password-group">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="privacy-form__input privacy-form__password-input"
                placeholder="Repetir nueva contraseña"
                name="confirm-password"
                autocomplete="new-password"
              >
              <button
                type="button"
                class="privacy-form__password-toggle"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <template v-if="showConfirmPassword">
                    <path
                      d="M2 2L18 18M8.68 8.69A3 3 0 0011.32 11.31M6.09 6.1A7.96 7.96 0 002 10c1.73 3.3 5.14 5.5 8 5.5a7.93 7.93 0 003.4-.76M9.88 4.54C9.58 4.52 9.29 4.5 9 4.5c-3.53 0-6.69 2.14-8 5.5a8.37 8.37 0 001.63 2.47M13.91 13.91A7.96 7.96 0 0018 10c-1.31-3.36-4.47-5.5-8-5.5-.67 0-1.32.08-1.94.22"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </template>
                  <template v-else>
                    <path
                      d="M10 4.5C6.47 4.5 3.31 6.64 2 10c1.31 3.36 4.47 5.5 8 5.5s6.69-2.14 8-5.5c-1.31-3.36-4.47-5.5-8-5.5zM10 13a3 3 0 110-6 3 3 0 010 6z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </template>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="privacy-form__actions">
        <button
          type="submit"
          class="privacy-form__button privacy-form__button--primary"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          <template v-if="isSubmitting">
            <span
              class="privacy-form__spinner"
              aria-hidden="true"
            />
            Actualizando...
          </template>
          <template v-else>
            Guardar Cambios
          </template>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.privacy-form {
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
    }

    @include respond-to-max(sm) {
      font-size: 1.25rem;
    }
  }

  &__description {
    font-size: 0.9375rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.5rem;
  }

  &__section {
    margin-bottom: 1.5rem;
  }

  &__section-title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: #374151;
    margin-bottom: 1rem;
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
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @include respond-to-max(md) {
      gap: 0.375rem;
    }
  }

  &__label {
    @include form-label;
  }

  &__input {
    @include input-base;
  }

  &__password-group {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__password-input {
    flex: 1;
    padding-right: 3rem;
  }

  &__password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: color 0.15s ease;

    &:hover {
      color: #374151;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-start;

    @include respond-to-max(md) {
      margin-top: 1.5rem;
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
</style>
