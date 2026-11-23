#!/usr/bin/env python3
"""iPerf3 Dashboard - local web UI to build, run and graph iperf3 commands in realtime.

Stdlib only. No third-party dependencies.

Features:
  * Build / pick iperf3 commands (client & server) from the web UI.
  * Runs iperf3 and streams output live over Server-Sent Events (SSE).
  * Parses per-interval throughput and pushes structured data points for a
    realtime chart (bits/sec over time).
  * Persists completed runs to results.json and exposes them as history.

Run:
    python3 server.py
Then open http://127.0.0.1:8765
"""

import hashlib
import json
import os
import queue
import re
import secrets
import shutil
import subprocess
import threading
import time
import uuid
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.environ.get("IPERF_HOST", "127.0.0.1")
PORT = int(os.environ.get("IPERF_PORT", "8765"))
IPERF_BIN = os.environ.get("IPERF_BIN", "iperf3")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
RESULTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.json")
TCPDUMP_RESULTS_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "tcpdump_results.json")
TCPDUMP_BIN = os.environ.get("TCPDUMP_BIN", "tcpdump")
MAX_RESULTS = 100

AUTH_USER = os.environ.get("AUTH_USER", "admin")
AUTH_PASS_HASH = os.environ.get("AUTH_PASS_HASH")
if not AUTH_PASS_HASH:
    default_pass = os.environ.get("AUTH_PASS", "changeme")
    AUTH_PASS_HASH = hashlib.sha256(default_pass.encode()).hexdigest()
SESSION_TTL = int(os.environ.get("SESSION_TTL", "86400"))

_sessions = {}
_lock = threading.Lock()
_results_lock = threading.Lock()
_auth_sessions = {}
_auth_lock = threading.Lock()


def _verify_password(password):
    return hashlib.sha256(password.encode()).hexdigest() == AUTH_PASS_HASH


def _create_session(username):
    token = secrets.token_urlsafe(32)
    expiry = time.time() + SESSION_TTL
    with _auth_lock:
        _auth_sessions[token] = {"username": username, "expiry": expiry}
    return token


def _validate_session(token):
    if not token:
        return None
    with _auth_lock:
        session = _auth_sessions.get(token)
    if not session:
        return None
    if session["expiry"] < time.time():
        with _auth_lock:
            _auth_sessions.pop(token, None)
        return None
    session["expiry"] = time.time() + SESSION_TTL
    return session["username"]


def _delete_session(token):
    with _auth_lock:
        _auth_sessions.pop(token, None)


def _get_cookie(headers, name):
    cookie_header = headers.get("Cookie", "")
    for part in cookie_header.split(";"):
        part = part.strip()
        if part.startswith(name + "="):
            return part[len(name) + 1:]
    return None


def _set_cookie(name, value, max_age=SESSION_TTL):
    return f"{name}={value}; Path=/; HttpOnly; SameSite=Lax; Max-Age={max_age}"


def _require_auth(handler):
    token = _get_cookie(handler.headers, "session")
    username = _validate_session(token)
    if not username:
        handler.send_response(302)
        handler.send_header("Location", "/login")
        handler.send_header("Set-Cookie", _set_cookie("session", "", max_age=0))
        handler.end_headers()
        return False
    return True

# Matches periodic and summary lines, e.g.:
# [  4]   0.00-1.01   sec  16.6 GBytes   142 Gbits/sec    0   4.00 MBytes
_INTERVAL_RE = re.compile(
    r"^\s*\[\s*\d+\]\s+([\d.]+)-([\d.]+)\s+sec\s+"
    r"([\d.]+\s*[KMGTPE]?Bytes)\s+"
    r"([\d.]+\s*[KMGTPE]?bits?/sec)"
)
_BYTES_RE = re.compile(r"([\d.]+)\s*([KMGTPE]?)Bytes")
_BITS_RE = re.compile(r"([\d.]+)\s*([KMGTPE]?)bits?/sec")
# Default tcpdump line begins with an HH:MM:SS.ffffff timestamp.
_PACKET_RE = re.compile(r"^\d\d:\d\d:\d\d\.\d+")
_PREF_BITS = {"": 1, "K": 1e3, "M": 1e6, "G": 1e9, "T": 1e12, "P": 1e15, "E": 1e18}
_PREF_BYTES = {"": 1, "K": 1024, "M": 1024**2, "G": 1024**3,
               "T": 1024**4, "P": 1024**5, "E": 1024**6}


