<script setup lang="ts">
interface Voucher {
  id: number | string;
  code: string;
  service_name: string;
  location: string;
  insurance_name?: string;
  status: string;
  discount_percent: number | string;
}

const props = defineProps<{ vouchers: Voucher[] | null }>();
</script>

<template>
  <div class="vouchers-table">
    <div v-if="vouchers !== null" class="vouchers-table__responsive">
      <table class="vouchers-table__table">
        <thead class="vouchers-table__header">
          <tr>
            <th scope="col"></th>
            <th scope="col">Código</th>
            <th scope="col">Procedimiento</th>
            <th scope="col">Lugar</th>
            <th scope="col">Aseguradora</th>
            <th scope="col">Estado</th>
            <th scope="col">Costo</th>
            <th scope="col"></th>
          </tr>
        </thead>

        <tbody class="vouchers-table__body">
          <tr
            v-for="voucher in vouchers"
            :key="voucher.id"
            class="vouchers-table__row"
          >
            <td class="vouchers-table__cell" data-label="">
              <div class="vouchers-table__check">
                <input
                  class="vouchers-table__checkbox"
                  type="checkbox"
                  :id="`voucher-${voucher.code}`"
                  :aria-label="`Seleccionar voucher ${voucher.code}`"
                />
              </div>
            </td>
            <td class="vouchers-table__cell" data-label="Código">
              {{ voucher.code }}
            </td>
            <td class="vouchers-table__cell" data-label="Procedimiento">
              {{ voucher.service_name }}
            </td>
            <td class="vouchers-table__cell" data-label="Lugar">
              {{ voucher.location }}
            </td>
            <td class="vouchers-table__cell" data-label="Aseguradora">
              {{ voucher.insurance_name ?? voucher.service_name }}
            </td>
            <td class="vouchers-table__cell" data-label="Estado">
              <span class="vouchers-table__badge vouchers-table__badge--success">
                {{ voucher.status }}
              </span>
            </td>
            <td class="vouchers-table__cell" data-label="Costo">
              <span class="vouchers-table__cost">
                {{ voucher.discount_percent }} USD
              </span>
            </td>
            <td class="vouchers-table__cell" data-label="">
              <button
                class="vouchers-table__download"
                type="button"
                :aria-label="`Descargar voucher ${voucher.code}`"
              >
                <AtomsIconsDownloadIcon aria-hidden="true" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="vouchers-table__empty" role="status">
      <div class="vouchers-table__empty-icon" aria-hidden="true">
        <AtomsIconsChartVacio />
      </div>
      <div class="vouchers-table__empty-body">
        <p class="vouchers-table__empty-title">
          Aún no tienes actividad en tu tablero
        </p>
        <p class="vouchers-table__empty-description">
          Muy pronto podrás administrar y verificar tu actividad.
        </p>
        <button class="vouchers-table__empty-action" type="button">
          Empezar
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vouchers-table {
  background: $white;
  border-radius: $border-radius-md;
  overflow: hidden;

  &__responsive {
    width: 100%;
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-family: $font-family-main;
    font-size: 0.8125rem;
  }

  &__header {
    background: $white;
    border-bottom: 0.0625rem solid #dee2e6;

    th {
      padding: 1rem 0.75rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 500;
      color: $color-text-secondary;
      white-space: nowrap;
    }
  }

  &__row {
    border-bottom: 0.0625rem solid #dee2e6;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba($color-primary, 0.02);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__cell {
    padding: 1rem 0.75rem;
    vertical-align: middle;
    font-weight: 300;
    color: $color-foreground;
    line-height: 1.25rem;
  }

  &__check {
    display: flex;
    align-items: center;
  }

  &__checkbox {
    @include custom-checkbox;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.625rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;

    &--success {
      background: $color-success;
      color: darken($color-success, 50%);
    }
  }

  &__cost {
    font-size: 0.75rem;
    color: $color-text-secondary;
  }

  &__download {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: $color-text-secondary;
    border-radius: 0.375rem;
    transition: all 0.2s ease;

    &:hover {
      background: #f1f3f7;
      color: $color-primary;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    padding: 3rem 2rem;
    gap: 2rem;

    @include respond-to-max(sm) {
      flex-direction: column;
      text-align: center;
      padding: 2rem 1rem;
    }
  }

  &__empty-icon {
    flex-shrink: 0;
  }

  &__empty-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__empty-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: $color-text-muted;
    margin: 0;
  }

  &__empty-description {
    font-weight: 300;
    font-size: 0.875rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__empty-action {
    @include primary-button;
    align-self: flex-start;
    margin-top: 0.5rem;
    padding: 0.5rem 1.25rem;

    @include respond-to-max(sm) {
      align-self: center;
    }
  }
}

// ─── Mobile: card-based layout (<768px) ─────────────────────────────────────

@include respond-to-max(md) {
  .vouchers-table {
    background: transparent;

    &__responsive {
      overflow-x: visible;
    }

    &__table,
    &__header,
    &__body {
      display: block;
    }

    &__header {
      display: none;
    }

    &__row {
      display: block;
      background: $white;
      border-radius: $border-radius-md;
      border: 0.0625rem solid #e4e7ec;
      box-shadow: 0 0.0625rem 0.1875rem rgba($color-foreground, 0.06);
      margin-bottom: $spacing-sm;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: $white;
        box-shadow: 0 0.125rem 0.5rem rgba($color-foreground, 0.1);
      }
    }

    &__cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: $spacing-sm $spacing-md;
      border-bottom: 0.0625rem solid #f2f4f7;
      min-height: 2.75rem;

      &:last-child {
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        font-family: $font-family-main;
        font-weight: 600;
        font-size: 0.6875rem;
        color: $color-text-secondary;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        flex: 0 0 auto;
        margin-right: $spacing-sm;
        white-space: nowrap;
      }

      // Checkbox and download cells: no label, flush right
      &[data-label=""] {
        justify-content: flex-end;
        background: #fafbfc;
        border-top: 0.0625rem solid #e4e7ec;

        &::before {
          display: none;
        }
      }
    }
  }
}
</style>
