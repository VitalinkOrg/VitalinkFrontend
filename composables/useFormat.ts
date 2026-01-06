export const useFormat = () => {
  /**
   * Formats a time string from 24-hour format (HH:mm:ss) to different formats.
   *
   * @param time - Time string in HH:mm:ss or HH:mm format (e.g. "14:30:00")
   * @param format - Format type: "12h" for AM/PM format, "hs" for hours format
   * @returns Formatted time string
   *
   * @example
   * formatTime("14:30:00", "12h"); // → "2:30PM"
   * formatTime("09:15", "12h");    // → "9:15AM"
   * formatTime("14:30:00", "hs");  // → "14:30hs"
   * formatTime("09:15", "hs");     // → "9:15hs"
   */
  const formatTime = (time: string, format: "12h" | "hs" = "12h"): string => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);

    if (format === "hs") {
      return `${h}:${minutes}hs`;
    }

    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes}${period}`;
  };

  /**
   * Formats an ISO date string or Date object into a human-readable date in Spanish.
   *
   * @param date - ISO date string (e.g. "2025-08-25T10:00:00Z" or "2025-08-25") or Date object
   * @param format - Format type: 'full' for full format, 'short' for MM/DD/YYYY format
   * @returns Formatted date string in Spanish
   *
   * @example
   * formatDate("2025-08-25"); // → "Lunes, 25 de agosto" (default format)
   * formatDate("2025-08-25", "full"); // → "Lunes, 25 de agosto"
   * formatDate("2025-08-25", "short"); // → "25/08/2025"
   * formatDate(new Date(), "short"); // → Current date in MM/DD/YYYY format
   */
  const formatDate = (
    date: string | Date,
    format: "full" | "short" = "full"
  ): string => {
    let dateObj: Date;

    if (typeof date === "string") {
      if (date.includes("/")) {
        const [day, month, year] = date.split("/");
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date format: ${date}`);
    }

    if (format === "short") {
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear();

      return `${day}/${month}/${year}`;
    }

    const dayOptions: Intl.DateTimeFormatOptions = { weekday: "long" };
    const monthOptions: Intl.DateTimeFormatOptions = { month: "long" };

    const dayName = new Intl.DateTimeFormat("es-ES", dayOptions).format(
      dateObj
    );
    const dayNumber = dateObj.getDate();
    const monthName = new Intl.DateTimeFormat("es-ES", monthOptions).format(
      dateObj
    );

    const capitalizedDayName =
      dayName.charAt(0).toUpperCase() + dayName.slice(1);

    return `${capitalizedDayName}, ${dayNumber} de ${monthName}`;
  };

  /**
   * Formats an ISO date string into a short localized date and time.
   *
   * @param isoDate - ISO date string
   * @returns Formatted datetime string (e.g. "25 ago 2025 08:30")
   *
   * @example
   * formatDateTime("2025-08-25T14:30:00Z"); // → "25 ago 2025 08:30"
   */
  const formatDateTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("es-CR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  /**
   * Formats a number as currency with customizable options.
   *
   * @param amount - Numeric amount to format
   * @param options - Formatting options (optional)
   * @param options.decimalPlaces - Number of decimal places (default: 2)
   * @param options.currency - Currency symbol or prefix (default: '₡')
   * @param options.locale - Locale for number formatting (default: 'es-CR')
   * @returns Formatted currency string (e.g. "₡18,000.00")
   *
   * @example
   * formatCurrency(18000);                                  // → "₡18,000.00"
   * formatCurrency(18000, { decimalPlaces: 0 });           // → "₡18,000"
   * formatCurrency(9999.99, { currency: '$', locale: 'en-US' });
   *                                                       // → "$9,999.99"
   */
  const formatCurrency = (
    amount: number | string,
    options?: {
      currency?: string;
      locale?: string;
      decimalPlaces?: number;
    }
  ): string => {
    const {
      currency = "₡",
      locale = "es-CR",
      decimalPlaces = 2,
    } = options || {};

    const numericAmount = Number(amount) || 0;

    return (
      currency +
      numericAmount.toLocaleString(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })
    );
  };

  /**
   * Formats a number with thousand separators based on locale.
   *
   * @param num - Number to format
   * @param locale - Locale for formatting (default: 'es-CR')
   * @returns Formatted number string (e.g. "1.234.567")
   *
   * @example
   * formatNumber(1234567); // → "1.234.567"
   */
  const formatNumber = (num: number, locale: string = "es-CR"): string => {
    return new Intl.NumberFormat(locale).format(num);
  };

  /**
   * Capitalizes the first letter of a string and converts the rest to lowercase.
   *
   * @param str - Input string
   * @returns Capitalized string
   *
   * @example
   * capitalize("jUAN"); // → "Juan"
   */
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  /**
   * Options for phone number formatting
   */
  interface PhoneFormatOptions {
    /** Country code prefix (default: "506" for Costa Rica) */
    countryCode?: string;
    /** Whether to add the country prefix to 8-digit numbers (default: false) */
    addPrefix?: boolean;
  }

  /**
   * Formats a phone number for display with configurable country prefix support.
   * Supports multiple formats:
   * - 8-digit numbers: formats as "8727-3307" or "(506) 8727-3307" with prefix
   * - Full international numbers: formats as "(506) 8727-3307" or custom country code
   *
   * @param phone - Raw phone number string (e.g. "87273307" or "+50687273307")
   * @param options - Configuration options for formatting
   * @returns Formatted phone string
   *
   * @example
   * // Default Costa Rica formatting
   * formatPhone("87273307");                           // → "8727-3307"
   * formatPhone("+50687273307");                       // → "(506) 8727-3307"
   *
   * // Add Costa Rica prefix to 8-digit numbers
   * formatPhone("87273307", { addPrefix: true });      // → "(506) 8727-3307"
   *
   * // Custom country code
   * formatPhone("1234567890", { countryCode: "1" });   // → "(1) 123456-7890"
   * formatPhone("+11234567890");                       // → "(1) 123456-7890"
   *
   * // Mexico example
   * formatPhone("5551234567", { countryCode: "52", addPrefix: true }); // → "(52) 5551-234567"
   */
  const formatPhone = (
    phone: string,
    options: PhoneFormatOptions = {}
  ): string => {
    const { countryCode = "506", addPrefix = false } = options;
    const digits = phone.replace(/\D/g, "");

    const fullLength = countryCode.length + 8;
    if (digits.length === fullLength && digits.startsWith(countryCode)) {
      const localNumber = digits.slice(countryCode.length);
      return `(${countryCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
    }

    if (digits.length === 8) {
      const formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
      return addPrefix ? `(${countryCode}) ${formatted}` : formatted;
    }

    if (digits.length === 10 && countryCode === "1") {
      return addPrefix
        ? `(${countryCode}) ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
        : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    if (digits.length === 11 && digits.startsWith("1")) {
      const localNumber = digits.slice(1);
      return `(1) ${localNumber.slice(0, 3)}-${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;
    }

    return phone;
  };

  /**
   * Formats a Costa Rican identification document (cédula) based on type.
   * Physical IDs can have:
   * - 7 digits: formatted with dashes (X-XXX-XXX)
   * - 9 digits: no formatting, zeros are used as separators (X0XXX0XXX)
   */
  const formatCedula = (value: string, documentType: string): string => {
    const numbersOnly = value.replace(/\D/g, "");

    const normalizedType = documentType.toUpperCase();

    const isCedulaFisica =
      normalizedType === "PHYSICAL_DNI" ||
      normalizedType === "CEDULA_FISICA" ||
      normalizedType === "CF" ||
      normalizedType === "FISICA" ||
      normalizedType === "CÉDULA FÍSICA" ||
      normalizedType.includes("FISICA") ||
      normalizedType.includes("PHYSICAL");

    const isCedulaJuridica =
      normalizedType === "JURIDICAL_DNI" ||
      normalizedType === "CEDULA_JURIDICA" ||
      normalizedType === "CJ" ||
      normalizedType === "JURIDICA" ||
      normalizedType === "CÉDULA JURÍDICA" ||
      normalizedType.includes("JURIDICA") ||
      normalizedType.includes("JURIDICAL");

    if (isCedulaFisica) {
      const maxLength = 9;
      const limited = numbersOnly.slice(0, maxLength);

      if (limited.length === 0) return "";

      if (limited.length === 9) {
        return limited;
      }

      if (limited.length === 8) {
        return limited;
      }

      if (limited.length === 1) {
        return limited;
      } else if (limited.length <= 4) {
        return `${limited.slice(0, 1)}-${limited.slice(1)}`;
      } else {
        return `${limited.slice(0, 1)}-${limited.slice(1, 4)}-${limited.slice(4)}`;
      }
    }

    if (isCedulaJuridica) {
      const maxLength = 10;
      const limited = numbersOnly.slice(0, maxLength);

      if (limited.length === 0) return "";
      if (limited.length === 1) return limited;
      if (limited.length <= 4) {
        return `${limited.slice(0, 1)}-${limited.slice(1)}`;
      }
      return `${limited.slice(0, 1)}-${limited.slice(1, 4)}-${limited.slice(4)}`;
    }

    return numbersOnly;
  };

  /**
   * Validates if a Costa Rican cédula has the correct number of digits.
   */
  const validateCedula = (value: string, documentType: string): boolean => {
    const numbersOnly = value.replace(/\D/g, "");
    const normalizedType = documentType.toUpperCase();

    const isCedulaFisica =
      normalizedType === "PHYSICAL_DNI" ||
      normalizedType === "CEDULA_FISICA" ||
      normalizedType === "CF" ||
      normalizedType === "FISICA" ||
      normalizedType === "CÉDULA FÍSICA" ||
      normalizedType.includes("FISICA") ||
      normalizedType.includes("PHYSICAL");

    const isCedulaJuridica =
      normalizedType === "JURIDICAL_DNI" ||
      normalizedType === "CEDULA_JURIDICA" ||
      normalizedType === "CJ" ||
      normalizedType === "JURIDICA" ||
      normalizedType === "CÉDULA JURÍDICA" ||
      normalizedType.includes("JURIDICA") ||
      normalizedType.includes("JURIDICAL");

    if (isCedulaFisica) {
      return numbersOnly.length === 7 || numbersOnly.length === 9;
    }

    if (isCedulaJuridica) {
      return numbersOnly.length === 10;
    }

    return numbersOnly.length > 0;
  };

  /**
   * Removes all non-numeric characters from a cédula string.
   */
  const cleanCedula = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  /**
   * Gets the appropriate placeholder text for a document input based on type.
   */
  const getCedulaPlaceholder = (documentType: string): string => {
    const normalizedType = documentType.toUpperCase();

    if (
      normalizedType === "PHYSICAL_DNI" ||
      normalizedType === "CEDULA_FISICA" ||
      normalizedType === "CF" ||
      normalizedType.includes("FISICA") ||
      normalizedType.includes("PHYSICAL")
    ) {
      return "Ej: 2-843-648 o 208430648";
    }

    if (
      normalizedType === "JURIDICAL_DNI" ||
      normalizedType === "CEDULA_JURIDICA" ||
      normalizedType === "CJ" ||
      normalizedType.includes("JURIDICA") ||
      normalizedType.includes("JURIDICAL")
    ) {
      return "Ej: 3-101-123456";
    }

    return "Ingrese su número de documento";
  };

  /**
   * Gets the appropriate error message for invalid cédula format.
   */
  const getCedulaErrorMessage = (documentType: string): string => {
    const normalizedType = documentType.toUpperCase();

    if (
      normalizedType === "PHYSICAL_DNI" ||
      normalizedType === "CEDULA_FISICA" ||
      normalizedType === "CF" ||
      normalizedType.includes("FISICA") ||
      normalizedType.includes("PHYSICAL")
    ) {
      return "La cédula física debe tener 7 o 9 dígitos (formato: #-###-### o #########)";
    }

    if (
      normalizedType === "JURIDICAL_DNI" ||
      normalizedType === "CEDULA_JURIDICA" ||
      normalizedType === "CJ" ||
      normalizedType.includes("JURIDICA") ||
      normalizedType.includes("JURIDICAL")
    ) {
      return "La cédula jurídica debe tener 10 dígitos (formato: #-###-######)";
    }

    return "Número de documento inválido";
  };

  /**
   * Converts a physical ID from dash format to zero-separator format for backend.
   * If already in zero format or has 9 digits, returns as is.
   *
   * @param value - Cédula física in any format
   * @param documentType - Type of document
   * @returns Cédula in zero-separator format (X0XXX0XXX) for backend
   *
   * @example
   * convertCedulaForBackend("2-843-648", "PHYSICAL_DNI");  // → "208430648"
   * convertCedulaForBackend("208430648", "PHYSICAL_DNI");  // → "208430648"
   * convertCedulaForBackend("5-023-056", "PHYSICAL_DNI");  // → "500230056"
   * convertCedulaForBackend("3-101-123456", "JURIDICAL_DNI"); // → "3101123456" (removes dashes only)
   */
  const convertCedulaForBackend = (
    value: string,
    documentType: string
  ): string => {
    const numbersOnly = value.replace(/\D/g, "");
    const normalizedType = documentType.toUpperCase();

    const isCedulaFisica =
      normalizedType === "PHYSICAL_DNI" ||
      normalizedType === "CEDULA_FISICA" ||
      normalizedType === "CF" ||
      normalizedType === "FISICA" ||
      normalizedType === "CÉDULA FÍSICA" ||
      normalizedType.includes("FISICA") ||
      normalizedType.includes("PHYSICAL");

    if (isCedulaFisica) {
      if (numbersOnly.length === 9) {
        return numbersOnly;
      }

      if (numbersOnly.length === 7) {
        return `${numbersOnly[0]}0${numbersOnly.slice(1, 4)}0${numbersOnly.slice(4)}`;
      }

      return numbersOnly;
    }

    return numbersOnly;
  };

  return {
    formatTime,
    formatDate,
    formatDateTime,
    formatCurrency,
    convertCedulaForBackend,
    formatNumber,
    capitalize,
    formatPhone,
    formatCedula,
    validateCedula,
    cleanCedula,
    getCedulaPlaceholder,
    getCedulaErrorMessage,
  };
};
