<script setup lang="ts">
import { useCertificationsExperience } from "~/composables/api/useCertificationsExperience";
import { useLanguageSupplier } from "~/composables/api/useLanguageSupplier";
import { useSupplier } from "~/composables/api/useSupplier";

useSeoMeta({
  title: "Educación y Experiencia — Vitalink",
  description:
    "Edita tu formación académica, experiencia profesional e idiomas en tu perfil médico.",
  ogTitle: "Educación y Experiencia — Vitalink",
  ogDescription:
    "Edita tu formación académica, experiencia profesional e idiomas en tu perfil médico.",
});

interface Language {
  id?: number;
  language_code: string;
  language_proficiency_code: LanguageProficiencyCode;
}

const {
  getAllCertificationExperiences,
  createCertificationExperience,
  updateCertificationExperience,
  deleteCertificationExperience,
} = useCertificationsExperience();
const {
  getAllLanguageSuppliers,
  createLanguageSupplier,
  updateLanguageSupplier,
  deleteLanguageSupplier,
} = useLanguageSupplier();
const { getAllSuppliers } = useSupplier();

const supplierId = ref<number | null>(null);

const degrees = ref<ICertificationExperience[]>([]);
const experiences = ref<ICertificationExperience[]>([]);
const languages = ref<Language[]>([]);
const isLoadingData = ref(false);

const EDUCATION_TYPES = new Set<ExperienceTypeCode>([
  "EDUCATION",
  "CERTIFICATION",
  "AWARD_RECOGNITION",
  "ACCREDITATION",
  "SCIENTIFIC_PUBLICATION",
  "CONFERENCE_PARTICIPATION",
  "MEDICAL_RESEARCH",
]);

const languageOptions = [
  { value: "Inglés", label: "Inglés" },
  { value: "Francés", label: "Francés" },
  { value: "Alemán", label: "Alemán" },
  { value: "Italiano", label: "Italiano" },
  { value: "Portugués", label: "Portugués" },
];

const skillLevelOptions: { value: LanguageProficiencyCode; label: string }[] =
  [
    { value: "BASIC", label: "Básico" },
    { value: "INTERMEDIATE", label: "Intermedio" },
    { value: "ADVANCED", label: "Avanzado" },
    { value: "NATIVE", label: "Nativo" },
  ];

const loadUserData = async () => {
  isLoadingData.value = true;
  try {
    const { data: suppliers, error: supplierError } = await getAllSuppliers();

    if (supplierError || !suppliers?.length) return;

    supplierId.value = suppliers[0].id;

    const [allCertificationsResult, languageResult] = await Promise.all([
      getAllCertificationExperiences({ supplier_id: supplierId.value }),
      getAllLanguageSuppliers(),
    ]);

    const raw = allCertificationsResult.data ?? [];
    const all: ICertificationExperience[] = raw.map((c) => ({
      ...c,
      experience_type_code: c.experience_type?.code ?? c.experience_type_code,
    }));
    degrees.value = all.filter(
      (c) => c.experience_type_code && EDUCATION_TYPES.has(c.experience_type_code),
    );
    experiences.value = all.filter(
      (c) => c.experience_type_code === "EXPERIENCE",
    );
    languages.value = (languageResult.data ?? []).map((l) => ({
      id: l.id,
      language_code: l.language_code,
      language_proficiency_code: l.language_proficiency_code,
    }));
  } finally {
    isLoadingData.value = false;
  }
};

onMounted(() => {
  loadUserData();
});

const showEducationModal = ref(false);
const showExperienceModal = ref(false);
const showLanguageModal = ref(false);

const educationTypeOptions: { value: ExperienceTypeCode; label: string }[] = [
  { value: "EDUCATION", label: "Educación" },
  { value: "CERTIFICATION", label: "Certificación" },
  { value: "AWARD_RECOGNITION", label: "Premio o Reconocimiento" },
  { value: "ACCREDITATION", label: "Acreditación" },
  { value: "SCIENTIFIC_PUBLICATION", label: "Publicación Científica" },
  { value: "CONFERENCE_PARTICIPATION", label: "Participación en Conferencia" },
  { value: "MEDICAL_RESEARCH", label: "Investigación Médica" },
];

const emptyEducation = (): Partial<ICreateCertificationExperienceRequest> => ({
  name: "",
  company_name: "",
  city_name: "",
  country_iso_code: "",
  start_date: "",
  end_date: "",
  experience_type_code: "EDUCATION",
});

const emptyExperience = (): Partial<ICreateCertificationExperienceRequest> => ({
  name: "",
  company_name: "",
  city_name: "",
  country_iso_code: "",
  start_date: "",
  end_date: "",
});

const newEducation =
  ref<Partial<ICreateCertificationExperienceRequest>>(emptyEducation());
