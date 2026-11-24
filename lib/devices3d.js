// Virtual 3D device catalog for the /devices page.
// Reuses the base device/cable data from lib/topology.js and adds:
//  - 4K image with graceful fallback to the existing local photos
//  - realistic port layouts (percentage coordinates on the device image)
//  - exploded-view layers (clip-path slices separated along the Z axis)

import { DEVICES, CABLES, CABLE_MAP } from "./topology.js";
import { DEVICE_IMAGES } from "./topology-images.js";

// node box size (shared by the page, the Device3D component and the CSS)
export const NODE_W = 190;
export const NODE_H = 120;

// --- helpers ---------------------------------------------------------------

// clip-path polygon covering the full width between two vertical percentages
function band(top, bottom) {
  return `polygon(0% ${top}%, 100% ${top}%, 100% ${bottom}%, 0% ${bottom}%)`;
}

// build a horizontal row of evenly-spaced ports
function row(prefix, count, yPct, xStart, xEnd) {
  const n = Math.max(1, count);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const id = `${prefix}${i + 1}`;
    return { id, label: id, xPct: +(xStart + (xEnd - xStart) * t).toFixed(2), yPct };
  });
}

// --- exploded-view layer sets ---------------------------------------------

// generic "box" device (switch / router / hub / firewall / modem / ap / server)
function boxLayers() {
  return [
    { id: "cover", name: "ฝาครอบด้านบน (Top Cover)", desc: "ฝาครอบโลหะป้องกันฝุ่นและการชนจากภายนอก", clip: band(0, 30), z: 1.0 },
    { id: "mainboard", name: "เมนบอร์ด / PCB", desc: "วงจรหลักบรรจุชิป ASIC, CPU, RAM และวงจรสื่อสาร", clip: band(30, 60), z: 0.62 },
    { id: "ports", name: "พอร์ตเชื่อมต่อ (Ports)", desc: "พอร์ต RJ45 / SFP / Console และหน้าต่อด้านหลัง", clip: band(60, 82), z: 0.32 },
    { id: "power", name: "จ่ายไฟเลี้ยง (PSU)", desc: "แปลงไฟเข้าเป็นแรงดันภายในสำหรับวงจร", clip: band(82, 100), z: 0.05 },
  ];
}

// desktop / tower PC
function pcLayers() {
  return [
    { id: "side", name: "ฝาข้าง (Side Panel)", desc: "ฝาครอบด้านข้างเปิดเข้าสู่ภายในเครื่อง", clip: "polygon(0% 0%, 48% 0%, 48% 100%, 0% 100%)", z: 1.0 },
    { id: "mainboard", name: "เมนบอร์ด (Mainboard)", desc: "บอร์ดหลักที่ติดตั้ง CPU, RAM และการ์ดขยาย", clip: "polygon(48% 0%, 100% 0%, 100% 62%, 48% 62%)", z: 0.6 },
    { id: "psu", name: "พาวเวอร์ซับพลาย (PSU)", desc: "จ่ายไฟหลักให้ทั้งระบบ พร้อมพัดลมระบายความร้อน", clip: "polygon(48% 62%, 100% 62%, 100% 100%, 48% 100%)", z: 0.28 },
  ];
}

// laptop
function laptopLayers() {
  return [
    { id: "lcd", name: "จอแสดงผล (LCD)", desc: "จอภาพพร้อมแผงวงจรขับเคลื่อนพิกเซล", clip: band(0, 45), z: 1.0 },
    { id: "mainboard", name: "เมนบอร์ด (Mainboard)", desc: "บอร์ดหลักที่รวม CPU/GPU/RAM แบบพกพา", clip: band(45, 72), z: 0.55 },
    { id: "battery", name: "แบตเตอรี่ (Battery)", desc: "แบตเตอรี่ลิเธียมโมเนียมพกพา", clip: band(72, 100), z: 0.2 },
  ];
}

// --- per-type port layouts -------------------------------------------------

