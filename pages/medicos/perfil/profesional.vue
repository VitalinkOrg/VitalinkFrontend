<script setup lang="ts">
import { useDocuments, useSupplier } from "@/composables/api";
import type { DocumentResponse } from "@/composables/api/useDocuments";
import type { Supplier, UserInformation } from "@/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

interface ExtendedUserInfo extends UserInformation {
  supplier?: Supplier;
  description?: string;
  num_medical_enrollment?: string;
}

const { updateHospital: updateSupplier, fetchAllSuppliers } = useSupplier();
const { uploadDocument, updateDocument, getDocumentsByFilters } =
  useDocuments();
const { userInfo, setUserInfo } = useUserInfo();

const currentUser = computed(() => userInfo.value as ExtendedUserInfo);

const description = ref<string>(currentUser.value?.description || "");
const medicalNumber = ref<string>(
  currentUser.value?.num_medical_enrollment || ""
);

const profilePicture = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const existingProfilePicture = ref<DocumentResponse | null>(null);
const supplierData = ref<Supplier | null>(null);

const isLoading = ref(false);
const errorMessage = ref<string>("");
const successMessage = ref<string>("");

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (!file.type.startsWith("image/")) {
      errorMessage.value = "Por favor selecciona un archivo de imagen válido";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = "La imagen no debe superar los 5MB";
      return;
    }

    profilePicture.value = file;
    imagePreview.value = URL.createObjectURL(file);
    errorMessage.value = "";
  }
};

const loadSupplierData = async () => {
  if (!currentUser.value?.id) return;

  const { response, request, error } = fetchAllSuppliers();
  await request();

  if (error.value) {
    console.error("Error al cargar datos del proveedor:", error.value);
    return;
  }

  if (response.value?.data) {
    const supplier = response.value.data.find(
      (s) =>
        String(s.legal_representative?.id) === String(currentUser.value?.id)
    );

    if (supplier) {
      supplierData.value = supplier;
      description.value = supplier.description || "";
      medicalNumber.value = supplier.num_medical_enrollment || "";
    } else {
      errorMessage.value = "No se encontró información del proveedor asociado";
    }
  }
};

const loadExistingProfilePicture = async () => {
  if (!currentUser.value?.id) return;

  const { response, request, error } = getDocumentsByFilters({
    table: "USER",
    id_for_table: currentUser.value.id,
    action_type: "PROFILE_PICTURE",
  });

  await request();

  if (error.value) {
    console.error("Error al cargar foto existente:", error.value);
    return;
  }

  if (response.value?.data && response.value.data.length > 0) {
    existingProfilePicture.value = response.value.data[0];
  }
};

const updateProfilePicture = async (): Promise<boolean> => {
  if (!profilePicture.value || !currentUser.value?.id) return true;

  try {
    const fields = {
      title: "Foto de perfil",
      type: "IMG",
      description: "",
      id_for_table: currentUser.value.id,
      table: "USER",
      action_type: "PROFILE_PICTURE",
      user_id: currentUser.value.id,
      is_public: 1,
    };

    let response, request, error;

    if (existingProfilePicture.value) {
      ({ response, request, error } = updateDocument(
        existingProfilePicture.value.id,
        profilePicture.value,
        fields
      ));
    } else {
      ({ response, request, error } = uploadDocument(
        profilePicture.value,
        fields
      ));
    }

    await request();

    if (error.value) {
      console.error("Error al actualizar foto:", error.value);
      errorMessage.value = "Error al actualizar la foto de perfil";
      return false;
    }

    if (response.value?.data?.url) {
      const updatedUserInfo = {
        ...currentUser.value,
        profile_picture_url: response.value.data.url,
      };
      setUserInfo(updatedUserInfo);
      existingProfilePicture.value = response.value.data;
    }

    return true;
  } catch (err) {
    console.error("Error al procesar la foto de perfil:", err);
    errorMessage.value = "Error inesperado al procesar la foto";
    return false;
  }
};

