<template>
  <WebsiteNav />
  <main class="d-flex" style="background-color: #f8f8f8">
    <section class="left text-center d-sm-flex d-none">
      <NuxtLink class="logo" href="/"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink Logo"
      /></NuxtLink>
      <img src="@/src/assets/img-doctor-login.png" alt="" />
      <p class="fs-5 w-50 fw-normal text-muted">
        ¡Comienza tu viaje hacia un mejor cuidado de la salud hoy mismo!
      </p>
    </section>

    <section class="right bg-light">
      <div class="d-flex align-items-center justify-content-between">
        <h2 class="h1 fw-bold fs-2 text-primary m-0">Registrarse</h2>
        <span class="text-primary">Es gratis y fácil</span>
      </div>
      <div class="fw-semibold my-4 d-flex">
        <WebsiteStepper :steps="steps" :currentStep="tab" />
      </div>
      <form @submit.prevent="register">
        <div v-if="tab === 1">
          <label class="form-label mb-4 text-dark text-capitalize"
            >Completa los datos de registro</label
          >
          <div class="row row-cols-2">
            <div class="form-group mb-4">
              <label for="documentType" class="form-label text-capitalize"
                >Tipo de documento de identidad</label
              >
              <select
                v-model="documentType"
                id="documentType"
                class="form-select"
                required
              >
                <option value="" disabled selected>
                  Seleccione tipo de documento
                </option>
                <option value="dni">DNI</option>
                <option value="passport">Pasaporte</option>
                <option value="ruc">RUC</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div class="form-group mb-4">
              <label for="documentNumber" class="form-label text-capitalize"
                >Número de documento:</label
              >
              <input
                v-model="documentNumber"
                type="text"
                class="form-control"
                placeholder="Ingrese su número de documento"
                id="documentNumber"
                required
              />
            </div>
          </div>

          <div class="form-group mb-4">
            <label for="fullName" class="form-label text-capitalize">
              Nombre y Apellidos / Razón Social (En caso de personas jurídicas)
            </label>
            <input
              v-model="fullName"
              type="text"
              class="form-control"
              placeholder="Ingrese nombre completo o razón social"
              id="fullName"
              required
            />
          </div>

          <div class="file-upload-container mb-3">
            <label for="documentUpload" class="form-label text-capitalize"
              >Contrato</label
            >
            <input
              type="file"
              id="documentUpload"
              ref="fileInput"
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx"
              class="d-none"
              required
            />
            <label
              for="documentUpload"
              class="d-flex flex-wrap w-50 align-items-center justify-content-between gap-2 bg-primary-subtle p-3 cursor-pointer"
              :class="{ 'border border-success': uploadedFile }"
            >
              <div
                class="d-flex flex-column text-center align-items-center gap-2"
              >
                <AtomsIconsUploadContractIcon />
                <span v-if="!uploadedFile">
                  Arrastra un archivo o haz click para buscar en tu ordenador
                </span>
                <span v-else class="text-success">
                  Documento cargado: {{ uploadedFile.name }}
                </span>
              </div>
              <button
                v-if="uploadedFile"
                @click.stop="removeFile"
                class="btn btn-sm btn-outline-danger"
                type="button"
              >
                Eliminar
              </button>
            </label>
            <div v-if="fileError" class="text-danger small mt-2">
              {{ fileError }}
            </div>
          </div>

          <hr />

          <div class="row row-cols-2">
            <div class="form-group mb-4">
              <label for="email" class="form-label text-capitalize"
                >Correo Electrónico</label
              >
              <input
                v-model="email"
                type="email"
                class="form-control"
                placeholder="Escribe tu correo electrónico"
                id="email"
                required
              />
            </div>
            <div class="form-group mb-4">
              <label for="confirmEmail" class="form-label text-capitalize"
                >Confirmar Correo Electrónico</label
              >
              <input
                v-model="confirmEmail"
                type="email"
                class="form-control"
                placeholder="Confirma tu correo electrónico"
                id="confirmEmail"
                required
              />
              <div v-if="emailMismatch" class="text-danger small mt-1">
                Los correos electrónicos no coinciden
              </div>
            </div>
          </div>

          <div class="form-group mb-4">
            <label for="phone" class="form-label text-capitalize"
              >Teléfono de contacto</label
            >
            <input
              v-model="phone"
              type="tel"
              class="form-control"
              placeholder="Ingrese su número telefónico"
              id="phone"
              required
            />
          </div>

          <button
            @click="validateStep1"
            class="btn btn-primary"
            :disabled="!isStep1Valid"
          >
            Paso 2: Agregar médicos relacionados
            <AtomsIconsArrowRightIcon />
          </button>
        </div>
        <div v-if="tab === 2">
          <label class="form-label mb-4 text-dark text-capitalize">
            Esta sección hace referencia al o los médicos relacionados al
            contrato. En caso de estar el contrato a título personal (persona
            física) colocar sus datos personales
          </label>

          <!-- Doctor Sections -->
          <div
            v-for="(doctor, index) in doctorsList"
            :key="index"
            class="doctor-section mb-5 border-bottom pb-4"
          >
            <h4 v-if="index > 0" class="mb-3 text-primary">
              Médico adicional #{{ index + 1 }}
            </h4>

            <!-- Same Info Checkbox (only for first doctor) -->
            <div class="mb-3 form-check" v-if="index === 0">
              <input
                v-model="doctor.useSameInfo"
                type="checkbox"
                class="form-check-input border-dark"
                :id="`sameInfoCheckbox-${index}`"
                @change="toggleSameInfo(index)"
              />
              <label
                class="form-check-label"
                :for="`sameInfoCheckbox-${index}`"
              >
                Misma información que el paso 1
              </label>
            </div>

            <!-- Document Info -->
            <div class="row row-cols-2">
              <div class="form-group mb-4">
                <label
                  :for="`doctorDocumentType-${index}`"
                  class="form-label text-capitalize"
                >
                  Tipo de documento de identidad
                </label>
                <select
                  v-model="doctor.documentType"
                  :id="`doctorDocumentType-${index}`"
                  class="form-select"
                  :disabled="doctor.useSameInfo"
                  required
                >
                  <option value="" disabled selected>
                    Seleccione tipo de documento
                  </option>
                  <option value="dni">DNI</option>
                  <option value="passport">Pasaporte</option>
                  <option value="ruc">RUC</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div class="form-group mb-4">
                <label
                  :for="`doctorDocumentNumber-${index}`"
                  class="form-label text-capitalize"
                >
                  Número de documento:
                </label>
                <input
                  v-model="doctor.documentNumber"
                  type="text"
                  class="form-control"
                  placeholder="Ingrese su número de documento"
                  :id="`doctorDocumentNumber-${index}`"
                  :disabled="doctor.useSameInfo"
                  required
                />
              </div>
            </div>

            <!-- Full Name -->
            <div class="form-group mb-4">
              <label
                :for="`doctorFullName-${index}`"
                class="form-label text-capitalize"
              >
                Nombre y Apellidos
              </label>
              <input
                v-model="doctor.fullName"
                type="text"
                class="form-control"
                placeholder="Ingrese nombre completo"
                :id="`doctorFullName-${index}`"
                :disabled="doctor.useSameInfo"
                required
              />
            </div>

            <!-- Identity Document Upload -->
            <div class="file-upload-container w-50 mb-3">
              <label
                :for="`identityDocumentUpload-${index}`"
                class="form-label text-capitalize"
              >
                Documento de identidad
              </label>
              <input
                type="file"
                :id="`identityDocumentUpload-${index}`"
                :ref="`identityFileInput-${index}`"
                @change="(event) => handleIdentityFileUpload(index, event)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                class="d-none"
              />
              <label
                :for="`identityDocumentUpload-${index}`"
                class="d-flex flex-wrap w-50 align-items-center justify-content-between gap-2 bg-primary-subtle p-3 cursor-pointer"
                :class="{
                  'border border-success': doctor.identityDocument,
                }"
                :style="doctor.useSameInfo ? 'cursor: not-allowed' : ''"
              >
                <div
                  class="d-flex flex-column text-center align-items-center gap-2"
                >
                  <AtomsIconsUploadContractIcon />
                  <span v-if="!doctor.identityDocument && !doctor.useSameInfo">
                    Arrastra para subir Archivo
                  </span>

                  <span v-else class="text-success">
                    Documento cargado: {{ doctor.identityDocument.name }}
                  </span>
                </div>
                <button
                  v-if="doctor.identityDocument && !doctor.useSameInfo"
                  @click.stop="removeIdentityFile(index)"
                  class="btn btn-sm btn-outline-danger"
                  type="button"
                >
                  Eliminar
                </button>
              </label>
              <div
                v-if="doctor.identityFileError"
                class="text-danger small mt-2"
              >
                {{ doctor.identityFileError }}
              </div>
            </div>

            <!-- Doctor Code -->
            <div class="form-group mb-4">
              <label
                :for="`doctorCode-${index}`"
                class="form-label text-capitalize"
              >
                Código de médico
              </label>
              <input
                v-model="doctor.doctorCode"
                type="text"
                class="form-control"
                placeholder="Ingrese el código de médico"
                :id="`doctorCode-${index}`"
                :disabled="!isDoctorBasicInfoComplete(index)"
                required
              />
            </div>

            <!-- Medical Card Upload -->
            <div class="file-upload-container w-50 mb-3">
              <label
                :for="`medicalCardUpload-${index}`"
                class="form-label text-capitalize"
              >
                Carnet vigente
              </label>
              <input
                type="file"
                :id="`medicalCardUpload-${index}`"
                :ref="`medicalCardInput-${index}`"
                @change="(event) => handleMedicalCardUpload(index, event)"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                class="d-none"
                :disabled="!isDoctorBasicInfoComplete(index)"
                :required="isDoctorBasicInfoComplete(index)"
              />
              <label
                :for="`medicalCardUpload-${index}`"
                class="d-flex flex-wrap w-50 align-items-center justify-content-between gap-2 bg-primary-subtle p-3 cursor-pointer"
                :class="{
                  'border border-success': doctor.medicalCard,
                  'bg-light': !isDoctorBasicInfoComplete(index),
                }"
                :style="
                  !isDoctorBasicInfoComplete(index) ? 'cursor: not-allowed' : ''
                "
              >
                <div
                  class="d-flex flex-column text-center align-items-center gap-2"
                >
                  <AtomsIconsUploadContractIcon />
                  <span
                    v-if="
                      !doctor.medicalCard && isDoctorBasicInfoComplete(index)
                    "
                  >
                    Arrastra para subir Archivo
                  </span>
                  <span
                    v-else-if="!isDoctorBasicInfoComplete(index)"
                    class="text-muted"
                  >
                    Complete la información básica primero
                  </span>
                  <span v-else class="text-success">
                    Documento cargado: {{ doctor.medicalCard.name }}
                  </span>
                </div>
                <button
                  v-if="doctor.medicalCard && isDoctorBasicInfoComplete(index)"
                  @click.stop="removeMedicalCard(index)"
                  class="btn btn-sm btn-outline-danger"
                  type="button"
                >
                  Eliminar
                </button>
              </label>
              <div
                v-if="doctor.medicalCardError"
                class="text-danger small mt-2"
              >
                {{ doctor.medicalCardError }}
              </div>
            </div>

            <!-- Doctor Type -->
            <div class="form-group mb-4">
              <label
                :for="`doctorType-${index}`"
                class="form-label text-capitalize"
              >
                Tipo de médico
              </label>
              <select
                :id="`doctorType-${index}`"
                class="form-select"
                v-model="doctor.doctorType"
                :disabled="!isDoctorBasicInfoComplete(index)"
                required
              >
                <option value="" disabled>Seleccione un tipo</option>
                <option value="general">Médico General</option>
                <option value="specialist">Especialista</option>
                <option value="surgeon">Cirujano</option>
              </select>
            </div>

            <!-- Specialties -->
            <div class="form-group mb-4">
              <label
                :for="`medicalSpecialty-${index}`"
                class="form-label text-capitalize"
              >
                Especialidad (máximo 3)
              </label>
              <select
                v-model="doctor.selectedSpecialty"
                class="form-select"
                :disabled="
                  !isDoctorBasicInfoComplete(index) ||
                  doctor.specialties.length >= 3
                "
                @change="addSpecialty(index)"
              >
                <option value="" disabled>Seleccione una especialidad</option>
                <option
                  v-for="specialty in specialties"
                  :key="specialty.code"
                  :value="specialty"
                  :disabled="
                    doctor.specialties.some((s) => s.code === specialty.code)
                  "
                >
                  {{ specialty.name }}
                </option>
              </select>
              <div class="mt-2" v-if="doctor.specialties.length > 0">
                <span
                  v-for="(specialty, specIndex) in doctor.specialties"
                  :key="specIndex"
                  class="badge bg-primary-subtle text-primary me-1 rounded-5"
                >
                  {{ specialty.name }}
                  <button
                    type="button"
                    class="btn-close btn-close-primary ms-1"
                    aria-label="Remove"
                    @click="removeSpecialty(index, specIndex)"
                  ></button>
                </span>
              </div>
              <small class="text-muted" v-if="doctor.specialties.length >= 3">
                Has alcanzado el máximo de 3 especialidades
              </small>
            </div>

            <!-- Remove Doctor Button (for additional doctors) -->
            <button
              v-if="index > 0"
              @click="removeDoctor(index)"
              class="btn btn-outline-danger mb-4"
              type="button"
            >
              Eliminar médico
            </button>
          </div>

          <!-- Add Another Doctor Button -->
          <button
            @click="addNewDoctor"
            class="btn btn-primary mb-4"
            :disabled="!canAddMoreDoctors"
            type="button"
          >
            + Agregar otro médico relacionado
          </button>

          <!-- Navigation Buttons -->
          <div class="d-flex flex-column gap-2">
            <button @click="tab = 1" class="btn btn-light border-dark w-100">
              <AtomsIconsArrowLeftIcon />
              Volver Atrás
            </button>
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="!isFormComplete"
            >
              Registrarme
            </button>
          </div>
        </div>
        <div class="modal-footer justify-content-center" v-if="errorText">
          <p>{{ errorText }}</p>
        </div>
      </form>
      <hr />
      <p class="text-center">
        <small class="text-muted">O hacerlo con estas cuentas</small>
      </p>
      <div class="text-center">
        <button class="btn btn-light border-dark-subtle">
          <AtomsIconsGoogleIcon />
        </button>
        <button class="btn btn-light border-dark-subtle mx-4">
          <AtomsIconsAppleIcon />
        </button>
        <button class="btn btn-light border-dark-subtle">
          <AtomsIconsFacebookIcon />
        </button>
      </div>
      <p class="text-center mt-3">
        <span class="text-muted">Ya tienes Cuenta? </span>
        <NuxtLink href="/pacientes/login" class="btn-link text-dark fw-medium"
          >Iniciar Sesión</NuxtLink
        >
      </p>
    </section>
  </main>
