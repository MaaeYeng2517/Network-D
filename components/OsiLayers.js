const LAYERS = [
  {
    n: 7,
    th: "ชั้นแอปพลิเคชัน",
    en: "Application",
    pdu: "Data",
    desc: "เป็นชั้นที่แอปและโปรโตคอลระดับบริการใช้งาน เช่น เบราว์เซอร์หรือไปรษณีย์อิเล็กทรอนิกส์",
    ex: "HTTP, HTTPS, DNS, SMTP, FTP",
    color: "#3ea6ff",
  },
  {
    n: 6,
    th: "ชั้นนำเสน์ข้อมูล",
    en: "Presentation",
    pdu: "Data",
    desc: "แปลงรูปแบบข้อมูล เข้ารหัส และบีบอัดให้เครื่องปลายทางอ่านได้ตรงกัน",
    ex: "TLS/SSL, JPEG, PNG, ASCII, MIDI",
    color: "#4aa8ff",
  },
  {
    n: 5,
    th: "ชั้นเซสชัน",
    en: "Session",
    pdu: "Data",
    desc: "เปิด ติดตาม และปิดเซสชันการสื่อสารระหว่างสองโปรแกรม",
    ex: "RPC, NetBIOS, PPTP, SQL session",
    color: "#5bb8ff",
  },
  {
    n: 4,
    th: "ชั้นทรานสปอร์ต",
    en: "Transport",
    pdu: "Segment",
    desc: "ควบคุมการส่งข้อมูลแบบ end-to-end ทั้งความน่าเชื่อถือและลำดับ",
    ex: "TCP (การันตี), UDP (เร็ว)",
    color: "#6cc8ff",
  },
  {
    n: 3,
    th: "ชั้นเครือข่าย",
    en: "Network",
    pdu: "Packet",
    desc: "กำหนดที่อยู่ IP และเลือกเส้นทางรัวต์ระหว่างเครือข่ายต่าง ๆ",
    ex: "IP, ICMP, OSPF, BGP, Router",
    color: "#7dd8ff",
  },
  {
    n: 2,
    th: "ชั้นข้อมูล",
    en: "Data Link",
    pdu: "Frame",
    desc: "จัดกรอบ (frame) และใช้ที่อยู่ MAC ในการเชื่อมต่อระหว่างอุปกรณ์ในเครือข่ายท้องถิ่น",
    ex: "Ethernet, ARP, Switch, VLAN",
    color: "#8ee8ff",
  },
  {
    n: 1,
    th: "ชั้นฟิสิคัล",
    en: "Physical",
    pdu: "Bit",
    desc: "ส่งสัญญาณจริงเป็นบิตผ่านสื่อ เช่น สายไฟเบอร์ แสง หรือคลื่นวิทยุ",
    ex: "UTP Cat6, Fiber, Hub, Repeater",
    color: "#9ff0ff",
  },
];

export default function OsiLayers() {
  return (
    <div className="osi">
      {LAYERS.map((l) => (
        <div className="osi-row" key={l.n} style={{ borderLeftColor: l.color }}>
          <span className="osi-n" style={{ background: l.color }}>
            {l.n}
          </span>
          <div className="osi-main">
            <div className="osi-title">
              <b>{l.th}</b>
              <span className="osi-en">{l.en}</span>
              <span className="osi-pdu">{l.pdu}</span>
            </div>
            <p>{l.desc}</p>
          </div>
          <div className="osi-ex">{l.ex}</div>
        </div>
      ))}
    </div>
  );
}