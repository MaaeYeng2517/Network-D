import { NextResponse } from "next/server";
import { createActivationToken, hashLicenseValue, getDeviceId, licenseDb } from "@/lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const key = typeof body.license_key === "string" ? body.license_key.trim().toUpperCase() : "";
    const deviceId = getDeviceId(body.device_id);
    if (!key || !deviceId) {
      return NextResponse.json({ success: false, error: "license_key และ device_id ไม่ถูกต้อง" }, { status: 400 });
    }

    const token = createActivationToken();
    const response = await licenseDb("rpc/activate_network_d_license", {
      method: "POST",
      body: JSON.stringify({
        p_key_hash: hashLicenseValue(key),
        p_device_id: deviceId,
        p_token_hash: hashLicenseValue(token),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ success: false, error: "ไม่สามารถเปิดใช้งาน License ได้" }, { status: response.status >= 500 ? 503 : 400 });
    }
    const record = Array.isArray(result) ? result[0] : result;
    if (!record?.activation_id) {
      return NextResponse.json({ success: false, error: record?.error || "License ไม่ถูกต้องหรือหมดสิทธิ์" }, { status: 403 });
    }
    return NextResponse.json({
      success: true,
      activation_token: token,
      license: {
        status: record.status,
        expires_at: record.expires_at,
        device_id: deviceId,
      },
    });
  } catch (error) {
    console.error("License activation error:", error);
    return NextResponse.json({ success: false, error: "License service unavailable" }, { status: 503 });
  }
}
