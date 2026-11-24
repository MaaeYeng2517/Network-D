"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DEVICES, CABLES, DEVICE_MAP, CABLE_MAP, CONNECTORS, CONNECTOR_MAP } from "@/lib/topology";
import { EXAMPLES, LEVEL_LABEL } from "@/lib/topology-examples";
import { DEVICE_IMAGES, CABLE_IMAGES, CONNECTOR_IMAGES } from "@/lib/topology-images";
import { labsForDevice } from "@/lib/topology-labs";
import Photo from "@/components/Photo";
import DeviceIcon from "@/components/DeviceIcon";

const NODE_W = 92;
const NODE_H = 100;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function maskToPrefix(mask) {
  const octets = String(mask || "").split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return "";
  let bits = 0;
  let seenZero = false;
  for (const o of octets) {
    for (let i = 7; i >= 0; i--) {
      const on = (o >> i) & 1;
      if (on) {
        if (seenZero) return "";
        bits++;
      } else {
        seenZero = true;
      }
    }
  }
  return "/" + bits;
}

function isIPv4(s) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(String(s || "")) &&
    String(s).split(".").every((o) => Number(o) <= 255);
}

function networkOf(ip, mask) {
  if (!isIPv4(ip) || !isIPv4(mask)) return "";
  const a = String(ip).split(".").map(Number);
  const m = String(mask).split(".").map(Number);
  const n = a.map((o, i) => (o & m[i]) & 255);
  return n.join(".");
}

function broadcastOf(ip, mask) {
  if (!isIPv4(ip) || !isIPv4(mask)) return "";
  const a = String(ip).split(".").map(Number);
  const m = String(mask).split(".").map(Number);
  const b = a.map((o, i) => (o | (~m[i] & 255)) & 255);
  return b.join(".");
}

function subnetCalc(ip, mask) {
  if (!isIPv4(ip) || !isIPv4(mask)) return null;
  const net = networkOf(ip, mask);
  const bcast = broadcastOf(ip, mask);
  const prefix = maskToPrefix(mask);
  const netArr = net.split(".").map(Number);
  const bcastArr = bcast.split(".").map(Number);
  const first = [...netArr];
  first[3] += 1;
  const last = [...bcastArr];
  last[3] -= 1;
  const total = Math.pow(2, 32 - parseInt(prefix?.slice(1) || "0"));
  const usable = total > 2 ? total - 2 : total;
  return {
    network: net,
    broadcast: bcast,
    prefix,
    firstHost: first.join("."),
    lastHost: last.join("."),
    totalHosts: total,
    usableHosts: usable,
    wildcard: String(mask).split(".").map((o, i) => 255 - Number(o)).join(".")
  };
}

