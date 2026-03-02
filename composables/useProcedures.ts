import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { useUdc } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";

export function useProcedures() {
  const { getAllUdcs } = useUdc();
  const logger = useLogger("useProcedures");

  const items = ref<IUdc[]>([]);
  const loading = ref(false);
  const hasError = ref(false);

  const dropdownItems = computed<DropdownItem[]>(() =>
    items.value.map((p) => ({ value: p.code, label: p.name })),
  );

  const fetchBySpecialty = async (specialtyCode: string): Promise<void> => {
    if (!specialtyCode) {
      logger.warn("fetchBySpecialty called without specialtyCode");
      items.value = [];
      return;
    }

    loading.value = true;
    hasError.value = false;

    try {
      const api = getAllUdcs("MEDICAL_PROCEDURE", true, {
        specialty_code: specialtyCode,
      });
      await api.request();

      const response = api.response.value;
      items.value = response
        ? response.map(
            (item: any) => ({ code: item.code, name: item.name }) as IUdc,
          )
        : [];
    } catch (error) {
      logger.error("Failed to load procedures", { specialtyCode, error });
      hasError.value = true;
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  const reset = (): void => {
    items.value = [];
    hasError.value = false;
  };

  const findByCode = (code: string | number | undefined): IUdc | undefined => {
    if (code === undefined) return undefined;
    return items.value.find((p) => p.code === code);
  };

  return {
    items,
    loading,
    hasError,
    dropdownItems,
    fetchBySpecialty,
    reset,
    findByCode,
  };
}