</template>

<script setup>
definePageMeta({
  middleware: ["auth-login"],
});
const config = useRuntimeConfig();
const router = useRouter();
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const first_name = ref("");
const last_name = ref("");
const phone_number = ref("");
const date_birth = ref("");
const medical_number = ref("");
const hospital_name = ref("");
const selectedSpecialty = ref("");
const specialtiesSelected = ref([]);
const tab = ref(1);
const errorPassword = ref("");
const errorText = ref(null);

const documentType = ref("");
const documentNumber = ref("");
const fullName = ref("");
const confirmEmail = ref("");
const phone = ref("");
const uploadedFile = ref(null);
const fileError = ref("");
const emailMismatch = ref(false);
const useSameInfo = ref(false);
const doctorDocumentType = ref("");
const doctorDocumentNumber = ref("");
const doctorFullName = ref("");
const doctorCode = ref("");
const selectedDoctorType = ref("");
const identityUploadedFile = ref(null);
const medicalCardUploaded = ref(null);
const identityFileError = ref("");
const medicalCardError = ref("");
const doctorTypes = ref([
  { value: "general", label: "Médico General" },
  { value: "specialist", label: "Especialista" },
  { value: "surgeon", label: "Cirujano" },
  // Add more types as needed
]);

const doctorsList = ref([
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
  },
]);

