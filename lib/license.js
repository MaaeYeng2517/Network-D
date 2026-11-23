import crypto from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hashLicenseValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

export function createLicenseKey() {
  const raw = crypto.randomBytes(18).toString("hex").toUpperCase();
  return `ND-${raw.match(/.{1,6}/g).join("-")}`;
}

export function createActivationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function licenseDb(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("License storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return fetch(`${SUPABASE_URL.replace(/\\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
}

export function jsonError(message, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function getDeviceId(value) {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id.length >= 8 && id.length <= 128 ? id : null;
}
