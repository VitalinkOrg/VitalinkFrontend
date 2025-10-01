<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white border-bottom navbar-custom"
  >
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="'#navbarTogglerDemo03'"
        aria-controls="navbarTogglerDemo03"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <NuxtLink class="navbar-brand" to="/">
        <img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink" />
      </NuxtLink>

      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0 nav-list">
          <li class="nav-item">
            <NuxtLink to="/" class="nav-link" active-class="active"
              >Home</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink
              to="/pacientes/registro"
              class="nav-link"
              active-class="active"
              >¿Eres paciente?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink
              to="/medicos/registro"
              class="nav-link"
              active-class="active"
              >¿Eres profesional médico?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink
              to="/socio-financiero/registro"
              class="nav-link"
              active-class="active"
              >¿Eres aseguradora?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink to="" class="nav-link" active-class="active"
              >Nosotros</NuxtLink
            >
          </li>
        </ul>

        <div
          v-if="!authenticated"
          class="auth-buttons d-flex align-items-center gap-3"
        >
          <NuxtLink
            to="/pacientes/login"
            class="btn btn-outline-primary btn-custom-secondary"
          >
            Ingresar
          </NuxtLink>
          <NuxtLink
            to="/pacientes/registro"
            class="btn btn-primary btn-custom-primary"
          >
            Registrarse
          </NuxtLink>
        </div>

        <div v-if="authenticated" class="logout-button">
          <button @click="handleLogout" class="btn btn-primary">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useAuth } from "@/composables/api";

const { authenticated } = useAuthState();
const { logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push("/pacientes/login");
};
</script>

<style lang="scss" scoped>
.navbar-custom {
  padding: 22.5px 60px;
  background-color: #ffffff;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.08);

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
    justify-content: center;
  }

  .nav-link {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 14.7px;
    line-height: 23.1px;
    letter-spacing: 0;
    color: #353e5c;
    padding: 8px 16px;
    border-radius: $border-radius-md;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease-in-out;

    display: block;
    white-space: normal;
    text-align: center;
    padding: 8px 16px;

    @supports (text-wrap: balance) {
      white-space: unset;
      text-wrap: balance;
    }

    &:hover {
      color: darken($color: #353e5c, $amount: 12%);
      background: rgba(226, 228, 250, 0.15);
    }

    &.active {
      background: rgba(226, 228, 250, 0.3);
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

  @media (min-width: 993px) and (max-width: 1340px) {
    padding: 15px 30px;

    .nav-link {
      font-size: 13.5px;
    }

    .nav-list {
      gap: 8px;
    }
  }

  @media (max-width: 991px) {
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

.btn-custom-secondary {
  @include outline-button;
  padding: 10px 16px;
  font-size: 14px;
}

.btn-custom-primary {
  @include primary-button;
  padding: 10px 16px;
  font-size: 14px;
}
</style>
