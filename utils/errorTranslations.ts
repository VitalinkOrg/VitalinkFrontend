const FALLBACK_MESSAGE = "Ocurrió un error inesperado";

/**
 * Exact translations: first look for exact match O(1) via Map.
 * If no exact match, search by partial inclusion (case-insensitive).
 */
const EXACT_TRANSLATIONS: ReadonlyMap<string, string> = new Map([
  // Authentication
  ["Incorrect Password", "Contraseña incorrecta"],
  ["Email or Username doesn't exist", "El correo o usuario no existe"],
  [
    "Message Missed : Your Password Need at Least 8 digits, Numbers, Letters, and Symbols",
    "Tu contraseña debe tener al menos 8 caracteres, incluyendo números, letras y símbolos",
  ],

  // Field validation
  ["The email field is required", "El campo correo es obligatorio"],
  ["The password field is required", "El campo contraseña es obligatorio"],
  ["Invalid email format", "El formato del correo no es válido"],

  // HTTP errors
  ["Internal Server Error", "Error interno del servidor"],
  ["Not Found", "Recurso no encontrado"],
  ["Unauthorized", "No autorizado"],
  ["Forbidden", "Acceso denegado"],
  ["Too Many Requests", "Demasiadas solicitudes, intenta más tarde"],

  // Generic errors
  ["Unknown Error", "Error desconocido"],
  ["An unexpected error occurred", FALLBACK_MESSAGE],
  ["Network Error", "Error de conexión, verifica tu internet"],
]);

/** Precomputed lowercase pairs for partial search without repeated conversion */
const PARTIAL_TRANSLATIONS: ReadonlyArray<
  [lowercase: string, translation: string]
> = Array.from(EXACT_TRANSLATIONS.entries()).map(([key, value]) => [
  key.toLowerCase(),
  value,
]);

export function translateError(message: string): string {
  if (!message) return FALLBACK_MESSAGE;

  const exact = EXACT_TRANSLATIONS.get(message);
  if (exact) return exact;

  const lowerMessage = message.toLowerCase();
  for (const [key, value] of PARTIAL_TRANSLATIONS) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }

  return FALLBACK_MESSAGE;
}
