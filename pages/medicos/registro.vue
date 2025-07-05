<template>
  <NuxtLayout name="medicos-autenticacion">
    <section class="register-section">
      <HeaderRegistro />
      <div class="stepper-wrapper">
        <StepperRegistro :steps="steps" :current-step="tab" />
      </div>
      <form @submit.prevent="handleSubmit">
        <!-- Paso 1: Formulario proveedor médico -->
        <div v-if="tab === 1">
          <FormularioProveedorMedico
            :document-type="formData.documentType"
            :document-number="formData.documentNumber"
            :full-name="formData.fullName"
            :email="formData.email"
            :confirm-email="formData.confirmEmail"
            :phone="formData.phone"
            :uploaded-file="formData.uploadedFile"
            :email-mismatch="formData.emailMismatch"
            @update:document-type="updateFormData('documentType', $event)"
            @update:document-number="updateFormData('documentNumber', $event)"
            @update:full-name="updateFormData('fullName', $event)"
            @update:email="updateFormData('email', $event)"
            @update:confirm-email="updateFormData('confirmEmail', $event)"
            @update:phone="updateFormData('phone', $event)"
            @update:uploaded-file="updateFormData('uploadedFile', $event)"
            @update:email-mismatch="updateFormData('emailMismatch', $event)"
            @next="goToNextStep"
          />
        </div>

        <!-- Paso 2: Médicos relacionados -->
        <div v-if="tab === 2">
          <FormularioMedicosRelacionados
            :doctors-list="doctorsList"
            :specialties="specialties"
            :can-add-more-doctors="canAddMoreDoctors"
            :is-form-complete="isFormComplete"
            @toggle-same-info="toggleSameInfo"
            @handle-identity-upload="handleIdentityFileUpload"
            @remove-identity-file="removeIdentityFile"
            @handle-medical-card-upload="handleMedicalCardUpload"
            @remove-medical-card="removeMedicalCard"
            @add-specialty="addSpecialty"
            @remove-specialty="removeSpecialty"
            @add-doctor="addNewDoctor"
            @remove-doctor="removeDoctor"
            @prev="goToPreviousStep"
            @submit="handleSubmit"
          />
        </div>
      </form>

      <hr class="divider" />
      <p class="text-center mt-3">
        <span class="text-muted">Ya tienes Cuenta? </span>
        <NuxtLink href="/pacientes/login" class="link-dark fw-medium">
          Iniciar Sesión
        </NuxtLink>
      </p>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import FormularioMedicosRelacionados from "~/components/medicos/registro/formulario-medicos-relacionados.vue";
import FormularioProveedorMedico from "~/components/medicos/registro/formulario-proveedor-medico.vue";
import HeaderRegistro from "~/components/medicos/registro/header-registro.vue";
import StepperRegistro from "~/components/medicos/registro/stepper-registro.vue";

definePageMeta({
  middleware: ["auth-login"],
});

interface FormData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  uploadedFile: File | null;
  emailMismatch: boolean;
}

interface Doctor {
  useSameInfo: boolean;
  documentType: string;
  documentNumber: string;
  fullName: string;
  doctorCode: string;
  doctorType: string;
  specialties: Array<{ id: number; code: string; name: string }>;
  identityDocument: File | null;
  medicalCard: File | null;
  selectedSpecialty?: { id: number; code: string; name: string } | null;
  identityFileError?: string;
  medicalCardError?: string;
}

const tab = ref(1);

const formData = reactive<FormData>({
  documentType: "",
  documentNumber: "",
  fullName: "",
  email: "",
  confirmEmail: "",
  phone: "",
  uploadedFile: null,
  emailMismatch: false,
});

const doctorsList = ref<Doctor[]>([
  {
    useSameInfo: false,
    documentType: "",
    documentNumber: "",
    fullName: "",
    doctorCode: "",
    doctorType: "",
    specialties: [],
    identityDocument: null,
    medicalCard: null,
    selectedSpecialty: null,
  },
]);

const specialties = ref([
  { id: 1, code: "ophthalmology", name: "Oftalmología" },
  { id: 2, code: "cardiology", name: "Cardiología" },
  { id: 3, code: "dermatology", name: "Dermatología" },
]);

const steps = [
  "Formulario de registro de proveedor de servicios médicos",
  "Formulario médicos relacionados",
];

const updateFormData = (key: keyof FormData, value: any) => {
  (formData as any)[key] = value;
};

const canAddMoreDoctors = computed(() => {
  const allDoctorsComplete = doctorsList.value.every(
    (doctor) =>
      (doctor.useSameInfo ||
        (doctor.documentType && doctor.documentNumber && doctor.fullName)) &&
      doctor.doctorCode &&
      doctor.doctorType &&
      doctor.specialties.length > 0
  );
  return allDoctorsComplete && doctorsList.value.length < 5;
});

const isFormComplete = computed(() => {
  return (
    doctorsList.value.length > 0 &&
    doctorsList.value.every(
      (doctor) =>
        doctor.doctorCode && doctor.doctorType && doctor.specialties.length > 0
    )
  );
});

const goToNextStep = () => {
  tab.value = 2;
};

const goToPreviousStep = () => {
  tab.value = 1;
};

const handleSubmit = async () => {
  console.log("Datos del formulario:", {
    proveedorMedico: formData,
    medicosRelacionados: doctorsList.value,
  });
};

const toggleSameInfo = (index: number) => {
  const doctor = doctorsList.value[index];
  if (doctor.useSameInfo) {
    doctor.documentType = formData.documentType;
    doctor.documentNumber = formData.documentNumber;
    doctor.fullName = formData.fullName;
  } else {
    doctor.documentType = "";
    doctor.documentNumber = "";
    doctor.fullName = "";
  }
};

const handleIdentityFileUpload = (index: number, file: File) => {
  doctorsList.value[index].identityDocument = file;
  doctorsList.value[index].identityFileError = "";
};

const removeIdentityFile = (index: number) => {
  doctorsList.value[index].identityDocument = null;
  doctorsList.value[index].identityFileError = "";
};

const handleMedicalCardUpload = (index: number, file: File) => {
  doctorsList.value[index].medicalCard = file;
  doctorsList.value[index].medicalCardError = "";
};

const removeMedicalCard = (index: number) => {
  doctorsList.value[index].medicalCard = null;
  doctorsList.value[index].medicalCardError = "";
};

const addSpecialty = (index: number) => {
  const doctor = doctorsList.value[index];
  if (
    doctor.selectedSpecialty &&
    !doctor.specialties.some((s) => s.code === doctor.selectedSpecialty!.code)
  ) {
    doctor.specialties.push(doctor.selectedSpecialty);
    doctor.selectedSpecialty = null;
  }
};

const removeSpecialty = (index: number, specIndex: number) => {
  doctorsList.value[index].specialties.splice(specIndex, 1);
};

const addNewDoctor = () => {
  if (canAddMoreDoctors.value) {
    doctorsList.value.push({
      useSameInfo: false,
      documentType: "",
      documentNumber: "",
      fullName: "",
      doctorCode: "",
      doctorType: "",
      specialties: [],
      identityDocument: null,
      medicalCard: null,
      selectedSpecialty: null,
    });
  }
};

const removeDoctor = (index: number) => {
  doctorsList.value.splice(index, 1);
};
</script>