export default function TopologyPage() {
  const canvasRef = useRef(null);
  const innerRef = useRef(null);
  const wrapRef = useRef(null);
  const dragRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [mode, setMode] = useState("select"); // select | connect
  const [pending, setPending] = useState(null);
  const [cableType, setCableType] = useState(CABLES[0].type);
  const [sel, setSel] = useState(null); // {kind:'node'|'link', id}
  const [activeEx, setActiveEx] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [sectionOpen, setSectionOpen] = useState({
    devices: true,
    cables: true,
    connectors: true,
  });
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [fsInspectorOpen, setFsInspectorOpen] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [subnetOpen, setSubnetOpen] = useState(false);
  const [subnetIP, setSubnetIP] = useState("192.168.1.0");
  const [subnetMask, setSubnetMask] = useState("255.255.255.0");
  const [simOpen, setSimOpen] = useState(false);
  const [simOut, setSimOut] = useState("");
  const [simSrc, setSimSrc] = useState("");
  const [simDst, setSimDst] = useState("");
  const [simMode, setSimMode] = useState("ping");
  const [simCount, setSimCount] = useState(4);
  const [strokes, setStrokes] = useState([]);
  const [texts, setTexts] = useState([]);
  const [penColor, setPenColor] = useState("#e3b341");
  const [clip, setClip] = useState(null);
  const drawRef = useRef(null);
  const zoomRef = useRef(1);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === "c") {
        e.preventDefault();
        copySelection();
      } else if (mod && k === "x") {
        e.preventDefault();
        cutSelection();
      } else if (mod && k === "v") {
        e.preventDefault();
        pasteClip();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, clip, nodes, links, texts, strokes]);

  const toggleFull = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      const p = el.requestFullscreen?.();
      if (p && p.catch) p.catch(() => setFull((v) => !v));
    } else {
      document.exitFullscreen?.();
    }
  };

  const canvasUnits = () => {
    const el = innerRef.current || canvasRef.current;
    const r = el.getBoundingClientRect();
    const z = zoomRef.current || 1;
    return { left: r.left, top: r.top, width: r.width / z, height: r.height / z, z };
  };

  const canvasPoint = (e) => {
    const { left, top, z } = canvasUnits();
    return { x: (e.clientX - left) / z, y: (e.clientY - top) / z };
  };

  const onCanvasPointerDown = (e) => {
    if (mode === "text") {
      const p = canvasPoint(e);
      const t = window.prompt("พิมพ์ข้อความบนผัง", "ข้อความ");
      if (t && t.trim()) {
        setTexts((ts) => [
          ...ts,
          { id: `t${Date.now()}${Math.floor(Math.random() * 1000)}`, x: p.x, y: p.y, text: t.trim(), color: penColor },
        ]);
      }
      return;
    }
    if (mode === "draw") {
      const p = canvasPoint(e);
      const stroke = {
        id: `s${Date.now()}${Math.floor(Math.random() * 1000)}`,
        color: penColor,
        width: 3,
        points: [p],
      };
      drawRef.current = stroke;
      setStrokes((ss) => [...ss, stroke]);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
  };

  const onCanvasPointerMove = (e) => {
    const d = drawRef.current;
    if (!d) return;
    const p = canvasPoint(e);
    d.points.push(p);
    const pts = d.points;
    setStrokes((ss) => ss.map((s) => (s.id === d.id ? { ...s, points: [...pts] } : s)));
  };

  const onCanvasPointerUp = () => {
    drawRef.current = null;
  };

  const loadExample = useCallback((ex) => {
    const idOf = (key) => `${ex.id}-${key}`;
    setNodes(
      ex.nodes.map((n) => ({
        id: idOf(n.key),
        type: n.type,
        x: n.x,
        y: n.y,
        ip: n.ip || "",
        mask: n.mask || "",
        gateway: n.gateway || "",
        vlan: n.vlan || "",
      }))
    );
    setLinks(
      ex.links.map((l, i) => ({
        id: `${ex.id}-l${i}`,
        a: idOf(l.a),
        b: idOf(l.b),
        cable: l.cable,
      }))
    );
    setPending(null);
    setSel(null);
    setStrokes([]);
    setTexts([]);
    setMode("select");
    setActiveEx(ex.id);
  }, []);

  useEffect(() => {
    const blank = EXAMPLES.find((e) => e.id === "ex-blank");
    if (blank) loadExample(blank);
  }, [loadExample]);

  const addNode = useCallback((type, x, y) => {
    const id = `n${Date.now()}${Math.floor(Math.random() * 100000)}`;
    setNodes((ns) => [...ns, { id, type, x, y }]);
    setSel({ kind: "node", id });
  }, []);

  const onPaletteDragStart = (e, type) => {
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onCanvasDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (type.startsWith("cable:")) {
      const cableType = type.replace("cable:", "");
      if (CABLE_MAP[cableType]) {
        setCableType(cableType);
        setMode("connect");
        setPending(null);
      }
      return;
    }
    if (!DEVICE_MAP[type]) return;
    const { left, top, width, height, z } = canvasUnits();
    const x = clamp((e.clientX - left) / z - NODE_W / 2, 0, width - NODE_W);
    const y = clamp((e.clientY - top) / z - NODE_H / 2, 0, height - NODE_H);
    addNode(type, x, y);
  };

  const onPaletteClick = (type) => {
    const { width, height } = canvasUnits();
    const off = (nodes.length % 6) * 26;
    const x = clamp(width / 2 - NODE_W / 2 + off, 0, width - NODE_W);
    const y = clamp(height / 2 - NODE_H / 2 + off, 0, height - NODE_H);
    addNode(type, x, y);
  };

  const handleConnect = (id) => {
    if (pending == null) {
      setPending(id);
      return;
    }
    if (pending === id) {
      setPending(null);
      return;
    }
    setLinks((ls) => [...ls, { id: `l${Date.now()}${Math.floor(Math.random() * 1000)}`, a: pending, b: id, cable: cableType }]);
    setPending(null);
  };

  const onNodePointerDown = (e, node) => {
    if (mode === "draw" || mode === "text") return;
    if (mode === "connect") {
      handleConnect(node.id);
      return;
    }
    const { left, top, z } = canvasUnits();
    dragRef.current = {
      id: node.id,
      dx: (e.clientX - left) / z - node.x,
      dy: (e.clientY - top) / z - node.y,
    };
    setSel({ kind: "node", id: node.id });
  };

  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const { left, top, width, height, z } = canvasUnits();
      const x = clamp((e.clientX - left) / z - d.dx, 0, width - NODE_W);
      const y = clamp((e.clientY - top) / z - d.dy, 0, height - NODE_H);
      setNodes((ns) => ns.map((n) => (n.id === d.id ? { ...n, x, y } : n)));
    };
    const up = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const deleteNode = (id) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setLinks((ls) => ls.filter((l) => l.a !== id && l.b !== id));
    setSel(null);
    setPending(null);
  };

  const updateNode = (id, patch) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteLink = (id) => {
    setLinks((ls) => ls.filter((l) => l.id !== id));
    setSel(null);
  };

  const copySelection = () => {
    if (!sel) return;
    if (sel.kind === "node") {
      const n = byId(sel.id);
      if (!n) return;
      setClip({
        kind: "node",
        type: n.type,
        ip: n.ip,
        mask: n.mask,
        gateway: n.gateway,
        vlan: n.vlan,
        x: n.x,
        y: n.y,
      });
    } else if (sel.kind === "link") {
      const l = links.find((x) => x.id === sel.id);
      if (!l) return;
      setClip({ kind: "link", cable: l.cable });
    } else if (sel.kind === "text") {
      const t = texts.find((x) => x.id === sel.id);
      if (!t) return;
      setClip({ kind: "text", text: t.text, color: t.color, x: t.x, y: t.y });
    } else if (sel.kind === "stroke") {
      const s = strokes.find((x) => x.id === sel.id);
      if (!s) return;
      setClip({ kind: "stroke", color: s.color, width: s.width, points: s.points });
    }
  };

  const pasteClip = () => {
    if (!clip) return;
    const nid = () => `n${Date.now()}${Math.floor(Math.random() * 100000)}`;
    if (clip.kind === "node") {
      const id = nid();
      setNodes((ns) => [
        ...ns,
        {
          id,
          type: clip.type,
          x: clip.x + 28,
          y: clip.y + 28,
          ip: clip.ip,
          mask: clip.mask,
          gateway: clip.gateway,
          vlan: clip.vlan,
        },
      ]);
      setSel({ kind: "node", id });
    } else if (clip.kind === "link") {
      setCableType(clip.cable);
      setMode("connect");
      setPending(null);
    } else if (clip.kind === "text") {
      const id = `t${Date.now()}${Math.floor(Math.random() * 1000)}`;
      setTexts((ts) => [
        ...ts,
        { id, text: clip.text, color: clip.color, x: clip.x + 28, y: clip.y + 28 },
      ]);
      setSel({ kind: "text", id });
    } else if (clip.kind === "stroke") {
      const id = `s${Date.now()}${Math.floor(Math.random() * 1000)}`;
      setStrokes((ss) => [
        ...ss,
        {
          id,
          color: clip.color,
          width: clip.width,
          points: clip.points.map((p) => ({ x: p.x + 28, y: p.y + 28 })),
        },
      ]);
      setSel({ kind: "stroke", id });
    }
  };

  const cutSelection = () => {
    copySelection();
    deleteSelection();
  };

