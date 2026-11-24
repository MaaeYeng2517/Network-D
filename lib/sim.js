// Network simulation model (discrete-event).
// Devices: pc | switch | router | gateway | service
// Protocols: Ethernet (L2), ARP, IPv4, ICMP, TCP, UDP
// Pure JavaScript — no dependencies. Safe to run in browser or Node.

export const BROADCAST = "ff:ff:ff:ff:ff:ff";

function mac() {
  const b = [0x02];
  for (let i = 0; i < 5; i++) b.push(Math.floor(Math.random() * 256));
  return b.map((x) => x.toString(16).padStart(2, "0")).join(":");
}

function ipToNum(ip) {
  if (!ip) return 0;
  return ip.split(".").reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
}
function prefixMask(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}
function sameSubnet(ip, net, mask) {
  const m = ipToNum(mask);
  return (ipToNum(ip) & m) === (ipToNum(net) & m);
}

// Min binary-heap priority queue keyed by [time, seq].
class PQ {
  constructor() { this.q = []; }
  push(node) {
    this.q.push(node);
    this._up(this.q.length - 1);
  }
  pop() {
    const top = this.q[0];
    const last = this.q.pop();
    if (this.q.length) { this.q[0] = last; this._down(0); }
    return top;
  }
  empty() { return this.q.length === 0; }
  _cmp(a, b) {
    const A = this.q[a], B = this.q[b];
    if (A[0] !== B[0]) return A[0] - B[0];
    return A[1] - B[1];
  }
  _swap(a, b) { [this.q[a], this.q[b]] = [this.q[b], this.q[a]]; }
  _up(i) { while (i > 0) { const p = (i - 1) >> 1; if (this._cmp(p, i) <= 0) break; this._swap(i, p); i = p; } }
  _down(i) { const n = this.q.length; while (true) { let l = i; const le = 2 * i + 1, ri = 2 * i + 2; if (le < n && this._cmp(le, l) < 0) l = le; if (ri < n && this._cmp(ri, l) < 0) l = ri; if (l === i) break; this._swap(i, l); i = l; } }
}

export class Sim {
  constructor() {
    this.devices = new Map();
    this.links = new Map();
    this.time = 0;
    this.seq = 0;
    this.queue = new PQ();
    this.log = [];
    this.trace = [];
    this.nextLinkId = 0;
  }

  logEvent(kind, text, meta) {
    const entry = { t: this.time, kind, text, meta };
    this.log.push(entry);
    if (this.log.length > 1000) this.log.shift();
    return entry;
  }

  // ---------- devices ----------
  addDevice({ type, name }) {
    const id = `d${this.devices.size + 1}`;
    const dev = {
      id, type, name: name || type.toUpperCase(), mac: mac(),
      ifaces: new Map(), arp: new Map(), routes: [], cam: new Map(),
      pending: new Map(), stats: { tx: 0, rx: 0, drop: 0 },
    };
    this.devices.set(id, dev);
    this.logEvent("sys", `เพิ่ม ${dev.name} (${type}) ${id} mac=${dev.mac}`);
    return id;
  }

  addIface(dev, port, ip, mask) {
    const iface = { port, ip, mask, mac: dev.mac, adminUp: true };
    dev.ifaces.set(port, iface);
    return iface;
  }

  setIp(dev, port, ip, mask) {
    let iface = dev.ifaces.get(port);
    if (!iface) { iface = { port, ip, mask, mac: dev.mac, adminUp: true }; dev.ifaces.set(port, iface); }
    iface.ip = ip; iface.mask = mask;
    this.logEvent("sys", `${dev.name} ${port} = ${ip}/${mask}`);
  }

  firstFreePort(dev) {
    let n = 1;
    while (dev.ifaces.has(`eth${n}`)) n++;
    return `eth${n}`;
  }

  myIp(dev) {
    for (const iface of dev.ifaces.values()) if (iface.ip) return iface.ip;
    return null;
  }

