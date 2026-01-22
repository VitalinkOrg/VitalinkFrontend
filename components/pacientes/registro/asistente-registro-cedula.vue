<template>
  <div class="wizard-container" role="region" aria-labelledby="wizard-title">
    <h1 id="wizard-title" class="visually-hidden">
      Asistente de registro con cédula
    </h1>
    <div class="wizard-content">
      <!-- Indicador de pasos -->
      <nav aria-label="Pasos del asistente" class="wizard-step-indicator">
        <ol class="wizard-step-list" role="tablist">
          <li
            role="tab"
            :aria-selected="breadcrumOption === 'idCard'"
            tabindex="0"
            class="wizard-step-item"
            :class="{
              active: breadcrumOption === 'idCard',
              completed: isStepCompleted('idCard'),
              disabled: !canNavigateToStep('idCard'),
            }"
            @click="setNavigation('idCard')"
            @keydown.enter="setNavigation('idCard')"
          >
            <small
              class="step-number"
              :class="{ 'step-completed': isStepCompleted('idCard') }"
            >
              <span v-if="!isStepCompleted('idCard')">1</span>
              <svg
                v-else
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </small>
            <span>Nº de Cédula</span>
          </li>
          <li
            role="tab"
            :aria-selected="breadcrumOption === 'personalInfo'"
            tabindex="0"
            class="wizard-step-item"
            :class="{
              active: breadcrumOption === 'personalInfo',
              completed: isStepCompleted('personalInfo'),
              disabled: !canNavigateToStep('personalInfo'),
            }"
            @click="setNavigation('personalInfo')"
            @keydown.enter="setNavigation('personalInfo')"
          >
            <small
              class="step-number"
              :class="{ 'step-completed': isStepCompleted('personalInfo') }"
            >
              <span v-if="!isStepCompleted('personalInfo')">2</span>
              <svg
                v-else
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </small>
            <span>Información personal</span>
          </li>
          <li
            role="tab"
            :aria-selected="breadcrumOption === 'create'"
            tabindex="0"
            class="wizard-step-item"
            :class="{
              active: breadcrumOption === 'create',
              completed: isStepCompleted('create'),
              disabled: !canNavigateToStep('create'),
            }"
            @click="setNavigation('create')"
            @keydown.enter="setNavigation('create')"
          >
            <small
              class="step-number"
              :class="{ 'step-completed': isStepCompleted('create') }"
            >
              <span v-if="!isStepCompleted('create')">3</span>
              <svg
                v-else
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </small>
            <span>Creación de la cuenta</span>
          </li>
        </ol>
      </nav>

      <form @submit.prevent="nextStep" novalidate>
        <div class="input-section">
          <div class="input-field-group">
            <label for="idCardField" class="form-label">Nº de Cédula*</label>
            <div class="input-wrapper">
              <input
                id="idCardField"
                type="text"
                class="input-field"
                placeholder="0-0000-0000"
                v-model="idCard"
                aria-required="true"
                required
                aria-describedby="idCardHint"
                :disabled="shouldDisableIdCardField"
              />
              <button
                v-if="idCard && canClearIdCard"
                type="button"
                class="clear-button"
                @click="clearIdCard"
                aria-label="Limpiar campo"
              >
                <AtomsIconsXIcon />
              </button>
            </div>
          </div>
        </div>

        <!-- Paso 2: Información personal -->
        <div
          v-if="breadcrumOption === 'personalInfo'"
          class="input-section personal-info-section"
        >
          <div class="step-header" role="heading" aria-level="2">
            <h2 class="step-header__title">
              Formulario autocompletado de TSE:
            </h2>
            <button
              type="button"
              class="edit-button"
              @click="toggleEditPersonalInfo"
              aria-label="Editar información"
            >
              <AtomsIconsEditPencilIcon />
            </button>
          </div>
          <div class="input-field-group">
            <label for="fullNameField" class="form-label">Nombre</label>
            <input
              id="fullNameField"
              type="text"
              class="input-field"
              placeholder="Martín González"
              v-model="fullName"
              :disabled="!isPersonalInfoEditable"
              :readonly="!isPersonalInfoEditable"
              :aria-readonly="!isPersonalInfoEditable"
              aria-describedby="fullNameHint"
            />
          </div>
          <div class="input-field-group">
            <label for="companyField" class="form-label"
              >Empresa a la que pertenece</label
            >
            <input
              id="companyField"
              type="text"
              class="input-field"
              placeholder="Ejemplo empresa"
              v-model="company"
              :disabled="!isPersonalInfoEditable"
              :readonly="!isPersonalInfoEditable"
              :aria-readonly="!isPersonalInfoEditable"
              aria-describedby="companyHint"
            />
          </div>
          <div class="input-field-group">
            <label for="addressField" class="form-label">Dirección</label>
            <input
              id="addressField"
              type="text"
              class="input-field"
              placeholder="Calle Verde 12, San José, Costa Rica"
              v-model="address"
              aria-required="true"
              required
              aria-describedby="addressHint"
            />
          </div>
          <div class="input-field-group">
            <label for="phoneField" class="form-label"
              >Número de Teléfono*</label
            >
            <input
              id="phoneField"
              type="tel"
              class="input-field"
              placeholder="+506 8888-8888"
              v-model="phoneNumber"
              aria-required="true"
              required
            />
          </div>

          <div class="checkbox-field-group">
            <input
              type="checkbox"
              id="whatsappEnabled"
              v-model="whatsappEnabled"
              class="form-check-input"
            />
            <label for="whatsappEnabled" class="checkbox-label">
              Enviar notificaciones por WhatsApp a este número
            </label>
          </div>
        </div>

        <!-- Paso 3: Crear cuenta -->
        <div v-if="breadcrumOption === 'create'" class="input-section">
          <div class="input-field-group">
            <label for="passwordIdCard" class="form-label"
              >Crear Contraseña*</label
            >
            <input
              id="passwordIdCard"
              type="password"
              class="input-field"
              placeholder="Escribe una contraseña"
              v-model="password"
              aria-required="true"
              required
              aria-describedby="passwordHint"
            />
            <small id="passwordHint" class="input-hint"
              >Debe tener al menos 8 caracteres</small
            >
          </div>
          <div class="input-field-group">
            <label for="confirmPasswordIdCard" class="form-label"
              >Confirmar Contraseña*</label
            >
            <input
              id="confirmPasswordIdCard"
              type="password"
              class="input-field"
              placeholder="Repite tu contraseña"
              v-model="confirmPassword"
              aria-required="true"
              required
              aria-describedby="confirmPasswordHint"
            />
            <small id="confirmPasswordHint" class="input-hint"
              >Debe coincidir con la contraseña anterior</small
            >
          </div>
        </div>
      </form>

      <!-- Botones de navegación -->
      <div class="navigation-buttons">
        <div class="navigation-buttons-container">
          <button
            class="navigation-button navigation-button--prev"
            @click="prevStep"
          >
            Atrás
          </button>
          <button
            class="navigation-button navigation-button--next"
            @click="nextStep"
            :aria-label="primaryButtonText"
            :disabled="!isCurrentStepValid"
          >
            {{ primaryButtonText }}
          </button>
        </div>
        <div class="navigation-note">
          <small v-if="breadcrumOption !== 'idCard'" aria-live="polite">
            Confirma que los datos son correctos antes de continuar
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

