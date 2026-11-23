"use client";

import { useEffect, useRef, useState } from "react";
import LineChart from "@/components/LineChart";

function buildArgv(c) {
  const argv = [];
  if (c.iface) argv.push("-i", c.iface);
  if (c.noResolve) argv.push("-n");
  if ((c.captureFilter || "").trim()) argv.push("-f", c.captureFilter.trim());
  if ((c.displayFilter || "").trim()) argv.push("-Y", c.displayFilter.trim());
  if (c.count && Number(c.count) > 0) argv.push("-c", String(c.count));
  return argv;
}

export default function TsharkPage() {
  const [cfg, setCfg] = useState({
    iface: "", captureFilter: "", displayFilter: "", count: "", noResolve: true,
  });
  const [interfaces, setInterfaces] = useState([]);
  const [lines, setLines] = useState([{ text: "[พร้อม] ตั้งค่าแล้วกด “เริ่มแคปเจอร์”", cls: "sys" }]);
  const [series, setSeries] = useState([]);
  const [stats, setStats] = useState({ pps: null, packets: null, dur: null });
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
      return next.length > 3000 ? next.slice(next.length - 3000) : next;
    });
  }

  async function loadHistory() {
    try {
      const d = await (await fetch("/api/tshark/results")).json();
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
          setSeries((prev) => prev.concat({ x: prev.length + 1, y: msg.pps }));
          setStats({ pps: msg.pps, packets: msg.packets, dur: null });
        }
      } else if (msg.type === "exit") {
        pushLine(`— จบการแคปเจอร์ (exit code ${msg.code}) —`, msg.code === 0 ? "exit-ok" : "exit-err");
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
    setRunning(true);
    setSeries([]);
    setStats({ pps: null, packets: null, dur: null });
    pushLine("$ tshark " + argv.join(" "), "sys");
    let res;
    try {
      res = await fetch("/api/tshark/start", {
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
        await fetch("/api/tshark/stop", {
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
    await fetch("/api/tshark/results", { method: "DELETE" });
    loadHistory();
    pushLine("ล้างประวัติแล้ว", "sys");
  }

  function exportHistoryJson() {
    fetch("/api/tshark/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tshark-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as JSON`, 'sys');
      });
  }

  function exportHistoryCsv() {
    fetch("/api/tshark/results")
      .then(r => r.json())
      .then(d => {
        const data = d.results || [];
        if (data.length === 0) { pushLine('No history to export', 'sys'); return; }
        const headers = ['id', 'ts', 'mode', 'interface', 'packets', 'pps_series'];
        const rows = data.map(r => [r.id, r.ts, r.mode, r.interface, r.packets, JSON.stringify(r.pps_series || [])]);
        const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tshark-history-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        pushLine(`Exported ${data.length} records as CSV`, 'sys');
      });
  }

  function selectHistory(rec) {
    setSeries((rec.pps_series || []).map((v, i) => ({ x: i + 1, y: v })));
    setStats({ pps: null, packets: rec.packets, dur: (rec.pps_series || []).length });
    pushLine(`ดูประวัติ: ${rec.interface} ${rec.ts} · ${rec.packets} แพ็กเก็ต`, "sys");
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
      await (await fetch("/api/info")).json();
      if (mountedRef.current) setInfo("tshark พร้อมใช้งาน");
    } catch {
      if (mountedRef.current) setInfo("ไม่พบ tshark");
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
        <div className="hd">สร้างคำสั่ง TShark</div>
        <div className="bd">
          <label className="f">อินเทอร์เฟซ (-i)</label>
          <select value={cfg.iface} onChange={up("iface")}>
            <option value="">(ค่าเริ่มต้นของระบบ)</option>
            {interfaces.map((i) => (
              <option key={i.num} value={i.name}>{i.num}. {i.name} — {i.status}</option>
            ))}
          </select>

          <label className="f">ตัวกรองจับภาพ (capture filter -f, BPF)</label>
          <input placeholder="เช่น tcp port 80, host 1.2.3.4, icmp" value={cfg.captureFilter} onChange={up("captureFilter")} />

          <label className="f">ตัวกรองการแสดงผล (display filter -Y)</label>
          <input placeholder="เช่น http, tcp.flags.syn==1, ip.addr==1.2.3.4" value={cfg.displayFilter} onChange={up("displayFilter")} />

          <label className="f">จำนวนแพ็กเก็ต -c (เว้นว่าง = ไม่จำกัด)</label>
          <input type="number" value={cfg.count} onChange={up("count")} min="1" placeholder="ไม่จำกัด" />

          <label className="f">ตัวเลือก</label>
          <div className="opts">
            <label><input type="checkbox" checked={cfg.noResolve} onChange={up("noResolve")} /> -n (ไม่แปลง DNS/พอร์ต)</label>
          </div>
          <div className="hint">ระบบจะเติม -l เพื่อให้ข้อมูลไหลสดทันที · การจับภาพต้องมีสิทธิ์ (dumpcap)</div>

          <label className="f">ตัวอย่างคำสั่ง (คัดลอกได้)</label>
          <div className="cmd-preview">
            <span className="txt">tshark {argvPreview.join(" ")}</span>
            <button className="copy" onClick={(e) => copyText("tshark " + argvPreview.join(" "), e.target)}>
              คัดลอก
            </button>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={run} disabled={running}>▶ เริ่มแคปเจอร์</button>
            <button className={"btn danger" + (running ? "" : " hidden")} onClick={stop}>■ หยุด</button>
          </div>
        </div>
      </div>

      <div className="right">
        <div className="card">
          <div className="hd">
            กราฟแพ็กเก็ตต่อวินาที (pps)
            <span className="spacer" />
            <span style={{ fontFamily: "var(--mono)", textTransform: "none", color: "var(--muted)" }}>
              {running ? "live" : ""}
            </span>
          </div>
          <div className="chart-stats">
            <div className="stat"><div className="k">แพ็กเก็ต/วินาที</div><div className="v big">{stats.pps != null ? String(stats.pps) : "—"}</div></div>
            <div className="stat"><div className="k">แพ็กเก็ตรวม</div><div className="v">{stats.packets != null ? String(stats.packets) : "—"}</div></div>
            <div className="stat"><div className="k">ระยะเวลา</div><div className="v">{series.length ? series.length + " วินาที" : (stats.dur ? stats.dur + " วินาที" : "—")}</div></div>
          </div>
          <div className="chart-wrap">
            <LineChart series={series} unit="pps" emptyText="ไม่มีข้อมูล — เริ่มแคปเจอร์เพื่อแสดงกราฟ" />
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
            ประวัติการแคปเจอร์
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
                <span className="m"><b>{r.interface}</b> · {r.packets} แพ็กเก็ต · {(r.pps_series || []).length} วินาที</span>
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