def _arg_val(argv, flag):
    if flag in argv:
        i = argv.index(flag)
        if i + 1 < len(argv):
            return argv[i + 1]
    return ""


def _list_interfaces():
    try:
        out = subprocess.run([TCPDUMP_BIN, "-D"],
                             capture_output=True, text=True, timeout=5)
    except Exception:
        return []
    ifaces = []
    for ln in out.stdout.splitlines():
        m = re.match(r"^(\d+)\.(\S+)\s+\[(.*)\]", ln.strip())
        if m:
            ifaces.append({"num": m.group(1), "name": m.group(2),
                           "status": m.group(3)})
    return ifaces


def _parse_bytes(text):
    m = _BYTES_RE.match(text.strip())
    if not m:
        return 0.0
    return float(m.group(1)) * _PREF_BYTES.get(m.group(2), 1)


def _parse_bits(text):
    m = _BITS_RE.match(text.strip())
    if not m:
        return 0.0
    return float(m.group(1)) * _PREF_BITS.get(m.group(2), 1)


def _parse_interval(line):
    m = _INTERVAL_RE.match(line)
    if not m:
        return None
    return {
        "start": float(m.group(1)),
        "end": float(m.group(2)),
        "bytes": _parse_bytes(m.group(3)),
        "bps": _parse_bits(m.group(4)),
    }


# ---------------- results persistence ----------------
def _load_results():
    try:
        with open(RESULTS_FILE, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_results(records):
    tmp = RESULTS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, RESULTS_FILE)


def _store_result(record):
    with _results_lock:
        records = _load_results()
        records.append(record)
        records = records[-MAX_RESULTS:]
        _save_results(records)
    return record


# ---------------- tcpdump results persistence ----------------
def _load_tcpdump_results():
    try:
        with open(TCPDUMP_RESULTS_FILE, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            return data if isinstance(data, list) else []
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_tcpdump_results(records):
    tmp = TCPDUMP_RESULTS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, TCPDUMP_RESULTS_FILE)


def _store_tcpdump_result(record):
    with _results_lock:
        records = _load_tcpdump_results()
        records.append(record)
        records = records[-MAX_RESULTS:]
        _save_tcpdump_results(records)
    return record


def _build_tcpdump_record(sid, argv, packets, pps_series):
    return {
        "id": sid,
        "ts": datetime.now().isoformat(timespec="seconds"),
        "argv": argv,
        "mode": "tcpdump",
        "interface": _arg_val(argv, "-i") or "(default)",
        "packets": packets,
        "pps_series": pps_series,
    }


def _build_record(sid, argv, intervals, summary):
    """Turn parsed intervals + summary into a storable result record."""
    if not intervals and not summary:
        return None
    rec = {
        "id": sid,
        "ts": datetime.now().isoformat(timespec="seconds"),
        "argv": argv,
        "role": "server" if "-s" in argv else "client",
        "proto": "udp" if "-u" in argv else "tcp",
        "host": "",
        "duration": 0.0,
        "totalMB": 0.0,
        "avgMbps": 0.0,
        "intervals": [],
    }
    if "-c" in argv:
        idx = argv.index("-c")
        if idx + 1 < len(argv):
            rec["host"] = argv[idx + 1]
    # Prefer receiver totals, fall back to sender.
    pick = summary.get("receiver") or summary.get("sender")
    if pick:
        rec["duration"] = round(pick["end"], 2)
        rec["totalMB"] = round(pick["bytes"] / 1e6, 3)
        rec["avgMbps"] = round(pick["bps"] / 1e6, 3)
    if not rec["duration"] and intervals:
        rec["duration"] = round(intervals[-1]["end"], 2)
    rec["intervals"] = [
        {"t": round(p["end"], 2), "mbps": round(p["bps"] / 1e6, 3)}
        for p in intervals
    ]
    return rec


# ---------------- process management ----------------
def _ensure_interval(argv):
    """Guarantee per-second output for client runs so we can graph in realtime."""
    if "-c" not in argv:
        return argv
    if any(a in ("-i", "--interval") for a in argv):
        return argv
    if any(a in ("-J", "--json") for a in argv):
        return argv
    return argv + ["-i", "1"]


def _ensure_live_tcpdump(argv):
    """Force line/packet buffered output so packets stream in realtime."""
    out = list(argv)
    if "-U" not in out and "--immediate-mode" not in out:
        out.append("-U")
    if "-l" not in out:
        out.append("-l")
    return out


