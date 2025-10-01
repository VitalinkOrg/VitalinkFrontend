<template>
  <NuxtLayout name="medicos-autenticacion">
    <section class="register">
      <HeaderRegistro />
      <div class="register__stepper">
        <MedicosRegistroStepperRegistro :steps="steps" :current-step="tab" />
      </div>
      <form @submit.prevent="handleSubmit" class="register__form">
        <div v-if="tab === 1" class="register__step">
          <MedicosRegistroFormularioProveedorMedico
            :supplierFormData="supplierFormData"
            @update:supplierFormData="updateSupplierFormData"
            @next="goToNextStep"
          />
        </div>

        <div v-if="tab === 2" class="register__step">
          <MedicosRegistroFormularioMedicosRelacionados
            :supplierFormData="supplierFormData"
            :relatedMedicalFormData="relatedMedicalFormData"
            :loading="isLoadingSubmit"
            @updateRelatedMedicalFormData="updateRelatedMedicalFormData"
            @prev="goToPreviousStep"
            @submit="handleSubmit"
          />
        </div>
      </form>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useAuth, useDocuments, useSupplier } from "@/composables/api";
import type { IRelatedMedicalFormData, ISupplierFormData } from "@/types";
import type { CreateSupplier } from "~/composables/api/useSupplier";

const { uploadDocument } = useDocuments();
const { createSupplier, uploadSpecialtyBySupplier } = useSupplier();
const { register, login, fetchUserInfo } = useAuth();
const { setAuthenticated, setRole } = useAuthState();
const { setToken, setRefreshToken } = useAuthToken();
const { setUserInfo } = useUserInfo();
const router = useRouter();

const tab = ref(1);
const legalRepresentativeId = ref<string>("");
const isLoadingSubmit = ref<boolean>(false);

const supplierFormData = ref<ISupplierFormData>({
  documentType: "",
  documentNumber: "",
  fullName: "",
  contratcFile: null,
  codeContract: "",
  contratcId: 0,
  email: "",
  phone: "",
  password: "",
});

const relatedMedicalFormData = ref<IRelatedMedicalFormData[]>([
  {
    documentType: "",
    documentNumber: "",
    fullName: "",
    identityDocumentFile: null,
    medicalCode: "",
    validLicenseFile: null,
    medicalType: "",
    specialties: [],
    useSameDataAsSupplier: false,
  },
]);

const steps = [
  "Formulario de registro de proveedor de servicios médicos",
  "Formulario médicos relacionados",
];

const updateSupplierFormData = (newData: ISupplierFormData) => {
  supplierFormData.value = { ...newData };
};