  isOwnMac(dev, m) {
    for (const iface of dev.ifaces.values()) if (iface.mac === m) return true;
    return false;
  }

  peerOf(dev, port) {
    const iface = dev.ifaces.get(port);
    if (!iface || !iface.link) return null;
    const link = this.links.get(iface.link);
    if (!link) return null;
    const other = link.a === dev.id ? link.b : link.a;
    const pdev = this.devices.get(other);
    const pport = link.a === dev.id ? link.portB : link.portA;
    return { dev: pdev, port: pport, link };
  }

  // ---------- links ----------
  addLink(devA, portA, devB, portB) {
    const id = `l${this.nextLinkId++}`;
    const link = { id, a: devA.id, portA, b: devB.id, portB };
    this.links.set(id, link);
    devA.ifaces.get(portA).link = id;
    devB.ifaces.get(portB).link = id;
    this.logEvent("sys", `ลิงก์ ${devA.name}[${portA}] ↔ ${devB.name}[${portB}]`);
    return id;
  }

  linkOf(dev, port) {
    const iface = dev.ifaces.get(port);
    return iface && iface.link ? this.links.get(iface.link) : null;
  }

  // ---------- event queue ----------
  push(delay, type, payload) {
    const time = this.time + delay;
    this.seq++;
    this.queue.push([time, this.seq, type, payload]);
  }

  // ---------- frame delivery ----------
  sendFrame(frame, outPort, delay = 1) {
    const dev = frame._dev;
    const iface = dev.ifaces.get(outPort);
    if (!iface || !iface.link || !iface.adminUp) {
      dev.stats.drop++;
      this.logEvent("drop", `${dev.name} drop out ${outPort} (no link)`, frame);
      return;
    }
    const peer = this.peerOf(dev, outPort);
    if (!peer) { dev.stats.drop++; return; }
    const pframe = { ...frame, _dev: peer.dev, inPort: peer.port, link: peer.link.id, t: this.time + delay };
    this.push(delay, "frame", pframe);
  }

  deliverFrame(frame) {
    const dev = frame._dev;
    const inPort = frame.inPort;
    const iface = dev.ifaces.get(inPort);
    if (!iface || !iface.adminUp) return;
    dev.stats.rx++;
    frame.inPort = inPort;

    if (dev.type === "switch") this._switchFrame(dev, frame);
    else if (dev.type === "router" || dev.type === "gateway") this._routerFrame(dev, frame);
    else this._hostFrame(dev, frame);
  }

  _record(dev, linkId, summary) {
    this.trace.push({ t: this.time, link: linkId, from: dev.id, fromName: dev.name, summary });
    if (this.trace.length > 500) this.trace.shift();
  }

  _flood(dev, frame, except) {
    for (const [port] of dev.ifaces) {
      if (port === except) continue;
      const iface = dev.ifaces.get(port);
      if (!iface.adminUp) continue;
      const link = this.linkOf(dev, port);
      this._record(dev, link ? link.id : null, `flood ${frame.dstMac} -> ${port}`);
      this.sendFrame({ ...frame }, port);
    }
  }

  // ---------- switch (L2) ----------
  _switchFrame(dev, frame) {
    dev.cam.set(frame.srcMac, frame.inPort);
    this.logEvent("learn", `${dev.name} CAM ${frame.srcMac} -> ${frame.inPort}`);
    const dst = frame.dstMac;
    if (dst === BROADCAST) {
      this._flood(dev, frame, frame.inPort);
      return;
    }
    const out = dev.cam.get(dst);
    if (out && out !== frame.inPort) {
      const iface = dev.ifaces.get(out);
      if (iface && iface.adminUp) {
        const link = this.linkOf(dev, out);
        this._record(dev, link ? link.id : null, `switch ${dst} -> ${out}`);
        this.logEvent("fwd", `${dev.name} switch ${dst} -> ${out}`);
        this.sendFrame(frame, out);
        return;
      }
    }
    this.logEvent("flood", `${dev.name} flood unknown ${dst}`);
    this._flood(dev, frame, frame.inPort);
  }

