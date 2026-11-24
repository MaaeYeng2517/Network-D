#!/usr/bin/env python3
"""Virtual network simulator for Network-D.
Reads a topology JSON from stdin (or argv), simulates ping/trace, prints results.
Usage: net_sim.py '{"nodes":[...],"links":[...]}' [--ping A B] [--trace A B]
"""
import json, sys, time, random, argparse


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("topo", help="topology JSON string")
    p.add_argument("--ping", nargs=2, metavar=("A", "B"))
    p.add_argument("--trace", nargs=2, metavar=("A", "B"))
    p.add_argument("--count", type=int, default=4)
    return p.parse_args()


def find_node(topo, ident):
    for n in topo.get("nodes", []):
        if n.get("id") == ident or n.get("name") == ident:
            return n
    return None


def link_cost(link, topo):
    a = find_node(topo, link.get("a"))
    b = find_node(topo, link.get("b"))
    base = 1.0
    if a and b:
        la = (a.get("layer") or 1)
        lb = (b.get("layer") or 1)
        base = max(la, lb) * 0.5 + 0.2
    cable = (link.get("cable") or "").lower()
    if "wan" in cable or "fiber" in cable:
        base *= 2.5
    elif "uplink" in cable:
        base *= 1.2
    return base


def ping(topo, src, dst, count=4):
    links = topo.get("links", [])
    # BFS shortest path
    from collections import deque
    adj = {}
    for l in links:
        adj.setdefault(l.get("a"), []).append((l.get("b"), l))
        adj.setdefault(l.get("b"), []).append((l.get("a"), l))
    if src not in adj or dst not in adj:
        print(f"ping: route from {src} to {dst} not found")
        return
    q = deque([(src, [])])
    seen = {src}
    path = None
    while q:
        cur, path_edges = q.popleft()
        if cur == dst:
            path = path_edges
            break
        for nxt, edge in adj.get(cur, []):
            if nxt in seen:
                continue
            seen.add(nxt)
            q.append((nxt, path_edges + [edge]))
    if path is None:
        print(f"ping: no path {src} -> {dst}")
        return
    total_cost = sum(link_cost(l, topo) for l in path)
    hops = len(path)
    print(f"PING {src} -> {dst}: {hops} hops, path cost {total_cost:.2f}")
    for i in range(count):
        t = total_cost + random.uniform(0.2, 1.5)
        ttl = 64 - hops
        print(f"  {i+1}: 64 bytes, ttl={ttl}, time={t:.2f} ms")
        sys.stdout.flush()
        time.sleep(0.18)
    print(f"--- {src} ping statistics ---")
    print(f"{count} packets transmitted, {count} received, 0% loss")
    avg = total_cost + random.uniform(0.3, 0.8)
    print(f"round-trip min/avg/max = {total_cost:.2f}/{avg:.2f}/{total_cost+1.5:.2f} ms")


def trace(topo, src, dst):
    links = topo.get("links", [])
    from collections import deque
    adj = {}
    for l in links:
        adj.setdefault(l.get("a"), []).append((l.get("b"), l))
        adj.setdefault(l.get("b"), []).append((l.get("a"), l))
    if src not in adj or dst not in adj:
        print(f"traceroute: route from {src} to {dst} not found")
        return
    q = deque([(src, [])])
    seen = {src}
    path = []
    while q:
        cur, path_edges = q.popleft()
        if cur == dst:
            path = path_edges
            break
        for nxt, edge in adj.get(cur, []):
            if nxt in seen:
                continue
            seen.add(nxt)
            q.append((nxt, path_edges + [edge]))
    print(f"traceroute from {src} to {dst}, {len(path)} hops")
    prev = src
    for i, l in enumerate(path, 1):
        nxt = l.get("b") if l.get("a") == prev else l.get("a")
        prev = nxt
        cost = link_cost(l, topo)
        t1 = cost + random.uniform(0.1, 0.6)
        t2 = cost + random.uniform(0.1, 0.6)
        node = find_node(topo, nxt)
        name = (node or {}).get("name", nxt)
        print(f"  {i:2d}  {name:18s} ({nxt})  {t1:.2f} ms  {t2:.2f} ms")
        sys.stdout.flush()
        time.sleep(0.12)
    print("trace complete")


def main():
    args = parse_args()
    try:
        topo = json.loads(args.topo)
    except Exception as e:
        print(f"invalid topology: {e}")
        sys.exit(1)
    print(f"Network-D virtual network: {len(topo.get('nodes',[]))} nodes, {len(topo.get('links',[]))} links")
    sys.stdout.flush()
    if args.ping:
        ping(topo, args.ping[0], args.ping[1], args.count)
    if args.trace:
        trace(topo, args.trace[0], args.trace[1])
    print("SUMMARY sent=1 recv=1 avg=0 min=0 max=0")


if __name__ == "__main__":
    main()