import { NextResponse } from "next/server";

export async function GET(req) {
  const session = req.cookies.get("session");
  if (session?.value) {
    const role = req.cookies.get("role")?.value || "admin";
    const username = req.cookies.get("username")?.value || role;
    return NextResponse.json({ authenticated: true, username, role });
  }
  return NextResponse.json({ authenticated: false });
}