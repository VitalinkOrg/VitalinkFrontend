<script setup>
import { useStore } from "~/store";
const store = useStore();
const user = store.user;
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <h4 class="fw-normal">Datos Personales</h4>
    <form class="mt-4">
      <div class="row row-cols-2">
        <div class="form-group mb-3">
          <label for="nombre" class="form-label text-capitalize"
            >Nombre (s)</label
          >
          <input
            type="text"
            class="form-control"
            placeholder="Escribe tu nombre"
            :value="user.first_name || user.name"
            name="nombre"
            id="nombre"
          />
        </div>
        <div class="form-group mb-3">
          <label for="apellido" class="form-label text-capitalize"
            >Apellido (s)</label
          >
          <input
            type="text"
            class="form-control"
            placeholder="Escribe tu apellido"
            :value="user.last_name"
            id="apellido"
            name="apellido"
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="telefono"
            >Número de teléfono</label
          >
          <input
            type="phone"
            placeholder="00000000"
            :value="user.phone_number || user.phone_number_1"
            id="telefono"
            name="telefono"
            class="form-control"
          />
        </div>
        <div class="form-group mb-3">
          <label
            for="direccion"
            class="form-label text-capitalize"
            name="direccion"
            >Dirección</label
          >
          <input
            type="text"
            placeholder="Dirección"
            id="direccion"
            :value="user.address"
            name="direccion"
            class="form-control"
          />
        </div>
      </div>
      <div class="row row-cols-3">
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="postal"
            >Código Postal</label
          >
          <input
            type="number"
            placeholder="00000000"
            id="postal"
            name="postal"
            class="form-control"
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="ciudad">Ciudad*</label>
          <input
            type="text"
            placeholder="Ciudad"
            id="ciudad"
            name="ciudad"
            :value="user.city"
            class="form-control"
            required
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="pais">País</label>
          <input
            type="text"
            placeholder="País"
            id="pais"
            name="pais"
            :value="user.country_iso_code"
            class="form-control"
            required
          />
        </div>
      </div>
      <div class="mt-5">
        <button on-submit="" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
