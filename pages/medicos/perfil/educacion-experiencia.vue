<script setup lang="ts">
interface Education {
  id?: number;
  degree: string;
  university: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  experience_type_code?: string;
}

interface Experience {
  id?: number;
  position: string;
  hospital: string;
  city: string;
  country: string;
  start_date: string;
  end_date: string;
  experience_type_code?: string;
}

interface Language {
  id?: number;
  language_code: string;
  skill_level: string;
}

interface UserInfo {
  degrees: Education[];
  experiences: Experience[];
  languages: Language[];
  supplier_id?: number;
}

const { userInfo, getUserInfo } = useUserInfo();
const config = useRuntimeConfig();
const host = config.public.apiBase;

const localUserInfo = ref<UserInfo>({
  degrees: [],
  experiences: [],
  languages: [],
});

const languageOptions = [
  { value: "Inglés", label: "Inglés" },
  { value: "Francés", label: "Francés" },
  { value: "Alemán", label: "Alemán" },
  { value: "Italiano", label: "Italiano" },
  { value: "Portugués", label: "Portugués" },
];

const skillLevelOptions = [
  { value: "Básico", label: "Básico" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
  { value: "Nativo", label: "Nativo" },
];

const loadUserData = async () => {
  const userData = getUserInfo();
  if (userData?.supplier_id) {
    try {
      const educationResponse = await $fetch(
        `${host}/certificationsexperience/get_all`,
        {
          params: {
            supplier_id: userData.supplier_id,
            experience_type_code: "EDUCATION",
          },
        }
      );
      localUserInfo.value.degrees = Array.isArray(educationResponse)
        ? educationResponse
        : [];

      const experienceResponse = await $fetch(
        `${host}/certificationsexperience/get_all`,
        {
          params: {
            supplier_id: userData.supplier_id,
            experience_type_code: "EXPERIENCE",
          },
        }
      );
      localUserInfo.value.experiences = Array.isArray(experienceResponse)
        ? experienceResponse
        : [];

      localUserInfo.value.languages = [];
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }
};

onMounted(() => {
  loadUserData();
});

const showEducationModal = ref(false);
const showExperienceModal = ref(false);
const showLanguageModal = ref(false);

const newEducation = ref<Education>({
  degree: "",
  university: "",
  city: "",
  country: "",
  start_date: "",
  end_date: "",
});

const newExperience = ref<Experience>({
  position: "",
  hospital: "",
  city: "",
  country: "",
  start_date: "",
  end_date: "",
});

const newLanguage = ref<Language>({
  language_code: "",
  skill_level: "",
});

const editingId = ref<number | null>(null);
const isLoading = ref(false);

const openEducationModal = (id: number | null = null) => {
  editingId.value = id;
  if (id) {
    const degree = localUserInfo.value.degrees.find((d) => d.id === id);
    if (degree) {
      newEducation.value = { ...degree };
    }
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

const closeEducationModal = () => {
  showEducationModal.value = false;
};

const saveEducation = async () => {
  isLoading.value = true;
  try {
    const userData = getUserInfo();
    const payload = {
      ...newEducation.value,
      experience_type_code: "EDUCATION",
      supplier_id: userData?.supplier_id,
    };

    if (editingId.value) {
      await $fetch(`${host}/certificationsexperience/edit`, {
        method: "PUT",
        params: { id: editingId.value },
        body: payload,
      });

      const index = localUserInfo.value.degrees.findIndex(
        (d) => d.id === editingId.value
      );
      if (index !== -1) {
        localUserInfo.value.degrees[index] = {
          ...payload,
          id: editingId.value,
        };
      }
    } else {
      const response = await $fetch<Education>(
        `${host}/certificationsexperience/add`,
        {
          method: "POST",
          body: payload,
        }
      );

      localUserInfo.value.degrees.push(response);
    }

    showEducationModal.value = false;
  } catch (error) {
    console.error("Error saving education:", error);
    alert("Error al guardar la educación");
  } finally {
    isLoading.value = false;
  }
};

const deleteEducation = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar esta educación?")) return;

  isLoading.value = true;
  try {
    await $fetch(`${host}/certificationsexperience/delete`, {
      method: "DELETE",
      params: { id },
    });

    localUserInfo.value.degrees = localUserInfo.value.degrees.filter(
      (d) => d.id !== id
    );
  } catch (error) {
    console.error("Error deleting education:", error);
    alert("Error al eliminar la educación");
  } finally {
    isLoading.value = false;
  }
};

const openExperienceModal = (id: number | null = null) => {
  editingId.value = id;
  if (id) {
    const exp = localUserInfo.value.experiences.find((e) => e.id === id);
    if (exp) {
      newExperience.value = { ...exp };
    }
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

const closeExperienceModal = () => {
  showExperienceModal.value = false;
};

const saveExperience = async () => {
  isLoading.value = true;
  try {
    const userData = getUserInfo();
    const payload = {
      ...newExperience.value,
      experience_type_code: "EXPERIENCE",
      supplier_id: userData?.supplier_id,
    };

    if (editingId.value) {
      await $fetch(`${host}/certificationsexperience/edit`, {
        method: "PUT",
        params: { id: editingId.value },
        body: payload,
      });

      const index = localUserInfo.value.experiences.findIndex(
        (e) => e.id === editingId.value
      );
      if (index !== -1) {
        localUserInfo.value.experiences[index] = {
          ...payload,
          id: editingId.value,
        };
      }
    } else {
      const response = await $fetch<Experience>(
        `${host}/certificationsexperience/add`,
        {
          method: "POST",
          body: payload,
        }
      );

      localUserInfo.value.experiences.push(response);
    }

    showExperienceModal.value = false;
  } catch (error) {
    console.error("Error saving experience:", error);
    alert("Error al guardar la experiencia");
  } finally {
    isLoading.value = false;
  }
};

const deleteExperience = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar esta experiencia?")) return;

  isLoading.value = true;
  try {
    await $fetch(`${host}/certificationsexperience/delete`, {
      method: "DELETE",
      params: { id },
    });

    localUserInfo.value.experiences = localUserInfo.value.experiences.filter(
      (e) => e.id !== id
    );
  } catch (error) {
    console.error("Error deleting experience:", error);
    alert("Error al eliminar la experiencia");
  } finally {
    isLoading.value = false;
  }
};

const openLanguageModal = (id: number | null = null) => {
  editingId.value = id;
  if (id) {
    const lang = localUserInfo.value.languages.find((l) => l.id === id);
    if (lang) {
      newLanguage.value = { ...lang };
    }
  } else {
    newLanguage.value = {
      language_code: "",
      skill_level: "",
    };
  }
  showLanguageModal.value = true;
};

const closeLanguageModal = () => {
  showLanguageModal.value = false;
};

const saveLanguage = async () => {
  console.warn("Language API endpoint not yet implemented");

  if (editingId.value) {
    const index = localUserInfo.value.languages.findIndex(
      (l) => l.id === editingId.value
    );
    if (index !== -1) {
      localUserInfo.value.languages[index] = {
        ...newLanguage.value,
        id: editingId.value,
      };
    }
  } else {
    const newId =
      Math.max(...localUserInfo.value.languages.map((l) => l.id || 0), 0) + 1;
    localUserInfo.value.languages.push({ ...newLanguage.value, id: newId });
  }

  showLanguageModal.value = false;
};

const deleteLanguage = (id: number) => {
  console.warn("Language API endpoint not yet implemented");
  localUserInfo.value.languages = localUserInfo.value.languages.filter(
    (l) => l.id !== id
  );
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <section class="profile-section">
      <div class="profile-section__header">
        <h4 class="profile-section__title">Educación o Estudios</h4>
        <button
          class="profile-section__add-button"
          @click="openEducationModal()"
          :disabled="isLoading"
        >
          <span class="profile-section__add-icon">
            <AtomsIconsPlusIcon />
          </span>
          Agregar Nueva
        </button>
      </div>

      <div
        v-if="localUserInfo.degrees && localUserInfo.degrees.length"
        class="profile-section__list"
      >
        <div
          v-for="degree in localUserInfo.degrees"
          :key="degree.id"
          class="profile-item"
        >
          <div class="profile-item__content">
            <p class="profile-item__date">
              {{ new Date(degree.start_date).toLocaleDateString() }} -
              {{ new Date(degree.end_date).toLocaleDateString() }}
            </p>
            <p class="profile-item__title">{{ degree.degree }}</p>
            <p class="profile-item__subtitle">
              {{ degree.university }}
            </p>
            <p class="profile-item__location">
              {{ degree.city + ", " + degree.country }}
            </p>
          </div>
          <div class="profile-item__actions">
            <button
              class="profile-item__action-button profile-item__action-button--edit"
              @click="openEducationModal(degree.id)"
              :disabled="isLoading"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="profile-item__action-button profile-item__action-button--delete"
              @click="deleteEducation(degree.id!)"
              :disabled="isLoading"
            >
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="profile-empty">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
          class="profile-empty__image"
        />
        <div class="profile-empty__content">
          <p class="profile-empty__text">
            Aún no tienes educación o estudios en tu perfil. Añade
            certificaciones para demostrar credibilidad a tus pacientes.
          </p>
          <button class="profile-empty__button" @click="openEducationModal()">
            Agregar Educación o Estudios
          </button>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <div class="profile-section__header">
        <h4 class="profile-section__title">Experiencia</h4>
        <button
          class="profile-section__add-button"
          @click="openExperienceModal()"
          :disabled="isLoading"
        >
          <span class="profile-section__add-icon">
            <AtomsIconsPlusIcon />
          </span>
          Agregar Nueva
        </button>
      </div>

      <div
        v-if="localUserInfo.experiences && localUserInfo.experiences.length"
        class="profile-section__list"
      >
        <div
          v-for="experience in localUserInfo.experiences"
          :key="experience.id"
          class="profile-item"
        >
          <div class="profile-item__content">
            <p class="profile-item__date">
              {{ new Date(experience.start_date).toLocaleDateString() }} -
              {{ new Date(experience.end_date).toLocaleDateString() }}
            </p>
            <p class="profile-item__title">
              {{ experience.position }}
            </p>
            <p class="profile-item__subtitle">{{ experience.hospital }}</p>
            <p class="profile-item__location">
              {{ experience.city + ", " + experience.country }}
            </p>
          </div>
          <div class="profile-item__actions">
            <button
              class="profile-item__action-button profile-item__action-button--edit"
              @click="openExperienceModal(experience.id)"
              :disabled="isLoading"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="profile-item__action-button profile-item__action-button--delete"
              @click="deleteExperience(experience.id!)"
              :disabled="isLoading"
            >
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="profile-empty">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
          class="profile-empty__image"
        />
        <div class="profile-empty__content">
          <p class="profile-empty__text">
            Aún no tienes certificaciones en tu perfil. Añade certificaciones
            para demostrar credibilidad a tus pacientes.
          </p>
          <button class="profile-empty__button" @click="openExperienceModal()">
            Agregar Experiencia
          </button>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <div class="profile-section__header">
        <h4 class="profile-section__title">Idiomas</h4>
        <button
          class="profile-section__add-button"
          @click="openLanguageModal()"
          :disabled="isLoading"
        >
          <span class="profile-section__add-icon">
            <AtomsIconsPlusIcon />
          </span>
          Agregar Nueva
        </button>
      </div>

      <div
        v-if="localUserInfo.languages && localUserInfo.languages.length"
        class="profile-section__list"
      >
        <div
          v-for="language in localUserInfo.languages"
          :key="language.id"
          class="profile-language"
        >
          <div class="profile-language__content">
            <span class="profile-language__name">{{
              language.language_code
            }}</span>
            <span class="profile-language__level">{{
              language.skill_level
            }}</span>
          </div>
          <div class="profile-language__actions">
            <button
              class="profile-language__action-button profile-language__action-button--edit"
              @click="openLanguageModal(language.id)"
              :disabled="isLoading"
            >
              <AtomsIconsEditPencilIcon />
            </button>
            <button
              class="profile-language__action-button profile-language__action-button--delete"
              @click="deleteLanguage(language.id!)"
              :disabled="isLoading"
            >
              <AtomsIconsTrashIcon />
            </button>
          </div>
        </div>
      </div>
      <div v-else class="profile-empty">
        <img
          src="@/src/assets/img-icon-profile-empty-experience.svg"
          alt="Experiencia"
          class="profile-empty__image"
        />
        <div class="profile-empty__content">
          <p class="profile-empty__text">
            Aún no tienes idiomas en tu perfil. Añade certificaciones para
            demostrar credibilidad a tus pacientes.
          </p>
          <button class="profile-empty__button" @click="openLanguageModal()">
            Agregar Idiomas
          </button>
        </div>
      </div>
    </section>

    <AtomsModalBase
      :is-open="showEducationModal"
      @close="closeEducationModal"
      size="medium"
      header-class="header-border-bottom"
    >
      <template #title>
        {{ editingId ? "Editar" : "Agregar" }} Educación
      </template>

      <div class="modal-body">
        <div class="profile-form__group">
          <label class="profile-form__label">Título</label>
          <input
            v-model="newEducation.degree"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Institución</label>
          <input
            v-model="newEducation.university"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Ciudad</label>
            <input
              v-model="newEducation.city"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">País</label>
            <input
              v-model="newEducation.country"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Fecha de inicio</label>
            <input
              v-model="newEducation.start_date"
              type="date"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">Fecha de fin</label>
            <input
              v-model="newEducation.end_date"
              type="date"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--secondary"
          @click="closeEducationModal"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--primary"
          @click="saveEducation"
          :disabled="isLoading"
        >
          {{ isLoading ? "Guardando..." : "Guardar" }}
        </button>
      </template>
    </AtomsModalBase>

    <AtomsModalBase
      :is-open="showExperienceModal"
      @close="closeExperienceModal"
      size="medium"
      header-class="header-border-bottom"
    >
      <template #title>
        {{ editingId ? "Editar" : "Agregar" }} Experiencia
      </template>

      <div class="modal-body">
        <div class="profile-form__group">
          <label class="profile-form__label">Puesto</label>
          <input
            v-model="newExperience.position"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Hospital/Institución</label>
          <input
            v-model="newExperience.hospital"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Ciudad</label>
            <input
              v-model="newExperience.city"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">País</label>
            <input
              v-model="newExperience.country"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Fecha de inicio</label>
            <input
              v-model="newExperience.start_date"
              type="date"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">Fecha de fin</label>
            <input
              v-model="newExperience.end_date"
              type="date"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--secondary"
          @click="closeExperienceModal"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--primary"
          @click="saveExperience"
          :disabled="isLoading"
        >
          {{ isLoading ? "Guardando..." : "Guardar" }}
        </button>
      </template>
    </AtomsModalBase>

    <AtomsModalBase
      :is-open="showLanguageModal"
      @close="closeLanguageModal"
      size="medium"
      header-class="header-border-bottom"
    >
      <template #title>
        {{ editingId ? "Editar" : "Agregar" }} Idioma
      </template>

      <div class="modal-body">
        <div class="profile-form__group">
          <label class="profile-form__label">Idioma</label>
          <UiDropdownBase
            v-model="newLanguage.language_code"
            :items="languageOptions"
            placeholder="Seleccionar idioma"
            searchable
            clearable
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Nivel</label>
          <UiDropdownBase
            v-model="newLanguage.skill_level"
            :items="skillLevelOptions"
            placeholder="Seleccionar nivel"
            clearable
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--secondary"
          @click="closeLanguageModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="profile-modal__button profile-modal__button--primary"
          @click="saveLanguage"
        >
          Guardar
        </button>
      </template>
    </AtomsModalBase>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.profile-section {
  margin-bottom: 2rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__title {
    font-weight: 600;
    font-size: 18px;
    line-height: 140%;
    letter-spacing: -2%;
    color: #353e5c;
    margin: 0;
  }

  &__add-button {
    @include outline-button;
    padding: 8px 14px;
  }

  &__add-icon {
    font-weight: 600;
    margin-right: 8px;
  }

  &__list {
    @include space-y(1rem);
  }
}

.profile-item {
  background: $white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &__content {
    flex: 1;
  }

  &__date {
    color: $color-info;
    font-weight: 500;
    margin: 0 0 0.5rem 0;
    font-family: $font-family-main;
    font-size: 0.875rem;
  }

  &__title {
    font-weight: 300;
    font-size: 1.25rem;
    margin: 0 0 0.25rem 0;
    color: $color-foreground;
    font-family: $font-family-main;
  }

  &__subtitle {
    margin: 0;
    font-weight: 300;
    color: $color-text-muted;
    font-family: $font-family-main;
    font-size: 1rem;
  }

  &__location {
    margin: 0;
    font-weight: 300;
    color: $color-text-muted;
    font-family: $font-family-main;
    font-size: 1rem;
  }

  &__actions {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__action-button {
    @include button-base;
    background-color: $white;
    border: 1px solid #dee2e6;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &--edit {
      color: $color-primary;
    }

    &--delete {
      color: $color-danger;
    }
  }
}

.profile-language {
  background: $white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;

  &__content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__name {
    font-weight: 500;
    font-size: 1.25rem;
    color: $color-foreground;
    font-family: $font-family-main;
  }

  &__level {
    font-weight: 300;
    font-size: 1.25rem;
    color: $color-text-muted;
    font-family: $font-family-main;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__action-button {
    @include button-base;
    background-color: $white;
    border: 1px solid #dee2e6;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &--edit {
      color: $color-primary;
    }

    &--delete {
      color: $color-danger;
    }
  }
}

.profile-empty {
  background: rgba($color-primary, 0.05);
  border-radius: 1.5rem;
  padding: 3rem 1.5rem;
  text-align: center;

  &__image {
    max-width: 200px;
    margin: 0 auto 1.5rem;
  }

  &__content {
    max-width: 600px;
    margin: 0 auto;

    @include respond-to(sm) {
      max-width: 50%;
    }
  }

  &__text {
    font-weight: 300;
    color: $color-text-muted;
    margin: 1rem 0;
    font-family: $font-family-main;
    font-size: 1rem;
    line-height: 1.5;
  }

  &__button {
    @include primary-button;
  }
}

.modal-body {
  padding: 1.5rem;
}

.profile-form {
  &__group {
    margin-bottom: 1rem;
  }

  &__label {
    @include form-label;
    margin-bottom: 0.5rem;
  }

  &__input {
    @include input-base;
    width: 100%;
  }

  &__row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;

    @include respond-to-max(md) {
      flex-direction: column;
      gap: 0;
    }
  }

  &__col {
    flex: 1;

    @include respond-to-max(md) {
      margin-bottom: 1rem;
    }
  }
}

.profile-modal {
  &__button {
    &--primary {
      @include primary-button;
    }

    &--secondary {
      @include outline-button;
    }
  }
}
</style>
