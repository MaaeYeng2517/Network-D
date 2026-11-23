"use client";

const C = {
  bg: "#0b0f14",
  box: "#1d2632",
  box2: "#16202b",
  border: "#2a3543",
  accent: "#3ea6ff",
  accent2: "#2a7bc0",
  text: "#e6edf3",
  muted: "#8b98a9",
  ok: "#3fb950",
  warn: "#d29922",
  err: "#f85149",
};

function Box({ x, y, w, h, label, sub, fill = C.box, stroke = C.border, tcolor = C.text, fs = 13 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={fill} stroke={stroke} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} fontSize={fs} fill={tcolor} textAnchor="middle" fontStyle="600">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} fontSize={10.5} fill={C.muted} textAnchor="middle">
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = C.accent, dash }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray={dash} markerEnd="url(#ah)" />
  );
}

function Defs() {
  return (
    <defs>
      <marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill={C.accent} />
      </marker>
    </defs>
  );
}

const W = 640;
const H = 300;

function CommModel() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <Box x={30} y={110} w={120} h={70} label="Sender" sub="ผู้ส่ง" />
      <Box x={490} y={110} w={120} h={70} label="Receiver" sub="ผู้รับ" />
      <Arrow x1={150} y1={135} x2={490} y2={135} />
      <Arrow x1={490} y1={160} x2={150} y2={160} color={C.muted} dash="5,4" />
      <text x={320} y={120} fontSize="12" fill={C.accent} textAnchor="middle">Message / Data</text>
      <text x={320} y={185} fontSize="11" fill={C.muted} textAnchor="middle">Medium (สาย/คลื่น)</text>
      <Box x={270} y={40} w={100} h={42} label="Protocol" sub="กฎการสื่อสาร" fill={C.box2} />
      <Arrow x1={320} y1={82} x2={320} y2={128} color={C.warn} dash="3,3" />
      <path d="M300 70 l10 -14 l10 14 z" fill={C.err} />
      <text x={340} y={68} fontSize="11" fill={C.err}>Noise</text>
      <text x={320} y={235} fontSize="11" fill={C.muted} textAnchor="middle">Simplex · Half-duplex · Full-duplex</text>
    </svg>
  );
}

function Arch() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={150} y={30} fontSize="14" fill={C.accent} textAnchor="middle">Client - Server</text>
      <Box x={120} y={50} w={60} h={40} label="Client" fill={C.box2} fs={11} />
      <Box x={120} y={100} w={60} h={40} label="Client" fill={C.box2} fs={11} />
      <Box x={220} y={75} w={90} h={50} label="Server" fill={C.accent2} stroke={C.accent} fs={12} />
      <Arrow x1={180} y1={70} x2={220} y2={90} />
      <Arrow x1={180} y1={120} x2={220} y2={110} />
      <Arrow x1={220} y1={95} x2={180} y2={78} color={C.muted} dash="4,3" />
      <line x1={340} y1="40" x2={340} y2="260" stroke={C.border} strokeDasharray="4,4" />
      <text x={490} y={30} fontSize="14" fill={C.accent} textAnchor="middle">Peer - to - Peer</text>
      {[
        [400, 70],
        [540, 70],
        [400, 160],
        [540, 160],
        [470, 235],
      ].map(([x, y], i) => (
        <Box key={i} x={x - 30} y={y - 18} w={60} h={36} label="Peer" fill={C.box2} fs={11} />
      ))}
      {[
        [400, 70, 540, 70],
        [400, 70, 400, 160],
        [540, 70, 540, 160],
        [400, 160, 540, 160],
        [400, 70, 470, 235],
        [540, 160, 470, 235],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const OSI = [
  ["Application", "message"],
  ["Presentation", "data"],
  ["Session", "data"],
  ["Transport", "segment"],
  ["Network", "packet"],
  ["Data Link", "frame"],
  ["Physical", "bit"],
];
function Osi() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={150} y={24} fontSize="14" fill={C.accent} textAnchor="middle">OSI (7 layers)</text>
      {OSI.map(([name, pdu], i) => {
        const y = 40 + i * 34;
        const fill = i % 2 === 0 ? C.box : C.box2;
        return (
          <g key={name}>
            <rect x="40" y={y} width="200" height="30" rx="6" fill={fill} stroke={C.border} />
            <text x="52" y={y + 19} fontSize="12.5" fill={C.text}>{name}</text>
            <text x="228" y={y + 19} fontSize="10.5" fill={C.muted} textAnchor="end">{pdu}</text>
          </g>
        );
      })}
      <text x={470} y={24} fontSize="14" fill={C.accent} textAnchor="middle">TCP/IP (4 layers)</text>
      {[
        ["Application", 40, 108],
        ["Transport", 40 + 3 * 34, 40 + 3 * 34 + 30],
        ["Internet", 40 + 4 * 34, 40 + 4 * 34 + 30],
        ["Network Access", 40 + 5 * 34, 40 + 6 * 34 + 30],
      ].map(([name, y, y2], i) => (
        <g key={name}>
          <rect x="360" y={y} width="220" height={y2 - y} rx="8" fill={i === 0 ? C.accent2 : C.box} stroke={C.accent} strokeOpacity={i === 0 ? 1 : 0.4} />
          <text x="470" y={y + (y2 - y) / 2 + 4} fontSize="13" fill={C.text} textAnchor="middle">{name}</text>
        </g>
      ))}
      <line x1="270" y1="60" x2="350" y2="70" stroke={C.muted} strokeDasharray="3,3" />
      <line x1="270" y1="170" x2="350" y2="175" stroke={C.muted} strokeDasharray="3,3" />
      <line x1="270" y1="204" x2="350" y2="215" stroke={C.muted} strokeDasharray="3,3" />
      <line x1="270" y1="238" x2="350" y2="250" stroke={C.muted} strokeDasharray="3,3" />
      <text x="320" y="285" fontSize="11" fill={C.muted} textAnchor="middle">Encapsulation เพิ่ม header ทีละชั้น · Decapsulation ถอดออกทีละชั้น</text>
    </svg>
  );
}

