<script setup>
import { useStore } from "~/store";
const store = useStore();
const user = store.user;
</script>
<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <!-- Educacion -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Educación o Estudios</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="updateEducacion[0].open = true"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>
    <div v-if="user.degrees && user.degrees.length">
      <div
        v-for="degree in user.degrees"
        :key="degree.id"
        class="card rounded-4 mb-3"
      >
        <div class="card-body d-flex">
          <div class="w-100">
            <p class="text-info fw-medium m-0">
              {{ new Date(degree.start_date).toLocaleDateString() }} -
              {{ new Date(degree.end_date).toLocaleDateString() }}
            </p>
            <p class="fw-light fs-5 mb-1">{{ degree.degree }}</p>
            <p class="m-0 fw-light text-muted">
              {{ degree.university }}
            </p>
            <p class="m-0 fw-light text-muted">
              {{ degree.city + ", " + degree.country }}
            </p>
          </div>
          <div class="d-flex align-items-start">
            <button class="btn btn-light bg-white border">
              <AtomsIconsEditPencilIcon />
            </button>
            <button class="btn btn-light bg-white border ms-2">
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="card rounded-5 mb-3 bg-primary border-0"
      style="--bs-bg-opacity: 0.05"
    >
      <div class="card-body text-center py-5">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
        />
        <div class="row">
          <div class="col-sm-6 mx-auto">
            <p class="fw-light text-muted my-3">
              Aún no tienes educación o estudios en tu perfil. Añade
              certificaciones para demostrar credibilidad a tus pacientes.
            </p>
            <button
              class="btn btn-primary"
              @click="updateExperiencia[0].open = true"
            >
              Agregar Educación o Estudios
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Experiencia  -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Experiencia</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="updateExperiencia[0].open = true"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>

    <!-- Cuando hay datos  -->
    <div v-if="user.experiences && user.experiences.length">
      <div
        v-for="experience in user.experiences"
        :key="experience.id"
        class="card rounded-4 mb-3"
      >
        <div class="card-body d-flex">
          <div class="w-100">
            <p class="text-info fw-medium m-0">
              {{ new Date(experience.start_date).toLocaleDateString() }} -
              {{ new Date(experience.end_date).toLocaleDateString() }}
            </p>
            <p class="fw-light fs-5 mb-1">
              {{ experience.position }}
            </p>
            <p class="m-0 fw-light text-muted">{{ experience.hospital }}</p>
            <p class="m-0 fw-light text-muted">
              {{ experience.city + ", " + experience.country }}
            </p>
          </div>
          <div class="d-flex align-items-start">
            <button class="btn btn-light bg-white border">
              <AtomsIconsEditPencilIcon />
            </button>
            <button class="btn btn-light bg-white border ms-2">
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="card rounded-5 mb-3 bg-primary border-0"
      style="--bs-bg-opacity: 0.05"
    >
      <div class="card-body text-center py-5">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
        />
        <div class="row">
          <div class="col-sm-6 mx-auto">
            <p class="fw-light text-muted my-3">
              Aún no tienes certificaciones en tu perfil. Añade certificaciones
              para demostrar credibilidad a tus pacientes.
            </p>
            <button
              class="btn btn-primary"
              @click="updateExperiencia[0].open = true"
            >
              Agregar Experiencia
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Idiomas -->

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Idiomas</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="updateIdioma[0].open = true"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>
    <div v-if="user.languages && user.languages.length">
      <div
        v-for="language in user.languages"
        :key="language.id"
        class="card rounded-4 mb-3"
      >
        <div class="card-body d-flex align-items-center">
          <div class="w-100">
            <span class="fw-medium m-0 fs-5 me-3">{{
              language.language_code
            }}</span>
            <span class="fw-light fs-5 text-muted">{{
              language.skill_level
            }}</span>
          </div>
          <div class="d-flex align-items-start">
            <button class="btn btn-light bg-white border">
              <AtomsIconsEditPencilIcon />
            </button>
            <button class="btn btn-light bg-white border ms-2">
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="card rounded-5 mb-3 bg-primary border-0"
      style="--bs-bg-opacity: 0.05"
    >
      <div class="card-body text-center py-5">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
        />
        <div class="row">
          <div class="col-sm-6 mx-auto">
            <p class="fw-light text-muted my-3">
              Aún no tienes idiomas en tu perfil. Añade
              certificaciones para demostrar credibilidad a tus pacientes.
            </p>
            <button
              class="btn btn-primary"
              @click="updateExperiencia[0].open = true"
            >
              Agregar Idiomas
            </button>
          </div>
        </div>
      </div>
    </div>

    <MedicosEducacion />
    <MedicosExperienciaTrabajo />
    <MedicosIdioma />
  </NuxtLayout>
</template>