// Agregar nuevo médico
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
    });
  }
};

// Eliminar médico
const removeDoctor = (index) => {
  doctorsList.value.splice(index, 1);
};

// Alternar información del paso 1
const toggleSameInfo = (index) => {
  const doctor = doctorsList.value[index];
  if (doctor.useSameInfo) {
    // Copiar datos del paso 1
    doctor.documentType = documentType.value;
    doctor.documentNumber = documentNumber.value;
    doctor.fullName = fullName.value;
  } else {
    // Limpiar campos
    doctor.documentType = "";
    doctor.documentNumber = "";
    doctor.fullName = "";
  }
};

// Verificar si se puede agregar más médicos
const canAddMoreDoctors = computed(() => {
  // Verificar que todos los médicos actuales estén completos
  const allDoctorsComplete = doctorsList.value.every(
    (doctor) =>
      (doctor.useSameInfo ||
        (doctor.documentType && doctor.documentNumber && doctor.fullName)) &&
      doctor.doctorCode &&
      doctor.doctorType &&
      doctor.specialties.length > 0
  );

  return allDoctorsComplete && doctorsList.value.length < 5; // Límite de 5 médicos
});

// Verificar si la información básica del médico está completa
const isDoctorBasicInfoComplete = (index) => {
  const doctor = doctorsList.value[index];
  return (
    doctor.useSameInfo ||
    (doctor.documentType && doctor.documentNumber && doctor.fullName)
  );
};

