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
      </div>
      <div v-if="errorText">
        <p>{{ errorText }}</p>
      </div>
    </form>
    <p class="text-center"><small class="text-muted">O Ingresa Con</small></p>
    <div class="text-center d-flex flex-column">
      <button class="btn btn-light border-dark-subtle mb-3">
        Ingresar con Google
      </button>
    </div>

    <div class="bottom-element">
      <button type="submit" class="btn btn-primary w-100 mt-4">Ingresar</button>

      <p class="text-center pt-2">
        <span class="text-muted">No tienes Cuenta? </span>
        <NuxtLink
          href="/pacientes/registro"
          class="btn-link text-dark fw-medium"
        >
          Registrate
        </NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup>
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
const email = ref("patient@gmail.com");
const password = ref("patient");
const errorText = ref(null);

const login = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/users/login",
    {
      method: "POST",
      body: {
        email,
        password,
      },
    },
  );
  if (data.value) {
    authenticated.value = true;
    token.value = data?.value?.data?.access_token;
    refreshToken.value = data?.value?.data?.refresh_token;
    role.value = data?.value?.data?.user_info.role;
    if (role.value === "R_PAT") {
      getUserInfo();
    } else if (role.value === "R_INS") {
      getInsuranceInfo();
    } else if (role.value === "R_HOS") {
      getHospitalInfo();
    } else {
      getDoctorInfo();
    }
  }
  if (error) {
    errorText.value = error.value.data.info;
  }
};

const getUserInfo = async () => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/patients/getByUser",
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    },
  );
  if (user) {
    user_info.value = user.value;
    router.push("/pacientes/inicio");
  }
};

const getInsuranceInfo = async () => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/insurances/get_insurance_info",
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    },
  );
  if (user) {
    user_info.value = user.value;
    router.push("/aseguradoras/inicio");
  }
};

const getHospitalInfo = async () => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/hospitals/get_hospital_info",
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    },
  );
  if (user) {
    user_info.value = user.value;
    router.push("/medicos/inicio");
  }
};

const getDoctorInfo = async () => {
  const { data: user } = await useFetch(
    config.public.API_BASE_URL + "/doctors/get_doctor_info",
    {
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
    },
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

NuxtLayout {
  position: relative;
  min-height: 100vh;
}

.bottom-element {
  position: absolute;
  bottom: 0;
  width: 87%;
}
</style>
