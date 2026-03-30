<script setup lang="ts">
useSeoMeta({
  title: "Especialidades y Procedimientos — Vitalink",
  description: "Administra tus especialidades médicas y procedimientos disponibles en tu perfil.",
  ogTitle: "Especialidades y Procedimientos — Vitalink",
  ogDescription: "Administra tus especialidades médicas y procedimientos disponibles en tu perfil.",
});

import { useUdc } from "@/composables/api";
import { useSpecialtyBySupplier } from "~/composables/api/useSpecialtyBySupplier";

const { getUserInfo } = useUserInfo();
const { show: showToast } = useToast();

const userProfile = getUserInfo();

const {
  createSpecialtyBySupplier,
  deleteSpecialtyBySupplier,
  getAllSpecialtyBySupplier,
} = useSpecialtyBySupplier();

const { createUdc, deleteUdc, getAllUdcs } = useUdc();

interface IdentifiableItem {
  id: number;
  name: string;
}

const specialties = ref<IdentifiableItem[]>([]);
const procedures = ref<IdentifiableItem[]>([]);

const pendingSpecialtyName = ref("");
const pendingProcedureName = ref("");

const isSpecialtyFormVisible = ref(false);
const isProcedureFormVisible = ref(false);

const isSpecialtySubmitting = ref(false);
const isProcedureSubmitting = ref(false);

const isLoadingSpecialties = ref(false);
const isLoadingProcedures = ref(false);

const specialtyInputRef = ref<HTMLInputElement | null>(null);
const procedureInputRef = ref<HTMLInputElement | null>(null);

const supplierId = computed(() => userProfile.value?.id);

const toNormalizedCode = (value: string): string =>
  value.trim().toUpperCase().replace(/\s+/g, "_");

const notify = (message: string, type: "success" | "error") => {
  showToast(message, type);
};

const fetchSpecialties = async () => {
  if (!supplierId.value) return;

  isLoadingSpecialties.value = true;

  try {
    const { data, error } = await getAllSpecialtyBySupplier();

    if (error) {
      notify(error.info || "Error al cargar especialidades", "error");
      return;
    }

    if (data) {
      specialties.value = data.map((entry) => ({
        id: entry.id,
        name:
          entry.medical_specialty?.name ||
          entry.medical_specialty?.code ||
          "Sin nombre",
      }));
    }
  } catch {
    notify("Error inesperado al cargar especialidades", "error");
  } finally {
    isLoadingSpecialties.value = false;
  }
};

const fetchProcedures = async () => {
  if (!supplierId.value) return;

  isLoadingProcedures.value = true;

  try {
    const { data, error } = await getAllUdcs({ type: "MEDICAL_PROCEDURE" });

    if (error) {
      notify(error.info || "Error al cargar procedimientos", "error");
      return;
    }

    if (data) {
      procedures.value = data.map((entry) => ({
        id: entry.id,
        name: entry.name || entry.code || "Sin nombre",
      }));
    }
  } catch {
    notify("Error inesperado al cargar procedimientos", "error");
  } finally {
    isLoadingProcedures.value = false;
  }
};

const revealSpecialtyForm = () => {
  isSpecialtyFormVisible.value = true;
  nextTick(() => specialtyInputRef.value?.focus());
};

const revealProcedureForm = () => {
  isProcedureFormVisible.value = true;
  nextTick(() => procedureInputRef.value?.focus());
};

const dismissSpecialtyForm = () => {
  pendingSpecialtyName.value = "";
  isSpecialtyFormVisible.value = false;
};

const dismissProcedureForm = () => {
  pendingProcedureName.value = "";
  isProcedureFormVisible.value = false;
};

const submitSpecialty = async () => {
  const trimmedName = pendingSpecialtyName.value.trim();

  if (!trimmedName) {
    notify("Por favor ingrese una especialidad", "error");
    return;
  }

  if (!supplierId.value) {
    notify("ID de proveedor no encontrado", "error");
    return;
  }

  isSpecialtySubmitting.value = true;

  try {
    const { data, error } = await createSpecialtyBySupplier({
      supplier_id: supplierId.value,
      medical_specialty_code: toNormalizedCode(trimmedName),
    });

    if (error) {
      notify(error.info || "Error al agregar especialidad", "error");
      return;
    }

    if (data) {
      specialties.value.push({
        id: data.id,
        name: data.medical_specialty?.name || trimmedName,
      });
      notify("Especialidad agregada exitosamente", "success");
      dismissSpecialtyForm();
    }
  } catch {
    notify("Error inesperado al agregar especialidad", "error");
  } finally {
    isSpecialtySubmitting.value = false;
  }
};

