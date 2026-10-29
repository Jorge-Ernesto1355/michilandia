export function getAuthErrorMessage(error: unknown, fallback: string) {
  const record = typeof error === "object" && error !== null ? error as { message?: unknown; code?: unknown; statusText?: unknown } : undefined;
  const message = error instanceof Error ? error.message : typeof record?.message === "string" ? record.message : "";
  const code = typeof record?.code === "string" ? record.code : "";
  const normalized = `${message} ${code} ${typeof record?.statusText === "string" ? record.statusText : ""}`.toLowerCase();

  if (normalized.includes("already exists") || normalized.includes("already registered") || normalized.includes("unique")) {
    return "Ya existe una cuenta con este correo electrónico.";
  }
  if (normalized.includes("password") && normalized.includes("short")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (normalized.includes("invalid password") || normalized.includes("invalid credentials") || normalized.includes("unauthorized")) {
    return "El correo o la contraseña no son correctos.";
  }
  if (normalized.includes("invalid email or password")) {
    return "El correo o la contraseña no son correctos.";
  }
  if (normalized.includes("invalid email") || normalized.includes("email is invalid")) {
    return "Escribe un correo electrónico válido.";
  }
  if (normalized.includes("verification")) {
    return "Necesitas verificar tu correo electrónico antes de continuar.";
  }

  return message || fallback;
}
