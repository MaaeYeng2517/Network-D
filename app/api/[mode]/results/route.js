import { NextResponse } from "next/server";
import { getResults, clearResults } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validMode(mode) {
  return ["iperf", "tcpdump", "scapy", "tshark", "traceroute"].includes(mode);
}

export async function GET(req, { params }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { mode } = await params;
  if (!validMode(mode)) {
    return NextResponse.json({ error: "unknown mode" }, { status: 404 });
  }
  return NextResponse.json({ results: getResults(mode) });
}

export async function DELETE(req, { params }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { mode } = await params;
  if (!validMode(mode)) {
    return NextResponse.json({ error: "unknown mode" }, { status: 404 });
  }
  clearResults(mode);
  return NextResponse.json({ cleared: true });
}