<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification--${notification.type}`]"
          @click="remove(notification.id)"
        >
          <div class="notification__icon">
            <span v-if="notification.type === 'success'">✓</span>
            <span v-else-if="notification.type === 'error'">✕</span>
            <span v-else-if="notification.type === 'warning'">⚠</span>
            <span v-else>ℹ</span>
          </div>
          <div class="notification__content">
            <p class="notification__message">{{ notification.message }}</p>
          </div>
          <button
            class="notification__close"
            @click.stop="remove(notification.id)"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { useToast } from "@/composables/useToast";

const { notifications, remove } = useToast();
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 24rem;
  width: calc(100% - 2rem);

  @media (max-width: 48rem) {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 0.625rem 1.5rem rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-0.125rem);
    box-shadow: 0 0.75rem 1.75rem rgba(0, 0, 0, 0.2);
  }

  &--success {
    border-left: 0.25rem solid #10b981;

    .notification__icon {
      color: #10b981;
    }
  }

  &--error {
    border-left: 0.25rem solid #dc2626;

    .notification__icon {
      color: #dc2626;
    }
  }

  &--warning {
    border-left: 0.25rem solid #f59e0b;

    .notification__icon {
      color: #f59e0b;
    }
  }

  &--info {
    border-left: 0.25rem solid #3b82f6;

    .notification__icon {
      color: #3b82f6;
    }
  }

  &__icon {
    font-size: 1.25rem;
    font-weight: bold;
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__message {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #374151;
    word-wrap: break-word;
  }

  &__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>
