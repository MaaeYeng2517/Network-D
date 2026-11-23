"use client";

import { useEffect, useRef, useState } from "react";
import LineChart from "@/components/LineChart";

const PRESETS = [
  { id: "tcp", name: "TCP Throughput", role: "client", proto: "tcp" },
  { id: "udp", name: "UDP Bandwidth", role: "client", proto: "udp" },
  { id: "rev", name: "Reverse (ดาวน์โหลด)", role: "client", proto: "tcp", reverse: true },
  { id: "multi", name: "Multi-stream (4)", role: "client", proto: "tcp", streams: "4" },
  { id: "bidi", name: "Two-way --bidir", role: "client", proto: "tcp", bidir: true },
  { id: "server", name: "Start Server", role: "server" },
];

function buildArgv(c) {
  if (c.role === "server") {
    const argv = ["-s", "-p", String(c.port || "5201")];
    const ex = (c.serverExtra || "").trim();
    if (ex) argv.push(...ex.split(/\s+/).filter(Boolean));
    return argv;
  }
  const host = (c.host || "").trim();
  if (!host) return null;
  const argv = ["-c", host, "-p", String(c.port || "5201"), "-t", String(c.time || "10")];
  if (c.proto === "udp") argv.push("-u", "-b", c.bandwidth || "10M");
  if (Number(c.streams) > 1) argv.push("-P", String(c.streams));
  const omit = c.omit;
  if (omit && Number(omit) > 0) argv.push("-O", String(omit));
  if (c.reverse) argv.push("-R");
  if (c.json) argv.push("-J");
  if (c.v6) argv.push("-6");
  if (c.bidir) argv.push("--bidir");
  if (c.oneline) argv.push("-1");
  if (c.dash) argv.push("-V");
  const ex = (c.extra || "").trim();
  if (ex) argv.push(...ex.split(/\s+/).filter(Boolean));
  return argv;
}

const EMPTY_STATS = { cur: null, avg: null, totalMB: null, dur: null };