const updateSupplierInfo = async (): Promise<boolean> => {
  if (!supplierData.value?.id) {
    errorMessage.value = "No se encontró información del proveedor";
    return false;
  }

  try {
    const { response, request, error } = updateSupplier(
      String(supplierData.value.id),
      {
        num_medical_enrollment: medicalNumber.value,
        description: description.value,
      }
    );

    await request();

    if (error.value) {
      console.error("Error al actualizar proveedor:", error.value);
      errorMessage.value =
        error.value.message ||
        "Error al actualizar la información del proveedor";
      return false;
    }

    if (response.value?.data) {
      const updatedUserInfo = {
        ...currentUser.value,
        description: description.value,
        num_medical_enrollment: medicalNumber.value,
      };
      setUserInfo(updatedUserInfo);
    }

    return true;
  } catch (err) {
    console.error("Error:", err);
    errorMessage.value = "Error inesperado al actualizar";
    return false;
  }
};

const updateProfile = async (event: Event) => {
  event.preventDefault();

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const photoSuccess = await updateProfilePicture();

    if (!photoSuccess) {
      return;
    }

    const infoSuccess = await updateSupplierInfo();

    if (!infoSuccess) {
      return;
    }

    successMessage.value = "✓ Perfil actualizado correctamente";

    if (imagePreview.value) {
      URL.revokeObjectURL(imagePreview.value);
      imagePreview.value = null;
    }
    profilePicture.value = null;

    setTimeout(() => {
      successMessage.value = "";
    }, 3000);
  } catch (err) {
    console.error("Error general:", err);
    errorMessage.value = "Error inesperado al actualizar el perfil";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadSupplierData();
  loadExistingProfilePicture();
});

onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <form class="professional-form" @submit.prevent="updateProfile">
      <Transition name="fade">
        <div
          v-if="errorMessage"
          class="professional-form__alert professional-form__alert--error"
        >
          {{ errorMessage }}
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-if="successMessage"
          class="professional-form__alert professional-form__alert--success"
        >
          {{ successMessage }}
        </div>
      </Transition>

      <div class="professional-form__group">
        <label class="professional-form__label">Foto de Perfil</label>
        <p class="professional-form__description">
          Esta será la foto que vean tus pacientes cuando encuentren tu perfil
          en Vitalink
        </p>
        <div class="professional-form__upload-section">
          <div class="profile-picture">
            <img
              :src="
                imagePreview ||
                currentUser?.profile_picture_url ||
                '/_nuxt/src/assets/picture.svg'
              "
              :class="[
                'profile-picture__image',
                !profilePicture && !imagePreview
                  ? 'profile-picture__image--preview'
                  : 'profile-picture__image--uploaded',
              ]"
              alt="Profile Picture"
            />
          </div>
          <label
            for="upload-picture"
            class="profile-picture__upload-button"
            :class="{ 'is-loading': isLoading }"
          >
            <img src="@/src/assets/camera.svg" alt="Upload Picture" />
          </label>
          <input
            type="file"
            id="upload-picture"
            accept="image/*"
            class="profile-picture__input"
            :disabled="isLoading"
            @change="handleFileChange"
          />
        </div>
      </div>

      <div class="professional-form__group">
        <label for="descripcion" class="professional-form__label">
          Escribe una breve descripción profesional
        </label>
        <textarea
          name="descripcion"
          id="descripcion"
          cols="30"
          rows="3"
          class="professional-form__textarea"
          v-model="description"
          :disabled="isLoading"
          placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
        ></textarea>
      </div>

      <div class="professional-form__group">
        <label for="matricula-medica" class="professional-form__label">
          Nº Matrícula Médica
        </label>
        <input
          type="text"
          name="matricula-medica"
          id="matricula-medica"
          v-model="medicalNumber"
          :disabled="isLoading"
          placeholder="Escribe el número de tu matrícula"
          class="professional-form__input"
        />
      </div>

      <div class="professional-form__actions">
        <button
          type="submit"
          class="professional-form__button"
          :disabled="isLoading || !supplierData"
        >
          <span v-if="!isLoading">Actualizar Perfil</span>
          <span v-else class="button-loading">
            <span class="spinner"></span>
            Actualizando...
          </span>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.professional-form {
  &__group {
    margin-bottom: 1.5rem;

    @include respond-to-max(md) {
      margin-bottom: 1.25rem;
    }

    @include respond-to-max(sm) {
      margin-bottom: 1rem;
    }
  }

  &__label {
    @include form-label;
    font-weight: 500;
    margin-bottom: 0.5rem;

    @include respond-to-max(sm) {
      margin-bottom: 0.375rem;
    }
  }

  &__description {
    @include text-base;
    color: $color-text-muted;
    font-weight: 300;
    margin-top: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 0;

    @include respond-to-max(md) {
      font-size: 0.8125rem;
      margin-bottom: 0.625rem;
    }

    @include respond-to-max(sm) {
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }
  }

  &__upload-section {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;

    @include respond-to-max(sm) {
      gap: 0.5rem;
    }
  }

  &__input {
    @include input-base;
    width: 100%;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f5f5f5;
    }
  }

  &__textarea {
    @include input-base;
    resize: vertical;
    min-height: 6rem;
    line-height: 1.5;
    width: 100%;

    @include respond-to-max(md) {
      min-height: 5.5rem;
    }

    @include respond-to-max(sm) {
      min-height: 5rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f5f5f5;
    }
  }

  &__actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-start;

    @include respond-to-max(md) {
      margin-top: 1.5rem;
    }

    @include respond-to-max(sm) {
      margin-top: 1.25rem;
    }
  }

  &__button {
    @include primary-button;

    @include respond-to-max(md) {
      width: 100%;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    font-weight: 500;

    &--error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    &--success {
      background-color: #efe;
      color: #2d5;
      border: 1px solid #cfc;
    }
  }
}

