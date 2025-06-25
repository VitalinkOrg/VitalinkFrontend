<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white border-bottom navbar-custom"
  >
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarTogglerDemo03"
        aria-controls="navbarTogglerDemo03"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <NuxtLink class="navbar-brand" href="/">
        <img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink" />
      </NuxtLink>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0 nav-list">
          <li class="nav-item">
            <NuxtLink href="/" class="nav-link" active-class="active"
              >Home</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/registro" class="nav-link"
              >¿Eres paciente?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="/medicos/registro" class="nav-link"
              >¿Eres profesional médico?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="/socio-financiero/registro" class="nav-link"
              >¿Eres aseguradora?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">Nosotros</NuxtLink>
          </li>
        </ul>
        <div v-if="!authenticated" class="auth-buttons">
          <NuxtLink href="/pacientes/login" class="btn-custom-secondary"
            >Ingresar</NuxtLink
          >
          <NuxtLink href="/pacientes/registro" class="btn-custom-primary"
            >Registrarse</NuxtLink
          >
        </div>
        <div class="logout-button" v-if="authenticated">
          <button @click="logout" class="btn btn-primary">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
const user_info = useCookie("user_info");
const router = useRouter();

const logout = () => {
  token.value = null;
  refreshToken.value = null;
  role.value = null;
  authenticated.value = null;
  user_info.value = null;
  router.push("/pacientes/login");
};
</script>

<style lang="scss" scoped>
.navbar-custom {
  padding: 25.21px 60px;
  background-color: #ffffff;
  box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.08);

  .navbar-brand {
    width: 135px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .nav-list {
    display: flex;
    gap: 25px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-link {
    font-family: "Montserrat", sans-serif;
    font-weight: 300;
    font-size: 14.7px;
    line-height: 23.1px;
    letter-spacing: 0;
    color: #353e5c;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease-in-out;

    &:hover,
    &.active {
      color: darken(#353e5c, 12%);
    }
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logout-button {
    display: flex;
    align-items: center;
  }

  @media (max-width: 992px) {
    padding: 15px 30px;

    .nav-list {
      flex-direction: column;
      align-items: center;
      gap: 10px;

      margin: 10px 0;
    }

    .auth-buttons {
      flex-direction: column;
      width: 100%;
      gap: 10px;
    }

    .btn-custom-secondary,
    .btn-custom-primary {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .navbar-brand {
      width: 90px;
      height: auto;
    }

    .nav-link {
      font-size: 14px;
      padding: 6px 12px;
    }

    .btn-custom-secondary,
    .btn-custom-primary {
      font-size: 13px;
      padding: 8px 12px;
    }
  }

  @media (max-width: 576px) {
    padding: 12px 20px;

    .nav-link {
      font-size: 13px;
    }

    .btn-custom-secondary,
    .btn-custom-primary {
      font-size: 12px;
      padding: 6px 10px;
    }
  }
}

.btn-custom-secondary,
.btn-custom-primary {
  padding: 10px 16px;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0;
  color: #344054;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  border: 1px solid #d0d5dd;
  background-color: #ffffff;
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.1);
}

.btn-custom-secondary:hover {
  background-color: #fcfcfc;
  border-color: #c5c5c5;
}

.btn-custom-primary {
  border: 1px solid #3541b4;
  background-color: #3541b4;
  color: #ffffff;

  &:hover {
    background-color: darken(#3541b4, 4%);
    border-color: darken(#3541b4, 4%);
  }
}
</style>
