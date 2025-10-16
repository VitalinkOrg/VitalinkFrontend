<script lang="ts" setup>
interface SearchHistory {
  specialtyCode: string;
  specialtyName: string;
  procedureCode?: string;
  procedureName?: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = "medical_search_history";

const searchHistory = ref<SearchHistory[]>([]);

const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      searchHistory.value = JSON.parse(history);
    }
  } catch (error) {
    console.error("Error loading search history:", error);
    searchHistory.value = [];
  }
};

const getSearchLink = (search: SearchHistory) => {
  const query: Record<string, string> = {
    specialty_code: search.specialtyCode,
  };

  if (search.procedureCode) {
    query.procedure_code = search.procedureCode;
  }

  return {
    path: "/buscar",
    query,
  };
};

const getSearchLabel = (search: SearchHistory) => {
  return search.procedureName || search.specialtyName;
};

onMounted(() => {
  loadSearchHistory();
});

onMounted(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === SEARCH_HISTORY_KEY) {
      loadSearchHistory();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  onUnmounted(() => {
    window.removeEventListener("storage", handleStorageChange);
  });
});
</script>

<template>
  <section v-if="searchHistory.length > 0" class="latest-search">
    <p class="latest-search__title">Últimas búsquedas</p>
    <div class="latest-search__badges-wrapper">
      <NuxtLink
        v-for="(search, index) in searchHistory"
        :key="`${search.specialtyCode}-${search.procedureCode || 'none'}-${index}`"
        :to="getSearchLink(search)"
        class="latest-search__badge"
      >
        {{ getSearchLabel(search) }}
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.latest-search {
  margin: 0 auto;
  max-width: 37.5rem;

  &__title {
    font-weight: 400;
    font-size: 18px;
    line-height: 125%;
    letter-spacing: 0;
    text-align: center;
    color: #6d758f;
  }

  &__badges-wrapper {
    display: flex;
    gap: 1.313rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1rem;
  }

  &__badge {
    border-radius: 1.25rem;
    padding: 0.7rem 1rem;
    border: 1px solid #e9ecf5;
    font-weight: 500;
    font-size: 1rem;
    line-height: 125%;
    letter-spacing: 0;
    color: #6d758f;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      background: #f3f6ff;
      cursor: pointer;
      border-color: #d1d9f0;
    }
  }
}
</style>
