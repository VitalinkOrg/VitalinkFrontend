<template>
  <NuxtLayout name="pacientes-login">
    <h1 class="fw-semibold fs-2">Ingrese a su cuenta</h1>
    <hr />
    <form @submit.prevent="login">
      <div class="form-group mb-4">
        <label for="email" class="form-label text-capitalize"
          >Correo Electrónico</label
        >
        <input
          v-model="email"
          type="email"
          class="form-control"
          placeholder="Escribe tu correo electrónico"
          name="email"
          required
        />
        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
      </div>
      <div class="form-group mb-4">
        <label for="password" class="form-label text-capitalize"
          >Contraseña</label
        >
        <input
          v-model="password"
          type="password"
          class="form-control"
          id="password"
          placeholder="Escribe tu contraseña"
          aria-describedby="passwordHelp"
          required
          name="password"
        />
        <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
      </div>
      <div v-if="errorText">
        <p class="text-danger">{{ errorText }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-100 mt-4">Ingresar</button>
    </form>
    <hr />
    <p class="text-center"><small class="text-muted">O Ingresa Con</small></p>
    <div class="text-center d-flex flex-column">
      <button class="btn btn-light border-dark-subtle mb-3">
        Ingresar con Facebook
      </button>
      <button class="btn btn-light border-dark-subtle mb-3">
        Ingresar con Google
      </button>
    </div>
    <p class="text-center">
      <span class="text-muted">No tienes Cuenta? </span>
      <NuxtLink href="/pacientes/registro" class="btn-link text-dark fw-medium"
        >Registrate</NuxtLink
      >
    </p>
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
main {
  height: 100vh;
}

.logo {
  width: 35%;
}

.left,
.right {
  width: 100%;
  height: 100%;
}

.left {
  background-color: #ebecf7;
  background-image: url("@/src/assets/bg-login.svg");
  background-size: cover;
  background-position: center center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
}

.right {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}
</style>
