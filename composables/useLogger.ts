type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

const IS_DEV = import.meta.dev;

function createEntry(
  level: LogLevel,
  message: string,
  context?: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    context,
    meta,
    timestamp: new Date().toISOString(),
  };
}

function devTransport(entry: LogEntry): void {
  const prefix = entry.context ? `[${entry.context}]` : "";
  const consoleMethod =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
        ? console.warn
        : entry.level === "debug"
          ? console.log
          : console.info;

  consoleMethod(`${prefix} ${entry.message}`, entry.meta ?? "");
}

function prodTransport(entry: LogEntry): void {
  if (entry.level === "error" || entry.level === "warn") {
    // Aquí se integraría con un servicio como Sentry, LogRocket, etc.
  }
}

const transport = IS_DEV ? devTransport : prodTransport;

export function useLogger(context?: string) {
  const log = (
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
  ): void => {
    transport(createEntry(level, message, context, meta));
  };

  return {
    debug: (msg: string, meta?: Record<string, unknown>) =>
      log("debug", msg, meta),
    info: (msg: string, meta?: Record<string, unknown>) =>
      log("info", msg, meta),
    warn: (msg: string, meta?: Record<string, unknown>) =>
      log("warn", msg, meta),
    error: (msg: string, meta?: Record<string, unknown>) =>
      log("error", msg, meta),
  };
}
