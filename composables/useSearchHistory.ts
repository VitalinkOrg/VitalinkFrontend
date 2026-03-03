import { useLogger } from "@/composables/useLogger";

export interface SearchHistoryEntry {
  specialtyCode: string;
  specialtyName: string;
  procedureCode?: string;
  procedureName?: string;
  timestamp: number;
}

export type SearchHistoryInput = Omit<SearchHistoryEntry, "timestamp">;

export interface SearchQuery {
  specialty_code?: string;
  procedure_code?: string;
}

export interface SearchBarProps {
  specialties?: IUdc[];
  loading?: boolean;
}

export interface SearchBarEmits {
  (e: "search", query: SearchQuery): void;
}

const STORAGE_KEY = "medical_search_history";
const MAX_ITEMS = 10;

export function useSearchHistory() {
  const logger = useLogger("useSearchHistory");

  const getAll = (): SearchHistoryEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        logger.warn("Corrupted search history, resetting");
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }

      return parsed;
    } catch (error) {
      logger.error("Failed to read search history", { error });
      return [];
    }
  };

  const save = (input: SearchHistoryInput): void => {
    if (!input.specialtyCode || !input.specialtyName) {
      logger.warn("Attempted to save incomplete search entry", { input });
      return;
    }

    try {
      const history = getAll();

      const isDuplicate = history.some(
        (item) =>
          item.specialtyCode === input.specialtyCode &&
          item.procedureCode === input.procedureCode,
      );

      if (isDuplicate) return;

      const entry: SearchHistoryEntry = { ...input, timestamp: Date.now() };
      history.unshift(entry);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history.slice(0, MAX_ITEMS)),
      );
    } catch (error) {
      logger.error("Failed to save search history", { error });
    }
  };

  const clear = (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.error("Failed to clear search history", { error });
    }
  };

  return { getAll, save, clear };
}
