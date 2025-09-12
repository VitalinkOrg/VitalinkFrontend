<template>
  <div class="appointment-details-table">
    <h2
      v-if="title"
      :id="titleId"
      class="appointment-details-table__title"
      :class="{ 'visually-hidden': hiddenTitle }"
    >
      {{ title }}
    </h2>

    <table
      class="appointment-details-table__table"
      role="table"
      :aria-label="ariaLabel || title"
      :aria-labelledby="title ? titleId : undefined"
    >
      <tbody class="appointment-details-table__body">
        <tr
          v-for="(row, index) in filteredRows"
          :key="row.key || `row-${index}`"
          class="appointment-details-table__row"
          :class="[
            row.class,
            { 'appointment-details-table__row--end': row.isEndRow },
          ]"
        >
          <th
            scope="row"
            class="appointment-details-table__header"
            :class="row.headerClass"
          >
            <slot
              :name="`header-${row.key || index}`"
              :row="row"
              :index="index"
            >
              {{ row.header }}
            </slot>
          </th>

          <td class="appointment-details-table__data" :class="row.dataClass">
            <slot
              :name="`data-${row.key || index}`"
              :row="row"
              :index="index"
              :value="row.value"
            >
              {{ row.value }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
export interface TablaBaseRow {
  key?: string;
  header: string;
  value?: any;
  class?: string;
  headerClass?: string;
  dataClass?: string;
  isEndRow?: boolean;
  show?: boolean;
}

interface Props {
  rows: TablaBaseRow[];
  title?: string;
  hiddenTitle?: boolean;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hiddenTitle: false,
});

const titleId = computed(() =>
  props.title
    ? `tabla-title-${Math.random().toString(36).substr(2, 9)}`
    : undefined
);

const filteredRows = computed(() => {
  return props.rows.filter((row) => row.show !== false);
});
</script>

<style lang="scss" scoped>
.appointment-details-table {
  &__table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  &__row {
    width: 100%;

    &--end {
      border-bottom: 1px solid #e1e4ed;

      th,
      td {
        padding-bottom: 20px;
      }

      & + tr {
        th,
        td {
          padding-top: 20px;
        }
      }
    }
  }

  &__header {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0;
    vertical-align: middle;
    color: #6d758f;
    padding: 10px 0px;
  }

  &__data {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 18px;
    line-height: 20px;
    letter-spacing: 0;
    vertical-align: middle;
    color: #19213d;
    padding: 10px 0px;
    max-width: 290px;
  }
}

@mixin status-badge {
  display: inline-block;
  text-align: center;
  font-family: $font-family-main;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  border-radius: 30px;
  padding: 6px 10px;
  white-space: nowrap;
  color: #19213d;
}

:deep(.status-badge--success) {
  @include status-badge;
  background-color: $color-success;
}

:deep(.status-badge--warning) {
  @include status-badge;
  background-color: $color-warning;
}

:deep(.status-badge--primary) {
  @include status-badge;
  background-color: rgba($color-primary, 0.1);
}

:deep(.status-badge--cancelled) {
  @include status-badge;
  background-color: $color-cancel;
}
</style>
