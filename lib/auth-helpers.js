import { NextResponse } from "next/server";

export function requireAuth(req) {
  const session = req.cookies.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function requireAdmin(req) {
  const session = req.cookies.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = req.cookies.get("role")?.value;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }
  return null;
}