type Step = "idCard" | "personalInfo" | "create";

const breadcrumOption = ref<Step>("idCard");
const idCard = ref("");
const fullName = ref("");
const company = ref("");
const address = ref("");
const password = ref("");
const confirmPassword = ref("");

const isIdCardVerified = ref(false);
const isIdCardEdited = ref(false);
const originalIdCard = ref("");
const isPersonalInfoEditable = ref(false);

const phoneNumber = ref("");
const whatsappEnabled = ref(false);

const emit = defineEmits<{
  (e: "back-to-selector"): void;
}>();

const isCurrentStepValid = computed(() => {
  switch (breadcrumOption.value) {
    case "idCard":
      return isValidIdCardFormat(idCard.value);
    case "personalInfo":
      return (
        address.value.trim().length > 0 && phoneNumber.value.trim().length > 0
      );
    case "create":
      return (
        password.value.length >= 8 &&
        confirmPassword.value === password.value &&
        confirmPassword.value.length > 0
      );
    default:
      return false;
  }
});

const primaryButtonText = computed(() => {
  switch (breadcrumOption.value) {
    case "idCard":
      return "Verificar";
    case "personalInfo":
      return "Continuar";
    case "create":
      return "Registrarme";
    default:
      return "Continuar";
  }
});

const shouldDisableIdCardField = computed(() => {
  return (
    isIdCardVerified.value &&
    !isIdCardEdited.value &&
    breadcrumOption.value !== "idCard"
  );
});

const canClearIdCard = computed(() => {
  return (
    !isIdCardVerified.value ||
    isIdCardEdited.value ||
    breadcrumOption.value === "idCard"
  );
});

function isValidIdCardFormat(value: string): boolean {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.length >= 9;
}

function isStepCompleted(step: Step): boolean {
  switch (step) {
    case "idCard":
      return isIdCardVerified.value && !isIdCardEdited.value;
    case "personalInfo":
      return address.value.trim().length > 0 && isStepCompleted("idCard");
    case "create":
      return (
        password.value.length >= 8 &&
        confirmPassword.value === password.value &&
        isStepCompleted("personalInfo")
      );
    default:
      return false;
  }
}

function canNavigateToStep(targetStep: Step): boolean {
  const steps = ["idCard", "personalInfo", "create"];
  const currentIndex = steps.indexOf(breadcrumOption.value);
  const targetIndex = steps.indexOf(targetStep);

  if (targetIndex < currentIndex) {
    return true;
  }

  if (targetIndex > currentIndex) {
    switch (targetStep) {
      case "personalInfo":
        return isIdCardVerified.value && !isIdCardEdited.value;
      case "create":
        return (
          isIdCardVerified.value &&
          !isIdCardEdited.value &&
          address.value.trim().length > 0
        );
      default:
        return false;
    }
  }

  return true;
}

