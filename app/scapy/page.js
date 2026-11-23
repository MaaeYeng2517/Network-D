"use client";

import { useEffect, useRef, useState } from "react";
import LineChart from "@/components/LineChart";

const TYPES = [
  { id: "icmp", name: "ICMP (ping)" },
  { id: "tcp", name: "TCP SYN" },
  { id: "udp", name: "UDP" },
];

function buildConfig(c) {
  return {
    target: (c.target || "").trim() || "127.0.0.1",
    type: c.type || "icmp",
    count: Number(c.count) > 0 ? Number(c.count) : 4,
    interval: c.interval !== "" ? Number(c.interval) : 1,
    timeout: c.timeout !== "" ? Number(c.timeout) : 2,
    port: c.port !== "" ? Number(c.port) : 80,
    payload: c.payload || "hello",
    iface: c.iface || "",
  };
}

export default function ScapyPage() {
  const [cfg, setCfg] = useState({
    target: "", type: "icmp", count: "4", interval: "1", timeout: "2",
    port: "80", payload: "hello", iface: "",
  });
  const [interfaces, setInterfaces] = useState([]);
  const [lines, setLines] = useState([{ text: "[พร้อม] ตั้งค่าเป้าหมายแล้วกด “เริ่มส่งแพ็กเก็ต”", cls: "sys" }]);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState({ sent: null, recv: null, avg: null, min: null, max: null });
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
      const d = await (await fetch("/api/scapy/results")).json();
      if (mountedRef.current) setHistory(d.results || []);
    } catch { /* ignore */ }
  }

  function openStream(id) {
    if (evtRef.current) evtRef.current.close();
    closedRef.current = false;
    currentIdRef.current = id;
    const es = new EventSource(`/api/stream/${id}`);
    evtRef.current = es;

    es.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === "line") {
        pushLine(msg.text);
      } else if (msg.type === "data") {
        if (mountedRef.current) {
          setSeries((prev) => prev.concat({ x: msg.t, y: msg.ms }));
        }
      } else if (msg.type === "summary") {
        if (mountedRef.current) {
          setStats({ sent: msg.sent, recv: msg.recv, avg: msg.avg, min: msg.min, max: msg.max });
        }
      } else if (msg.type === "exit") {
        pushLine(`— จบการส่ง (exit code ${msg.code}) —`, msg.code === 0 ? "exit-ok" : "exit-err");
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
    const config = buildConfig(cfg);
    setRunning(true);
    setSeries([]);
    setStats({ sent: null, recv: null, avg: null, min: null, max: null });
    pushLine("$ scapy " + JSON.stringify(config), "sys");
    let res;
    try {
      res = await fetch("/api/scapy/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argv: [JSON.stringify(config)] }),
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
        await fetch("/api/scapy/stop", {
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
    await fetch("/api/scapy/results", { method: "DELETE" });
    loadHistory();
    pushLine("ล้างประวัติแล้ว", "sys");
  }

  function exportHistoryJson() {
    fetch("/api/scapy/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scapy-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as JSON`, 'sys');
      });
  }

  function exportHistoryCsv() {
    fetch("/api/scapy/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        if (data.length === 0) { pushLine('No history to export', 'sys'); return; }
        const headers = ['id', 'ts', 'mode', 'target', 'type', 'sent', 'recv', 'avg', 'min', 'max', 'points'];
        const rows = data.map(r => [r.id, r.ts, r.mode, r.target, r.type, r.sent, r.recv, r.avg, r.min, r.max, JSON.stringify(r.points || [])]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scapy-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as CSV`, 'sys');
      });
  }

  function selectHistory(rec) {
    setSeries((rec.points || []).map((p) => ({ x: p.t, y: p.ms })));
    setStats({ sent: rec.sent, recv: rec.recv, avg: rec.avg, min: rec.min, max: rec.max });
    pushLine(`ดูประวัติ: ${rec.type} ${rec.target} ${rec.ts} · ${rec.recv}/${rec.sent} ตอบ`, "sys");
  }

  useEffect(() => {
    mountedRef.current = true;
    loadInfo();
    loadHistory();
    loadInterfaces();
    return () => {
      mountedRef.current = false;
      if (evtRef.current) evtRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInfo() {
    try {
      const d = await (await fetch("/api/info")).json();
      if (mountedRef.current) setVerInfo("scapy พร้อมใช้งาน");
    } catch {
      if (mountedRef.current) setVerInfo("ไม่พบ scapy");
    }
  }
  async function loadInterfaces() {
    try {
      const d = await (await fetch("/api/tcpdump/interfaces")).json();
      if (mountedRef.current) setInterfaces(d.interfaces || []);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const c = consoleRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [lines]);

  function up(k) {
    return (e) => setCfg((c) => ({ ...c, [k]: e.target.value }));
  }

  function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
      const old = el.textContent;
      el.textContent = "คัดลอกแล้ว!";
      setTimeout(() => { el.textContent = old; }, 1200);
    });
  }

  const config = buildConfig(cfg);

  return (
    <div className="grid">
      <div className="card">
        <div className="hd">สร้างคำสั่ง Scapy</div>
        <div className="bd">
          <label className="f">ประเภทแพ็กเก็ต</label>
          <div className="chips">
            {TYPES.map((t) => (
              <div
                key={t.id}
                className={"chip" + (cfg.type === t.id ? " active" : "")}
                onClick={() => setCfg((c) => ({ ...c, type: t.id }))}
              >
                {t.name}
              </div>
            ))}
          </div>

          <label className="f">IP / Host เป้าหมาย</label>
          <input placeholder="เช่น 127.0.0.1 หรือ 8.8.8.8" value={cfg.target} onChange={up("target")} />

          {(cfg.type === "tcp" || cfg.type === "udp") && (
            <>
              <label className="f">พอร์ตเป้าหมาย</label>
              <input type="number" value={cfg.port} onChange={up("port")} min="1" max="65535" />
            </>
          )}

          {cfg.type === "udp" && (
            <>
              <label className="f">Payload (ข้อความ)</label>
              <input value={cfg.payload} onChange={up("payload")} />
            </>
          )}

          <div className="row">
            <div>
              <label className="f">จำนวนแพ็กเก็ต</label>
              <input type="number" value={cfg.count} onChange={up("count")} min="1" />
            </div>
            <div>
              <label className="f">ระยะห่าง (วินาที)</label>
              <input type="number" value={cfg.interval} onChange={up("interval")} min="0" step="0.1" />
            </div>
          </div>

          <div className="row">
            <div>
              <label className="f">Timeout (วินาที)</label>
              <input type="number" value={cfg.timeout} onChange={up("timeout")} min="0.1" step="0.1" />
            </div>
            <div>
              <label className="f">อินเทอร์เฟซ (ถ้ามี)</label>
              <select value={cfg.iface} onChange={up("iface")}>
                <option value="">(อัตโนมัติ)</option>
                {interfaces.map((i) => (
                  <option key={i.num} value={i.name}>{i.num}. {i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="hint">Scapy ส่งแพ็กเก็ตแบบ raw socket — บางเครื่อง/บางปลายทางอาจต้องสิทธิ์ root</div>

          <label className="f">ตัวอย่างคำสั่ง (คัดลอกได้)</label>
          <div className="cmd-preview">
            <span className="txt">python3 scripts/scapy_runner.py &apos;{JSON.stringify(config)}&apos;</span>
            <button className="copy" onClick={(e) => copyText(`python3 scripts/scapy_runner.py '${JSON.stringify(config)}'`, e.target)}>
              คัดลอก
            </button>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={run} disabled={running}>▶ เริ่มส่งแพ็กเก็ต</button>
            <button className={"btn danger" + (running ? "" : " hidden")} onClick={stop}>■ หยุด</button>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="card">
          <div className="hd">
            กราฟ latency ต่อแพ็กเก็ต (ms)
            <span className="spacer" />
            <span style={{ fontFamily: "var(--mono)", textTransform: "none", color: "var(--muted)" }}>
              {running ? "live" : ""}
            </span>
          </div>
          <div className="chart-stats">
            <div className="stat">
              <div className="k">ส่ง / ตอบ</div>
              <div className="v big">{stats.sent != null ? `${stats.recv}/${stats.sent}` : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">เฉลี่ย</div>
              <div className="v">{stats.avg != null && stats.recv > 0 ? stats.avg.toFixed(1) + " ms" : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">ต่ำสุด</div>
              <div className="v">{stats.recv > 0 ? stats.min.toFixed(1) + " ms" : "—"}</div>
            </div>
            <div className="stat">
              <div className="k">สูงสุด</div>
              <div className="v">{stats.recv > 0 ? stats.max.toFixed(1) + " ms" : "—"}</div>
            </div>
          </div>
          <div className="chart-wrap">
            <LineChart series={series} unit="ms" emptyText="ไม่มีข้อมูล — เริ่มส่งเพื่อแสดงกราฟ" />
          </div>
        </div>

        <div className="card">
          <div className="hd">
            ผลลัพธ์ (Live)
            <span className="spacer" />
            <button className="copy" onClick={() => setLines([])}>ล้างคอนโซล</button>
            <button className="copy" onClick={(e) => copyText(lines.map((l) => l.text).join("\n"), e.target)}>
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
            ประวัติการส่งแพ็กเก็ต
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
                  <b>{r.type}</b> {r.target} · ตอบ {r.recv}/{r.sent}
                </span>
                <span className="rate">{r.recv > 0 ? r.avg.toFixed(1) + " ms" : "—"}</span>
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