function Topology() {
  const nodes = (pts) => pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" fill={C.accent} />);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      {/* Bus */}
      <text x="90" y="30" fontSize="13" fill={C.accent} textAnchor="middle">Bus</text>
      <line x1="30" y1="80" x2="150" y2="80" stroke={C.muted} strokeWidth="2" />
      {[50, 90, 130].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="80" x2={x} y2="110" stroke={C.muted} />
          <circle cx={x} cy="116" r="6" fill={C.accent} />
        </g>
      ))}
      {/* Star */}
      <text x="250" y="30" fontSize="13" fill={C.accent} textAnchor="middle">Star</text>
      <circle cx="250" cy="90" r="8" fill={C.accent2} stroke={C.accent} />
      {[[250, 50], [210, 120], [290, 120]].map(([x, y], i) => (
        <g key={i}>
          <line x1="250" y1="90" x2={x} y2={y} stroke={C.muted} />
          <circle cx={x} cy={y} r="6" fill={C.accent} />
        </g>
      ))}
      {/* Ring */}
      <text x="420" y="30" fontSize="13" fill={C.accent} textAnchor="middle">Ring</text>
      <circle cx="420" cy="95" r="45" fill="none" stroke={C.muted} strokeWidth="2" />
      {[[420, 50], [465, 95], [420, 140], [375, 95]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={C.accent} />
      ))}
      {/* Mesh */}
      <text x="560" y="30" fontSize="13" fill={C.accent} textAnchor="middle">Mesh</text>
      {[[560, 60], [520, 120], [600, 120], [560, 170]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={C.accent} />
      ))}
      {[
        [560, 60, 520, 120],
        [560, 60, 600, 120],
        [560, 60, 560, 170],
        [520, 120, 600, 120],
        [520, 120, 560, 170],
        [600, 120, 560, 170],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} />
      ))}
      <text x="320" y="285" fontSize="11" fill={C.muted} textAnchor="middle">physical vs logical topology · ข้อดี–ข้อเสียต่างกันตามโครงสร้าง</text>
    </svg>
  );
}

function Devices() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <Box x={20} y={110} w={90} h={60} label="PC" sub="NIC" />
      <Box x={140} y={110} w={90} h={60} label="Switch" sub="L2 · MAC" fill={C.box2} />
      <Box x={260} y={110} w={90} h={60} label="Router" sub="L3 · IP" fill={C.accent2} stroke={C.accent} />
      <Box x={380} y={110} w={90} h={60} label="Firewall" sub="security" />
      <Box x={500} y={110} w={120} h={60} label="Internet" sub="WAN" fill={C.box2} />
      <Arrow x1={110} y1={140} x2={140} y2={140} />
      <Arrow x1={230} y1={140} x2={260} y2={140} />
      <Arrow x1={350} y1={140} x2={380} y2={140} />
      <Arrow x1={470} y1={140} x2={500} y2={140} />
      <text x={320} y={70} fontSize="12" fill={C.muted} textAnchor="middle">Layer 1 → 2 → 3 → security → WAN</text>
      <text x={320} y={220} fontSize="11" fill={C.muted} textAnchor="middle">Hub ส่ง broadcast · Switch ส่งตาม MAC · Router ส่งตาม IP</text>
      <rect x="0" y="240" width={W} height="40" fill={C.box2} />
      <text x={320} y={265} fontSize="12" fill={C.text} textAnchor="middle">Collision domain: Hub = 1, Switch = แยกตามพอร์ต</text>
    </svg>
  );
}

