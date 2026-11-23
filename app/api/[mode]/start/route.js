import { NextResponse } from "next/server";
import { startProcess } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";

function validMode(mode) {
  return ["iperf", "tcpdump", "scapy", "tshark", "traceroute"].includes(mode);
}

export async function POST(req, { params }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { mode } = await params;
  if (!validMode(mode)) {
    return NextResponse.json({ error: "unknown mode" }, { status: 404 });
  }
  let data;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const argv = data.argv;
  if (!Array.isArray(argv) || argv.length === 0) {
    return NextResponse.json({ error: "argv (non-empty list) required" }, { status: 400 });
  }
  try {
    const id = startProcess(mode, argv);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: String(e && e.message ? e.message : e) }, { status: 400 });
  }
}