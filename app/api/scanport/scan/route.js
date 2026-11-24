import { NextResponse } from "next/server";
import { scanPorts } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const target = String(data.target || "").trim();
  const ports = data.ports || "22,80,443";
  const timeoutMs = data.timeoutMs != null ? Number(data.timeoutMs) : 1500;
  const concurrency = data.concurrency != null ? Number(data.concurrency) : 100;
  const rounds = data.rounds != null ? Number(data.rounds) : 1;

  if (!target) {
    return NextResponse.json({ error: "target required" }, { status: 400 });
  }

  try {
    const result = await scanPorts(target, ports, { timeoutMs, concurrency, rounds });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e && e.message ? e.message : e) }, { status: 400 });
  }
}