function setNavigation(step: Step) {
  if (!canNavigateToStep(step)) {
    return;
  }

  breadcrumOption.value = step;
}

function prevStep() {
  if (breadcrumOption.value === "idCard") {
    emit("back-to-selector");
  } else {
    switch (breadcrumOption.value) {
      case "personalInfo":
        setNavigation("idCard");
        break;
      case "create":
        setNavigation("personalInfo");
        break;
    }
  }
}

function nextStep() {
  if (!isCurrentStepValid.value) return;

  switch (breadcrumOption.value) {
    case "idCard":
      isIdCardVerified.value = true;
      isIdCardEdited.value = false;
      originalIdCard.value = idCard.value;

      fullName.value = "Martín González";
      company.value = "Ejemplo empresa";

      breadcrumOption.value = "personalInfo";
      break;

    case "personalInfo":
      breadcrumOption.value = "create";
      break;

    case "create":
      console.log("Registrando usuario...");
      break;
  }
}

function toggleEditPersonalInfo() {
  isPersonalInfoEditable.value = !isPersonalInfoEditable.value;
}

function clearIdCard() {
  idCard.value = "";
  isIdCardEdited.value = true;
  isIdCardVerified.value = false;
}

function formatIdCard(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 9)}`;
}

watch(idCard, (newValue, oldValue) => {
  const formatted = formatIdCard(newValue);
  if (formatted !== newValue) {
    idCard.value = formatted;
    return;
  }

  if (
    isIdCardVerified.value &&
    newValue !== originalIdCard.value &&
    newValue !== oldValue
  ) {
    isIdCardEdited.value = true;
  }
});

watch(
  () => isIdCardEdited.value,
  (newValue) => {
    if (newValue && isIdCardVerified.value) {
      isIdCardVerified.value = false;
    }
  },
);
</script>

<style lang="scss" scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border-width: 0;
}

.personal-info-section {
  margin-top: 20px;
  border-radius: 20px;
  border-width: 1px;
  padding: 20px;
  border: 1px solid #f1f3f7;

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__title {
      font-family: Montserrat;
      font-weight: 500;
      font-size: 16px;
      line-height: 100%;
      letter-spacing: 0px;
      vertical-align: middle;
      color: #353e5c;
    }

    button {
      background: none;
      border: none;
      cursor: pointer;
    }
  }
}

.wizard-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.wizard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

%input-field-group {
  display: flex;
  flex-direction: column;
  gap: 7.5px;

  label {
    @include form-label;
  }

  input,
  select,
  textarea {
    @include input-base;
  }
}

.input-field-group {
  @extend %input-field-group;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 2;
  opacity: 0.6;

  &:hover,
  &:focus {
    opacity: 1;
  }

  svg {
    width: 14px;
    height: 14px;
    fill: #718096;
  }
}

.input-field {
  width: 100%;
}

.input-hint {
  font-family: sans-serif;
  font-size: 11.55px;
  color: #718096;
  display: block;
  margin-top: 8px;
}

.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.navigation-buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.navigation-button {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.navigation-button--prev {
  @include secondary-button;
}

.navigation-button--next {
  @include primary-button;
}

.navigation-note {
  height: 21px;
  display: flex;
  justify-content: flex-end;

  small {
    font-style: italic;
    font-size: 14px;
    color: #7a828a;
    text-align: right;
  }
}

.wizard-step-indicator {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.wizard-step-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0;
  margin: 0;
}

.wizard-step-item {
  display: flex;
  align-items: center;
  border: 1px solid #e1e4ed;
  padding: 5px 8px;
  gap: 8px;
  border-radius: 20px;
  cursor: pointer;

  small {
    width: 18px;
    height: 18px;
    border: 1px solid #b4b9c9;
    border-radius: 50%;
    background-color: transparent;
    font-family: $font-family-alt;
    font-weight: 600;
    font-size: 10px;
    line-height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      color: #b4b9c9;
    }
  }

  .step-completed {
    background-color: #ffffff;
    border-color: #0cadbb;
    svg {
      color: #0cadbb;
    }
  }

  span {
    font-family: sans-serif;
    font-size: 14px;
    color: #6d758f;
    font-weight: 500;
    line-height: 100%;
    vertical-align: middle;
  }

  &::after {
    content: "";
    width: 18px;
    height: 1px;
    background-color: #e1e4ed;
    margin-left: 6px;
    margin-right: -25px;
  }

  &:last-child::after {
    content: none;
  }

  &.active {
    small {
      background-color: #0cadbb;
      border-color: #0cadbb;
      span {
        color: #ffffff;
      }

      svg {
        color: #ffffff;
      }
    }
  }
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #353e5c;
}
</style>
