<script setup lang="ts">
useSeoMeta({
  title: "Perfil Profesional — Vitalink",
  description: "Actualiza tu información profesional y datos de contacto en Vitalink.",
  ogTitle: "Perfil Profesional — Vitalink",
  ogDescription: "Actualiza tu información profesional y datos de contacto en Vitalink.",
});

import { useDocuments } from "~/composables/api/useDocuments";
import { useSupplier } from "~/composables/api/useSupplier";

const { show: showToast } = useToast();
const { updateSupplier, getSupplierById, getAllSuppliers } = useSupplier();
const { addDocument } = useDocuments();

const supplierData = ref<ISupplierDetail | null>(null);
const supplierId = ref<number | null>(null);
const profileDescription = ref("");
const medicalEnrollmentNumber = ref("");
const selectedProfileImage = ref<File | null>(null);
const profileImagePreview = ref<string | null>(null);

const isSubmitting = ref(false);
const isLoadingProfile = ref(true);
const isUploadingImage = ref(false);

const isFormReady = computed(() => true);

const hasProfileImage = computed(
  () =>
    !!profileImagePreview.value || !!supplierData.value?.profile_picture_url,
);

const displayedImageSrc = computed(
  () =>
    profileImagePreview.value ||
    supplierData.value?.profile_picture_url ||
    "/_nuxt/src/assets/picture.svg",
);

const notify = (message: string, type: "success" | "error") => {
  showToast(message, type);
};

const fetchSupplierProfile = async () => {
  isLoadingProfile.value = true;

  try {
    const { data: suppliers, error: suppliersError } = await getAllSuppliers();

    if (suppliersError || !suppliers?.length) {
      notify(suppliersError?.info || "No se encontró el perfil del proveedor", "error");
      return;
    }

    supplierId.value = suppliers[0].id;

    const { data, error } = await getSupplierById(supplierId.value);

    if (error) {
      notify(error.info || "Error al cargar el perfil profesional", "error");
      return;
    }

    if (data) {
      supplierData.value = data;
      profileDescription.value = data.description || "";
      medicalEnrollmentNumber.value = data.num_medical_enrollment || "";
    }
  } catch {
    notify("Error inesperado al cargar el perfil", "error");
  } finally {
    isLoadingProfile.value = false;
  }
};

const handleImageSelection = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeInBytes = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    notify("Formato no válido. Use JPG, PNG o WebP", "error");
    input.value = "";
    return;
  }

  if (file.size > maxSizeInBytes) {
    notify("La imagen no debe superar los 5 MB", "error");
    input.value = "";
    return;
  }

  selectedProfileImage.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    profileImagePreview.value = e.target?.result as string;
  };
  reader.onerror = () => {
    notify("Error al previsualizar la imagen", "error");
  };
  reader.readAsDataURL(file);
};

const uploadProfileImage = async (): Promise<string | null> => {
  if (!selectedProfileImage.value || !supplierId.value) return null;

  isUploadingImage.value = true;

  try {
    const { data, error } = await addDocument({
      file: selectedProfileImage.value,
      fields: {
        title: `profile_picture_${supplierId.value}`,
        type: "IMG",
        description: "Foto de perfil profesional",
        id_for_table: String(supplierId.value),
        table: "supplier",
        action_type: "GENERAL_GALLERY",
        user_id: String(supplierId.value),
        is_public: 1,
      },
    });

    if (error) {
      notify(error.info || "Error al subir la imagen", "error");
      return null;
    }

    return data?.code || data?.url || null;
  } catch {
    notify("Error inesperado al subir la imagen", "error");
    return null;
  } finally {
    isUploadingImage.value = false;
  }
};

