<template>
  <NuxtLayout name="medicos-autenticacion">
    <section class="register">
      <HeaderRegistro />

      <form @submit.prevent="handleSubmit" class="register__form">
        <div class="register__step">
          <MedicosRegistroFormularioProveedorMedico
            :supplierFormData="supplierFormData"
            :is-loading="isLoadingSubmit"
            @update:supplierFormData="updateSupplierFormData"
            @submit="handleSubmit"
          />
        </div>
      </form>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useAuth, useDocuments } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import type { ISupplierFormData } from "@/types";

const { uploadDocument } = useDocuments();
const { register, login, fetchUserInfo } = useAuth();
const { convertCedulaForBackend } = useFormat();
const { setAuthenticated, setRole } = useAuthState();
const { setToken, setRefreshToken, getToken } = useAuthToken();
const { setUserInfo, getUserInfo } = useUserInfo();
const router = useRouter();
const config = useRuntimeConfig();

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

const updateSupplierFormData = (newData: ISupplierFormData) => {
  supplierFormData.value = { ...newData };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleSubmit = async (): Promise<void> => {
  try {
    isLoadingSubmit.value = true;

    if (!supplierFormData.value.contratcFile) {
      throw new Error("Archivo de contrato requerido");
    }

    let representativeId = "";
    let isExistingUser = false;

    try {
      representativeId = await handleRegisterLegalRepresentative("");
    } catch (error: any) {
      if (
        error.message.includes("Data Base Error") ||
        error.message.includes("already exists") ||
        error.message.includes("duplicate")
      ) {
        console.warn(
          "Usuario ya existe, iniciando sesión con credenciales existentes",
        );
        isExistingUser = true;

        const accessToken = await handleLogin();
        if (!accessToken) {
          throw new Error(
            "No se pudo iniciar sesión con las credenciales proporcionadas",
          );
        }

        const userInfo = getUserInfo();
        representativeId = userInfo?.id || "";

        if (!representativeId) {
          throw new Error("No se pudo obtener el ID del usuario");
        }
      } else {
        throw error;
      }
    }

    legalRepresentativeId.value = representativeId;
    await delay(500);

    if (!isExistingUser) {
      const accessToken = await handleLogin();

      if (!accessToken) {
        throw new Error("No se pudo obtener el token de autenticación");
      }
      await delay(500);
    }

    const codeContract = await handleUploadFile(
      supplierFormData.value.contratcFile,
      "PRIVATE_CONTRACT",
    );

    if (!codeContract) {
      throw new Error("Error subiendo contrato");
    }

    await delay(500);

    await updateUserContract(representativeId, codeContract);

    localStorage.setItem("onboarding", "true");

    await router.push("/medicos/mis-medicos");
  } catch (error) {
    console.error("Error en el registro:", error);

    let errorMessage = "Error en el registro. Por favor intenta nuevamente.";

    if (error instanceof Error) {
      if (error.message.includes("Data Base Error")) {
        errorMessage =
          "Este usuario ya está registrado. Por favor usa datos diferentes o intenta iniciar sesión.";
      } else if (error.message.includes("duplicate")) {
        errorMessage =
          "El correo electrónico o número de documento ya están registrados.";
      } else {
        errorMessage = error.message;
      }
    }

    alert(errorMessage);
  } finally {
    isLoadingSubmit.value = false;
  }
};

const handleUploadFile = async (
  file: File,
  actionType: string,
): Promise<string> => {
  const fields = {
    title: file.name,
    type: "DOC",
    description: "Private document uploaded during medical registration",
    id_for_table: "6",
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
  codeContract: string,
): Promise<string> => {
  const backendDocumentNumber = convertCedulaForBackend(
    supplierFormData.value.documentNumber,
    supplierFormData.value.documentType,
  );

  const body = {
    card_id: backendDocumentNumber,
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
    code_contract: codeContract || "",
  };

  const api = register(body);
  await api.request();

  if (api.error.value) {
    const errorMsg =
      typeof api.error.value === "object"
        ? api.error.value.info || "Error en el registro"
        : api.error.value;

    throw new Error(`Error registrando representante legal: ${errorMsg}`);
  }

  const representativeId = api.response.value?.data?.id;

  if (!representativeId) {
    throw new Error("No se pudo obtener el ID del representante legal");
  }

  return representativeId;
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

    await handleGetUserInfo(response.data.access_token);

    return response.data.access_token;
  }

  if (error) {
    throw new Error(error.info || "Error en el inicio de sesión");
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

const updateUserContract = async (
  userId: string,
  codeContract: string,
): Promise<void> => {
  const token = getToken();

  if (!token) {
    throw new Error("No se pudo obtener el token de autenticación");
  }

  const url = `${config.public.API_BASE_URL}/user/edit?id=${userId}`;

  try {
    const response = await $fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        code_contract: codeContract,
      }),
    });

    if (!response) {
      throw new Error("Error actualizando el contrato del usuario");
    }
  } catch (error) {
    console.error("Error actualizando contrato:", error);
    throw new Error("Error al vincular el contrato con el usuario");
  }
};
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 0;

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
}
</style>
