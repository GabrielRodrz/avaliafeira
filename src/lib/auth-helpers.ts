/**
 * Helper to normalize login username to Supabase internal email format:
 * username: "gabriel.rodrigues" -> "gabriel.rodrigues@avaliafeira.local"
 */
export const INTERNAL_EMAIL_DOMAIN = "avaliafeira.local";

export function usernameToEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${clean}@${INTERNAL_EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  if (email.endsWith(`@${INTERNAL_EMAIL_DOMAIN}`)) {
    return email.replace(`@${INTERNAL_EMAIL_DOMAIN}`, "");
  }
  return email.split("@")[0];
}

export function isValidUsername(username: string): boolean {
  const clean = username.trim().toLowerCase();
  return /^[a-z0-9._-]{3,30}$/.test(clean);
}
