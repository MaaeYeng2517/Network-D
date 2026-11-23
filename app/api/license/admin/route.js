import { NextResponse } from "next/server";
import { requireLicenseAdmin } from "@/lib/license-admin-auth";
import { createLicenseKey, hashLicenseValue, licenseDb } from "@/lib/license";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(req) {
  return requireLicenseAdmin(req);
}

export async function GET(req) {
  const authError = unauthorized(req);
  if (authError) return authError;
  try {
    const response = await licenseDb("licenses?select=id,customer_email,plan,status,expires_at,max_activations,created_at&order=created_at.desc");
    if (!response.ok) throw new Error("Could not list licenses");
    return NextResponse.json({ success: true, licenses: await response.json() });
  } catch (error) {
    console.error("License admin list error:", error);
    return NextResponse.json({ success: false, error: "License storage unavailable" }, { status: 503 });
  }
}

export async function POST(req) {
  const authError = unauthorized(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const email = typeof body.customer_email === "string" ? body.customer_email.trim().toLowerCase() : "";
    const plan = typeof body.plan === "string" ? body.plan.trim() : "developer-monthly";
    const days = Number(body.duration_days ?? 30);
    const maxActivations = Number(body.max_activations ?? 1);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "อีเมลลูกค้าไม่ถูกต้อง" }, { status: 400 });
    }
    if (!Number.isInteger(days) || days < 1 || days > 3660 || !Number.isInteger(maxActivations) || maxActivations < 1 || maxActivations > 100) {
      return NextResponse.json({ success: false, error: "duration_days หรือ max_activations ไม่ถูกต้อง" }, { status: 400 });
    }
    const key = createLicenseKey();
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    const response = await licenseDb("licenses", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        key_hash: hashLicenseValue(key),
        customer_email: email,
        plan,
        status: "active",
        expires_at: expiresAt,
        max_activations: maxActivations,
      }),
    });
    if (!response.ok) throw new Error("Could not create license");
    const rows = await response.json();
    return NextResponse.json({
      success: true,
      license_key: key,
      license: rows?.[0] ? {
        id: rows[0].id,
        customer_email: rows[0].customer_email,
        plan: rows[0].plan,
        status: rows[0].status,
        expires_at: rows[0].expires_at,
        max_activations: rows[0].max_activations,
      } : null,
      notice: "คัดลอก License Key และส่งให้ลูกค้า ระบบจะแสดง Key เต็มเพียงครั้งนี้",
    }, { status: 201 });
  } catch (error) {
    console.error("License creation error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถสร้าง License ได้ ตรวจสอบการตั้งค่าฐานข้อมูล" }, { status: 503 });
  }
}

export async function PATCH(req) {
  const authError = unauthorized(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status;
    if (!id || !["active", "suspended", "revoked"].includes(status)) {
      return NextResponse.json({ success: false, error: "id หรือ status ไม่ถูกต้อง" }, { status: 400 });
    }
    const response = await licenseDb(`licenses?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error("Could not update license");
    const rows = await response.json();
    if (!rows.length) return NextResponse.json({ success: false, error: "ไม่พบ License" }, { status: 404 });
    return NextResponse.json({ success: true, license: rows[0] });
  } catch (error) {
    console.error("License status update error:", error);
    return NextResponse.json({ success: false, error: "ไม่สามารถเปลี่ยนสถานะ License ได้" }, { status: 503 });
  }
}
