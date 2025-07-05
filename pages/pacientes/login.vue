<template>
  <NuxtLayout name="pacientes-autenticacion">
    <!-- Formulario principal con rol de formulario -->
    <form
      @submit.prevent="login"
      class="auth-form__main"
      role="form"
      aria-labelledby="login-heading"
    >
      <!-- Título del formulario -->
      <div class="login-header">
        <h1 id="login-heading" class="login-header__title">
          Ingrese a su cuenta
        </h1>
      </div>

      <!-- Grupo de campos -->
      <div class="auth-controls-group">
        <!-- Campo: Email o Cédula -->
        <div class="auth-field-group">
          <label for="email" class="auth-field-group__label"
            >Nº de Cédula o Correo electrónico</label
          >
          <input
            v-model="email"
            type="email"
            id="email"
            class="auth-field-group__input"
            placeholder="Escribe tu número de cédula o correo electrónico"
            required
            aria-required="true"
            :aria-invalid="!!errorText"
            autocomplete="username"
          />
        </div>

        <!-- Campo: Contraseña -->
        <div class="auth-field-group">
          <label for="password" class="auth-field-group__label"
            >Contraseña</label
          >
          <input
            v-model="password"
            type="password"
            id="password"
            class="auth-field-group__input"
            placeholder="Escribe tu contraseña"
            required
            aria-required="true"
            aria-describedby="passwordHelp"
            autocomplete="current-password"
            :aria-invalid="!!errorText"
          />
        </div>

        <!-- Mensaje de error accesible -->
        <div v-if="errorText" role="alert" aria-live="polite">
          <p class="text-danger">{{ errorText }}</p>
        </div>

        <!-- Inicio de sesión social -->
        <div class="text-center d-flex flex-column">
          <div class="auth-social-login">
            <p class="auth-social-login__label" id="social-login-label">
              <small>O hacerlo con:</small>
            </p>
            <button
              type="button"
              class="auth-social-login__auth-button"
              aria-labelledby="social-login-label google-login-label"
            >
              <AtomsIconsGoogleIcon />
              <span id="google-login-label">Ingresar con Google</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones del formulario -->
      <div class="auth-actions">
        <button
          type="submit"
          class="auth-submit-button"
          aria-label="Iniciar sesión"
        >
          Ingresar
        </button>

        <!-- Enlace de registro -->
        <div class="auth-footer-actions">
          <p class="auth-already-account" id="register-link-label">
            <span>¿No tienes cuenta?</span>
            <NuxtLink
              to="/pacientes/registro"
              class="auth-login-link"
              aria-describedby="register-link-label"
            >
              Regístrate
            </NuxtLink>
          </p>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>

<script setup>
import { jwtDecode } from "jwt-decode";
definePageMeta({
  middleware: ["auth-login"],
});

const config = useRuntimeConfig();
const router = useRouter();
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
const user_info = useCookie("user_info");
const email = ref("");
const password = ref("");
const errorText = ref(null);
const username = ref(null);

const login = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/auth/login",
    {
      method: "POST",
      body: {
        email,
        username,
        password,
      },
    }
  );
  if (data.value) {
    authenticated.value = true;
    token.value = data?.value?.data?.access_token;
    refreshToken.value = data?.value?.data?.refresh_token;
    // data?.value?.data?.user_info.role;

    const decodedToken = jwtDecode(token.value);
    const userId = decodedToken.id;
    role.value = decodedToken.role;

    if (decodedToken.role === "CUSTOMER") {
      getUserInfo(userId);
    } else if (decodedToken.role === "LEGAL_REPRESENTATIVE") {
      getDoctorInfo(userId);
    } else if (decodedToken.role === "FINANCE_ENTITY") {
      getFinanceEntityInfo(decodedToken);
    } else {
      getHospitalInfo(userId);
    }
  }
  if (error.value) {
    errorText.value = error.value.data.info;
  }
};

const getUserInfo = async (userId) => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/user/get?id=" + userId,
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    }
  );
  if (user) {
    user_info.value = user.value;
    router.push("/pacientes/inicio");
  }
};

const getFinanceEntityInfo = async (decodedToken) => {
  if (decodedToken) {
    user_info.value = decodedToken;
    router.push("/socio-financiero/inicio");
  }
};

const getHospitalInfo = async (userId) => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/hospitals/get_hospital_info",
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    }
  );
  if (user) {
    user_info.value = user.value;
    router.push("/medicos/inicio");
  }
};

const getDoctorInfo = async (userId) => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + +"/supplier/get?id=" + userId,
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    }
  );
  if (user) {
    user_info.value = user.value;
    router.push("/medicos/inicio");
  }
};
</script>

<style lang="scss" scoped>
.login-header {
  margin-bottom: 34px;
  &__title {
    font-family: $font-family-main;
    font-weight: 700;
    font-size: 24px;
    line-height: 100%;
    letter-spacing: 0%;
    vertical-align: middle;
    color: $color-foreground;
  }
}

.auth-social-login {
  &__label {
    @include label-base;
  }

  &__auth-button {
    @include outline-button;
    width: 100%;
    padding: 10px 16px;
    gap: 12px;
  }

  & > * + * {
    margin-top: 10px;
  }
}

.auth-form__main {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  .auth-controls-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex: 1;
    height: 100%;

    .auth-field-group {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;

      &__label {
        @include label-base;
      }

      &__input {
        @include input-base;
      }
    }
  }
}

.auth-actions {
  margin-top: auto;

  .auth-submit-button {
    @include primary-button;
    width: 100%;
  }

  .auth-footer-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 20px;

    .auth-already-account {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      font-family: $font-family-alt;
      font-weight: 400;
      font-size: 14px;
      color: $color-text-muted;
    }

    .auth-login-link {
      @include link-base;
      font-weight: 600;
      text-decoration: none;
      color: $color-primary;

      &:hover {
        text-decoration: underline;
        color: darken($color-primary, 10%);
      }
    }
  }
}
</style>
