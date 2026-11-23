import { NextResponse } from "next/server";
import { hashLicenseValue, getDeviceId, licenseDb } from "@/lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const token = typeof body.activation_token === "string" ? body.activation_token : "";
    const deviceId = getDeviceId(body.device_id);
    if (!token || !deviceId) {
      return NextResponse.json({ valid: false, error: "activation_token หรือ device_id ไม่ถูกต้อง" }, { status: 400 });
    }
    const response = await licenseDb("rpc/validate_network_d_license", {
      method: "POST",
      body: JSON.stringify({ p_token_hash: hashLicenseValue(token), p_device_id: deviceId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error("License database request failed");
    const record = Array.isArray(result) ? result[0] : result;
    const valid = Boolean(record?.valid);
    return NextResponse.json({
      valid,
      status: record?.status || "invalid",
      expires_at: record?.expires_at || null,
      checked_at: new Date().toISOString(),
    }, { status: valid ? 200 : 403 });
  } catch (error) {
    console.error("License validation error:", error);
    return NextResponse.json({ valid: false, error: "License service unavailable" }, { status: 503 });
  }
}