const newExperience =
  ref<Partial<ICreateCertificationExperienceRequest>>(emptyExperience());

const newLanguage = ref<Language>({
  language_code: "",
  language_proficiency_code: "BASIC",
});

const editingId = ref<number | null>(null);
const isLoading = ref(false);

const openEducationModal = (id: number | null = null) => {
  editingId.value = id;
  if (id) {
    const degree = degrees.value.find((d) => d.id === id);
    if (degree) {
      newEducation.value = { ...degree };
    }
  } else {
    newEducation.value = emptyEducation();
  }
  showEducationModal.value = true;
};

const closeEducationModal = () => {
  showEducationModal.value = false;
};

const saveEducation = async () => {
  isLoading.value = true;
  try {
    if (!supplierId.value) return;

    if (editingId.value) {
      const payload = stripEmpty(newEducation.value);
      console.log("[saveEducation] update payload", payload);
      const { error } = await updateCertificationExperience(
        editingId.value,
        payload,
      );
      if (error) throw new Error(error.info);

      const index = degrees.value.findIndex((d) => d.id === editingId.value);
      if (index !== -1) {
        degrees.value[index] = {
          ...degrees.value[index],
          ...newEducation.value,
        };
      }
    } else {
      const payload = {
        ...stripEmpty({
          ...(newEducation.value as ICreateCertificationExperienceRequest),
          supplier_id: supplierId.value,
          experience_type_code:
            newEducation.value.experience_type_code ?? "EDUCATION",
        }),
        url_document: newEducation.value.url_document ?? "",
      };
      console.log("[saveEducation] create payload", payload);
      const { data, error } = await createCertificationExperience(payload);
      if (error) throw new Error(error.info);
      if (data) degrees.value.push(data);
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
    const { error } = await deleteCertificationExperience(id);
    if (error) throw new Error(error.info);
    degrees.value = degrees.value.filter((d) => d.id !== id);
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
    const exp = experiences.value.find((e) => e.id === id);
    if (exp) {
      newExperience.value = { ...exp };
    }
  } else {
    newExperience.value = emptyExperience();
  }
  showExperienceModal.value = true;
};

const closeExperienceModal = () => {
  showExperienceModal.value = false;
};

const saveExperience = async () => {
  isLoading.value = true;
  try {
    if (!supplierId.value) return;

    if (editingId.value) {
      const payload = stripEmpty(newExperience.value);
      console.log("[saveExperience] update payload", payload);
      const { error } = await updateCertificationExperience(
        editingId.value,
        payload,
      );
      if (error) throw new Error(error.info);

      const index = experiences.value.findIndex(
        (e) => e.id === editingId.value,
      );
      if (index !== -1) {
        experiences.value[index] = {
          ...experiences.value[index],
          ...newExperience.value,
        };
      }
    } else {
      const payload = {
        ...stripEmpty({
          ...(newExperience.value as ICreateCertificationExperienceRequest),
          supplier_id: supplierId.value,
          experience_type_code: "EXPERIENCE",
        }),
        url_document: newExperience.value.url_document ?? "",
      };
      console.log("[saveExperience] create payload", payload);
      const { data, error } = await createCertificationExperience(payload);
      if (error) throw new Error(error.info);
      if (data) experiences.value.push(data);
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
    const { error } = await deleteCertificationExperience(id);
    if (error) throw new Error(error.info);
    experiences.value = experiences.value.filter((e) => e.id !== id);
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
    const lang = languages.value.find((l) => l.id === id);
    if (lang) {
      newLanguage.value = { ...lang };
    }
  } else {
    newLanguage.value = {
      language_code: "",
      language_proficiency_code: "BASIC",
    };
  }
  showLanguageModal.value = true;
};

const closeLanguageModal = () => {
  showLanguageModal.value = false;
};

const stripEmpty = <T extends object>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined),
  ) as T;

const experienceTypeLabel: Partial<Record<ExperienceTypeCode, string>> = {
  EDUCATION: "Educación",
  CERTIFICATION: "Certificación",
  AWARD_RECOGNITION: "Premio o Reconocimiento",
  ACCREDITATION: "Acreditación",
  SCIENTIFIC_PUBLICATION: "Publicación Científica",
  CONFERENCE_PARTICIPATION: "Participación en Conferencia",
  MEDICAL_RESEARCH: "Investigación Médica",
};

const proficiencyLabel: Record<LanguageProficiencyCode, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  NATIVE: "Nativo",
};