function Media() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      {/* UTP */}
      <text x="100" y="40" fontSize="13" fill={C.accent} textAnchor="middle">UTP / Coaxial</text>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M40 ${70 + i * 10} q 20 -10 40 0 q 20 10 40 0`} stroke={[C.accent, C.ok, C.warn][i]} strokeWidth="2" fill="none" />
      ))}
      <text x="100" y={120} fontSize="10.5" fill={C.muted} textAnchor="middle">คู่บิด · ราคาถูก · ~100m</text>
      {/* Fiber */}
      <text x="300" y="40" fontSize="13" fill={C.accent} textAnchor="middle">Fiber Optic</text>
      <rect x="250" y="65" width="100" height="10" fill="none" stroke={C.muted} />
      <line x1="260" y1="70" x2="340" y2="70" stroke={C.accent} strokeWidth="2" strokeDasharray="6,4" />
      <text x="300" y={110} fontSize="10.5" fill={C.muted} textAnchor="middle">แสง · ระยะไกล · สูงมาก</text>
      {/* Wireless */}
      <text x="500" y="40" fontSize="13" fill={C.accent} textAnchor="middle">Wireless</text>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${470 + i * 30} 70 q 15 -15 30 0`} stroke={C.muted} fill="none" />
      ))}
      <circle cx="500" cy="72" r="4" fill={C.accent} />
      <text x="500" y={110} fontSize="10.5" fill={C.muted} textAnchor="middle">คลื่น · สะดวก · เสี่ยงดักฟัง</text>
      {/* Signal */}
      <text x={320} y={160} fontSize="12" fill={C.muted} textAnchor="middle">Amplitude · Frequency · Phase</text>
      <path
        d="M40 220 q 20 -40 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"
        stroke={C.accent}
        strokeWidth="2"
        fill="none"
      />
      <line x1="40" y1="220" x2="600" y2="220" stroke={C.border} />
      <text x={320} y={285} fontSize="11" fill={C.muted} textAnchor="middle">Bandwidth vs Frequency · Attenuation · Noise · Shannon/Nyquist</text>
    </svg>
  );
}