function portsFor(type) {
  switch (type) {
    case "switch":
      return [
        ...row("Gi", 24, 72, 8, 92),
        { id: "Uplink", label: "Uplink", xPct: 88, yPct: 72 },
        { id: "Console", label: "Console", xPct: 95, yPct: 72 },
      ];
    case "router":
      return [
        { id: "WAN", label: "WAN", xPct: 82, yPct: 70 },
        ...row("LAN", 4, 70, 10, 46),
        { id: "Console", label: "Console", xPct: 91, yPct: 70 },
      ];
    case "hub":
      return row("Port", 4, 70, 16, 84);
    case "firewall":
      return [
        { id: "WAN", label: "WAN", xPct: 20, yPct: 70 },
        { id: "LAN", label: "LAN", xPct: 50, yPct: 70 },
        { id: "DMZ", label: "DMZ", xPct: 80, yPct: 70 },
      ];
    case "gateway":
      return [
        { id: "WAN", label: "WAN", xPct: 28, yPct: 70 },
        { id: "LAN", label: "LAN", xPct: 72, yPct: 70 },
      ];
    case "server":
      return row("eth", 2, 78, 36, 64);
    case "ap":
      return [
        { id: "eth0", label: "eth0 (Uplink)", xPct: 50, yPct: 74 },
      ];
    case "modem":
      return [
        { id: "DSL", label: "DSL/WAN", xPct: 28, yPct: 72 },
        { id: "LAN", label: "LAN", xPct: 72, yPct: 72 },
      ];
    case "pc":
      return row("eth", 1, 82, 50, 50);
    case "laptop":
      return row("eth", 1, 82, 30, 30);
    case "service":
      return row("eth", 1, 78, 50, 50);
    case "cloud":
      return [{ id: "uplink", label: "Uplink", xPct: 50, yPct: 78 }];
    default:
      return row("eth", 1, 80, 50, 50);
  }
}

// --- assemble catalog ------------------------------------------------------

const PORTS = {
  pc: portsFor("pc"),
  laptop: portsFor("laptop"),
  server: portsFor("server"),
  switch: portsFor("switch"),
  router: portsFor("router"),
  hub: portsFor("hub"),
  ap: portsFor("ap"),
  firewall: portsFor("firewall"),
  gateway: portsFor("gateway"),
  service: portsFor("service"),
  modem: portsFor("modem"),
  cloud: portsFor("cloud"),
};

const LAYERS = {
  pc: pcLayers(),
  laptop: laptopLayers(),
  server: boxLayers(),
  switch: boxLayers(),
  router: boxLayers(),
  hub: boxLayers(),
  ap: boxLayers(),
  firewall: boxLayers(),
  gateway: boxLayers(),
  service: boxLayers(),
  modem: boxLayers(),
  cloud: [],
};

// WebGL shape hints: overall bounding size (world units) + model archetype
const SHAPES = {
  pc: { w: 0.8, h: 1.6, d: 1.6, archetype: "tower" },
  laptop: { w: 1.6, h: 0.14, d: 1.1, archetype: "laptop" },
  server: { w: 1.8, h: 2.4, d: 1.8, archetype: "server" },
  switch: { w: 2.4, h: 0.5, d: 1.6, archetype: "switch" },
  router: { w: 2.4, h: 0.3, d: 1.6, archetype: "router" },
  hub: { w: 1.8, h: 0.45, d: 1.3, archetype: "box" },
  ap: { w: 1.0, h: 1.0, d: 1.0, archetype: "ap" },
  firewall: { w: 2.0, h: 0.55, d: 1.5, archetype: "box" },
  gateway: { w: 1.8, h: 0.5, d: 1.3, archetype: "box" },
  service: { w: 1.8, h: 2.0, d: 1.6, archetype: "server" },
  modem: { w: 1.5, h: 0.45, d: 1.1, archetype: "box" },
  cloud: { w: 2.6, h: 1.4, d: 1.2, archetype: "cloud" },
};

export const DEVICES3D = DEVICES.map((d) => {
  const image4k = `/img/4k/${d.type}.png`;
  const fallback = DEVICE_IMAGES[d.type] || "";
  const shape = SHAPES[d.type] || SHAPES.switch;
  return {
    ...d,
    image4k,
    image: fallback,
    ports: PORTS[d.type] || [],
    layers: LAYERS[d.type] || [],
    dims: { w: shape.w, h: shape.h, d: shape.d },
    archetype: shape.archetype,
  };
});

export const DEVICE3D_MAP = Object.fromEntries(DEVICES3D.map((d) => [d.type, d]));

export { CABLES, CABLE_MAP };