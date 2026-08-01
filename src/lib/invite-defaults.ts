export const DEFAULT_INVITE_TEXT = "با من سر قرار میای؟";

export function normalizeInviteText(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_INVITE_TEXT;
  const trimmed = value.trim();
  return trimmed || DEFAULT_INVITE_TEXT;
}