  // ---------- host / service ----------
  _hostFrame(dev, frame) {
    if (frame.dstMac !== BROADCAST && !this.isOwnMac(dev, frame.dstMac)) {
      dev.stats.drop++;
      this.logEvent("drop", `${dev.name} drop frame not for me (${frame.dstMac})`, frame);
      return;
    }
    if (frame.ethType === "ARP") this._arpReceive(dev, frame.payload, frame.inPort);
    else if (frame.ethType === "IPv4") this._ipReceive(dev, frame.payload);
  }

  // ---------- router / gateway (L3) ----------
  _routerFrame(dev, frame) {
    if (frame.dstMac !== BROADCAST && !this.isOwnMac(dev, frame.dstMac)) {
      dev.stats.drop++;
      this.logEvent("drop", `${dev.name} drop frame not for me`, frame);
      return;
    }
    if (frame.ethType === "ARP") { this._arpReceive(dev, frame.payload, frame.inPort); return; }
    if (frame.ethType !== "IPv4") return;
    const pkt = frame.payload;
    pkt.ttl--;
    if (pkt.ttl <= 0) { dev.stats.drop++; this.logEvent("drop", `${dev.name} TTL expired ${pkt.srcIp}->${pkt.dstIp}`, pkt); return; }
    // local delivery
    for (const iface of dev.ifaces.values()) {
      if (iface.ip && iface.ip === pkt.dstIp) {
        this.logEvent("local", `${dev.name} packet for local IP ${pkt.dstIp}`);
        this._ipReceive(dev, pkt);
        return;
      }
    }
    const route = this._longestPrefixMatch(dev, pkt.dstIp);
    if (!route) { dev.stats.drop++; this.logEvent("drop", `${dev.name} no route to ${pkt.dstIp}`, pkt); return; }
    const egress = dev.ifaces.get(route.iface);
    if (!egress || !egress.adminUp) { dev.stats.drop++; this.logEvent("drop", `${dev.name} egress ${route.iface} down`, pkt); return; }
    const nextHop = route.gw || pkt.dstIp;
    let dstMac = dev.arp.get(nextHop);
    if (!dstMac) {
      if (!dev.pending.has(nextHop)) dev.pending.set(nextHop, []);
      dev.pending.get(nextHop).push({ pkt, iface: route.iface });
      this.logEvent("arp", `${dev.name} ARP who has ${nextHop}? (for ${pkt.dstIp})`);
      this._arpRequest(dev, route.iface, nextHop);
      return;
    }
    this.logEvent("route", `${dev.name} ${pkt.srcIp}->${pkt.dstIp} via ${route.iface} nh ${nextHop} (${dstMac})`);
    this.sendFrame({ _dev: dev, srcMac: egress.mac, dstMac, ethType: "IPv4", payload: pkt }, route.iface);
  }

  _longestPrefixMatch(dev, dstIp) {
    const num = ipToNum(dstIp);
    let best = null;
    for (const r of dev.routes) {
      if ((num & prefixMask(r.prefix)) === (ipToNum(r.net) & prefixMask(r.prefix))) {
        if (!best || r.prefix > best.prefix) best = r;
      }
    }
    return best;
  }

  // ---------- IP ----------
  _ipReceive(dev, pkt) {
    if (pkt.proto === "ICMP") {
      const local = [...dev.ifaces.values()].some((i) => i.ip && i.ip === pkt.dstIp);
      if (local) {
        if (pkt.payload.type === "echo-request") {
          this.logEvent("icmp", `${dev.name} ICMP echo reply <- ${pkt.srcIp}`);
          this._icmpReply(dev, pkt);
        }
      } else if (dev.type !== "router" && dev.type !== "gateway") {
        dev.stats.drop++;
        this.logEvent("drop", `${dev.name} drop ICMP not for me`, pkt);
      }
    } else if (pkt.proto === "TCP" || pkt.proto === "UDP") {
      if (this.myIp(dev) === pkt.dstIp) {
        this.logEvent("svc", `${dev.name} ${pkt.proto} reply <- ${pkt.srcIp}:${pkt.payload.port}`);
      }
    }
  }

