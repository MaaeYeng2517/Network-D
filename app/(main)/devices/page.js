"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DeviceIcon from "@/components/DeviceIcon";
import { DEVICES3D, DEVICE3D_MAP, CABLES, CABLE_MAP } from "@/lib/devices3d";

const DeviceScene = dynamic(() => import("@/components/three/DeviceScene"), {
  ssr: false,
  loading: () => (
    <div className="vd-loading">กำลังโหลดฉาก 3D (WebGL)…</div>
  ),
});

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function DevicesPage() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [sel, setSel] = useState(null); // {kind:'node'|'link', id}
  const [mode, setMode] = useState("select"); // select | connect
  const [cableType, setCableType] = useState(CABLES[0].type);
  const [pendingKey, setPendingKey] = useState(null); // "nodeId:portId"
  const [exploded, setExploded] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [env, setEnv] = useState(1);
  const [fog, setFog] = useState(30);
  const [bg, setBg] = useState("#0b0f14");
  const [devColor, setDevColor] = useState("#2b3746");
  const [devScale, setDevScale] = useState(1);
  const [toneMapping, setToneMapping] = useState("AgX");
  const [exposure, setExposure] = useState(1.0);
  const wrapRef = useRef(null);
  const pageRef = useRef(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (sel) {
          e.preventDefault();
          deleteSel();
        }
      } else if (e.key === "Escape") {
        setPendingKey(null);
        setMode("select");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const addDevice = useCallback((type, x, z) => {
    if (!DEVICE3D_MAP[type]) return;
    const id = `n${Date.now()}${Math.floor(Math.random() * 100000)}`;
    setNodes((ns) => [...ns, { id, type, x, z }]);
    setSel({ kind: "node", id });
  }, []);

  const addDeviceCenter = (type) => {
    const off = (nodes.length % 6) * 1.4;
    addDevice(type, clamp(off - 4, -14, 14), clamp(off - 4, -10, 10));
  };

  const moveNode = useCallback((id, x, z) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x, z } : n)));
  }, []);

  const selectNode = useCallback((id) => setSel({ kind: "node", id }), []);

  const portClick = (nodeId, portId) => {
    const key = `${nodeId}:${portId}`;
    if (pendingKey == null) {
      setPendingKey(key);
      return;
    }
    if (pendingKey === key) {
      setPendingKey(null);
      return;
    }
    const [a, ap] = pendingKey.split(":");
    setPendingKey(null);
    if (a === nodeId) return; // reject self-link
    const exists = links.some(
      (l) =>
        (l.a === a && l.ap === ap && l.b === nodeId && l.bp === portId) ||
        (l.a === nodeId && l.ap === portId && l.b === a && l.bp === ap)
    );
    if (exists) return; // reject duplicate
    setLinks((ls) => [
      ...ls,
      {
        id: `l${Date.now()}${Math.floor(Math.random() * 1000)}`,
        a,
        ap,
        b: nodeId,
        bp: portId,
        cable: cableType,
        _color: CABLE_MAP[cableType]?.color || "#3ea6ff",
      },
    ]);
  };

  const deleteSel = useCallback(() => {
    if (!sel) return;
    if (sel.kind === "node") {
      setNodes((ns) => ns.filter((n) => n.id !== sel.id));
      setLinks((ls) => ls.filter((l) => l.a !== sel.id && l.b !== sel.id));
    } else {
      setLinks((ls) => ls.filter((l) => l.id !== sel.id));
    }
    setSel(null);
    setPendingKey(null);
  }, [sel]);

  const loadDemo = () => {
    const t = Date.now();
    const n = (type, x, z) => ({ id: `n${t}${type}${x}${z}`, type, x, z });
    const sw = n("switch", 0, 0);
    const r = n("router", 0, 6);
    const p1 = n("pc", -6, 0);
    const p2 = n("pc", -6, 6);
    const srv = n("server", 7, 3);
    setNodes([sw, r, p1, p2, srv]);
    setLinks([
      { id: `l${t}1`, a: p1.id, ap: "eth1", b: sw.id, bp: "Gi1", cable: "user-lan", _color: CABLE_MAP["user-lan"].color },
      { id: `l${t}2`, a: p2.id, ap: "eth1", b: sw.id, bp: "Gi2", cable: "user-lan", _color: CABLE_MAP["user-lan"].color },
      { id: `l${t}3`, a: sw.id, ap: "Uplink", b: r.id, bp: "LAN1", cable: "uplink", _color: CABLE_MAP["uplink"].color },
      { id: `l${t}4`, a: r.id, ap: "LAN2", b: srv.id, bp: "eth1", cable: "server", _color: CABLE_MAP["server"].color },
    ]);
    setSel(null);
    setPendingKey(null);
    setMode("select");
  };

  const clearAll = () => {
    setNodes([]);
    setLinks([]);
    setSel(null);
    setPendingKey(null);
    setExploded(0);
    setMode("select");
  };

  const toggleFull = () => {
    const el = pageRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => setFull((v) => !v));
    } else {
      document.exitFullscreen?.();
    }
  };

  const byId = (id) => nodes.find((n) => n.id === id);
  const selectedNode = sel && sel.kind === "node" ? byId(sel.id) : null;
  const selectedLink = sel && sel.kind === "link" ? links.find((l) => l.id === sel.id) : null;
  const selectedDev = selectedNode ? DEVICE3D_MAP[selectedNode.type] : null;

  return (
    <div ref={pageRef} className={`course pt-wide${full && !document.fullscreenElement ? " pt-full" : ""}`} style={{ position: "relative" }}>
      <div className="pt-toolbar">
        <h2 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>
          อุปกรณ์เสมือนจริง 3D (WebGL) — ลากวาง หมุน ซูม ต่อสาย
        </h2>
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>
          อุปกรณ์ = {nodes.length} · สาย = {links.length}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            ความสว่าง
            <input type="range" min="0.3" max="2" step="0.05" value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))} style={{ width: 100 }} />
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", width: 34, display: "inline-block" }}>{brightness.toFixed(2)}×</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            แวดล้อม
            <input type="range" min="0.3" max="2" step="0.05" value={env}
              onChange={(e) => setEnv(Number(e.target.value))} style={{ width: 100 }} />
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", width: 34, display: "inline-block" }}>{env.toFixed(2)}×</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            หมอก
            <input type="range" min="0" max="60" step="2" value={fog}
              onChange={(e) => setFog(Number(e.target.value))} style={{ width: 100 }} />
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", width: 34, display: "inline-block" }}>{fog}</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            ขนาดอุปกรณ์
            <input type="range" min="0.5" max="2" step="0.05" value={devScale}
              onChange={(e) => setDevScale(Number(e.target.value))} style={{ width: 100 }} />
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", width: 34, display: "inline-block" }}>{devScale.toFixed(2)}×</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            สีพื้นหลัง
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 38, height: 26, padding: 0, border: "1px solid var(--border)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            สีอุปกรณ์
            <input type="color" value={devColor} onChange={(e) => setDevColor(e.target.value)} style={{ width: 38, height: 26, padding: 0, border: "1px solid var(--border)", borderRadius: 6, background: "transparent", cursor: "pointer" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            โทนสี
            <select value={toneMapping} onChange={(e) => setToneMapping(e.target.value)} style={{ fontSize: 12, padding: "4px 6px" }}>
              <option value="AgX">AgX</option>
              <option value="Neutral">Neutral</option>
              <option value="ACESFilmic">ACESFilmic</option>
              <option value="Linear">Linear</option>
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            แสง
            <input type="range" min="0.3" max="2.5" step="0.05" value={exposure}
              onChange={(e) => setExposure(Number(e.target.value))} style={{ width: 90 }} />
            <span style={{ fontFamily: "var(--mono)", color: "var(--text)", width: 34, display: "inline-block" }}>{exposure.toFixed(2)}</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            แยกชิ้นส่วน
            <input type="range" min="0" max="100" value={Math.round(exploded * 100)}
              onChange={(e) => setExploded(Number(e.target.value) / 100)} style={{ width: 120 }} />
            <button className="btn" style={{ padding: "5px 10px", fontSize: 12 }}
              onClick={() => setExploded((v) => (v > 0.5 ? 0 : 1))}>
              {exploded > 0.5 ? "ประกอบ" : "แกะ"}
            </button>
          </label>
          <button className="btn primary" onClick={loadDemo}>โหลดตัวอย่าง</button>
          <button className="btn danger" onClick={clearAll}>ล้าง</button>
          <button className="btn" onClick={toggleFull}>{full ? "ย่อ" : "เต็มจอ"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gap: 14, alignItems: "stretch" }} className="pt-grid">
        {/* palette */}
        <aside className="card pt-palette" style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
          <div className="hd">อุปกรณ์ / สายสัญญาณ</div>
          <div className="bd" style={{ padding: 10 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700, margin: "4px 0 6px" }}>
              อุปกรณ์ (ลากไปวางในฉาก)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DEVICES3D.map((d) => (
                <button
                  key={d.type}
                  className="pt-item"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", d.type);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => addDeviceCenter(d.type)}
                  title={`${d.name} — ${d.role}`}
                >
                  <span className="pt-item-ico"><DeviceIcon type={d.type} size={30} /></span>
                  <span className="pt-item-txt">
                    <b>{d.name}</b>
                    <small>{d.role}</small>
                  </span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", fontWeight: 700, margin: "14px 0 6px" }}>
              สายสัญญาณ (เลือกแล้วโหมดเชื่อมสาย)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CABLES.map((c) => (
                <button
                  key={c.type}
                  className={`pt-item${cableType === c.type && mode === "connect" ? " active" : ""}`}
                  onClick={() => {
                    setCableType(c.type);
                    setMode("connect");
                    setPendingKey(null);
                  }}
                  title={`${c.name} (${c.nameTh}) — ${c.role}`}
                >
                  <span className="pt-item-ico" style={{ color: c.color }}>
                    <CableGlyph type={c.type} />
                  </span>
                  <span className="pt-item-txt">
                    <b>{c.name}</b>
                    <small>{c.nameTh} — {c.role}</small>
                  </span>
                </button>
              ))}
            </div>
            {mode === "connect" && (
              <div className="vd-mode-hint" style={{ position: "static", transform: "none", marginTop: 10 }}>
                โหมดเชื่อมสาย: คลิกพอร์ตต้นทาง แล้วคลิกพอร์ตปลายทาง
              </div>
            )}
          </div>
        </aside>

        {/* 3D stage */}
<div
          ref={wrapRef}
          className="vd-stage-wrap pt-stage"
          style={{
            position: "relative",
            height: "100%",
            minHeight: 480,
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            background: "#0b0f14",
          }}
        >
          <DeviceScene
            nodes={nodes}
            links={links}
            exploded={exploded}
            connectMode={mode === "connect"}
            pendingKey={pendingKey}
            selectedId={sel?.id}
            onMove={moveNode}
            onSelect={selectNode}
            onPortClick={portClick}
            onCanvasTap={() => setSel(null)}
            onDropDevice={addDevice}
            brightness={brightness}
            env={env}
            fog={fog}
            bg={bg}
            devColor={devColor}
            devScale={devScale}
            toneMapping={toneMapping}
            exposure={exposure}
          />
          <div className="vd-help">
            ลากจากคู่อุปกรณ์มาวาง · ลากในฉากเพื่อย้าย · สกรอลล์เพื่อซูม · ลากพื้นหลังเพื่อหมุน
          </div>
          <div className="pt-fs-tools" style={{ position: "absolute", top: 10, left: 10, zIndex: 20, display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 10, background: "rgba(11,15,20,.92)", border: "1px solid var(--border)", boxShadow: "0 6px 20px rgba(0,0,0,.45)" }}>
            <button className="pt-fs-tools-btn" style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 7, background: "#141c26", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", transition: ".12s" }} onClick={loadDemo}> gel ตัวอย่าง</button>
            <span className="pt-fs-tools-sep" style={{ width: 1, height: "100%", background: "var(--border)", margin: "0 3px" }} />
            <button className="pt-fs-tools-btn" style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 7, background: "#141c26", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", transition: ".12s" }} onClick={clearAll}>ล้าง</button>
            <span className="pt-fs-tools-sep" style={{ width: 1, height: "100%", background: "var(--border)", margin: "0 3px" }} />
            <button className="pt-fs-tools-btn" style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 7, background: "#141c26", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", transition: ".12s" }} onClick={() => setExploded((v) => (v > 0.5 ? 0 : 1))}>{exploded > 0.5 ? "ประกอบ" : "แกะ"}</button>
            <span className="pt-fs-tools-sep" style={{ width: 1, height: "100%", background: "var(--border)", margin: "0 3px" }} />
            <button className="pt-fs-tools-btn" style={{ fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 7, background: "#141c26", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", transition: ".12s" }} onClick={toggleFull}>{full ? "ย่อ" : "เต็มจอ"}</button>
          </div>
          <div className="pt-zoombar" style={{ position: "absolute", top: 10, right: 10, zIndex: 20, display: "flex", alignItems: "center", gap: 4, background: "rgba(11,15,20,.92)", border: "1px solid var(--border)", borderRadius: 10, padding: "5px 6px", boxShadow: "0 6px 20px rgba(0,0,0,.4)" }} />
        </div>

        {/* inspector */}
        <aside className="card pt-inspector" style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}>
          <div className="hd">รายละเอียด</div>
          <div className="bd" style={{ padding: 12 }}>
            {selectedDev && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <DeviceIcon type={selectedDev.type} size={40} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{selectedDev.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{selectedDev.nameEn} · ชั้น {selectedDev.layer}</div>
                  </div>
                </div>
                <div className="pt-field"><em>หน้าที่</em><p>{selectedDev.role}</p></div>
                <div className="pt-field"><em>คำอธิบาย</em><p>{selectedDev.desc}</p></div>
                <div className="pt-field">
                  <em>พอร์ตและการเชื่อมต่อ</em>
                  {selectedDev.ports.length === 0 ? (
                    <p>ไม่มีพอร์ต</p>
                  ) : (
                    <table className="vd-port-table">
                      <thead><tr><th>พอร์ต</th><th>สถานะ</th></tr></thead>
                      <tbody>
                        {selectedDev.ports.map((p) => {
                          const linked = links.some(
                            (l) =>
                              (l.a === selectedNode.id && l.ap === p.id) ||
                              (l.b === selectedNode.id && l.bp === p.id)
                          );
                          return (
                            <tr key={p.id}>
                              <td>{p.label}</td>
                              <td><span className={`vd-led ${linked ? "on" : ""}`} />{linked ? "เชื่อมอยู่" : "ว่าง"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                <label className="vd-explode-ctl">
                  ระดับการแยกชิ้น
                  <input type="range" min="0" max="100" value={Math.round(exploded * 100)}
                    onChange={(e) => setExploded(Number(e.target.value) / 100)} />
                </label>
                <button className="btn danger pt-del" onClick={deleteSel}>ลบอุปกรณ์นี้</button>
              </>
            )}

            {selectedLink && (
              <>
                <div className="pt-insp-ico" style={{ color: CABLE_MAP[selectedLink.cable]?.color }}>
                  <CableGlyph type={selectedLink.cable} />
                </div>
                <h3>{CABLE_MAP[selectedLink.cable]?.name}</h3>
                <div className="pt-insp-en">{CABLE_MAP[selectedLink.cable]?.nameTh}</div>
                <div className="pt-field"><em>หน้าที่</em><p>{CABLE_MAP[selectedLink.cable]?.role}</p></div>
                <div className="pt-field"><em>เชื่อมระหว่าง</em>
                  <p>
                    {byId(selectedLink.a) ? DEVICE3D_MAP[byId(selectedLink.a).type].name : "?"} [{selectedLink.ap}]
                    {" ↔ "}
                    {byId(selectedLink.b) ? DEVICE3D_MAP[byId(selectedLink.b).type].name : "?"} [{selectedLink.bp}]
                  </p>
                </div>
                <button className="btn danger pt-del" onClick={deleteSel}>ลบสายนี้</button>
              </>
            )}

            {!selectedDev && !selectedLink && (
              <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", paddingTop: 30 }}>
                คลิกอุปกรณ์หรือสายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CableGlyph({ type }) {
  const line = (w, dash) => (
    <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
  );
  return (
    <svg width="30" height="20" viewBox="0 0 18 14">
      {type === "user-lan" && <>{line(2.5)}<circle cx="1" cy="7" r="2.5" fill="currentColor" /><circle cx="17" cy="7" r="2.5" fill="currentColor" /></>}
      {type === "uplink" && <>{line(3)}<circle cx="1" cy="7" r="3" fill="currentColor" /><circle cx="17" cy="7" r="3" fill="currentColor" /></>}
      {type === "mgmt" && <>{line(2.5, "4 3")}<circle cx="1" cy="7" r="2.5" fill="currentColor" /><circle cx="17" cy="7" r="2.5" fill="currentColor" /></>}
      {type === "server" && <>{line(3, "6 4")}<circle cx="1" cy="7" r="3" fill="currentColor" /><circle cx="17" cy="7" r="3" fill="currentColor" /></>}
      {type === "console" && <>{line(2, "3 3")}<circle cx="1" cy="7" r="2" fill="currentColor" /><circle cx="17" cy="7" r="2" fill="currentColor" /></>}
      {type === "wan" && <><path d="M1 7 Q9 1 17 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" /><circle cx="1" cy="7" r="2.5" fill="currentColor" /><circle cx="17" cy="7" r="2.5" fill="currentColor" /></>}
    </svg>
  );
}