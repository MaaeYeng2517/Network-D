"use client";

import { useEffect, useRef, useState } from "react";
import LineChart from "@/components/LineChart";

const DEFAULT_PORTS = "22,25,53,80,110,143,443,3306,3389,5432,6379,8080,27017";

function Collapsible({ title, children, defaultOpen = true }) {
  return (
    <details className="details-section collapsible-section" defaultOpen={defaultOpen}>
      <summary>{title}</summary>
      <div style={{ padding: 16 }}>{children}</div>
    </details>
  );
}

export default function Page() {
  const mountedRef = useRef(true);
  const consoleRef = useRef(null);
  const [cfg, setCfg] = useState({
    target: "127.0.0.1",
    ports: DEFAULT_PORTS,
    timeoutMs: "1500",
    concurrency: "100",
    rounds: "3",
  });
  const [svcPort, setSvcPort] = useState("8080");
  const [scanResult, setScanResult] = useState(null);
  const [graphPort, setGraphPort] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState({ text: "พร้อมใช้งาน", kind: "" });
  const [lines, setLines] = useState([
    { text: "[พร้อม] เลือกพอร์ต แล้วกด “สแกนพอร์ต”", cls: "sys" },
  ]);

  const COMMON_PORT_CHOICES = [
    { label: "21 – FTP", value: "21" },
    { label: "22 – SSH", value: "22" },
    { label: "23 – Telnet", value: "23" },
    { label: "25 – SMTP", value: "25" },
    { label: "53 – DNS", value: "53" },
    { label: "80 – HTTP", value: "80" },
    { label: "110 – POP3", value: "110" },
    { label: "143 – IMAP", value: "143" },
    { label: "443 – HTTPS", value: "443" },
    { label: "3306 – MySQL", value: "3306" },
    { label: "3389 – RDP", value: "3389" },
    { label: "5432 – PostgreSQL", value: "5432" },
    { label: "6379 – Redis", value: "6379" },
    { label: "8080 – HTTP Alt", value: "8080" },
    { label: "27017 – MongoDB", value: "27017" },
  ];

  const [selectedPorts, setSelectedPorts] = useState(new Set(COMMON_PORT_CHOICES.map((c) => c.value)));
  const [customPorts, setCustomPorts] = useState("");
  const [portDropdownOpen, setPortDropdownOpen] = useState(false);

  function togglePort(port) {
    setSelectedPorts((prev) => {
      const next = new Set(prev);
      if (next.has(port)) next.delete(port);
      else next.add(port);
      return next;
    });
  }

  function toggleAll(checked) {
    if (checked) {
      setSelectedPorts(new Set(COMMON_PORT_CHOICES.map((c) => c.value)));
    } else {
      setSelectedPorts(new Set());
    }
  }

  function portListValue() {
    const chosen = [...selectedPorts].sort((a, b) => Number(a) - Number(b));
    const custom = customPorts.trim();
    if (!custom) return chosen.join(",");
    return chosen.length ? chosen.join(",") + "," + custom : custom;
  }

  function pushLine(text, cls) {
    if (!mountedRef.current) return;
    setLines((prev) => {
      const next = prev.concat({ text, cls });
      return next.length > 1000 ? next.slice(next.length - 1000) : next;
    });
  }

  async function loadServices() {
    try {
      const d = await (await fetch("/api/scanport/service")).json();
      if (mountedRef.current) setServices(d.services || []);
    } catch { /* ignore */ }
  }

  function statusLabel(s) {
    switch (s) {
      case "open": return "เปิด";
      case "closed": return "ปิด";
      case "filtered": return "กรอง/ไม่ตอบ";
      default: return s;
    }
  }
  function statusClass(s) {
    switch (s) {
      case "open": return "ok";
      case "closed": return "err";
      case "filtered": return "warn";
      default: return "";
    }
  }
  function fmtSize(n) {
    if (n == null) return "—";
    if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
    return n + " bytes";
  }
  function fmtTime(n) {
    if (n == null) return "—";
    return n + " ms";
  }

  async function runScan() {
    const target = cfg.target.trim();
    if (!target) {
      pushLine("⚠ กรุณาระบุ target (IP หรือ hostname)", "exit-err");
      return;
    }
    setScanning(true);
    setScanResult(null);
    setStatus({ text: "กำลังสแกนพอร์ต…", kind: "" });
    pushLine("$ scanport " + target + " ports=" + cfg.ports, "sys");
    try {
      const res = await fetch("/api/scanport/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          ports: portListValue(),
          timeoutMs: Number(cfg.timeoutMs) || 1500,
          concurrency: Number(cfg.concurrency) || 100,
          rounds: Number(cfg.rounds) || 1,
        }),
      });
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data.error) {
        pushLine("เกิดข้อผิดพลาด: " + data.error, "exit-err");
        setStatus({ text: "ผิดพลาด", kind: "err" });
        setScanning(false);
        return;
      }
      setScanResult(data);
      pushLine(
        `สแกนแล้ว ${data.count} พอร์ต · เปิด ${data.open} พอร์ต · ปิด ${data.count - data.open} พอร์ต`,
        data.open ? "exit-ok" : "sys",
      );
      setStatus({
        text: `สแกนเสร็จ — เปิด ${data.open} / ${data.count}`,
        kind: data.open ? "" : "",
      });
    } catch (e) {
      pushLine("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: " + e, "exit-err");
      setStatus({ text: "ผิดพลาด", kind: "err" });
    } finally {
      if (mountedRef.current) setScanning(false);
    }
  }

  async function startService() {
    const p = Number(svcPort);
    if (!Number.isFinite(p) || p < 1 || p > 65535) {
      pushLine("⚠ พอร์ตไม่ถูกต้อง (1-65535)", "exit-err");
      return;
    }
    try {
      const res = await fetch("/api/scanport/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: p }),
      });
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data.ok) {
        pushLine(`เริ่มบริการบนพอร์ต ${p} แล้ว`, "sys");
        setStatus({ text: `เปิดบริการพอร์ต ${p}`, kind: "" });
        loadServices();
      } else {
        pushLine(`ไม่สามารถเปิดพอร์ต ${p}: ${data.error || "unknown"}`, "exit-err");
        setStatus({ text: "เปิดบริการล้มเหลว", kind: "err" });
      }
    } catch (e) {
      pushLine("เกิดข้อผิดพลาด: " + e, "exit-err");
    }
  }

  async function stopService(p) {
    try {
      const res = await fetch("/api/scanport/service", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: p }),
      });
      const data = await res.json();
      if (!mountedRef.current) return;
      if (data.ok) {
        pushLine(`หยุดบริการพอร์ต ${p} แล้ว`, "sys");
        loadServices();
      } else {
        pushLine(`หยุดบริการพอร์ต ${p} ล้มเหลว: ${data.error || "unknown"}`, "exit-err");
      }
    } catch (e) {
      pushLine("เกิดข้อผิดพลาด: " + e, "exit-err");
    }
  }

  function copyText(text, el) {
    navigator.clipboard.writeText(text).then(() => {
      const old = el.textContent;
      el.textContent = "คัดลอกแล้ว!";
      setTimeout(() => { el.textContent = old; }, 1200);
    });
  }

  useEffect(() => {
    mountedRef.current = true;
    loadServices();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const c = consoleRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [lines]);

  const openPorts = scanResult ? scanResult.ports.filter((r) => r.status === "open") : [];
  const graphData = scanResult ? scanResult.ports.find((r) => r.port === graphPort) : null;
  const graphSeries = graphData ? (graphData.responseTimes || []).map((t, i) => ({ x: i + 1, y: t })) : [];

  return (
    <div className="grid3">
      {/* left: scan controls */}
      <Collapsible title="สแกนพอร์ต (Scan Port)">
        <div>
          <label className="f">Target (IP / hostname)</label>
          <input
            placeholder="เช่น 127.0.0.1 หรือ 192.168.1.1"
            value={cfg.target}
            onChange={(e) => setCfg((c) => ({ ...c, target: e.target.value }))}
          />

          <label className="f">ช่วงพอร์ต (ports)</label>
          <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
            <button
              className={`btn ${portDropdownOpen ? "" : ""}`}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 11px",
                background: "var(--panel2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 7,
                fontSize: 13,
                cursor: "pointer",
              }}
              onClick={() => setPortDropdownOpen(!portDropdownOpen)}
            >
              {selectedPorts.size === 0 ? "ไม่ได้เลือกพอร์ต" : selectedPorts.size === COMMON_PORT_CHOICES.length ? "ทั้งหมด (" + selectedPorts.size + ")" : selectedPorts.size + " พอร์ต"}
              {customPorts.trim() && ` + ${customPorts.trim()}`}
              <span style={{ float: "right", fontSize: 11, color: "var(--muted)" }}>{portDropdownOpen ? "▲" : "▼"}</span>
            </button>
            {portDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 10,
                zIndex: 50,
                boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                maxHeight: 300,
                overflowY: "auto",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <input
                    type="checkbox"
                    checked={selectedPorts.size === COMMON_PORT_CHOICES.length && selectedPorts.size > 0}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>เลือกทั้งหมด</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {COMMON_PORT_CHOICES.map((c) => (
                    <label
                      key={c.value}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5, cursor: "pointer", color: "var(--text)" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPorts.has(c.value)}
                        onChange={() => togglePort(c.value)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <label className="f" style={{ marginBottom: 4, fontSize: 11.5 }}>พอร์ตเพิ่มเติม (คั่นด้วย , หรือขอบเขต 1-100)</label>
                  <input
                    type="text"
                    value={customPorts}
                    placeholder="เช่น 5000-5010, 8443"
                    onChange={(e) => setCustomPorts(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", background: "var(--panel2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, fontSize: 12 }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="hint">เลือกพอร์ตจากรายการ หรือพิมพ์ทีละตัว/ช่วง เช่น 5000-5010,8443 ในช่องเพิ่มเติม</div>

          <div className="row">
            <div>
              <label className="f">Timeout (ms)</label>
              <input type="number" value={cfg.timeoutMs} min="200" max="10000"
                onChange={(e) => setCfg((c) => ({ ...c, timeoutMs: e.target.value }))} />
            </div>
            <div>
              <label className="f">ความพร้อม (concurrency)</label>
              <input type="number" value={cfg.concurrency} min="1" max="500"
                onChange={(e) => setCfg((c) => ({ ...c, concurrency: e.target.value }))} />
            </div>
            <div>
              <label className="f">จำนวนรอบที่สแกน (rounds)</label>
              <input type="number" value={cfg.rounds} min="1" max="20"
                onChange={(e) => setCfg((c) => ({ ...c, rounds: e.target.value }))} />
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={runScan} disabled={scanning}>
              {scanning ? "กำลังสแกน…" : "▶ สแกนพอร์ต"}
            </button>
            {scanResult && (
              <button className="copy" onClick={(e) => copyText(JSON.stringify(scanResult, null, 2), e.target)}>
                Export JSON
              </button>
            )}
          </div>

          <details className="details-section collapsible-section" defaultOpen style={{ marginTop: 14, border: 0, background: "transparent" }}>
            <summary style={{ padding: 0, color: "var(--muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".6px", background: "none" }}>
              เกี่ยวกับระบบสแกนพอร์ต
            </summary>
            <div className="details-content" style={{ paddingTop: 8 }}>
              <p>ระบบสแกนพอร์ตแบบ TCP connect ตรวจสอบว่าพอร์ตเปิดหรือปิดบน host เป้าหมาย</p>
              <ul>
                <li><b>เปิด (open):</b> การเชื่อมต่อ TCP สำเร็จ บริการกำลังทำงาน</li>
                <li><b>ปิด (closed):</b> การเชื่อมต่อถูกปฏิเสธ (RST) ไม่มีบริการรับพอร์ตนี้</li>
                <li><b>กรอง/ไม่ตอบ (filtered):</b> หมดเวลารอ อาจมีไฟร์วอลล์บล็อก</li>
                <li><b>ขนาดแพ็กเก็ต:</b> ขนาดข้อมูลตอบกลับ (banner) ที่ได้รับจากบริการ</li>
              </ul>
            </div>
          </details>
        </div>
      </Collapsible>

      {/* center: scan results (main area) */}
      <Collapsible title="ผลการสแกนพอร์ต (Scan Results)">
        <div>
          <div className="hd" style={{ borderBottom: "none", padding: 0, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px" }}>ผลการสแกนพอร์ต (Scan Results)</span>
            <span className="spacer" />
            <span style={{ fontFamily: "var(--mono)", textTransform: "none", color: "var(--muted)" }}>
              {scanResult ? scanResult.target + " · " + scanResult.count + " พอร์ต" : ""}
            </span>
          </div>
          <div className="bd">
            <div className="chart-stats">
              <div className="stat">
                <div className="k">สแกนทั้งหมด</div>
                <div className="v">{scanResult ? scanResult.count : "—"}</div>
              </div>
              <div className="stat">
                <div className="k">พอร์ตเปิด</div>
                <div className="v big" style={{ color: "var(--ok)" }}>{scanResult ? scanResult.open : "—"}</div>
              </div>
              <div className="stat">
                <div className="k">พอร์ตปิด</div>
                <div className="v">{scanResult ? scanResult.count - scanResult.open : "—"}</div>
              </div>
            </div>
            <div style={{ border: "1px solid var(--border)", borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, background: "#0b0f14", overflow: "auto", maxHeight: 520 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontFamily: "var(--mono)" }}>
                <thead>
                  <tr style={{ background: "var(--panel2)" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>พอร์ต</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>สถานะ</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>บริการ</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>คำอธิบาย</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>ตอบสนอง mean(ms)</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>SD(ms)</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>ขนาดแพ็กเก็ต</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>Banner</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>กราฟ</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult ? scanResult.ports.map((r) => {
                    const sel = graphPort === r.port;
                    return (
                      <tr key={r.port} style={{ borderBottom: "1px solid var(--border)", background: sel ? "rgba(62,166,255,.08)" : "transparent" }} onClick={() => setGraphPort(r.port)}>
                        <td style={{ padding: "7px 12px", color: "var(--text)" }}>{r.port}</td>
                        <td style={{ padding: "7px 12px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              background:
                                r.status === "open"
                                  ? "var(--ok)"
                                  : r.status === "closed"
                                  ? "var(--err)"
                                  : "var(--warn)",
                              boxShadow: "0 0 8px " + (r.status === "open" ? "var(--ok)" : r.status === "closed" ? "var(--err)" : "var(--warn)"),
                              marginRight: 6,
                              verticalAlign: "middle",
                            }}
                          />
                          <span
                            style={{
                              color: "var(--text)",
                              fontWeight: 600,
                              fontSize: 12.5,
                              verticalAlign: "middle",
                            }}
                          >
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td style={{ padding: "7px 12px", color: "var(--accent)" }}>{r.service.name}</td>
                        <td style={{ padding: "7px 12px", color: "#cdd7e2", fontSize: 11.5 }}>{r.service.desc}</td>
                        <td style={{ padding: "7px 12px", color: "var(--text)" }}>{fmtTime(r.responseMean)}</td>
                        <td style={{ padding: "7px 12px", color: "var(--text)" }}>{fmtTime(r.responseSD)}</td>
                        <td style={{ padding: "7px 12px", color: "var(--text)" }}>{fmtSize(r.packetSize)}</td>
                        <td style={{ padding: "7px 12px", color: "var(--muted)", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.banner || "—"}</td>
                        <td style={{ padding: "7px 8px", textAlign: "center" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setGraphPort(r.port); }}
                            className="copy"
                            style={{ padding: "4px 8px", fontSize: 11, opacity: sel ? 1 : 0.7, background: sel ? "var(--accent)" : "transparent", borderColor: sel ? "var(--accent)" : "var(--border)", color: sel ? "#04121f" : "var(--muted)" }}
                            disabled={sel}
                          >
                            {sel ? "เลือกแล้ว" : "กราฟ"}
                          </button>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan={8} style={{ padding: 24, color: "var(--muted)", textAlign: "center" }}>ยังไม่มีผลการสแกน — เริ่มสแกนพอร์ตจากแผงซ้ายเพื่อดูผลลัพธ์ตรงกลางนี้</td></tr>}
                </tbody>
              </table>
              {graphPort != null && (
                <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 8, background: "#0b0f14", overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>กราฟเวลาตอบสนอง — พอร์ต {graphPort}</span>
                    <button className="copy" onClick={() => setGraphPort(null)} style={{ padding: "4px 8px", fontSize: 11 }}>ปิด</button>
                  </div>
                  <div className="bd" style={{ padding: 12 }}>
                    {graphData && (
                      <>
                        <div className="chart-stats" style={{ gap: 14, marginBottom: 10 }}>
                          <div className="stat">
                            <div className="k">รอบที่สแกน</div>
                            <div className="v">{graphData.rounds}</div>
                          </div>
                          <div className="stat">
                            <div className="k">ค่าเฉลี่ย</div>
                            <div className="v big" style={{ color: "var(--ok)" }}>{graphData.responseMean != null ? graphData.responseMean.toFixed(1) + " ms" : "—"}</div>
                          </div>
                          <div className="stat">
                            <div className="k">ค่าเบี่ยงเบน (SD)</div>
                            <div className="v">{graphData.responseSD != null ? graphData.responseSD.toFixed(1) + " ms" : "—"}</div>
                          </div>
                          <div className="stat">
                            <div className="k">ต่ำสุด / สูงสุด</div>
                            <div className="v">{graphData.responseMin != null && graphData.responseMax != null ? graphData.responseMin.toFixed(1) + " / " + graphData.responseMax.toFixed(1) + " ms" : "—"}</div>
                          </div>
                        </div>
                        <div style={{ height: 200, width: "100%" }}>
                          <LineChart series={graphSeries} height={200} unit="ms" emptyText="ไม่มีข้อมูลเวลาตอบสนอง" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {openPorts.length > 0 && (
              <div style={{ padding: 10, background: "var(--panel2)", borderRadius: 7, marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
                <b style={{ color: "var(--ok)" }}>พอร์ตที่เปิด:</b> {openPorts.map((r) => r.port).join(", ")}
              </div>
            )}
          </div>
        </div>
      </Collapsible>

      {/* right: local service + reference + console */}
      <div className="right">
        <Collapsible title="เปิด/ปิดบริการเครื่องเครือข่าย (Local Service)">
          <div>
            <div className="row">
              <div style={{ flex: 2 }}>
                <label className="f">พอร์ตที่จะเปิดบริการ</label>
                <input type="number" value={svcPort} min="1" max="65535"
                  onChange={(e) => setSvcPort(e.target.value)} />
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                <button className="btn primary" onClick={startService}>เปิดบริการ</button>
              </div>
            </div>
            <div className="hint">เปิด TCP listener บนเครื่องนี้เพื่อทดสอบการสแกนพอร์ตในเครื่อง (localhost)</div>

            <label className="f" style={{ marginTop: 14 }}>บริการที่ทำงานอยู่ในเครื่อง</label>
            <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 7, background: "#0b0f14" }}>
              {services.length === 0 && <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>ยังไม่มีบริการที่เปิดอยู่</div>}
              {services.map((s) => (
                <div key={s.port} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)" }}>
                  <span className="dot run" />
                  <span style={{ fontFamily: "var(--mono)", flex: 1 }}>{s.port}</span>
                  <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{s.service.name}</span>
                  <button
                    className="btn danger"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => stopService(s.port)}
                  >
                    ปิด
                  </button>
                </div>
              ))}
            </div>
            <div className="actions" style={{ marginTop: 10 }}>
              <button className="copy" onClick={loadServices}>รีเฟรชรายการ</button>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="คำสั่งอ้างอิง (Reference)">
          <div>
            <div className="cmds">
              <div className="cmd">scanport สแกน TCP แบบ connect-preconnect วัดเวลาตอบสนอง และดึง banner</div>
              <div className="cmd">เปิดบริการท้องถิ่น → เลือกพอร์ต → “เปิดบริการ” → สแกนที่ 127.0.0.1</div>
              <div className="cmd">ใช้งานจริง: สแกนเครื่องใน LAN เพื่อตรวจบริการที่เปิดอยู่ (ต้องมีสิทธิ์/อนุญาต)</div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="f" style={{ marginBottom: 6, fontSize: 12.5 }}>บริการพอร์ตทั่วไป</label>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "5px 8px", textAlign: "left", color: "var(--muted)", fontSize: 11 }}>พอร์ต</th>
                    <th style={{ padding: "5px 8px", textAlign: "left", color: "var(--muted)", fontSize: 11 }}>บริการ</th>
                  </tr>
                </thead>
                <tbody>
                  {[21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 3389, 5432, 6379, 8080, 27017].map((p) => {
                    const info = getServiceInfo(p);
                    return (
                      <tr key={p} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "5px 8px", color: "var(--text)", fontFamily: "var(--mono)" }}>{p}</td>
                        <td style={{ padding: "5px 8px", color: "#cdd7e2" }}>{info.name} — {info.desc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Collapsible>

        <Collapsible title="ผลลัพธ์ (Live)">
          <div>
            <div className="console" ref={consoleRef}>
              {lines.map((l, i) => (
                <div key={i} className={"l" + (l.cls ? " " + l.cls : "")}>{l.text}</div>
              ))}
            </div>
          </div>
        </Collapsible>
      </div>

      <div className="workspace-status">
        <span className={"dot" + (status.kind ? " " + status.kind : "")} />
        <span style={{ color: "var(--muted)" }}>{status.text}</span>
      </div>
    </div>
  );
}

function getServiceInfo(port) {
  const map = {
    21: { name: "FTP", desc: "File Transfer Protocol" },
    22: { name: "SSH", desc: "Secure Shell remote login" },
    23: { name: "Telnet", desc: "Telnet unencrypted remote login" },
    25: { name: "SMTP", desc: "Simple Mail Transfer Protocol" },
    53: { name: "DNS", desc: "Domain Name System" },
    80: { name: "HTTP", desc: "Hypertext Transfer Protocol" },
    110: { name: "POP3", desc: "Post Office Protocol v3" },
    143: { name: "IMAP", desc: "Internet Message Access Protocol" },
    443: { name: "HTTPS", desc: "HTTP over TLS/SSL" },
    3306: { name: "MySQL", desc: "MySQL / MariaDB" },
    3389: { name: "RDP", desc: "Remote Desktop Protocol" },
    5432: { name: "PostgreSQL", desc: "PostgreSQL" },
    6379: { name: "Redis", desc: "Redis key-value store" },
    8080: { name: "HTTP Alt", desc: "HTTP Alternate / Proxy" },
    27017: { name: "MongoDB", desc: "MongoDB" },
  };
  return map[port] || { name: "unknown", desc: "ไม่ทราบบริการ" };
}