// Verificar si el formulario está completo
const isFormComplete = computed(() => {
  return (
    doctorsList.value.length > 0 &&
    doctorsList.value.every(
      (doctor) =>
        doctor.doctorCode && doctor.doctorType && doctor.specialties.length > 0
    )
  );
});

// Computed properties
const doctorInfoComplete = computed(() => {
  if (useSameInfo.value) return true;

  return (
    doctorDocumentType.value &&
    doctorDocumentNumber.value &&
    doctorFullName.value &&
    identityUploadedFile.value
  );
});

// Update these functions in your script section
const handleIdentityFileUpload = (index, event) => {
  const file = event.target.files[0];
  const doctor = doctorsList.value[index];
  if (file) {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      doctor.identityFileError =
        "Solo se permiten archivos PDF, Word o imágenes";
      return;
    }

    if (file.size > maxSize) {
      doctor.identityFileError = "El archivo no debe exceder 5MB";
      return;
    }

    doctor.identityDocument = file;
    doctor.identityFileError = "";
  }
};

const handleMedicalCardUpload = (index, event) => {
  const file = event.target.files[0];
  const doctor = doctorsList.value[index];
  if (file) {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      doctor.medicalCardError =
        "Solo se permiten archivos PDF, Word o imágenes";
      return;
    }

    if (file.size > maxSize) {
      doctor.medicalCardError = "El archivo no debe exceder 5MB";
      return;
    }

    doctor.medicalCard = file;
    doctor.medicalCardError = "";
  }
};

