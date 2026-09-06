/**
 * Public brand contact for marketing pages.
 * Personal PII must stay empty in defaults — use env only if you intentionally
 * publish a brand phone/address (not a personal one).
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
  address: "",
  landline: "",
  mobile: "",
  email: "info@biyabaman.ir",
  telegram: "",
};

function pick(envKey: string, fallback: string): string {
  const v = process.env[envKey]?.trim();
  return v || fallback;
}

export function getSiteContact(): SiteContact {
  return {
    brandFa: defaults.brandFa,
    brandEn: defaults.brandEn,
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