const saveLanguage = async () => {
  isLoading.value = true;
  try {
    if (!supplierId.value) return;

    if (editingId.value) {
      const { error } = await updateLanguageSupplier(editingId.value, {
        supplier_id: supplierId.value,
        language_code: newLanguage.value.language_code,
        language_proficiency_code: newLanguage.value.language_proficiency_code,
      });
      if (error) throw new Error(error.info);

      const index = languages.value.findIndex((l) => l.id === editingId.value);
      if (index !== -1) {
        languages.value[index] = { ...newLanguage.value, id: editingId.value };
      }
    } else {
      const { data, error } = await createLanguageSupplier({
        supplier_id: supplierId.value,
        language_code: newLanguage.value.language_code,
        language_proficiency_code: newLanguage.value.language_proficiency_code,
      });
      if (error) throw new Error(error.info);
      if (data)
        languages.value.push({
          id: data.id,
          language_code: data.language_code,
          language_proficiency_code: data.language_proficiency_code,
        });
    }

    showLanguageModal.value = false;
  } catch (error) {
    console.error("Error saving language:", error);
    alert("Error al guardar el idioma");
  } finally {
    isLoading.value = false;
  }
};

const deleteLanguage = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar este idioma?")) return;

  isLoading.value = true;
  try {
    const { error } = await deleteLanguageSupplier(id);
    if (error) throw new Error(error.info);
    languages.value = languages.value.filter((l) => l.id !== id);
  } catch (error) {
    console.error("Error deleting language:", error);
    alert("Error al eliminar el idioma");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div v-if="isLoadingData" class="profile-loader">
      <WebsitePerfilDoctorPantallaCarga />
    </div>

    <template v-else>
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

      <div v-if="degrees.length" class="profile-section__list">
        <div v-for="degree in degrees" :key="degree.id" class="profile-item">
          <div class="profile-item__content">
            <p class="profile-item__date">
              {{ new Date(degree.start_date).toLocaleDateString() }}
              <template v-if="degree.end_date">
                - {{ new Date(degree.end_date).toLocaleDateString() }}</template
              >
            </p>
            <p class="profile-item__title">{{ degree.name }}</p>
            <p class="profile-item__subtitle">{{ degree.company_name }}</p>
            <p v-if="degree.experience_type_code" class="profile-item__type">
              {{ experienceTypeLabel[degree.experience_type_code] }}
            </p>
            <p
              v-if="degree.city_name || degree.country_iso_code"
              class="profile-item__location"
            >
              {{
                [degree.city_name, degree.country_iso_code]
                  .filter(Boolean)
                  .join(", ")
              }}
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
              @click="deleteEducation(degree.id)"
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

      <div v-if="experiences.length" class="profile-section__list">
        <div
          v-for="experience in experiences"
          :key="experience.id"
          class="profile-item"
        >
          <div class="profile-item__content">
            <p class="profile-item__date">
              {{ new Date(experience.start_date).toLocaleDateString() }}
              <template v-if="experience.end_date">
                -
                {{
                  new Date(experience.end_date).toLocaleDateString()
                }}</template
              >
            </p>
            <p class="profile-item__title">{{ experience.name }}</p>
            <p class="profile-item__subtitle">{{ experience.company_name }}</p>
            <p
              v-if="experience.city_name || experience.country_iso_code"
              class="profile-item__location"
            >
              {{
                [experience.city_name, experience.country_iso_code]
                  .filter(Boolean)
                  .join(", ")
              }}
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
              @click="deleteExperience(experience.id)"
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

      <div v-if="languages.length" class="profile-section__list">
        <div
          v-for="language in languages"
          :key="language.id"
          class="profile-language"
        >
          <div class="profile-language__content">
            <span class="profile-language__name">{{
              language.language_code
            }}</span>
            <span class="profile-language__level">{{
              proficiencyLabel[language.language_proficiency_code]
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
          <label class="profile-form__label">Tipo</label>
          <UiDropdownBase
            v-model="newEducation.experience_type_code"
            :items="educationTypeOptions"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Título</label>
          <input
            v-model="newEducation.name"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Institución</label>
          <input
            v-model="newEducation.company_name"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Ciudad</label>
            <input
              v-model="newEducation.city_name"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">País</label>
            <input
              v-model="newEducation.country_iso_code"
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
            v-model="newExperience.name"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__group">
          <label class="profile-form__label">Hospital/Institución</label>
          <input
            v-model="newExperience.company_name"
            type="text"
            class="profile-form__input"
            :disabled="isLoading"
          />
        </div>
        <div class="profile-form__row">
          <div class="profile-form__col">
            <label class="profile-form__label">Ciudad</label>
            <input
              v-model="newExperience.city_name"
              type="text"
              class="profile-form__input"
              :disabled="isLoading"
            />
          </div>
          <div class="profile-form__col">
            <label class="profile-form__label">País</label>
            <input
              v-model="newExperience.country_iso_code"
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
            v-model="newLanguage.language_proficiency_code"
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
    </template>
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

  &__type {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: $color-primary;
    font-family: $font-family-main;
    text-transform: uppercase;
    letter-spacing: 0.04em;
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
