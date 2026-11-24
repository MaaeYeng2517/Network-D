import { NextResponse } from "next/server";
import {
  startListener,
  stopListener,
  listListeners,
  getServiceInfo,
} from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const authError = requireAuth(req);
  if (authError) return authError;
  return NextResponse.json({ services: listListeners() });
}

export async function POST(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const port = data.port;
  if (port == null) {
    return NextResponse.json({ error: "port required" }, { status: 400 });
  }
  const p = Number(port);
  if (!Number.isFinite(p) || p < 1 || p > 65535) {
    return NextResponse.json({ error: "invalid port" }, { status: 400 });
  }
  try {
    const result = startListener(p);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (e) {
    return NextResponse.json({ error: String(e && e.message ? e.message : e) }, { status: 400 });
  }
}

export async function DELETE(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const port = data.port;
  if (port == null) {
    return NextResponse.json({ error: "port required" }, { status: 400 });
  }
  const p = Number(port);
  try {
    const result = await stopListener(p);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (e) {
    return NextResponse.json({ error: String(e && e.message ? e.message : e) }, { status: 400 });
  }
}

export async function OPTIONS(req) {
  const authError = requireAuth(req);
  if (authError) return authError;
  return NextResponse.json({ service: getServiceInfo(Number(req.nextUrl.searchParams.get("port") || "0")) });
}
