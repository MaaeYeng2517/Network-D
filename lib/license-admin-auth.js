import crypto from "node:crypto";
import { NextResponse } from "next/server";

export function requireLicenseAdmin(req) {
  const expected = process.env.LICENSE_ADMIN_TOKEN;
  const authorization = req.headers.get("authorization") || "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!expected || !supplied) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
