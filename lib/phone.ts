// Phone formatting shared by the public forms (as-you-type), the Zod schemas
// (normalize before storing), and admin views (display legacy rows). US numbers
// are formatted as "(704) 555-0123"; numbers typed with a non-US "+" country
// code are left in the customer's own grouping.

const MAX_INTL_DIGITS = 15; // E.164 limit

function digitsOf(value: string) {
  return value.replace(/\D/g, "");
}

function isInternational(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("+") && !trimmed.startsWith("+1");
}

/** National (10-digit) US digits, dropping a leading country code 1. */
function usDigits(value: string) {
  const digits = digitsOf(value);
  return digits.length > 10 && digits.startsWith("1") ? digits.slice(1) : digits;
}

/**
 * Formats a partially typed phone number. Never appends trailing punctuation,
 * so backspace always removes a digit instead of getting stuck on ") " or "-".
 */
export function formatPhoneInput(value: string) {
  if (isInternational(value)) {
    return "+" + value.trim().slice(1).replace(/[^\d\s().-]/g, "").slice(0, 24);
  }
  const digits = usDigits(value).slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidPhone(value: string) {
  if (isInternational(value)) {
    const digits = digitsOf(value);
    return digits.length >= 8 && digits.length <= MAX_INTL_DIGITS;
  }
  return usDigits(value).length === 10;
}

/** Canonical stored/displayed form. Falls back to the trimmed input when unrecognized. */
export function formatPhone(value: string | null | undefined) {
  if (!value) return "";
  if (isInternational(value)) return formatPhoneInput(value).trim();
  const digits = usDigits(value);
  return digits.length === 10 ? formatPhoneInput(digits) : value.trim();
}

/** Value for a tel: link. */
export function phoneHref(value: string) {
  if (isInternational(value)) return `tel:+${digitsOf(value)}`;
  const digits = usDigits(value);
  return digits.length === 10 ? `tel:+1${digits}` : `tel:${digitsOf(value)}`;
}