function Encoding() {
  const bits = [1, 0, 1, 1, 0, 0, 1, 0];
  const bw = 60;
  const x0 = 60;
  const yHigh = 80;
  const yLow = 130;
  // NRZ-L: high for 1, low for 0
  let nrz = `M ${x0} ${yLow}`;
  bits.forEach((b, i) => {
    const y = b ? yHigh : yLow;
    nrz += ` L ${x0 + i * bw} ${y} L ${x0 + (i + 1) * bw} ${y}`;
  });
  // Manchester: 1 = low->high, 0 = high->low (mid transition)
  let man = `M ${x0} ${yLow}`;
  bits.forEach((b, i) => {
    const xa = x0 + i * bw;
    const xb = xa + bw;
    const mid = xa + bw / 2;
    if (b) {
      man += ` L ${xa} ${yHigh} L ${mid} ${yHigh} L ${mid} ${yLow} L ${xb} ${yLow}`;
    } else {
      man += ` L ${xa} ${yLow} L ${mid} ${yLow} L ${mid} ${yHigh} L ${xb} ${yHigh}`;
    }
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x="30" y="60" fontSize="12" fill={C.muted}>NRZ-L</text>
      <path d={nrz} stroke={C.accent} strokeWidth="2" fill="none" />
      <text x="30" y="175" fontSize="12" fill={C.muted}>Manchester</text>
      <path d={man} stroke={C.ok} strokeWidth="2" fill="none" />
      {bits.map((b, i) => (
        <text key={i} x={x0 + i * bw + bw / 2} y={150} fontSize="11" fill={C.text} textAnchor="middle">{b}</text>
      ))}
      <line x1="60" y1="140" x2="60" y2="200" stroke={C.border} strokeDasharray="3,3" />
      <text x={320} y={240} fontSize="11" fill={C.muted} textAnchor="middle">Line Coding schemes · clock recovery · DC balance · PCM · FDM/TDM/WDM</text>
    </svg>
  );
}

function Crc() {
  const data = [1, 0, 1, 1, 0, 0, 1, 0];
  const bw = 44;
  const x0 = 70;
  const y = 100;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={40} fontSize="13" fill={C.accent} textAnchor="middle">Data + CRC (Redundancy)</text>
      {data.map((b, i) => (
        <g key={i}>
          <rect x={x0 + i * bw} y={y} width={bw - 4} height="44" rx="4" fill={C.box} stroke={C.border} />
          <text x={x0 + i * bw + (bw - 4) / 2} y={y + 28} fontSize="14" fill={C.text} textAnchor="middle">{b}</text>
        </g>
      ))}
      {data.map((b, i) => (
        <g key={i}>
          <rect x={x0 + i * bw} y={y + 64} width={bw - 4} height="44" rx="4" fill={C.accent2} stroke={C.accent} opacity="0.8" />
          <text x={x0 + i * bw + (bw - 4) / 2} y={y + 92} fontSize="13" fill="#fff" textAnchor="middle">c</text>
        </g>
      ))}
      <text x={x0 + data.length * bw + 20} y={y + 28} fontSize="11" fill={C.muted}>← ข้อมูล</text>
      <text x={x0 + data.length * bw + 20} y={y + 92} fontSize="11" fill={C.accent}>← CRC remainder</text>
      <text x={320} y={210} fontSize="12" fill={C.text} textAnchor="middle">÷ Generator Polynomial → เศษ = CRC</text>
      <text x={320} y={245} fontSize="11" fill={C.muted} textAnchor="middle">Parity · Checksum · CRC (ตรวจ burst ได้ดี) · Hamming (แก้ single-bit)</text>
    </svg>
  );
}

function WindowProto() {
  const frames = [1, 2, 3, 4, 5, 6];
  const bw = 70;
  const x0 = 70;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={36} fontSize="13" fill={C.accent} textAnchor="middle">Sliding Window (Go-Back-N / Selective Repeat)</text>
      {frames.map((f, i) => (
        <g key={f}>
          <rect x={x0 + i * bw} y="70" width={bw - 8} height="44" rx="5" fill={i < 3 ? C.accent2 : C.box} stroke={i < 3 ? C.accent : C.border} />
          <text x={x0 + i * bw + (bw - 8) / 2} y="98" fontSize="13" fill="#fff" textAnchor="middle">#{f}</text>
        </g>
      ))}
      <path d={`M ${x0} 62 L ${x0 + 3 * bw - 8} 62`} stroke={C.warn} strokeWidth="2" strokeDasharray="4,3" />
      <text x={x0 + 1.5 * bw} y={56} fontSize="11" fill={C.warn} textAnchor="middle">send window</text>
      {frames.map((f, i) => (
        <g key={f}>
          <rect x={x0 + i * bw} y="140" width={bw - 8} height="44" rx="5" fill={i < 3 ? C.box : C.box2} stroke={i < 3 ? C.ok : C.border} />
          <text x={x0 + i * bw + (bw - 8) / 2} y="168" fontSize="13" fill={C.text} textAnchor="middle">#{f}</text>
        </g>
      ))}
      {frames.map((f, i) => (
        <line key={f} x1={x0 + i * bw + (bw - 8) / 2} y1="120" x2={x0 + i * bw + (bw - 8) / 2} y2="134" stroke={i < 3 ? C.ok : C.border} strokeWidth="2" markerEnd="url(#ah)" />
      ))}
      <text x={320} y={225} fontSize="12" fill={C.text} textAnchor="middle">ACK → เลื่อน window · เฟรมที่เสีย = ส่งซ้ำ (Go-Back-N ทั้งหมด / SR เฉพาะชิ้น)</text>
      <text x={320} y={255} fontSize="11" fill={C.muted} textAnchor="middle">Throughput ≈ window / RTT · Piggybacking · Timer</text>
    </svg>
  );
}