const updateRelatedMedicalFormData = (
  index: number,
  newData: Partial<IRelatedMedicalFormData> | null
) => {
  if (newData === null) {
    if (index > 0 && index < relatedMedicalFormData.value.length) {
      relatedMedicalFormData.value.splice(index, 1);
    }
    return;
  }

  if (index >= relatedMedicalFormData.value.length) {
    const newDoctor: IRelatedMedicalFormData = {
      documentType: "",
      documentNumber: "",
      fullName: "",
      identityDocumentFile: null,
      medicalCode: "",
      validLicenseFile: null,
      medicalType: "",
      specialties: [],
      ...newData,
    };
    relatedMedicalFormData.value.push(newDoctor);
    return;
  }

  if (index >= 0 && index < relatedMedicalFormData.value.length) {
    relatedMedicalFormData.value[index] = {
      ...relatedMedicalFormData.value[index],
      ...newData,
    };
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleSubmit = async (): Promise<void> => {
  isLoadingSubmit.value = true;

  let accessToken: string | undefined;

  try {
    if (!supplierFormData.value.contratcFile) {
      throw new Error("Archivo de contrato requerido");
    }

    const codeContract = await handleUploadFile(
      supplierFormData.value.contratcFile,
      "PRIVATE_CONTRACT"
    );

    if (!codeContract) {
      throw new Error("Error subiendo contrato");
    }

    await delay(1000);

    const representativeId =
      await handleRegisterLegalRepresentative(codeContract);
    legalRepresentativeId.value = representativeId;

    await delay(1000);

    accessToken = await handleLogin();
    if (!accessToken) {
      throw new Error("No se pudo obtener el token de autenticación");
    }

    await delay(1000);

    const identityDocumentCodes: string[] = [];

    for (let i = 0; i < relatedMedicalFormData.value.length; i++) {
      const supplier = relatedMedicalFormData.value[i];
      if (!supplier.identityDocumentFile) {
        throw new Error(
          `Documento de identidad requerido para médico ${i + 1}`
        );
      }

      const code = await handleUploadFile(
        supplier.identityDocumentFile,
        "PERSONAL_DOCUMENT"
      );
      identityDocumentCodes.push(code);

      if (i < relatedMedicalFormData.value.length - 1) {
        await delay(1500);
      }
    }

    await delay(1000);

    const licenseFileCodes: string[] = [];

    for (let i = 0; i < relatedMedicalFormData.value.length; i++) {
      const supplier = relatedMedicalFormData.value[i];
      if (!supplier.validLicenseFile) {
        throw new Error(`Licencia médica requerida para médico ${i + 1}`);
      }

      const code = await handleUploadFile(
        supplier.validLicenseFile,
        "PERSONAL_DOCUMENT"
      );
      licenseFileCodes.push(code);

      if (i < relatedMedicalFormData.value.length - 1) {
        await delay(1500);
      }
    }

    await delay(1000);

    for (let i = 0; i < relatedMedicalFormData.value.length; i++) {
      const supplier = relatedMedicalFormData.value[i];
      const codeCardIdFile = identityDocumentCodes[i];
      const codeMedicalLicenseFile = licenseFileCodes[i];

      if (!codeCardIdFile || !codeMedicalLicenseFile) {
        throw new Error(
          `Error obteniendo códigos de documentos para médico ${i + 1}`
        );
      }

      await handleCreateSupplier(
        supplier,
        legalRepresentativeId.value,
        codeCardIdFile,
        codeMedicalLicenseFile,
        accessToken
      );

      if (i < relatedMedicalFormData.value.length - 1) {
        await delay(1000);
      }
    }

    localStorage.setItem("onboarding", "true");
    router.push("/medicos/inicio");
  } catch (error) {
    console.error("Error en el registro:", error);
    isLoadingSubmit.value = false;
  }
};

const handleUploadFile = async (
  file: File,
  actionType: string
): Promise<string> => {
  const fields = {
    title: file.name,
    type: "DOC",
    description: "Private document uploaded during medical registration",
    id_for_table: 6,
    table: "",
    action_type: actionType,
    user_id: "",
    is_public: 0,
  };

  const api = uploadDocument(file, fields);
  await api.request();

  if (api.error.value) {
    throw new Error(`Error subiendo documento: ${api.error.value}`);
  }

  const code = api.response.value?.data?.code;

  if (!code) {
    throw new Error("No se pudo obtener el código del documento");
  }

  return code;
};

const handleRegisterLegalRepresentative = async (
  codeContract: string
): Promise<string> => {
  const body = {
    card_id: supplierFormData.value.documentNumber,
    id_type: supplierFormData.value.documentType,
    name: supplierFormData.value.fullName,
    email: supplierFormData.value.email,
    password: supplierFormData.value.password,
    gender: "M",
    role_code: "LEGAL_REPRESENTATIVE",
    phone_number: supplierFormData.value.phone,
    country_iso_code: "",
    province: "",
    city_name: "",
    address: "",
    postal_code: "",
    birth_date: "",
    profile_picture_url: "",
    code_contract: codeContract,
  };

  const api = register(body);
  await api.request();

  if (api.error.value) {
    throw new Error(
      `Error registrando representante legal: ${api.error.value}`
    );
  }

  const representativeId = api.response.value?.data?.id;

  if (!representativeId) {
    throw new Error("No se pudo obtener el ID del representante legal");
  }

  return representativeId;
};

const handleCreateSupplier = async (
  supplier: IRelatedMedicalFormData,
  legalRepresentativeId: string,
  codeCardIdFile: string,
  codeMedicalLicenseFile: string,
  token: string
) => {
  const payload: CreateSupplier = {
    id_type: supplier.documentType,
    card_id: supplier.documentNumber,
    email: supplierFormData.value.email,
    medical_type_code: supplier.medicalType,
    legal_representative: legalRepresentativeId,
    num_medical_enrollment: supplier.medicalCode,
    name: supplier.fullName,
    phone_number: supplierFormData.value.phone,
    country_iso_code: "CRC",
    province: "Provincia",
    city_name: "Ciudad",
    postal_code: "0000",
    profile_picture_url: "Avatar aquí",
    description: "Descripción aquí",
    is_hospital: false,
    code_card_id_file: codeCardIdFile,
    code_medical_license_file: codeMedicalLicenseFile,
    gender: "M",
    address: "Dirección completa aquí",
    street_number: "123",
    floor: "1",
    door_number: "1",
    latitude: "9.9281",
    longitude: "-84.0907",
    experience_years: "10",
    patients_number: "1000",
    our_history: "Historia aquí",
    mission: "Misión aquí",
    vision: "Visión aquí",
  };

  const api = createSupplier(payload, token);
  await api.request();

  if (api.error.value) {
    throw new Error(`Error creando supplier: ${api.error.value}`);
  }

  const supplierId = api.response.value?.data?.id;

  if (!supplierId) {
    throw new Error("No se pudo obtener el ID del supplier");
  }

  if (supplier.specialties && supplier.specialties.length > 0) {
    await handleUploadSpecialtyBySupplier(supplierId, supplier, token);
  }

  return supplierId;
};

const handleUploadSpecialtyBySupplier = async (
  supplierId: number,
  supplier: IRelatedMedicalFormData,
  token?: string
) => {
  const body = supplier.specialties.map((specialty) => ({
    supplier_id: supplierId,
    medical_specialty_code: specialty.code,
  }));

  const api = uploadSpecialtyBySupplier(body, token);
  await api.request();

  if (api.error.value) {
    throw new Error(`Error subiendo especialidades: ${api.error.value}`);
  }
};

const handleLogin = async (): Promise<string | undefined> => {
  const payload = {
    email: supplierFormData.value.email,
    username: "",
    password: supplierFormData.value.password,
  };
  const api = login(payload);
  await api.request();

  const response = api.response.value;
  const error = api.error.value;

  if (response?.data) {
    setAuthenticated(true);
    setToken(response.data.access_token);
    setRefreshToken(response.data.refresh_token);
    setRole("LEGAL_REPRESENTATIVE");

    handleGetUserInfo(response.data.access_token);

    return response.data.access_token;
  }

  if (error) {
    throw new Error(error.info);
  }
};

const handleGetUserInfo = async (accessToken: string) => {
  const api = fetchUserInfo(legalRepresentativeId.value, accessToken);
  await api.request();

  const response = api.response.value;

  if (response?.data) {
    setUserInfo(response.data);
  }
};

const goToNextStep = () => {
  tab.value = 2;
};

const goToPreviousStep = () => {
  tab.value = 1;
};
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__stepper {
    margin-bottom: 2rem;
    flex-shrink: 0;
  }

  &__form {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
  }

  &__step {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__login-link {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.9rem;
  }

  &__login-text {
    color: #6c757d;
    margin-right: 0.5rem;
  }

  &__login-button {
    color: #212529;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #0d6efd;
      text-decoration: underline;
    }
  }
}
</style>