def _purge():
    with _lock:
        for sid in [s for s, i in _sessions.items() if i["proc"].poll() is not None]:
            _sessions.pop(sid, None)


def start_session(argv, mode="iperf"):
    """Launch iperf3/tcpdump with argv (list, no shell) and return a session id."""
    binary = IPERF_BIN if mode == "iperf" else TCPDUMP_BIN
    if not shutil.which(binary) and not os.path.isabs(binary):
        raise FileNotFoundError(
            f"'{binary}' not found. Install it or set the env var."
        )
    _purge()
    if mode == "iperf":
        argv = _ensure_interval(list(argv))
    else:
        argv = _ensure_live_tcpdump(list(argv))
    sid = uuid.uuid4().hex
    q = queue.Queue()
    proc = subprocess.Popen(
        [binary] + argv,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    info = {"proc": proc, "queue": q}
    with _lock:
        _sessions[sid] = info

    stats = {"count": 0, "packets": 0, "series": []}
    clock_lock = threading.Lock()

    def reader():
        intervals = []
        summary = {}
        try:
            for line in proc.stdout:
                text = line.rstrip("\n")
                q.put(("line", text))
                if mode == "tcpdump":
                    if _PACKET_RE.match(text):
                        with clock_lock:
                            stats["count"] += 1
                            stats["packets"] += 1
                    continue
                parsed = _parse_interval(text)
                if parsed:
                    if "sender" in text or "receiver" in text:
                        role = "sender" if "sender" in text else "receiver"
                        summary[role] = parsed
                        q.put(("summary", {"role": role,
                                           "end": round(parsed["end"], 2),
                                           "mbps": round(parsed["bps"] / 1e6, 3),
                                           "totalMB": round(parsed["bytes"] / 1e6, 3)}))
                    else:
                        intervals.append(parsed)
                        q.put(("data", {"t": round(parsed["end"], 2),
                                        "mbps": round(parsed["bps"] / 1e6, 3)}))
        except Exception as exc:  # pragma: no cover
            q.put(("line", f"[reader error] {exc}"))
        finally:
            rc = proc.wait()
            if mode == "iperf":
                rec = _build_record(sid, argv, intervals, summary)
                store = _store_result
            else:
                with clock_lock:
                    series = list(stats["series"])
                    packets = stats["packets"]
                rec = _build_tcpdump_record(sid, argv, packets, series)
                store = _store_tcpdump_result
            if rec:
                try:
                    store(rec)
                except Exception as exc:  # pragma: no cover
                    q.put(("line", f"[store error] {exc}"))
                q.put(("record", rec))
            q.put(("exit", rc))

    def ticker():
        while proc.poll() is None:
            time.sleep(1.0)
            with clock_lock:
                c = stats["count"]
                stats["count"] = 0
                stats["series"].append(c)
                total = stats["packets"]
            q.put(("data", {"pps": c, "packets": total}))

    threading.Thread(target=reader, daemon=True).start()
    if mode == "tcpdump":
        threading.Thread(target=ticker, daemon=True).start()
    return sid


def stop_session(sid):
    with _lock:
        info = _sessions.get(sid)
    if not info:
        return False
    proc = info["proc"]
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()
    return True


class Handler(BaseHTTPRequestHandler):
    server_version = "iPerf3Dashboard/2.0"

    def log_message(self, *args):
        pass

    def _json(self, obj, code=200, extra_headers=None):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _serve_index(self):
        path = os.path.join(STATIC_DIR, "index.html")
        try:
            with open(path, "rb") as fh:
                body = fh.read()
        except FileNotFoundError:
            self._json({"error": "index.html missing"}, 500)
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_login(self):
        path = os.path.join(STATIC_DIR, "login.html")
        try:
            with open(path, "rb") as fh:
                body = fh.read()
        except FileNotFoundError:
            self._json({"error": "login.html missing"}, 500)
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/login":
            token = _get_cookie(self.headers, "session")
            if _validate_session(token):
                self.send_response(302)
                self.send_header("Location", "/")
                self.end_headers()
                return
            self._serve_login()
            return
        if self.path == "/logout":
            token = _get_cookie(self.headers, "session")
            _delete_session(token)
            self.send_response(302)
            self.send_header("Location", "/login")
            self.send_header("Set-Cookie", _set_cookie("session", "", max_age=0))
            self.end_headers()
            return
        if self.path in ("/", "/index.html"):
            if not _require_auth(self):
                return
            self._serve_index()
            return
        if self.path == "/api/info":
            if not _require_auth(self):
                return
            ver = "unknown"
            try:
                out = subprocess.run([IPERF_BIN, "--version"],
                                     capture_output=True, text=True, timeout=5)
                ver = (out.stdout.splitlines() or ["unknown"])[0]
            except Exception as exc:
                ver = f"error: {exc}"
            self._json({"iperf": IPERF_BIN, "version": ver})
            return
        if self.path == "/api/results":
            if not _require_auth(self):
                return
            with _results_lock:
                self._json({"results": _load_results()})
            return
        if self.path == "/api/tcpdump/interfaces":
            if not _require_auth(self):
                return
            self._json({"interfaces": _list_interfaces()})
            return
        if self.path == "/api/tcpdump/results":
            if not _require_auth(self):
                return
            with _results_lock:
                self._json({"results": _load_tcpdump_results()})
            return
        if self.path.startswith("/api/stream/"):
            if not _require_auth(self):
                return
            self._stream(self.path[len("/api/stream/"):])
            return
        self._json({"error": "not found"}, 404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(length) if length else b""
        try:
            data = json.loads(raw) if raw else {}
        except Exception:
            data = {}
        if self.path == "/api/login":
            username = data.get("username", "")
            password = data.get("password", "")
            if username == AUTH_USER and _verify_password(password):
                token = _create_session(username)
                self._json({"success": True}, 200, {"Set-Cookie": _set_cookie("session", token)})
            else:
                self._json({"success": False, "error": "Invalid credentials"}, 401)
            return
        if self.path == "/api/logout":
            token = _get_cookie(self.headers, "session")
            _delete_session(token)
            self._json({"success": True}, 200, {"Set-Cookie": _set_cookie("session", "", max_age=0)})
            return
        if not _require_auth(self):
            return
        if self.path == "/api/start":
            argv = data.get("argv")
            if not isinstance(argv, list) or not argv:
                self._json({"error": "argv (non-empty list) required"}, 400)
                return
            try:
                sid = start_session(argv)
            except Exception as exc:
                self._json({"error": str(exc)}, 400)
                return
            self._json({"id": sid})
            return
        if self.path == "/api/tcpdump/start":
            argv = data.get("argv")
            if not isinstance(argv, list) or not argv:
                self._json({"error": "argv (non-empty list) required"}, 400)
                return
            try:
                sid = start_session(argv, mode="tcpdump")
            except Exception as exc:
                self._json({"error": str(exc)}, 400)
                return
            self._json({"id": sid})
            return
        if self.path == "/api/stop":
            sid = data.get("id")
            if not sid:
                self._json({"error": "id required"}, 400)
                return
            self._json({"stopped": stop_session(sid)})
            return
        if self.path == "/api/clear":
            with _results_lock:
                _save_results([])
            self._json({"cleared": True})
            return
        if self.path == "/api/tcpdump/clear":
            with _results_lock:
                _save_tcpdump_results([])
            self._json({"cleared": True})
            return
        self._json({"error": "not found"}, 404)

    def _stream(self, sid):
        with _lock:
            info = _sessions.get(sid)
        if not info:
            self._json({"error": "unknown session"}, 404)
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        q = info["queue"]
        self.close_connection = True
        try:
            while True:
                try:
                    kind, payload = q.get(timeout=1.0)
                except queue.Empty:
                    self.wfile.write(b": keepalive\n\n")
                    self.wfile.flush()
                    continue
                if kind == "exit":
                    chunk = "data: " + json.dumps({"type": "exit", "code": payload}) + "\n\n"
                else:
                    chunk = "data: " + json.dumps({"type": kind, **payload}
                                                  if isinstance(payload, dict)
                                                  else {"type": kind, "value": payload}) + "\n\n"
                self.wfile.write(chunk.encode())
                self.wfile.flush()
                if kind == "exit":
                    break
        except (BrokenPipeError, ConnectionResetError):
            pass


def main():
    ThreadingHTTPServer.allow_reuse_address = True
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"iPerf3 Dashboard running at http://{HOST}:{PORT}")
    print(f"Using iperf3 binary: {IPERF_BIN}")
    print(f"Results file: {RESULTS_FILE}")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        for info in list(_sessions.values()):
            if info["proc"].poll() is None:
                info["proc"].terminate()
        httpd.shutdown()


if __name__ == "__main__":
    main()