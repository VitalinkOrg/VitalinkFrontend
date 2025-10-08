<template>
  <div class="file-upload">
    <label :for="inputId" class="file-upload__label">{{ label }}</label>

    <input
      type="file"
      :id="inputId"
      ref="fileInput"
      @change="handleFileUpload"
      accept=".pdf,.doc,.docx"
      class="file-upload__input"
      required
    />

    <div v-if="isLoading" class="file-upload__loading">
      <div class="file-upload__loading-spinner"></div>
      <span class="file-upload__loading-text">Cargando archivo...</span>
    </div>

    <div v-else>
      <label
        :for="inputId"
        class="file-upload__dropzone"
        :class="{
          'file-upload__dropzone--uploaded': uploadedFile,
          'file-upload__dropzone--dragover': isDragOver,
        }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        v-if="!uploadedFile"
      >
        <div class="file-upload__content">
          <AtomsIconsUploadContractIcon />
          <div>
            <p>Arrastra para subir un <span>Archivo</span></p>
            <small>Limitado a PDF y word</small>
          </div>
        </div>
      </label>

      <div v-else v-if="uploadedFile" class="file-upload__success">
        <img
          v-if="uploadedFile.type === 'application/pdf'"
          src="@/src/assets/pdf-file.png"
        />
        <img v-else src="@/src/assets/docx-file.png" />
        {{ uploadedFile.name }}
      </div>

      <button
        v-if="uploadedFile"
        @click.stop="removeFile"
        class="file-upload__delete"
        type="button"
      >
        Eliminar contrato
      </button>

      <div v-if="fileError" class="file-upload__error">
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
}

interface Emits {
  (e: "update:file", file: File | null): void;
  (e: "delete:contract-file"): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const uploadedFile = ref<File | null>(props.uploadedFile || null);
const fileError = ref<string>("");
const isDragOver = ref<boolean>(false);
const fileInput = ref<HTMLInputElement | null>(null);
const isLoading = ref<boolean>(false);

watch(
  () => props.isLoading,
  (newFile) => {
    isLoading.value = newFile || false;
  }
);

const validTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const validateFile = (file: File): boolean => {
  if (!validTypes.includes(file.type)) {
    fileError.value = "Formato no válido. Solo se permiten PDF, DOC y DOCX.";
    return false;
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    fileError.value = "El archivo es demasiado grande. Máximo 5MB.";
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
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
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
</script>

<style lang="scss" scoped>
.file-upload {
  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
  }

  &__input {
    display: none;
  }

  &__loading {
    width: 275px;
    height: 141px;
    border-radius: 4px;
    border: 2px solid #e0e7ff;
    background-color: #f8faff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    animation: loading-pulse 2s infinite ease-in-out;

    &-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e0e7ff;
      border-top: 3px solid $color-primary;
      border-radius: 50%;
      animation: loading-spin 1s linear infinite;
    }

    &-text {
      font-family: $font-family-mulish;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      color: #4338ca;
      text-align: center;
    }
  }

  &__dropzone {
    width: 275px;
    height: 141px;
    border-radius: 4px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 2px dashed #ebecf7;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #f8f8ff;

    &:hover {
      border-color: $color-primary;
      background-color: #f0f8ff;
    }

    &--dragover {
      border-color: $color-primary;
      background-color: #e6f3ff;
      transform: scale(1.02);
    }

    &--uploaded {
      border: 2px solid #28a745;
      background-color: #e6ffe6;

      &:hover {
        border-color: #28a745;
        background-color: #e6ffe6;
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
        font-size: 14px;
        line-height: 24px;
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
        font-size: 11px;
        line-height: 18px;
        letter-spacing: 0;
        text-align: center;
        color: #676767;
      }
    }
  }

  &__success {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;

    img {
      height: 43px;
    }
    span {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0;
      color: #19213d;
    }
  }

  &__delete {
    @include label-base;
    color: $color-primary;

    &:hover {
      color: darken($color-primary, 4%);
      text-decoration: underline;
    }
  }

  &__error {
    margin-top: 0.5rem;
    padding: 0.5rem;
    font-size: 0.85rem;
    color: #dc3545;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
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
