import { NextResponse } from "next/server";

const AUTH_USER = process.env.AUTH_USER || "admin";

export async function GET(req) {
  const session = req.cookies.get("session");
  if (session?.value) {
    return NextResponse.json({ authenticated: true, username: AUTH_USER });
  }
  return NextResponse.json({ authenticated: false });
}