  _icmpReply(dev, req) {
    const reply = { srcIp: req.dstIp, dstIp: req.srcIp, ttl: 64, proto: "ICMP", payload: { type: "echo-reply", id: req.payload.id, seq: req.payload.seq } };
    const route = this._longestPrefixMatch(dev, reply.dstIp);
    if (!route) { dev.stats.drop++; return; }
    const egress = dev.ifaces.get(route.iface);
    const nextHop = route.gw || reply.dstIp;
    let dstMac = dev.arp.get(nextHop);
    if (!dstMac) {
      if (!dev.pending.has(nextHop)) dev.pending.set(nextHop, []);
      dev.pending.get(nextHop).push({ pkt: reply, iface: route.iface });
      this._arpRequest(dev, route.iface, nextHop);
      return;
    }
    this.logEvent("icmp", `${dev.name} echo reply ${reply.srcIp}->${reply.dstIp} via ${route.iface}`);
    this.sendFrame({ _dev: dev, srcMac: egress.mac, dstMac, ethType: "IPv4", payload: reply }, route.iface);
  }

  // ---------- ARP ----------
  _arpRequest(dev, outPort, targetIp) {
    const pkt = { op: "request", senderIp: this.myIp(dev) || "0.0.0.0", senderMac: dev.mac, targetIp, targetMac: "00:00:00:00:00:00" };
    this.logEvent("arp", `${dev.name} ARP who has ${targetIp}? tell ${pkt.senderIp}`);
    this.sendFrame({ _dev: dev, srcMac: dev.mac, dstMac: BROADCAST, ethType: "ARP", payload: pkt }, outPort);
  }

  _arpReceive(dev, arp, inPort) {
    if (arp.op === "request") {
      for (const iface of dev.ifaces.values()) {
        if (iface.ip && iface.ip === arp.targetIp) {
          this.logEvent("arp", `${dev.name} ARP reply ${arp.targetIp} is at ${dev.mac} <- ${arp.senderIp}`);
          this.sendFrame({
            _dev: dev, srcMac: dev.mac, dstMac: arp.senderMac, ethType: "ARP",
            payload: { op: "reply", senderIp: arp.targetIp, senderMac: dev.mac, targetIp: arp.senderIp, targetMac: arp.senderMac },
          }, inPort);
          return;
        }
      }
    } else if (arp.op === "reply") {
      dev.arp.set(arp.senderIp, arp.senderMac);
      this.logEvent("arp", `${dev.name} learned ${arp.senderIp} = ${arp.senderMac}`);
      const q = dev.pending.get(arp.senderIp);
      if (q) {
        dev.pending.delete(arp.senderIp);
        for (const item of q) {
          const route = this._longestPrefixMatch(dev, item.pkt.dstIp);
          const eg = dev.ifaces.get(route.iface);
          this.logEvent("arp", `${dev.name} send queued ${item.pkt.srcIp}->${item.pkt.dstIp} via ${route.iface}`);
          this.sendFrame({ srcMac: eg.mac, dstMac: arp.senderMac, ethType: "IPv4", payload: item.pkt }, route.iface);
        }
      }
    }
  }

  // ---------- ping ----------
  ping(srcId, dstIp) {
    const src = this.devices.get(srcId);
    if (!src) return { error: "device not found" };
    const srcIface = [...src.ifaces.values()].find((i) => i.ip);
    if (!srcIface) return { error: `${src.name} has no IP` };
    const pkt = { srcIp: srcIface.ip, dstIp, ttl: 64, proto: "ICMP", payload: { type: "echo-request", id: 1, seq: Date.now() } };
    this.logEvent("ping", `${src.name} ping ${dstIp} from ${srcIface.ip}`);
    this._sendIp(src, pkt);
    return { ok: true, src: srcIface.ip, dst: dstIp };
  }