// Also update the remove functions
const removeIdentityFile = (index) => {
  doctorsList.value[index].identityDocument = null;
  doctorsList.value[index].identityFileError = "";
};

const removeMedicalCard = (index) => {
  doctorsList.value[index].medicalCard = null;
  doctorsList.value[index].medicalCardError = "";
};

const addSpecialty = (index) => {
  const doctor = doctorsList.value[index];
  if (
    doctor.selectedSpecialty &&
    !doctor.specialties.some((s) => s.code === doctor.selectedSpecialty.code)
  ) {
    doctor.specialties.push(doctor.selectedSpecialty);
    doctor.selectedSpecialty = null;
  }
};

const addAnotherDoctor = () => {
  // Save current doctor to the list
  doctorsList.value.push({
    documentType: doctorDocumentType.value,
    documentNumber: doctorDocumentNumber.value,
    fullName: doctorFullName.value,
    doctorCode: doctorCode.value,
    doctorType: selectedDoctorType.value,
    specialties: [...specialtiesSelected.value],
    identityDocument: identityUploadedFile.value,
    medicalCard: medicalCardUploaded.value,
  });

  // Reset fields for new doctor
  useSameInfo.value = false;
  doctorDocumentType.value = "";
  doctorDocumentNumber.value = "";
  doctorFullName.value = "";
  doctorCode.value = "";
  selectedDoctorType.value = "";
  selectedSpecialty.value = "";
  specialtiesSelected.value = [];
  identityUploadedFile.value = null;
  medicalCardUploaded.value = null;
};

