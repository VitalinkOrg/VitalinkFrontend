export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export function useToast() {
  const show = (
    message: string,
    type: NotificationType = "info",
    duration = 5000,
  ) => {
    const id = Math.random().toString(36).substring(7);

    notifications.value.push({
      id,
      type,
      message,
      duration,
    });

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  };

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) => {
    show(message, "success", duration);
  };

  const error = (message: string, duration?: number) => {
    show(message, "error", duration);
  };

  const warning = (message: string, duration?: number) => {
    show(message, "warning", duration);
  };

  const info = (message: string, duration?: number) => {
    show(message, "info", duration);
  };

  return {
    notifications: readonly(notifications),
    show,
    remove,
    success,
    error,
    warning,
    info,
  };
}
