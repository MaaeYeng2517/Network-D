import { NextResponse } from "next/server";
import { listInterfaces } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const interfaces = await listInterfaces();
  return NextResponse.json({ interfaces });
}