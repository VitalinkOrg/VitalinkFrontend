<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <form class="mt-4" @submit.prevent="updateUser">
      <div>
        <p>
          Recibe notificaciones para estar al corriente de todo lo que surja.
        </p>
        <div
          class="form-check d-flex align-items-center justify-content-start gap-2 form-switch rounded-5 p-0 fw-light"
        >
          <input
            class="form-check-reverse form-check-input m-0"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
            v-model="isMapVisible"
          />
          <label class="form-check-label" for="flexSwitchCheckDefault"
            >Quiero recibir notificaciones</label
          >
        </div>
      </div>
      <div>
        <p class="mt-4">
          Cuando actives las siguientes notificaciones, recibirás una
          notificación directamente en tu perfil
        </p>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="defaultCheck1" />
          <label class="form-check-label text-secondary" for="defaultCheck1">
            Recibir notificaciones de citas confirmadas
          </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value=""
            id="defaultCheck2"
          />
          <label class="form-check-label text-secondary" for="defaultCheck2">
            Recibir notificaciones de citas canceladas
          </label>
        </div>
      </div>
      <div class="mt-5">
        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