function EthernetFrame() {
  const segs = [
    ["Preamble", 70, C.box],
    ["SFD", 40, C.box],
    ["Dst MAC", 90, C.accent2],
    ["Src MAC", 90, C.accent2],
    ["Type", 50, C.box2],
    ["Payload", 120, C.box],
    ["FCS", 50, C.warn],
  ];
  let x = 30;
  const y = 90;
  const h = 60;
  const total = segs.reduce((a, s) => a + s[1], 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={50} fontSize="13" fill={C.accent} textAnchor="middle">Ethernet Frame (IEEE 802.3)</text>
      {segs.map(([label, w, fill], i) => {
        const sx = x;
        x += w;
        return (
          <g key={i}>
            <rect x={sx} y={y} width={w - 2} height={h} fill={fill} stroke={C.border} />
            <text x={sx + (w - 2) / 2} y={y + 26} fontSize="10.5" fill="#fff" textAnchor="middle">{label}</text>
            <text x={sx + (w - 2) / 2} y={y + 44} fontSize="9" fill="#dfe8f2" textAnchor="middle">{w === 120 ? "46–1500 B" : ""}</text>
          </g>
        );
      })}
      <text x={30 + total / 2} y={y + h + 30} fontSize="11" fill={C.muted} textAnchor="middle">
        dst/src MAC 48-bit · EtherType · FCS(CRC) · MTU 1500
      </text>
      <text x={320} y={235} fontSize="12" fill={C.text} textAnchor="middle">CSMA/CD (half-duplex) · full-duplex ไม่มี collision</text>
      <text x={320} y={262} fontSize="11" fill={C.muted} textAnchor="middle">WLAN 802.11: CSMA/CA · WPA2/WPA3 · SSID</text>
    </svg>
  );
}

function TcpIp() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x="180" y="36" fontSize="13" fill={C.accent} textAnchor="middle">TCP 3-way Handshake</text>
      <Box x={60} y={70} w={90} h={40} label="Client" fill={C.box2} fs={12} />
      <Box x={400} y={70} w={90} h={40} label="Server" fill={C.box2} fs={12} />
      <Arrow x1={150} y1={85} x2={400} y2={85} />
      <text x={275} y={78} fontSize="11" fill={C.text} textAnchor="middle">SYN</text>
      <Arrow x1={400} y1={110} x2={150} y2={110} />
      <text x={275} y={103} fontSize="11" fill={C.text} textAnchor="middle">SYN, ACK</text>
      <Arrow x1={150} y1={135} x2={400} y2={135} />
      <text x={275} y={128} fontSize="11" fill={C.text} textAnchor="middle">ACK</text>
      <line x1="30" y1="170" x2="610" y2="170" stroke={C.border} strokeDasharray="4,4" />
      <text x="180" y="200" fontSize="13" fill={C.accent} textAnchor="middle">TCP vs UDP</text>
      <Box x={60} y={215} w={220} h={50} label="TCP: connection-oriented" sub="การันตีลำดับ · 3-way · flow/congestion" fill={C.box2} fs={11} />
      <Box x={320} y={215} w={260} h={50} label="UDP: connectionless" sub="overhead ต่ำ · เร็ว · DNS/stream/game" fill={C.box2} fs={11} />
      <text x={320} y={290} fontSize="11" fill={C.muted} textAnchor="middle">IPv4 (32-bit) · Subnet/CIDR · IPv6 (128-bit) · routing · NAT · ARP · ICMP · DHCP · DNS</text>
    </svg>
  );
}

function Security() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x="160" y="40" fontSize="13" fill={C.accent} textAnchor="middle">CIA Triad</text>
      <polygon points="160,60 90,180 230,180" fill={C.box2} stroke={C.accent} />
      <text x="160" y="120" fontSize="12" fill={C.text} textAnchor="middle">CIA</text>
      <text x="160" y="150" fontSize="10" fill={C.muted} textAnchor="middle">C · I · A</text>
      <text x="90" y="200" fontSize="10.5" fill={C.ok} textAnchor="middle">Confidentiality</text>
      <text x="230" y="200" fontSize="10.5" fill={C.warn} textAnchor="middle">Integrity</text>
      <text x="160" y="225" fontSize="10.5" fill={C.accent} textAnchor="middle">Availability</text>
      <line x1="300" y1="50" x2="300" y2="260" stroke={C.border} strokeDasharray="4,4" />
      <text x="470" y="40" fontSize="13" fill={C.accent} textAnchor="middle">Cryptography</text>
      <Box x={330} y={60} w={280} h={44} label="Symmetric (AES/3DES)" sub="กุญแจดอกเดียว · เร็ว" fill={C.box2} fs={11} />
      <Box x={330} y={112} w={280} h={44} label="Asymmetric (RSA/ECC)" sub="กุญแจคู่ · สาธารณะ/ส่วนตัว" fill={C.box2} fs={11} />
      <Box x={330} y={164} w={280} h={44} label="Hash (SHA-256) · HMAC" sub="ความสมบูรณ์ · digital signature" fill={C.box2} fs={11} />
      <Box x={330} y={216} w={280} h={40} label="Firewall · IDS/IPS · VPN · TLS/PKI" fill={C.accent2} stroke={C.accent} fs={11} />
      <text x="470" y="282" fontSize="10.5" fill={C.muted} textAnchor="middle">threats: malware · DoS · MITM · sniffing · spoofing</text>
    </svg>
  );
}

