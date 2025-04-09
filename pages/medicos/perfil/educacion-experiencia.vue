<script setup>
// Mock user data
const mockUserInfo = {
  degrees: [
    {
      id: 1,
      degree: "Doctorado en Medicina",
      university: "Universidad Nacional Autónoma de México",
      city: "Ciudad de México",
      country: "México",
      start_date: "2015-09-01",
      end_date: "2020-06-30",
    },
    {
      id: 2,
      degree: "Especialidad en Cardiología",
      university: "Hospital General de México",
      city: "Ciudad de México",
      country: "México",
      start_date: "2012-08-15",
      end_date: "2015-07-20",
    },
  ],
  experiences: [
    {
      id: 1,
      position: "Cardiólogo Senior",
      hospital: "Hospital Ángeles",
      city: "Monterrey",
      country: "México",
      start_date: "2018-03-01",
      end_date: "2023-05-15",
    },
  ],
  languages: [
    {
      id: 1,
      language_code: "Inglés",
      skill_level: "Avanzado",
    },
    {
      id: 2,
      language_code: "Francés",
      skill_level: "Intermedio",
    },
  ],
};

// Use mock data in development
const user_info = process.dev ? ref(mockUserInfo) : useCookie("user_info");

// State for modals and forms
const showEducationModal = ref(false);
const showExperienceModal = ref(false);
const showLanguageModal = ref(false);

const newEducation = ref({
  degree: "",
  university: "",
  city: "",
  country: "",
  start_date: "",
  end_date: "",
});

const newExperience = ref({
  position: "",
  hospital: "",
  city: "",
  country: "",
  start_date: "",
  end_date: "",
});

const newLanguage = ref({
  language_code: "",
  skill_level: "",
});

const editingId = ref(null);

// Education functions
const openEducationModal = (id = null) => {
  editingId.value = id;
  if (id) {
    const degree = user_info.value.degrees.find((d) => d.id === id);
    newEducation.value = { ...degree };
  } else {
    newEducation.value = {
      degree: "",
      university: "",
      city: "",
      country: "",
      start_date: "",
      end_date: "",
    };
  }
  showEducationModal.value = true;
};

const saveEducation = () => {
  if (editingId.value) {
    // Update existing
    const index = user_info.value.degrees.findIndex(
      (d) => d.id === editingId.value
    );
    user_info.value.degrees[index] = {
      ...newEducation.value,
      id: editingId.value,
    };
  } else {
    // Add new
    const newId = Math.max(...user_info.value.degrees.map((d) => d.id), 0) + 1;
    user_info.value.degrees.push({ ...newEducation.value, id: newId });
  }
  showEducationModal.value = false;

  /* API call would go here
  try {
    const method = editingId.value ? 'PUT' : 'POST';
    const url = editingId.value ? `/api/degrees/${editingId.value}` : '/api/degrees';
    await $fetch(url, { method, body: newEducation.value });
  } catch (error) {
    console.error('Error saving education:', error);
  }
  */
};

const deleteEducation = (id) => {
  user_info.value.degrees = user_info.value.degrees.filter((d) => d.id !== id);

  /* API call would go here
  try {
    await $fetch(`/api/degrees/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting education:', error);
  }
  */
};

// Experience functions
const openExperienceModal = (id = null) => {
  editingId.value = id;
  if (id) {
    const exp = user_info.value.experiences.find((e) => e.id === id);
    newExperience.value = { ...exp };
  } else {
    newExperience.value = {
      position: "",
      hospital: "",
      city: "",
      country: "",
      start_date: "",
      end_date: "",
    };
  }
  showExperienceModal.value = true;
};

const saveExperience = () => {
  if (editingId.value) {
    // Update existing
    const index = user_info.value.experiences.findIndex(
      (e) => e.id === editingId.value
    );
    user_info.value.experiences[index] = {
      ...newExperience.value,
      id: editingId.value,
    };
  } else {
    // Add new
    const newId =
      Math.max(...user_info.value.experiences.map((e) => e.id), 0) + 1;
    user_info.value.experiences.push({ ...newExperience.value, id: newId });
  }
  showExperienceModal.value = false;

  /* API call would go here
  try {
    const method = editingId.value ? 'PUT' : 'POST';
    const url = editingId.value ? `/api/experiences/${editingId.value}` : '/api/experiences';
    await $fetch(url, { method, body: newExperience.value });
  } catch (error) {
    console.error('Error saving experience:', error);
  }
  */
};

const deleteExperience = (id) => {
  user_info.value.experiences = user_info.value.experiences.filter(
    (e) => e.id !== id
  );

  /* API call would go here
  try {
    await $fetch(`/api/experiences/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting experience:', error);
  }
  */
};

// Language functions
const openLanguageModal = (id = null) => {
  editingId.value = id;
  if (id) {
    const lang = user_info.value.languages.find((l) => l.id === id);
    newLanguage.value = { ...lang };
  } else {
    newLanguage.value = {
      language_code: "",
      skill_level: "",
    };
  }
  showLanguageModal.value = true;
};

