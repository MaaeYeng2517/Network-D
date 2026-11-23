import { NextResponse } from "next/server";

export function requireAuth(req) {
  const session = req.cookies.get("session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}