<script setup>
import { useStore } from "~/store";
const store = useStore();
const user = store.user;
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <p class="mb-0">Foto de Perfil</p>
    <p class="text-muted fw-light">
      Esta será la foto que vean tu pacientes cuando encuentren tu perfil en
      Vitalink
    </p>
    <form>
      <div>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/png, image/jpeg"
          class="form-control"
        />
      </div>
      <hr />
      <div class="form-group mb-3">
        <label for="descripcion" class="form-label text-capitalize"
          >Escribe una breve descripción profesional</label
        >
        <textarea
          name="descripcion"
          id="descripcion"
          cols="30"
          rows="3"
          class="form-control"
          :value="user.description"
          placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
        ></textarea>
      </div>
      <div class="form-group mb-3">
        <label for="matricula-medica" class="form-label text-capitalize"
          >Nº Matrícula Medica
        </label>
        <input
          type="text"
          name="matricula-medica"
          id="matricula-medica"
          :value="user.medical_license_number || user.medical_number"
          placeholder="Escribe el número de tu matrícula"
          class="form-control"
        />
      </div>
      <div class="mt-5">
        <button on-submit="" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
