import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIM_PY = path.join(process.cwd(), "scripts", "net_sim.py");

export async function POST(req) {
  const authError = requireAuth(req);
  if (authError) return authError;

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const topo = body.topo;
  if (!topo || typeof topo !== "object") {
    return NextResponse.json({ error: "topo required" }, { status: 400 });
  }

  const mode = body.mode === "trace" ? "--trace" : "--ping";
  const src = body.src || "";
  const dst = body.dst || "";
  const count = body.count ? ["--count", String(body.count)] : [];

  const proc = spawn("python3", [SIM_PY, JSON.stringify(topo), mode, src, dst, ...count], {
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });

  let out = "";
  let err = "";
  proc.stdout.on("data", (d) => (out += d.toString()));
  proc.stderr.on("data", (d) => (err += d.toString()));

  return new Promise((resolve) => {
    proc.on("close", () => {
      resolve(
        NextResponse.json({
          output: out || err || "(no output)",
          mode: mode === "--trace" ? "traceroute" : "ping",
          src,
          dst,
        })
      );
    });
    proc.on("error", (e) => {
      resolve(NextResponse.json({ error: e.message }, { status: 500 }));
    });
    setTimeout(() => {
      try { proc.kill(); } catch { /* ignore */ }
      resolve(NextResponse.json({ output: out || err || "timeout" }));
    }, 15000);
  });
}