function Subnet() {
  const blocks = [
    ["192.168.1.0/26", ".0 - .63"],
    ["192.168.1.64/26", ".64 - .127"],
    ["192.168.1.128/26", ".128 - .191"],
    ["192.168.1.192/26", ".192 - .255"],
  ];
  const bw = 140;
  const x0 = 30;
  const y = 110;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={52} fontSize="14" fill={C.accent} textAnchor="middle">
        192.168.1.0/24  →  4 × /26
      </text>
      {blocks.map(([net, rng], i) => (
        <g key={i}>
          <rect x={x0 + i * bw} y={y} width={bw - 8} height="96" rx="8" fill={i % 2 ? C.box2 : C.box} stroke={C.border} />
          <text x={x0 + i * bw + (bw - 8) / 2} y={y + 30} fontSize="12" fill={C.accent} textAnchor="middle">
            {net}
          </text>
          <text x={x0 + i * bw + (bw - 8) / 2} y={y + 54} fontSize="11" fill={C.text} textAnchor="middle">
            {rng}
          </text>
          <text x={x0 + i * bw + (bw - 8) / 2} y={y + 76} fontSize="10" fill={C.muted} textAnchor="middle">
            62 hosts
          </text>
        </g>
      ))}
      <text x={320} y={242} fontSize="11" fill={C.muted} textAnchor="middle">
        Network + Broadcast หักออก เหลือ 62 host ต่อ subnet
      </text>
    </svg>
  );
}

function Vlan() {
  const vlans = [
    ["VLAN 10", "ENG", "#3ea6ff"],
    ["VLAN 20", "SALES", "#3fb950"],
    ["VLAN 30", "IT", "#d29922"],
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <Box x={250} y={110} w={140} h={70} label="Switch" sub="802.1Q" fill={C.accent2} stroke={C.accent} />
      {vlans.map(([name, sub, color], i) => {
        const y = 34 + i * 76;
        return (
          <g key={name}>
            <Box x={40} y={y} w={150} h={58} label={name} sub={sub} fill={C.box2} tcolor={color} />
            <line x1={190} y1={y + 29} x2={250} y2={145} stroke={color} strokeWidth={2} />
          </g>
        );
      })}
      <Box x={440} y={110} w={160} h={70} label="Trunk" sub="Router / Switch" fill={C.box} />
      <line x1={390} y1={145} x2={440} y2={145} stroke={C.accent} strokeWidth={2} strokeDasharray="5 4" />
      <text x={320} y={262} fontSize="11" fill={C.muted} textAnchor="middle">
        Access port = VLAN เดียว · Trunk = หลาย VLAN พร้อม tag
      </text>
    </svg>
  );
}

function Routing() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={36} fontSize="14" fill={C.accent} textAnchor="middle">
        OSPF / Static Routing
      </text>
      <Box x={40} y={120} w={110} h={62} label="R1" sub="10.0.1.0/24" fill={C.accent2} stroke={C.accent} />
      <Box x={265} y={52} w={110} h={62} label="R2" sub="10.0.2.0/24" fill={C.accent2} stroke={C.accent} />
      <Box x={265} y={186} w={110} h={62} label="R3" sub="10.0.3.0/24" fill={C.accent2} stroke={C.accent} />
      <Box x={490} y={120} w={120} h={62} label="LAN" sub="192.168.1.0/24" fill={C.box2} />
      <line x1={150} y1={151} x2={265} y2={83} stroke={C.muted} strokeWidth={2} />
      <line x1={150} y1={151} x2={265} y2={217} stroke={C.muted} strokeWidth={2} />
      <line x1={375} y1={83} x2={490} y2={151} stroke={C.muted} strokeWidth={2} />
      <line x1={375} y1={217} x2={490} y2={151} stroke={C.muted} strokeWidth={2} />
      <line x1={320} y1={114} x2={320} y2={186} stroke={C.muted} strokeWidth={2} strokeDasharray="4 3" />
      <text x={205} y={110} fontSize="10" fill={C.warn}>cost</text>
      <text x={430} y={110} fontSize="10" fill={C.warn}>cost</text>
      <text x={320} y={272} fontSize="11" fill={C.muted} textAnchor="middle">
        Routing Table · longest prefix match · loop-free path
      </text>
    </svg>
  );
}

