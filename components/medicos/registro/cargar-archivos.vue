<template>
  <div class="file-upload">
    <label :for="inputId" class="file-upload__label">{{ label }}</label>

    <input
      type="file"
      :id="inputId"
      ref="fileInput"
      @change="handleFileUpload"
      @blur="$emit('blur')"
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      :disabled="disabled"
      class="file-upload__input"
      required
    />

    <div v-if="isLoading" class="file-upload__loading">
      <div class="file-upload__loading-spinner"></div>
      <span class="file-upload__loading-text">Cargando archivo...</span>
    </div>

    <div v-else>
      <label
        v-if="!uploadedFile"
        :for="inputId"
        class="file-upload__dropzone"
        :class="{
          'file-upload__dropzone--dragover': isDragOver,
          'file-upload__dropzone--error': hasError,
          'file-upload__dropzone--disabled': disabled,
        }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div class="file-upload__content">
          <AtomsIconsUploadContractIcon />
          <div>
            <p>Arrastra para subir un <span>Archivo</span></p>
            <small>PDF, Word, JPG o PNG (máx. 10MB)</small>
          </div>
        </div>
      </label>

      <!-- Archivo cargado -->
      <div v-else class="file-upload__success">
        <img
          v-if="uploadedFile.type === 'application/pdf'"
          src="@/src/assets/pdf-file.png"
          alt="PDF"
        />
        <img
          v-else-if="
            uploadedFile.type === 'application/msword' ||
            uploadedFile.type ===
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          "
          src="@/src/assets/docx-file.png"
          alt="Word"
        />
        <AtomsIconsFileIcon v-else size="43" class="file-upload__file-icon" />
        <div class="file-upload__file-info">
          <span class="file-upload__file-name">{{ uploadedFile.name }}</span>
          <span class="file-upload__file-size">{{
            formatFileSize(uploadedFile.size)
          }}</span>
        </div>
      </div>

      <!-- Botón para eliminar archivo -->
      <button
        v-if="uploadedFile && !disabled"
        @click.stop="removeFile"
        class="file-upload__delete"
        type="button"
      >
        Eliminar archivo
      </button>

      <!-- Mensaje de error -->
      <div v-if="fileError" class="file-upload__error">
        <AtomsIconsAlertIcon size="16" />
        {{ fileError }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

interface Props {
  label: string;
  inputId: string;
  uploadedFile?: File | null;
  isLoading?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  accept?: string;
}

interface Emits {
  (e: "update:file", file: File | null): void;
  (e: "delete:contract-file"): void;
  (e: "blur"): void;
}

const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  disabled: false,
  hasError: false,
  accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
});

const uploadedFile = ref<File | null>(props.uploadedFile || null);
const fileError = ref<string>("");
const isDragOver = ref<boolean>(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isLoading = ref<boolean>(false);

watch(
  () => props.isLoading,
  (newValue) => {
    isLoading.value = newValue || false;
  }
);

watch(
  () => props.uploadedFile,
  (newFile) => {
    uploadedFile.value = newFile || null;
  }
);

const validTypes: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const validExtensions = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: File): boolean => {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();

  if (!validExtensions.includes(extension)) {
    fileError.value = `Formato no permitido. Solo se aceptan: ${validExtensions.join(", ")}`;
    return false;
  }

  const isValidType = Object.keys(validTypes).includes(file.type);

  if (!isValidType) {
    fileError.value =
      "Formato no válido. Solo se permiten PDF, Word (DOC/DOCX), JPG y PNG.";
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    fileError.value = `El archivo es demasiado grande. El tamaño máximo es ${formatFileSize(MAX_FILE_SIZE)}.`;
    return false;
  }

  if (file.size === 0) {
    fileError.value =
      "El archivo está vacío. Por favor, selecciona un archivo válido.";
    return false;
  }

  return true;
};