.profile-picture {
  border-radius: 1.125rem;
  border: 0.1875rem solid #c2c6e9;
  background: #f8faff;
  width: 8.125rem;
  height: 8.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;

  @include respond-to-max(md) {
    width: 7rem;
    height: 7.125rem;
    border-radius: 1rem;
    border-width: 0.15rem;
  }

  @include respond-to-max(sm) {
    width: 6rem;
    height: 6.125rem;
    border-radius: 0.875rem;
    border-width: 0.125rem;
  }

  &__image {
    &--preview {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;

      @include respond-to-max(md) {
        width: 2.25rem;
        height: 2.25rem;
      }

      @include respond-to-max(sm) {
        width: 2rem;
        height: 2rem;
      }
    }

    &--uploaded {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__upload-button {
    z-index: 10;
    border-radius: 2.4375rem;
    width: 2.5rem;
    height: 2.5rem;
    margin-left: -1.5625rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $color-primary;
    flex-shrink: 0;
    transition: all 0.2s ease;

    @include respond-to-max(md) {
      width: 2.25rem;
      height: 2.25rem;
      margin-left: -1.375rem;
      border-radius: 2rem;
    }

    @include respond-to-max(sm) {
      width: 2rem;
      height: 2rem;
      margin-left: -1.125rem;
      border-radius: 1.75rem;
    }

    &:hover:not(.is-loading) {
      background-color: $color-primary-darkened-5;
      transform: scale(1.05);
    }

    &:active:not(.is-loading) {
      background-color: $color-primary-darkened-10;
      transform: scale(0.98);
    }

    &.is-loading {
      opacity: 0.6;
      cursor: not-allowed;
    }

    img {
      width: 1.25rem;
      height: 1.25rem;

      @include respond-to-max(md) {
        width: 1.125rem;
        height: 1.125rem;
      }

      @include respond-to-max(sm) {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  &__input {
    @include visually-hidden;
  }
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
