import { spawn } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const MAX_RESULTS = 100;
const BUFFER_CAP = 4000;

const sessions = new Map();

const IPERF_BIN = process.env.IPERF_BIN || "iperf3";
const TCPDUMP_BIN = process.env.TCPDUMP_BIN || "tcpdump";
const TSHARK_BIN = process.env.TSHARK_BIN || "tshark";
const TRACEROUTE_BIN = process.env.TRACEROUTE_BIN || "traceroute";
const SCAPY_PY = process.env.SCAPY_PY || "python3";
const SCAPY_RUNNER = path.join(process.cwd(), "scripts", "scapy_runner.py");

/* ---------------- regexes ---------------- */
const INTERVAL_RE =
  /^\s*\[\s*\d+\]\s+([\d.]+)-([\d.]+)\s+sec\s+([\d.]+\s*[KMGTPE]?Bytes)\s+([\d.]+\s*[KMGTPE]?bits?\/sec)/;
const BYTES_RE = /([\d.]+)\s*([KMGTPE]?)Bytes/;
const BITS_RE = /([\d.]+)\s*([KMGTPE]?)bits?\/sec/;
const TCPDUMP_PACKET_RE = /^\d\d:\d\d:\d\d\.\d+/;
const TSHARK_PACKET_RE = /^\s*\d+\s+\d+\.\d+/;
const REPLY_RE = /reply #(\d+) from (\S+) time=([\d.]+) ms/;
const SUMMARY_RE = /SUMMARY sent=(\d+) recv=(\d+)(?: avg=([\d.]+) min=([\d.]+) max=([\d.]+))?/;
const HOP_RE = /^\s*(\d+)\s+(.*)$/;
const RTT_RE = /([\d.]+)\s*ms/g;
const PREF_BITS = { "": 1, K: 1e3, M: 1e6, G: 1e9, T: 1e12, P: 1e15, E: 1e18 };
const PREF_BYTES = { "": 1, K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4, P: 1024 ** 5, E: 1024 ** 6 };

/* ---------------- small helpers ---------------- */
function parseBytes(text) {
  const m = BYTES_RE.exec(text.trim());
  if (!m) return 0;
  return parseFloat(m[1]) * (PREF_BYTES[m[2]] || 1);
}
function parseBits(text) {
  const m = BITS_RE.exec(text.trim());
  if (!m) return 0;
  return parseFloat(m[1]) * (PREF_BITS[m[2]] || 1);
}
function parseInterval(line) {
  const m = INTERVAL_RE.exec(line);
  if (!m) return null;
  return {
    start: parseFloat(m[1]),
    end: parseFloat(m[2]),
    bytes: parseBytes(m[3]),
    bps: parseBits(m[4]),
  };
}
function argVal(argv, flag) {
  const i = argv.indexOf(flag);
  if (i >= 0 && i + 1 < argv.length) return argv[i + 1];
  return "";
}
function lastArg(argv) {
  for (let i = argv.length - 1; i >= 0; i--) {
    if (!argv[i].startsWith("-")) return argv[i];
  }
  return "";
}
function round1(n) { return Math.round(n * 10) / 10; }
function round2(n) { return Math.round(n * 100) / 100; }
function round3(n) { return Math.round(n * 1000) / 1000; }

