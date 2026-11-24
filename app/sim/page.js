"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sim } from "@/lib/sim";
import { DEVICE_MAP } from "@/lib/topology";

const TYPES = ["pc", "switch", "router", "gateway", "service"];
const W = 1080, H = 560, NW = 150, NH = 90;

function clsOf(kind) {
  switch (kind) {
    case "ok": return "ok";
    case "err": return "err";
    case "drop": return "err";
    case "learn": return "muted";
    case "flood": return "muted";
    case "fwd": return "muted";
    case "route": return "ok";
    case "arp": return "muted";
    case "icmp": return "ok";
    case "svc": return "ok";
    case "ping": return "ok";
    case "sys": return "muted";
    case "local": return "muted";
    default: return "muted";
  }
}

export default function SimPage() {
  const simRef = useRef(new Sim());
  const consoleRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [pos, setPos] = useState({});
  const [consoleLines, setConsoleLines] = useState([{ text: "network-d sim > พิมพ์ help ดูคำสั่ง", cls: "sys" }]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [hops, setHops] = useState([]);
  const [packet, setPacket] = useState(null);
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState([]);
  let gridRef = useRef({ col: 0, row: 0 });
  let animRef = useRef(null);

  function pushLine(text, cls) {
    setConsoleLines((p) => {
      const next = p.concat({ text, cls });
      return next.length > 1500 ? next.slice(next.length - 1500) : next;
    });
  }

  function cmdOut(lines) {
    lines.forEach((l) => pushLine(l, l.cls || "muted"));
  }

  function resolve(dev) {
    const sim = simRef.current;
    const d = sim.devices.get(dev);
    if (d) return d;
    return [...sim.devices.values()].find((x) => x.name.toLowerCase() === String(dev).toLowerCase());
  }

  function renderSnapshot() {
    const sim = simRef.current;
    const s = sim.getSnapshot();
    setDevices(s.devices);
    setLinks(s.links);
    setLog(s.log.slice(-120));
    const np = { ...pos };
    let changed = false;
    s.devices.forEach((d) => {
      if (!np[d.id]) {
        const col = gridRef.current.col;
        const row = gridRef.current.row;
        np[d.id] = { x: 60 + col * 320, y: 90 + row * 170 };
        gridRef.current.col++;
        if (gridRef.current.col > 2) { gridRef.current.col = 0; gridRef.current.row++; }
        changed = true;
      }
    });
    if (changed) setPos(np);
  }

  useEffect(() => {
    renderSnapshot();
    const c = consoleRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, []);

  function exec(raw) {
    const sim = simRef.current;
    const out = [];
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0] ? parts[0].toLowerCase() : "";
    const args = parts.slice(1);

    if (!cmd) return out;
    if (cmd === "help") {
      out.push({ text: "คำสั่ง: add | link | ip | route | show | ping | run | step | reset | clear | demo | help", cls: "sys" });
      out.push({ text: "  add <type> [ชื่อ]        pc/switch/router/gateway/service", cls: "muted" });
      out.push({ text: "  link <a> [pA] <b> [pB]   ต่อลิงก์ (พอร์ตอัตโนมัติถ้าไม่ระบุ)", cls: "muted" });
      out.push({ text: "  ip <dev> <พอร์ต> <ip> <mask>", cls: "muted" });
      out.push({ text: "  route <dev> add <net> <prefix> [gw] <iface>", cls: "muted" });
      out.push({ text: "  route <dev> del <net> <prefix>", cls: "muted" });
      out.push({ text: "  show dev|mac|route|arp|links|stats", cls: "muted" });
      out.push({ text: "  ping <src> <dst-ip>      ส่ง ping ผ่านเครือข่ายจำลอง", cls: "muted" });
      out.push({ text: "  demo                     สร้างโครงข่ายตัวอย่างแล้ว ping", cls: "muted" });
      out.push({ text: "  reset | clear", cls: "muted" });
      return out;
    }

    try {
      if (cmd === "add") {
        const type = args[0];
        if (!TYPES.includes(type)) throw new Error("type ต้องเป็น " + TYPES.join(", "));
        const name = args[1] || "";
        const id = sim.addDevice({ type, name });
        const dev = sim.devices.get(id);
        sim.addIface(dev, "eth1");
        out.push({ text: `เพิ่ม ${dev.name} (${type}) id=${id} eth1 mac=${dev.mac}`, cls: "ok" });
        renderSnapshot();
      } else if (cmd === "link") {
        const a = resolve(args[0]);
        const b = resolve(args[args.length - 1]);
        if (!a || !b) throw new Error("ระบุอุปกรณ์ไม่ถูกต้อง: link <a> [พอร์ต] <b> [พอร์ต]");
        const pA = args[args.indexOf(a.id) + 1] || sim.firstFreePort(a);
        const pB = args[args.length - 1] === b.id ? (args[args.length - 2] || sim.firstFreePort(b)) : sim.firstFreePort(b);
        if (!a.ifaces.has(pA)) sim.addIface(a, pA);
        if (!b.ifaces.has(pB)) sim.addIface(b, pB);
        sim.addLink(a, pA, b, pB);
        out.push({ text: `ลิงก์ ${a.name}[${pA}] ↔ ${b.name}[${pB}]`, cls: "ok" });
        renderSnapshot();
      } else if (cmd === "ip") {
        const dev = resolve(args[0]);
        if (!dev) throw new Error("ไม่พบอุปกรณ์");
        const port = args[1], ip = args[2], mask = args[3];
        if (!port || !ip || !mask) throw new Error("usage: ip <dev> <พอร์ต> <ip> <mask>");
        sim.setIp(dev, port, ip, mask);
        out.push({ text: `${dev.name} ${port} = ${ip}/${mask}`, cls: "ok" });
      } else if (cmd === "route") {
        const dev = resolve(args[0]);
        if (!dev) throw new Error("ไม่พบอุปกรณ์");
        const sub = args[1];
        if (sub === "add") {
          const net = args[2], prefix = args[3], gw = args[4], iface = args[5];
          if (!net || !prefix || !iface) throw new Error("usage: route <dev> add <net> <prefix> [gw] <iface>");
          sim.addRoute(dev, net, Number(prefix), gw === "-" ? null : gw, iface);
          out.push({ text: `route + ${net}/${prefix} gw=${gw || "-"} if=${iface}`, cls: "ok" });
        } else if (sub === "del") {
          sim.delRoute(dev, args[2], Number(args[3]));
          out.push({ text: `route - ${args[2]}/${args[3]}`, cls: "ok" });
        } else {
          throw new Error("usage: route <dev> add|del ...");
        }
      } else if (cmd === "show") {
        const what = args[0] || "dev";
        if (what === "dev" || what === "devices") {
          sim.devices.forEach((d) => {
            const ips = [...d.ifaces.values()].map((i) => i.ip).filter(Boolean).join(", ") || "-";
            out.push({ text: `${d.id} ${d.type} ${d.name} mac=${d.mac} ip=${ips}`, cls: "muted" });
          });
        } else if (what === "mac") {
          const d = sim.devices.get(args[1]);
          if (!d || d.type !== "switch") throw new Error("ระบุสวิตช์: show mac <id>");
          out.push({ text: `CAM table ${d.name}:`, cls: "sys" });
          if (d.cam.size === 0) out.push({ text: "  (ว่าง)", cls: "muted" });
          d.cam.forEach((p, m) => out.push({ text: `  ${m} -> ${p}`, cls: "muted" }));
        } else if (what === "route") {
          const d = sim.devices.get(args[1]);
          if (!d) throw new Error("ไม่พบอุปกรณ์");
          out.push({ text: `Routing table ${d.name}:`, cls: "sys" });
          if (d.routes.length === 0) out.push({ text: "  (ว่าง)", cls: "muted" });
          d.routes.forEach((r) => out.push({ text: `  ${r.net}/${r.prefix} gw=${r.gw || "-"} if=${r.iface}`, cls: "muted" }));
        } else if (what === "arp") {
          const d = sim.devices.get(args[1]);
          if (!d) throw new Error("ไม่พบอุปกรณ์");
          out.push({ text: `ARP table ${d.name}:`, cls: "sys" });
          if (d.arp.size === 0) out.push({ text: "  (ว่าง)", cls: "muted" });
          d.arp.forEach((m, ip) => out.push({ text: `  ${ip} = ${m}`, cls: "muted" }));
        } else if (what === "links") {
          sim.links.forEach((l) => {
            const da = sim.devices.get(l.a); const db = sim.devices.get(l.b);
            out.push({ text: `${da.name}[${l.portA}] ↔ ${db.name}[${l.portB}]`, cls: "muted" });
          });
        } else if (what === "stats") {
          sim.devices.forEach((d) => out.push({ text: `${d.name} tx=${d.stats.tx} rx=${d.stats.rx} drop=${d.stats.drop}`, cls: "muted" }));
        } else {
          throw new Error("show dev|mac|route|arp|links|stats");
        }
      } else if (cmd === "ping") {
        const src = resolve(args[0]);
        if (!src) throw new Error("ไม่พบต้นทาง");
        const dstIp = args[1];
        if (!dstIp) throw new Error("usage: ping <src> <dst-ip>");
        const res = sim.ping(src.id, dstIp);
        if (res.error) out.push({ text: res.error, cls: "err" });
        else {
          out.push({ text: `ping ${res.dst} from ${src.name}(${res.src})`, cls: "ok" });
          setRunning(true);
          setIdx(0);
          sim.run();
          const trace = sim.getSnapshot().trace.filter((t) => t.link);
          setHops(trace);
          out.push({ text: `จำลองเสร็จ ${trace.length} ฮอป`, cls: "ok" });
          setRunning(false);
          animateNext();
        }
      } else if (cmd === "run") {
        sim.run();
        out.push({ text: "รันจำลองจนเสร็จ", cls: "ok" });
        renderSnapshot();
      } else if (cmd === "step") {
        const r = sim.step();
        out.push({ text: r ? `ท = ${r.time} ประเภท ${r.type}` : "คิวว่าง", cls: "ok" });
        renderSnapshot();
      } else if (cmd === "reset") {
        sim.reset();
        gridRef.current = { col: 0, row: 0 };
        out.push({ text: "รีเซตเครือข่ายจำลอง", cls: "sys" });
        setDevices([]); setLinks([]); setPos({}); setLog([]); setHops([]); setPacket(null); setIdx(0);
        renderSnapshot();
      } else if (cmd === "clear") {
        setConsoleLines([]);
        out.push({ text: "ล้างคอนโซลแล้ว", cls: "sys" });
      } else if (cmd === "demo") {
        demo();
        out.push({ text: "สร้างโครงข่ายตัวอย่างแล้ว (ใช้ ping pc1 10.0.0.10)", cls: "ok" });
      } else {
        out.push({ text: `คำสั่งไม่รู้จัก: ${cmd} (พิมพ์ help)`, cls: "err" });
      }
    } catch (e) {
      out.push({ text: e.message, cls: "err" });
    }
    return out;
  }

  function demo() {
    const sim = simRef.current;
    sim.reset();
    gridRef.current = { col: 0, row: 0 };
    const add = (type, name) => { const id = sim.addDevice({ type, name }); const d = sim.devices.get(id); sim.addIface(d, "eth1"); return d; };
    const sw1 = add("switch", "SW1");
    const sw2 = add("switch", "SW2");
    const r = add("router", "R1");
    const gw = add("gateway", "GW");
    const srv = add("service", "SRV");
    const p1 = add("pc", "PC1");
    const p2 = add("pc", "PC2");
    sim.setIp(p1, "eth1", "192.168.1.10", "255.255.255.0");
    sim.setIp(p2, "eth1", "192.168.1.20", "255.255.255.0");
    sim.setIp(sw1, "eth1", "192.168.1.2", "255.255.255.0");
    sim.setIp(r, "eth1", "192.168.1.1", "255.255.255.0");
    sim.setIp(r, "eth2", "10.0.0.1", "255.255.255.0");
    sim.setIp(sw2, "eth1", "10.0.0.3", "255.255.255.0");
    sim.setIp(gw, "eth1", "10.0.0.2", "255.255.255.0");
    sim.setIp(gw, "eth2", "10.0.0.4", "255.255.255.0");
    sim.setIp(srv, "eth1", "10.0.0.10", "255.255.255.0");
    sim.addRoute(p1, "0.0.0.0", 0, "192.168.1.1", "eth1");
    sim.addRoute(p2, "0.0.0.0", 0, "192.168.1.1", "eth1");
    sim.addRoute(r, "10.0.0.0", 24, null, "eth2");
    sim.addLink(p1, "eth1", sw1, "eth1");
    sim.addLink(p2, "eth1", sw1, "eth2");
    sim.addLink(sw1, "eth3", r, "eth1");
    sim.addLink(r, "eth2", sw2, "eth1");
    sim.addLink(sw2, "eth2", gw, "eth1");
    sim.addLink(sw2, "eth3", srv, "eth1");
    renderSnapshot();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    pushLine("> " + v, "sys");
    setInput("");
    const out = exec(v);
    cmdOut(out);
  }

  function center(id) {
    const p = pos[id];
    if (!p) return { x: W / 2, y: H / 2 };
    return { x: p.x + NW / 2, y: p.y + NH / 2 };
  }

  function animateNext() {
    if (animRef.current) {
      if (typeof animRef.current === "number") clearTimeout(animRef.current);
      else cancelAnimationFrame(animRef.current);
    }
    if (idx >= hops.length) { setPacket(null); setIdx(0); return; }
    const hop = hops[idx];
    const from = center(hop.from);
    const to = center(hop.to);
    let start = null;
    const duration = 420;
    const tick = (ts) => {
      if (!start) start = ts;
      const prog = Math.min(1, (ts - start) / duration);
      setPacket({ x: from.x + (to.x - from.x) * prog, y: from.y + (to.y - from.y) * prog });
      if (prog < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIdx(idx + 1);
        animRef.current = setTimeout(() => animateNext(), 160);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => {
      if (animRef.current) {
        if (typeof animRef.current === "number") clearTimeout(animRef.current);
        else cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  const selectedDev = selected ? simRef.current.devices.get(selected) : null;

  return (
    <div className="course pt-wide">
      <div className="pt-toolbar">
        <h2 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>เครือข่ายจำลอง — Switch / Router / Gateway / Service</h2>
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>
          อุปกรณ์ = {devices.length} · ลิงก์ = {links.length} · เวลา = {simRef.current.time}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn primary" onClick={() => { setRunning(true); simRef.current.run(); setRunning(false); renderSnapshot(); animateNext(); }} disabled={running}>▶ รันทั้งหมด</button>
          <button className="btn" onClick={() => { const r = simRef.current.step(); renderSnapshot(); pushLine(`ท=${r?.time} ${r?.type}`, "sys"); }}>⏷ ถัดไป</button>
          <button className="btn danger" onClick={() => { simRef.current.reset(); gridRef.current = { col: 0, row: 0 }; setDevices([]); setLinks([]); setPos({}); setLog([]); setHops([]); setPacket(null); setIdx(0); renderSnapshot(); pushLine("รีเซตแล้ว", "sys"); }}>รีเซต</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 340px", gap: 16, alignItems: "start" }}>
        <div className="card" style={{ minHeight: H + 120 }}>
          <div className="hd">CLI คอนโซล</div>
          <div className="console" ref={consoleRef}>
            {consoleLines.map((l, i) => (
              <div key={i} className={"l " + clsOf(l.cls)}>{l.text}</div>
            ))}
            {consoleLines.length === 0 && <div className="sys">(ว่าง)</div>}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px 16px 0" }}>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำสั่ง (help)…"
              style={{ flex: 1, padding: "8px 10px", background: "#0b0f14", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 7, fontFamily: "var(--mono)", fontSize: 13 }}
            />
            <button className="btn primary" style={{ padding: "8px 14px", fontSize: 13 }}>Enter</button>
          </form>
          <div style={{ padding: "10px 16px 16px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TYPES.map((t) => (
              <button key={t} className="btn" style={{ padding: "6px 10px", fontSize: 12, flex: 1, minWidth: 0 }} onClick={() => { pushLine(`> add ${t}`, "sys"); cmdOut(exec(`add ${t} ${t.toUpperCase()}1`)); }}>
                + {DEVICE_MAP[t].name}
              </button>
            ))}
            <button className="btn primary" style={{ padding: "6px 10px", fontSize: 12, flex: 1, minWidth: 0 }} onClick={() => { pushLine("> demo", "sys"); cmdOut(exec("demo")); }}>เดโมตัวอย่าง</button>
            <button className="btn" style={{ padding: "6px 10px", fontSize: 12, flex: 1, minWidth: 0 }} onClick={() => { setInput("ping pc1 10.0.0.10"); }}>ping ตัวอย่าง</button>
          </div>
        </div>

        <div className="card" style={{ minHeight: H + 120, position: "relative", overflow: "hidden" }}>
          <div className="hd" style={{ padding: 8 }}>ผังเครือข่ายจำลอง</div>
          <div style={{ position: "relative", width: W, height: H, background: "#0b0f14", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {links.map((l) => {
              const a = center(l.a);
              const b = center(l.b);
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy);
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              return (
                <div
                  key={l.id}
                  style={{
                    position: "absolute", left: a.x, top: a.y, width: dist, height: 2,
                    transform: `rotate(${angle}deg)`, transformOrigin: "0% 50%",
                    borderTop: "2px solid #3ea6ff", opacity: 0.6, pointerEvents: "none",
                  }}
                />
              );
            })}
            {devices.map((d) => {
              const p = pos[d.id];
              if (!p) return null;
              const isSel = selected === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  style={{
                    position: "absolute", left: p.x, top: p.y, width: NW, height: NH,
                    background: isSel ? "#1a2531" : "var(--panel)",
                    border: `1px solid ${isSel ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", padding: 6, boxSizing: "border-box",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "#0b0f14", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, flex: "none" }}>
                    <DeviceIcon type={d.type} size={28} style={{ color: "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", textAlign: "center", lineHeight: 1.25, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                  {d.ifaces.some((i) => i.ip) && (
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "#9fe0ff", marginTop: 2, flex: "none" }}>{d.ifaces.find((i) => i.ip).ip}</div>
                  )}
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1, flex: "none" }}>{d.type}</div>
                </div>
              );
            })}
            {packet && (
              <div
                style={{
                  position: "absolute", left: packet.x - 5, top: packet.y - 5, width: 10, height: 10,
                  borderRadius: "50%", background: "#f08a5d", boxShadow: "0 0 8px #f08a5d",
                  pointerEvents: "none", zIndex: 20,
                }}
              />
            )}
          </div>
        </div>

        <div className="card" style={{ minHeight: H + 120 }}>
          <div className="hd">รายละเอียด</div>
          <div className="bd" style={{ padding: 10 }}>
            {selectedDev ? (
              <>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedDev.name} ({selectedDev.type})</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, fontFamily: "var(--mono)" }}>{selectedDev.id} · mac {selectedDev.mac}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>อินเทอร์เฟซ:</div>
                {selectedDev.ifaces.length === 0 ? (
                  <div style={{ fontSize: 12, color: "var(--muted)" }}> (ยังไม่มีพอร์ต — ใช้ link เพื่อสร้างพอร์ต)</div>
                ) : (
                  <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", color: "var(--muted)" }}>พอร์ต</th>
                        <th style={{ textAlign: "left", color: "var(--muted)" }}>IP</th>
                        <th style={{ textAlign: "left", color: "var(--muted)" }}>ลิงก์</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDev.ifaces.map((i) => (
                        <tr key={i.port} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "3px 0", color: "var(--text)", fontFamily: "var(--mono)" }}>{i.port}</td>
                          <td style={{ padding: "3px 0", color: "#cdd7e2", fontFamily: "var(--mono)" }}>{i.ip || "-"}/{i.mask || "-"}</td>
                          <td style={{ padding: "3px 0", color: "var(--accent)", fontSize: 11 }}>{i.link ? "เชื่อมอยู่" : "ว่าง"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {selectedDev.arp.size > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>ARP:</div>
                    {selectedDev.arp.map(([ip, m]) => (
                      <div key={ip} style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--mono)", marginBottom: 2 }}>{ip} = {m}</div>
                    ))}
                  </>
                )}
                {selectedDev.routes.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>เส้นทาง:</div>
                    {selectedDev.routes.map((r) => (
                      <div key={r.net + r.prefix} style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--mono)", marginBottom: 2 }}>{r.net}/{r.prefix} gw={r.gw || "-"} if={r.iface}</div>
                    ))}
                  </>
                )}
                <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 11 }}>คลิกโหนดในผังเพื่อดูรายละเอียด</div>
              </>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", paddingTop: 30 }}>เลือกอุปกรณ์ในผัง</div>
            )}
          </div>
          <div className="hd" style={{ borderTop: "1px solid var(--border)", padding: 8 }}>เหตุการณ์ล่าสุด</div>
          <div className="bd" style={{ padding: 10, maxHeight: 220, overflowY: "auto", fontFamily: "var(--mono)", fontSize: 11 }}>
            {log.map((e) => (
              <div key={e.t + "-" + e.kind} style={{ marginBottom: 3, color: "#cdd7e2" }}>
                {e.t} <span style={{ color: clsOf(e.kind) === "ok" ? "#3fb950" : clsOf(e.kind) === "err" ? "#f85149" : "var(--muted)" }}>{`[${e.kind}]`}</span> {e.text}
              </div>
            ))}
            {log.length === 0 && <div style={{ color: "var(--muted)" }}> (ยังไม่มีเหตุการณ์)</div>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 12, fontFamily: "var(--mono)" }}>
        หมายเหตุ: Switch เรียนรู้ MAC และส่งต่อเฉพาะพอร์ตที่ถูก / Router กรองเส้นทางแบบ longest-prefix-match พร้อม ARP / Gateway เป็นเราเตอร์ที่มีเส้นทางเริ่มต้น / Service ตอบสนองบริการ เช่น ping echo
      </div>
    </div>
  );
}
