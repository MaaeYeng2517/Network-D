"use client";

import { useEffect, useRef, useState } from "react";
import LineChart from "@/components/LineChart";

function buildArgv(c) {
  const argv = [];
  if (c.maxHops) argv.push("-m", String(c.maxHops));
  if (c.queries) argv.push("-q", String(c.queries));
  if (c.wait) argv.push("-w", String(c.wait));
  if (c.icmp) argv.push("-I");
  if (c.tcp) { argv.push("-T", "-p", String(c.port || "80")); }
  argv.push((c.target || "").trim());
  return argv.filter((a) => a !== "");
}

export default function TraceroutePage() {
  const [cfg, setCfg] = useState({
    target: "", maxHops: "30", queries: "1", wait: "1",
    icmp: false, tcp: false, port: "80",
  });
  const [lines, setLines] = useState([{ text: "[พร้อม] ใส่เป้าหมายแล้วกด “เริ่ม traceroute”", cls: "sys" }]);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState({ hops: null, last: null, lost: 0 });
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState({ text: "พร้อมใช้งาน", kind: "" });
  const [history, setHistory] = useState([]);
  const [info, setInfo] = useState("เชื่อมต่อ…");

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
      const d = await (await fetch("/api/traceroute/results")).json();
      if (mountedRef.current) setHistory(d.results || []);
    } catch { /* ignore */ }
  }

  function openStream(id) {
    if (evtRef.current) evtRef.current.close();
    closedRef.current = false;
    currentIdRef.current = id;
    const es = new EventSource(`/api/stream/${id}`);
    evtRef.current = es;
    let hopCount = 0;
    let last = null;
    let lost = 0;

    es.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === "line") {
        pushLine(msg.text);
      } else if (msg.type === "data") {
        hopCount += 1;
        last = msg.ms;
        if (msg.ms == null) lost += 1;
        if (mountedRef.current) {
          setSeries((prev) => prev.concat({ x: msg.t, y: msg.ms == null ? 0 : msg.ms }));
          setStats({ hops: hopCount, last: msg.ms, lost });
        }
      } else if (msg.type === "exit") {
        pushLine(`— จบ traceroute (exit code ${msg.code}) —`, msg.code === 0 ? "exit-ok" : "exit-err");
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
    if (!(cfg.target || "").trim()) {
      pushLine("⚠ กรุณากรอกเป้าหมาย", "exit-err");
      return;
    }
    const argv = buildArgv(cfg);
    setRunning(true);
    setSeries([]);
    setStats({ hops: 0, last: null, lost: 0 });
    pushLine("$ traceroute " + argv.join(" "), "sys");
    let res;
    try {
      res = await fetch("/api/traceroute/start", {
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
        await fetch("/api/traceroute/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch { /* ignore */ }
    }
    if (evtRef.current) { evtRef.current.close(); evtRef.current = null; }
    closedRef.current = true;
    currentIdRef.current = null;
    pushLine("■ หยุดโดยผู้ใช้", "sys");
    setRunning(false);
    setStatus({ text: "พร้อมใช้งาน", kind: "" });
  }

  async function clearHistory() {
    await fetch("/api/traceroute/results", { method: "DELETE" });
    loadHistory();
    pushLine("ล้างประวัติแล้ว", "sys");
  }

  function exportHistoryJson() {
    fetch("/api/traceroute/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traceroute-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as JSON`, 'sys');
      });
  }

  function exportHistoryCsv() {
    fetch("/api/traceroute/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        if (data.length === 0) { pushLine('No history to export', 'sys'); return; }
        const headers = ['id', 'ts', 'mode', 'target', 'hops'];
        const rows = data.map(r => [r.id, r.ts, r.mode, r.target, JSON.stringify(r.hops || [])]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traceroute-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as CSV`, 'sys');
      });
  }

  function selectHistory(rec) {
    const hops = rec.hops || [];
    setSeries(hops.filter((h) => h.probes > 0).map((h) => ({ x: h.hop, y: h.avg })));
    setStats({ hops: hops.length, last: hops.length ? hops[hops.length - 1].avg : null, lost: hops.filter((h) => h.probes === 0).length });
    pushLine(`ดูประวัติ: ${rec.target} ${rec.ts}`, "sys");
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
      if (mountedRef.current) setInfo("traceroute พร้อมใช้งาน");
    } catch {
      if (mountedRef.current) setInfo("ไม่พบ traceroute");
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
    };
  }

  function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
      const old = el.textContent;
      el.textContent = "คัดลอกแล้ว!";
      setTimeout(() => { el.textContent = old; }, 1200);
    });
  }

  const argvPreview = buildArgv(cfg);

  return (
    <div className="grid">
      <div className="card">
        <div className="hd">สร้างคำสั่ง traceroute</div>
        <div className="bd">
          <label className="f">เป้าหมาย (Host / IP)</label>
          <input placeholder="เช่น 8.8.8.8 หรือ example.com" value={cfg.target} onChange={up("target")} />

          <div className="row">
            <div>
              <label className="f">Hop สูงสุด -m</label>
              <input type="number" value={cfg.maxHops} onChange={up("maxHops")} min="1" max="64" />
            </div>
            <div>
              <label className="f">จำนวน probe ต่อ hop -q</label>
              <input type="number" value={cfg.queries} onChange={up("queries")} min="1" max="10" />
            </div>
          </div>

          <div className="row">
            <div>
              <label className="f">รอ (วินาที) -w</label>
              <input type="number" value={cfg.wait} onChange={up("wait")} min="1" max="10" />
            </div>
            <div>
              <label className="f">พอร์ต (โหมด TCP)</label>
              <input type="number" value={cfg.port} onChange={up("port")} min="1" max="65535" disabled={!cfg.tcp} />
            </div>
          </div>

          <label className="f">ตัวเลือก</label>
          <div className="opts">
            <label><input type="checkbox" checked={cfg.icmp} onChange={up("icmp")} /> ใช้ ICMP (-I)</label>
            <label><input type="checkbox" checked={cfg.tcp} onChange={up("tcp")} /> ใช้ TCP (-T)</label>
          </div>
          <div className="hint">ถ้าไม่เลือกจะใช้ UDP (ค่าเริ่มต้นของ traceroute)</div>

          <label className="f">ตัวอย่างคำสั่ง (คัดลอกได้)</label>
          <div className="cmd-preview">
            <span className="txt">traceroute {argvPreview.join(" ")}</span>
            <button className="copy" onClick={(e) => copyText("traceroute " + argvPreview.join(" "), e.target)}>
              คัดลอก
            </button>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={run} disabled={running}>▶ เริ่ม traceroute</button>
            <button className={"btn danger" + (running ? "" : " hidden")} onClick={stop}>■ หยุด</button>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="card">
          <div className="hd">
            กราฟ RTT ต่อ hop (ms)
            <span className="spacer" />
            <span style={{ fontFamily: "var(--mono)", textTransform: "none", color: "var(--muted)" }}>
              {running ? "live" : ""}
            </span>
          </div>
          <div className="chart-stats">
            <div className="stat"><div className="k">Hop ที่พบ</div><div className="v big">{stats.hops ?? "—"}</div></div>
            <div className="stat"><div className="k">RTT ล่าสุด</div><div className="v">{stats.last != null ? stats.last.toFixed(1) + " ms" : "—"}</div></div>
            <div className="stat"><div className="k">ไม่ตอบ (timeout)</div><div className="v">{stats.lost}</div></div>
          </div>
          <div className="chart-wrap">
            <LineChart series={series} unit="ms" emptyText="ไม่มีข้อมูล — เริ่ม traceroute เพื่อแสดงกราฟ" />
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
            ประวัติ traceroute
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
                <span className="m"><b>{r.target}</b> · {(r.hops || []).length} hop</span>
                <span className="rate">{r.hops && r.hops.length ? r.hops[r.hops.length - 1].avg.toFixed(1) + " ms" : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace-status">
        <span className={"dot" + (status.kind ? " " + status.kind : "")} />
        <span style={{ color: "var(--muted)" }}>{status.text}</span>
        <span style={{ color: "var(--muted)", fontFamily: "var(--mono)" }}>· {info}</span>
      </div>
    </div>
  );
}