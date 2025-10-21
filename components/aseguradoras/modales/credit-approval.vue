<template>
  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="credit-approval">
      <span class="credit-approval__warning-icon">
        <img src="@/src/assets/warning.svg" width="20" alt="Warning" />
      </span>

      <h5 class="credit-approval__title">Confirmación de aprobación</h5>

      <p class="credit-approval__description">
        Para continuar por favor adjunta el documento de aprobación con las
        condiciones de pago para el paciente:
      </p>

      <div class="credit-approval__file-upload">
        <input
          type="file"
          id="documentUpload"
          ref="fileInputRef"
          @change="handleFileChange"
          accept=".pdf,.doc,.docx"
          class="credit-approval__file-input"
        />
        <label
          for="documentUpload"
          class="credit-approval__file-label"
          :class="{ 'credit-approval__file-label--success': uploadedFile }"
        >
          <div class="credit-approval__file-content">
            <img src="@/src/assets/cloud-upload.svg" width="20" alt="Upload" />
            <span v-if="!uploadedFile">
              Arrastra un archivo o haz click para buscar en tu ordenador
            </span>
            <span v-else class="credit-approval__file-success">
              Documento cargado: {{ uploadedFile.name }}
            </span>
          </div>
          <button
            v-if="uploadedFile"
            @click.stop="handleRemoveFile"
            class="credit-approval__btn credit-approval__btn--danger-small"
          >
            Eliminar
          </button>
        </label>
        <div
          v-if="fileError"
          class="credit-approval__error credit-approval__error--small"
        >
          {{ fileError }}
        </div>
      </div>

      <div class="credit-approval__actions">
        <button
          class="credit-approval__btn credit-approval__btn--dark-outline"
          @click="handleGoBack"
        >
          Cancelar
        </button>
        <button
          class="credit-approval__btn credit-approval__btn--primary"
          @click="handleConfirm"
          :disabled="!uploadedFile"
        >
          Confirmar Aprobación
        </button>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
interface Props {
  uploadedFile: File | null;
  fileError: string;
}

interface Emits {
  (e: "file-uploaded", file: File): void;
  (e: "file-removed"): void;
  (e: "back"): void;
  (e: "confirm"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};

const fileInputRef = ref<HTMLInputElement | null>(null);

const handleFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    emit("file-uploaded", file);
  }
};

const handleRemoveFile = (): void => {
  emit("file-removed");
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const handleConfirm = () => {
  emit("confirm");
};

const handleGoBack = () => {
  emit("back");
  handleCloseModal();
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isOpen),
});
</script>

<style lang="scss" scoped>
.credit-approval {
  width: 100%;

  &__warning-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 50%;
    background-color: #fff3cd;
    color: #ffc107;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  &__description {
    color: #6c757d;
    margin-bottom: 1rem;
  }

  &__file-upload {
    border: 2px dashed #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;

    &:hover {
      border-color: #0d6efd;
      background-color: rgba(13, 110, 253, 0.05);
    }
  }

  &__file-input {
    display: none;
  }

  &__file-label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    background-color: #cff4fc;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 0.375rem;

    &--success {
      border: 1px solid #198754;
    }
  }

  &__file-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__file-success {
    color: #198754;
  }

  &__error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;

    &--small {
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1.5rem;

    .credit-approval__btn {
      flex: 1;
    }
  }

  &__btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;

    &:disabled {
      pointer-events: none;
      opacity: 0.65;
    }

    &--primary {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;

      &:hover:not(:disabled) {
        background-color: #0b5ed7;
        border-color: #0a58ca;
      }
    }

    &--dark-outline {
      color: #212529;
      background-color: transparent;
      border-color: #212529;

      &:hover:not(:disabled) {
        color: #fff;
        background-color: #212529;
        border-color: #212529;
      }
    }

    &--danger-small {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      color: #dc3545;
      background-color: transparent;
      border-color: #dc3545;

      &:hover {
        color: #fff;
        background-color: #dc3545;
        border-color: #dc3545;
      }
    }
  }
}
</style>
