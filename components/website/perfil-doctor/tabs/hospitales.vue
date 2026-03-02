<template>
  <section class="hospitales" aria-label="Hospitales y sedes">
    <div
      v-if="isLoading"
      class="hospitales__loader"
      role="status"
      aria-live="polite"
      aria-label="Cargando hospitales"
    >
      <WebsitePerfilDoctorPantallaCarga />
    </div>

    <div
      v-else-if="loadError"
      class="hospitales__error"
      role="alert"
      aria-live="assertive"
    >
      <div class="hospitales__error-icon" aria-hidden="true">⚠</div>
      <h3 class="hospitales__error-title">No se pudo cargar la información</h3>
      <p class="hospitales__error-description">{{ loadError }}</p>
      <button
        class="hospitales__error-retry"
        type="button"
        @click="loadLocations"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="safeLocations.length === 0"
      class="hospitales__empty"
      role="status"
      aria-live="polite"
    >
      <div class="hospitales__empty-icon" aria-hidden="true">🏥</div>
      <h3 class="hospitales__empty-title">Sin sedes registradas</h3>
      <p class="hospitales__empty-description">
        Este doctor aún no tiene hospitales o sedes configurados en el sistema.
      </p>
    </div>

    <ul v-else class="hospitales__list" aria-label="Lista de hospitales">
      <li
        v-for="location in safeLocations"
        :key="location.id"
        class="hospitales__item"
      >
        <article
          class="hospitales__card"
          :aria-labelledby="`location-name-${location.id}`"
        >
          <div class="hospitales__card-header">
            <div class="hospitales__card-icon" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 9v.01M9 13v.01M9 17v.01M17 9v.01M17 13v.01M17 17v.01"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3
              :id="`location-name-${location.id}`"
              class="hospitales__card-name"
            >
              {{ location.name }}
            </h3>
          </div>

          <dl class="hospitales__card-details">
            <div class="hospitales__card-row">
              <dt class="hospitales__card-label">
                <svg
                  class="hospitales__card-label-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="2.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
                <span>Dirección</span>
              </dt>
              <dd class="hospitales__card-value">
                {{ formatAddress(location) }}
              </dd>
            </div>

            <div class="hospitales__card-row">
              <dt class="hospitales__card-label">
                <svg
                  class="hospitales__card-label-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Ciudad</span>
              </dt>
              <dd class="hospitales__card-value">
                {{ formatCityProvince(location) }}
              </dd>
            </div>

            <div v-if="location.postal_code" class="hospitales__card-row">
              <dt class="hospitales__card-label">
                <svg
                  class="hospitales__card-label-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M2 10h20" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <span>Código postal</span>
              </dt>
              <dd class="hospitales__card-value">
                {{ location.postal_code }}
              </dd>
            </div>
          </dl>

          <div v-if="hasCoordinates(location)" class="hospitales__card-actions">
            <a
              :href="buildMapsUrl(location)"
              target="_blank"
              rel="noopener noreferrer"
              class="hospitales__card-map-link"
              :aria-label="`Ver ${location.name} en Google Maps`"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Ver en mapa
            </a>
          </div>
        </article>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";

interface HospitalesProps {
  locations?: ILocation[] | null;
  isLoading?: boolean;
  loadError?: string | null;
}

const props = withDefaults(defineProps<HospitalesProps>(), {
  locations: () => [],
  isLoading: false,
  loadError: null,
});

const safeLocations = computed<ILocation[]>(() => {
  return Array.isArray(props.locations) ? props.locations : [];
});

const logger = useLogger("Hospitales");
const toast = useToast();

const emit = defineEmits<{
  (event: "retry"): void;
}>();

function formatAddress(location: ILocation): string {
  const parts: string[] = [];

  if (location.address) parts.push(location.address);

  return parts.length > 0 ? parts.join(", ") : "Dirección no disponible";
}

function formatCityProvince(location: ILocation): string {
  const parts: string[] = [];

  if (location.city_name) parts.push(location.city_name);
  if (location.province) parts.push(location.province);

  return parts.length > 0 ? parts.join(", ") : "Ciudad no disponible";
}

function hasCoordinates(location: ILocation): boolean {
  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);

  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
}

function buildMapsUrl(location: ILocation): string {
  const lat = encodeURIComponent(location.latitude);
  const lng = encodeURIComponent(location.longitude);
  const name = encodeURIComponent(location.name);

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${name}`;
}

function loadLocations(): void {
  emit("retry");
}
</script>

<style lang="scss" scoped>
.hospitales {
  padding: $spacing-lg 0;
  min-height: 200px;

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    text-align: center;
    min-height: 300px;
  }

  &__error-icon {
    font-size: 48px;
    line-height: 1;
  }

  &__error-title {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
  }

  &__error-description {
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
    margin: 0;
    max-width: 400px;
    line-height: 1.6;
  }

  &__error-retry {
    @include primary-button;
    margin-top: $spacing-sm;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    text-align: center;
    min-height: 250px;
    background-color: #f8faff;
    border: 1px solid #e4e7ec;
    border-radius: $border-radius-md;
  }

  &__empty-icon {
    font-size: 40px;
    line-height: 1;
  }

  &__empty-title {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
  }

  &__empty-description {
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
    margin: 0;
    max-width: 480px;
    line-height: 1.6;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;

    @include respond-to-max(sm) {
      grid-template-columns: 1fr;
      gap: $spacing-md;
    }
  }

  &__item {
    display: flex;
  }

  &__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: $white;
    border: 1px solid #e4e7ec;
    border-radius: 12px;
    padding: $spacing-lg;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: $primary-aqua-light;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 1px 3px rgba(0, 0, 0, 0.04);
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid #f2f4f7;
  }

  &__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: #e7f7f8;
    color: $primary-aqua;
    flex-shrink: 0;
  }

  &__card-name {
    font-family: $font-family-main;
    font-size: 16px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
  }

  &__card-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    flex: 1;
  }

  &__card-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__card-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: $font-family-main;
    font-size: 12px;
    font-weight: 500;
    color: $color-text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin: 0;
  }

  &__card-label-icon {
    color: $color-text-muted;
    flex-shrink: 0;
  }

  &__card-value {
    font-family: $font-family-main;
    font-size: 14px;
    font-weight: 400;
    color: $color-foreground;
    line-height: 1.5;
    margin: 0;
    padding-left: 22px;
  }

  &__card-actions {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid #f2f4f7;
  }

  &__card-map-link {
    @include button-base;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-sm 12px;
    font-size: 13px;
    font-weight: 500;
    color: $primary-aqua;
    background-color: #e7f7f8;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    text-decoration: none;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      background-color: darken(#e7f7f8, 4%);
      border-color: $primary-aqua;
      color: darken($primary-aqua, 8%);
    }

    &:focus-visible {
      outline: 2px solid $primary-aqua;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba($primary-aqua, 0.2);
    }
  }
}
</style>
