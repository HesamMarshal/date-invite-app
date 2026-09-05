/**
 * Public contact block for «ارتباط با ما» (Kavenegar activation requirement).
 * Override via env on the server without a rebuild for address/phones/email
 * (except when you prefer committing the real values here).
 */
export type SiteContact = {
  brandFa: string;
  brandEn: string;
  siteUrl: string;
  address: string;
  landline: string;
  mobile: string;
  email: string;
  telegram: string;
};

const defaults: SiteContact = {
  brandFa: "بیا با من",
  brandEn: "BiyaBaMan",
  siteUrl: "https://biyabaman.ir",
  address: "ایران، شیراز",
  /** Required by Kavenegar — set CONTACT_LANDLINE in env if not filled here */
  landline: "",
  mobile: "09173918727",
  email: "info@biyabaman.ir",
  telegram: "HesamMarshal",
};

function pick(envKey: string, fallback: string): string {
  const v = process.env[envKey]?.trim();
  return v || fallback;
}

export function getSiteContact(): SiteContact {
  return {
    brandFa: defaults.brandFa,
    brandEn: defaults.brandEn,
    // Always the public brand domain (not NEXT_PUBLIC_APP_URL — that is localhost in local .env)
    siteUrl: defaults.siteUrl,
    address: pick("CONTACT_ADDRESS", defaults.address),
    landline: pick("CONTACT_LANDLINE", defaults.landline),
    mobile: pick("CONTACT_MOBILE", defaults.mobile),
    email: pick("CONTACT_EMAIL", defaults.email),
    telegram: pick("CONTACT_TELEGRAM", defaults.telegram).replace(/^@/, ""),
  };
}

export function formatMobileDisplay(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return mobile;
}