const confirmAndRemoveSpecialty = async (specialty: IdentifiableItem) => {
  if (!confirm(`¿Está seguro de eliminar "${specialty.name}"?`)) return;

  try {
    const { data, error } = await deleteSpecialtyBySupplier(specialty.id);

    if (error) {
      notify(error.info || "Error al eliminar especialidad", "error");
      return;
    }

    if (data !== undefined) {
      specialties.value = specialties.value.filter(
        (item) => item.id !== specialty.id,
      );
      notify("Especialidad eliminada exitosamente", "success");
    }
  } catch {
    notify("Error inesperado al eliminar especialidad", "error");
  }
};

const submitProcedure = async () => {
  const trimmedName = pendingProcedureName.value.trim();

  if (!trimmedName) {
    notify("Por favor ingrese un servicio", "error");
    return;
  }

  if (!supplierId.value) {
    notify("ID de proveedor no encontrado", "error");
    return;
  }

  isProcedureSubmitting.value = true;

  try {
    const { data, error } = await createUdc({
      supplier_id: supplierId.value,
      father_code: "",
      name: trimmedName,
      type: "MEDICAL_PROCEDURE",
      description: "",
      value1: "0",
      value2: "0",
      code: toNormalizedCode(trimmedName),
    });

    if (error) {
      notify(error.info || "Error al agregar servicio", "error");
      return;
    }

    if (data) {
      procedures.value.push({
        id: data.id,
        name: data.name || trimmedName,
      });
      notify("Servicio agregado exitosamente", "success");
      dismissProcedureForm();
    }
  } catch {
    notify("Error inesperado al agregar servicio", "error");
  } finally {
    isProcedureSubmitting.value = false;
  }
};

const confirmAndRemoveProcedure = async (procedure: IdentifiableItem) => {
  if (!confirm(`¿Está seguro de eliminar "${procedure.name}"?`)) return;

  try {
    const { data, error } = await deleteUdc(procedure.id);

    if (error) {
      notify(error.info || "Error al eliminar servicio", "error");
      return;
    }

    if (data !== undefined) {
      procedures.value = procedures.value.filter(
        (item) => item.id !== procedure.id,
      );
      notify("Servicio eliminado exitosamente", "success");
    }
  } catch {
    notify("Error inesperado al eliminar servicio", "error");
  }
};