// Update register function to handle multiple doctors
const register = async () => {
  // Prepare form data
  const formData = new FormData();

  // Step 1 data
  formData.append("document_type", documentType.value);
  formData.append("document_number", documentNumber.value);
  formData.append("full_name", fullName.value);
  formData.append("email", email.value);
  formData.append("phone", phone.value);
  formData.append("contract", uploadedFile.value);

  // Add all doctors' data
  doctorsList.value.forEach((doctor, index) => {
    formData.append(`doctors[${index}][document_type]`, doctor.documentType);
    formData.append(
      `doctors[${index}][document_number]`,
      doctor.documentNumber
    );
    formData.append(`doctors[${index}][full_name]`, doctor.fullName);
    formData.append(`doctors[${index}][doctor_code]`, doctor.doctorCode);
    formData.append(`doctors[${index}][doctor_type]`, doctor.doctorType);
    formData.append(
      `doctors[${index}][specialties]`,
      JSON.stringify(doctor.specialties)
    );
    if (doctor.identityDocument) {
      formData.append(
        `doctors[${index}][identity_document]`,
        doctor.identityDocument
      );
    }
    if (doctor.medicalCard) {
      formData.append(`doctors[${index}][medical_card]`, doctor.medicalCard);
    }
  });

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/users/register_doctor",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (data.value) {
      router.push("/");
    }
    if (error.value) {
      console.error(error.value);
      errorText.value = error.value.data?.info || "Error en el registro";
    }
  } catch (err) {
    console.error(err);
    errorText.value = "Error en la conexión";
  }
};

// File upload handling
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type and size
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      fileError.value = "Solo se permiten archivos PDF o Word";
      return;
    }

    if (file.size > maxSize) {
      fileError.value = "El archivo no debe exceder 5MB";
      return;
    }

    uploadedFile.value = file;
    fileError.value = "";
  }
};

const removeFile = () => {
  uploadedFile.value = null;
  fileError.value = "";
};

// Validation for step 1
const validateStep1 = () => {
  // Check email match
  if (email.value !== confirmEmail.value) {
    emailMismatch.value = true;
    return;
  }
  emailMismatch.value = false;

  // If all valid, proceed to next step
  tab.value = 2;
};

// Computed property to check if step 1 is valid
const isStep1Valid = computed(() => {
  return (
    documentType.value &&
    documentNumber.value &&
    fullName.value &&
    email.value &&
    confirmEmail.value &&
    phone.value &&
    uploadedFile.value &&
    email.value === confirmEmail.value
  );
});