function Socket() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={36} fontSize="14" fill={C.accent} textAnchor="middle">
        Socket API
      </text>
      <Box x={40} y={120} w={150} h={72} label="Client" sub="connect / send / recv" fill={C.box2} />
      <Box x={450} y={120} w={150} h={72} label="Server" sub="bind / listen / accept" fill={C.box2} />
      <Arrow x1={190} y1={142} x2={450} y2={142} />
      <text x={320} y={135} fontSize="11" fill={C.text} textAnchor="middle">
        TCP stream / UDP datagram
      </text>
      <Arrow x1={450} y1={170} x2={190} y2={170} color={C.ok} dash="4 3" />
      <text x={320} y={240} fontSize="11" fill={C.muted} textAnchor="middle">
        IP address + Port = socket endpoint
      </text>
    </svg>
  );
}

function Api() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={36} fontSize="14" fill={C.accent} textAnchor="middle">
        REST API over HTTP
      </text>
      <Box x={40} y={120} w={150} h={72} label="Client" sub="Postman / curl" fill={C.box2} />
      <Box x={450} y={120} w={150} h={72} label="API Server" sub="FastAPI" fill={C.accent2} stroke={C.accent} />
      <Arrow x1={190} y1={142} x2={450} y2={142} />
      <text x={320} y={135} fontSize="11" fill={C.text} textAnchor="middle">
        GET /items · POST /items
      </text>
      <Arrow x1={450} y1={170} x2={190} y2={170} color={C.ok} dash="4 3" />
      <text x={320} y={163} fontSize="11" fill={C.ok} textAnchor="middle">
        200 OK · JSON
      </text>
      <text x={320} y={240} fontSize="11" fill={C.muted} textAnchor="middle">
        DNS → HTTP → REST → JSON
      </text>
    </svg>
  );
}

function DockerNet() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={36} fontSize="14" fill={C.accent} textAnchor="middle">
        Docker Networking
      </text>
      <rect x="30" y="56" width="270" height="210" rx="10" fill={C.box2} stroke={C.border} />
      <text x={165} y={80} fontSize="12" fill={C.muted} textAnchor="middle">
        Host
      </text>
      <Box x={60} y={100} w={100} h={52} label="Web" fill={C.accent2} stroke={C.accent} fs={12} />
      <Box x={60} y={172} w={100} h={52} label="DB" fill={C.accent2} stroke={C.accent} fs={12} />
      <Box x={185} y={136} w={95} h={56} label="Bridge" sub="labnet" fill={C.box} fs={11} />
      <line x1={160} y1={126} x2={185} y2={150} stroke={C.muted} strokeWidth={2} />
      <line x1={160} y1={198} x2={185} y2={170} stroke={C.muted} strokeWidth={2} />
      <Box x={380} y={120} w={110} h={56} label="Client" fill={C.box2} fs={12} />
      <Arrow x1={280} y1={150} x2={380} y2={150} />
      <text x={330} y={143} fontSize="10" fill={C.text} textAnchor="middle">
        -p 8080:80
      </text>
      <text x={320} y={286} fontSize="11" fill={C.muted} textAnchor="middle">
        bridge · host · none · user-defined bridge
      </text>
    </svg>
  );
}

function Capture() {
  const steps = [
    ["NIC", "รับแพ็กเก็ต"],
    ["tshark", "จับ/กรอง"],
    ["pcap", "บันทึกไฟล์"],
    ["Analyze", "วิเคราะห์"],
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={40} fontSize="14" fill={C.accent} textAnchor="middle">
        Packet Capture Pipeline
      </text>
      {steps.map(([t, s], i) => (
        <g key={t}>
          <Box x={30 + i * 150} y={120} w={120} h={66} label={t} sub={s} fill={i === 3 ? C.accent2 : C.box2} stroke={i === 3 ? C.accent : C.border} />
          {i < steps.length - 1 && <Arrow x1={150 + i * 150} y1={153} x2={180 + i * 150} y2={153} />}
        </g>
      ))}
      <text x={320} y={235} fontSize="11" fill={C.muted} textAnchor="middle">
        BPF filter · display filter · Wireshark / Scapy
      </text>
    </svg>
  );
}