onMounted(async () => {
  await Promise.all([fetchSpecialties(), fetchProcedures()]);
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div
      v-if="!userProfile"
      class="profile-catalog__loading"
      role="status"
      aria-live="polite"
    >
      Cargando información del usuario...
    </div>

    <div v-else class="profile-catalog" role="main">
      <section
        class="profile-catalog__section"
        aria-labelledby="specialties-heading"
      >
        <h2 id="specialties-heading" class="profile-catalog__heading">
          Especialidades Médicas
        </h2>
        <p class="profile-catalog__subtitle">
          Escribe las especialidades médicas que ofrecerás en la plataforma.
        </p>

        <div
          v-if="isLoadingSpecialties"
          class="profile-catalog__loader"
          role="status"
          aria-live="polite"
        >
          Cargando especialidades...
        </div>

        <ul
          v-else-if="specialties.length"
          class="profile-catalog__list"
          aria-label="Lista de especialidades médicas"
        >
          <li
            v-for="specialty in specialties"
            :key="`specialty-${specialty.id}`"
            class="profile-catalog__list-item"
          >
            <button
              type="button"
              class="profile-catalog__chip"
              :aria-label="`Eliminar especialidad: ${specialty.name}`"
              @click="confirmAndRemoveSpecialty(specialty)"
            >
              <span class="profile-catalog__chip-label">
                {{ specialty.name }}
              </span>
              <span class="profile-catalog__chip-dismiss" aria-hidden="true">
                <AtomsIconsXIcon />
              </span>
            </button>
          </li>
        </ul>

        <p v-else class="profile-catalog__empty-message" role="status">
          No hay especialidades registradas.
        </p>

        <div
          v-if="isSpecialtyFormVisible"
          class="profile-catalog__inline-form"
          role="group"
          aria-label="Formulario para agregar especialidad"
        >
          <label
            for="new-specialty-input"
            class="profile-catalog__visually-hidden"
          >
            Nueva especialidad
          </label>
          <input
            id="new-specialty-input"
            ref="specialtyInputRef"
            v-model="pendingSpecialtyName"
            type="text"
            placeholder="Escriba la especialidad"
            class="profile-catalog__input"
            :disabled="isSpecialtySubmitting"
            @keyup.enter="submitSpecialty"
            @keyup.escape="dismissSpecialtyForm"
          />
          <div class="profile-catalog__inline-form-actions">
            <button
              type="button"
              class="profile-catalog__button profile-catalog__button--secondary"
              :disabled="isSpecialtySubmitting"
              @click="dismissSpecialtyForm"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="profile-catalog__button profile-catalog__button--outline"
              :disabled="isSpecialtySubmitting"
              @click="submitSpecialty"
            >
              {{ isSpecialtySubmitting ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="profile-catalog__button profile-catalog__button--add"
          @click="revealSpecialtyForm"
        >
          <AtomsIconsPlusIcon aria-hidden="true" />
          Agregar
        </button>
      </section>

      <hr class="profile-catalog__divider" aria-hidden="true" />

      <section
        class="profile-catalog__section"
        aria-labelledby="procedures-heading"
      >
        <h2 id="procedures-heading" class="profile-catalog__heading">
          Servicios / Procedimientos
        </h2>
        <p class="profile-catalog__subtitle">
          Agrega los servicios médicos que ofrecerás en la plataforma.
        </p>

        <div
          v-if="isLoadingProcedures"
          class="profile-catalog__loader"
          role="status"
          aria-live="polite"
        >
          Cargando procedimientos...
        </div>

        <ul
          v-else-if="procedures.length"
          class="profile-catalog__list"
          aria-label="Lista de servicios y procedimientos"
        >
          <li
            v-for="procedure in procedures"
            :key="`procedure-${procedure.id}`"
            class="profile-catalog__list-item"
          >
            <button
              type="button"
              class="profile-catalog__chip"
              :aria-label="`Eliminar servicio: ${procedure.name}`"
              @click="confirmAndRemoveProcedure(procedure)"
            >
              <span class="profile-catalog__chip-label">
                {{ procedure.name }}
              </span>
              <span class="profile-catalog__chip-dismiss" aria-hidden="true">
                <AtomsIconsXIcon />
              </span>
            </button>
          </li>
        </ul>

        <p v-else class="profile-catalog__empty-message" role="status">
          No hay servicios registrados.
        </p>

        <div
          v-if="isProcedureFormVisible"
          class="profile-catalog__inline-form"
          role="group"
          aria-label="Formulario para agregar servicio"
        >
          <label
            for="new-procedure-input"
            class="profile-catalog__visually-hidden"
          >
            Nuevo servicio o procedimiento
          </label>
          <input
            id="new-procedure-input"
            ref="procedureInputRef"
            v-model="pendingProcedureName"
            type="text"
            placeholder="Escriba el servicio/procedimiento"
            class="profile-catalog__input"
            :disabled="isProcedureSubmitting"
            @keyup.enter="submitProcedure"
            @keyup.escape="dismissProcedureForm"
          />
          <div class="profile-catalog__inline-form-actions">
            <button
              type="button"
              class="profile-catalog__button profile-catalog__button--secondary"
              :disabled="isProcedureSubmitting"
              @click="dismissProcedureForm"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="profile-catalog__button profile-catalog__button--outline"
              :disabled="isProcedureSubmitting"
              @click="submitProcedure"
            >
              {{ isProcedureSubmitting ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </div>

        <button
          v-else
          type="button"
          class="profile-catalog__button profile-catalog__button--add"
          @click="revealProcedureForm"
        >
          <AtomsIconsPlusIcon aria-hidden="true" />
          Agregar
        </button>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.profile-catalog {
  &__loading,
  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 120px;
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__section {
    margin-bottom: 2rem;
  }

  &__heading {
    margin: 0 0 8px;
    font-family: $font-family-main;
    font-size: 16px;
    font-weight: 600;
    color: $color-foreground;
  }

  &__subtitle {
    margin: 0 0 1rem;
    font-family: $font-family-main;
    font-size: 14px;
    font-weight: 300;
    color: $color-text-muted;
  }

  &__empty-message {
    margin: 0 0 1rem;
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
    font-style: italic;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.5rem;
  }

  &__list-item {
    margin-bottom: 0.75rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__chip {
    @include button-base;
    width: 100%;
    padding: 12px 16px;
    background-color: $white;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-weight: 300;
    color: $color-foreground;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f9fafb;
      border-color: #b2b8c0;
    }

    &:active {
      background-color: #f2f4f7;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__chip-label {
    flex: 1;
    font-size: 14px;
  }

  &__chip-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    font-weight: 600;
  }

  &__inline-form {
    background-color: rgba($color-primary, 0.08);
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  &__inline-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin-top: 0.5rem;
  }

  &__input {
    @include input-base;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  &__button {
    &--secondary {
      @include secondary-button;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 400;
    }

    &--outline {
      @include outline-button;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 400;
    }

    &--add {
      @include button-base;
      background-color: $color-info;
      border-color: $color-info;
      color: $white;
      font-weight: 400;
      padding: 10px 16px;
      margin: 1.5rem 0;

      &:hover {
        background-color: darken($color-info, 5%);
        border-color: darken($color-info, 5%);
      }

      &:active {
        background-color: darken($color-info, 10%);
      }

      &:focus-visible {
        outline: 2px solid $color-info;
        outline-offset: 2px;
      }

      svg {
        margin-right: 4px;
      }
    }
  }

  &__divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 2rem 0;
  }

  &__visually-hidden {
    @include visually-hidden;
  }
}
</style>
