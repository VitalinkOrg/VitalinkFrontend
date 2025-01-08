<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
const user_info = useCookie("user_info");
const router = useRouter();

const deleteAccount = async () => {
  const { data, error } = await useFetch(
    "https://stg.vitalink.cr" + "/patients/" + user_info.value.id,
    {
      method: "DELETE",
      headers: { Authorization: token.value },
    }
  );
  if (data) {
    token.value = null;
    refreshToken.value = null;
    role.value = null;
    authenticated.value = null;
    user_info.value = null;
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