const saveLanguage = () => {
  if (editingId.value) {
    // Update existing
    const index = user_info.value.languages.findIndex(
      (l) => l.id === editingId.value
    );
    user_info.value.languages[index] = {
      ...newLanguage.value,
      id: editingId.value,
    };
  } else {
    // Add new
    const newId =
      Math.max(...user_info.value.languages.map((l) => l.id), 0) + 1;
    user_info.value.languages.push({ ...newLanguage.value, id: newId });
  }
  showLanguageModal.value = false;

  /* API call would go here
  try {
    const method = editingId.value ? 'PUT' : 'POST';
    const url = editingId.value ? `/api/languages/${editingId.value}` : '/api/languages';
    await $fetch(url, { method, body: newLanguage.value });
  } catch (error) {
    console.error('Error saving language:', error);
  }
  */
};

const deleteLanguage = (id) => {
  user_info.value.languages = user_info.value.languages.filter(
    (l) => l.id !== id
  );

  /* API call would go here
  try {
    await $fetch(`/api/languages/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error deleting language:', error);
  }
  */
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <!-- Education Section -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Educación o Estudios</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="openEducationModal()"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>

    <div v-if="user_info.degrees && user_info.degrees.length">
      <div
        v-for="degree in user_info.degrees"
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
            <button
              class="btn btn-light bg-white border"
              @click="openEducationModal(degree.id)"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="btn btn-light bg-white border ms-2"
              @click="deleteEducation(degree.id)"
            >
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
            <button class="btn btn-primary" @click="openEducationModal()">
              Agregar Educación o Estudios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Experience Section -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Experiencia</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="openExperienceModal()"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>

    <div v-if="user_info.experiences && user_info.experiences.length">
      <div
        v-for="experience in user_info.experiences"
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
            <button
              class="btn btn-light bg-white border"
              @click="openExperienceModal(experience.id)"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="btn btn-light bg-white border ms-2"
              @click="deleteExperience(experience.id)"
            >
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
            <button class="btn btn-primary" @click="openExperienceModal()">
              Agregar Experiencia
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Languages Section -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Idiomas</h4>
      <button
        class="btn btn-white border-dark fw-light"
        @click="openLanguageModal()"
      >
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span>
        Agregar Nueva
      </button>
    </div>
    <div v-if="user_info.languages && user_info.languages.length">
      <div
        v-for="language in user_info.languages"
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
            <button
              class="btn btn-light bg-white border"
              @click="openLanguageModal(language.id)"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="btn btn-light bg-white border ms-2"
              @click="deleteLanguage(language.id)"
            >
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
              Aún no tienes idiomas en tu perfil. Añade certificaciones para
              demostrar credibilidad a tus pacientes.
            </p>
            <button class="btn btn-primary" @click="openLanguageModal()">
              Agregar Idiomas
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Education Modal -->
    <div v-if="showEducationModal" class="show">
      <div class="modal d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingId ? "Editar" : "Agregar" }} Educación
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showEducationModal = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Título</label>
                <input
                  v-model="newEducation.degree"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Institución</label>
                <input
                  v-model="newEducation.university"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Ciudad</label>
                  <input
                    v-model="newEducation.city"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">País</label>
                  <input
                    v-model="newEducation.country"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Fecha de inicio</label>
                  <input
                    v-model="newEducation.start_date"
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de fin</label>
                  <input
                    v-model="newEducation.end_date"
                    type="date"
                    class="form-control"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showEducationModal = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveEducation"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Experience Modal -->
    <div v-if="showExperienceModal" class="show">
      <div class="modal d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingId ? "Editar" : "Agregar" }} Experiencia
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showExperienceModal = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Puesto</label>
                <input
                  v-model="newExperience.position"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Hospital/Institución</label>
                <input
                  v-model="newExperience.hospital"
                  type="text"
                  class="form-control"
                />
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Ciudad</label>
                  <input
                    v-model="newExperience.city"
                    type="text"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">País</label>
                  <input
                    v-model="newExperience.country"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Fecha de inicio</label>
                  <input
                    v-model="newExperience.start_date"
                    type="date"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fecha de fin</label>
                  <input
                    v-model="newExperience.end_date"
                    type="date"
                    class="form-control"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showExperienceModal = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveExperience"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Modal -->
    <div v-if="showLanguageModal" class="show">
      <div class="modal d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editingId ? "Editar" : "Agregar" }} Idioma
              </h5>
              <button
                type="button"
                class="btn-close"
                @click="showLanguageModal = false"
              ></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Idioma</label>
                <select v-model="newLanguage.language_code" class="form-select">
                  <option value="">Seleccionar</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Francés">Francés</option>
                  <option value="Alemán">Alemán</option>
                  <option value="Italiano">Italiano</option>
                  <option value="Portugués">Portugués</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nivel</label>
                <select v-model="newLanguage.skill_level" class="form-select">
                  <option value="">Seleccionar</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Nativo">Nativo</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showLanguageModal = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveLanguage"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