const processFile = (file: File) => {
  if (validateFile(file)) {
    uploadedFile.value = file;
    fileError.value = "";
    emit("update:file", file);
  } else {
    uploadedFile.value = null;
    emit("update:file", null);
    if (fileInput.value) fileInput.value.value = "";
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    processFile(file);
  }
};

const handleDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  if (props.disabled) return;

  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    processFile(file);

    if (fileInput.value && uploadedFile.value) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.value.files = dataTransfer.files;
    }
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  fileError.value = "";
  if (fileInput.value) fileInput.value.value = "";
  emit("update:file", null);
  emit("delete:contract-file");
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
</script>

<style lang="scss" scoped>
.file-upload {
  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  &__input {
    display: none;
  }

  &__loading {
    width: 100%;
    max-width: 17.1875rem;
    height: 8.8125rem;
    border-radius: 0.25rem;
    border: 0.125rem solid #e0e7ff;
    background-color: #f8faff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    animation: loading-pulse 2s infinite ease-in-out;

    &-spinner {
      width: 2rem;
      height: 2rem;
      border: 0.1875rem solid #e0e7ff;
      border-top: 0.1875rem solid $color-primary;
      border-radius: 50%;
      animation: loading-spin 1s linear infinite;
    }

    &-text {
      font-family: $font-family-mulish;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #4338ca;
      text-align: center;
    }
  }

  &__dropzone {
    width: 100%;
    max-width: 17.1875rem;
    height: 8.8125rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    border: 0.125rem dashed #ebecf7;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f8f8ff;

    &:hover:not(&--disabled):not(&--error) {
      border-color: $color-primary;
      background-color: #f0f8ff;
    }

    &--dragover {
      border-color: $color-primary;
      background-color: #e6f3ff;
      transform: scale(1.02);
    }

    &--error {
      border-color: #dc2626;
      background-color: #fef2f2;
      border-style: dashed;

      &:hover {
        border-color: #dc2626;
        background-color: #fee2e2;
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: #f9fafb;

      &:hover {
        border-color: #ebecf7;
        background-color: #f9fafb;
        transform: none;
      }
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    flex: 1;

    div {
      display: flex;
      flex-direction: column;

      p {
        font-size: 0.875rem;
        line-height: 1.5rem;
        font-weight: 700;
        font-family: $font-family-mulish;
        margin: 0;
        padding: 0;

        span {
          color: $color-primary;
          text-decoration: underline;
        }
      }

      small {
        font-family: $font-family-mulish;
        font-weight: 400;
        font-size: 0.6875rem;
        line-height: 1.125rem;
        letter-spacing: 0;
        text-align: center;
        color: #676767;
      }
    }
  }

  &__success {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 0.375rem;
    background-color: #f0fdf4;
    border: 1px solid #86efac;

    img {
      height: 2.6875rem;
      width: auto;
      flex-shrink: 0;
    }
  }

  &__file-icon {
    color: #3b82f6;
    flex-shrink: 0;
  }

  &__file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  &__file-name {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #166534;
    word-break: break-all;
  }

  &__file-size {
    font-weight: 400;
    font-size: 0.75rem;
    line-height: 1rem;
    color: #15803d;
  }

  &__delete {
    @include label-base;
    color: $color-primary;
    font-size: 0.875rem;
    padding: 0.5rem 0;
    transition: color 0.2s ease;

    &:hover {
      color: darken($color-primary, 10%);
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid rgba($color-primary, 0.3);
      outline-offset: 2px;
      border-radius: 0.25rem;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #dc2626;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    line-height: 1.25;

    svg {
      flex-shrink: 0;
    }
  }
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-pulse {
  0% {
    background-color: #f8faff;
    border-color: #e0e7ff;
  }
  50% {
    background-color: #eef2ff;
    border-color: #c7d2fe;
  }
  100% {
    background-color: #f8faff;
    border-color: #e0e7ff;
  }
}
</style>
