<script setup>
// Mock user info data
const mockUserInfo = {
  id: "doc-12345",
  name: "Dr. Juan Pérez",
  email: "juan.perez@example.com",
  specialties_names: ["Cardiología", "Medicina General"],
  services_names: [
    "Consulta general",
    "Electrocardiograma",
    "Prueba de esfuerzo",
  ],
};

// Use the mock data if in development, otherwise use the real cookie
const user_info = process.dev ? ref(mockUserInfo) : useCookie("user_info");

// State for specialties
const newSpecialty = ref("");
const showSpecialtyInput = ref(false);

// State for services
const newService = ref("");
const showServiceInput = ref(false);

// Specialty Functions
const addSpecialty = () => (showSpecialtyInput.value = true);

const saveSpecialty = () => {
  if (newSpecialty.value.trim()) {
    if (!user_info.value.specialties_names) {
      user_info.value.specialties_names = [];
    }
    user_info.value.specialties_names.push(newSpecialty.value.trim());

    /* POST request would go here
    try {
      await $fetch('/api/specialties', {
        method: 'POST',
        body: { specialty: newSpecialty.value.trim() }
      });
    } catch (error) {
      console.error('Error saving specialty:', error);
    }
    */

    newSpecialty.value = "";
    showSpecialtyInput.value = false;
  }
};

const cancelSpecialty = () => {
  newSpecialty.value = "";
  showSpecialtyInput.value = false;
};

const removeSpecialty = (index) => {
  user_info.value.specialties_names.splice(index, 1);
  /* DELETE request would go here
  try {
    await $fetch(`/api/specialties/${index}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error removing specialty:', error);
  }
  */
};

// Service Functions
const addService = () => (showServiceInput.value = true);

const saveService = () => {
  if (newService.value.trim()) {
    if (!user_info.value.services_names) {
      user_info.value.services_names = [];
    }
    user_info.value.services_names.push(newService.value.trim());

    /* POST request would go here
    try {
      await $fetch('/api/services', {
        method: 'POST',
        body: { service: newService.value.trim() }
      });
    } catch (error) {
      console.error('Error saving service:', error);
    }
    */

    newService.value = "";
    showServiceInput.value = false;
  }
};

const cancelService = () => {
  newService.value = "";
  showServiceInput.value = false;
};

const removeService = (index) => {
  user_info.value.services_names.splice(index, 1);
  /* DELETE request would go here
  try {
    await $fetch(`/api/services/${index}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error removing service:', error);
  }
  */
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div v-if="pending"></div>
    <div v-else>
      <!-- Specialties Section -->
      <p class="m-0">Especialidades Médicas</p>
      <p class="text-muted fw-light">
        Escribe las Especialidades médicas que ofrecerás en la plataforma.
      </p>

      <div
        v-for="(specialty, index) in user_info.specialties_names"
        :key="'spec-' + index"
        class="mb-3"
      >
        <button
          class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center"
          @click="removeSpecialty(index)"
        >
          <span>{{ specialty }}</span>
          <span class="fw-semibold">
            <AtomsIconsXIcon />
          </span>
        </button>
      </div>

      <div
        v-if="showSpecialtyInput"
        class="bg-primary rounded-4 p-3 mb-3"
        style="--bs-bg-opacity: 0.1"
      >
        <input
          v-model="newSpecialty"
          type="text"
          placeholder="Escriba la especialidad"
          class="form-control"
          @keyup.enter="saveSpecialty"
        />
        <div class="text-end mt-2">
          <button class="btn btn-link text-dark" @click="cancelSpecialty">
            Cancelar
          </button>
          <button
            class="btn btn-light fw-light border-dark"
            @click="saveSpecialty"
          >
            Guardar
          </button>
        </div>
      </div>

      <button
        class="btn btn-info text-white mb-4"
        @click="addSpecialty"
        v-if="!showSpecialtyInput"
      >
        <AtomsIconsPlusIcon /> Agregar especialidad
      </button>

      <hr />

      <!-- Services Section -->
      <p class="m-0">Servicios / Procedimientos</p>
      <p class="text-muted fw-light">
        Agrega los servicios médicos que ofrecerás en la plataforma.
      </p>

      <div
        v-for="(service, index) in user_info.services_names"
        :key="'serv-' + index"
        class="mb-3"
      >
        <button
          class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center"
          @click="removeService(index)"
        >
          <span>{{ service }}</span>
          <span class="fw-semibold">
            <AtomsIconsXIcon />
          </span>
        </button>
      </div>

      <div
        v-if="showServiceInput"
        class="bg-primary rounded-4 p-3 mb-3"
        style="--bs-bg-opacity: 0.1"
      >
        <input
          v-model="newService"
          type="text"
          placeholder="Escriba el servicio/procedimiento"
          class="form-control"
          @keyup.enter="saveService"
        />
        <div class="text-end mt-2">
          <button class="btn btn-link text-dark" @click="cancelService">
            Cancelar
          </button>
          <button
            class="btn btn-light fw-light border-dark"
            @click="saveService"
          >
            Guardar
          </button>
        </div>
      </div>

      <button
        class="btn btn-info text-white"
        @click="addService"
        v-if="!showServiceInput"
      >
        <AtomsIconsPlusIcon /> Agregar servicio
      </button>
    </div>
  </NuxtLayout>
</template>
