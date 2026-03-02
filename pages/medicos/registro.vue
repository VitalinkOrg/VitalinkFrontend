<template>
  <NuxtLayout name="medicos-autenticacion">
    <section class="registration" aria-labelledby="registration-heading">
      <HeaderRegistro />

      <form
        @submit.prevent="submitRegistration"
        class="registration__form"
        novalidate
      >
        <div class="registration__step">
          <MedicosRegistroFormularioProveedorMedico
            :form-data="representativeFormData"
            :is-submitting="isSubmitting"
            @update:form-data="representativeFormData = $event"
            @submit="submitRegistration"
          />
        </div>
      </form>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useAuth, useDocuments } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { getUserIdFromToken } from "@/utils/jwt";

const { register, login, getUserById } = useAuth();
const { addDocument } = useDocuments();
const { convertCedulaForBackend } = useFormat();
const { setAuthenticated, setRole } = useAuthState();
const { setToken, setRefreshToken, getToken } = useAuthToken();
const { setUserInfo } = useUserInfo();
const toast = useToast();
const router = useRouter();
const logger = useLogger("RegistroMedico");

const isSubmitting = ref(false);

const representativeFormData = ref<IRepresentativeFormData>({
  documentType: "",
  documentNumber: "",
  fullName: "",
  contractFile: null,
  email: "",
  phone: "",
  password: "",
});

const submitRegistration = async (): Promise<void> => {
  if (isSubmitting.value) return;

  const formData = representativeFormData.value;

  if (!formData.contractFile) {
    toast.error("El archivo de contrato es requerido.");
    return;
  }

  isSubmitting.value = true;

  try {
    const representativeId = await registerRepresentative();
    const { accessToken, userId } = await authenticateRepresentative();
    const contractCode = await uploadContract(formData.contractFile);
    await linkContractToUser(userId, contractCode);

    localStorage.setItem("onboarding", "true");
    toast.success("¡Registro completado exitosamente!");
    await router.push("/medicos/mis-medicos");
  } catch (error) {
    handleRegistrationError(error);
  } finally {
    isSubmitting.value = false;
  }
};

const registerRepresentative = async (): Promise<string> => {
  const formData = representativeFormData.value;

  const backendDocumentNumber = convertCedulaForBackend(
    formData.documentNumber,
    formData.documentType,
  );

  const { data, error } = await register({
    card_id: backendDocumentNumber,
    id_type: formData.documentType,
    name: formData.fullName,
    email: formData.email,
    password: formData.password,
    gender: "M",
    role_code: "LEGAL_REPRESENTATIVE",
    phone_number: formData.phone,
    country_iso_code: "",
    province: "",
    city_name: "",
    address: "",
    postal_code: "",
    birth_date: "",
    profile_picture_url: "",
  });

  if (error) {
    const isDuplicate =
      error.status?.http_code === 409 ||
      error.info?.toLowerCase().includes("duplicate entry") ||
      error.info?.toLowerCase().includes("ya existe");

    if (isDuplicate) {
      throw createRegistrationError(
        "Este usuario ya está registrado. Por favor inicia sesión.",
        409,
      );
    }

    throw createRegistrationError(
      error.info || "Error al registrar el representante legal.",
      error.status?.http_code,
    );
  }

  const representativeId = (data as any)?.id;

  if (!representativeId) {
    throw createRegistrationError(
      "No se pudo obtener el ID del representante legal.",
      500,
    );
  }

  logger.debug("Representative registered", { representativeId });
  return representativeId;
};

const authenticateRepresentative = async (): Promise<{
  accessToken: string;
  userId: string;
}> => {
  const formData = representativeFormData.value;

  const { data, error } = await login({
    email: formData.email,
    password: formData.password,
  });

  if (error || !data) {
    throw createRegistrationError(
      "No se pudo iniciar sesión automáticamente.",
      error?.status?.http_code,
    );
  }

  const { access_token, refresh_token } = data;

  setAuthenticated(true);
  setToken(access_token);
  setRefreshToken(refresh_token);
  setRole("LEGAL_REPRESENTATIVE");

  const userId = getUserIdFromToken(access_token);

  if (!userId) {
    throw createRegistrationError(
      "No se pudo obtener el ID del usuario del token.",
      500,
    );
  }

  await loadUserProfile(userId, access_token);

  logger.debug("Representative authenticated", { userId });
  return { accessToken: access_token, userId };
};

const loadUserProfile = async (
  userId: string,
  accessToken: string,
): Promise<void> => {
  const { data, error } = await getUserById(userId, accessToken);

  if (data) {
    setUserInfo(data);
  } else if (error) {
    logger.warn("Could not load user profile", { error: error.info });
  }
};

const uploadContract = async (file: File): Promise<string> => {
  const { data, error } = await addDocument({
    file,
    fields: {
      title: file.name,
      type: "DOC",
      description: "Contrato cargado durante el registro médico",
      id_for_table: "6",
      table: "",
      action_type: "PRIVATE_CONTRACT",
      user_id: "",
      is_public: 0,
    },
  });

  if (error || !data) {
    throw createRegistrationError(
      error?.info || "Error al subir el contrato.",
      error?.status?.http_code,
    );
  }

  const contractCode = data.code;

  if (!contractCode) {
    throw createRegistrationError(
      "No se pudo obtener el código del contrato.",
      500,
    );
  }

  logger.debug("Contract uploaded", { contractCode });
  return contractCode;
};

const linkContractToUser = async (
  userId: string,
  contractCode: string,
): Promise<void> => {
  const config = useRuntimeConfig();
  const token = getToken();

  if (!token) {
    throw createRegistrationError("Token de autenticación no disponible.", 401);
  }

  try {
    await $fetch(`user/edit`, {
      baseURL: `${config.public.API_BASE_URL}/`,
      method: "PUT",
      headers: { Authorization: token },
      query: { id: userId },
      body: { code_contract: contractCode },
    });

    logger.debug("Contract linked to user", { userId, contractCode });
  } catch {
    throw createRegistrationError(
      "Error al vincular el contrato con el usuario.",
      500,
    );
  }
};

interface RegistrationError {
  message: string;
  httpCode?: number;
}

const createRegistrationError = (
  message: string,
  httpCode?: number,
): RegistrationError => ({
  message,
  httpCode,
});

const handleRegistrationError = (error: unknown): void => {
  const registrationError = error as RegistrationError;
  let errorMessage = "Error en el registro. Intenta nuevamente.";

  if (registrationError?.message) {
    errorMessage = registrationError.message;
  }

  logger.error("Registration failed", {
    message: errorMessage,
    httpCode: registrationError?.httpCode,
  });

  toast.error(errorMessage);
};
</script>

<style lang="scss" scoped>
.registration {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 0;

  &__form {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__step {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}
</style>
