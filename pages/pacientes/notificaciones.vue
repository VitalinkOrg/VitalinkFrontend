<script setup>
import { useStore } from "~/store";
definePageMeta({
  middleware: ["auth-pacientes"],
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <form class="mt-4" @submit.prevent="updateUser">
      <div>
        <p>Recibe notificaciones para estar al corriente de todo lo que surja.</p>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio1"
            value="option1"
          />
          <label class="form-check-label text-secondary" for="inlineRadio1">Activado</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id="inlineRadio2"
            value="option2"
          />
          <label class="form-check-label text-secondary" for="inlineRadio2">Desactivado</label>
        </div>
      </div>
      <div>
        <p class="mt-4">Cuando actives las siguientes notificaciones, recibirás una notificación directamente en tu perfil</p>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            id="defaultCheck1"
          />
          <label class="form-check-label text-secondary" for="defaultCheck1">
            Citas creadas exitosamente
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
            Citas canceladas
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
            Nuevas disponibilidades de tu centro médico
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
            Voucher Request Aceptado
          </label>
        </div>
      </div>
      <div class="mt-5">
        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
