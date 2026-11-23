#!/usr/bin/env python3
"""Scapy packet runner for the Network Dashboard.

Usage:
    python3 scapy_runner.py '<json-config>'

Config keys: target, type (icmp|tcp|udp), count, interval, timeout, port,
payload, iface.

Emits line-oriented, flush-immediate output so the dashboard can stream it:
    reply #<n> from <src> time=<ms> ms
    timeout #<n>
    SUMMARY sent=<n> recv=<n> [avg=<ms> min=<ms> max=<ms>]
"""

import json
import sys
import time


def emit(msg):
    sys.stdout.write(msg + "\n")
    sys.stdout.flush()


def main():
    cfg = {}
    try:
        if len(sys.argv) > 1:
            cfg = json.loads(sys.argv[1])
        else:
            cfg = json.load(sys.stdin)
    except Exception as exc:
        emit(f"ERROR: invalid config: {exc}")
        emit("SUMMARY sent=0 recv=0")
        return

    target = cfg.get("target", "127.0.0.1")
    ptype = cfg.get("type", "icmp")
    count = int(cfg.get("count", 4) or 4)
    interval = float(cfg.get("interval", 1.0) or 0)
    timeout = float(cfg.get("timeout", 2.0) or 2)
    port = int(cfg.get("port", 80) or 80)
    payload = cfg.get("payload", "hello")
    iface = cfg.get("iface") or None

    try:
        from scapy.all import IP, ICMP, TCP, UDP, Raw, sr1  # noqa: F401
    except Exception as exc:
        emit(f"ERROR: cannot import scapy: {exc}")
        emit("SUMMARY sent=0 recv=0")
        return

    iface_kw = {"iface": iface} if iface else {}

    def build():
        if ptype == "tcp":
            return IP(dst=target) / TCP(dport=port, flags="S")
        if ptype == "udp":
            return IP(dst=target) / UDP(dport=port) / Raw(load=payload.encode())
        return IP(dst=target) / ICMP()

    emit(f"Scapy sending {count} x {ptype} -> {target}"
         + (f":{port}" if ptype in ("tcp", "udp") else ""))

    sent = 0
    recv = 0
    lat = []
    for i in range(1, count + 1):
        pkt = build()
        t0 = time.time()
        ans = None
        try:
            ans = sr1(pkt, timeout=timeout, verbose=0, **iface_kw)
        except PermissionError:
            emit("ERROR: ต้องใช้สิทธิ์ root สำหรับ raw socket (ลองรันแบบ sudo)")
            emit(f"SUMMARY sent={sent} recv={recv}")
            return
        except Exception as exc:
            emit(f"ERROR: {exc}")
        dt = (time.time() - t0) * 1000
        sent += 1
        if ans is not None:
            recv += 1
            lat.append(dt)
            try:
                src = ans.src
            except Exception:
                src = target
            emit(f"reply #{i} from {src} time={dt:.1f} ms")
        else:
            emit(f"timeout #{i}")
        if i < count and interval > 0:
            time.sleep(interval)

    if lat:
        emit(f"SUMMARY sent={sent} recv={recv} avg={sum(lat)/len(lat):.1f} "
             f"min={min(lat):.1f} max={max(lat):.1f}")
    else:
        emit(f"SUMMARY sent={sent} recv={recv}")


if __name__ == "__main__":
    main()