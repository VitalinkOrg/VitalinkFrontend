export const useFormat = () => {
  /**
   * Formats a time string from 24-hour format (HH:mm:ss) to 12-hour format with AM/PM.
   *
   * @param time - Time string in HH:mm:ss or HH:mm format (e.g. "14:30:00")
   * @returns Formatted time string in 12h format (e.g. "2:30PM")
   *
   * @example
   * formatTime("14:30:00"); // → "2:30PM"
   * formatTime("09:15");    // → "9:15AM"
   */
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes}${period}`;
  };

  /**
   * Formats an ISO date string or Date object into a human-readable full date in Spanish.
   * Includes weekday, day number, and month name (e.g. "Lunes, 25 de agosto").
   *
   * @param date - ISO date string (e.g. "2025-08-25T10:00:00Z" or "2025-08-25") or Date object
   * @returns Formatted date string in Spanish (e.g. "Lunes, 25 de agosto")
   *
   * @example
   * formatDate("2025-08-25"); // → "Lunes, 25 de agosto"
   * formatDate(new Date("2025-08-25")); // → "Lunes, 25 de agosto"
   * formatDate(new Date()); // → Current date formatted
   */
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;

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
   * Formats a phone number for display.
   * Supports multiple formats:
   * - 8-digit Costa Rican numbers: formats as "8727-3307"
   * - Full international numbers: formats as "(506) 8727-3307"
   *
   * @param phone - Raw phone number string (e.g. "87273307" or "+50687273307")
   * @returns Formatted phone string
   *
   * @example
   * formatPhone("87273307");     // → "8727-3307"
   * formatPhone("+50687273307"); // → "(506) 8727-3307"
   * formatPhone("1234567890");   // → "1234567890" (unchanged if not recognized)
   */
  const formatPhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 11 && digits.startsWith("506")) {
      return `(506) ${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    if (digits.length === 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }

    return phone;
  };

  return {
    formatTime,
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
    capitalize,
    formatPhone,
  };
};
