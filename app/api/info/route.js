import { NextResponse } from "next/server";
import { getVersion } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const [iperf, tcpdump] = await Promise.all([
    getVersion(process.env.IPERF_BIN || "iperf3"),
    getVersion(process.env.TCPDUMP_BIN || "tcpdump"),
  ]);
  return NextResponse.json({
    iperf: process.env.IPERF_BIN || "iperf3",
    tcpdump: process.env.TCPDUMP_BIN || "tcpdump",
    version: iperf,
    tcpdumpVersion: tcpdump,
  });
}