  _sendIp(dev, pkt) {
    // direct if same subnet as a local interface
    let direct = null;
    for (const iface of dev.ifaces.values()) {
      if (iface.ip && iface.mask && sameSubnet(pkt.dstIp, iface.ip, iface.mask)) { direct = iface; break; }
    }
    let route, egress, nextHop;
    if (direct) {
      route = { iface: direct.port, gw: null };
      egress = direct;
      nextHop = pkt.dstIp;
    } else {
      route = this._longestPrefixMatch(dev, pkt.dstIp);
      if (!route) { dev.stats.drop++; this.logEvent("drop", `${dev.name} no route to ${pkt.dstIp}`, pkt); return; }
      egress = dev.ifaces.get(route.iface);
      if (!egress || !egress.adminUp) { dev.stats.drop++; this.logEvent("drop", `${dev.name} egress ${route.iface} down`, pkt); return; }
      nextHop = route.gw || pkt.dstIp;
    }
    let dstMac = dev.arp.get(nextHop);
    if (!dstMac) {
      if (!dev.pending.has(nextHop)) dev.pending.set(nextHop, []);
      dev.pending.get(nextHop).push({ pkt, iface: route.iface });
      this.logEvent("arp", `${dev.name} ARP who has ${nextHop}? (for ${pkt.dstIp})`);
      this._arpRequest(dev, route.iface, nextHop);
      return;
    }
    this.logEvent("send", `${dev.name} send ${pkt.srcIp}->${pkt.dstIp} via ${route.iface} nh ${nextHop}`);
    this.sendFrame({ _dev: dev, srcMac: egress.mac, dstMac, ethType: "IPv4", payload: pkt }, route.iface);
  }

  addRoute(dev, net, prefix, gw, iface) {
    dev.routes.push({ net, prefix: Number(prefix), gw: gw || null, iface });
    this.logEvent("sys", `${dev.name} route + ${net}/${prefix} gw=${gw || "-"} if=${iface}`);
  }

  delRoute(dev, net, prefix) {
    const before = dev.routes.length;
    dev.routes = dev.routes.filter((r) => !(r.net === net && r.prefix === Number(prefix)));
    this.logEvent("sys", `${dev.name} route - ${net}/${prefix} (${before} -> ${dev.routes.length})`);
  }

  // ---------- run ----------
  step() {
    if (this.queue.empty()) return null;
    const node = this.queue.pop();
    const [time, seq, type, payload] = node;
    this.time = time;
    if (type === "frame") {
      this.deliverFrame(payload);
    }
    return { time, type, payload };
  }

  run(maxEvents = 10000) {
    let n = 0;
    while (!this.queue.empty() && n++ < maxEvents) this.step();
    return n;
  }

  reset() {
    this.devices.clear();
    this.links.clear();
    this.time = 0;
    this.seq = 0;
    this.queue = new PQ();
    this.log = [];
    this.trace = [];
    this.nextLinkId = 0;
  }

  getSnapshot() {
    return {
      time: this.time,
      devices: [...this.devices.values()].map((d) => ({
        id: d.id, type: d.type, name: d.name, mac: d.mac,
        ifaces: [...d.ifaces.entries()].map(([p, i]) => ({ port: p, ip: i.ip, mask: i.mask, mac: i.mac, link: i.link, adminUp: i.adminUp })),
        arp: [...d.arp.entries()],
        routes: d.routes,
        cam: [...d.cam.entries()],
        stats: d.stats,
      })),
      links: [...this.links.values()],
      log: this.log.slice(-200),
      trace: this.trace.slice(-100),
    };
  }
}
