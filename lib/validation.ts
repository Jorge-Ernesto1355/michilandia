const invisibleCharacters = /[\u200B-\u200D\uFEFF]/g;

export function normalizeEmail(value: string) {
  return value.replace(invisibleCharacters, "").trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
