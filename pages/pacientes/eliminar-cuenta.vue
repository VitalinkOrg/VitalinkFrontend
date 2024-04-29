<script setup>
import { useStore } from "~/store";
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const store = useStore();
const router = useRouter();

const { data: user, pending: pendingUser } = await useFetch(
  config.public.API_BASE_URL + "/patients/getByUser",
  {
    headers: { Authorization: token.value },
    transform: (_user) => _user.data,
  }
);
if (user) {
  store.user = user;
  useRefreshToken();
}

const deleteAccount = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/patients/" + store.user.id,
    {
      method: "DELETE",
      headers: { Authorization: token.value },
    }
  );
  if (data) {
    store.authenticated = false;
    store.user = null;
    store.role = "";
    token.value = null;
    router.push("/pacientes/login");
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <h4 class="fw-normal">¿Quieres borrar tu cuenta de Vitalink?</h4>
    <p class="text-secondary">
      Al eliminar la cuenta se borrará la totalidad de los contenidos y datos
      asociados a ella.
    </p>
    <div class="mt-5">
      <button class="btn btn-primary" @click="deleteAccount">
        Eliminar cuenta
      </button>
    </div>
  </NuxtLayout>
</template>
