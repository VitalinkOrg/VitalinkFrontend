<script setup lang="ts">
import { usePackage } from "@/composables/api";
import { useSpecialties } from "@/composables/api/useSpecialties";
import type { Supplier } from "@/types";

const user_info = useCookie<Partial<Supplier>>("user_info");

const { addSpecialtyToSupplier, deleteSpecialtyFromSupplier } =
  useSpecialties();
const { createPackage, deletePackage } = usePackage();

const newSpecialty = ref("");
const showSpecialtyInput = ref(false);

const newService = ref("");
const showServiceInput = ref(false);

const showNotification = (message: string, type: "success" | "error") => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
};

const addSpecialtyHandler = () => {
  showSpecialtyInput.value = true;
};

const saveSpecialty = async () => {
  if (!newSpecialty.value.trim()) {
    showNotification("Por favor ingrese una especialidad", "error");
    return;
  }

  if (!user_info.value?.id) {
    showNotification("ID de proveedor no encontrado", "error");
    return;
  }

  try {
    const specialtyCode = newSpecialty.value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const api = addSpecialtyToSupplier({
      supplier_id: user_info.value.id,
      medical_specialty_code: specialtyCode,
    });

    await api.request();

    if (api.error.value) {
      showNotification(
        api.error.value.message || "Error al agregar especialidad",
        "error"
      );
      return;
    }

    if (api.response.value?.success) {
      if (!user_info.value.services_names) {
        user_info.value.services_names = [];
      }
      user_info.value.services_names.push(newSpecialty.value.trim());

      showNotification("Especialidad agregada exitosamente", "success");
      newSpecialty.value = "";
      showSpecialtyInput.value = false;
    } else {
      showNotification(
        api.response.value?.message || "Error al agregar especialidad",
        "error"
      );
    }
  } catch (error: any) {
    showNotification(
      error?.message || "Error inesperado al agregar especialidad",
      "error"
    );
  }
};

const cancelSpecialty = () => {
  newSpecialty.value = "";
  showSpecialtyInput.value = false;
};

const removeSpecialty = async (index: number) => {
  if (!user_info.value?.services_names) return;

  const specialtyName = user_info.value.services_names[index];

  if (!confirm(`¿Está seguro de eliminar "${specialtyName}"?`)) {
    return;
  }

  try {
    const specialtyBySupplierId = index + 1;

    const api = deleteSpecialtyFromSupplier(specialtyBySupplierId);

    await api.request();

    if (api.error.value) {
      showNotification(
        api.error.value.message || "Error al eliminar especialidad",
        "error"
      );
      return;
    }

    if (api.response.value?.success) {
      user_info.value.services_names.splice(index, 1);
      showNotification("Especialidad eliminada exitosamente", "success");
    } else {
      showNotification(
        api.response.value?.message || "Error al eliminar especialidad",
        "error"
      );
    }
  } catch (error: any) {
    showNotification(
      error?.message || "Error inesperado al eliminar especialidad",
      "error"
    );
  }
};

const addServiceHandler = () => {
  showServiceInput.value = true;
};

const saveService = async () => {
  if (!newService.value.trim()) {
    showNotification("Por favor ingrese un servicio", "error");
    return;
  }

  if (!user_info.value?.id) {
    showNotification("ID de proveedor no encontrado", "error");
    return;
  }

  try {
    const procedureCode = newService.value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");

    const api = createPackage({
      specialty_id: 1,
      procedure_code: procedureCode,
      product_code: procedureCode,
      discount: 0,
      services_offer: {
        ASSESSMENT_DETAILS: [],
      },
      is_king: 0,
      observations: newService.value.trim(),
      postoperative_assessments: 0,
    });

    await api.request();

    if (api.error.value) {
      showNotification(
        api.error.value.message || "Error al agregar servicio",
        "error"
      );
      return;
    }

    if (api.response.value?.success) {
      if (!user_info.value.services_names) {
        user_info.value.services_names = [];
      }
      user_info.value.services_names.push(newService.value.trim());

      showNotification("Servicio agregado exitosamente", "success");
      newService.value = "";
      showServiceInput.value = false;
    } else {
      showNotification(
        api.response.value?.message || "Error al agregar servicio",
        "error"
      );
    }
  } catch (error: any) {
    showNotification(
      error?.message || "Error inesperado al agregar servicio",
      "error"
    );
  }
};

const cancelService = () => {
  newService.value = "";
  showServiceInput.value = false;
};

