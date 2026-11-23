import { NextResponse } from "next/server";
import { stopProcess } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";

export async function POST(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const id = data.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  return NextResponse.json({ stopped: stopProcess(id) });
}