const deleteSelection = () => {
    if (!sel) return;
    if (sel.kind === "node") deleteNode(sel.id);
    else if (sel.kind === "link") deleteLink(sel.id);
    else if (sel.kind === "text") {
      setTexts((ts) => ts.filter((t) => t.id !== sel.id));
      setSel(null);
    } else if (sel.kind === "stroke") {
      setStrokes((ss) => ss.filter((s) => s.id !== sel.id));
      setSel(null);
    }
  };

  const saveDiagram = () => {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      nodes,
      links,
      strokes,
      texts,
      cableType,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topology-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileLoad = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.nodes) setNodes(data.nodes);
        if (data.links) setLinks(data.links);
        if (data.strokes) setStrokes(data.strokes);
        if (data.texts) setTexts(data.texts);
        if (data.cableType) setCableType(data.cableType);
        setSel(null);
        setPending(null);
        setActiveEx(null);
      } catch (err) {
        alert('Invalid file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openSimModal = () => {
    if (!nodes.length) { setSimOut("เพิ่มอุปกรณ์ก่อนเปิดหน้าต่างจำลอง"); return; }
    setSimSrc(nodes[0].id);
    setSimDst(nodes[nodes.length - 1].id);
    setSimMode("ping");
    setSimCount(4);
    setSimOut("");
    setSimOpen(true);
  };

  const clearAll = () => {
    setNodes([]);
    setLinks([]);
    setStrokes([]);
    setTexts([]);
    setSel(null);
    setPending(null);
  };

  const runSim = async () => {
    if (!simSrc || !simDst) { setSimOut("เลือกต้นทางและปลายทาง"); return; }
    const topo = {
      nodes: nodes.map((n) => ({ id: n.id, name: DEVICE_MAP[n.type]?.name || n.type, layer: DEVICE_MAP[n.type]?.layer || 1 })),
      links: links.map((l) => ({ a: l.a, b: l.b, cable: l.cable })),
    };
    setSimOut(`> network-d sim ${simMode} ${simSrc} -> ${simDst}\n[กำลังเรียก virtual network engine...]\n`);
    try {
      const res = await fetch("/api/topology/sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topo, mode: simMode, src: simSrc, dst: simDst, count: simCount }),
      });
      const data = await res.json();
      setSimOut(data.output || data.error || "(no output)");
    } catch (e) {
      setSimOut("error: " + e.message);
    }
  };

  const nodeCenter = (n) => ({ x: n.x + NODE_W / 2, y: n.y + 40 });
  const byId = (id) => nodes.find((n) => n.id === id);

  const selectedNode =
    sel && sel.kind === "node" ? byId(sel.id) : null;
  const selectedLink =
    sel && sel.kind === "link" ? links.find((l) => l.id === sel.id) : null;
  const activeExample = activeEx ? EXAMPLES.find((x) => x.id === activeEx) : null;

  return (
    <div className="course pt-wide">
      <div className="pt-toolbar">
        <button className="pt-toolbar-toggle" onClick={() => setToolbarOpen(!toolbarOpen)} aria-expanded={toolbarOpen} aria-label="แสดง/ซ่อนแถบเครื่องมือ">
          {toolbarOpen ? "⌄" : "⌃"}
        </button>
        {toolbarOpen && (
          <>
            <div className="seg pt-mode">
              <button className={mode === "select" ? "active" : ""} onClick={() => { setMode("select"); setPending(null); }}>
                เลือก/ย้าย
              </button>
              <button className={mode === "connect" ? "active" : ""} onClick={() => { setMode("connect"); setPending(null); }}>
                เชื่อมต่อ
              </button>
              <button className={mode === "draw" ? "active" : ""} onClick={() => { setMode("draw"); setPending(null); }}>
                วาด
              </button>
              <button className={mode === "text" ? "active" : ""} onClick={() => { setMode("text"); setPending(null); }}>
                เขียน
              </button>
            </div>
            {(mode === "draw" || mode === "text") && (
              <div className="pt-pen">
                <span>สี</span>
                {["#e3b341", "#3ea6ff", "#f85149", "#3fb950", "#ffffff", "#f08a5d"].map((c) => (
                  <button
                    key={c}
                    className={`pt-pen-dot${penColor === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setPenColor(c)}
                    title={c}
                  />
                ))}
              </div>
            )}
            <label className="pt-example">
              <span>ตัวอย่าง</span>
              <select
                value={activeEx || ""}
                onChange={(e) => {
                  const ex = EXAMPLES.find((x) => x.id === e.target.value);
                  if (ex) loadExample(ex);
                }}
              >
                <option value="">— เลือกตัวอย่าง —</option>
                {EXAMPLES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    [{LEVEL_LABEL[ex.level]}] {ex.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="pt-subnet" style={{position: "relative"}}>
              <button className="btn" onClick={() => setSubnetOpen(!subnetOpen)} title="คำนวณ IP Subnet">
                🧮 Subnet
              </button>
              <button className="btn" onClick={runSim} title="รันการจำลองเครือข่าย: ping / traceroute">
                🧪 รันจำลอง
              </button>
              <button className="btn" onClick={openSimModal} title="เปิดหน้าต่างจำลองเครือข่าย">
                🖥️ จำลองเครือข่าย
              </button>
              {subnetOpen && (
                <div className="pt-subnet-popover">
                  <div className="pt-subnet-row">
                    <label>
                      <span>IP Address</span>
                      <input
                        type="text"
                        value={subnetIP}
                        onChange={(e) => setSubnetIP(e.target.value)}
                        placeholder="192.168.1.0"
                        inputMode="decimal"
                      />
                    </label>
                    <label>
                      <span>Subnet Mask</span>
                      <select value={subnetMask} onChange={(e) => setSubnetMask(e.target.value)}>
                        {["255.255.255.252", "255.255.255.248", "255.255.255.240", "255.255.255.224",
                          "255.255.255.192", "255.255.255.128", "255.255.255.0", "255.255.254.0",
                          "255.255.252.0", "255.255.248.0", "255.255.240.0", "255.255.224.0",
                          "255.255.192.0", "255.255.128.0", "255.255.0.0"].map((m) => (
                          <option key={m} value={m}>{m} {maskToPrefix(m)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {(() => {
                    const calc = subnetCalc(subnetIP, subnetMask);
                    if (!calc) return null;
                    return (
                      <div className="pt-subnet-result">
                        <div className="pt-subnet-item"><span>Network</span><code>{calc.network}{calc.prefix}</code></div>
                        <div className="pt-subnet-item"><span>Broadcast</span><code>{calc.broadcast}</code></div>
                        <div className="pt-subnet-item"><span>First Host</span><code>{calc.firstHost}</code></div>
                        <div className="pt-subnet-item"><span>Last Host</span><code>{calc.lastHost}</code></div>
                        <div className="pt-subnet-item"><span>Usable Hosts</span><code>{calc.usableHosts}</code></div>
                        <div className="pt-subnet-item"><span>Wildcard</span><code>{calc.wildcard}</code></div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="pt-count">
              อุปกรณ์ {nodes.length} · สาย {links.length}
            </div>
            <button className="btn primary" onClick={saveDiagram} title="บันทึกลงไฟล์ JSON">
              💾 บันทึก
            </button>
            <input type="file" id="loadFile" accept=".json" style={{display:'none'}} onChange={handleFileLoad} />
            <button className="btn" onClick={() => document.getElementById('loadFile').click()} title="โหลดจากไฟล์ JSON">
              📁 โหลด
            </button>
            <button className="btn danger pt-clear" onClick={clearAll}>
              ล้างกระดาน
            </button>
            <button className="btn danger" onClick={clearAll} style={{marginLeft: 8}} title="ลบทุกอย่าง: อุปกรณ์ สาย ภาพวาด ข้อความ IP Plan">
              🗑️ ลบทั้งหมด
            </button>
          </>
        )}
      </div>

      {activeExample && (
        <p className="pt-example-hint">
          <b>{activeExample.title}</b> — {activeExample.desc}
          <span className="pt-example-tip"> เคล็ดลับ: {activeExample.tip}</span>
        </p>
      )}

      <div className="pt-legend">
        {CABLES.map((c) => (
          <button
            key={c.type}
            className={`pt-legend-item${cableType === c.type ? " active" : ""}`}
            onClick={() => { setCableType(c.type); setMode("connect"); }}
            title={c.role}
          >
            <span className="pt-legend-icon" style={{ color: c.color }}>
              {c.type === "user-lan" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
              )}
              {c.type === "uplink" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="1" cy="7" r="3" fill="currentColor"/><circle cx="17" cy="7" r="3" fill="currentColor"/></svg>
              )}
              {c.type === "mgmt" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
              )}
              {c.type === "server" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4"/><circle cx="1" cy="7" r="3" fill="currentColor"/><circle cx="17" cy="7" r="3" fill="currentColor"/></svg>
              )}
              {c.type === "console" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/><circle cx="1" cy="7" r="2" fill="currentColor"/><circle cx="17" cy="7" r="2" fill="currentColor"/></svg>
              )}
              {c.type === "wan" && (
                <svg width="18" height="14" viewBox="0 0 18 14"><path d="M1 7 Q9 1 17 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
              )}
            </span>
            {c.name}
            <span className="pt-legend-th">{c.nameTh}</span>
          </button>
        ))}
      </div>

      <div className={`pt-body${paletteOpen ? "" : " no-palette"}${inspectorOpen ? "" : " no-inspector"}`}>
        {/* palette */}
        {paletteOpen ? (
          <aside className="pt-palette">
            <div className="pt-palette-hd">
              <span>คู่อุปกรณ์ / สายสัญญาณ</span>
              <button className="pt-collapse" onClick={() => setPaletteOpen(false)} title="ย่อคู่อุปกรณ์">
                ◀
              </button>
            </div>
            <div className="pt-palette-section">
              <button
                className="pt-palette-section-title"
                onClick={() => setSectionOpen((s) => ({ ...s, devices: !s.devices }))}
                style={{ textAlign: "left", width: "100%", padding: 0, background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", transition: "transform .2s", transform: sectionOpen.devices ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                  <span>อุปกรณ์</span>
                  <small style={{ color: "var(--muted)", marginLeft: "auto" }}>{DEVICES.length} รายการ</small>
                </span>
              </button>
              {sectionOpen.devices && (
                <>
                  {DEVICES.map((d) => (
                    <button
                      key={d.type}
                      className="pt-item"
                      draggable
                      onDragStart={(e) => onPaletteDragStart(e, d.type)}
                      onClick={() => onPaletteClick(d.type)}
                      title={d.desc}
                    >
                      <span className="pt-item-ico">
                        <Photo
                          src={DEVICE_IMAGES[d.type]}
                          alt={d.nameTh}
                          className="pt-device-img"
                          fallback={<DeviceIcon type={d.type} size={30} />}
                        />
                      </span>
                      <span className="pt-item-txt">
                        <b>{d.name}</b>
                        <small>{d.role}</small>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="pt-palette-sep" />
            <div className="pt-palette-section">
              <button
                className="pt-palette-section-title"
                onClick={() => setSectionOpen((s) => ({ ...s, cables: !s.cables }))}
                style={{ textAlign: "left", width: "100%", padding: 0, background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", transition: "transform .2s", transform: sectionOpen.cables ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                  <span>สายสัญญาณ</span>
                  <small style={{ color: "var(--muted)", marginLeft: "auto" }}>{CABLES.length} รายการ</small>
                </span>
              </button>
              {sectionOpen.cables && (
                <>
                  {CABLES.map((c) => (
                    <button
                      key={c.type}
                      className={`pt-item${cableType === c.type ? " active" : ""}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `cable:${c.type}`);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => { setCableType(c.type); setMode("connect"); setPending(null); }}
                      title={`${c.name} (${c.nameTh}) — ${c.desc}`}
                    >
                      <span className="pt-item-ico" style={{ color: c.color }}>
                        <Photo
                          src={CABLE_IMAGES[c.type]}
                          alt={c.nameTh}
                          className="pt-cable-img"
                          fallback={
                            <>
                              {c.type === "user-lan" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
                              )}
                              {c.type === "uplink" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="1" cy="7" r="3" fill="currentColor"/><circle cx="17" cy="7" r="3" fill="currentColor"/></svg>
                              )}
                              {c.type === "mgmt" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
                              )}
                              {c.type === "server" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4"/><circle cx="1" cy="7" r="3" fill="currentColor"/><circle cx="17" cy="7" r="3" fill="currentColor"/></svg>
                              )}
                              {c.type === "console" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/><circle cx="1" cy="7" r="2" fill="currentColor"/><circle cx="17" cy="7" r="2" fill="currentColor"/></svg>
                              )}
                              {c.type === "wan" && (
                                <svg width="30" height="30" viewBox="0 0 18 14"><path d="M1 7 Q9 1 17 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="1" cy="7" r="2.5" fill="currentColor"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/></svg>
                              )}
                            </>
                          }
                        />
                      </span>
                      <span className="pt-item-txt">
                        <b>{c.name}</b>
                        <small>{c.nameTh} — {c.desc}</small>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="pt-palette-sep" />
            <div className="pt-palette-section">
              <button
                className="pt-palette-section-title"
                onClick={() => setSectionOpen((s) => ({ ...s, connectors: !s.connectors }))}
                style={{ textAlign: "left", width: "100%", padding: 0, background: "none", border: "none", color: "inherit", cursor: "pointer" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", transition: "transform .2s", transform: sectionOpen.connectors ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
                  <span>คอนเนกเตอร์ (Connector)</span>
                  <small style={{ color: "var(--muted)", marginLeft: "auto" }}>{CONNECTORS.reduce((sum, cat) => sum + cat.items.length, 0)} รายการ</small>
                </span>
              </button>
              {sectionOpen.connectors && (
                <>
                  {CONNECTORS.map((cat) => (
                    <div key={cat.category} className="pt-connector-category">
                      <div className="pt-connector-category-title" style={{ borderLeftColor: cat.color }}>
                        <span className="pt-connector-category-icon" style={{ color: cat.color }}>{cat.icon}</span>
                        <span>{cat.categoryName}</span>
                        <small style={{ color: "var(--muted)", marginLeft: "auto" }}>{cat.items.length} รายการ</small>
                      </div>
                      <div className="pt-connector-items">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            className="pt-connector-item"
                            title={`${item.nameTh} — ${item.desc}`}
                          >
                            <Photo
                              src={CONNECTOR_IMAGES[item.id]}
                              alt={item.nameTh}
                              className="pt-connector-item-img"
                              fallback={
                                <span className="pt-connector-item-icon" style={{ color: cat.color }}>{item.icon}</span>
                              }
                            />
                            <span className="pt-connector-item-info">
                              <b>{item.name}</b>
                              <small>{item.nameTh} — {item.desc}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </aside>
        ) : (
          <aside className="pt-rail">
            <button className="pt-rail-btn" onClick={() => setPaletteOpen(true)} title="ขยายคู่อุปกรณ์">
              ▶
            </button>
          </aside>
        )}

        {/* canvas */}
        <div className="pt-canvas-wrap" ref={wrapRef}>
          <div className="pt-zoombar">
            <button onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} title="ย่อ">
              −
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))} title="ขยาย">
              +
            </button>
            <button onClick={() => setZoom(1)} title="พอดี">
              พอดี
            </button>
            <button className="pt-zoom-full" onClick={toggleFull} title="เต็มจอ">
              {full ? "ออกจากเต็มจอ" : "เต็มจอ"}
            </button>
          </div>
          {full && (
            <div className="pt-fs-tools">
              <select
                className="pt-fs-example"
                value={activeEx || ""}
                title="ตัวอย่าง"
                onChange={(e) => {
                  const ex = EXAMPLES.find((x) => x.id === e.target.value);
                  if (ex) loadExample(ex);
                }}
              >
                {EXAMPLES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    [{LEVEL_LABEL[ex.level]}] {ex.title}
                  </option>
                ))}
              </select>
              <span className="pt-fs-tools-sep" />
              {[
                ["select", "เลือก"],
                ["connect", "ต่อสาย"],
                ["draw", "วาด"],
                ["text", "เขียน"],
              ].map(([m, label]) => (
                <button
                  key={m}
                  className={mode === m ? "active" : ""}
                  onClick={() => {
                    setMode(m);
                    setPending(null);
                  }}
                >
                  {label}
                </button>
              ))}
              <span className="pt-fs-tools-sep" />
              {["#e3b341", "#3ea6ff", "#f85149", "#3fb950", "#ffffff", "#f08a5d"].map((c) => (
                <button
                  key={c}
                  className={`pt-pen-dot${penColor === c ? " active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setPenColor(c)}
                  title={c}
                />
              ))}
              <span className="pt-fs-tools-sep" />
              <button
                className={fsInspectorOpen ? "active" : ""}
                onClick={() => setFsInspectorOpen(!fsInspectorOpen)}
                title="แสดง/ซ่อนรายละเอียด"
              >
                📋 รายละเอียด
              </button>
              <button onClick={copySelection} disabled={!sel} title="คัดลอก (Ctrl/Cmd+C)">
                คัดลอก
              </button>
              <button onClick={cutSelection} disabled={!sel} title="ตัด (Ctrl/Cmd+X)">
                ตัด
              </button>
              <button onClick={pasteClip} disabled={!clip} title="วาง (Ctrl/Cmd+V)">
                วาง
              </button>
              <button onClick={deleteSelection} disabled={!sel} title="ลบ (Delete)">
                ลบ
              </button>
            </div>
          )}
          {full && fsInspectorOpen && (
            <aside className="pt-fs-inspector">
              <div className="pt-insp-hd">
                <span>รายละเอียด</span>
                <button className="pt-collapse" onClick={() => setFsInspectorOpen(false)} title="ปิดรายละเอียด">
                  ✕
                </button>
              </div>
              {selectedNode && (
                <div className="pt-insp-body">
                  <Photo
                    src={DEVICE_IMAGES[selectedNode.type]}
                    alt={DEVICE_MAP[selectedNode.type].name}
                    className="pt-photo"
                    fallback={
                      <div className="pt-photo-fallback">
                        <DeviceIcon type={selectedNode.type} size={64} />
                      </div>
                    }
                  />
                  <div className="pt-insp-ico">
                    <DeviceIcon type={selectedNode.type} size={40} />
                  </div>
                  <h3>{DEVICE_MAP[selectedNode.type].name}</h3>
                  <div className="pt-insp-en">{DEVICE_MAP[selectedNode.type].nameEn}</div>
                  <div className="pt-tag">ชั้น {DEVICE_MAP[selectedNode.type].layer}</div>
                  <div className="pt-field">
                    <em>หน้าที่</em>
                    <p>{DEVICE_MAP[selectedNode.type].role}</p>
                  </div>
                  <div className="pt-field">
                    <em>คำอธิบายรายละเอียด</em>
                    <p>{DEVICE_MAP[selectedNode.type].desc}</p>
                  </div>
                  <div className="pt-field">
                    <em>จำนวนสายที่เชื่อม</em>
                    <p>{links.filter((l) => l.a === selectedNode.id || l.b === selectedNode.id).length} เส้น</p>
                  </div>
                  <div className="pt-field">
                    <em>ตัวอย่าง Lab ที่เกี่ยวข้อง</em>
                    {labsForDevice(selectedNode.type).length === 0 ? (
                      <p>ไม่มี Lab ที่เชื่อมโยงโดยตรง</p>
                    ) : (
                      <ul className="pt-lab-list">
                        {labsForDevice(selectedNode.type).map((lab) => (
                          <li key={lab.n}>
                            <Link href="/practical" className="pt-lab-link">
                              <span className="pt-lab-n">Lab {lab.n}</span>
                              <span className="pt-lab-name">{lab.lab}</span>
                            </Link>
                            <small>
                              {lab.topic} · {lab.tools}
                            </small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="pt-field pt-ip">
                    <em>การตั้งค่าเครือข่าย (IPv4 / VLAN)</em>
                    <div className="pt-ip-grid">
                      <label>
                        <span>IP Address</span>
                        <input
                          value={selectedNode.ip || ""}
                          placeholder="192.168.1.10"
                          inputMode="decimal"
                          className={selectedNode.ip && !isIPv4(selectedNode.ip) ? "bad" : ""}
                          onChange={(e) => updateNode(selectedNode.id, { ip: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Subnet Mask</span>
                        <input
                          value={selectedNode.mask || "255.255.255.0"}
                          placeholder="255.255.255.0"
                          inputMode="decimal"
                          className={selectedNode.mask && !isIPv4(selectedNode.mask) ? "bad" : ""}
                          onChange={(e) => updateNode(selectedNode.id, { mask: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Default Gateway</span>
                        <input
                          value={selectedNode.gateway || ""}
                          placeholder="192.168.1.1"
                          inputMode="decimal"
                          className={selectedNode.gateway && !isIPv4(selectedNode.gateway) ? "bad" : ""}
                          onChange={(e) => updateNode(selectedNode.id, { gateway: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>VLAN</span>
                        <input
                          value={selectedNode.vlan || ""}
                          placeholder="10"
                          inputMode="numeric"
                          onChange={(e) => updateNode(selectedNode.id, { vlan: e.target.value.replace(/[^\d]/g, "") })}
                        />
                      </label>
                    </div>
                    <p className="pt-ip-note">
                      {selectedNode.ip
                        ? isIPv4(selectedNode.ip) && isIPv4(selectedNode.mask)
                          ? `IPv4 ${selectedNode.ip}${maskToPrefix(selectedNode.mask)} · เครือข่าย ${networkOf(selectedNode.ip, selectedNode.mask)}`
                          : "รูปแบบ IP หรือ Subnet ไม่ถูกต้อง"
                        : "ยังไม่ได้กำหนด IP — กรอกเพื่อจำลองการตั้งค่าจริง"}
                    </p>
                  </div>
                  <button className="btn danger pt-del" onClick={() => deleteNode(selectedNode.id)}>
                    ลบอุปกรณ์นี้
                  </button>
                </div>
              )}
              {selectedLink && (
                <div className="pt-insp-body">
                  <Photo
                    src={CABLE_IMAGES[selectedLink.cable]}
                    alt={CABLE_MAP[selectedLink.cable].name}
                    className="pt-photo"
                    fallback={<div className="pt-photo-fallback pt-cable-hero" style={{ borderColor: CABLE_MAP[selectedLink.cable].color }} />}
                  />
                  <div className="pt-insp-ico">
                    <DeviceIcon type="switch" size={40} />
                  </div>
                  <h3>{CABLE_MAP[selectedLink.cable].name}</h3>
                  <div className="pt-tag">ตัวเชื่อมต่อ</div>
                  <div className="pt-field">
                    <em>หน้าที่</em>
                    <p>{CABLE_MAP[selectedLink.cable].role}</p>
                  </div>
                  <div className="pt-field">
                    <em>คำอธิบายรายละเอียด</em>
                    <p>{CABLE_MAP[selectedLink.cable].desc}</p>
                  </div>
                  <div className="pt-field">
                    <em>เชื่อมระหว่าง</em>
                    <p>
                      {byId(selectedLink.a) ? DEVICE_MAP[byId(selectedLink.a).type].name : "?"}
                      {" ↔ "}
                      {byId(selectedLink.b) ? DEVICE_MAP[byId(selectedLink.b).type].name : "?"}
                    </p>
                  </div>
                  <button className="btn danger pt-del" onClick={() => deleteLink(selectedLink.id)}>
                    ลบสายนี้
                  </button>
                </div>
              )}
              {!selectedNode && !selectedLink && (
                <div className="pt-insp-empty">
                  คลิกที่อุปกรณ์หรือเส้นสายเพื่อดูชื่อ หน้าที่ และคำอธิบาย
                </div>
              )}
            </aside>
          )}
          {full && (
            <div className="pt-fs-palette">
              {DEVICES.map((d) => (
                <button
                  key={d.type}
                  className="pt-fs-item"
                  draggable
                  onDragStart={(e) => onPaletteDragStart(e, d.type)}
                  onClick={() => onPaletteClick(d.type)}
                  title={`${d.name} — ${d.role}`}
                >
                  <DeviceIcon type={d.type} size={26} />
                  <span>{d.name}</span>
                </button>
              ))}
              <div className="pt-fs-sep" />
              {CABLES.map((c) => (
                <button
                  key={c.type}
                  className={`pt-fs-item pt-fs-cable${cableType === c.type ? " active" : ""}`}
                  onClick={() => {
                    setCableType(c.type);
                    setMode("connect");
                    setPending(null);
                  }}
                  title={`${c.name} (${c.nameTh}) — ${c.role}`}
                >
                  <span style={{ color: c.color }}>
                    {c.type === "user-lan" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><line x1="2" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="2" cy="9" r="3" fill="currentColor"/><circle cx="24" cy="9" r="3" fill="currentColor"/></svg>
                    )}
                    {c.type === "uplink" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><line x1="2" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/><circle cx="2" cy="9" r="3.5" fill="currentColor"/><circle cx="24" cy="9" r="3.5" fill="currentColor"/></svg>
                    )}
                    {c.type === "mgmt" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><line x1="2" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4"/><circle cx="2" cy="9" r="3" fill="currentColor"/><circle cx="24" cy="9" r="3" fill="currentColor"/></svg>
                    )}
                    {c.type === "server" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><line x1="2" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="7 5"/><circle cx="2" cy="9" r="3.5" fill="currentColor"/><circle cx="24" cy="9" r="3.5" fill="currentColor"/></svg>
                    )}
                    {c.type === "console" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><line x1="2" y1="9" x2="24" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/><circle cx="2" cy="9" r="2.5" fill="currentColor"/><circle cx="24" cy="9" r="2.5" fill="currentColor"/></svg>
                    )}
                    {c.type === "wan" && (
                      <svg width="26" height="18" viewBox="0 0 26 18"><path d="M2 9 Q13 1 24 9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="2" cy="9" r="3" fill="currentColor"/><circle cx="24" cy="9" r="3" fill="currentColor"/></svg>
                    )}
                  </span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}
          <div
            ref={canvasRef}
            className="pt-canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCanvasDrop}
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onCanvasPointerMove}
            onPointerUp={onCanvasPointerUp}
            onPointerLeave={onCanvasPointerUp}
          >
            <div ref={innerRef} className="pt-canvas-inner" style={{ zoom: String(zoom) }}>
            <svg className="pt-links">
              {links.map((l) => {
                const a = byId(l.a);
                const b = byId(l.b);
                if (!a || !b) return null;
                const ca = nodeCenter(a);
                const cb = nodeCenter(b);
                const spec = CABLE_MAP[l.cable];
                const color = spec?.color || "#3ea6ff";
                const dash = l.cable === "console" ? "6 5" : undefined;
                const isSel = sel && sel.kind === "link" && sel.id === l.id;
                return (
                  <g key={l.id}>
                    <line
                      x1={ca.x}
                      y1={ca.y}
                      x2={cb.x}
                      y2={cb.y}
                      stroke={isSel ? "#ffffff" : color}
                      strokeWidth={isSel ? 4 : 2.5}
                      strokeDasharray={dash}
                    />
                    <line
                      x1={ca.x}
                      y1={ca.y}
                      x2={cb.x}
                      y2={cb.y}
                      stroke="transparent"
                      strokeWidth={16}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onClick={() => setSel({ kind: "link", id: l.id })}
                    />
                  </g>
                );
              })}
              {strokes.map((s) => {
                const isSel = sel && sel.kind === "stroke" && sel.id === s.id;
                const pts = s.points.map((p) => `${p.x},${p.y}`).join(" ");
                return (
                  <g key={s.id}>
                    <polyline
                      points={pts}
                      fill="none"
                      stroke={isSel ? "#ffffff" : s.color}
                      strokeWidth={isSel ? s.width + 1.5 : s.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.95"
                    />
                    <polyline
                      points={pts}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      style={{
                        pointerEvents: mode === "select" ? "stroke" : "none",
                        cursor: mode === "select" ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (mode === "select") setSel({ kind: "stroke", id: s.id });
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {texts.map((t) => (
              <div
                key={t.id}
                className={`pt-text${sel && sel.kind === "text" && sel.id === t.id ? " sel" : ""}`}
                style={{ left: t.x, top: t.y, color: t.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (mode === "select") setSel({ kind: "text", id: t.id });
                }}
                onDoubleClick={() => {
                  const v = window.prompt("แก้ไขข้อความ", t.text);
                  if (v && v.trim()) {
                    setTexts((ts) => ts.map((x) => (x.id === t.id ? { ...x, text: v.trim() } : x)));
                  }
                }}
                title="ดับเบิลคลิกเพื่อแก้ไข"
              >
                {t.text}
              </div>
            ))}

            {nodes.map((n) => {
              const d = DEVICE_MAP[n.type];
              const isSel = sel && sel.kind === "node" && sel.id === n.id;
              const isPending = pending === n.id;
              return (
                <div
                  key={n.id}
                  className="pt-node"
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                  onPointerDown={(e) => onNodePointerDown(e, n)}
                >
                  <div className={`pt-node-box${isSel ? " sel" : ""}${isPending ? " pending" : ""}`}>
                    <DeviceIcon type={n.type} size={34} />
                    <span className="pt-node-name">{d.name}</span>
                  </div>
                  {n.ip || n.vlan ? (
                    <div className="pt-node-meta">
                      {n.vlan ? <span className="pt-node-vlan">VLAN {n.vlan}</span> : null}
                      {n.ip ? (
                        <span className="pt-node-ip">
                          {n.ip}
                          {maskToPrefix(n.mask)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {nodes.length === 0 && (
              <div className="pt-empty">ลากอุปกรณ์มาวางที่นี่ หรือคลิกจาก คู่อุปกรณ์</div>
            )}
            </div>
          </div>
        </div>

        {/* inspector */}
        {inspectorOpen ? (
          <aside className="pt-inspector">
            <div className="pt-insp-hd">
              <span>รายละเอียด</span>
              <button className="pt-collapse" onClick={() => setInspectorOpen(false)} title="ย่อรายละเอียด">
                ▶
              </button>
            </div>
          {selectedNode && (
            <div className="pt-insp-body">
              <Photo
                src={DEVICE_IMAGES[selectedNode.type]}
                alt={DEVICE_MAP[selectedNode.type].name}
                className="pt-photo"
                fallback={
                  <div className="pt-photo-fallback">
                    <DeviceIcon type={selectedNode.type} size={64} />
                  </div>
                }
              />
              <div className="pt-insp-ico">
                <DeviceIcon type={selectedNode.type} size={40} />
              </div>
              <h3>{DEVICE_MAP[selectedNode.type].name}</h3>
              <div className="pt-insp-en">{DEVICE_MAP[selectedNode.type].nameEn}</div>
              <div className="pt-tag">ชั้น {DEVICE_MAP[selectedNode.type].layer}</div>
              <div className="pt-field">
                <em>หน้าที่</em>
                <p>{DEVICE_MAP[selectedNode.type].role}</p>
              </div>
              <div className="pt-field">
                <em>คำอธิบายรายละเอียด</em>
                <p>{DEVICE_MAP[selectedNode.type].desc}</p>
              </div>
              <div className="pt-field">
                <em>จำนวนสายที่เชื่อม</em>
                <p>{links.filter((l) => l.a === selectedNode.id || l.b === selectedNode.id).length} เส้น</p>
              </div>
              <div className="pt-field">
                <em>ตัวอย่าง Lab ที่เกี่ยวข้อง</em>
                {labsForDevice(selectedNode.type).length === 0 ? (
                  <p>ไม่มี Lab ที่เชื่อมโยงโดยตรง</p>
                ) : (
                  <ul className="pt-lab-list">
                    {labsForDevice(selectedNode.type).map((lab) => (
                      <li key={lab.n}>
                        <Link href="/practical" className="pt-lab-link">
                          <span className="pt-lab-n">Lab {lab.n}</span>
                          <span className="pt-lab-name">{lab.lab}</span>
                        </Link>
                        <small>
                          {lab.topic} · {lab.tools}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="pt-field pt-ip">
                <em>การตั้งค่าเครือข่าย (IPv4 / VLAN)</em>
                <div className="pt-ip-grid">
                  <label>
                    <span>IP Address</span>
                    <input
                      value={selectedNode.ip || ""}
                      placeholder="192.168.1.10"
                      inputMode="decimal"
                      className={selectedNode.ip && !isIPv4(selectedNode.ip) ? "bad" : ""}
                      onChange={(e) => updateNode(selectedNode.id, { ip: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Subnet Mask</span>
                    <input
                      value={selectedNode.mask || "255.255.255.0"}
                      placeholder="255.255.255.0"
                      inputMode="decimal"
                      className={selectedNode.mask && !isIPv4(selectedNode.mask) ? "bad" : ""}
                      onChange={(e) => updateNode(selectedNode.id, { mask: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Default Gateway</span>
                    <input
                      value={selectedNode.gateway || ""}
                      placeholder="192.168.1.1"
                      inputMode="decimal"
                      className={selectedNode.gateway && !isIPv4(selectedNode.gateway) ? "bad" : ""}
                      onChange={(e) => updateNode(selectedNode.id, { gateway: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>VLAN</span>
                    <input
                      value={selectedNode.vlan || ""}
                      placeholder="10"
                      inputMode="numeric"
                      onChange={(e) => updateNode(selectedNode.id, { vlan: e.target.value.replace(/[^\d]/g, "") })}
                    />
                  </label>
                </div>
                <p className="pt-ip-note">
                  {selectedNode.ip
                    ? isIPv4(selectedNode.ip) && isIPv4(selectedNode.mask)
                      ? `IPv4 ${selectedNode.ip}${maskToPrefix(selectedNode.mask)} · เครือข่าย ${networkOf(selectedNode.ip, selectedNode.mask)}`
                      : "รูปแบบ IP หรือ Subnet ไม่ถูกต้อง"
                    : "ยังไม่ได้กำหนด IP — กรอกเพื่อจำลองการตั้งค่าจริง"}
                </p>
              </div>
              <button className="btn danger pt-del" onClick={() => deleteNode(selectedNode.id)}>
                ลบอุปกรณ์นี้
              </button>
            </div>
          )}

          {selectedLink && (
            <div className="pt-insp-body">
              <Photo
                src={CABLE_IMAGES[selectedLink.cable]}
                alt={CABLE_MAP[selectedLink.cable].name}
                className="pt-photo"
                fallback={<div className="pt-photo-fallback pt-cable-hero" style={{ borderColor: CABLE_MAP[selectedLink.cable].color }} />}
              />
              <div className="pt-insp-ico">
                <DeviceIcon type="switch" size={40} />
              </div>
              <h3>{CABLE_MAP[selectedLink.cable].name}</h3>
              <div className="pt-tag">ตัวเชื่อมต่อ</div>
              <div className="pt-field">
                <em>หน้าที่</em>
                <p>{CABLE_MAP[selectedLink.cable].role}</p>
              </div>
              <div className="pt-field">
                <em>คำอธิบายรายละเอียด</em>
                <p>{CABLE_MAP[selectedLink.cable].desc}</p>
              </div>
              <div className="pt-field">
                <em>เชื่อมระหว่าง</em>
                <p>
                  {byId(selectedLink.a) ? DEVICE_MAP[byId(selectedLink.a).type].name : "?"}
                  {" ↔ "}
                  {byId(selectedLink.b) ? DEVICE_MAP[byId(selectedLink.b).type].name : "?"}
                </p>
              </div>
              <button className="btn danger pt-del" onClick={() => deleteLink(selectedLink.id)}>
                ลบสายนี้
              </button>
            </div>
          )}

          {!selectedNode && !selectedLink && (
            <div className="pt-insp-empty">
              คลิกที่อุปกรณ์หรือเส้นสายเพื่อดูชื่อ หน้าที่ และคำอธิบาย
            </div>
          )}
          </aside>
        ) : (
          <aside className="pt-rail">
            <button className="pt-rail-btn" onClick={() => setInspectorOpen(true)} title="ขยายรายละเอียด">
              ◀
            </button>
          </aside>
        )}
      </div>

      <h2 className="section-title">แผนที่อยู่ IP (IP Plan)</h2>
      <div className="pt-ipplan-wrap">
        {nodes.filter((n) => n.ip || n.vlan || n.gateway).length === 0 ? (
          <div className="pt-ipplan-empty">
            ยังไม่มีการกำหนด IP — คลิกที่อุปกรณ์บนแคนวาส แล้วกรอก IP / Subnet / Gateway / VLAN ในช่อง “รายละเอียด”
          </div>
        ) : (
          <table className="pt-ipplan">
            <thead>
              <tr>
                <th>อุปกรณ์</th>
                <th>VLAN</th>
                <th>IP Address</th>
                <th>Subnet</th>
                <th>Network</th>
                <th>Gateway</th>
              </tr>
            </thead>
            <tbody>
              {nodes
                .filter((n) => n.ip || n.vlan || n.gateway)
                .map((n) => (
                  <tr key={n.id}>
                    <td>
                      <DeviceIcon type={n.type} size={16} /> {DEVICE_MAP[n.type].name}
                    </td>
                    <td>{n.vlan || "—"}</td>
                    <td className="mono">{n.ip || "—"}</td>
                    <td className="mono">
                      {n.mask ? `${n.mask}${maskToPrefix(n.mask)}` : "—"}
                    </td>
                    <td className="mono">{n.ip && n.mask ? networkOf(n.ip, n.mask) : "—"}</td>
                    <td className="mono">{n.gateway || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

<p className="pt-credit">
        รูปภาพประกอบอุปกรณ์และสายสัญญาณจาก{" "}
        <a href="https://commons.wikimedia.org" target="_blank" rel="noreferrer">
          Wikimedia Commons
        </a>{" "}
        ( Reserved under the license of each image)
      </p>

      {simOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setSimOpen(false)}
        >
          <div
            className="card"
            style={{ width: "min(760px, 96vw)", maxHeight: "90vh", overflow: "auto", background: "var(--panel)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hd" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span> virtual network simulation</span>
              <button className="pt-collapse" onClick={() => setSimOpen(false)} title="ปิด">✕</button>
            </div>
            <div className="bd" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="f">โหมด</label>
                <div className="seg" style={{ width: "100%" }}>
                  <button className={simMode === "ping" ? "active" : ""} onClick={() => setSimMode("ping")}>Ping</button>
                  <button className={simMode === "traceroute" ? "active" : ""} onClick={() => setSimMode("traceroute")}>Traceroute</button>
                </div>
                <label className="f">ต้นทาง (Source)</label>
                <select value={simSrc} onChange={(e) => setSimSrc(e.target.value)} style={{ width: "100%" }}>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{DEVICE_MAP[n.type]?.name || n.type} [{n.id}]</option>
                  ))}
                </select>
                <label className="f">ปลายทาง (Destination)</label>
                <select value={simDst} onChange={(e) => setSimDst(e.target.value)} style={{ width: "100%" }}>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{DEVICE_MAP[n.type]?.name || n.type} [{n.id}]</option>
                  ))}
                </select>
                <label className="f">จำนวน {simMode === "ping" ? " ICMP" : " hops"}</label>
                <input type="number" min="1" max="20" value={simCount} onChange={(e) => setSimCount(Number(e.target.value) || 4)} style={{ width: "100%" }} />
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button className="btn primary" onClick={runSim}>รันจำลอง</button>
                  <button className="btn" onClick={() => setSimOut("")}>ล้างผลลัพธ์</button>
                </div>
              </div>
              <div>
                <label className="f">ผลลัพธ์</label>
                <pre className="console" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 280, background: "#0b0f14" }}>{simOut || "คลิก รันจำลอง เพื่อเรียกใช้ virtual network engine"}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}