export default function Page() {
  const [cfg, setCfg] = useState({
    role: "client", host: "", port: "5201", proto: "tcp", time: "10", streams: "1",
    bandwidth: "10M", omit: "1", reverse: false, json: false, v6: false, bidir: false,
    oneline: false, dash: false, extra: "", serverExtra: "",
  });
  const [preset, setPreset] = useState("tcp");
  const [lines, setLines] = useState([{ text: "[พร้อม] สร้างคำสั่งแล้วกด “รันคำสั่ง”", cls: "sys" }]);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState({ text: "พร้อมใช้งาน", kind: "" });
  const [history, setHistory] = useState([]);
  const [verInfo, setVerInfo] = useState("เชื่อมต่อ…");

  const evtRef = useRef(null);
  const currentIdRef = useRef(null);
  const closedRef = useRef(false);
  const mountedRef = useRef(true);
  const consoleRef = useRef(null);

  function pushLine(text, cls) {
    if (!mountedRef.current) return;
    setLines((prev) => {
      const next = prev.concat({ text, cls });
      return next.length > 2000 ? next.slice(next.length - 2000) : next;
    });
  }

  async function loadHistory() {
    try {
      const d = await (await fetch("/api/iperf/results")).json();
      if (mountedRef.current) setHistory(d.results || []);
    } catch { /* ignore */ }
  }

  function openStream(id) {
    if (evtRef.current) evtRef.current.close();
    closedRef.current = false;
    currentIdRef.current = id;
    const es = new EventSource(`/api/stream/${id}`);
    evtRef.current = es;
    let summary = null;

    es.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === "line") {
        pushLine(msg.text);
      } else if (msg.type === "data") {
        if (mountedRef.current) {
          setSeries((prev) => prev.concat({ x: msg.t, y: msg.mbps }));
          setStats((s) => ({ ...s, cur: msg.mbps }));
        }
      } else if (msg.type === "summary") {
        summary = msg;
        if (mountedRef.current) {
          setStats((s) => ({ ...s, avg: msg.mbps, totalMB: msg.totalMB, dur: msg.end }));
        }
      } else if (msg.type === "exit") {
        pushLine(`— จบการรัน (exit code ${msg.code}) —`, msg.code === 0 ? "exit-ok" : "exit-err");
        if (!mountedRef.current) return;
        setRunning(false);
        setStatus({ text: "พร้อมใช้งาน", kind: msg.code === 0 ? "" : "err" });
        es.close();
        evtRef.current = null;
        closedRef.current = true;
        loadHistory();
      }
    };
    es.onerror = () => {
      if (closedRef.current) return;
      es.close();
      evtRef.current = null;
      closedRef.current = true;
      if (!mountedRef.current) return;
      setRunning(false);
      setStatus({ text: "พร้อมใช้งาน", kind: "" });
      loadHistory();
    };
  }

  async function run() {
    const argv = buildArgv(cfg);
    if (!argv) {
      pushLine("⚠ กรุณากรอก IP/Host เป้าหมาย", "exit-err");
      return;
    }
    setRunning(true);
    setSeries([]);
    setStats(EMPTY_STATS);
    pushLine("$ iperf3 " + argv.join(" "), "sys");
    let res;
    try {
      res = await fetch("/api/iperf/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argv }),
      });
    } catch (e) {
      pushLine("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: " + e, "exit-err");
      setRunning(false);
      return;
    }
    const data = await res.json();
    if (!data.id) {
      pushLine("เกิดข้อผิดพลาด: " + (data.error || "unknown"), "exit-err");
      setRunning(false);
      return;
    }
    openStream(data.id);
  }

  async function stop() {
    const id = currentIdRef.current;
    if (id) {
      try {
        await fetch("/api/iperf/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch { /* ignore */ }
    }
    if (evtRef.current) {
      evtRef.current.close();
      evtRef.current = null;
    }
    closedRef.current = true;
    currentIdRef.current = null;
    pushLine("■ หยุดโดยผู้ใช้", "sys");
    setRunning(false);
    setStatus({ text: "พร้อมใช้งาน", kind: "" });
  }

  async function clearHistory() {
    await fetch("/api/iperf/results", { method: "DELETE" });
    loadHistory();
    pushLine("ล้างประวัติแล้ว", "sys");
  }

  function exportHistoryJson() {
    fetch("/api/iperf/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iperf-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as JSON`, 'sys');
      });
  }

  function exportHistoryCsv() {
    fetch("/api/iperf/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        if (data.length === 0) {
          pushLine('No history to export', 'sys');
          return;
        }
        const headers = ['id', 'ts', 'role', 'proto', 'host', 'duration', 'totalMB', 'avgMbps', 'intervals'];
        const rows = data.map(r => [
          r.id, r.ts, r.role, r.proto, r.host || '', r.duration, r.totalMB, r.avgMbps,
          JSON.stringify(r.intervals || [])
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iperf-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as CSV`, 'sys');
      });
  }

  function selectHistory(rec) {
    setSeries((rec.intervals || []).map((p) => ({ x: p.t, y: p.mbps })));
    setStats({ cur: null, avg: rec.avgMbps, totalMB: rec.totalMB, dur: rec.duration });
    pushLine(`ดูประวัติ: ${(rec.proto || "").toUpperCase()} ${rec.host || ""} ${rec.ts}`, "sys");
  }

  useEffect(() => {
    mountedRef.current = true;
    loadInfo();
    loadHistory();
    return () => {
      mountedRef.current = false;
      if (evtRef.current) evtRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInfo() {
    try {
      const d = await (await fetch("/api/info")).json();
      if (mountedRef.current) setVerInfo(d.version || d.iperf);
    } catch {
      if (mountedRef.current) setVerInfo("ไม่พบ iperf3");
    }
  }

  useEffect(() => {
    const c = consoleRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [lines]);

  function up(k) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setCfg((c) => ({ ...c, [k]: v }));
      setPreset("");
    };
  }

  function applyPreset(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setCfg((c) => {
      const n = { ...c, role: p.role, reverse: !!p.reverse, bidir: !!p.bidir, json: false };
      if (id === "server") {
        // keep other fields
      } else {
        n.proto = p.proto || "tcp";
      }
      if (p.streams) n.streams = String(p.streams);
      return n;
    });
  }

  function setRole(role) {
    setCfg((c) => ({ ...c, role }));
    setPreset("");
  }

  function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
      const old = el.textContent;
      el.textContent = "คัดลอกแล้ว!";
      setTimeout(() => { el.textContent = old; }, 1200);
    });
  }

  const argvPreview = buildArgv(cfg);
  const isServer = cfg.role === "server";
  const showUdp = !isServer && cfg.proto === "udp";

  return (
    <div className="grid">
      {/* builder */}
      <div className="card">
        <div className="hd">สร้างคำสั่ง iPerf3</div>
        <div className="bd">
          <label className="f">โหมดการทำงาน</label>
          <div className="seg">
            <button className={cfg.role === "client" ? "active" : ""} onClick={() => setRole("client")}>
              Client (ทดสอบ)
            </button>
            <button className={cfg.role === "server" ? "active" : ""} onClick={() => setRole("server")}>
              Server (รับสัญญาณ)
            </button>
          </div>

          <label className="f">เลือกเทมเพลตคำสั่ง</label>
          <div className="chips">
            {PRESETS.map((p) => (
              <div
                key={p.id}
                className={"chip" + (preset === p.id ? " active" : "")}
                onClick={() => applyPreset(p.id)}
              >
                {p.name}
              </div>
            ))}
          </div>

          {!isServer && (
            <>
              <label className="f">IP / Host เป้าหมาย</label>
              <input
                placeholder="เช่น 192.168.1.10 หรือ example.com"
                value={cfg.host}
                onChange={up("host")}
              />
            </>
          )}

          <div className="row">
            <div>
              <label className="f">พอร์ต (-p)</label>
              <input type="number" value={cfg.port} onChange={up("port")} min="1" max="65535" />
            </div>
            {!isServer && (
              <div>
                <label className="f">โปรโตคอล</label>
                <select value={cfg.proto} onChange={up("proto")}>
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                </select>
              </div>
            )}
          </div>

          {!isServer && (
            <div>
              <div className="row">
                <div>
                  <label className="f">ระยะเวลา -t (วินาที)</label>
                  <input type="number" value={cfg.time} onChange={up("time")} min="1" />
                </div>
                <div>
                  <label className="f">จำนวนสตรีม -P</label>
                  <input type="number" value={cfg.streams} onChange={up("streams")} min="1" max="128" />
                </div>
              </div>

              {showUdp && (
                <>
                  <label className="f">แบนด์วิดท์ -b (เช่น 10M, 100m, 1G)</label>
                  <input value={cfg.bandwidth} onChange={up("bandwidth")} />
                </>
              )}

              <label className="f">ข้ามช่วงอุ่นเครื่อง -O (วินาที)</label>
              <input type="number" value={cfg.omit} onChange={up("omit")} min="0" />

              <label className="f">ตัวเลือกเพิ่มเติม</label>
              <div className="opts">
                <label><input type="checkbox" checked={cfg.reverse} onChange={up("reverse")} /> ทวนทิศ -R (ดาวน์โหลด)</label>
                <label><input type="checkbox" checked={cfg.json} onChange={up("json")} /> ผลลัพธ์ JSON -J</label>
                <label><input type="checkbox" checked={cfg.v6} onChange={up("v6")} /> ใช้ IPv6 -6</label>
                <label><input type="checkbox" checked={cfg.bidir} onChange={up("bidir")} /> ทวน 2 ทิศ --bidir</label>
                <label><input type="checkbox" checked={cfg.oneline} onChange={up("oneline")} /> บรรทัดเดียว -1</label>
                <label><input type="checkbox" checked={cfg.dash} onChange={up("dash")} /> แสดงสี/ความคืบหน้า -V</label>
              </div>
              {cfg.json && (
                <div className="hint">* เปิด -J จะไม่แสดงกราฟ (คำสั่งจะแสดงผล JSON ตอนจบเท่านั้น)</div>
              )}

              <label className="f">พารามิเตอร์เพิ่มเติม (เสริม)</label>
              <input placeholder="เช่น -w 2M --cport 5300" value={cfg.extra} onChange={up("extra")} />
            </div>
          )}

          {isServer && (
            <div>
              <label className="f">ตัวเลือกเพิ่มเติม (เสริม)</label>
              <input placeholder="เช่น -1 (จบเมื่อรับการเชื่อมต่อครบ)" value={cfg.serverExtra} onChange={up("serverExtra")} />
              <div className="hint">โหมด Server จะรันจน่งด และแสดงผลสดของแต่ละการเชื่อมต่อ</div>
            </div>
          )}

          <label className="f">ตัวอย่างคำสั่ง (คัดลอกได้)</label>
          <div className="cmd-preview">
            <span className="txt">{argvPreview ? "iperf3 " + argvPreview.join(" ") : "iperf3 -c <IP เป้าหมาย> …"}</span>
            <button className="copy" onClick={(e) => copyText(argvPreview ? "iperf3 " + argvPreview.join(" ") : "iperf3", e.target)}>
              คัดลอก
            </button>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={run} disabled={running}>▶ รันคำสั่ง</button>
            {!running && currentIdRef.current === null && null}
            <button className={"btn danger" + (running ? "" : " hidden")} onClick={stop}>■ หยุด</button>
          </div>
        </div>
      </div>

      {/* right column */}
      <div className="right">
        <div className="card">
          <div className="hd">
            กราฟความเร็วแบบเรียลไทม์
            <span className="spacer" />
            <span style={{ fontFamily: "var(--mono)", textTransform: "none", color: "var(--muted)" }}>
              {running ? "live" : ""}
            </span>
          </div>
          <div className="chart-stats">
            <div className="stat">
              <div className="k">อัตราปัจจุบัน</div>
              <div className="v big">{stats.cur != null ? fmtRate(stats.cur) : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">เฉลี่ย</div>
              <div className="v">{stats.avg != null ? fmtRate(stats.avg) : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">ถ่ายโอนรวม</div>
              <div className="v">{stats.totalMB != null ? fmtMB(stats.totalMB) : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">ระยะเวลา</div>
              <div className="v">{stats.dur != null ? stats.dur + " วินาที" : "—"}</div>
            </div>
          </div>
          <div className="chart-wrap">
            <LineChart series={series} unit="rate" emptyText="ไม่มีข้อมูล — เริ่มรันเพื่อแสดงกราฟ" />
          </div>
        </div>

        <div className="card">
          <div className="hd">
            ผลลัพธ์ (Live)
            <span className="spacer" />
            <button className="copy" onClick={() => setLines([])}>ล้างคอนโซล</button>
            <button
              className="copy"
              onClick={(e) => copyText(lines.map((l) => l.text).join("\n"), e.target)}
            >
              คัดลอกผลลัพธ์
            </button>
          </div>
          <div className="console" ref={consoleRef}>
            {lines.map((l, i) => (
              <div key={i} className={"l" + (l.cls ? " " + l.cls : "")}>{l.text}</div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="hd">
            ประวัติการทดสอบ
            <span className="spacer" />
            <button className="copy" onClick={exportHistoryJson}>Export JSON</button>
            <button className="copy" onClick={exportHistoryCsv}>Export CSV</button>
            <button className="copy" onClick={clearHistory}>ล้างประวัติ</button>
          </div>
          <div className="hist">
            {history.length === 0 && <div className="empty">ยังไม่มีประวัติ — ผลลัพธ์ที่จบแล้วจะถูกเก็บไว้ที่นี่</div>}
            {history.slice().reverse().map((r) => (
              <div key={r.id} className="item" onClick={() => selectHistory(r)}>
                <span className="t">{r.ts.replace("T", " ")}</span>
                <span className="m">
                  <b>{(r.proto || "").toUpperCase()}</b> {r.host || "(server)"} · {r.duration}s · {r.intervals.length} ช่วง
                </span>
                <span className="rate">{fmtRate(r.avgMbps)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace-status">
        <span className={"dot" + (status.kind ? " " + status.kind : "")} />
        <span style={{ color: "var(--muted)" }}>{status.text}</span>
        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>· {verInfo}</span>
      </div>
    </div>
  );
}

function fmtRate(mbps) {
  if (mbps >= 1000) return (mbps / 1000).toFixed(2) + " Gbps";
  if (mbps >= 1) return mbps.toFixed(2) + " Mbps";
  return (mbps * 1000).toFixed(0) + " Kbps";
}
function fmtMB(mb) {
  return mb >= 1000 ? (mb / 1000).toFixed(2) + " GB" : mb.toFixed(1) + " MB";
}