const removeService = async (index: number) => {
  if (!user_info.value?.services_names) return;

  const serviceName = user_info.value.services_names[index];

  if (!confirm(`¿Está seguro de eliminar "${serviceName}"?`)) {
    return;
  }

  try {
    const packageId = index + 1;

    const api = deletePackage(packageId);

    await api.request();

    if (api.error.value) {
      showNotification(
        api.error.value.message || "Error al eliminar servicio",
        "error"
      );
      return;
    }

    if (api.response.value?.success) {
      user_info.value.services_names.splice(index, 1);
      showNotification("Servicio eliminado exitosamente", "success");
    } else {
      showNotification(
        api.response.value?.message || "Error al eliminar servicio",
        "error"
      );
    }
  } catch (error: any) {
    showNotification(
      error?.message || "Error inesperado al eliminar servicio",
      "error"
    );
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div v-if="!user_info" class="specialties-services__loading">
      Cargando información del usuario...
    </div>
    <div v-else class="specialties-services">
      <section class="specialties-services__section">
        <h2 class="specialties-services__title">Especialidades Médicas</h2>
        <p class="specialties-services__description">
          Escribe las Especialidades médicas que ofrecerás en la plataforma.
        </p>

        <ul class="specialties-services__list">
          <li
            v-for="(specialty, index) in user_info.services_names"
            :key="'spec-' + index"
            class="specialties-services__item"
          >
            <button
              class="specialties-services__item-button"
              @click="removeSpecialty(index)"
            >
              <span class="specialties-services__item-text">{{
                specialty
              }}</span>
              <span class="specialties-services__item-icon">
                <AtomsIconsXIcon />
              </span>
            </button>
          </li>
        </ul>

        <div
          v-if="showSpecialtyInput"
          class="specialties-services__input-container"
        >
          <input
            v-model="newSpecialty"
            type="text"
            placeholder="Escriba la especialidad"
            class="specialties-services__input"
            @keyup.enter="saveSpecialty"
          />
          <div class="specialties-services__actions">
            <button
              class="specialties-services__action-button specialties-services__action-button--cancel"
              @click="cancelSpecialty"
            >
              Cancelar
            </button>
            <button
              class="specialties-services__action-button specialties-services__action-button--save"
              @click="saveSpecialty"
            >
              Guardar
            </button>
          </div>
        </div>

        <button
          v-if="!showSpecialtyInput"
          class="specialties-services__add-button"
          @click="addSpecialtyHandler"
        >
          <AtomsIconsPlusIcon /> Agregar
        </button>
      </section>

      <hr class="specialties-services__divider" />

      <section class="specialties-services__section">
        <h2 class="specialties-services__title">Servicios / Procedimientos</h2>
        <p class="specialties-services__description">
          Agrega los servicios médicos que ofrecerás en la plataforma.
        </p>

        <ul class="specialties-services__list">
          <li
            v-for="(service, index) in user_info.services_names"
            :key="'serv-' + index"
            class="specialties-services__item"
          >
            <button
              class="specialties-services__item-button"
              @click="removeService(index)"
            >
              <span class="specialties-services__item-text">{{ service }}</span>
              <span class="specialties-services__item-icon">
                <AtomsIconsXIcon />
              </span>
            </button>
          </li>
        </ul>

        <div
          v-if="showServiceInput"
          class="specialties-services__input-container"
        >
          <input
            v-model="newService"
            type="text"
            placeholder="Escriba el servicio/procedimiento"
            class="specialties-services__input"
            @keyup.enter="saveService"
          />
          <div class="specialties-services__actions">
            <button
              class="specialties-services__action-button specialties-services__action-button--cancel"
              @click="cancelService"
            >
              Cancelar
            </button>
            <button
              class="specialties-services__action-button specialties-services__action-button--save"
              @click="saveService"
            >
              Guardar
            </button>
          </div>
        </div>

        <button
          v-if="!showServiceInput"
          class="specialties-services__add-button"
          @click="addServiceHandler"
        >
          <AtomsIconsPlusIcon /> Agregar
        </button>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.specialties-services {
  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-family: $font-family-main;
    font-size: 16px;
    color: $color-text-secondary;
  }

  &__section {
    margin-bottom: 2rem;
  }

  &__title {
    margin: 0;
    font-family: $font-family-main;
    font-size: 16px;
    font-weight: 600;
    color: $color-foreground;
    margin-bottom: 8px;
  }

  &__description {
    margin: 0;
    font-family: $font-family-main;
    font-size: 14px;
    font-weight: 300;
    color: $color-text-muted;
    margin-bottom: 1rem;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__item-button {
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
  }

  &__item-text {
    flex: 1;
    font-size: 14px;
  }

  &__item-icon {
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
  }

  &__input-container {
    background-color: rgba($color-primary, 0.1);
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  &__input {
    @include input-base;
    width: 100%;
    margin-bottom: 0.5rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin-top: 0.5rem;
  }

  &__action-button {
    &--cancel {
      @include secondary-button;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 400;
    }

    &--save {
      @include outline-button;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 400;
    }
  }

  &__add-button {
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

    svg {
      margin-right: 4px;
    }
  }

  &__divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 2rem 0;
  }
}
</style>
