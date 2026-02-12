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
import type { ApiErrorResponse } from "@/composables/api/useApi";
import { useFormat } from "@/composables/useFormat";
import type { ISupplierFormData } from "@/types";
import { getUserIdFromToken } from "@/utils/jwt";

const { uploadDocument } = useDocuments();
const { register, login, fetchUserInfo } = useAuth();
const { convertCedulaForBackend } = useFormat();
const { setAuthenticated, setRole } = useAuthState();
const { setToken, setRefreshToken, getToken } = useAuthToken();
const { setUserInfo, getUserInfo } = useUserInfo();
const { success, error: showError, warning } = useToast();
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
      showError("Archivo de contrato requerido");
      return;
    }

    let representativeId = "";

    try {
      representativeId = await handleRegisterLegalRepresentative("");
    } catch (error: any) {
      const parsedError = error as ApiErrorResponse;

      if (
        parsedError.httpCode === 409 ||
        parsedError.isDuplicateEntry ||
        parsedError.message?.toLowerCase().includes("ya existe") ||
        parsedError.info?.includes("Duplicate Entry") ||
        parsedError.raw?.includes("Duplicate Entry")
      ) {
        showError(
          "Este usuario ya está registrado. Por favor inicia sesión desde la página de inicio de sesión.",
        );
        return;
      } else {
        throw error;
      }
    }

    legalRepresentativeId.value = representativeId;
    await delay(500);

    const loginResult = await handleLogin();
    if (!loginResult) {
      showError("No se pudo obtener el token de autenticación");
      return;
    }
    await delay(500);

    const codeContract = await handleUploadFile(
      supplierFormData.value.contratcFile,
      "PRIVATE_CONTRACT",
    );

    if (!codeContract) {
      showError("Error al subir el contrato");
      return;
    }

    await delay(500);
    await updateUserContract(representativeId, codeContract);

    localStorage.setItem("onboarding", "true");
    success("¡Registro completado exitosamente!");

    await router.push("/medicos/mis-medicos");
  } catch (error) {
    console.error("Error en el registro:", error);

    const parsedError = error as ApiErrorResponse;
    let errorMessage = "Error en el registro. Intenta nuevamente.";

    if (
      parsedError.httpCode === 409 ||
      parsedError.isDuplicateEntry ||
      parsedError.message?.toLowerCase().includes("ya existe")
    ) {
      errorMessage = "Este usuario ya está registrado. Intenta iniciar sesión.";
    } else if (parsedError.isNetworkError) {
      errorMessage =
        "Error de conexión. Verifica tu internet e intenta nuevamente.";
    } else if (parsedError.httpCode === 400) {
      errorMessage =
        parsedError.info || "Datos inválidos. Verifica la información.";
    } else if (parsedError.httpCode === 401 || parsedError.httpCode === 403) {
      errorMessage = "No autorizado. Verifica tus credenciales.";
    } else if (parsedError.message && parsedError.message !== "Error") {
      errorMessage = parsedError.message;
    } else if (
      parsedError.info &&
      !parsedError.info.includes("Data Base Error")
    ) {
      errorMessage = parsedError.info;
    }

    showError(errorMessage);
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
    const errorMsg =
      api.error.value.info ||
      api.error.value.message ||
      "Error subiendo documento";
    throw {
      message: errorMsg,
      httpCode: api.error.value.httpCode || 500,
      info: api.error.value.info,
    } as ApiErrorResponse;
  }

  const code = api.response.value?.data?.code;

  if (!code) {
    throw {
      message: "No se pudo obtener el código del documento",
      httpCode: 500,
    } as ApiErrorResponse;
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
    throw api.error.value;
  }

  const representativeId = api.response.value?.data?.id;

  if (!representativeId) {
    throw {
      message: "No se pudo obtener el ID del representante legal",
      httpCode: 500,
    } as ApiErrorResponse;
  }

  return representativeId;
};

const handleLogin = async (): Promise<
  { accessToken: string; userId: string } | undefined
> => {
  const payload = {
    email: supplierFormData.value.email,
    username: "",
    password: supplierFormData.value.password,
  };

  const api = login(payload);
  await api.request();

  const response = api.response.value;
  const errorResponse = api.error.value;

  if (response?.data) {
    const accessToken = response.data.access_token;

    setAuthenticated(true);
    setToken(accessToken);
    setRefreshToken(response.data.refresh_token);
    setRole("LEGAL_REPRESENTATIVE");

    const userId = getUserIdFromToken(accessToken);

    if (!userId) {
      throw {
        message: "No se pudo obtener el ID del usuario del token",
        httpCode: 500,
      } as ApiErrorResponse;
    }

    legalRepresentativeId.value = userId;

    await handleGetUserInfo(userId, accessToken);

    return { accessToken, userId };
  }

  if (errorResponse) {
    throw errorResponse;
  }
};

const handleGetUserInfo = async (userId: string, accessToken: string) => {
  const api = fetchUserInfo(userId, accessToken);
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
    throw {
      message: "No se pudo obtener el token de autenticación",
      httpCode: 401,
    } as ApiErrorResponse;
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
      throw {
        message: "Error actualizando el contrato del usuario",
        httpCode: 500,
      } as ApiErrorResponse;
    }
  } catch (error) {
    console.error("Error actualizando contrato:", error);
    throw {
      message: "Error al vincular el contrato con el usuario",
      httpCode: 500,
    } as ApiErrorResponse;
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
