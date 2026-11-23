import { getSession } from "@/lib/procman";
import { requireAuth } from "@/lib/auth-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const authError = requireAuth(req);
  if (authError) return authError;

  const { id } = await params;
  const s = getSession(id);
  if (!s) {
    return new Response("data: " + JSON.stringify({ type: "error", error: "unknown session" }) + "\n\n", {
      status: 404,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (obj) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const onEvent = (ev) => {
        send(ev);
        if (ev.type === "exit") {
          cleanup();
          if (!closed) {
            closed = true;
            try { controller.close(); } catch { /* ignore */ }
          }
        }
      };

      // Replay buffered events so nothing is lost between start and connect.
      for (const ev of s.buffer) {
        send(ev);
        if (ev.type === "exit") break;
      }

      if (s.ended) {
        if (s.code !== null && !s.buffer.some((e) => e.type === "exit")) {
          send({ type: "exit", code: s.code });
        }
        closed = true;
        try { controller.close(); } catch { /* ignore */ }
        return;
      }

      s.listeners.add(onEvent);
      const keepalive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch { /* ignore */ }
      }, 15000);

      cleanup = () => {
        if (closed && !keepalive) return;
        clearInterval(keepalive);
        s.listeners.delete(onEvent);
      };

      const abort = () => {
        cleanup();
        if (!closed) {
          closed = true;
          try { controller.close(); } catch { /* ignore */ }
        }
      };
      req.signal.addEventListener("abort", abort);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}