function Monitor() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={40} fontSize="14" fill={C.accent} textAnchor="middle">
        Monitoring & Visualization
      </text>
      <Box x={30} y={120} w={130} h={62} label="Metrics" sub="exporter" fill={C.box2} />
      <Box x={220} y={120} w={130} h={62} label="Prometheus" sub="time-series" fill={C.accent2} stroke={C.accent} />
      <Box x={410} y={120} w={150} h={62} label="Grafana" sub="dashboard" fill={C.box2} />
      <Arrow x1={160} y1={151} x2={220} y2={151} />
      <Arrow x1={350} y1={151} x2={410} y2={151} />
      <rect x="420" y="200" width="120" height="34" rx="4" fill={C.box} stroke={C.border} />
      <rect x="428" y="208" width="30" height="18" fill={C.ok} opacity="0.8" />
      <rect x="464" y="212" width="30" height="14" fill={C.accent} opacity="0.8" />
      <rect x="500" y="204" width="30" height="22" fill={C.warn} opacity="0.8" />
      <text x={320} y={262} fontSize="11" fill={C.muted} textAnchor="middle">
        scrape · query · alert · visualize
      </text>
    </svg>
  );
}

function Automation() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={40} fontSize="14" fill={C.accent} textAnchor="middle">
        Network Automation
      </text>
      <Box x={40} y={110} w={160} h={74} label="Python" sub="Netmiko / Jinja2" fill={C.accent2} stroke={C.accent} />
      <Box x={440} y={50} w={150} h={54} label="Router 1" fill={C.box2} fs={11} />
      <Box x={440} y={120} w={150} h={54} label="Switch 1" fill={C.box2} fs={11} />
      <Box x={440} y={190} w={150} h={54} label="Router 2" fill={C.box2} fs={11} />
      <Arrow x1={200} y1={140} x2={440} y2={77} />
      <Arrow x1={200} y1={147} x2={440} y2={147} />
      <Arrow x1={200} y1={154} x2={440} y2={217} />
      <Box x={40} y={210} w={160} h={46} label="Git" sub="version control" fill={C.box} fs={12} />
      <Arrow x1={120} y1={210} x2={120} y2={184} color={C.warn} dash="3 3" />
      <text x={320} y={282} fontSize="11" fill={C.muted} textAnchor="middle">
        push config · backup · audit · rollback
      </text>
    </svg>
  );
}

function Performance() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Defs />
      <rect x="0" y="0" width={W} height={H} fill={C.bg} />
      <text x={320} y={40} fontSize="14" fill={C.accent} textAnchor="middle">
        Performance Metrics
      </text>
      <line x1="60" y1="220" x2="580" y2="220" stroke={C.border} />
      <line x1="60" y1="80" x2="60" y2="220" stroke={C.border} />
      {[
        ["TCP", 180, C.accent],
        ["UDP", 130, C.ok],
        ["ICMP", 70, C.warn],
      ].map(([label, h, color], i) => (
        <g key={label}>
          <rect x={120 + i * 130} y={220 - h} width="70" height={h} fill={color} opacity="0.85" />
          <text x={155 + i * 130} y={210 - h} fontSize="11" fill={C.text} textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <path d="M70 120 L200 100 L330 140 L460 90 L560 110" stroke={C.err} strokeWidth="2" fill="none" />
      <text x={320} y={262} fontSize="11" fill={C.muted} textAnchor="middle">
        Throughput · Latency · Jitter · Packet loss
      </text>
    </svg>
  );
}

const MAP = {
  "comm-model": CommModel,
  arch: Arch,
  osi: Osi,
  topology: Topology,
  devices: Devices,
  media: Media,
  encoding: Encoding,
  crc: Crc,
  window: WindowProto,
  ethernet: EthernetFrame,
  tcpip: TcpIp,
  security: Security,
  subnet: Subnet,
  vlan: Vlan,
  routing: Routing,
  socket: Socket,
  api: Api,
  docker: DockerNet,
  capture: Capture,
  monitor: Monitor,
  automation: Automation,
  performance: Performance,
};

export default function Figure({ name, caption }) {
  const Comp = MAP[name];
  if (!Comp) return null;
  return (
    <figure className="fig">
      <div className="fig-canvas">
        <Comp />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}