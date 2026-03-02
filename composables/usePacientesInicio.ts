/**
 * usePacientesInicio – Business logic composable for the patients home page.
 */

import { useSupplier, useUdc } from "@/composables/api";
import { useToast } from "@/composables/useToast";
import { useLogger } from "./useLogger";

/* ── Constants ────────────────────────────────────────────── */

const ITEMS_PER_SECTION = 6;

const ERROR_MESSAGES = {
  SPECIALTIES_LOAD: "Could not load specialties. Please try again.",
  SUPPLIERS_LOAD: "Could not load doctors. Please try again.",
} as const;

export interface HomePageError {
  section: "specialties" | "suppliers";
  message: string;
}

export function usePacientesInicio() {
  const logger = useLogger("PacientesInicio");
  const toast = useToast();

  const { getAllUdcs } = useUdc();
  const { getAllMainSuppliers } = useSupplier();

  const specialties = ref<IUdc[]>([]);
  const suppliers = ref<ISupplierMain[]>([]);

  const isLoadingSpecialties = ref(false);
  const isLoadingSuppliers = ref(false);

  const errors = ref<HomePageError[]>([]);

  const recommended = computed<ISupplierMain[]>(() =>
    suppliers.value.slice(0, ITEMS_PER_SECTION),
  );

  const popular = computed<ISupplierMain[]>(() =>
    suppliers.value.slice(ITEMS_PER_SECTION, ITEMS_PER_SECTION * 2),
  );

  const hasErrors = computed(() => errors.value.length > 0);

  const addError = (section: HomePageError["section"], message: string) => {
    errors.value = errors.value.filter((e) => e.section !== section);
    errors.value.push({ section, message });
  };

  const clearError = (section: HomePageError["section"]) => {
    errors.value = errors.value.filter((e) => e.section !== section);
  };

  const fetchSpecialties = async (): Promise<void> => {
    isLoadingSpecialties.value = true;
    clearError("specialties");

    try {
      const api = getAllUdcs({ type: "MEDICAL_SPECIALTY" });
      await api.request();

      if (api.error.value) {
        const errorMsg =
          api.error.value.info || ERROR_MESSAGES.SPECIALTIES_LOAD;
        addError("specialties", errorMsg);
        logger.error("Error loading specialties", {
          error: api.error.value,
        });
        return;
      }

      specialties.value = (api.response.value as IUdc[] | undefined) || [];

      logger.debug("Specialties loaded", {
        count: specialties.value.length,
      });
    } catch (err) {
      addError("specialties", ERROR_MESSAGES.SPECIALTIES_LOAD);
      logger.error("Unexpected exception while loading specialties", {
        error: String(err),
      });
      toast.error(ERROR_MESSAGES.SPECIALTIES_LOAD);
    } finally {
      isLoadingSpecialties.value = false;
    }
  };

  const fetchSuppliers = async (): Promise<void> => {
    isLoadingSuppliers.value = true;
    clearError("suppliers");

    try {
      const api = getAllMainSuppliers();
      await api.request();

      if (api.error.value) {
        const errorMsg = api.error.value.info || ERROR_MESSAGES.SUPPLIERS_LOAD;
        addError("suppliers", errorMsg);
        logger.error("Error loading suppliers", {
          error: api.error.value,
        });
        return;
      }

      suppliers.value = api.response.value ?? [];

      logger.debug("Suppliers loaded", {
        count: suppliers.value.length,
      });
    } catch (err) {
      addError("suppliers", ERROR_MESSAGES.SUPPLIERS_LOAD);
      logger.error("Unexpected exception while loading suppliers", {
        error: String(err),
      });
      toast.error(ERROR_MESSAGES.SUPPLIERS_LOAD);
    } finally {
      isLoadingSuppliers.value = false;
    }
  };

  const initialize = async (): Promise<void> => {
    await Promise.allSettled([fetchSpecialties(), fetchSuppliers()]);
  };

  const retrySection = async (
    section: HomePageError["section"],
  ): Promise<void> => {
    if (section === "specialties") {
      await fetchSpecialties();
    } else {
      await fetchSuppliers();
    }
  };

  /* ── UI Helpers ────────────────────────────────────────── */

  /**
   * Generates a gender-aware greeting.
   *
   * FIX: The original code used `gender.toLowerCase() === "M"` which
   * was always false (toLowerCase returns lowercase). Fixed with
   * normalized comparison.
   */
  const getGenderGreeting = (gender: string | null | undefined): string => {
    if (!gender) return "Welcome";

    const normalized = gender.trim().toUpperCase();
    if (normalized === "M") return "Welcome";
    if (normalized === "F") return "Welcome";

    return "Welcome";
  };

  return {
    specialties: readonly(specialties),
    suppliers: readonly(suppliers),
    isLoadingSpecialties: readonly(isLoadingSpecialties),
    isLoadingSuppliers: readonly(isLoadingSuppliers),
    errors: readonly(errors),
    hasErrors,
    recommended,
    popular,
    initialize,
    retrySection,
    fetchSpecialties,
    fetchSuppliers,
    getGenderGreeting,
  };
}