/* ---------------- persistence (generic by mode) ---------------- */
function fileFor(mode) {
  return path.join(DATA_DIR, `${mode}_results.json`);
}
function loadResults(mode) {
  try {
    const data = JSON.parse(readFileSync(fileFor(mode), "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function saveResults(mode, records) {
  const tmp = fileFor(mode) + ".tmp";
  writeFileSync(tmp, JSON.stringify(records, null, 2));
  renameSync(tmp, fileFor(mode));
}
function storeResult(mode, record) {
  const records = loadResults(mode);
  records.push(record);
  saveResults(mode, records.slice(-MAX_RESULTS));
  return record;
}

/* ---------------- argv preparation ---------------- */
function ensureInterval(argv) {
  if (!argv.includes("-c")) return argv;
  if (argv.some((a) => a === "-i" || a === "--interval")) return argv;
  if (argv.some((a) => a === "-J" || a === "--json")) return argv;
  return [...argv, "-i", "1"];
}
function ensureLiveTcpdump(argv) {
  const out = [...argv];
  if (!out.includes("-U") && !out.includes("--immediate-mode")) out.push("-U");
  if (!out.includes("-l")) out.push("-l");
  return out;
}
function ensureLiveTshark(argv) {
  const out = [...argv];
  if (!out.includes("-l")) out.push("-l");
  return out;
}

const CAPTURE_MODES = new Set(["tcpdump", "tshark"]);
const PACKET_RES = { tcpdump: TCPDUMP_PACKET_RE, tshark: TSHARK_PACKET_RE };
const BIN_FOR = {
  iperf: IPERF_BIN,
  tcpdump: TCPDUMP_BIN,
  tshark: TSHARK_BIN,
  traceroute: TRACEROUTE_BIN,
};

function prepArgv(mode, argv) {
  switch (mode) {
    case "scapy": return [SCAPY_RUNNER, argv[0]];
    case "tcpdump": return ensureLiveTcpdump(argv);
    case "tshark": return ensureLiveTshark(argv);
    case "iperf": return ensureInterval(argv);
    default: return argv;
  }
}

/* ---------------- record builders ---------------- */
function buildIperfRecord(id, argv, intervals, summary) {
  if (!intervals.length && !Object.keys(summary).length) return null;
  const rec = {
    id,
    ts: new Date().toISOString().slice(0, 19),
    argv,
    role: argv.includes("-s") ? "server" : "client",
    proto: argv.includes("-u") ? "udp" : "tcp",
    host: argVal(argv, "-c"),
    duration: 0,
    totalMB: 0,
    avgMbps: 0,
    intervals: [],
  };
  const pick = summary.receiver || summary.sender;
  if (pick) {
    rec.duration = round2(pick.end);
    rec.totalMB = round3(pick.bytes / 1e6);
    rec.avgMbps = round3(pick.bps / 1e6);
  }
  if (!rec.duration && intervals.length) rec.duration = round2(intervals[intervals.length - 1].end);
  rec.intervals = intervals.map((p) => ({ t: round2(p.end), mbps: round3(p.bps / 1e6) }));
  return rec;
}
function buildCaptureRecord(mode, id, argv, packets, ppsSeries) {
  return {
    id,
    ts: new Date().toISOString().slice(0, 19),
    argv,
    mode,
    interface: argVal(argv, "-i") || "(default)",
    packets,
    pps_series: ppsSeries,
  };
}
function buildScapyRecord(id, argv, summary, points) {
  let cfg = {};
  try { cfg = JSON.parse(argv[0] || "{}"); } catch { /* ignore */ }
  return {
    id,
    ts: new Date().toISOString().slice(0, 19),
    argv,
    mode: "scapy",
    target: cfg.target || "",
    type: cfg.type || "icmp",
    sent: summary.sent || 0,
    recv: summary.recv || 0,
    avg: summary.avg || 0,
    min: summary.min || 0,
    max: summary.max || 0,
    points: points || [],
  };
}
function buildTracerouteRecord(id, argv, hops) {
  return {
    id,
    ts: new Date().toISOString().slice(0, 19),
    argv,
    mode: "traceroute",
    target: lastArg(argv),
    hops: hops || [],
  };
}

/* ---------------- session / process management ---------------- */
function emit(s, ev) {
  s.buffer.push(ev);
  if (s.buffer.length > BUFFER_CAP) s.buffer.shift();
  for (const l of s.listeners) {
    try { l(ev); } catch { /* ignore */ }
  }
}

export function startProcess(mode, argv) {
  const bin = mode === "scapy" ? SCAPY_PY : BIN_FOR[mode] || mode;
  const args = prepArgv(mode, argv);
  const id = crypto.randomUUID();
  const proc = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });

  const s = {
    id,
    mode,
    argv: args,
    proc,
    listeners: new Set(),
    buffer: [],
    ended: false,
    code: null,
    stats: { count: 0, packets: 0, series: [] },
    timer: null,
    intervals: [],
    summary: {},
    hops: [],
    scapyPoints: [],
    scapySummary: {},
  };
  sessions.set(id, s);

  let buf = "";
  const handle = (chunk) => {
    buf += chunk.toString();
    let idx;
    const lines = [];
    while ((idx = buf.indexOf("\n")) >= 0) {
      lines.push(buf.slice(0, idx));
      buf = buf.slice(idx + 1);
    }
    for (const raw of lines) {
      const text = raw.replace(/\r$/, "");
      emit(s, { type: "line", text });

      if (CAPTURE_MODES.has(s.mode)) {
        if (PACKET_RES[s.mode].test(text)) {
          s.stats.count += 1;
          s.stats.packets += 1;
        }
        continue;
      }

      if (s.mode === "scapy") {
        const rm = REPLY_RE.exec(text);
        if (rm) {
          const i = parseInt(rm[1], 10);
          const ms = parseFloat(rm[3]);
          s.scapyPoints.push({ t: i, ms });
          emit(s, { type: "data", t: i, ms });
          continue;
        }
        const sm = SUMMARY_RE.exec(text);
        if (sm) {
          s.scapySummary = {
            sent: parseInt(sm[1], 10),
            recv: parseInt(sm[2], 10),
            avg: sm[3] ? parseFloat(sm[3]) : 0,
            min: sm[4] ? parseFloat(sm[4]) : 0,
            max: sm[5] ? parseFloat(sm[5]) : 0,
          };
          emit(s, { type: "summary", ...s.scapySummary });
        }
        continue;
      }

      if (s.mode === "traceroute") {
        const hm = HOP_RE.exec(text);
        if (hm) {
          const hop = parseInt(hm[1], 10);
          const rest = hm[2];
          const rtts = [];
          RTT_RE.lastIndex = 0;
          let mm;
          while ((mm = RTT_RE.exec(rest))) rtts.push(parseFloat(mm[1]));
          if (rtts.length) {
            const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
            s.hops.push({ hop, avg: round1(avg), rtts: rtts.map(round1), probes: rtts.length });
            emit(s, { type: "data", t: hop, ms: round1(avg) });
          } else {
            s.hops.push({ hop, avg: 0, rtts: [], probes: 0 });
          }
        }
        continue;
      }

      const parsed = parseInterval(text);
      if (parsed) {
        if (text.includes("sender") || text.includes("receiver")) {
          const role = text.includes("sender") ? "sender" : "receiver";
          s.summary[role] = parsed;
          emit(s, {
            type: "summary",
            role,
            end: round2(parsed.end),
            mbps: round3(parsed.bps / 1e6),
            totalMB: round3(parsed.bytes / 1e6),
          });
        } else {
          s.intervals.push(parsed);
          emit(s, { type: "data", t: round2(parsed.end), mbps: round3(parsed.bps / 1e6) });
        }
      }
    }
  };
  proc.stdout.on("data", handle);
  proc.stderr.on("data", handle);

  if (CAPTURE_MODES.has(s.mode)) {
    s.timer = setInterval(() => {
      const c = s.stats.count;
      s.stats.count = 0;
      s.stats.series.push(c);
      emit(s, { type: "data", pps: c, packets: s.stats.packets });
    }, 1000);
  }

  proc.on("close", (code) => {
    if (s.timer) clearInterval(s.timer);
    let rec = null;
    switch (s.mode) {
      case "iperf": rec = buildIperfRecord(id, s.argv, s.intervals, s.summary); break;
      case "scapy": rec = buildScapyRecord(id, s.argv, s.scapySummary, s.scapyPoints); break;
      case "traceroute": rec = buildTracerouteRecord(id, s.argv, s.hops); break;
      default:
        if (CAPTURE_MODES.has(s.mode)) {
          rec = buildCaptureRecord(s.mode, id, s.argv, s.stats.packets, s.stats.series);
        }
    }
    if (rec) {
      try { storeResult(s.mode, rec); } catch { /* ignore */ }
      emit(s, { type: "record", ...rec });
    }
    s.ended = true;
    s.code = code;
    emit(s, { type: "exit", code });
    setTimeout(() => sessions.delete(id), 30000);
  });

  return id;
}

export function stopProcess(id) {
  const s = sessions.get(id);
  if (!s) return false;
  if (!s.ended && s.proc && s.proc.exitCode === null) {
    try { s.proc.kill("SIGTERM"); } catch { /* ignore */ }
    setTimeout(() => {
      if (s.proc && s.proc.exitCode === null) {
        try { s.proc.kill("SIGKILL"); } catch { /* ignore */ }
      }
    }, 3000);
  }
  return true;
}

export function getSession(id) {
  return sessions.get(id) || null;
}

export function getResults(mode) {
  return loadResults(mode);
}
export function clearResults(mode) {
  saveResults(mode, []);
}

export async function listInterfaces() {
  return new Promise((resolve) => {
    const p = spawn(TCPDUMP_BIN, ["-D"], {});
    let out = "";
    p.stdout.on("data", (d) => (out += d.toString()));
    p.on("close", () => {
      const ifaces = [];
      for (const ln of out.split("\n")) {
        const m = /^(\d+)\.(\S+)\s+\[(.*)\]/.exec(ln.trim());
        if (m) ifaces.push({ num: m[1], name: m[2], status: m[3] });
      }
      resolve(ifaces);
    });
    p.on("error", () => resolve([]));
  });
}

export async function getVersion(bin) {
  return new Promise((resolve) => {
    const p = spawn(bin, ["--version"], {});
    let out = "";
    let done = false;
    p.stdout.on("data", (d) => (out += d.toString()));
    p.stderr.on("data", (d) => (out += d.toString()));
    p.on("close", () => {
      if (done) return;
      done = true;
      resolve((out.split("\n")[0] || "unknown").trim());
    });
    p.on("error", (e) => {
      if (done) return;
      done = true;
      resolve(`error: ${e.message}`);
    });
    setTimeout(() => {
      if (done) return;
      done = true;
      try { p.kill(); } catch { /* ignore */ }
      resolve((out.split("\n")[0] || "unknown").trim());
    }, 5000);
  });
}