const specialties = ref([
  { id: 1, code: "ophthalmology", name: "Oftalmología" },
  { id: 2, code: "cardiology", name: "Cardiología" },
  { id: 3, code: "dermatology", name: "Dermatología" },
  // Add more specialties as needed
]);

// Mock Services API Response
const availableServices = ref([
  { id: 1, code: "surgery", name: "Cirugía" },
  { id: 2, code: "consultation", name: "Consulta" },
  { id: 3, code: "tests", name: "Pruebas Diagnósticas" },
  // Add more services as needed
]);

const selectedService = ref("");
const selectedServices = ref([]);

watch(selectedService, (newService) => {
  if (newService && !selectedServices.value.includes(newService)) {
    selectedServices.value.push(newService);
    selectedService.value = ""; // Reset the dropdown
  }
});

watch(selectedSpecialty, (newSpecialty) => {
  console.log(selectedSpecialty);
  if (newSpecialty && !specialtiesSelected.value.includes(newSpecialty)) {
    specialtiesSelected.value.push(newSpecialty);
    selectedSpecialty.value = ""; // Reset selection
  }
});

const removeService = (serviceToRemove) => {
  selectedServices.value = selectedServices.value.filter(
    (service) => service !== serviceToRemove
  );
};

const removeSpecialty = (specialtyToRemove) => {
  specialtiesSelected.value = specialtiesSelected.value.filter(
    (specialty) => specialty !== specialtyToRemove
  );
};

const steps = [
  "Formulario de registro de proveedor de servicios médicos",
  "Formulario médicos relacionados",
];

/*const { data: specialties } = await useFetch(
  config.public.API_BASE_URL + "/specialties",
  {
    transform: (_specialties) => _specialties.data,
  }
);*/

const nextStep = () => {
  const { value: firstNameValue } = first_name;
  const { value: lastNameValue } = last_name;
  const { value: phoneNumberValue } = phone_number;
  const { value: dateOfBirthValue } = date_birth;
  const { value: emailValue } = email;
  const { value: passwordValue } = password;
  const { value: passwordConfirmationValue } = passwordConfirmation;

  if (
    firstNameValue &&
    lastNameValue &&
    phoneNumberValue &&
    dateOfBirthValue &&
    emailValue &&
    passwordValue &&
    passwordConfirmationValue
  ) {
    if (passwordValue === passwordConfirmationValue) {
      tab.value = 2;
    } else {
      errorPassword.value = "Passwords do not match";
    }
  }
};
</script>

<style src="@/assets/styles/vitalink.scss" />

<style lang="scss" scoped>
main {
  height: 100vh;
}

.left,
.right {
  width: 100%;
  height: 100%;
}

.left {
  background-color: #ebecf7;
  background-image: url("@/src/assets/bg-login.svg");
  background-size: 100% auto;
  background-position: center center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
  background-repeat: no-repeat;
}

.right {
  padding: 2rem;

  flex-direction: column;
  justify-content: center;
  // align-items: center;
  overflow-y: auto;
}

.btn-custom {
  height: 10rem;
  width: 10rem;
  display: flex;
  margin: 1rem;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  text-decoration: none;
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center 1.5rem;

  &-active {
    background-color: #3541b4;
    box-shadow:
      13px 9px 51.3px 0px rgba(0, 0, 0, 0.15),
      0 0 0 9px #c2ebee;
    background-image: url("@/src/assets/img-icon-medico-active.svg");

    &-text {
      background: linear-gradient(0deg, #0cadbb 35.25%, #c2ebee 149.99%);
      color: white;
    }
  }

  &-inactive {
    background-color: white;
    background-image: url("@/src/assets/img-icon-clinica-inactive.svg");

    &-text {
      background-color: #e7f7f8;
      color: #85d6dd;
    }
  }

  &-text {
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    border-radius: 0.7rem;
  }
}
</style>