const submitProfileUpdate = async () => {
  if (!supplierId.value || !supplierData.value) {
    notify("No se encontró la información del proveedor", "error");
    return;
  }

  isSubmitting.value = true;

  try {
    let profilePictureUrl = supplierData.value.profile_picture_url;

    if (selectedProfileImage.value) {
      const uploadedCode = await uploadProfileImage();

      if (uploadedCode) {
        profilePictureUrl = uploadedCode;
      } else if (selectedProfileImage.value) {
        return;
      }
    }

    const payload: ISupplierUpdateRequest = {
      description: profileDescription.value.trim(),
      num_medical_enrollment: medicalEnrollmentNumber.value.trim(),
      profile_picture_url: profilePictureUrl || "",
    };

    const { data, error } = await updateSupplier(supplierId.value, payload);

    if (error) {
      notify(error.info || "Error al actualizar el perfil", "error");
      return;
    }

    if (data) {
      supplierData.value = {
        ...supplierData.value,
        description: payload.description ?? supplierData.value.description,
        num_medical_enrollment:
          payload.num_medical_enrollment ??
          supplierData.value.num_medical_enrollment,
        profile_picture_url:
          profilePictureUrl ?? supplierData.value.profile_picture_url,
      };

      selectedProfileImage.value = null;
      notify("Perfil actualizado exitosamente", "success");
    }
  } catch {
    notify("Error inesperado al actualizar el perfil", "error");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchSupplierProfile();
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div
      v-if="isLoadingProfile"
      class="professional-profile__loading"
      role="status"
      aria-live="polite"
    >
      Cargando perfil profesional...
    </div>

    <form
      v-else
      class="professional-profile"
      novalidate
      @submit.prevent="submitProfileUpdate"
      aria-label="Formulario de perfil profesional"
    >
      <fieldset class="professional-profile__fieldset">
        <legend class="professional-profile__visually-hidden">
          Información profesional del médico
        </legend>

        <div class="professional-profile__field">
          <span class="professional-profile__label" id="photo-label">
            Foto de Perfil
          </span>
          <p class="professional-profile__hint" id="photo-hint">
            Esta será la foto que vean tus pacientes cuando encuentren tu perfil
            en Vitalink.
          </p>

          <div
            class="professional-profile__avatar-group"
            role="group"
            aria-labelledby="photo-label"
            aria-describedby="photo-hint"
          >
            <figure class="professional-profile__avatar">
              <img
                :src="displayedImageSrc"
                :class="[
                  'professional-profile__avatar-image',
                  hasProfileImage
                    ? 'professional-profile__avatar-image--filled'
                    : 'professional-profile__avatar-image--placeholder',
                ]"
                alt="Foto de perfil actual"
              />
            </figure>

            <label
              for="profile-image-upload"
              class="professional-profile__avatar-trigger"
              :class="{
                'professional-profile__avatar-trigger--disabled': !isFormReady,
              }"
              role="button"
              tabindex="0"
              aria-label="Cambiar foto de perfil"
              @keydown.enter.prevent="
                ($refs.imageInput as HTMLInputElement)?.click()
              "
              @keydown.space.prevent="
                ($refs.imageInput as HTMLInputElement)?.click()
              "
            >
              <img src="@/src/assets/camera.svg" alt="" aria-hidden="true" />
            </label>

            <input
              id="profile-image-upload"
              ref="imageInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="professional-profile__visually-hidden"
              :disabled="!isFormReady"
              @change="handleImageSelection"
            />
          </div>
        </div>

        <div class="professional-profile__field">
          <label
            for="professional-description"
            class="professional-profile__label"
          >
            Escribe una breve descripción profesional
          </label>
          <textarea
            id="professional-description"
            v-model="profileDescription"
            class="professional-profile__textarea"
            rows="3"
            placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
            :disabled="!isFormReady"
            aria-describedby="description-counter"
          />
          <span
            id="description-counter"
            class="professional-profile__char-count"
            aria-live="polite"
          >
            {{ profileDescription.length }} caracteres
          </span>
        </div>

        <div class="professional-profile__field">
          <label for="medical-enrollment" class="professional-profile__label">
            Nº Matrícula Médica
          </label>
          <input
            id="medical-enrollment"
            v-model="medicalEnrollmentNumber"
            type="text"
            class="professional-profile__input"
            placeholder="Escribe el número de tu matrícula"
            :disabled="!isFormReady"
          />
        </div>
      </fieldset>

      <div class="professional-profile__actions">
        <button
          type="submit"
          class="professional-profile__submit"
          :disabled="!isFormReady"
          :aria-busy="isSubmitting || isUploadingImage"
        >
          <template v-if="isSubmitting || isUploadingImage">
            <span class="professional-profile__spinner" aria-hidden="true" />
            {{ isUploadingImage ? "Subiendo imagen..." : "Actualizando..." }}
          </template>
          <template v-else> Actualizar Perfil </template>
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.professional-profile {
  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__fieldset {
    border: none;
    margin: 0;
    padding: 0;
  }

  &__field {
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

  &__hint {
    @include text-base;
    color: $color-text-muted;
    font-weight: 300;
    margin-top: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 14px;
    line-height: 1.4;

    @include respond-to-max(md) {
      font-size: 0.8125rem;
      margin-bottom: 0.625rem;
    }

    @include respond-to-max(sm) {
      font-size: 0.75rem;
      margin-bottom: 0.5rem;
    }
  }

  &__avatar-group {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 0.625rem;

    @include respond-to-max(sm) {
      gap: 0.5rem;
    }
  }

  &__avatar {
    margin: 0;
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
  }

  &__avatar-image {
    &--placeholder {
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

    &--filled {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-trigger {
    z-index: 10;
    border-radius: 50%;
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
    }

    @include respond-to-max(sm) {
      width: 2rem;
      height: 2rem;
      margin-left: -1.125rem;
    }

    &:hover:not(&--disabled) {
      background-color: $color-primary-darkened-5;
      transform: scale(1.05);
    }

    &:active:not(&--disabled) {
      background-color: $color-primary-darkened-10;
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &--disabled {
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

  &__char-count {
    display: block;
    margin-top: 0.25rem;
    font-family: $font-family-main;
    font-size: 12px;
    color: $color-text-muted;
    text-align: right;
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

  &__submit {
    @include primary-button;

    @include respond-to-max(md) {
      width: 100%;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: rotate-spinner 0.6s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  &__visually-hidden {
    @include visually-hidden;
  }
}

@keyframes rotate-spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
